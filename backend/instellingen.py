"""Alle instellingen op één plek.

Geheimen (wachtwoord, Mollie-sleutel, de Microsoft-koppeling) komen uit omgevings-
variabelen: in Vercel onder Settings > Environment Variables, lokaal uit een
bestand .env in de repo-root (staat in .gitignore). Deze repo is openbaar,
dus er staat hier nooit een echte sleutel in.
"""

import json
import os
import re
from pathlib import Path

HIER = Path(__file__).resolve().parent
DATA = HIER / "data"
ROOT = HIER.parent


def _laad_env_bestand():
    """Lokaal: .env inlezen, zodat je niet elke keer exports hoeft te typen."""
    pad = ROOT / ".env"
    if not pad.exists():
        return
    for regel in pad.read_text(encoding="utf-8").splitlines():
        regel = regel.strip()
        if not regel or regel.startswith("#") or "=" not in regel:
            continue
        sleutel, waarde = regel.split("=", 1)
        os.environ.setdefault(sleutel.strip(), waarde.strip().strip('"').strip("'"))


_laad_env_bestand()


def env(naam, standaard=""):
    return os.environ.get(naam, standaard).strip()


OP_VERCEL = bool(env("VERCEL"))
LOKAAL = not OP_VERCEL


def lees_data(naam):
    return json.loads((DATA / naam).read_text(encoding="utf-8"))


WINKEL = lees_data("winkel.json")
# Is kozijnhorren.nl open voor klanten? Eén schakelaar: "live" in winkel.json. Zolang hij
# uit staat, draait de winkel op kozijnhorren.vercel.app en gebruikt alleen Max hem: iwrap.nl
# noemt hem nog niet, en de links in de mails gaan naar het Vercel-adres. Zet hem aan als het domein werkt, en bouw beide sites opnieuw.
WINKEL_LIVE = bool(WINKEL.get("live"))
WINKEL_VERCEL = "https://kozijnhorren.vercel.app"

# Waar de twee sites staan. Lokaal draait iwrap.nl op 8010 en kozijnhorren.nl op 8020.
# Op een Vercel-testadres (preview) wijzen links naar dat testadres zelf, en naar het
# testadres van dezelfde branch in het project "kozijnhorren". Zo klikt een mail op een
# testadres niet door naar de echte site.
_PREVIEW = OP_VERCEL and env("VERCEL_ENV") == "preview" and env("VERCEL_BRANCH_URL")
_IWRAP_STANDAARD = ("https://" + env("VERCEL_BRANCH_URL")) if _PREVIEW else \
    "https://iwrap.nl" if OP_VERCEL else "http://localhost:8010"
_SHOP_STANDAARD = _IWRAP_STANDAARD.replace("://iwrap-website-", "://kozijnhorren-", 1) if _PREVIEW else \
    (("https://" + WINKEL["domein"]) if WINKEL_LIVE else WINKEL_VERCEL) if OP_VERCEL else "http://localhost:8020"
IWRAP_URL = env("IWRAP_URL", _IWRAP_STANDAARD).rstrip("/")
SHOP_URL = env("SHOP_URL", _SHOP_STANDAARD).rstrip("/")
API_URL = IWRAP_URL + "/api"

# Welke andere sites de API mogen aanroepen vanuit de browser (de winkel).
TOEGESTANE_ORIGINS = {
    o.strip().rstrip("/")
    for o in env("TOEGESTANE_ORIGINS", "").split(",")
    if o.strip()
} | {SHOP_URL, SHOP_URL.replace("://", "://www."), IWRAP_URL}
if OP_VERCEL:
    # Het Vercel-adres van de winkel blijft ook na de livegang werken.
    TOEGESTANE_ORIGINS.add(WINKEL_VERCEL)
if LOKAAL:
    TOEGESTANE_ORIGINS |= {"http://localhost:8020", "http://127.0.0.1:8020",
                           "http://localhost:8010", "http://127.0.0.1:8010"}

# Max-modus. Zonder wachtwoord kan er op Vercel niemand inloggen -- dat is
# bewust: liever dicht dan open. Lokaal is het wachtwoord "test".
MAX_WACHTWOORD = env("MAX_WACHTWOORD", "test" if LOKAAL else "")
GEHEIM = env("GEHEIM", "alleen-lokaal-niet-geheim" if LOKAAL else "")

# Betalen. Een sleutel die met test_ begint is Mollie's testmodus.
MOLLIE_API_KEY = env("MOLLIE_API_KEY")

