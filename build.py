#!/usr/bin/env python3
"""
Bouwt de statische site uit src/pages/ naar de repo-root.

Elke bron in src/pages/ bestaat uit een JSON-blok in een HTML-comment (de
paginagegevens) gevolgd door de eigenlijke inhoud. Alles wat op elke pagina
hetzelfde is -- de <head>, de navigatie, de footer -- staat alleen hier.

Dezelfde opzet als kozijnwrap.nl, zodat beide sites op dezelfde manier te
onderhouden zijn.

Gebruik:  python3 build.py
"""

import base64
import json
import os
import re
import hashlib
import subprocess
import time
from html import escape
from pathlib import Path

from PIL import Image

ROOT = Path(__file__).parent
SRC = ROOT / "src" / "pages"
SITE = "https://iwrap.nl"

# ---------------------------------------------------------------------------
# Bedrijfsgegevens -- staan hier op EEN plek. Verandert het reviewaantal, de
# telefoon of het werkgebied, dan hoeft alleen dit blok aangepast te worden:
# het werkt door in de header, de footer, de structured data en de contactpagina.
# ---------------------------------------------------------------------------
# Score, aantal en de reviewteksten komen uit reviews.json. Dat bestand ververst
# zichzelf bij het bouwen (zie reviews_verversen hieronder) en is de enige plek
# waar reviewgegevens staan. Bezoekers zien bovendien de live stand: main.js
# haalt die op bij /api/reviews en zet hem in elk [data-rv]-veld.
REVIEWS = json.loads((ROOT / "reviews.json").read_text(encoding="utf-8"))

# De kozijncheck: zes onderdelen met stoplicht. Staat in de achterkant omdat de
# Max-modus en het rapport er ook uit lezen; hier alleen voor /kozijncheck.
KOZIJNCHECK = json.loads((ROOT / "backend" / "data" / "kozijncheck.json").read_text(encoding="utf-8"))

def instelling(naam):
    """Een gegeven dat niet in de code staat, zoals het mailadres van de zaak: uit de
    omgeving (export IWRAP_EMAIL=... in ~/.bash_profile), of anders uit .env in de
    hoofdmap (niet in git, niet online). Zo staat het adres niet in dit script naast
    de reviewgegevens; de privacy-plugin van Claude laat dit script dan bouwen."""
    if os.environ.get(naam):
        return os.environ[naam].strip()
    env = ROOT / ".env"
    if env.exists():
        for regel in env.read_text(encoding="utf-8").splitlines():
            sleutel, _, waarde = regel.partition("=")
            if sleutel.strip() == naam and waarde.strip():
                return waarde.strip().strip("\"'")
    raise SystemExit(
        f"{naam} ontbreekt. Zet hem eenmalig in je omgeving, bijvoorbeeld met\n"
        f"  echo 'export {naam}=<adres>' >> ~/.bash_profile\n"
        "(zie README, 'Bewerken en bouwen').")


BEDRIJF = {
    "naam": "iWrap",
    "juridisch": "iWrap VOF",
    "plaats": "Hilversum",
    "straat": "Neuweg 128",
    "postcode": "1214 GZ",
    "lat": "52.2165193",
    "lon": "5.1715531",
    "email": instelling("IWRAP_EMAIL"),
    # Zoals een Nederlander het leest. De link (tel:) en de gegevens voor Google
    # gebruiken telefoon_tel, met landcode.
    "telefoon": "06 1441 5877",
    "telefoon_tel": "+31614415877",
    "whatsapp": "31614415877",
    "whatsapp_url": "https://wa.me/31614415877",
    "instagram": "https://www.instagram.com/iwrap.nl/",
    # Beide links komen uit de Place ID in reviews.json, zie reviews_afleiden().
    "reviews_url": "",
    "review_schrijven_url": "",
    # Het aantal jaren rekent zichzelf uit, zodat er nooit een verouderd getal staat.
    "opgericht": "2014",
    "ervaring_jaren": str(time.localtime().tm_year - 2014),
    # Wettelijk verplicht op de site. Zelfde gegevens als op de offertes
    # (Offertes ICM/_referentie/bedrijfsgegevens.md).
    "kvk": "80710964",
    "btw": "NL861770225B01",
}

# ---------------------------------------------------------------------------
# Feiten die OOK op kozijnwrap.nl en houtnerffolie.nl staan. Hier houden we
# exact dezelfde formulering aan; drie sites die verschillende bedragen of
# garantietermijnen noemen is voor een klant alleen maar verwarrend.
# ---------------------------------------------------------------------------
# kozijnhorren.nl staat nog niet online, en het domein is nog vrij. Zolang dit False is,
# noemt de site kozijnhorren.nl nergens: de stukken tussen <!-- als kozijnhorren --> en
# <!-- /als kozijnhorren --> vallen weg (audit M16, akkoord Max 18 november 2026). Zet op
# True zodra kozijnhorren.nl werkt en bouw opnieuw: dan staan naam, link en horrentips er weer.
KOZIJNHORREN_LIVE = False


def kozijnhorren_link(tekst="kozijnhorren.nl", nieuw_venster=False):
    if not KOZIJNHORREN_LIVE:
        return tekst
    return '<a href="https://kozijnhorren.nl" rel="noopener"%s>%s</a>' % (
        ' target="_blank"' if nieuw_venster else "", tekst)


FEITEN = {
    "garantie_folie": "tien jaar Renolit-garantie op de folie",
    "garantie_montage": "vijf jaar garantie op de uitvoering",
    # Dezelfde termijnen als getal: het opleverrapport rekent er de einddatum mee uit.
    "garantie_folie_jaren": "10",
    "garantie_montage_jaren": "5",
    "levensduur_profiel": "50 tot 75 jaar",
    # Hoe lang de folie het houdt voor hij aan vervanging toe is. Niet "op" schrijven.
    "levensduur_folie": "vijftien tot vijfentwintig jaar",
    "doorlooptijd": "een tot twee dagen",
    # Het seizoen: in de winter plannen we veel minder, grote projecten niet.
    "seizoen": "maart tot november",
}

# ---------------------------------------------------------------------------
# Navigatie. Bewust kort: vijf items passen naast het logo, meer wikkelt op
# een telefoon. De rest staat in de footer.
# ---------------------------------------------------------------------------
NAV = [
    ("kunststof-kozijn-herstellen", "Kozijnherstel"),
    ("werkwijze", "Werkwijze"),
    ("voorbeelden", "Voorbeelden"),
    ("kosten", "Kosten"),
    ("vve-en-woningcorporaties", "Zakelijk"),
    ("over-iwrap", "Over iWrap"),
    ("contact", "Contact"),
]
# Pagina's die niet zelf in het menu staan, lichten het menu-item op waar ze onder vallen
# (audit 17 november: Contact en Zakelijk in het menu, Dakkapellen via Kozijnherstel).
NAV_ONDER = {
    "dakkapel-kozijnen": "kunststof-kozijn-herstellen",
    "kozijnmerken": "kunststof-kozijn-herstellen",
    "kozijncheck": "werkwijze",
    "voor-kozijnbedrijven": "vve-en-woningcorporaties",
    "veelgestelde-vragen": "contact",
}

