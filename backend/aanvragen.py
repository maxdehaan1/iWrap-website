"""Offerteaanvragen van iwrap.nl/offerte.

Een aanvraag komt in drie stappen binnen, zodat ook een aanvraag met tien
foto's van een telefoon op een matige verbinding heel aankomt:

  1. POST /api/aanvragen              de antwoorden, zonder foto's. Terug: een
                                      id, een token en de lijst foto's die we
                                      verwachten (kozijn-1-foto.jpg, ...).
  2. PUT  /api/aanvragen/<id>/fotos/<naam>?t=<token>
                                      elke foto apart, al verkleind op de
                                      telefoon (zie js/fotos.js).
  3. POST /api/aanvragen/<id>/versturen?t=<token>
                                      controleren of alles er is, en dan één
                                      mail aan Max met alle foto's als bijlage
                                      plus een bevestiging aan de klant.

De klant kiest zelf hoe hij laat zien wat er moet gebeuren (de "manier"):

  streep  per kozijn een foto, en daarop met de vinger aangestreept wat er
          moet gebeuren -- of "het hele kozijn"
  maten   per kozijn een foto, en de delen met hun lengte: "onderdorpel
          1,60 m", "stijl 2 x 1,30 m" -- of breedte x hoogte bij een heel kozijn
  papier  een foto van een eigen tekening, plus van elk kozijn een foto

Bij alle drie hoort per kozijn een foto van het hele kozijn: daaraan ziet Max
het profiel, de kleur en of herstel kan.

Wat hier bewaard wordt verloopt vanzelf: een aanvraag die niet verstuurd
wordt na twee dagen, een verstuurde na dertig. De mail aan Max is het archief.
"""

import base64
import hmac
import json
import re
import time

from . import instellingen as cfg
from . import mail, mails
from .auth import nieuwe_id
from .opslag import opslag

MANIEREN = {"streep": "Foto en aanstrepen", "maten": "Foto en maten", "papier": "Op papier"}
WAAR = {"begane-grond": "begane grond", "verdieping": "verdieping", "dakkapel": "dakkapel"}

MAX_KOZIJNEN = 20
MAX_REGELS = 15          # maatregels per kozijn
MAX_TEKENINGEN = 5
MAX_PAPIERFOTOS = 20
FOTO_MAX_BYTES = 1_500_000   # js/fotos.js maakt ze rond de 300 kB

TTL_CONCEPT = 2 * 86400      # nog niet verstuurd
TTL_BEWAAR = 30 * 86400      # verstuurd: de mail is het archief, dit is reserve


class Afgewezen(Exception):
    def __init__(self, meldingen):
        super().__init__(meldingen[0])
        self.meldingen = meldingen


class Ontbreekt(Exception):
    def __init__(self, namen):
        super().__init__(", ".join(namen))
        self.namen = namen


class NietVerstuurd(Exception):
    pass


# ---------------------------------------------------------------------------
# Invoer schoonmaken
# ---------------------------------------------------------------------------

def _tekst(waarde, lengte):
    return re.sub(r"\s+", " ", str(waarde or "")).strip()[:lengte]


def _geheel(waarde, laag, hoog, standaard):
    try:
        n = int(waarde)
    except (TypeError, ValueError):
        return standaard
    return max(laag, min(hoog, n))


def cm(waarde):
    """Een lengte zoals een klant hem intypt, in hele centimeters.

    160, "160", "1,60", "1.6" en "1,6 m" zijn allemaal 160. Alles tot en met
    10 lezen we als meters: niemand heeft een kozijndeel van 10 centimeter, en
    wel een van 1,60 meter. Terug 0 als er geen getal in staat.
    """
    if isinstance(waarde, (int, float)):
        getal = float(waarde)
    else:
        m = re.search(r"\d+(?:[.,]\d+)?", str(waarde or ""))
        if not m:
            return 0
        getal = float(m.group(0).replace(",", "."))
    if getal <= 0:
        return 0
    return int(round(getal * 100 if getal <= 10 else getal))


