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

In de Max-modus staan de verstuurde aanvragen onder "Aanvragen", met de foto's.
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

MANIEREN = {"streep": "Foto en aanstrepen", "maten": "Foto en maten", "papier": "Op papier",
            "complex": "Complex of meerdere woningen"}
WAAR = {"begane-grond": "begane grond", "verdieping": "1e verdieping", "hoog": "2e verdieping of hoger",
        "dakkapel": "dakkapel"}
KANT = {"voor": "voorkant", "achter": "achterkant", "zij": "zijkant"}

# De korte vragen bij Kleur en Gegevens (sinds de audit van 17 november 2026). Alles is
# een vaste keuze; wat er niet in staat, telt niet. Ze zijn bij de server niet verplicht,
# zodat een half ingevulde aanvraag van voor die tijd gewoon verstuurd kan worden.
KLEUR_NU = {"wit": "wit", "creme": "crème", "antraciet": "antraciet", "groen": "donkergroen",
            "blauw": "staalblauw", "houtnerf": "houtnerf", "anders": "een andere kleur",
            "onbekend": "weet ik niet"}
ZIJDE = {"buiten": "alleen de buitenkant", "binnen": "alleen de binnenkant", "beide": "binnen en buiten"}
KLANT = {"particulier": "particulier", "vve": "VvE", "corporatie": "woningcorporatie", "bedrijf": "bedrijf"}
WANNEER = {"zsm": "zo snel mogelijk", "voorjaar": "voorjaar", "zomer": "zomer", "najaar": "najaar",
           "maakt-niet-uit": "maakt niet uit"}
BRON = {"google": "Google", "dealer": "een kozijndealer", "aanbevolen": "aanbevolen door iemand",
        "site": "kozijnwrap.nl of houtnerffolie.nl", "anders": "anders"}

