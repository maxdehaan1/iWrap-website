"""Bestellingen van kozijnhorren.nl: van winkelmand tot "past alles?".

Statussen, in volgorde:
  open        aangemaakt, de klant is aan het betalen
  betaald     geld is binnen; wacht op Max (of gaat automatisch door)
  besteld     doorgestuurd naar de leverancier
  verzonden   de leverancier heeft verzonden (Max zet dit, met track & trace)
  afgerond    "past alles?"-mail is verstuurd
En zijpaden: mislukt (betaling niet gelukt), geannuleerd (door Max).

Er is één manier van bestellen. Of de klant zelf de maten invult of Max dat bij
de klant thuis doet, maakt niet uit: het is dezelfde winkel en dezelfde kassa.
"""

import datetime as dt
import re
import secrets
import time

from . import horren, mail, mails
from . import instellingen as cfg
from .betalen import BetaalFout, haal_status, maak_betaling
from .opslag import opslag

POSTCODE = re.compile(r"^\s*(\d{4})\s*([a-zA-Z]{2})\s*$")
EMAIL = re.compile(r"^[^@\s]+@[^@\s]+\.[a-zA-Z]{2,}$")


class Afgewezen(Exception):
    """Iets wat de klant zelf kan oplossen; de melding is voor de klant."""
    def __init__(self, meldingen):
        super().__init__("; ".join(meldingen))
        self.meldingen = meldingen


def haal(nr):
    if not nr or not re.fullmatch(r"H\d{2}-\d{3,6}", nr):
        return None
    return opslag().get("bestelling:" + nr)


def bewaar(b, gebeurtenis=None):
    if gebeurtenis:
        b.setdefault("historie", []).append({"tijd": int(time.time()), "wat": gebeurtenis})
    opslag().put("bestelling:" + b["nr"], b)
    return b


def statuslink(b):
    return "%s/bestelling?nr=%s&t=%s" % (cfg.SHOP_URL, b["nr"], b["token"])


def beheerlink(b):
    return "%s/max#bestelling/%s" % (cfg.IWRAP_URL, b["nr"])


def _klant(k):
    k = k or {}
    uit = {veld: str(k.get(veld) or "").strip()[:120] for veld in
           ("naam", "email", "telefoon", "straat", "postcode", "plaats")}
    fout = []
    if len(uit["naam"]) < 2:
        fout.append("Vul je naam in.")
    if not EMAIL.match(uit["email"]):
        fout.append("Vul een geldig e-mailadres in; daar komt de bevestiging naartoe.")
    if not re.search(r"\d", uit["straat"]):
        fout.append("Vul je straat met huisnummer in.")
    m = POSTCODE.match(uit["postcode"])
    if not m:
        fout.append("Vul een Nederlandse postcode in, zoals 1214 GZ.")
    else:
        uit["postcode"] = "%s %s" % (m.group(1), m.group(2).upper())
    if len(uit["plaats"]) < 2:
        fout.append("Vul je woonplaats in.")
    if len(re.sub(r"\D", "", uit["telefoon"])) < 9:
        fout.append("Vul je telefoonnummer in; dat heeft de bezorger nodig.")
    return uit, fout