FOOTER_KOLOMMEN = [
    ("Kozijnherstel", [
        ("kunststof-kozijn-herstellen", "Kunststof kozijn herstellen"),
        ("dakkapel-kozijnen", "Dakkapel kozijnen"),
        ("werkwijze", "Onze werkwijze"),
        ("kozijncheck", "Gratis kozijncheck"),
        ("kosten", "Wat kost het"),
        ("voorbeelden", "Voorbeelden"),
        ("kozijnmerken/index", "Per kozijnmerk"),
    ]),
    ("Voor wie", [
        ("vve-en-woningcorporaties", "VvE's en woningcorporaties"),
        ("voor-kozijnbedrijven", "Kozijnbedrijven en dealers"),
        ("werkgebied", "Werkgebied"),
    ]),
    ("iWrap", [
        ("over-iwrap", "Over iWrap"),
        ("veelgestelde-vragen", "Veelgestelde vragen"),
        ("contact", "Contact"),
        ("offerte", "Offerte aanvragen"),
        ("algemene-voorwaarden", "Algemene voorwaarden"),
        ("privacy", "Privacy"),
    ]),
]

# ---------------------------------------------------------------------------
# Kozijnmerken. Uit src/merken.json komen de merkpagina's, de hub en de sitemap.
# Elk merk heeft daar zijn eigen tekst: wie het merk is, hoe je het herkent,
# waar het bij dat merk op aankomt en een paar eigen vragen. Zo lijken de
# pagina's niet op elkaar, en dat is voor Google het hele punt van een pagina
# per merk. Een merk toevoegen = daar een blok bijzetten en bouwen.
# ---------------------------------------------------------------------------
MERKEN = json.loads((ROOT / "src" / "merken.json").read_text(encoding="utf-8"))

# ---------------------------------------------------------------------------
# Werkgebied. Regio's met de plaatsen waar iWrap daadwerkelijk gewerkt heeft.
# Dit is geen lijst met alle Nederlandse gemeenten: alleen plaatsen die
# kloppen, anders is het spam en werkt het averechts.
# ---------------------------------------------------------------------------
REGIOS = [
    ("Noord-Holland", ["Hilversum", "Amsterdam", "Haarlem", "Alkmaar", "Hoorn", "Amstelveen", "Purmerend"]),
    ("Utrecht", ["Utrecht", "Amersfoort", "Maartensdijk", "Veenendaal", "Zeist", "Nieuwegein"]),
    ("Gelderland", ["Putten", "Apeldoorn", "Arnhem", "Nijmegen", "Ede", "Harderwijk", "Zutphen"]),
    ("Zuid-Holland", ["Rotterdam", "Den Haag", "Leiden", "Dordrecht", "Gouda", "Zoetermeer"]),
    ("Noord-Brabant", ["Eindhoven", "Tilburg", "Breda", "Den Bosch", "Langenboom", "Helmond"]),
    ("Zeeland", ["Middelburg", "Vlissingen", "Goes", "Terneuzen"]),
    ("Overijssel en Flevoland", ["Zwolle", "Enschede", "Deventer", "Almere", "Lelystad"]),
    ("Noord-Nederland en Limburg", ["Groningen", "Leeuwarden", "Assen", "Maastricht", "Venlo", "Roermond"]),
]

def reviews_afleiden():
    """Afgeleid uit reviews.json, zodat de sjablonen er niets van hoeven te weten."""
    BEDRIJF["reviews_score"] = str(REVIEWS["score"]).replace(".", ",")
    BEDRIJF["reviews_score_getal"] = str(REVIEWS["score"])
    BEDRIJF["reviews_aantal"] = str(REVIEWS["aantal"])
    BEDRIJF["reviews_url"] = "https://search.google.com/local/reviews?placeid=" + REVIEWS["place_id"]
    BEDRIJF["review_schrijven_url"] = "https://search.google.com/local/writereview?placeid=" + REVIEWS["place_id"]


def reviews_verversen():
    """Hooguit eens per uur bij Google (of de live site) kijken of er nieuwe
    reviews zijn. Offline of zonder sleutel gebeurt er niets en bouwt de site
    gewoon door met wat er staat. IWRAP_OFFLINE=1 slaat het over."""
    global REVIEWS
    merk = ROOT / ".data" / "reviews-gecheckt"
    if os.environ.get("IWRAP_OFFLINE") or (merk.exists() and time.time() - merk.stat().st_mtime < 3600):
        return
    import reviews as ververser
    ververser.ververs(stil=True)
    merk.parent.mkdir(exist_ok=True)
    merk.touch()
    REVIEWS = json.loads((ROOT / "reviews.json").read_text(encoding="utf-8"))
    reviews_afleiden()


reviews_afleiden()

def logo_kop():
    """Het logo in de kop, in de pagina zelf: scherp op elk scherm, en het kan bij
    binnenkomst uitrollen (zie "De uitrol van het logo" in style.css).

    De vormen komen ongewijzigd uit images/logo/iwrap-logo-liggend.svg, die uit
    de officiële logobestanden is gemaakt. Voor de uitrol staan de stippen er
    nog eens als cirkel en de banen als lijn met ronde uiteinden: een stip die
    uitrolt tot een baan. Die zie je alleen tijdens de uitrol; daarna staat er
    weer precies het officiële logo. Het woord schuift achter het beeldmerk
    vandaan (de clipPath laat links van x = 300 niets zien)."""
    svg = (ROOT / "images" / "logo" / "iwrap-logo-liggend.svg").read_text(encoding="utf-8")
    vormen = dict(re.findall(r'<path fill="(#[0-9A-Fa-f]{6})" d="([^"]+)"', svg))
    merk, woord = vormen["#A7CEC5"], vormen["#262626"]
    # Middelpunt van de bovenste en de onderste ronding van elke baan (uit de
    # logovectoren), en de dikte van een baan.
    banen = [(56.131, 95.134, 73.359, 130.134), (106.096, 30.505, 153.489, 130.133),
             (186.153, 30.503, 233.542, 130.135)]
    lijnen = "".join(
        f'<path class="lg-anim lg-baan lg-b{i}" d="M{x1} {y1}L{x2} {y2}" pathLength="1"/>'
        for i, (x1, y1, x2, y2) in enumerate(banen, 1))
    return (
        '<svg class="logo-img" viewBox="0 0 839.965 175.631" width="163" height="34" '
        'aria-hidden="true" focusable="false">'
        '<defs><clipPath id="lg-knip"><rect x="300" y="-20" width="560" height="216"/></clipPath></defs>'
        f'<g class="lg-vast"><path class="lg-merk" fill="#A7CEC5" d="{merk}"/></g>'
        f'<g class="lg-anim-groep" fill="#A7CEC5" stroke="#A7CEC5">{lijnen}'
        '<circle class="lg-anim lg-stip lg-s1" cx="30.194" cy="30.194" r="30.194"/>'
        '<circle class="lg-anim lg-stip lg-s2" cx="266.584" cy="30.194" r="30.194"/></g>'
        f'<g clip-path="url(#lg-knip)"><path class="lg-woord" fill="#262626" d="{woord}"/></g>'
        '</svg>'
    )


LOGO = logo_kop()


# ---------------------------------------------------------------------------
# Hulpjes
# ---------------------------------------------------------------------------