MAX_KOZIJNEN = 20
MAX_REGELS = 15          # maatregels per kozijn
MAX_TEKENINGEN = 5
MAX_PAPIERFOTOS = 20
MAX_COMPLEXFOTOS = 10
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
        "kant": k.get("kant") if k.get("kant") in KANT else "",
        "plek": _tekst(k.get("plek"), 60),
        "aantal": _geheel(k.get("aantal"), 1, 20, 1),
        "heel": bool(k.get("heel")),
        "dichtbij": bool(k.get("dichtbij")),
        "aangestreept": manier == "streep" and bool(k.get("aangestreept")) and not k.get("heel"),
        # Welke stiften: geel = het kozijn, rood = een draairaam of deur.
        "aanstreping": [s for s in ("kozijn", "draai") if s in (k.get("aanstreping") or [])]
                       if manier == "streep" and k.get("aangestreept") and not k.get("heel") else [],
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

    a = {"manier": manier, "kozijnen": [], "papier": None, "complex": None}
    if manier == "papier":
        p = invoer.get("papier") if isinstance(invoer.get("papier"), dict) else {}
        a["papier"] = {
            "tekeningen": _geheel(p.get("tekeningen"), 0, MAX_TEKENINGEN, 0),
            "fotos": _geheel(p.get("fotos"), 0, MAX_PAPIERFOTOS, 0),
            "waar": [w for w in WAAR if w in (p.get("waar") or [])],
            "kant": [w for w in KANT if w in (p.get("kant") or [])],
        }
        if not a["papier"]["tekeningen"]:
            fouten.append("Voeg een foto van je tekening toe.")
        if not a["papier"]["fotos"]:
            fouten.append("Voeg van elk kozijn een foto toe, met het hele kozijn erop.")
        if not a["papier"]["waar"]:
            fouten.append("Geef aan waar de kozijnen zitten.")
    elif manier == "complex":
        # Een VvE, corporatie of beheerder: geen kaarten per kozijn, maar het complex. Daarna
        # plant Max een opname; uit die opname komt één vaste prijs (zie de VvE-pagina).
        c = invoer.get("complex") if isinstance(invoer.get("complex"), dict) else {}
        a["complex"] = {
            "organisatie": _tekst(c.get("organisatie"), 100),
            "woningen": _geheel(c.get("woningen"), 0, 5000, 0),
            "adres": _tekst(c.get("adres"), 120),
            "omschrijving": str(c.get("omschrijving") or "").strip()[:2000],
            "fotos": _geheel(c.get("fotos"), 0, MAX_COMPLEXFOTOS, 0),
        }
        if not a["complex"]["organisatie"]:
            fouten.append("Vul de naam van de VvE of de organisatie in.")
        if not a["complex"]["woningen"]:
            fouten.append("Vul in om hoeveel woningen het gaat.")
        if not a["complex"]["adres"]:
            fouten.append("Vul in waar het complex staat.")
    else:
        kozijnen = invoer.get("kozijnen") if isinstance(invoer.get("kozijnen"), list) else []
        if not kozijnen:
            fouten.append("Voeg minstens één kozijn toe.")
        if len(kozijnen) > MAX_KOZIJNEN:
            fouten.append("Meer dan %d kozijnen past niet in dit formulier. Bel of mail ons: "
                          "dan komen we liever even kijken." % MAX_KOZIJNEN)
        a["kozijnen"] = [_kozijn(k, i + 1, manier, fouten) for i, k in enumerate(kozijnen[:MAX_KOZIJNEN])]

    def keuze(sleutel, opties, standaard=""):
        return invoer.get(sleutel) if invoer.get(sleutel) in opties else standaard

    a["kleur_nu"] = keuze("kleur_nu", KLEUR_NU)
    a["zijde"] = keuze("zijde", ZIJDE, "buiten")
    a["rolluik"] = invoer.get("rolluik") == "ja"
    a["klant"] = keuze("klant", KLANT, "particulier")
    a["wanneer"] = keuze("wanneer", WANNEER)
    a["bron"] = keuze("bron", BRON)
    a["dealer"] = _tekst(invoer.get("dealer"), 80) if a["bron"] == "dealer" else ""

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
        "straat": _tekst(g.get("straat"), 80),
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
    if not a["gegevens"]["straat"]:
        fouten.append("Vul je straat in.")
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
    if a["manier"] == "complex":
        return [{"naam": "foto-%d.jpg" % n, "soort": "foto", "kozijn": 0}
                for n in range(1, a["complex"]["fotos"] + 1)]
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


def details(a):
    """De korte vragen bij Kleur en Gegevens als (label, antwoord), voor de mail aan Max
    en de Max-modus. Een aanvraag van voor 17 november 2026 heeft ze niet."""
    uit = []
    if a.get("kleur_nu"):
        uit.append(("Kleur nu", KLEUR_NU[a["kleur_nu"]]))
    if a.get("zijde"):
        uit.append(("Binnen of buiten", ZIJDE[a["zijde"]]))
    if "rolluik" in a:
        uit.append(("Rolluikkasten", "ja, die moeten ook" if a["rolluik"] else "nee"))
    if a.get("klant"):
        uit.append(("Voor wie", KLANT[a["klant"]]))
    if a.get("wanneer"):
        uit.append(("Wanneer", WANNEER[a["wanneer"]]))
    if a.get("bron"):
        uit.append(("Kent iWrap via", BRON[a["bron"]] + (": " + a["dealer"] if a.get("dealer") else "")))
    return uit