def maak(invoer):
    """Een bestelling aanmaken en de betaling starten. Terug: (bestelling, betaal-url)."""
    if invoer.get("website"):  # honeypot: mensen zien dit veld niet
        raise Afgewezen(["Er ging iets mis. Probeer het opnieuw."])

    voorjaar = bool(invoer.get("voorjaar"))
    berekend = horren.bereken(invoer.get("regels") or [], voorjaar=voorjaar)
    klant, klantfouten = _klant(invoer.get("klant"))
    fouten = berekend["fouten"] + klantfouten

    akkoord = invoer.get("akkoord") or {}
    if not akkoord.get("gemeten"):
        fouten.append("Vink aan dat je gemeten hebt zoals in de meetinstructie; daar hangt de pasgarantie aan.")
    if not akkoord.get("voorwaarden"):
        fouten.append("Vink aan dat je akkoord gaat met de voorwaarden.")
    if fouten:
        raise Afgewezen(fouten)

    jaar = dt.date.today().strftime("%y")
    volgnummer = opslag().teller("teller:bestelling:" + jaar)
    b = {
        "nr": "H%s-%04d" % (jaar, volgnummer),
        "token": secrets.token_urlsafe(12),
        "gemaakt": int(time.time()),
        "status": "open",
        "pasgarantie": horren.catalogus()["pasgarantie"]["aan"],
        "klant": klant,
        "regels": berekend["regels"],
        "subtotaal": berekend["subtotaal"],
        "verzendkosten": berekend["verzendkosten"],
        "totaal": berekend["totaal"],
        "btw": berekend["btw"],
        "levertijd": berekend["levertijd"],
        "akkoord": {"gemeten": True, "voorwaarden": True, "tijd": int(time.time())},
        "betaling": {},
        "mails": {},
    }
    try:
        betaling_id, url = maak_betaling(b, berekend["voorbeeldprijzen"])
    except BetaalFout as e:
        raise Afgewezen([str(e)])
    b["betaling"] = {"id": betaling_id, "status": "open"}
    bewaar(b, "aangemaakt, betaling gestart")
    opslag().put("betaling:" + betaling_id, {"nr": b["nr"]})
    opslag().index_zet("bestellingen", b["nr"], b["gemaakt"])
    return b, url


def verwerk_betaling(b, status, methode=None):
    """Aangeroepen door de Mollie-webhook, de testkassa en de bedankpagina.
    Mag vaker komen voor dezelfde betaling: alleen een echte overgang telt."""
    b["betaling"]["status"] = status
    if methode:
        b["betaling"]["methode"] = methode
    if status == "paid" and b["status"] == "open":
        b["status"] = "betaald"
        b["betaling"]["betaald_op"] = int(time.time())
        bewaar(b, "betaald")
        _na_betaling(b)
    elif status in ("failed", "canceled", "expired") and b["status"] == "open":
        b["status"] = "mislukt"
        bewaar(b, "betaling " + status)
    else:
        bewaar(b)
    return b


def _na_betaling(b):
    onderwerp, html, tekst = mails.bevestiging(b, statuslink(b))
    b["mails"]["bevestiging"] = mail.verstuur(b["klant"]["email"], onderwerp, html, tekst, soort="bevestiging")
    onderwerp, html, tekst = mails.voor_max(b, beheerlink(b))
    mail.verstuur(cfg.MAX_EMAIL, onderwerp, html, tekst, antwoord_aan=b["klant"]["email"], soort="melding-max")
    if cfg.LEVERANCIER_AUTOMATISCH:
        naar_leverancier(b)
    else:
        bewaar(b)


def ververs_betaling(b):
    """Status bij Mollie opvragen. Voor als de webhook (nog) niet kwam."""
    if b["status"] != "open" or not b.get("betaling", {}).get("id"):
        return b
    try:
        s = haal_status(b["betaling"]["id"])
    except BetaalFout:
        return b
    if s:
        verwerk_betaling(b, s["status"], s.get("methode"))
    return b


def naar_leverancier(b):
    onderwerp, html, tekst = mails.voor_leverancier(b)
    gelukt = mail.verstuur(cfg.LEVERANCIER_EMAIL, onderwerp, html, tekst, antwoord_aan=cfg.MAX_EMAIL,
                           soort="leverancier")
    if gelukt:
        b["status"] = "besteld"
        b["leverancier"] = {"naam": cfg.LEVERANCIER_NAAM, "email": cfg.LEVERANCIER_EMAIL,
                            "op": int(time.time())}
        bewaar(b, "doorgestuurd naar %s" % cfg.LEVERANCIER_NAAM)
    else:
        bewaar(b, "doorsturen naar leverancier mislukt")
    return gelukt