def _kozijn(k, nr, manier, fouten):
    if not isinstance(k, dict):
        k = {}
    uit = {
        "waar": k.get("waar") if k.get("waar") in WAAR else "",
        "plek": _tekst(k.get("plek"), 60),
        "aantal": _geheel(k.get("aantal"), 1, 20, 1),
        "heel": bool(k.get("heel")),
        "dichtbij": bool(k.get("dichtbij")),
        "aangestreept": manier == "streep" and bool(k.get("aangestreept")) and not k.get("heel"),
        "regels": [],
        "breedte": 0,
        "hoogte": 0,
    }
    for r in (k.get("regels") or [])[:MAX_REGELS]:
        if not isinstance(r, dict):
            continue
        deel, lengte = _tekst(r.get("deel"), 40), cm(r.get("lengte"))
        if deel and 5 <= lengte <= 1500:
            uit["regels"].append({"deel": deel, "cm": lengte, "aantal": _geheel(r.get("aantal"), 1, 20, 1)})
    b, h = cm(k.get("breedte")), cm(k.get("hoogte"))
    if 20 <= b <= 1500 and 20 <= h <= 600:
        uit["breedte"], uit["hoogte"] = b, h

    if not uit["waar"]:
        fouten.append("Kozijn %d: kies waar het zit (begane grond, verdieping of dakkapel)." % nr)
    if manier == "streep" and not (uit["heel"] or uit["aangestreept"]):
        fouten.append("Kozijn %d: streep op de foto aan wat er moet gebeuren, of kies 'het hele kozijn'." % nr)
    if manier == "maten":
        if uit["heel"] and not uit["breedte"]:
            fouten.append("Kozijn %d: vul de breedte en de hoogte van het kozijn in." % nr)
        if not uit["heel"] and not uit["regels"]:
            fouten.append("Kozijn %d: zet minstens één deel met zijn lengte erbij." % nr)
    return uit


def schoon(invoer):
    """De invoer van het formulier, gecontroleerd. Afgewezen bij fouten."""
    if not isinstance(invoer, dict):
        raise Afgewezen(["Er kwam geen aanvraag mee."])
    fouten = []
    manier = invoer.get("manier")
    if manier not in MANIEREN:
        raise Afgewezen(["Kies eerst hoe je wilt laten zien wat er moet gebeuren."])

    a = {"manier": manier, "kozijnen": [], "papier": None}
    if manier == "papier":
        p = invoer.get("papier") if isinstance(invoer.get("papier"), dict) else {}
        a["papier"] = {
            "tekeningen": _geheel(p.get("tekeningen"), 0, MAX_TEKENINGEN, 0),
            "fotos": _geheel(p.get("fotos"), 0, MAX_PAPIERFOTOS, 0),
            "waar": [w for w in WAAR if w in (p.get("waar") or [])],
        }
        if not a["papier"]["tekeningen"]:
            fouten.append("Voeg een foto van je tekening toe.")
        if not a["papier"]["fotos"]:
            fouten.append("Voeg van elk kozijn een foto toe, met het hele kozijn erop.")
        if not a["papier"]["waar"]:
            fouten.append("Geef aan waar de kozijnen zitten.")
    else:
        kozijnen = invoer.get("kozijnen") if isinstance(invoer.get("kozijnen"), list) else []
        if not kozijnen:
            fouten.append("Voeg minstens één kozijn toe.")
        if len(kozijnen) > MAX_KOZIJNEN:
            fouten.append("Meer dan %d kozijnen past niet in dit formulier. Bel of mail ons: "
                          "dan komen we liever even kijken." % MAX_KOZIJNEN)
        a["kozijnen"] = [_kozijn(k, i + 1, manier, fouten) for i, k in enumerate(kozijnen[:MAX_KOZIJNEN])]

    a["kleur"] = "anders" if invoer.get("kleur") == "anders" else "zelfde"
    a["kleur_anders"] = _tekst(invoer.get("kleur_anders"), 200) if a["kleur"] == "anders" else ""
    if a["kleur"] == "anders" and not a["kleur_anders"]:
        fouten.append("Zet erbij welke kleur je in gedachten hebt.")

    g = invoer.get("gegevens") if isinstance(invoer.get("gegevens"), dict) else {}
    postcode = re.sub(r"\s+", "", _tekst(g.get("postcode"), 12)).upper()
    a["gegevens"] = {
        "naam": _tekst(g.get("naam"), 100),
        "email": _tekst(g.get("email"), 160).lower(),
        "telefoon": _tekst(g.get("telefoon"), 30),
        "postcode": (postcode[:4] + " " + postcode[4:]) if re.fullmatch(r"\d{4}[A-Z]{2}", postcode) else postcode,
        "huisnummer": _tekst(g.get("huisnummer"), 12),
        "plaats": _tekst(g.get("plaats"), 60),
    }
    a["toelichting"] = str(g.get("toelichting") or "").strip()[:2000]
    if not a["gegevens"]["naam"]:
        fouten.append("Vul je naam in.")
    if not re.fullmatch(r"[^@\s]+@[^@\s]+\.[a-z]{2,}", a["gegevens"]["email"]):
        fouten.append("Vul een e-mailadres in waarop we je kunnen bereiken.")
    if len(re.sub(r"\D", "", a["gegevens"]["telefoon"])) < 9:
        fouten.append("Vul je telefoonnummer in.")
    if not re.fullmatch(r"\d{4} [A-Z]{2}", a["gegevens"]["postcode"]):
        fouten.append("Vul je postcode in, bijvoorbeeld 1214 GZ.")
    if not a["gegevens"]["huisnummer"]:
        fouten.append("Vul je huisnummer in.")
    if not a["gegevens"]["plaats"]:
        fouten.append("Vul je woonplaats in.")

    a["via"] = _tekst(invoer.get("via"), 80)
    if fouten:
        raise Afgewezen(fouten)
    return a


