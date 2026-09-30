"""Alle instellingen op één plek.

Geheimen (wachtwoord, Mollie-sleutel, mail-webhook) komen uit omgevings-
variabelen: in Vercel onder Settings > Environment Variables, lokaal uit een
bestand .env in de repo-root (staat in .gitignore). Deze repo is openbaar,
dus er staat hier nooit een echte sleutel in.
"""

import json
import os
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

# Waar de twee sites staan. Lokaal draait iwrap.nl op 8010 en kozijnhorren.nl op 8020.
# Op een Vercel-testadres (preview) wijzen links naar dat testadres zelf, en naar het
# testadres van dezelfde branch in het project "kozijnhorren". Zo klikt een rapport op
# een testadres niet door naar de echte site.
_PREVIEW = OP_VERCEL and env("VERCEL_ENV") == "preview" and env("VERCEL_BRANCH_URL")
_IWRAP_STANDAARD = ("https://" + env("VERCEL_BRANCH_URL")) if _PREVIEW else \
    "https://www.iwrap.nl" if OP_VERCEL else "http://localhost:8010"
_SHOP_STANDAARD = _IWRAP_STANDAARD.replace("://iwrap-website-", "://kozijnhorren-", 1) if _PREVIEW else \
    "https://kozijnhorren.nl" if OP_VERCEL else "http://localhost:8020"
IWRAP_URL = env("IWRAP_URL", _IWRAP_STANDAARD).rstrip("/")
SHOP_URL = env("SHOP_URL", _SHOP_STANDAARD).rstrip("/")
API_URL = IWRAP_URL + "/api"

# Welke andere sites de API mogen aanroepen vanuit de browser (de winkel).
TOEGESTANE_ORIGINS = {
    o.strip().rstrip("/")
    for o in env("TOEGESTANE_ORIGINS", "").split(",")
    if o.strip()
} | {SHOP_URL, SHOP_URL.replace("://", "://www."), IWRAP_URL}
if LOKAAL:
    TOEGESTANE_ORIGINS |= {"http://localhost:8020", "http://127.0.0.1:8020",
                           "http://localhost:8010", "http://127.0.0.1:8010"}

# Max-modus. Zonder wachtwoord kan er op Vercel niemand inloggen -- dat is
# bewust: liever dicht dan open. Lokaal is het wachtwoord "test".
MAX_WACHTWOORD = env("MAX_WACHTWOORD", "test" if LOKAAL else "")
GEHEIM = env("GEHEIM", "alleen-lokaal-niet-geheim" if LOKAAL else "")

# Betalen. Een sleutel die met test_ begint is Mollie's testmodus.
MOLLIE_API_KEY = env("MOLLIE_API_KEY")

# Mail. Eén van de twee invullen; zonder komt alles in .data/uitbak/ terecht.
MAIL_WEBHOOK_URL = env("MAIL_WEBHOOK_URL")   # Make-scenario dat via Outlook verstuurt
RESEND_API_KEY = env("RESEND_API_KEY")
MAIL_VAN = env("MAIL_VAN", "iWrap <info@iwrap.nl>")

MAX_EMAIL = env("MAX_EMAIL", "info@iwrap.nl")

# Leverancier. Zolang er geen leverancier gekozen is, gaat de "bestelmail voor
# de leverancier" naar Max zelf -- die kan hem dan doorsturen of overtikken.
LEVERANCIER_NAAM = env("LEVERANCIER_NAAM", "nog te kiezen leverancier")
LEVERANCIER_EMAIL = env("LEVERANCIER_EMAIL", MAX_EMAIL)
# "ja": betaalde bestellingen gaan direct door. "nee": Max drukt in de
# Max-modus op "Naar leverancier". Begin met nee tot de eerste twintig goed gaan.
LEVERANCIER_AUTOMATISCH = env("LEVERANCIER_AUTOMATISCH", "nee").lower() in ("ja", "1", "true", "yes")

CRON_SECRET = env("CRON_SECRET")

# Opslag: Upstash Redis via de Vercel Marketplace. Beide namen komen voor.
REDIS_URL = env("KV_REST_API_URL") or env("UPSTASH_REDIS_REST_URL")
REDIS_TOKEN = env("KV_REST_API_TOKEN") or env("UPSTASH_REDIS_REST_TOKEN")
DATA_MAP = Path(env("DATA_MAP", str(ROOT / ".data")))

# Termijnen voor de automatische mails.
HERINNERING_NA_DAGEN = int(env("HERINNERING_NA_DAGEN", "7"))
PAST_ALLES_NA_DAGEN = int(env("PAST_ALLES_NA_DAGEN", "5"))

# De Google-reviewlink van iWrap (dezelfde als in build.py).
IWRAP_REVIEWS_URL = env("IWRAP_REVIEWS_URL", "https://maps.app.goo.gl/C77mS69nK3GGyqz9A?g_st=ic")
IWRAP_WHATSAPP = env("IWRAP_WHATSAPP", "31614415877")


def lees_data(naam):
    return json.loads((DATA / naam).read_text(encoding="utf-8"))


WINKEL = lees_data("winkel.json")


def status():
    """Wat is er gekoppeld? De Max-modus laat dit zien, zodat Max niet hoeft te
    raden waarom er geen mail aankomt."""
    return {
        "omgeving": "vercel" if OP_VERCEL else "lokaal",
        "opslag": "redis" if REDIS_URL else "bestanden",
        "betalen": ("mollie-test" if MOLLIE_API_KEY.startswith("test_")
                    else "mollie-live" if MOLLIE_API_KEY else "testkassa"),
        "mail": "make" if MAIL_WEBHOOK_URL else "resend" if RESEND_API_KEY else "uitbak",
        "leverancier": LEVERANCIER_NAAM,
        "leverancier_automatisch": LEVERANCIER_AUTOMATISCH,
        "voorbeeldprijzen": lees_data("horren.json").get("voorbeeldprijzen", True),
        "shop_url": SHOP_URL,
    }
