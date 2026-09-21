#!/usr/bin/env python3
"""
Ververst reviews.json met de actuele Google-reviews van iWrap.

Zonder API-sleutel doet dit script niets: dan blijft reviews.json staan zoals
het is en bouwt de site gewoon door met de laatst opgehaalde reviews. Dat is
expres — een build mag nooit stukgaan omdat Google even niet bereikbaar is.

Sleutel aanmaken:
  1. console.cloud.google.com -> nieuw project -> Places API (New) aanzetten
  2. Credentials -> API key. Beperk hem tot de Places API.
  3. Zet hem in je omgeving, NIET in de repo (die is openbaar):
         export GOOGLE_PLACES_API_KEY="AIza..."
     Handig: die regel onderaan in ~/.zshrc zetten.

Gebruik:  python3 reviews.py     (en daarna python3 build.py)
"""

import json
import os
import sys
import urllib.error
import urllib.parse
import urllib.request
from datetime import date
from pathlib import Path

ROOT = Path(__file__).parent
CACHE = ROOT / "reviews.json"
SLEUTEL = os.environ.get("GOOGLE_PLACES_API_KEY", "").strip()

# Waar we naar zoeken als de Place ID nog niet bekend is.
ZOEKTERM = "iWrap Neuweg 128 Hilversum"
MAX_REVIEWS = 6


def api(url, headers, data=None):
    verzoek = urllib.request.Request(url, data=data, headers=headers)
    with urllib.request.urlopen(verzoek, timeout=20) as r:
        return json.loads(r.read())


def zoek_place_id():
    """Place ID opzoeken op naam en adres, zodat hij nergens hardgecodeerd staat."""
    body = json.dumps({"textQuery": ZOEKTERM}).encode()
    uit = api(
        "https://places.googleapis.com/v1/places:searchText",
        {
            "Content-Type": "application/json",
            "X-Goog-Api-Key": SLEUTEL,
            "X-Goog-FieldMask": "places.id,places.displayName,places.formattedAddress",
        },
        body,
    )
    plaatsen = uit.get("places") or []
    if not plaatsen:
        raise SystemExit("Geen plaats gevonden voor: " + ZOEKTERM)
    p = plaatsen[0]
    print(f"gevonden: {p['displayName']['text']} — {p.get('formattedAddress','')}")
    return p["id"]


def haal_details(place_id):
    return api(
        f"https://places.googleapis.com/v1/places/{place_id}"
        "?languageCode=nl&fields=rating,userRatingCount,reviews",
        {"X-Goog-Api-Key": SLEUTEL},
    )


def main():
    huidig = json.loads(CACHE.read_text(encoding="utf-8"))

    if not SLEUTEL:
        print("Geen GOOGLE_PLACES_API_KEY gevonden — reviews.json blijft ongewijzigd.")
        print(f"(nu: {huidig['score']} uit {huidig['aantal']}, "
              f"bijgewerkt {huidig['bijgewerkt']})")
        print("Zie de uitleg bovenin dit bestand om het verversen aan te zetten.")
        return 0

    try:
        details = haal_details(zoek_place_id())
    except (urllib.error.URLError, urllib.error.HTTPError, KeyError) as e:
        print(f"Ophalen mislukt ({e}). reviews.json blijft staan.", file=sys.stderr)
        return 1

    nieuw = dict(huidig)
    nieuw["score"] = round(float(details.get("rating", huidig["score"])), 1)
    nieuw["aantal"] = int(details.get("userRatingCount", huidig["aantal"]))
    nieuw["bijgewerkt"] = date.today().isoformat()

    opgehaald = []
    for r in (details.get("reviews") or [])[:MAX_REVIEWS]:
        tekst = (r.get("originalText") or r.get("text") or {}).get("text", "").strip()
        naam = (r.get("authorAttribution") or {}).get("displayName", "").strip()
        if not tekst or not naam:
            continue
        # Alleen positieve reviews op de site; de score zelf vertelt het hele verhaal.
        if r.get("rating", 5) < 4:
            continue
        opgehaald.append({
            "naam": naam,
            "wanneer": r.get("relativePublishTimeDescription", ""),
            "tekst": " ".join(tekst.split()),
        })
    if opgehaald:
        nieuw["reviews"] = opgehaald

    CACHE.write_text(json.dumps(nieuw, ensure_ascii=False, indent=2) + "\n",
                     encoding="utf-8")
    print(f"bijgewerkt: {nieuw['score']} uit {nieuw['aantal']} reviews, "
          f"{len(nieuw['reviews'])} teksten")
    print("Draai nu python3 build.py om ze op de site te zetten.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
