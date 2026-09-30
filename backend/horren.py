"""Kozijnhorren: assortiment, maatcontrole, prijs en levertijd.

Eén soort hor (de inklemhor) in twee uitvoeringen, basis en luxe. De klant
kiest alleen uitvoering, kleur, maat en aantal.

Dit is de enige plek waar een prijs vastgesteld wordt. De winkel rekent in de
browser met dezelfde tabel om direct een prijs te laten zien, maar bij het
afrekenen telt alleen wat hier uitkomt.
"""

import datetime as dt
import re

from . import instellingen as cfg


def catalogus():
    return cfg.lees_data("horren.json")


def ral_namen():
    return cfg.lees_data("ral.json")["kleuren"]


def folies():
    return cfg.lees_data("folies.json")["folies"]


# RAL Classic: 1000-1037, 2000-2017, 3000-3033, 4001-4012, 5000-5026,
# 6000-6039, 7000-7048, 8000-8029, 9001-9023. Niet elk nummer in die reeksen
# bestaat, maar dit vangt tikfouten als "7061" of "70166".
RAL_REEKSEN = {1: (0, 37), 2: (0, 17), 3: (0, 33), 4: (1, 12), 5: (0, 26),
               6: (0, 39), 7: (0, 48), 8: (0, 29), 9: (1, 23)}


def geldige_ral(code):
    code = str(code or "").strip().upper().replace("RAL", "").strip()
    if not re.fullmatch(r"\d{4}", code):
        return None
    groep, nummer = int(code[0]), int(code[1:])
    reeks = RAL_REEKSEN.get(groep)
    if not reeks or not (reeks[0] <= nummer <= reeks[1]):
        return None
    return code


def kleur_info(code):
    """Een RAL-code naar {code, naam, standaard, hex}. None als hij niet bestaat."""
    code = geldige_ral(code)
    if not code:
        return None
    cat = catalogus()
    for k in cat["kleuren"]["standaard"]:
        if k["code"] == code:
            return {"code": code, "naam": k["naam"], "standaard": True, "hex": k["hex"]}
    naam, hexkleur = ral_namen().get(code, ["RAL " + code, None])
    return {"code": code, "naam": naam, "standaard": False, "hex": hexkleur}


def controleer_maat(breedte, hoogte):
    """Geeft een lijst met fouten in gewone taal; leeg is goed."""
    g = catalogus()["maatgrenzen"]
    fouten = []
    b, h = g["breedte"], g["hoogte"]
    if not isinstance(breedte, int) or not isinstance(hoogte, int):
        return ["Vul de breedte en de hoogte in hele millimeters in."]
    if breedte < b["min"]:
        fouten.append("De breedte is kleiner dan %d mm. Zo klein maken we de hor niet." % b["min"])
    if breedte > b["max"]:
        fouten.append("De breedte is groter dan %d mm. Zo breed kan deze hor niet." % b["max"])
    if hoogte < h["min"]:
        fouten.append("De hoogte is kleiner dan %d mm. Zo klein maken we de hor niet." % h["min"])
    if hoogte > h["max"]:
        fouten.append("De hoogte is groter dan %d mm. Zo hoog kan deze hor niet." % h["max"])
    if not fouten and breedte * hoogte / 1e6 > g.get("max_oppervlak_m2", 99):
        fouten.append("Deze hor wordt te groot om stevig te blijven staan. Stuur ons even een foto, dan kijken we mee.")
    return fouten


def tabelprijs(product, breedte, hoogte):
    t = product["prijstabel"]
    bi = next((i for i, x in enumerate(t["breedtes"]) if breedte <= x), None)
    hi = next((i for i, x in enumerate(t["hoogtes"]) if hoogte <= x), None)
    if bi is None or hi is None:
        return None
    return t["prijzen"][bi][hi]


def maak_int(x):
    try:
        if isinstance(x, bool):
            return None
        if isinstance(x, (int, float)):
            return int(round(x))
        s = str(x).strip().replace(" ", "")
        if not re.fullmatch(r"\d{2,5}", s):
            return None
        return int(s)
    except (TypeError, ValueError):
        return None


def prijs_regel(regel):
    """Eén hor (of een aantal gelijke horren) doorrekenen.

    regel: {uitvoering, breedte, hoogte, kleur, aantal, naam}
    Terug: de genormaliseerde regel met stukprijs en bedrag, of {"fouten": [...]}.
    """
    cat = catalogus()
    fouten = []
    code = regel.get("uitvoering") or "basis"
    product = cat["producten"].get(code)
    if not product:
        return {"fouten": ["Kies Basis of Luxe."]}

    breedte, hoogte = maak_int(regel.get("breedte")), maak_int(regel.get("hoogte"))
    fouten += controleer_maat(breedte, hoogte)

    kleur = kleur_info(regel.get("kleur") or "9016")
    if not kleur:
        fouten.append("Deze RAL-kleur kennen we niet. Controleer de code (vier cijfers, bijvoorbeeld 7016).")
    elif product["kleuren"] == "standaard" and not kleur["standaard"]:
        fouten.append("De Basis is er in wit, crèmewit, antraciet en zwart. Voor een andere kleur kies je de Luxe.")

    aantal = maak_int(regel.get("aantal") or 1) or 0
    if not (1 <= aantal <= cat.get("max_aantal_per_regel", 20)):
        fouten.append("Het aantal moet tussen 1 en %d liggen." % cat.get("max_aantal_per_regel", 20))

    naam = str(regel.get("naam") or "").strip()[:60]
    if fouten:
        return {"fouten": fouten}

    stuk = tabelprijs(product, breedte, hoogte)
    return {
        "uitvoering": code,
        "productnaam": product["naam"],
        "gaas": product["gaas"],
        "naam": naam,
        "breedte": breedte,
        "hoogte": hoogte,
        "kleur": kleur,
        "aantal": aantal,
        "middenregel": hoogte >= cat["maatgrenzen"]["middenregel_vanaf_hoogte"],
        "stukprijs": stuk,
        "bedrag": stuk * aantal,
    }