# ---------------------------------------------------------------------------
# Beeld-helper. In de bron schrijf je:
#     <x-beeld src="na-herstelde-onderdorpel" alt="..." sizes="(max-width:900px) 100vw, 560px">
# en daar komt een volledige <picture> met webp, jpg-terugval, srcset,
# afmetingen (tegen layout shift) en lazy loading uit. Zet er eager bij voor
# de eerste afbeelding boven de vouw.
# ---------------------------------------------------------------------------

BEELD_RE = re.compile(r"<x-beeld\s+([^>]*?)/?>", re.S)
ATTR_RE = re.compile(r'([a-z-]+)(?:="([^"]*)")?')
BREEDTES = (640, 1000, 1600)


def beeldmaten(src):
    """Welke breedtes bestaan er van deze foto, en wat is de verhouding?

    Staande opnamen zijn maar 1365px breed, dus daar is geen 1600-variant van.
    We lezen het van schijf in plaats van het te gokken: een srcset die naar
    een niet-bestaand bestand wijst levert een stille 404 op.
    """
    beschikbaar = [b for b in BREEDTES if (ROOT / "images" / f"{src}-{b}.webp").exists()]
    if not beschikbaar:
        raise SystemExit(f"beeld ontbreekt: images/{src}-*.webp")
    grootste = max(beschikbaar)
    with Image.open(ROOT / "images" / f"{src}-{grootste}.webp") as im:
        w, h = im.size
    jpgs = [b for b in BREEDTES if (ROOT / "images" / f"{src}-{b}.jpg").exists()]
    if not jpgs:
        raise SystemExit(f"terugval ontbreekt: images/{src}-*.jpg")
    return beschikbaar, w, h, max(jpgs)


def render_regios():
    """Het werkgebied uit REGIOS. Alleen plaatsen waar echt gewerkt is."""
    uit = []
    for regio, plaatsen in REGIOS:
        items = "".join(f"<li>{pl}</li>" for pl in plaatsen)
        uit.append(
            f'<div class="regio"><h3>{regio}</h3><ul>{items}</ul></div>'
        )
    return '<div class="regios">' + "".join(uit) + "</div>"


def render_kozijncheck_tabel():
    """De zes onderdelen met hun stoplicht, uit backend/data/kozijncheck.json.
    Dezelfde bron als de Max-modus en het rapport, zodat de uitleg op de site
    nooit iets anders zegt dan wat een klant in zijn rapport krijgt."""
    rijen = []
    for d in KOZIJNCHECK["onderdelen"]:
        naam = d["naam"] + (' <small>(als je ze hebt)</small>' if d.get("optioneel") else "")
        rijen.append(
            f'<tr><td><strong>{naam}</strong><br><span class="check-kijkt">{d["kijkt"]}</span></td>'
            f'<td><span class="stip stip-groen" aria-hidden="true"></span>{d["groen"]}</td>'
            f'<td><span class="stip stip-oranje" aria-hidden="true"></span>{d["oranje"]}</td>'
            f'<td><span class="stip stip-rood" aria-hidden="true"></span>{d["rood"]}</td></tr>'
        )
    return (
        '<div class="tabel-wrap"><table class="checktabel">'
        "<thead><tr><th>Onderdeel</th><th>Groen</th><th>Oranje</th><th>Rood</th></tr></thead>"
        "<tbody>" + "".join(rijen) + "</tbody></table></div>"
    )


def render_merkkaarten():
    """De merkhub uit MERKEN, zodat een nieuw merk maar op één plek hoeft."""
    uit = []
    for m in MERKEN:
        uit.append(
            f'<a class="merkkaart" href="/kozijnmerken/{m["slug"]}">'
            f'<h3>{m["naam"]}</h3><p class="land">{m["land"]}</p>'
            f'<p>{m["kenmerk"]}</p></a>'
        )
    return '<div class="merkkaarten">' + "".join(uit) + "</div>"


MAANDEN = ["januari", "februari", "maart", "april", "mei", "juni", "juli",
           "augustus", "september", "oktober", "november", "december"]


# Korter dan dit krijgt grotere letters, anders staat er een halflege kaart.
KORTE_REVIEW = 90


def review_wanneer(r):
    if r.get("datum"):
        jaar, maand = r["datum"][:4], int(r["datum"][5:7])
        return f"{MAANDEN[maand - 1]} {jaar}"
    return ""


def render_review(r):
    """Eén reviewkaart. main.js bouwt precies dezelfde kaart als de live stand
    van Google nieuwere reviews heeft -- houd die twee gelijk."""
    naam = escape(r["naam"])
    sterren = int(r.get("sterren", 5))
    url = r.get("url") or BEDRIJF["reviews_url"]
    kort = " kort" if len(r["tekst"]) < KORTE_REVIEW else ""
    wanneer = review_wanneer(r)
    return (
        f'<article class="review{kort}">'
        '<div class="review-kop">'
        f'<span class="sterren" role="img" aria-label="{sterren} van de 5 sterren">'
        f'{"&#9733;" * sterren}{"&#9734;" * (5 - sterren)}</span>'
        '<span class="review-bron">Google</span></div>'
        f'<p>{escape(r["tekst"])}</p>'
        f'<div class="wie"><span class="avatar" aria-hidden="true">{naam[:1].upper()}</span>'
        f'<div><b>{naam}</b>{f"<small>{wanneer}</small>" if wanneer else ""}</div></div>'
        f'<a class="review-link" href="{escape(url)}" target="_blank" rel="noopener">'
        f'Lees op Google<span aria-hidden="true"> &#8599;</span><span class="sr-only">: de review van {naam}</span></a>'
        "</article>"
    )


def render_reviews(aantal, vanaf=0):
    """Reviewkaarten uit reviews.json. Zo staat er nergens een review in de
    bronpagina's, en ververst reviews.py ze vanzelf."""
    return "\n".join(render_review(r) for r in REVIEWS["reviews"][vanaf:vanaf + aantal])


def render_schuif(m):
    """{{schuif:naam|sizes|alt voor|alt na[|positie]}}: een voor/na-foto met een schuif
    ertussen, zoals bovenaan de homepage. De twee foto's (project-<naam>-voor en
    -na) zijn op elkaar gelegd, zodat je bij het schuiven hetzelfde stuk kozijn
    ziet veranderen. main.js maakt de schuif sleepbaar."""
    delen = [x.strip() for x in m.group(1).split("|")]
    naam, sizes, alt_voor, alt_na = delen[:4]
    # Optioneel vijfde deel: waar de schuif begint, zodat de schade bij het openen al
    # naast het herstel staat.
    pos = delen[4] if len(delen) > 4 else "50"
    return (
        f'<div class="vergelijk" style="--pos:{pos}%">'
        f'<x-beeld src="project-{naam}-voor" sizes="{sizes}" alt="{alt_voor}">'
        f'<div class="na"><x-beeld src="project-{naam}-na" sizes="{sizes}" alt="{alt_na}"></div>'
        '<span class="label label-voor">Voor</span><span class="label label-na">Na</span>'
        '<div class="greep" aria-hidden="true"></div>'
        f'<label class="sr-only" for="schuif-{naam}">Schuif om voor en na te vergelijken</label>'
        f'<input id="schuif-{naam}" type="range" min="0" max="100" value="{pos}" step="1">'
        "</div>"
    )


