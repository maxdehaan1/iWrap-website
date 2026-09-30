"""Mail versturen. Drie routes, in deze volgorde:

1. MAIL_WEBHOOK_URL  -- een Make-scenario (webhook > Microsoft 365 "Send an
   email"). Dan komen de mails uit je eigen Outlook, met je eigen handtekening
   in de verzonden items. Zie README, kop "Mail via Make".
2. RESEND_API_KEY    -- Resend, als je liever een aparte afzender hebt.
3. Niets ingevuld    -- de mail wordt als HTML-bestand in .data/uitbak/
   gezet. Handig om lokaal te zien wat een klant zou krijgen.

De teksten zelf staan in mails.py.
"""

import datetime as dt
import json
import re
import urllib.request

from . import instellingen as cfg


def verstuur(aan, onderwerp, html, tekst, antwoord_aan=None, soort=""):
    """Terug: True als de mail de deur uit is (of in de uitbak ligt)."""
    if not aan:
        return False
    bericht = {
        "aan": aan,
        "onderwerp": onderwerp,
        "html": html,
        "tekst": tekst,
        "antwoord_aan": antwoord_aan or cfg.MAX_EMAIL,
        "soort": soort,
    }
    if cfg.MAIL_WEBHOOK_URL:
        return _post(cfg.MAIL_WEBHOOK_URL, bericht, {})
    if cfg.RESEND_API_KEY:
        return _post("https://api.resend.com/emails", {
            "from": cfg.MAIL_VAN,
            "to": [aan],
            "subject": onderwerp,
            "html": html,
            "text": tekst,
            "reply_to": bericht["antwoord_aan"],
        }, {"Authorization": "Bearer " + cfg.RESEND_API_KEY})
    return _uitbak(bericht)


def _post(url, data, koppen):
    req = urllib.request.Request(
        url, data=json.dumps(data).encode("utf-8"),
        headers=dict({"Content-Type": "application/json"}, **koppen), method="POST",
    )
    try:
        with urllib.request.urlopen(req, timeout=15) as r:
            return 200 <= r.status < 300
    except Exception as e:
        print("mail niet verstuurd:", e)
        return False


def _uitbak(bericht):
    map_ = cfg.DATA_MAP / "uitbak"
    try:
        map_.mkdir(parents=True, exist_ok=True)
    except OSError:
        return False
    stempel = dt.datetime.now().strftime("%Y%m%d-%H%M%S-%f")
    naam = re.sub(r"[^a-z0-9]+", "-", (bericht["soort"] or bericht["onderwerp"]).lower()).strip("-")
    kop = ("<div style='font:13px/1.5 monospace;background:#fffbe6;border-bottom:1px solid #e6d98a;"
           "padding:10px 14px'>Aan: %s<br>Onderwerp: %s<br>Antwoord naar: %s</div>"
           % (bericht["aan"], bericht["onderwerp"], bericht["antwoord_aan"]))
    (map_ / ("%s-%s.html" % (stempel, naam))).write_text(kop + bericht["html"], encoding="utf-8")
    print("mail in de uitbak: %s -> %s" % (bericht["onderwerp"], bericht["aan"]))
    return True