def werkdagen_erbij(datum, n):
    while n > 0:
        datum += dt.timedelta(days=1)
        if datum.weekday() < 5:
            n -= 1
    return datum


def levertijd(regels, vandaag=None, voorjaar=False):
    """Van-tot-datum waarop de horren naar verwachting binnen zijn.

    Een indicatie: de fabriek bepaalt het echt. Daarom een bandbreedte, en in
    het hoogseizoen (april tot en met juli) een week erbij.
    """
    vandaag = vandaag or dt.date.today()
    lev = catalogus()["levering"]
    van, tot = lev["werkdagen"]
    if any(not r["kleur"]["standaard"] for r in regels):
        extra = catalogus()["kleuren"]["ral_extra_werkdagen"]
        van, tot = van + extra, tot + extra
    start = vandaag
    if voorjaar:
        maand, dag = [int(x) for x in lev["voorjaar_vanaf"].split("-")]
        kandidaat = dt.date(vandaag.year, maand, dag)
        if kandidaat <= vandaag:
            kandidaat = dt.date(vandaag.year + 1, maand, dag)
        # Winterbestelling: de leverancier levert vanaf die datum, niet eerder.
        return {"van": kandidaat.isoformat(), "tot": werkdagen_erbij(kandidaat, 5).isoformat(),
                "voorjaar": True}
    if start.month in lev["hoogseizoen_maanden"]:
        van += lev["hoogseizoen_extra_werkdagen"]
        tot += lev["hoogseizoen_extra_werkdagen"]
    return {"van": werkdagen_erbij(start, van).isoformat(),
            "tot": werkdagen_erbij(start, tot).isoformat(), "voorjaar": False}


def voorjaar_mogelijk(vandaag=None):
    vandaag = vandaag or dt.date.today()
    return vandaag.month in catalogus()["levering"]["wintermaanden"]


def bereken(regels, vandaag=None, voorjaar=False):
    """Een hele bestelling doorrekenen. Terug: regels, totalen, levertijd, fouten."""
    cat = catalogus()
    if not isinstance(regels, list) or not regels:
        return {"fouten": ["Er zit nog geen hor in je bestelling."], "regels": []}
    if len(regels) > cat.get("max_regels", 30):
        return {"fouten": ["Dat zijn meer regels dan we online aannemen. Neem even contact op."], "regels": []}
    uit, fouten = [], []
    for i, r in enumerate(regels):
        p = prijs_regel(r if isinstance(r, dict) else {})
        if p.get("fouten"):
            label = (r.get("naam") if isinstance(r, dict) else "") or "hor %d" % (i + 1)
            fouten += ["%s: %s" % (label, f) for f in p["fouten"]]
        else:
            uit.append(p)
    if fouten:
        return {"fouten": fouten, "regels": uit}
    subtotaal = sum(r["bedrag"] for r in uit)
    verzend = cat["levering"]["verzendkosten"]
    totaal = subtotaal + verzend
    btw = round(totaal - totaal / (1 + cat["btw"]), 2)
    return {
        "fouten": [],
        "regels": uit,
        "aantal_horren": sum(r["aantal"] for r in uit),
        "subtotaal": subtotaal,
        "verzendkosten": verzend,
        "totaal": totaal,
        "btw": btw,
        "levertijd": levertijd(uit, vandaag, voorjaar and voorjaar_mogelijk(vandaag)),
        "voorbeeldprijzen": cat.get("voorbeeldprijzen", True),
    }


def euro(bedrag):
    """1234.5 -> '€ 1.234,50'; hele bedragen zonder centen: '€ 98'."""
    if abs(bedrag - round(bedrag)) < 0.005:
        s = "{:,.0f}".format(bedrag).replace(",", ".")
    else:
        s = "{:,.2f}".format(bedrag).replace(",", "X").replace(".", ",").replace("X", ".")
    return "€ " + s


MAANDEN = ["januari", "februari", "maart", "april", "mei", "juni", "juli",
           "augustus", "september", "oktober", "november", "december"]


def datum_nl(iso):
    d = dt.date.fromisoformat(iso[:10])
    return "%d %s" % (d.day, MAANDEN[d.month - 1])


def levertijd_tekst(lt):
    if not lt:
        return ""
    if lt.get("voorjaar"):
        return "begin maart (%s)" % datum_nl(lt["van"])
    return "tussen %s en %s" % (datum_nl(lt["van"]), datum_nl(lt["tot"]))
