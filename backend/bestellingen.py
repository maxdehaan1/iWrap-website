"""Bestellingen van kozijnhorren.nl: van winkelmand tot "past alles?".

Statussen, in volgorde:
  open        aangemaakt, de klant is aan het betalen
  betaald     geld is binnen; wacht op Max (of gaat automatisch door)
  besteld     doorgestuurd naar de leverancier (die bevestigt via zijn link)
  verzonden   de leverancier heeft verzonden (via zijn link, of Max zet dit)
  afgerond    "past alles?"-mail is verstuurd
En zijpaden: mislukt (betaling niet gelukt), geannuleerd (door Max).

Er is één kassa. De klant vult zelf de maten in, of een vakman meet bij de klant
thuis en zet de horren voor hem klaar (vakman-modus): dan krijgt de klant een
link, kijkt zijn adres na en betaalt. Daarna loopt alles hetzelfde.

De leverancier krijgt bij elke bestelling een eigen link (leverancierlink). Daar
zet hij de bestelling op "in productie" en later op "verzonden" met de track &
trace; de klant krijgt dan vanzelf bericht. Zo hoeft Max er niets voor te doen.
"""

import datetime as dt
import hashlib
import hmac
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

    # Klaargezet door een vakman: dan komen de maten van hem, niet uit de browser.
    klaar = None
    if invoer.get("klaar"):
        klaar = haal_klaar(invoer.get("klaar"))
        if not klaar or klaar_status(klaar) != "open":
            raise Afgewezen(["Deze klaargezette bestelling is niet meer geldig. Stuur ons een WhatsApp, "
                             "dan zetten we je horren opnieuw klaar."])

    voorjaar = bool(invoer.get("voorjaar"))
    berekend = horren.bereken(klaar["regels"] if klaar else (invoer.get("regels") or []), voorjaar=voorjaar)
    klant, klantfouten = _klant(invoer.get("klant"))
    fouten = berekend["fouten"] + klantfouten

    akkoord = invoer.get("akkoord") or {}
    if not akkoord.get("gemeten") and not klaar:
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
    if klaar:
        b["vakman"] = klaar["vakman"]
        b["klaargezet"] = klaar["code"]
        b["akkoord"]["gemeten_door"] = klaar["vakman"]["naam"]
    try:
        betaling_id, url = maak_betaling(b, berekend["voorbeeldprijzen"])
    except BetaalFout as e:
        raise Afgewezen([str(e)])
    b["betaling"] = {"id": betaling_id, "status": "open"}
    bewaar(b, "aangemaakt, betaling gestart")
    opslag().put("betaling:" + betaling_id, {"nr": b["nr"]})
    opslag().index_zet("bestellingen", b["nr"], b["gemaakt"])
    if klaar:
        klaar.setdefault("pogingen", []).append(b["nr"])
        bewaar_klaar(klaar)
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
    if b.get("klaargezet"):
        klaar = haal_klaar(b["klaargezet"])
        if klaar:
            klaar.update(status="betaald", nr=b["nr"])
            bewaar_klaar(klaar)
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
    onderwerp, html, tekst = mails.voor_leverancier(b, leverancierlink(b))
    gelukt = mail.verstuur(cfg.LEVERANCIER_EMAIL, onderwerp, html, tekst, antwoord_aan=cfg.MAX_EMAIL,
                           soort="leverancier",
                           bijlagen=[("bestelling-%s.csv" % b["nr"], "text/csv", mails.leverancier_csv(b))])
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
        "vakman": (b.get("vakman") or {}).get("naam"),
    }


def dagelijks(vandaag=None):
    """Draait één keer per dag (Vercel Cron). Stuurt "past alles?", ruimt
    onbetaalde bestellingen op, herinnert klanten aan klaargezette horren en
    waarschuwt Max als een leverancier stil blijft."""
    nu = time.time()
    vandaag = vandaag or dt.date.today()
    verslag = {"past_alles": 0, "verlopen": 0, "klaar_herinnerd": 0, "klaar_verlopen": 0,
               "leverancier_stil": 0, "te_laat": 0}
    _klaargezet_dagelijks(nu, verslag)
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
        elif b["status"] == "besteld":
            _leverancier_dagelijks(b, nu, vandaag, verslag)
    return verslag