# ---------------------------------------------------------------------------
# Foto's
# ---------------------------------------------------------------------------

def fotolijst(a):
    """Welke foto's er bij deze aanvraag horen, met hun bestandsnaam.

    De naam zegt bij welk kozijn een foto hoort, zodat Max in de mail (en
    Claude bij het uitlezen) meteen ziet wat wat is.
    """
    uit = []
    if a["manier"] == "papier":
        for n in range(1, a["papier"]["tekeningen"] + 1):
            uit.append({"naam": "tekening-%d.jpg" % n, "soort": "tekening", "kozijn": 0})
        for n in range(1, a["papier"]["fotos"] + 1):
            uit.append({"naam": "kozijn-%d-foto.jpg" % n, "soort": "foto", "kozijn": n})
        return uit
    for n, k in enumerate(a["kozijnen"], 1):
        uit.append({"naam": "kozijn-%d-foto.jpg" % n, "soort": "foto", "kozijn": n})
        if k["aangestreept"]:
            uit.append({"naam": "kozijn-%d-aangestreept.jpg" % n, "soort": "aanstreping", "kozijn": n})
        if k["dichtbij"]:
            uit.append({"naam": "kozijn-%d-dichtbij.jpg" % n, "soort": "dichtbij", "kozijn": n})
    return uit


def _fotosleutel(a, naam):
    return "aanvraagfoto:%s:%s" % (a["id"], naam)


def bewaar_foto(a, naam, inhoud):
    if naam not in {f["naam"] for f in fotolijst(a)}:
        raise Afgewezen(["Deze foto hoort niet bij de aanvraag."])
    if not inhoud.startswith(b"\xff\xd8") or len(inhoud) > FOTO_MAX_BYTES:
        raise Afgewezen(["Alleen jpg-foto's tot 1,5 MB. Het formulier verkleint ze vanzelf."])
    if a["status"] == "verstuurd":
        return
    opslag().put_ruw(_fotosleutel(a, naam), base64.b64encode(inhoud).decode("ascii"), ttl=TTL_CONCEPT)


# ---------------------------------------------------------------------------
# Aanmaken, ophalen, versturen
# ---------------------------------------------------------------------------

