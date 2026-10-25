"""De Google-reviews van iWrap: cijfer, aantal en een handvol goede reviews.

Alle sites lezen hieruit via GET /api/reviews: iwrap.nl zelf, kozijnwrap.nl,
houtnerffolie.nl en kozijnhorren.nl. Staat GOOGLE_PLACES_API_KEY in Vercel, dan
komt alles rechtstreeks van Google en loopt het vanzelf mee met elke nieuwe
review. Zonder sleutel geeft dit reviews.json terug: de stand van de laatste build.

Google wordt hooguit een paar keer per dag gevraagd. Een opgehaalde stand blijft
zes uur goed, in de opslag en in Vercels eigen cache. Dat is zo'n honderd
aanvragen per maand, ruim binnen wat Google gratis laat doen.
"""

import json
import time
import urllib.error
import urllib.request
from datetime import date

from . import instellingen as cfg
from .opslag import Fout, opslag

BESTAND = cfg.ROOT / "reviews.json"
VERS = 6 * 3600
SLEUTEL = "reviews:google"
MAX_KAARTEN = 8
MIN_TEKST = 40     # "Top!" zegt een bezoeker weinig; die laten we op Google

_geheugen = {"t": 0, "d": None}


def basis():
    return json.loads(BESTAND.read_text(encoding="utf-8"))


def links(place_id):
    """Naar alle reviews, en naar het venster om er zelf een te schrijven."""
    return ("https://search.google.com/local/reviews?placeid=" + place_id,
            "https://search.google.com/local/writereview?placeid=" + place_id)


def van_google(sleutel, place_id):
    """Eén aanvraag bij Google (Places API, New). Google stuurt hooguit vijf
    reviews mee; daarvan houden we de goede met een echte tekst."""
    verzoek = urllib.request.Request(
        "https://places.googleapis.com/v1/places/%s?languageCode=nl" % place_id,
        headers={"X-Goog-Api-Key": sleutel,
                 "X-Goog-FieldMask": "rating,userRatingCount,reviews"})
    with urllib.request.urlopen(verzoek, timeout=8) as r:
        d = json.loads(r.read())
    kaarten = []
    for r in d.get("reviews") or []:
        tekst = ((r.get("originalText") or r.get("text") or {}).get("text") or "").strip()
        naam = ((r.get("authorAttribution") or {}).get("displayName") or "").strip()
        sterren = int(r.get("rating") or 0)
        if not naam or sterren < 4 or len(tekst) < MIN_TEKST:
            continue
        kaarten.append({
            "naam": naam,
            "tekst": " ".join(tekst.split()),
            "sterren": sterren,
            "wanneer": r.get("relativePublishTimeDescription", ""),
            "datum": (r.get("publishTime") or "")[:10],
            "url": r.get("googleMapsUri", ""),
        })
    kaarten.sort(key=lambda k: k["datum"], reverse=True)
    return {"score": round(float(d["rating"]), 1), "aantal": int(d["userRatingCount"]),
            "reviews": kaarten}


def samenvoegen(b, google=None, opgehaald=None):
    """Wat Google net stuurde bovenaan, aangevuld met de reviews uit reviews.json
    die er nog niet tussen staan."""
    lees, schrijf = links(b["place_id"])
    kaarten = [dict(r) for r in (google or {}).get("reviews") or []]
    namen = {r["naam"].lower() for r in kaarten}
    kaarten += [dict(r) for r in b["reviews"] if r["naam"].lower() not in namen]
    for r in kaarten:
        r.setdefault("sterren", 5)
        r.setdefault("wanneer", "")
        r.setdefault("datum", "")
        r["url"] = r.get("url") or lees
    bron = google or b
    return {
        "score": bron["score"],
        "score_tekst": str(bron["score"]).replace(".", ","),
        "aantal": bron["aantal"],
        "bron": "google" if google else "reviews.json",
        "bijgewerkt": date.fromtimestamp(opgehaald).isoformat() if opgehaald else b["bijgewerkt"],
        "url": lees,
        "schrijf_url": schrijf,
        "reviews": kaarten[:MAX_KAARTEN],
    }


def stand():
    """(gegevens, vers). Vers is False als Google even niet bereikbaar was; dan
    hoort het antwoord maar kort in de cache te blijven."""
    b = basis()
    if not cfg.GOOGLE_PLACES_API_KEY:
        return samenvoegen(b), True
    nu = time.time()
    if _geheugen["d"] and nu - _geheugen["t"] < VERS:
        return samenvoegen(b, _geheugen["d"], _geheugen["t"]), True
    bewaard = None
    try:
        bewaard = opslag().get(SLEUTEL)
    except Fout:
        pass
    if bewaard and nu - bewaard.get("t", 0) < VERS:
        _geheugen.update(t=bewaard["t"], d=bewaard["d"])
        return samenvoegen(b, bewaard["d"], bewaard["t"]), True
    try:
        g = van_google(cfg.GOOGLE_PLACES_API_KEY, b["place_id"])
    except (urllib.error.URLError, OSError, ValueError, KeyError, TypeError) as e:
        print("reviews: Google niet bereikbaar:", e)
        oud = bewaard or ({"t": _geheugen["t"], "d": _geheugen["d"]} if _geheugen["d"] else None)
        return (samenvoegen(b, oud["d"], oud["t"]) if oud else samenvoegen(b)), False
    _geheugen.update(t=nu, d=g)
    try:
        opslag().put(SLEUTEL, {"t": nu, "d": g}, ttl=7 * 86400)
    except Fout:
        pass
    return samenvoegen(b, g, nu), True
