"""Inloggen voor de Max-modus: één wachtwoord, een ondertekend token terug.

Het token is geen sessie op de server maar een ondertekend briefje met een
vervaldatum (HMAC met GEHEIM). Verander je GEHEIM, dan is iedereen uitgelogd.
"""

import base64
import hashlib
import hmac
import json
import secrets
import time

from . import instellingen as cfg

GELDIG_DAGEN = 120

# Leesbare id's: geen 0/o, 1/l/i. Tien tekens is ruim 10^14 mogelijkheden.
LETTERS = "23456789abcdefghjkmnpqrstuvwxyz"


def nieuwe_id(lengte=10):
    return "".join(secrets.choice(LETTERS) for _ in range(lengte))


def _b64(data):
    return base64.urlsafe_b64encode(data).decode("ascii").rstrip("=")


def _ondertekening(tekst):
    return _b64(hmac.new(cfg.GEHEIM.encode("utf-8"), tekst.encode("utf-8"), hashlib.sha256).digest())


def maak_token():
    inhoud = _b64(json.dumps({"exp": int(time.time()) + GELDIG_DAGEN * 86400}).encode("utf-8"))
    return inhoud + "." + _ondertekening(inhoud)


def token_geldig(token):
    if not cfg.GEHEIM or not token or "." not in token:
        return False
    inhoud, handtekening = token.rsplit(".", 1)
    if not hmac.compare_digest(handtekening, _ondertekening(inhoud)):
        return False
    try:
        vulling = "=" * (-len(inhoud) % 4)
        data = json.loads(base64.urlsafe_b64decode(inhoud + vulling))
    except Exception:
        return False
    return data.get("exp", 0) > time.time()


def wachtwoord_klopt(invoer):
    if not cfg.MAX_WACHTWOORD or not cfg.GEHEIM:
        return False
    return hmac.compare_digest((invoer or "").encode("utf-8"), cfg.MAX_WACHTWOORD.encode("utf-8"))
