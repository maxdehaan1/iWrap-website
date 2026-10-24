"""Mail versturen. Twee routes, in deze volgorde:

1. Microsoft 365 (Graph) -- rechtstreeks vanuit de mailbox info@iwrap.nl. De
   mail staat daarna gewoon in je verzonden items, en wat naar jezelf gaat
   (een offerteaanvraag) komt in je eigen inbox binnen, met de foto's als
   echte bijlagen. Nodig: MS_TENANT_ID, MS_CLIENT_ID en MS_CLIENT_SECRET.
   Zie README, kop "Mail via Microsoft 365".
2. Niets ingevuld -- de mail wordt als HTML-bestand in .data/uitbak/ gezet,
   met de bijlagen in een map ernaast. Zo zie je lokaal precies wat er
   verstuurd zou worden.

Er zit bewust geen tussendienst (Make, Resend) tussen: dat is een abonnement
en een plek meer waar het mis kan gaan.

De teksten zelf staan in mails.py.
"""

import base64
import datetime as dt
import json
import re
import time
import urllib.error
import urllib.parse
import urllib.request
from html import escape

from . import instellingen as cfg

GRAPH = "https://graph.microsoft.com/v1.0"


def gekoppeld():
    return bool(cfg.MS_TENANT_ID and cfg.MS_CLIENT_ID and cfg.MS_CLIENT_SECRET)


def verstuur(aan, onderwerp, html, tekst, antwoord_aan=None, soort="", bijlagen=None):
    """Terug: True als de mail de deur uit is (of in de uitbak ligt).

    bijlagen: lijst van (bestandsnaam, mime-type, bytes).
    """
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
    if gekoppeld():
        return _microsoft(bericht, bijlagen or [])
    return _uitbak(bericht, bijlagen or [])


# ---------------------------------------------------------------------------
# Microsoft 365
# ---------------------------------------------------------------------------

_token = {"waarde": "", "tot": 0.0}


def _graph_token():
    """Een toegangssleutel voor de app; Microsoft geeft hem voor een uur."""
    if _token["waarde"] and _token["tot"] > time.time() + 120:
        return _token["waarde"]
    data = urllib.parse.urlencode({
        "client_id": cfg.MS_CLIENT_ID,
        "client_secret": cfg.MS_CLIENT_SECRET,
        "scope": "https://graph.microsoft.com/.default",
        "grant_type": "client_credentials",
    }).encode("utf-8")
    url = "https://login.microsoftonline.com/%s/oauth2/v2.0/token" % urllib.parse.quote(cfg.MS_TENANT_ID)
    with urllib.request.urlopen(urllib.request.Request(url, data=data, method="POST"), timeout=15) as r:
        antwoord = json.loads(r.read().decode("utf-8"))
    _token["waarde"] = antwoord["access_token"]
    _token["tot"] = time.time() + int(antwoord.get("expires_in", 3600))
    return _token["waarde"]


def _graph(methode, pad, data=None):
    req = urllib.request.Request(
        GRAPH + pad,
        data=json.dumps(data).encode("utf-8") if data is not None else b"",
        headers={"Authorization": "Bearer " + _graph_token(), "Content-Type": "application/json"},
        method=methode,
    )
    with urllib.request.urlopen(req, timeout=30) as r:
        inhoud = r.read()
    return json.loads(inhoud.decode("utf-8")) if inhoud else {}


def _microsoft(b, bijlagen):
    mailbox = "/users/" + urllib.parse.quote(cfg.MAIL_AFZENDER)
    bericht = {
        "subject": b["onderwerp"],
        "body": {"contentType": "HTML", "content": b["html"]},
        "toRecipients": [{"emailAddress": {"address": b["aan"]}}],
        "replyTo": [{"emailAddress": {"address": b["antwoord_aan"]}}],
    }
    try:
        if not bijlagen:
            _graph("POST", mailbox + "/sendMail", {"message": bericht, "saveToSentItems": True})
            return True
        # Met bijlagen in drie stappen: concept maken, bijlagen er één voor één
        # aan hangen, versturen. Alles in één verzoek mag van Microsoft maar tot
        # 4 MB, en een aanvraag met tien foto's komt daar overheen.
        concept = _graph("POST", mailbox + "/messages", bericht)
        pad = mailbox + "/messages/" + urllib.parse.quote(concept["id"], safe="")
        for naam, soort, inhoud in bijlagen:
            _graph("POST", pad + "/attachments", {
                "@odata.type": "#microsoft.graph.fileAttachment",
                "name": naam,
                "contentType": soort,
                "contentBytes": base64.b64encode(inhoud).decode("ascii"),
            })
        _graph("POST", pad + "/send")
        return True
    except urllib.error.HTTPError as e:
        print("mail niet verstuurd (%s): %s" % (e.code, e.read()[:500]))
    except Exception as e:
        print("mail niet verstuurd:", e)
    return False


# ---------------------------------------------------------------------------
# Uitbak (lokaal, of zolang er niets gekoppeld is)
# ---------------------------------------------------------------------------

def _uitbak(b, bijlagen):
    map_ = cfg.DATA_MAP / "uitbak"
    try:
        map_.mkdir(parents=True, exist_ok=True)
    except OSError:
        return False
    stempel = dt.datetime.now().strftime("%Y%m%d-%H%M%S-%f")
    naam = re.sub(r"[^a-z0-9]+", "-", (b["soort"] or b["onderwerp"]).lower()).strip("-")
    lijst = ""
    if bijlagen:
        # De bijlagen in een map naast de mail, en in de kop van de mail een
        # link naar elk bestand -- dan kun je ze lokaal gewoon aanklikken.
        bijlagenmap = map_ / ("%s-%s-bijlagen" % (stempel, naam))
        bijlagenmap.mkdir()
        links = []
        for bestand, _, inhoud in bijlagen:
            (bijlagenmap / bestand).write_bytes(inhoud)
            links.append("<a href='%s/%s'>%s</a> (%d kB)" % (
                escape(bijlagenmap.name, True), escape(bestand, True), escape(bestand), len(inhoud) // 1024))
        lijst = "<br>Bijlagen: " + ", ".join(links)
    kop = ("<div style='font:13px/1.5 monospace;background:#fffbe6;border-bottom:1px solid #e6d98a;"
           "padding:10px 14px'>Aan: %s<br>Onderwerp: %s<br>Antwoord naar: %s%s</div>"
           % (escape(b["aan"]), escape(b["onderwerp"]), escape(b["antwoord_aan"]), lijst))
    (map_ / ("%s-%s.html" % (stempel, naam))).write_text(kop + b["html"], encoding="utf-8")
    print("mail in de uitbak: %s -> %s%s" % (b["onderwerp"], b["aan"],
                                              " (+%d bijlagen)" % len(bijlagen) if bijlagen else ""))
    return True
