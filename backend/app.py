"""De API. Eén WSGI-app, zonder framework: een lijstje routes en een paar hulpjes.

Openbaar (ook vanuit de winkel op een ander domein):
  GET  /api/horren/catalogus              assortiment, kleuren, prijstabel
  POST /api/horren/prijs                  prijs van een lijst horren
  POST /api/horren/bestellingen           bestelling aanmaken, betaling starten
  GET  /api/horren/bestellingen/<nr>?t=   status voor de klant
  POST /api/horren/betaling-webhook       Mollie meldt een betaling
  GET  /api/horren/testkassa/<nr>?t=      nepkassa, alleen zonder Mollie-sleutel
  GET  /api/rapporten/<id>                het rapport voor de klant
  GET  /api/fotos/<id>                    een foto uit een rapport

Max-modus (met token uit /api/max/login):
  /api/max/status, /api/max/rapporten[/<id>[/mail]], /api/max/fotos,
  /api/max/bestellingen[/<nr>[/actie]]

Vercel Cron:
  GET  /api/cron
"""

import base64
import json
import re
import time
import traceback
from html import escape
from urllib.parse import parse_qs

from . import bestellingen, horren, mail, mails, rapporten
from . import instellingen as cfg
from .auth import maak_token, nieuwe_id, token_geldig, wachtwoord_klopt
from .opslag import Fout, opslag

ROUTES = []


def route(methode, patroon, max_modus=False):
    def registreer(func):
        ROUTES.append((methode, re.compile("^" + patroon + "$"), func, max_modus))
        return func
    return registreer


class Verzoek:
    def __init__(self, environ):
        self.environ = environ
        self.methode = environ.get("REQUEST_METHOD", "GET").upper()
        pad = environ.get("PATH_INFO", "/") or "/"
        self.query = {k: v[0] for k, v in parse_qs(environ.get("QUERY_STRING", "")).items()}
        # Achter de rewrite in vercel.json kan het pad /api/index zijn; dan
        # staat het echte pad in ?pad=.
        if pad.rstrip("/") in ("/api/index", "/api/index.py", "/api") and "pad" in self.query:
            pad = "/api/" + self.query.pop("pad")
        self.pad = "/" + pad.strip("/")
        self.origin = environ.get("HTTP_ORIGIN", "")
        self._body = None

    @property
    def ip(self):
        fw = self.environ.get("HTTP_X_FORWARDED_FOR", "")
        return fw.split(",")[0].strip() or self.environ.get("REMOTE_ADDR", "?")

    def body(self):
        if self._body is None:
            try:
                lengte = int(self.environ.get("CONTENT_LENGTH") or 0)
            except ValueError:
                lengte = 0
            if lengte > 6_000_000:
                raise Probleem(413, "Te groot.")
            self._body = self.environ["wsgi.input"].read(lengte) if lengte else b""
        return self._body

    def json(self):
        try:
            data = json.loads(self.body().decode("utf-8") or "{}")
        except (ValueError, UnicodeDecodeError):
            raise Probleem(400, "Dit is geen geldige JSON.")
        if not isinstance(data, dict):
            raise Probleem(400, "Verwacht een object.")
        return data

    def formulier(self):
        return {k: v[0] for k, v in parse_qs(self.body().decode("utf-8", "replace")).items()}

    def token(self):
        kop = self.environ.get("HTTP_AUTHORIZATION", "")
        return kop[7:].strip() if kop.lower().startswith("bearer ") else ""


class Probleem(Exception):
    def __init__(self, status, melding, extra=None):
        super().__init__(melding)
        self.status, self.melding, self.extra = status, melding, extra or {}


def antwoord(data, status=200, koppen=None):
    return status, dict({"Content-Type": "application/json; charset=utf-8",
                         "Cache-Control": "no-store"}, **(koppen or {})), \
        json.dumps(data, ensure_ascii=False).encode("utf-8")


def html_antwoord(tekst, status=200):
    return status, {"Content-Type": "text/html; charset=utf-8", "Cache-Control": "no-store"}, tekst.encode("utf-8")