def voor_claude(a):
    """De aanvraag als gegevens, voor aanvraag.json in de mail. Zonder token."""
    d = {k: a[k] for k in ("id", "manier", "kozijnen", "papier", "kleur", "kleur_anders",
                           "gegevens", "toelichting", "via", "gemaakt")}
    for k in ("complex", "kleur_nu", "zijde", "rolluik", "klant", "wanneer", "bron", "dealer"):
        d[k] = a.get(k)
    d["manier_naam"] = MANIEREN[a["manier"]]
    d["totalen"] = totalen(a) if a["manier"] not in ("papier", "complex") else None
    d["fotos"] = fotolijst(a)
    d["_uitleg"] = ("Lengtes in centimeters. regels = wat de klant zelf gemeten heeft "
                    "(deel, lengte per stuk, aantal). aantal bij een kozijn = hoe vaak dat kozijn "
                    "met hetzelfde werk voorkomt. heel = het hele kozijn moet. waar = begane-grond, verdieping (1e), "
                    "hoog (2e verdieping of hoger) of dakkapel; kant = voor, achter of zij. kleur_nu = de kleur die "
                    "de kozijnen nu hebben; zijde = buiten, binnen of beide; rolluik = ook rolluikkasten; klant = "
                    "particulier, vve, corporatie of bedrijf; bron (+ dealer) = hoe de klant iWrap kent. Bij manier 'streep' "
                    "staat in kozijn-N-aangestreept.jpg wat er moet gebeuren: geel = het kozijn (vaste "
                    "delen), rood = een draairaam of deur. aanstreping zegt welke kleuren gebruikt zijn.")
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


# ---------------------------------------------------------------------------
# Voor de Max-modus
# ---------------------------------------------------------------------------

def adres(a):
    g = a["gegevens"]
    straat = ("%s %s" % (g.get("straat", ""), g["huisnummer"])).strip()
    return "%s, %s %s" % (straat, g["postcode"], g["plaats"])


def overzicht(a):
    """Per kozijn een kop, wat er moet gebeuren en welke foto's erbij horen.
    Dezelfde tekst als in de mail aan Max."""
    if a["manier"] == "complex":
        c = a["complex"]
        return [{
            "titel": "%s · %d woningen" % (c["organisatie"], c["woningen"]),
            "regels": ["Waar: " + c["adres"]] + (["Wat: " + c["omschrijving"]] if c["omschrijving"] else []),
            "fotos": [f["naam"] for f in fotolijst(a)],
        }]
    if a["manier"] == "papier":
        p = a["papier"]
        return [{
            "titel": "Getekend op papier",
            "regels": ["Waar: " + ", ".join(WAAR[w] for w in p["waar"])
                       + (" (" + ", ".join(KANT[w] for w in p.get("kant", [])) + ")" if p.get("kant") else "")],
            "fotos": [f["naam"] for f in fotolijst(a)],
        }]
    uit = []
    for nr, k in enumerate(a["kozijnen"], 1):
        uit.append({"titel": mails._kozijn_kop(k, nr), "regels": mails._kozijn_werk(k, nr),
                    "fotos": mails._kozijn_fotos(a, nr)})
    return uit


def lijstregel(a):
    if a["manier"] == "complex":
        wat = "complex, %d woningen" % a["complex"]["woningen"]
    elif a["manier"] == "papier":
        wat = "tekening, %d foto%s" % (a["papier"]["fotos"], "'s" if a["papier"]["fotos"] != 1 else "")
    else:
        t = totalen(a)
        wat = "%d kozijn%s" % (t["kozijnen"], "en" if t["kozijnen"] != 1 else "")
    return {"id": a["id"], "naam": a["gegevens"]["naam"], "plaats": a["gegevens"]["plaats"],
            "manier": MANIEREN[a["manier"]], "wat": wat, "gemaakt": a["gemaakt"]}


def voor_max(a):
    d = lijstregel(a)
    d.update({
        "gegevens": a["gegevens"],
        "adres": adres(a),
        "kleur": "Dezelfde kleur houden" if a["kleur"] == "zelfde" else "Andere kleur: " + a["kleur_anders"],
        "toelichting": a["toelichting"],
        "via": a["via"],
        "details": [list(x) for x in details(a)],
        "overzicht": overzicht(a),
        "fotos": [f["naam"] for f in fotolijst(a)],
    })
    return d


def foto(a, naam):
    if naam not in {f["naam"] for f in fotolijst(a)}:
        return None
    data = opslag().get_ruw(_fotosleutel(a, naam))
    return base64.b64decode(data) if data else None