def render_reviewbadge(zin=True):
    """Het cijfer bovenaan elke pagina, aan te klikken naar Google."""
    return (
        f'<a class="rv-badge" href="{BEDRIJF["reviews_url"]}" target="_blank" rel="noopener">'
        '<span class="rv-badge-cijfer">{{rv.score}}</span>'
        '<span class="rv-badge-regel"><span class="sterren" aria-hidden="true">&#9733;&#9733;&#9733;&#9733;&#9733;</span>'
        '<span>uit {{rv.aantal}} Google-reviews</span></span>'
        + (f'<span class="rv-badge-zin">In {BEDRIJF["ervaring_jaren"]} jaar duizenden kozijnen hersteld</span>' if zin else "")
        + "</a>"
    )


def render_reviewstrook(kop="Wat klanten over ons zeggen"):
    """Het cijfer groot, en een rij reviews om doorheen te schuiven. Elke kaart
    opent die review op Google.

    De omvang staat er bewust in kozijnen en jaren, niet in klanten: "duizenden
    klanten" naast "84 reviews" laat een lezer rekenen. Zo klopt het allebei, en
    verklaart de inleiding meteen waarom er minder reviews zijn dan klussen."""
    url = BEDRIJF["reviews_url"]
    return f"""<section class="vlak-mint reviewstrook" aria-labelledby="rv-titel">
  <div class="wrap">
    <div class="rv-kop">
      <div>
        <p class="opschrift">Google-reviews</p>
        <h2 id="rv-titel">{kop}</h2>
        <p class="rv-inleiding">In {BEDRIJF["ervaring_jaren"]} jaar hebben we duizenden kozijnen hersteld, door heel
        Nederland. Een deel van die klanten schreef er een review over.</p>
      </div>
      <a class="rv-totaal" href="{url}" target="_blank" rel="noopener">
        <span class="rv-cijfer">{{{{rv.score}}}}</span>
        <span class="rv-totaal-tekst"><span class="sterren" aria-hidden="true">&#9733;&#9733;&#9733;&#9733;&#9733;</span>
        <span>uit {{{{rv.aantal}}}} reviews op Google</span></span>
      </a>
    </div>
    <div class="rv-rij" data-rv-rij tabindex="0" role="region" aria-label="Reviews van klanten, schuif opzij voor meer">
{render_reviews(8)}
    </div>
    <div class="rv-voet">
      <div class="rv-pijlen" hidden>
        <button type="button" class="rv-pijl" data-rv-pijl="-1" aria-label="Vorige reviews">&#8249;</button>
        <button type="button" class="rv-pijl" data-rv-pijl="1" aria-label="Volgende reviews">&#8250;</button>
      </div>
      <a class="rv-alle" href="{url}" target="_blank" rel="noopener">Lees alle {{{{rv.aantal}}}} reviews op Google</a>
    </div>
  </div>
</section>"""


def render_beeld(m):
    attrs = dict(
        (a.group(1), a.group(2) if a.group(2) is not None else "")
        for a in ATTR_RE.finditer(m.group(1))
    )
    src = attrs["src"]
    alt = attrs.get("alt", "")
    sizes = attrs.get("sizes", "100vw")
    klasse = attrs.get("class", "")
    breedtes, w, h, jpg = beeldmaten(src)
    srcset = ", ".join(f"/images/{src}-{b}.webp {b}w" for b in breedtes)
    laden = (
        ' fetchpriority="high" decoding="async"'
        if "eager" in attrs
        else ' loading="lazy" decoding="async"'
    )
    return (
        "<picture>"
        f'<source type="image/webp" srcset="{srcset}" sizes="{sizes}">'
        f'<img src="/images/{src}-{jpg}.jpg" width="{w}" height="{h}" alt="{alt}"'
        + (f' class="{klasse}"' if klasse else "")
        + laden
        + "></picture>"
    )


def url_for(slug):
    """Schone URL zonder .html -- vercel.json heeft cleanUrls aan staan."""
    if slug == "index":
        return "/"
    if slug.endswith("/index"):
        return "/" + slug[: -len("/index")]
    return "/" + slug


def css_version():
    """Eén hash over alle stylesheets en scripts, als cache-buster in de URL.

    Zo mogen die bestanden een jaar in de browsercache blijven staan en zien
    bezoekers een wijziging tóch meteen: de URL verandert mee met de inhoud.
    """
    h = hashlib.sha1()
    for d in ("css", "js"):
        for f in sorted((ROOT / d).glob("*.*")):
            h.update(f.read_bytes())
    return h.hexdigest()[:8]


def render_nav(slug):
    top = slug.split("/")[0]
    top = NAV_ONDER.get(top, top)
    links = "\n".join(
        '      <a %shref="%s">%s</a>'
        % ('class="current" ' if s.split("/")[0] == top else "", url_for(s), label)
        for s, label in NAV
    )
    # Op een telefoon zit het menu achter de knop met de drie streepjes, en dan is
    # de offerteknop uit beeld zodra je scrolt. Daarom staat hij daar los in de
    # balk, die meescrolt. Niet op de offertepagina zelf.
    snel = "" if slug == "offerte" else (
        '    <a class="nav-snel" href="/offerte" aria-label="Offerte aanvragen">Offerte</a>\n')
    return f"""<header class="site">
  <div class="nav">
    <a class="brand" href="/" aria-label="iWrap, naar de homepage">{LOGO}</a>
{snel}    <button type="button" class="nav-toggle" aria-expanded="false" aria-controls="hoofdmenu">
      <span class="bars" aria-hidden="true"></span>
      <span class="sr-only">Menu</span>
    </button>
    <nav class="navlinks" id="hoofdmenu" aria-label="Hoofdnavigatie">
{links}
      <a class="nav-cta" href="/offerte">Offerte aanvragen</a>
    </nav>
  </div>
</header>"""


def render_actiebalk():
    """Op een telefoon onderin altijd binnen bereik: offerte, bellen en WhatsApp. Niet op
    /offerte (dat heeft een eigen balk met Vorige en Volgende) en niet op de kale pagina's
    (rapport, Max-modus). De offerteknop in de kop verdwijnt op een telefoon, want die
    staat hier al (css: "De actiebalk")."""
    b = BEDRIJF
    return f"""<nav class="actiebalk" aria-label="Snel contact">
  <a class="ab-offerte" href="/offerte" aria-label="Offerte aanvragen">Offerte</a>
  <a href="tel:{b['telefoon_tel']}"><svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true" focusable="false"><path d="M6.6 3.5 9 3l1.6 4-2 1.3a12 12 0 0 0 5.1 5.1l1.3-2 4 1.6-.5 2.4a2 2 0 0 1-2 1.6A15.5 15.5 0 0 1 5 5.5a2 2 0 0 1 1.6-2Z" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/></svg>Bellen</a>
  <a href="{b['whatsapp_url']}"><svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true" focusable="false"><path d="M4.5 19.5l1.2-3.6A8 8 0 1 1 8.4 18.6l-3.9.9Z" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/></svg>WhatsApp</a>
</nav>
"""


def render_kale_kop(label):
    """Voor het rapport en de Max-modus: alleen het logo en een label, geen
    menu. Een klant die zijn rapport opent hoeft niet door de site te navigeren,
    en op een telefoon op de steiger telt elke pixel."""
    return f"""<header class="site kaal">
  <div class="nav">
    <a class="brand" href="/" aria-label="iWrap, naar de homepage">{LOGO}</a>
    <span class="kaal-label">{label}</span>
  </div>
</header>"""


