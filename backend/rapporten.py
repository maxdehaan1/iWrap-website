"""Klussen en rapporten: wat Max op locatie invult en wat de klant te zien krijgt.

Een rapport is één document per klus. Max vult het in de Max-modus in: de klant,
wat er gedaan is, welke folie, en de kozijncheck. Zodra hij op "Rapport
klaarzetten" drukt, is het via /r/<id> te openen voor de klant.

Horren worden hier niet meer ingemeten. Staan de horren op oranje of rood, dan
krijgt de klant in het rapport een advies met een link naar kozijnhorren.nl, met
de kleur van zijn folie al gekozen. Daar vult hij (of Max) zelf de maten in.
"""

import time
from urllib.parse import urlencode

from . import horren
from . import instellingen as cfg
from .auth import nieuwe_id
from .opslag import opslag

STANDEN = ("groen", "oranje", "rood", "nvt")


def onderdelen():
    return cfg.lees_data("kozijncheck.json")


def nieuw():
    nu = int(time.time())
    return {
        "id": nieuwe_id(),
        "status": "concept",
        "versie": 0,
        "gemaakt": nu,
        "bijgewerkt": nu,
        "klant": {"naam": "", "straat": "", "postcode": "", "plaats": "", "email": "", "telefoon": ""},
        "oplevering": {"datum": time.strftime("%Y-%m-%d"), "werk": "", "folie": "", "folie_ral": ""},
        "check": {},
        "notitie_intern": "",
    }


def haal(rid):
    if not rid or not rid.isalnum() or len(rid) > 20:
        return None
    return opslag().get("rapport:" + rid)


def bewaar(r):
    r["bijgewerkt"] = int(time.time())
    opslag().put("rapport:" + r["id"], r)
    opslag().index_zet("rapporten", r["id"], r["bijgewerkt"])
    return r


def _tekst(x, maxlen=400):
    return str(x or "").strip()[:maxlen]


def schoon(invoer, bestaand):
    """Alleen de velden overnemen die de Max-modus mag zetten, en ze inkorten.
    Status, id en tijdstempels blijven van de server."""
    r = dict(bestaand)
    k = invoer.get("klant") or {}
    r["klant"] = {veld: _tekst(k.get(veld), 120) for veld in
                  ("naam", "straat", "postcode", "plaats", "email", "telefoon")}
    o = invoer.get("oplevering") or {}
    r["oplevering"] = {
        "datum": _tekst(o.get("datum"), 10),
        "werk": _tekst(o.get("werk"), 1200),
        "folie": _tekst(o.get("folie"), 80),
        "folie_ral": horren.geldige_ral(o.get("folie_ral")) or "",
    }
    check = {}
    for d in onderdelen()["onderdelen"]:
        c = (invoer.get("check") or {}).get(d["sleutel"]) or {}
        stand = c.get("stand") if c.get("stand") in STANDEN else None
        check[d["sleutel"]] = {
            "stand": stand,
            "notitie": _tekst(c.get("notitie"), 600),
            "fotos": [f for f in (c.get("fotos") or []) if isinstance(f, str) and f.isalnum()][:4],
        }
    r["check"] = check
    r["notitie_intern"] = _tekst(invoer.get("notitie_intern"), 2000)
    return r


def samenvatting(r):
    """'5 van de 6 onderdelen in orde' en tellingen voor lijstjes en mails."""
    telling = {"groen": 0, "oranje": 0, "rood": 0}
    beoordeeld = 0
    for d in onderdelen()["onderdelen"]:
        stand = (r.get("check", {}).get(d["sleutel"]) or {}).get("stand")
        if stand in telling:
            telling[stand] += 1
            beoordeeld += 1
    if beoordeeld == 0:
        zin = "De kozijncheck is nog niet ingevuld."
    elif telling["groen"] == beoordeeld:
        zin = "Alles wat we bekeken hebben is in orde."
    else:
        zin = "%d van de %d onderdelen in orde" % (telling["groen"], beoordeeld)
        extra = []
        if telling["oranje"]:
            extra.append("%d om in de gaten te houden" % telling["oranje"])
        if telling["rood"]:
            extra.append("%d met een concreet advies" % telling["rood"])
        zin += ", " + " en ".join(extra) + "."
    return dict(telling, beoordeeld=beoordeeld, zin=zin)


def horren_advies(r):
    """Een link naar kozijnhorren.nl als de horren oranje of rood staan, met de
    horkleur die bij de folie hoort al gekozen. Anders None."""
    stand = (r.get("check", {}).get("horren") or {}).get("stand")
    if stand not in ("oranje", "rood"):
        return None
    ral = r.get("oplevering", {}).get("folie_ral") or ""
    kleur = horren.kleur_info(ral) if ral else None
    params = {"kleur": ral} if kleur else {}
    if kleur and not kleur["standaard"]:
        params["uitvoering"] = "luxe"  # een andere kleur dan de vier standaardkleuren
    return {
        "url": "%s/bestellen%s" % (cfg.SHOP_URL, ("?" + urlencode(params)) if params else ""),
        "winkel": cfg.WINKEL["naam"],
        "domein": cfg.WINKEL["domein"],
        "kleur": kleur,
    }


def publiek(r):
    """Wat de klant via /r/<id> te zien krijgt. Geen interne notities, geen
    telefoonnummer of mailadres in het rapport zelf."""
    check = []
    for d in onderdelen()["onderdelen"]:
        c = r.get("check", {}).get(d["sleutel"]) or {}
        stand = c.get("stand")
        if not stand or stand == "nvt":
            continue
        check.append({
            "sleutel": d["sleutel"], "naam": d["naam"], "kijkt": d["kijkt"], "stand": stand,
            "label": d.get(stand, ""),
            "advies": d.get("advies_" + stand, ""),
            "notitie": c.get("notitie", ""),
            "fotos": ["%s/fotos/%s" % (cfg.API_URL, f) for f in c.get("fotos", [])],
        })
    return {
        "id": r["id"],
        "status": r["status"],
        "klant": {"naam": r["klant"].get("naam", ""), "straat": r["klant"].get("straat", ""),
                  "plaats": r["klant"].get("plaats", "")},
        "oplevering": r.get("oplevering", {}),
        "check": check,
        "samenvatting": samenvatting(r),
        "disclaimer": onderdelen()["disclaimer"],
        "horren_advies": horren_advies(r),
    }


def link(r):
    return "%s/r/%s" % (cfg.IWRAP_URL, r["id"])