def doorsturen(url):
    return 303, {"Location": url, "Cache-Control": "no-store"}, b""


# ---------------------------------------------------------------------------
# Winkel
# ---------------------------------------------------------------------------

@route("GET", "/api/horren/catalogus")
def catalogus(v):
    cat = horren.catalogus()
    cat.pop("_uitleg", None)
    cat["folies"] = horren.folies()
    cat["ral"] = horren.ral_namen()
    cat["voorjaar_mogelijk"] = horren.voorjaar_mogelijk()
    return antwoord(cat, koppen={"Cache-Control": "public, max-age=300"})


@route("POST", "/api/horren/prijs")
def prijs(v):
    data = v.json()
    return antwoord(horren.bereken(data.get("regels"), voorjaar=bool(data.get("voorjaar"))))


@route("POST", "/api/horren/bestellingen")
def bestelling_maken(v):
    if opslag().teller_met_ttl("bestel:" + v.ip, 3600) > 30:
        raise Probleem(429, "Te veel pogingen. Probeer het over een uur opnieuw.")
    try:
        b, url = bestellingen.maak(v.json())
    except bestellingen.Afgewezen as e:
        raise Probleem(422, e.meldingen[0], {"fouten": e.meldingen})
    return antwoord({"nr": b["nr"], "token": b["token"], "betaal_url": url}, 201)


def _bestelling_met_token(nr, token):
    b = bestellingen.haal(nr)
    if not b or not token or token != b.get("token"):
        raise Probleem(404, "Deze bestelling kennen we niet.")
    return b


@route("GET", r"/api/horren/bestellingen/(?P<nr>[A-Z0-9-]+)")
def bestelling_status(v, nr):
    b = _bestelling_met_token(nr, v.query.get("t"))
    bestellingen.ververs_betaling(b)
    return antwoord(bestellingen.publiek(b))


@route("POST", "/api/horren/betaling-webhook")
def webhook(v):
    betaling_id = v.formulier().get("id", "")
    if not re.fullmatch(r"tr_[A-Za-z0-9]+", betaling_id):
        return antwoord({"ok": True})  # Mollie verwacht altijd een 200
    from .betalen import haal_status
    s = haal_status(betaling_id)
    # We vertrouwen alleen wat Mollie zelf zegt, niet wat er in het verzoek staat.
    koppeling = opslag().get("betaling:" + betaling_id) or {}
    b = bestellingen.haal(koppeling.get("nr"))
    if b and s:
        bestellingen.verwerk_betaling(b, s["status"], s.get("methode"))
    return antwoord({"ok": True})


@route("GET", r"/api/horren/testkassa/(?P<nr>[A-Z0-9-]+)")
def testkassa(v, nr):
    _alleen_testkassa()
    b = _bestelling_met_token(nr, v.query.get("t"))
    t = escape(b["token"], True)
    return html_antwoord(
        "<!doctype html><meta charset=utf-8><meta name=viewport content='width=device-width'>"
        "<title>Testkassa</title><body style='font:17px/1.5 system-ui;max-width:460px;margin:60px auto;padding:0 20px'>"
        "<p style='font-size:13px;letter-spacing:.1em;text-transform:uppercase;color:#a8523a'>Testkassa, geen echt geld</p>"
        "<h1 style='font-size:24px'>Bestelling %s: %s</h1>"
        "<p>Hier zou Mollie de iDEAL-betaling doen. Kies wat er gebeurt:</p>"
        "<form method=post><input type=hidden name=t value='%s'>"
        "<button name=uitkomst value=paid style='font-size:17px;padding:14px 22px;border-radius:99px;border:0;"
        "background:#22262a;color:#fff;margin:0 10px 10px 0'>Betaling gelukt</button>"
        "<button name=uitkomst value=canceled style='font-size:17px;padding:14px 22px;border-radius:99px;"
        "border:1px solid #ccc;background:#fff'>Afgebroken</button></form></body>"
        % (escape(b["nr"]), horren.euro(b["totaal"]), t))