def render_footer():
    kolommen = ""
    for titel, items in FOOTER_KOLOMMEN:
        links = "\n".join(
            '        <li><a href="%s">%s</a></li>' % (url_for(s), label)
            for s, label in items
        )
        kolommen += (
            f'      <div class="fcol">\n        <h2>{titel}</h2>\n'
            f"        <ul>\n{links}\n        </ul>\n      </div>\n"
        )
    b = BEDRIJF
    zakelijk = []
    if b["kvk"]:
        zakelijk.append(f'KvK {b["kvk"]}')
    if b["btw"]:
        zakelijk.append(f'Btw-id {b["btw"]}')
    zakelijk = " &middot; ".join(zakelijk)
    zakelijk = f" &middot; {zakelijk}" if zakelijk else ""
    zusterhorren = (", en op " + kozijnhorren_link() + " bestel je horren in de kleur van je kozijn") \
        if KOZIJNHORREN_LIVE else ""
    return f"""<footer class="site-footer">
  <div class="wrap fgrid">
      <div class="fcol fbrand">
        <img src="/images/logo/iwrap-logo-liggend.svg" width="200" height="42" alt="iWrap" loading="lazy">
        <p>Specialist in kozijnfolie: al {b['ervaring_jaren']} jaar alleen dit vak, door heel
        Nederland. Volledig gecertificeerde monteurs, geen zzp'ers, uitsluitend Renolit folie.</p>
        <p class="fcontact">
          <a href="tel:{b['telefoon_tel']}">{b['telefoon'].replace(" ", "&nbsp;")}</a><br>
          <a href="{b['whatsapp_url']}">WhatsApp</a><br>
          <a href="mailto:{b['email']}">{b['email']}</a>
        </p>
        <p class="fadres">{b['juridisch']}<br>{b['straat']}, {b['postcode']} {b['plaats']}</p>
        <p class="fsocial">
          <a href="{b['reviews_url']}" target="_blank" rel="noopener">&#9733; <span data-rv="score">{b['reviews_score']}</span> uit <span data-rv="aantal">{b['reviews_aantal']}</span> Google-reviews</a><br>
          <a href="{b['instagram']}" target="_blank" rel="noopener">iWrap op Instagram</a>
        </p>
      </div>
{kolommen}  </div>
  <div class="wrap fbottom">
    <p>&copy; {time.localtime().tm_year} {b['juridisch']}, {b['plaats']}{zakelijk}</p>
    <p class="fzus">Meer weten? <a href="https://kozijnwrap.nl" rel="noopener">kozijnwrap.nl</a>
    legt uit wanneer herstel zin heeft, <a href="https://houtnerffolie.nl" rel="noopener">houtnerffolie.nl</a>
    gaat over de folie zelf{zusterhorren}.</p>
  </div>
</footer>"""


# ---------------------------------------------------------------------------
# Structured data
# ---------------------------------------------------------------------------

def localbusiness(met_reviews=True):
    """met_reviews: de losse reviews horen alleen in de gegevens voor Google op
    pagina's waar de bezoeker ze ook echt ziet staan. Het cijfer staat op elke
    pagina (in de footer) en mag dus overal mee."""
    b = BEDRIJF
    gegevens = {
        "@type": "HomeAndConstructionBusiness",
        "@id": SITE + "/#bedrijf",
        "name": b["naam"],
        "legalName": b["juridisch"],
        "url": SITE + "/",
        "email": b["email"],
        "telephone": b["telefoon_tel"],
        "image": SITE + "/images/na-herstelde-onderdorpel-1600.webp",
        "logo": SITE + "/images/logo/iwrap-mark-512.png",
        "address": {
            "@type": "PostalAddress",
            "streetAddress": b["straat"],
            "postalCode": b["postcode"],
            "addressLocality": b["plaats"],
            "addressRegion": "Noord-Holland",
            "addressCountry": "NL",
        },
        "geo": {
            "@type": "GeoCoordinates",
            "latitude": b["lat"],
            "longitude": b["lon"],
        },
        "areaServed": {"@type": "Country", "name": "Nederland"},
        "sameAs": [b["instagram"], b["reviews_url"]],
        "description": (
            "iWrap is specialist in kozijnfolie en herstelt kunststof kozijnen met "
            "Renolit folie: de aangetaste toplaag eraf, een nieuwe folie erop. Volledig "
            "gecertificeerde monteurs, geen zzp'ers, tien jaar Renolit-garantie op de "
            "folie en vijf jaar op de uitvoering."
        ),
    }
    # Geen cijfer en geen losse reviews in de gegevens voor Google: dat zijn reviews van
    # Google zelf (een andere site), en die mogen volgens Google's eigen richtlijnen niet als
    # structured data op je eigen site staan. Op de pagina zelf blijven ze gewoon staan.
    # (Audit 17 november 2026, V2.)
    return gegevens


def breadcrumbs(kruimels):
    """kruimels = [(naam, url), ...] inclusief de huidige pagina."""
    return {
        "@type": "BreadcrumbList",
        "itemListElement": [
            {
                "@type": "ListItem",
                "position": i + 1,
                "name": naam,
                "item": SITE + u,
            }
            for i, (naam, u) in enumerate(kruimels)
        ],
    }


def faq_schema(paren):
    return {
        "@type": "FAQPage",
        "mainEntity": [
            {
                "@type": "Question",
                "name": v,
                "acceptedAnswer": {"@type": "Answer", "text": a},
            }
            for v, a in paren
        ],
    }


# ---------------------------------------------------------------------------
# Renderen
# ---------------------------------------------------------------------------

HEAD = """<!DOCTYPE html>
<html lang="nl">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>{title}</title>
<meta name="description" content="{description}">
{canonical_link}{robots}<meta property="og:type" content="{ogtype}">
<meta property="og:site_name" content="iWrap">
<meta property="og:locale" content="nl_NL">
<meta property="og:title" content="{ogtitle}">
<meta property="og:description" content="{description}">
<meta property="og:url" content="{canonical}">
<meta property="og:image" content="{ogimage}">
<meta property="og:image:width" content="{ogbreedte}">
<meta property="og:image:height" content="{oghoogte}">
<meta property="og:image:alt" content="{ogalt}">
<meta name="twitter:card" content="summary_large_image">
<meta name="theme-color" content="#22262a">
<link rel="icon" href="/favicon.ico" sizes="any">
<link rel="icon" href="/favicon.svg" type="image/svg+xml">
<link rel="apple-touch-icon" href="/apple-touch-icon.png">
<link rel="manifest" href="/site.webmanifest">
<link rel="preload" href="/fonts/montserrat-latin-83a31c81.woff2" as="font" type="font/woff2" crossorigin>
<script>(function(d){{d.className+=" js";if(document.referrer.indexOf(location.origin+"/")!==0)d.className+=" logo-uitrol";var n=new Date(),m=n.getMonth()+1;if(m===12||m<3||(m===11&&n.getDate()>14))d.className+=" winter"}})(document.documentElement);</script>
{fonts}{stylesheets}{preload}<script type="application/ld+json">{jsonld}</script>
</head>
<body class="{bodyclass}">
<a class="skip" href="#inhoud">Naar de inhoud</a>
{nav}
<main id="inhoud">
{inhoud}
</main>
{footer}
{scripts}</body>
</html>
"""