def _leverancier_dagelijks(b, nu, vandaag, verslag):
    """Eén seintje aan Max als de leverancier niet bevestigt, en één als de
    horren na de verwachte levertijd nog niet verzonden zijn. Niet elke dag."""
    lev = b.get("leverancier") or {}
    gemeld = b.setdefault("meldingen", {})
    if (not lev.get("bevestigd") and not lev.get("handmatig") and not gemeld.get("onbevestigd")
            and nu - lev.get("op", nu) > LEVERANCIER_STIL_DAGEN * 86400):
        onderwerp, html, tekst = mails.leverancier_stil(b, "onbevestigd", beheerlink(b))
        if mail.verstuur(cfg.MAX_EMAIL, onderwerp, html, tekst, soort="leverancier-stil"):
            gemeld["onbevestigd"] = True
            bewaar(b, "leverancier heeft na %d dagen niet bevestigd: Max gewaarschuwd" % LEVERANCIER_STIL_DAGEN)
            verslag["leverancier_stil"] += 1
    tot = (b.get("levertijd") or {}).get("tot")
    if tot and not gemeld.get("te_laat") and vandaag > dt.date.fromisoformat(tot) + dt.timedelta(days=2):
        onderwerp, html, tekst = mails.leverancier_stil(b, "te_laat", beheerlink(b))
        if mail.verstuur(cfg.MAX_EMAIL, onderwerp, html, tekst, soort="te-laat"):
            gemeld["te_laat"] = True
            bewaar(b, "nog niet verzonden na de verwachte levertijd: Max gewaarschuwd")
            verslag["te_laat"] += 1


# ---------------------------------------------------------------------------
# De leverancier: een eigen link per bestelling, zonder inloggen
# ---------------------------------------------------------------------------

LEVERANCIER_STIL_DAGEN = 3


def leverancier_token(b):
    """Een vaste sleutel per bestelling, afgeleid van GEHEIM. Zonder GEHEIM
    (Vercel zonder instellingen) is er geen link: liever geen dan een raadbare."""
    if not cfg.GEHEIM:
        return ""
    return hmac.new(cfg.GEHEIM.encode(), ("leverancier:" + b["nr"]).encode(), hashlib.sha256).hexdigest()[:24]


def leverancierlink(b):
    t = leverancier_token(b)
    return "%s/leverancier?nr=%s&t=%s" % (cfg.SHOP_URL, b["nr"], t) if t else ""


def leverancier_mag(b, token):
    t = leverancier_token(b)
    return bool(t) and hmac.compare_digest(t, str(token or ""))


def voor_leverancier_publiek(b):
    """Wat de leverancier op zijn pagina ziet: wat hij moet maken en waar het heen moet."""
    k = b["klant"]
    lev = b.get("leverancier") or {}
    return {
        "nr": b["nr"], "status": b["status"], "gemaakt": b["gemaakt"],
        "regels": [{"aantal": r["aantal"], "uitvoering": r["uitvoering"], "productnaam": r["productnaam"],
                    "breedte": r["breedte"], "hoogte": r["hoogte"], "kleur": r["kleur"], "gaas": r["gaas"],
                    "middenregel": r.get("middenregel", False), "naam": r.get("naam", "")} for r in b["regels"]],
        "klant": {veld: k.get(veld) for veld in ("naam", "straat", "postcode", "plaats", "telefoon")},
        "levertijd": b.get("levertijd"),
        "bevestigd": lev.get("bevestigd"),
        "verzending": b.get("verzending"),
        "winkel": cfg.WINKEL["naam"],
    }


def leverancier_actie(b, wat, invoer):
    """Wat de leverancier via zijn link doet. De klant en Max krijgen vanzelf bericht."""
    if b["status"] in ("geannuleerd", "mislukt", "open"):
        raise Afgewezen(["Deze bestelling loopt niet (meer). Neem contact op met %s." % cfg.MAX_EMAIL])
    if wat == "bevestigd":
        if b["status"] not in ("betaald", "besteld"):
            raise Afgewezen(["Deze bestelling is al verzonden."])
        lev = b.setdefault("leverancier", {"naam": cfg.LEVERANCIER_NAAM, "op": int(time.time())})
        if not lev.get("bevestigd"):
            lev["bevestigd"] = int(time.time())
            b["status"] = "besteld"
            bewaar(b, "bevestigd door de leverancier, gaat in productie")
    elif wat == "verzonden":
        b.setdefault("leverancier", {"naam": cfg.LEVERANCIER_NAAM, "op": int(time.time())}).setdefault(
            "bevestigd", int(time.time()))
        actie(b, "verzonden", invoer)
    elif wat == "probleem":
        opmerking = str(invoer.get("opmerking") or "").strip()[:1500]
        if len(opmerking) < 3:
            raise Afgewezen(["Schrijf kort wat er aan de hand is."])
        onderwerp, html, tekst = mails.leverancier_probleem(b, opmerking, beheerlink(b))
        mail.verstuur(cfg.MAX_EMAIL, onderwerp, html, tekst, soort="leverancier-probleem")
        bewaar(b, "leverancier meldt: " + opmerking[:200])
    else:
        raise Afgewezen(["Onbekende actie."])
    return b


# ---------------------------------------------------------------------------
# Klaargezet door een vakman
# ---------------------------------------------------------------------------
#
# Een vakman (Max bij een iWrap-klus, of een ander kozijnbedrijf met een eigen
# code) meet bij de klant, zet de horren in de winkel en kiest "Klaarzetten voor
# je klant". De klant krijgt een link, kijkt zijn adres na en betaalt. Omdat de
# vakman gemeten heeft, hoeft de klant niet aan te vinken dat hij volgens de
# meetinstructie gemeten heeft.