@route("POST", r"/api/horren/testkassa/(?P<nr>[A-Z0-9-]+)")
def testkassa_uitkomst(v, nr):
    _alleen_testkassa()
    form = v.formulier()
    b = _bestelling_met_token(nr, form.get("t"))
    uitkomst = form.get("uitkomst") if form.get("uitkomst") in ("paid", "canceled") else "canceled"
    bestellingen.verwerk_betaling(b, uitkomst, "testkassa")
    return doorsturen(bestellingen.statuslink(b))


def _alleen_testkassa():
    from .betalen import modus
    if modus() != "testkassa" or (cfg.OP_VERCEL and cfg.env("VERCEL_ENV") == "production"):
        raise Probleem(404, "Niet gevonden.")


# ---------------------------------------------------------------------------
# Rapport (klant)
# ---------------------------------------------------------------------------

def _rapport_voor_klant(v, rid):
    r = rapporten.haal(rid)
    # Max mag een concept alvast bekijken; de klant pas als het klaar staat.
    if not r or (r["status"] != "klaar" and not token_geldig(v.token())):
        raise Probleem(404, "Dit rapport bestaat niet (meer).")
    return r


@route("GET", r"/api/rapporten/(?P<rid>[a-z0-9]+)")
def rapport(v, rid):
    return antwoord(rapporten.publiek(_rapport_voor_klant(v, rid)))


@route("GET", r"/api/fotos/(?P<fid>[a-z0-9]+)")
def foto(v, fid):
    data = opslag().get_ruw("foto:" + fid)
    if not data:
        raise Probleem(404, "Foto niet gevonden.")
    return 200, {"Content-Type": "image/jpeg", "Cache-Control": "public, max-age=31536000, immutable"}, \
        base64.b64decode(data)


# ---------------------------------------------------------------------------
# Max-modus
# ---------------------------------------------------------------------------

@route("POST", "/api/max/login")
def login(v):
    if opslag().teller_met_ttl("login:" + v.ip, 900) > 8:
        raise Probleem(429, "Te veel pogingen. Wacht een kwartier.")
    if not cfg.MAX_WACHTWOORD or not cfg.GEHEIM:
        raise Probleem(503, "Inloggen staat nog uit: zet MAX_WACHTWOORD en GEHEIM in Vercel.")
    if not wachtwoord_klopt(v.json().get("wachtwoord")):
        time.sleep(0.6)
        raise Probleem(401, "Dat wachtwoord klopt niet.")
    return antwoord({"token": maak_token()})


@route("GET", "/api/max/status", max_modus=True)
def status(v):
    s = cfg.status()
    s["kozijncheck"] = rapporten.onderdelen()
    s["folies"] = horren.folies()
    return antwoord(s)


def _lijstregel(r):
    s = rapporten.samenvatting(r)
    return {"id": r["id"], "status": r["status"], "naam": r["klant"].get("naam"),
            "plaats": r["klant"].get("plaats"), "straat": r["klant"].get("straat"),
            "datum": r["oplevering"].get("datum"), "bijgewerkt": r["bijgewerkt"],
            "oranje": s["oranje"], "rood": s["rood"]}


@route("GET", "/api/max/rapporten", max_modus=True)
def rapporten_lijst(v):
    uit = []
    for rid in opslag().index_lijst("rapporten", 300):
        r = rapporten.haal(rid)
        if r:
            uit.append(_lijstregel(r))
    return antwoord({"rapporten": uit})


@route("POST", "/api/max/rapporten", max_modus=True)
def rapport_nieuw(v):
    r = rapporten.nieuw()
    invoer = v.json()
    if invoer:
        r = rapporten.schoon(invoer, r)
    rapporten.bewaar(r)
    return antwoord(r, 201)


@route("GET", r"/api/max/rapporten/(?P<rid>[a-z0-9]+)", max_modus=True)
def rapport_max(v, rid):
    r = rapporten.haal(rid)
    if not r:
        raise Probleem(404, "Deze klus bestaat niet.")
    r["_link"] = rapporten.link(r)
    r["_samenvatting"] = rapporten.samenvatting(r)
    return antwoord(r)