def maak(invoer):
    if _tekst(invoer.get("website") if isinstance(invoer, dict) else "", 200):
        # Het onzichtbare veld is ingevuld: dat doet alleen een robot.
        raise Afgewezen(["Er ging iets mis met het formulier. Bel of mail ons gerust."])
    a = schoon(invoer)
    a.update({"id": nieuwe_id(10), "token": nieuwe_id(24), "status": "concept",
              "gemaakt": int(time.time())})
    opslag().put("aanvraag:" + a["id"], a, ttl=TTL_CONCEPT)
    return a


def haal(aid):
    if not aid or not re.fullmatch(r"[a-z0-9]{6,24}", aid):
        return None
    return opslag().get("aanvraag:" + aid)


def token_klopt(a, token):
    return bool(a and token and hmac.compare_digest(str(token), a["token"]))


def totalen(a):
    """Wat er bij elkaar opgeteld in de aanvraag staat."""
    stuks = sum(k["aantal"] for k in a["kozijnen"])
    opgegeven = sum(k["aantal"] * sum(r["cm"] * r["aantal"] for r in k["regels"]) for k in a["kozijnen"])
    hoogte = {}
    for k in a["kozijnen"]:
        hoogte[k["waar"]] = hoogte.get(k["waar"], 0) + k["aantal"]
    return {"kozijnen": len(a["kozijnen"]), "stuks": stuks, "opgegeven_cm": opgegeven, "per_hoogte": hoogte}


def voor_claude(a):
    """De aanvraag als gegevens, voor aanvraag.json in de mail. Zonder token."""
    d = {k: a[k] for k in ("id", "manier", "kozijnen", "papier", "kleur", "kleur_anders",
                           "gegevens", "toelichting", "via", "gemaakt")}
    d["manier_naam"] = MANIEREN[a["manier"]]
    d["totalen"] = totalen(a) if a["manier"] != "papier" else None
    d["fotos"] = fotolijst(a)
    d["_uitleg"] = ("Lengtes in centimeters. regels = wat de klant zelf gemeten heeft "
                    "(deel, lengte per stuk, aantal). aantal bij een kozijn = hoe vaak dat kozijn "
                    "met hetzelfde werk voorkomt. heel = het hele kozijn moet. Bij manier 'streep' "
                    "staat in kozijn-N-aangestreept.jpg wat er moet gebeuren.")
    return d


def verstuur(a):
    """Eén mail aan Max met alles erin, en een bevestiging aan de klant."""
    if a["status"] == "verstuurd":
        return a
    fotos, ontbreekt = [], []
    for f in fotolijst(a):
        data = opslag().get_ruw(_fotosleutel(a, f["naam"]))
        if data:
            fotos.append((f["naam"], "image/jpeg", base64.b64decode(data)))
        else:
            ontbreekt.append(f["naam"])
    if ontbreekt:
        raise Ontbreekt(ontbreekt)

    bijlagen = fotos + [("aanvraag.json", "application/json",
                         json.dumps(voor_claude(a), ensure_ascii=False, indent=1).encode("utf-8"))]
    onderwerp, html, tekst = mails.aanvraag_voor_max(a)
    if not mail.verstuur(cfg.MAX_EMAIL, onderwerp, html, tekst, antwoord_aan=a["gegevens"]["email"],
                         soort="aanvraag", bijlagen=bijlagen):
        raise NietVerstuurd()

    onderwerp, html, tekst = mails.aanvraag_bevestiging(a)
    a["bevestiging"] = mail.verstuur(a["gegevens"]["email"], onderwerp, html, tekst,
                                     soort="aanvraag-bevestiging")
    a["status"] = "verstuurd"
    a["verstuurd"] = int(time.time())
    opslag().put("aanvraag:" + a["id"], a, ttl=TTL_BEWAAR)
    for f in fotolijst(a):
        opslag().verloop(_fotosleutel(a, f["naam"]), TTL_BEWAAR)
    opslag().index_zet("aanvragen", a["id"], a["gemaakt"])
    return a