KLAAR_TEKENS = "abcdefghjkmnpqrstuvwxyz23456789"   # zonder 0/o, 1/l/i
KLAAR_GELDIG_DAGEN = 30
KLAAR_HERINNER_NA_DAGEN = 3


def vakman(code):
    code = str(code or "").strip().lower()
    naam = cfg.VAKMANNEN.get(code)
    return {"code": code, "naam": naam} if naam else None


def haal_klaar(code):
    if not code or not re.fullmatch(r"[a-z2-9]{8}", str(code)):
        return None
    return opslag().get("klaar:" + code)


def bewaar_klaar(k):
    opslag().put("klaar:" + k["code"], k)
    return k


def klaar_status(k):
    if k["status"] == "open" and time.time() - k["gemaakt"] > KLAAR_GELDIG_DAGEN * 86400:
        return "verlopen"
    return k["status"]


def klaarlink(k):
    return "%s/afrekenen?klaar=%s" % (cfg.SHOP_URL, k["code"])


def _klant_klaarzetten(k):
    """Bij het klaarzetten hoeft nog niet alles: een naam en een manier om de
    klant te bereiken. Het adres vult de klant anders zelf in."""
    k = k or {}
    uit = {veld: str(k.get(veld) or "").strip()[:120] for veld in
           ("naam", "email", "telefoon", "straat", "postcode", "plaats")}
    fout = []
    if len(uit["naam"]) < 2:
        fout.append("Vul de naam van je klant in.")
    if uit["email"] and not EMAIL.match(uit["email"]):
        fout.append("Het e-mailadres van je klant klopt niet.")
    if not uit["email"] and len(re.sub(r"\D", "", uit["telefoon"])) < 9:
        fout.append("Vul het mobiele nummer of het e-mailadres van je klant in.")
    if uit["postcode"]:
        m = POSTCODE.match(uit["postcode"])
        if m:
            uit["postcode"] = "%s %s" % (m.group(1), m.group(2).upper())
        else:
            fout.append("Vul een Nederlandse postcode in, zoals 1214 GZ, of laat hem leeg.")
    return uit, fout


def zet_klaar(invoer):
    v = vakman(invoer.get("vakman"))
    if not v:
        raise Afgewezen(["Deze vakmancode kennen we niet. Zet de vakman-modus opnieuw aan."])
    berekend = horren.bereken(invoer.get("regels") or [])
    klant, klantfouten = _klant_klaarzetten(invoer.get("klant"))
    fouten = berekend["fouten"] + klantfouten
    if fouten:
        raise Afgewezen(fouten)
    k = {
        "code": "".join(secrets.choice(KLAAR_TEKENS) for _ in range(8)),
        "vakman": v,
        "klant": klant,
        # De invoer, niet de prijzen: de kassa rekent bij het betalen opnieuw.
        "regels": [{"uitvoering": r["uitvoering"], "breedte": r["breedte"], "hoogte": r["hoogte"],
                    "kleur": r["kleur"]["code"], "aantal": r["aantal"], "naam": r.get("naam", "")}
                   for r in berekend["regels"]],
        "gemaakt": int(time.time()),
        "status": "open",
        "mails": {},
    }
    bewaar_klaar(k)
    opslag().index_zet("klaargezet", k["code"], k["gemaakt"])
    if invoer.get("mail_klant") and klant["email"]:
        onderwerp, html, tekst = mails.klaargezet(k, klaarlink(k), berekend)
        k["mails"]["klaargezet"] = mail.verstuur(klant["email"], onderwerp, html, tekst, soort="klaargezet")
        bewaar_klaar(k)
    return k


def publiek_klaar(k):
    """Wat de klant achter zijn link ziet. De link zelf is de sleutel."""
    return {"code": k["code"], "status": klaar_status(k), "vakman": k["vakman"]["naam"],
            "gemaakt": k["gemaakt"], "regels": k["regels"], "klant": k["klant"]}


def _klaargezet_dagelijks(nu, verslag):
    for code in opslag().index_lijst("klaargezet", 1000):
        k = haal_klaar(code)
        if not k:
            opslag().index_weg("klaargezet", code)
            continue
        if k["status"] != "open":
            continue
        if klaar_status(k) == "verlopen":
            k["status"] = "verlopen"
            bewaar_klaar(k)
            opslag().index_weg("klaargezet", code)
            verslag["klaar_verlopen"] += 1
        elif (k["klant"].get("email") and not k["mails"].get("herinnering")
              and nu - k["gemaakt"] > KLAAR_HERINNER_NA_DAGEN * 86400):
            berekend = horren.bereken(k["regels"])
            if berekend["fouten"]:
                continue
            onderwerp, html, tekst = mails.klaargezet(k, klaarlink(k), berekend, herinnering=True)
            if mail.verstuur(k["klant"]["email"], onderwerp, html, tekst, soort="klaargezet-herinnering"):
                k["mails"]["herinnering"] = True
                bewaar_klaar(k)
                verslag["klaar_herinnerd"] += 1