@route("PUT", r"/api/max/rapporten/(?P<rid>[a-z0-9]+)", max_modus=True)
def rapport_bijwerken(v, rid):
    r = rapporten.haal(rid)
    if not r:
        raise Probleem(404, "Deze klus bestaat niet.")
    invoer = v.json()
    # Een telefoon die offline was mag geen nieuwere versie van een ander
    # apparaat overschrijven. 'versie' telt alleen wijzigingen uit de
    # Max-modus; een verstuurde mail of een bestelling telt niet mee.
    if invoer.get("_versie") is not None and invoer["_versie"] != r.get("versie", 0) and not invoer.get("_forceer"):
        raise Probleem(409, "Deze klus is intussen op een ander apparaat gewijzigd.", {"server": r})
    r = rapporten.schoon(invoer, r)
    r["versie"] = r.get("versie", 0) + 1
    if invoer.get("status") in ("klaar", "concept"):
        if invoer["status"] == "klaar" and r["status"] != "klaar":
            r["klaar_op"] = int(time.time())
        r["status"] = invoer["status"]
    rapporten.bewaar(r)
    r["_link"] = rapporten.link(r)
    r["_samenvatting"] = rapporten.samenvatting(r)
    return antwoord(r)


@route("DELETE", r"/api/max/rapporten/(?P<rid>[a-z0-9]+)", max_modus=True)
def rapport_weg(v, rid):
    r = rapporten.haal(rid)
    if r:
        for c in r.get("check", {}).values():
            for f in c.get("fotos", []):
                opslag().weg("foto:" + f)
        opslag().weg("rapport:" + rid)
    opslag().index_weg("rapporten", rid)
    return antwoord({"ok": True})


@route("POST", r"/api/max/rapporten/(?P<rid>[a-z0-9]+)/mail", max_modus=True)
def rapport_mailen(v, rid):
    r = rapporten.haal(rid)
    if not r:
        raise Probleem(404, "Deze klus bestaat niet.")
    if r["status"] != "klaar":
        raise Probleem(422, "Zet het rapport eerst klaar.")
    if not r["klant"].get("email"):
        raise Probleem(422, "Er staat geen e-mailadres bij de klant.")
    onderwerp, html, tekst = mails.rapport_klant(r, rapporten.link(r), rapporten.samenvatting(r))
    if not mail.verstuur(r["klant"]["email"], onderwerp, html, tekst, soort="rapport"):
        raise Probleem(502, "De mail is niet verstuurd. Kijk bij Status of de mailkoppeling werkt.")
    r.setdefault("gedeeld", {})["mail"] = int(time.time())
    rapporten.bewaar(r)
    return antwoord({"ok": True})


@route("POST", "/api/max/fotos", max_modus=True)
def foto_opslaan(v):
    data = v.json().get("data", "")
    if "," in data:
        data = data.split(",", 1)[1]
    try:
        ruw = base64.b64decode(data, validate=True)
    except Exception:
        raise Probleem(400, "Dit is geen foto.")
    if not ruw.startswith(b"\xff\xd8") or len(ruw) > 2_500_000:
        raise Probleem(400, "Alleen jpeg-foto's tot 2,5 MB. De Max-modus verkleint ze vanzelf.")
    fid = nieuwe_id(14)
    opslag().put_ruw("foto:" + fid, base64.b64encode(ruw).decode("ascii"))
    return antwoord({"id": fid, "url": "%s/fotos/%s" % (cfg.API_URL, fid)}, 201)


@route("GET", "/api/max/bestellingen", max_modus=True)
def bestellingen_lijst(v):
    uit = []
    for nr in opslag().index_lijst("bestellingen", 300):
        b = bestellingen.haal(nr)
        if b:
            uit.append({"nr": b["nr"], "status": b["status"], "gemaakt": b["gemaakt"], "totaal": b["totaal"],
                        "naam": b["klant"].get("naam"), "plaats": b["klant"].get("plaats"),
                        "horren": sum(r["aantal"] for r in b["regels"])})
    return antwoord({"bestellingen": uit})