def werk_csp_bij():
    """Het ene script dat in de pagina zelf staat (zie HEAD) mag van de
    Content-Security-Policy in vercel.json alleen draaien als zijn hash daar
    genoemd staat. Verandert dat script, dan zetten we de nieuwe hash er hier
    vanzelf in; anders zou de browser het online stilletjes tegenhouden."""
    script = re.search(r"<script>(.*?)</script>", HEAD, re.S).group(1)
    # HEAD is een format-sjabloon: daar staan accolades dubbel, in de pagina enkel.
    script = script.replace("{{", "{").replace("}}", "}")
    hash_ = "sha256-" + base64.b64encode(hashlib.sha256(script.encode("utf-8")).digest()).decode("ascii")
    pad = ROOT / "vercel.json"
    tekst = pad.read_text(encoding="utf-8")
    nieuw, aantal = re.subn(r"'sha256-[A-Za-z0-9+/=]+'", "'%s'" % hash_, tekst)
    if aantal != 1:
        raise SystemExit("vercel.json: de Content-Security-Policy mist de hash van het script in de pagina")
    if nieuw != tekst:
        pad.write_text(nieuw, encoding="utf-8")
        print("  vercel.json: hash in de Content-Security-Policy bijgewerkt")


# Bezoekers tellen met Vercel Web Analytics: zonder cookies en zonder iets op het
# toestel van de bezoeker, dus zonder cookiebanner. Niet op de Max-modus en het
# rapport (noindex): die adressen bevatten een sleutel en horen nergens in een
# overzicht. Werkt pas als Analytics in Vercel aanstaat (zie LIVEGANG.md).
ANALYTICS = '<script defer src="/_vercel/insights/script.js"></script>\n'


def fonts_koppen(ver):
    """Sinds 16 november 2026 gebruikt de site het lettertype van het apparaat zelf (San Francisco
    op een Mac en iPhone, Segoe UI op Windows), net als houtnerffolie.nl: er hoeft niets meer
    vooraf geladen te worden. css/fonts.css (Montserrat en Inter, op de site zelf, dus zonder
    Google) blijft staan voor de getekende scènes die die letters nog gebruiken; een browser
    haalt een lettertype pas op als er echt tekst in staat."""
    return '<link rel="stylesheet" href="/css/fonts.css?v=%s">\n' % ver


SECTIE_RE = re.compile(r"<section\b([^>]*)>")
HERO_KLASSEN = {"hero", "pagina-hero", "offerte-hero"}


def markeer_vlakken(inhoud):
    """Witruimte tussen secties: één keer, niet twee keer.

    Elke sectie heeft boven en onder dezelfde ruimte. Wisselt de achtergrond, dan klopt dat:
    de kleurrand scheidt de twee. Maar twee secties op hetzelfde papier na elkaar gaven een gat
    van twee keer die ruimte (tot 290px), en onder de paginakop op elke pagina 272px. Daarom
    krijgt een sectie met dezelfde achtergrond als die ervoor "zelfde-vlak" (geen ruimte
    erboven), en de sectie direct onder de paginakop "na-hero" (samen precies één keer de
    ruimte). De opmaak staat in style.css bij "Secties"."""
    def vlak(klassen):
        if "vlak-donker" in klassen:
            return "donker"
        if "vlak-mint" in klassen:
            return "mint"
        if klassen & {"vlak-wit", "vlak-gloed", "werkwijze-blok"}:
            return "wit"
        return "papier"

    vorige = None
    def rep(m):
        nonlocal vorige
        attrs = m.group(1)
        km = re.search(r'class="([^"]*)"', attrs)
        klassen = set(km.group(1).split()) if km else set()
        soort = vlak(klassen)
        extra = None
        if vorige and vorige[0] == soort:
            extra = "na-hero" if vorige[1] else "zelfde-vlak"
        vorige = (soort, bool(klassen & HERO_KLASSEN))
        if not extra:
            return m.group(0)
        if km:
            attrs = attrs.replace(km.group(0), 'class="%s %s"' % (km.group(1), extra), 1)
        else:
            attrs = ' class="%s"' % extra + attrs
        return "<section%s>" % attrs
    return SECTIE_RE.sub(rep, inhoud)


def render(slug, meta, inhoud, ver):
    inhoud = markeer_vlakken(inhoud)
    canonical = SITE + url_for(slug)
    stylesheets = "".join(
        '<link rel="stylesheet" href="/css/%s.css?v=%s">\n' % (s, ver)
        for s in ["style"] + meta.get("css", [])
    )
    scripts = "".join(
        '<script src="/js/%s.js?v=%s" defer></script>\n' % (s, ver)
        for s in meta.get("js", [])
    )
    preload = ""
    if meta.get("preload"):
        preload = (
            '<link rel="preload" as="image" href="%s" '
            'imagesrcset="%s" imagesizes="%s">\n'
            % (meta["preload"]["src"], meta["preload"]["srcset"], meta["preload"].get("sizes", "100vw"))
        )

    graph = [localbusiness(met_reviews='<article class="review' in inhoud)]
    kruimels = [("Home", "/")] + [
        (n, u) for n, u in meta.get("kruimels", [])
    ]
    if len(kruimels) > 1:
        graph.append(breadcrumbs(kruimels))
    if meta.get("faq"):
        graph.append(faq_schema([(q["v"], q["a"]) for q in meta["faq"]]))
    for extra in meta.get("schema", []):
        graph.append(extra)

    # og:image: altijd de jpg-variant (webp wordt niet door elke scraper van
    # linkvoorbeelden gelezen) en de echte afmetingen erbij.
    ogpad = meta.get("ogimage", "/images/na-herstelde-onderdorpel-1600.webp")
    # Een eigen deelafbeelding (images/og/, 1200x630, gemaakt met deelafbeelding.py) gaat zoals hij is.
    if not ogpad.startswith("/images/og/"):
        ogpad = re.sub(r"-\d+\.(webp|jpg)$", "", ogpad) + "-1000.jpg"
    with Image.open(ROOT / ogpad.lstrip("/")) as og:
        ogbreedte, oghoogte = og.size

    jsonld = json.dumps(
        {"@context": "https://schema.org", "@graph": graph},
        ensure_ascii=False, separators=(",", ":"),
    )

    return HEAD.format(
        title=meta["title"],
        description=meta["description"],
        canonical=canonical,
        # Geen canonical op pagina's die niet in Google horen: de 404 (die op elk onbekend adres
        # verschijnt) zei anders dat hij een echte pagina op /404 is (audit V7).
        canonical_link="" if meta.get("noindex") else '<link rel="canonical" href="%s">\n' % canonical,
        robots='<meta name="robots" content="noindex,follow">\n' if meta.get("noindex") else "",
        ogtype=meta.get("ogtype", "website"),
        ogtitle=meta.get("ogtitle", meta["title"]),
        ogimage=SITE + ogpad,
        ogbreedte=ogbreedte,
        oghoogte=oghoogte,
        ogalt=meta.get("ogalt", "Hersteld kunststof kozijn met nieuwe Renolit folie"),
        fonts=fonts_koppen(ver),
        stylesheets=stylesheets,
        preload=preload,
        jsonld=jsonld,
        bodyclass=meta.get("bodyclass", ""),
        nav=render_kale_kop(meta["kaal"]) if meta.get("kaal") else render_nav(slug),
        inhoud=inhoud,
        footer="" if meta.get("kaal") else render_footer() + ("" if slug == "offerte" else render_actiebalk()),
        # Telscript niet op privé-pagina's (rapport, Max-modus); wel op het tekenblad ("tellen").
        scripts=scripts + ("" if meta.get("noindex") and not meta.get("tellen") else ANALYTICS),
    )