# Mail, rechtstreeks via Microsoft 365 (zie mail.py en de README). Zonder deze
# drie komt alles in .data/uitbak/ terecht.
MS_TENANT_ID = env("MS_TENANT_ID")
MS_CLIENT_ID = env("MS_CLIENT_ID")
MS_CLIENT_SECRET = env("MS_CLIENT_SECRET")
# De mailbox waaruit verstuurd wordt. Alles wat de site mailt komt hier vandaan
# en staat daarna in de verzonden items van deze mailbox.
MAIL_AFZENDER = env("MAIL_AFZENDER", "info@iwrap.nl")

MAX_EMAIL = env("MAX_EMAIL", "info@iwrap.nl")

# Leverancier. Zolang er geen leverancier gekozen is, gaat de "bestelmail voor
# de leverancier" naar Max zelf -- die kan hem dan doorsturen of overtikken.
LEVERANCIER_NAAM = env("LEVERANCIER_NAAM", "nog te kiezen leverancier")
LEVERANCIER_EMAIL = env("LEVERANCIER_EMAIL", MAX_EMAIL)
# "ja": betaalde bestellingen gaan direct door. "nee": Max drukt in de
# Max-modus op "Naar leverancier". Begin met nee tot de eerste twintig goed gaan.
LEVERANCIER_AUTOMATISCH = env("LEVERANCIER_AUTOMATISCH", "nee").lower() in ("ja", "1", "true", "yes")

# Codes. Wie bij de klant meet, geeft hem een code, of een link met de code erin
# (kozijnhorren.nl/?code=MAX). De klant krijgt er een kleine korting mee (zie horren.json,
# "partnercode"), en wij zien bij elke bestelling via wie hij kwam. De code van iWrap zelf
# (IWRAP_CODE, standaard MAX) werkt altijd, zonder instellingen. Andere vakmensen komen
# later in PARTNERCODES, bijvoorbeeld "BOT=Bot Ramen en Deuren;JANSEN=Schilder Jansen".
# Lokaal werkt daarnaast de code TEST.
def _partnercodes(tekst):
    uit = {}
    for deel in tekst.split(";"):
        code, _, naam = deel.partition("=")
        code = code.strip().upper()
        if re.fullmatch(r"[A-Z0-9]{2,20}", code) and naam.strip():
            uit[code] = naam.strip()[:60]
    return uit


IWRAP_CODE = env("IWRAP_CODE", "MAX").upper()
if not re.fullmatch(r"[A-Z0-9]{2,20}", IWRAP_CODE):
    IWRAP_CODE = "MAX"
PARTNERCODES = {IWRAP_CODE: "iWrap",
                **_partnercodes(env("PARTNERCODES", "TEST=Testpartner" if LOKAAL else ""))}

CRON_SECRET = env("CRON_SECRET")

# Opslag: Upstash Redis via de Vercel Marketplace. Beide namen komen voor.
REDIS_URL = env("KV_REST_API_URL") or env("UPSTASH_REDIS_REST_URL")
REDIS_TOKEN = env("KV_REST_API_TOKEN") or env("UPSTASH_REDIS_REST_TOKEN")
DATA_MAP = Path(env("DATA_MAP", str(ROOT / ".data")))

# Termijnen voor de automatische mails.
HERINNERING_NA_DAGEN = int(env("HERINNERING_NA_DAGEN", "7"))
PAST_ALLES_NA_DAGEN = int(env("PAST_ALLES_NA_DAGEN", "5"))

# Google-reviews. Met deze sleutel lopen cijfer, aantal en reviews op alle sites
# vanzelf mee (zie reviews.py en de README). Zonder: de stand van de laatste build.
GOOGLE_PLACES_API_KEY = env("GOOGLE_PLACES_API_KEY")


def status():
    """Wat is er gekoppeld? De Max-modus laat dit zien, zodat Max niet hoeft te
    raden waarom er geen mail aankomt."""
    return {
        "omgeving": "vercel" if OP_VERCEL else "lokaal",
        "opslag": "redis" if REDIS_URL else "bestanden",
        "betalen": ("mollie-test" if MOLLIE_API_KEY.startswith("test_")
                    else "mollie-live" if MOLLIE_API_KEY else "testkassa"),
        "mail": "microsoft" if (MS_TENANT_ID and MS_CLIENT_ID and MS_CLIENT_SECRET) else "uitbak",
        "reviews": "google" if GOOGLE_PLACES_API_KEY else "vast",
        "leverancier": LEVERANCIER_NAAM,
        "leverancier_automatisch": LEVERANCIER_AUTOMATISCH,
        "eigen_code": IWRAP_CODE,
        "partnercodes": len(PARTNERCODES) - 1,  # andere vakmensen dan iWrap zelf
        "voorbeeldprijzen": lees_data("horren.json").get("voorbeeldprijzen", True),
        "shop_url": SHOP_URL,
        "winkel_live": WINKEL_LIVE,
    }
