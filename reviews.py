#!/usr/bin/env python3
"""
Ververst reviews.json: het Google-cijfer, het aantal en de nieuwste goede reviews.

build.py draait dit zelf aan het begin, dus los hoeft het bijna nooit. Wat er
in reviews.json staat, komt in de html van de site (ook voor Google zelf, in de
structured data). Bezoekers zien daarbovenop de live stand via /api/reviews.

Waar het de stand vandaan haalt, de eerste die werkt:
  1. Rechtstreeks van Google, als GOOGLE_PLACES_API_KEY lokaal in je omgeving
     of in .env staat.
  2. Van de live site (/api/reviews), die de sleutel in Vercel heeft. Zo hoeft
     de sleutel maar op één plek te staan.
Lukt geen van beide, of heeft de live site zelf nog geen sleutel, dan blijft
reviews.json zoals hij is. Een build gaat hier nooit op stuk.

De sleutel aanmaken staat in de README, onder "Google-reviews".

Gebruik:  python3 reviews.py
"""

import json
import sys
import urllib.error
import urllib.request
from datetime import date
from pathlib import Path

ROOT = Path(__file__).resolve().parent
sys.path.insert(0, str(ROOT))

from backend import instellingen as cfg  # noqa: E402
from backend import reviews  # noqa: E402

LIVE = ("https://iwrap.nl/api/reviews", "https://iwrap-website.vercel.app/api/reviews")
MAX_IN_BESTAND = 10


def van_live_site():
    for url in LIVE:
        try:
            with urllib.request.urlopen(url, timeout=4) as r:
                d = json.loads(r.read())
        except (urllib.error.URLError, OSError, ValueError):
            continue
        if d.get("bron") == "google":
            return d
    return None


def ververs(stil=False):
    huidig = reviews.basis()
    try:
        if cfg.GOOGLE_PLACES_API_KEY:
            nieuw, bron = reviews.van_google(cfg.GOOGLE_PLACES_API_KEY, huidig["place_id"]), "Google"
        else:
            nieuw, bron = van_live_site(), "de live site"
    except (urllib.error.URLError, OSError, ValueError, KeyError, TypeError) as e:
        nieuw, bron = None, "Google (%s)" % e
    if not nieuw:
        if not stil:
            print("Geen verse stand gevonden; reviews.json blijft %s uit %s."
                  % (huidig["score"], huidig["aantal"]))
        return False

    # Nieuwe reviews vooraan; wat er al stond blijft eronder staan. De relatieve
    # tijd ("2 weken geleden") veroudert in een bestand, dus die gaat eruit.
    lijst = []
    for r in nieuw["reviews"]:
        r = {k: r[k] for k in ("naam", "tekst", "sterren", "datum", "url") if r.get(k)}
        if r.get("url", "").startswith("https://search.google.com/local/reviews"):
            del r["url"]   # de algemene link; die zet de site er zelf bij
        lijst.append(r)
    namen = {r["naam"].lower() for r in lijst}
    lijst += [r for r in huidig["reviews"] if r["naam"].lower() not in namen]

    uit = dict(huidig, score=nieuw["score"], aantal=nieuw["aantal"], reviews=lijst[:MAX_IN_BESTAND])
    if uit != huidig:
        uit["bijgewerkt"] = date.today().isoformat()
        reviews.BESTAND.write_text(json.dumps(uit, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print("Reviews van %s: %s uit %s." % (bron, uit["score"], uit["aantal"]))
    return True


if __name__ == "__main__":
    ververs()