META_RE = re.compile(r"^\s*<!--\s*(\{.*?\})\s*-->\s*", re.S)


def substitueer(tekst):
    """{{bedrijf.telefoon}} en {{feit.doorlooptijd}} in de bron vervangen."""
    def rep(m):
        groep, sleutel = m.group(1), m.group(2)
        bron = {"bedrijf": BEDRIJF, "feit": FEITEN}[groep]
        if groep == "bedrijf" and sleutel == "telefoon":
            # Vaste spaties: het nummer breekt nooit over twee regels (06 1441 / 5877).
            return bron[sleutel].replace(" ", "\u00a0")
        return bron[sleutel]
    # Eerst de vaste blokken uit src/ (film, doorsnede, vergelijking): die bevatten
    # zelf ook plekhouders, zoals het reviewcijfer.
    for blok in ("film", "doorsnede", "vergelijking"):
        if "{{%s}}" % blok in tekst:
            bron = (SRC.parent / (blok + ".html")).read_text(encoding="utf-8")
            tekst = tekst.replace("{{%s}}" % blok, re.sub(r"<!--.*?-->\n", "", bron, count=1, flags=re.S).strip())
    tekst = re.sub(r"\{\{schuif:([^}]*)\}\}", render_schuif, tekst)
    tekst = tekst.replace("{{reviewstrook}}", render_reviewstrook())
    tekst = tekst.replace("{{reviewstrook_zakelijk}}", render_reviewstrook("Je klant is bij ons in goede handen"))
    tekst = tekst.replace("{{reviewbadge}}", render_reviewbadge())
    tekst = tekst.replace("{{reviewbadge_kort}}", render_reviewbadge(zin=False))
    # Cijfer en aantal als los veld, zodat main.js er de live stand in kan zetten.
    tekst = tekst.replace("{{rv.score}}", '<span data-rv="score">%s</span>' % BEDRIJF["reviews_score"])
    tekst = tekst.replace("{{rv.aantal}}", '<span data-rv="aantal">%s</span>' % BEDRIJF["reviews_aantal"])
    tekst = re.sub(r"\{\{(bedrijf|feit)\.([a-z_]+)\}\}", rep, tekst)
    # Stukken die alleen kloppen als de horrenwinkel er is: zolang KOZIJNHORREN_LIVE False is,
    # verdwijnen ze helemaal (audit M16: het domein is nog vrij, dus de naam ook nog niet noemen).
    tekst = re.sub(r"<!-- als kozijnhorren -->(.*?)<!-- /als kozijnhorren -->",
                   (lambda m: m.group(1)) if KOZIJNHORREN_LIVE else "", tekst, flags=re.S)
    tekst = tekst.replace("{{kozijnhorren}}", kozijnhorren_link())
    tekst = tekst.replace("{{kozijnhorren_nieuw_venster}}", kozijnhorren_link(nieuw_venster=True))
    tekst = tekst.replace("{{kozijncheck_tabel}}", render_kozijncheck_tabel())
    tekst = tekst.replace("{{kozijncheck_disclaimer}}", KOZIJNCHECK["disclaimer"])
    tekst = tekst.replace("{{regios}}", render_regios())
    tekst = tekst.replace("{{merkkaarten}}", render_merkkaarten())
    tekst = re.sub(r"\{\{reviews:(\d+)(?::(\d+))?\}\}",
                   lambda m: render_reviews(int(m.group(1)), int(m.group(2) or 0)),
                   tekst)
    return BEELD_RE.sub(render_beeld, tekst)


def controleer_js(map_=None):
    """Kijkt of elke string in de scripts netjes afgesloten is.

    Dit vangt de fout waar de site al een keer op stukging: een apostrof in een
    Nederlandse tekst ('foto's') binnen een string met enkele quotes. De browser
    geeft dan een SyntaxError, het hele bestand draait niet, en op de pagina zie
    je alleen dat er niets gebeurt -- precies het soort fout dat je pas ontdekt
    als een klant het formulier niet kan versturen.
    """
    for bestand in sorted((map_ or ROOT / "js").glob("*.js")):
        tekst = bestand.read_text(encoding="utf-8")
        regel, kolom, i, n = 1, 1, 0, len(tekst)
        quote = None      # welke string we in zitten
        start = None      # waar die begon
        commentaar = None # "//" of "/*"
        while i < n:
            c = tekst[i]
            volgend = tekst[i + 1] if i + 1 < n else ""
            if c == "\n":
                regel, kolom = regel + 1, 0
                if commentaar == "//":
                    commentaar = None
                if quote in ("'", '"'):
                    raise SystemExit(
                        f"{bestand.name}: string op regel {start} is niet afgesloten "
                        f"-- waarschijnlijk een apostrof in de tekst. Gebruik daar "
                        f'dubbele aanhalingstekens ("...") omheen.'
                    )
            if commentaar:
                if commentaar == "/*" and c == "*" and volgend == "/":
                    commentaar, i, kolom = None, i + 1, kolom + 1
            elif quote:
                if c == "\\":
                    i, kolom = i + 1, kolom + 1
                elif c == quote:
                    quote, start = None, None
            elif c in "'\"`":
                quote, start = c, regel
            elif c == "/" and volgend in "/*":
                commentaar = "//" if volgend == "/" else "/*"
                i, kolom = i + 1, kolom + 1
            i, kolom = i + 1, kolom + 1
        if quote:
            raise SystemExit(f"{bestand.name}: string op regel {start} is niet afgesloten")


def main():
    controleer_js()
    werk_csp_bij()
    reviews_verversen()
    ver = css_version()
    paginas = []

    bronnen = sorted(SRC.rglob("*.html"))
    for bron in bronnen:
        ruw = bron.read_text(encoding="utf-8")
        m = META_RE.match(ruw)
        if not m:
            raise SystemExit(f"{bron}: mist het JSON-metablok bovenaan")
        meta = json.loads(m.group(1))
        inhoud = ruw[m.end():]
        slug = str(bron.relative_to(SRC)).replace(".html", "")
        paginas.append((slug, meta, inhoud))

    # Merkpagina's worden uit MERKEN gegenereerd, niet uit losse bronbestanden.
    sjabloon = (SRC.parent / "merk-sjabloon.html").read_text(encoding="utf-8")
    for merk in MERKEN:
        meta, inhoud = merkpagina(merk, sjabloon)
        paginas.append((f"kozijnmerken/{merk['slug']}", meta, inhoud))

    for slug, meta, inhoud in paginas:
        doel = ROOT / (slug + ".html")
        doel.parent.mkdir(parents=True, exist_ok=True)
        doel.write_text(substitueer(render(slug, meta, substitueer(inhoud), ver)), encoding="utf-8")

    schrijf_sitemap([(s, m) for s, m, _ in paginas], laatst_gewijzigd(paginas))
    opgeruimd = ruim_op([s for s, _, _ in paginas])
    print(f"{len(paginas)} pagina's gebouwd (css/js-versie {ver})")
    for weg in opgeruimd:
        print(f"  opgeruimd: {weg} (geen bron meer)")


