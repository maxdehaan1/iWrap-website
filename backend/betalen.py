"""Betalen via Mollie (iDEAL en wat je verder in het Mollie-dashboard aanzet).

Zonder MOLLIE_API_KEY draait er lokaal een testkassa: een pagina met twee
knoppen, "betaald" en "mislukt", die precies doet wat Mollie's webhook zou doen.
Zo is de hele bestelstroom te testen zonder account.
"""

import json
import urllib.error
import urllib.request

from . import instellingen as cfg

MOLLIE = "https://api.mollie.com/v2"


class BetaalFout(Exception):
    pass


def modus():
    if cfg.MOLLIE_API_KEY.startswith("test_"):
        return "test"
    if cfg.MOLLIE_API_KEY.startswith("live_"):
        return "live"
    return "testkassa"


def _mollie(methode, pad, data=None):
    req = urllib.request.Request(
        MOLLIE + pad,
        data=json.dumps(data).encode("utf-8") if data is not None else None,
        headers={"Authorization": "Bearer " + cfg.MOLLIE_API_KEY,
                 "Content-Type": "application/json"},
        method=methode,
    )
    try:
        with urllib.request.urlopen(req, timeout=15) as r:
            return json.loads(r.read().decode("utf-8"))
    except urllib.error.HTTPError as e:
        try:
            detail = json.loads(e.read().decode("utf-8")).get("detail", "")
        except Exception:
            detail = ""
        raise BetaalFout("Mollie weigerde de betaling (%s) %s" % (e.code, detail))
    except Exception as e:
        raise BetaalFout("Mollie is niet bereikbaar: %s" % e)


def maak_betaling(bestelling, voorbeeldprijzen):
    """Terug: (betaling_id, url waar de klant naartoe moet)."""
    terug = "%s/bestelling?nr=%s&t=%s" % (cfg.SHOP_URL, bestelling["nr"], bestelling["token"])

    if modus() == "testkassa":
        if cfg.OP_VERCEL and cfg.env("VERCEL_ENV") == "production":
            raise BetaalFout("Betalen is nog niet gekoppeld (MOLLIE_API_KEY ontbreekt).")
        return ("test_" + bestelling["nr"],
                "%s/horren/testkassa/%s?t=%s" % (cfg.API_URL, bestelling["nr"], bestelling["token"]))

    if modus() == "live" and voorbeeldprijzen:
        # Een echte betaling op een verzonnen prijs is het laatste wat je wilt.
        raise BetaalFout("De winkel rekent nog met voorbeeldprijzen. Zet eerst de echte prijslijst "
                         "in backend/data/horren.json en daarna voorbeeldprijzen op false.")

    data = {
        "amount": {"currency": "EUR", "value": "%.2f" % bestelling["totaal"]},
        "description": "%s bestelling %s" % (cfg.WINKEL["naam"], bestelling["nr"]),
        "redirectUrl": terug,
        "metadata": {"bestelling": bestelling["nr"]},
        "locale": "nl_NL",
    }
    # Mollie moet de webhook kunnen bereiken; localhost kan dat niet. Lokaal
    # vraagt de bedankpagina de status zelf op.
    if not cfg.API_URL.startswith("http://localhost") and not cfg.API_URL.startswith("http://127."):
        data["webhookUrl"] = cfg.API_URL + "/horren/betaling-webhook"
    antwoord = _mollie("POST", "/payments", data)
    return antwoord["id"], antwoord["_links"]["checkout"]["href"]


def haal_status(betaling_id):
    """'paid', 'open', 'pending', 'failed', 'canceled' of 'expired', plus de methode."""
    if betaling_id.startswith("test_") and modus() == "testkassa":
        return None  # testkassa zet de status zelf
    antwoord = _mollie("GET", "/payments/" + betaling_id)
    return {"status": antwoord.get("status"), "methode": antwoord.get("method"),
            "betaald_op": antwoord.get("paidAt")}