@route("GET", r"/api/max/bestellingen/(?P<nr>[A-Z0-9-]+)", max_modus=True)
def bestelling_max(v, nr):
    b = bestellingen.haal(nr)
    if not b:
        raise Probleem(404, "Deze bestelling bestaat niet.")
    bestellingen.ververs_betaling(b)
    b["_leverancier_tekst"] = mails.leverancier_tekst(b)
    b["_statuslink"] = bestellingen.statuslink(b)
    return antwoord(b)


@route("POST", r"/api/max/bestellingen/(?P<nr>[A-Z0-9-]+)/actie", max_modus=True)
def bestelling_actie(v, nr):
    b = bestellingen.haal(nr)
    if not b:
        raise Probleem(404, "Deze bestelling bestaat niet.")
    invoer = v.json()
    try:
        b = bestellingen.actie(b, invoer.get("actie"), invoer)
    except bestellingen.Afgewezen as e:
        raise Probleem(422, e.meldingen[0], {"fouten": e.meldingen})
    b["_leverancier_tekst"] = mails.leverancier_tekst(b)
    b["_statuslink"] = bestellingen.statuslink(b)
    return antwoord(b)


# ---------------------------------------------------------------------------
# Cron
# ---------------------------------------------------------------------------

@route("GET", "/api/cron")
def cron(v):
    if cfg.CRON_SECRET and v.environ.get("HTTP_AUTHORIZATION") != "Bearer " + cfg.CRON_SECRET:
        raise Probleem(401, "Niet toegestaan.")
    if not cfg.CRON_SECRET and cfg.OP_VERCEL:
        raise Probleem(503, "Zet CRON_SECRET in Vercel.")
    return antwoord(bestellingen.dagelijks())


@route("GET", "/api/gezond")
def gezond(v):
    return antwoord({"ok": True})


# ---------------------------------------------------------------------------
# WSGI
# ---------------------------------------------------------------------------

STATUSTEKST = {200: "OK", 201: "Created", 204: "No Content", 303: "See Other", 400: "Bad Request",
               401: "Unauthorized", 404: "Not Found", 405: "Method Not Allowed", 409: "Conflict",
               413: "Payload Too Large", 422: "Unprocessable Entity", 429: "Too Many Requests",
               500: "Internal Server Error", 502: "Bad Gateway", 503: "Service Unavailable"}


def _cors(v):
    if v.origin and v.origin.rstrip("/") in cfg.TOEGESTANE_ORIGINS:
        return {"Access-Control-Allow-Origin": v.origin, "Vary": "Origin"}
    return {}


def behandel(v):
    if v.methode == "OPTIONS":
        return 204, dict(_cors(v), **{
            "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
            "Access-Control-Allow-Headers": "Content-Type, Authorization",
            "Access-Control-Max-Age": "600"}), b""
    gevonden_pad = False
    for methode, patroon, func, max_modus in ROUTES:
        m = patroon.match(v.pad)
        if not m:
            continue
        gevonden_pad = True
        if methode != v.methode:
            continue
        if max_modus and not token_geldig(v.token()):
            raise Probleem(401, "Log opnieuw in.")
        return func(v, **m.groupdict())
    raise Probleem(405 if gevonden_pad else 404, "Niet gevonden.")


def app(environ, start_response):
    v = Verzoek(environ)
    try:
        status, koppen, inhoud = behandel(v)
    except Probleem as p:
        status, koppen, inhoud = antwoord(dict({"fout": p.melding}, **p.extra), p.status)
    except Fout as e:
        status, koppen, inhoud = antwoord({"fout": "De opslag is even niet bereikbaar. Probeer het zo opnieuw."}, 503)
        print("opslagfout:", e)
    except Exception:
        traceback.print_exc()
        status, koppen, inhoud = antwoord({"fout": "Er ging iets mis aan onze kant. Probeer het opnieuw, "
                                                   "of stuur ons een WhatsApp."}, 500)
    koppen = dict(koppen, **_cors(v))
    koppen.setdefault("X-Robots-Tag", "noindex")
    start_response("%d %s" % (status, STATUSTEKST.get(status, "")), list(koppen.items()))
    return [inhoud]