def actie(b, wat, invoer):
    """Wat Max vanuit de Max-modus met een bestelling doet."""
    if wat == "naar_leverancier":
        if b["status"] not in ("betaald", "besteld"):
            raise Afgewezen(["Alleen een betaalde bestelling kan naar de leverancier."])
        if not naar_leverancier(b):
            raise Afgewezen(["De mail naar de leverancier is niet verstuurd. Kijk of de mailkoppeling werkt."])
    elif wat == "handmatig_besteld":
        # Voor als Max via een portaal van de leverancier heeft besteld.
        if b["status"] not in ("betaald", "besteld"):
            raise Afgewezen(["Alleen een betaalde bestelling kan als besteld gemarkeerd worden."])
        b["status"] = "besteld"
        b["leverancier"] = {"naam": cfg.LEVERANCIER_NAAM, "handmatig": True, "op": int(time.time())}
        bewaar(b, "handmatig besteld bij de leverancier")
    elif wat == "verzonden":
        if b["status"] not in ("betaald", "besteld", "verzonden"):
            raise Afgewezen(["Deze bestelling kan niet op verzonden."])
        track = str(invoer.get("track") or "").strip()[:300]
        if track and not track.startswith("http"):
            track = ""
        b["status"] = "verzonden"
        b["verzending"] = {"op": int(time.time()), "track": track}
        onderwerp, html, tekst = mails.verzonden(b, statuslink(b))
        b["mails"]["verzonden"] = mail.verstuur(b["klant"]["email"], onderwerp, html, tekst, soort="verzonden")
        bewaar(b, "verzonden" + (" (track & trace)" if track else ""))
    elif wat == "annuleren":
        if b["status"] in ("verzonden", "afgerond"):
            raise Afgewezen(["Deze bestelling is al verzonden."])
        b["status"] = "geannuleerd"
        bewaar(b, "geannuleerd door Max" + (": " + str(invoer.get("reden"))[:200] if invoer.get("reden") else ""))
    elif wat == "notitie":
        b["notitie"] = str(invoer.get("notitie") or "")[:2000]
        bewaar(b)
    else:
        raise Afgewezen(["Onbekende actie."])
    return b


def publiek(b):
    """Wat de klant op de statuspagina ziet."""
    return {
        "nr": b["nr"], "status": b["status"], "regels": b["regels"], "totaal": b["totaal"],
        "btw": b["btw"], "verzendkosten": b["verzendkosten"], "levertijd": b.get("levertijd"),
        "klant": {k: b["klant"].get(k) for k in ("naam", "straat", "postcode", "plaats")},
        "pasgarantie": b.get("pasgarantie"), "verzending": b.get("verzending"),
    }


def dagelijks(vandaag=None):
    """Draait één keer per dag (Vercel Cron). Stuurt "past alles?" en ruimt
    onbetaalde bestellingen op."""
    nu = time.time()
    verslag = {"past_alles": 0, "verlopen": 0}
    for nr in opslag().index_lijst("bestellingen", 1000):
        b = haal(nr)
        if not b:
            continue
        if b["status"] == "open" and nu - b["gemaakt"] > 3 * 86400:
            ververs_betaling(b)
            if b["status"] == "open":
                b["status"] = "mislukt"
                bewaar(b, "niet betaald binnen drie dagen")
                verslag["verlopen"] += 1
        elif (b["status"] == "verzonden" and not b["mails"].get("past_alles")
              and nu - b.get("verzending", {}).get("op", nu) > cfg.PAST_ALLES_NA_DAGEN * 86400):
            onderwerp, html, tekst = mails.past_alles(b, cfg.WINKEL.get("reviews_url", ""))
            if mail.verstuur(b["klant"]["email"], onderwerp, html, tekst, soort="past-alles"):
                b["mails"]["past_alles"] = True
                b["status"] = "afgerond"
                bewaar(b, "past-alles-mail verstuurd")
                verslag["past_alles"] += 1
    return verslag