def ruim_op(slugs):
    """Pagina's weghalen die we eerder genereerden maar nu niet meer.

    Zonder dit blijft er na het hernoemen van een bron een verweesde HTML in de
    root staan, die gewoon bereikbaar blijft. We houden een lijst bij van wat we
    zelf geschreven hebben, zodat we nooit iets weghalen dat niet van ons is.
    """
    lijst = ROOT / ".gegenereerd"
    nu = {s + ".html" for s in slugs}
    eerder = set()
    if lijst.exists():
        eerder = {r.strip() for r in lijst.read_text(encoding="utf-8").split("\n") if r.strip()}
    weg = []
    for naam in sorted(eerder - nu):
        # Nooit aan de bron komen, wat er ook in de lijst staat.
        if naam.startswith("src/") or naam.startswith("."):
            continue
        pad = ROOT / naam
        if pad.exists():
            pad.unlink()
            weg.append(naam)
        ouder = pad.parent
        if ouder != ROOT and ouder.exists() and not any(ouder.iterdir()):
            ouder.rmdir()
    lijst.write_text("\n".join(sorted(nu)) + "\n", encoding="utf-8")
    return weg


def merkpagina(merk, sjabloon):
    """Vult het merksjabloon met de eigen tekst van het merk (src/merken.json).
    De opmaak is voor alle merken gelijk, de inhoud niet."""
    n = merk["naam"]
    meta = {
        "title": f"{n} kozijn verkleurd? Folie herstellen | iWrap",
        "description": merk["beschrijving"],
        "ogtitle": f"{n}-kozijnen herstellen met Renolit folie",
        "bodyclass": "tekstpagina",
        "css": ["content"],
        "kruimels": [("Kozijnmerken", "/kozijnmerken"), (n, f"/kozijnmerken/{merk['slug']}")],
        "ogimage": "/images/na-herstelde-kozijnhoek-1600.webp",
        # Voor Google de vragen als platte tekst, zonder de links uit het antwoord.
        "faq": [{"v": q["v"], "a": re.sub(r"<[^>]+>", "", q["a"])} for q in merk["faq"]],
    }
    if len(meta["description"]) > 160:
        raise SystemExit(f"src/merken.json: de beschrijving van {n} is langer dan 160 tekens")

    def alineas(lijst, inspringen="      "):
        return "\n".join(f"{inspringen}<p>{a}</p>" for a in lijst)

    letop = ""
    if merk.get("letop"):
        l = merk["letop"]
        letop = (f'      <div class="{l["klasse"]}">\n        <h3>{l["kop"]}</h3>\n'
                 + alineas(l["tekst"], "        ") + "\n      </div>")
    dealerblok = ""
    if merk.get("dealer"):
        dealerblok = (
            '<div class="callout">\n'
            f'  <h3>We werken samen met {n}-dealers</h3>\n'
            f'  <p>Verschillende {n}-vestigingen verwijzen hun klanten naar ons door '
            "wanneer herstel een betere oplossing is dan een nieuw kozijn. Ben je via "
            f"je {n}-dealer hier terechtgekomen? Zet dat even in je aanvraag, dan "
            "weten we meteen om welk profiel het gaat.</p>\n"
            "</div>"
        )
    faq = '      <div class="faq">\n' + "\n".join(
        f'        <details>\n          <summary>{q["v"]}</summary>\n'
        f'          <div class="antwoord"><p>{q["a"]}</p></div>\n        </details>'
        for q in merk["faq"]) + "\n      </div>"

    inhoud = sjabloon
    for sleutel, waarde in [
        ("naam", n),
        ("slug", merk["slug"]),
        ("land", merk["land"]),
        ("lede", merk["lede"]),
        ("over", alineas(merk["over"])),
        ("herkennen", '      <ul class="vinklijst">\n'
                      + "\n".join(f"        <li>{h}</li>" for h in merk["herkennen"])
                      + "\n      </ul>"),
        ("letop", letop),
        ("dealerblok", dealerblok),
        ("faq", faq),
    ]:
        inhoud = inhoud.replace("{{merk." + sleutel + "}}", waarde)
    if "{{merk." in inhoud:
        raise SystemExit("merk-sjabloon.html: er staat nog een onbekend {{merk.…}}-veld in")
    return meta, inhoud


def _git_datum(pad):
    """De dag van de laatste commit van een bestand, of None."""
    try:
        uit = subprocess.run(["git", "log", "-1", "--format=%cs", "--", str(pad)], cwd=ROOT,
                             capture_output=True, text=True, timeout=10).stdout.strip()
    except (OSError, subprocess.SubprocessError):
        return None
    return uit if re.fullmatch(r"\d{4}-\d{2}-\d{2}", uit) else None


def laatst_gewijzigd(paginas):
    """Per pagina de dag waarop de inhoud voor het laatst veranderde, voor
    <lastmod> in de sitemap. Google gebruikt die datum alleen als hij klopt,
    dus hij verspringt niet bij elke build: we bewaren per pagina een hash van
    de bron (src/gewijzigd.json) en zetten de datum pas op vandaag als die hash
    verandert. Een wijziging in de navigatie of de footer telt dus niet mee."""
    pad = ROOT / "src" / "gewijzigd.json"
    bekend = json.loads(pad.read_text(encoding="utf-8")) if pad.exists() else {}
    vandaag = time.strftime("%Y-%m-%d")
    nu = {}
    for slug, meta, inhoud in paginas:
        h = hashlib.sha1((json.dumps(meta, sort_keys=True, ensure_ascii=False) + inhoud)
                         .encode("utf-8")).hexdigest()[:12]
        oud = bekend.get(slug)
        if oud and oud["hash"] == h:
            nu[slug] = oud
            continue
        datum = vandaag
        if not oud:
            # Eerste keer: de dag van de laatste commit van de bron is eerlijker dan vandaag.
            bron = SRC / (slug + ".html")
            datum = _git_datum(bron if bron.exists() else SRC.parent / "merk-sjabloon.html") or vandaag
        nu[slug] = {"hash": h, "datum": datum}
    if nu != bekend:
        pad.write_text(json.dumps(nu, indent=1, sort_keys=True) + "\n", encoding="utf-8")
    return {slug: d["datum"] for slug, d in nu.items()}


def schrijf_sitemap(paginas, datums):
    regels = []
    for slug, meta in paginas:
        if meta.get("noindex"):
            continue
        prio = meta.get("prioriteit", "0.7")
        regels.append(
            f"  <url><loc>{SITE}{url_for(slug)}</loc>"
            f"<lastmod>{datums[slug]}</lastmod>"
            f"<changefreq>{meta.get('changefreq', 'monthly')}</changefreq>"
            f"<priority>{prio}</priority></url>"
        )
    (ROOT / "sitemap.xml").write_text(
        '<?xml version="1.0" encoding="UTF-8"?>\n'
        '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n'
        + "\n".join(sorted(regels))
        + "\n</urlset>\n",
        encoding="utf-8",
    )
    (ROOT / "robots.txt").write_text(
        f"User-agent: *\nAllow: /\nDisallow: /max\nDisallow: /r/\nDisallow: /api/\n\nSitemap: {SITE}/sitemap.xml\n",
        encoding="utf-8"
    )


if __name__ == "__main__":
    main()
