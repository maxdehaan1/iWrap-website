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

import json
import os
import re
import hashlib
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

BEDRIJF = {
    "naam": "iWrap",
    "juridisch": "iWrap VOF",
    "plaats": "Hilversum",
    "straat": "Neuweg 128",
    "postcode": "1214 GZ",
    "lat": "52.2165193",
    "lon": "5.1715531",
    "email": "info@iwrap.nl",
    "telefoon": "+31 6 1441 5877",
    "telefoon_tel": "+31614415877",
    "whatsapp": "31614415877",
    "instagram": "https://www.instagram.com/iwrap.nl/",
    # Beide links komen uit de Place ID in reviews.json, zie reviews_afleiden().
    "reviews_url": "",
    "review_schrijven_url": "",
    # Het aantal jaren rekent zichzelf uit, zodat er nooit een verouderd getal staat.
    "opgericht": "2014",
    "ervaring_jaren": str(time.localtime().tm_year - 2014),
    # TODO Max: KvK-nummer en btw-id invullen -- horen op de contactpagina te staan
    "kvk": "",
    "btw": "",
}

# ---------------------------------------------------------------------------
# Feiten die OOK op kozijnwrap.nl en houtnerffolie.nl staan. Hier houden we
# exact dezelfde formulering aan; drie sites die verschillende bedragen of
# garantietermijnen noemen is voor een klant alleen maar verwarrend.
# ---------------------------------------------------------------------------
# kozijnhorren.nl staat nog niet online. Zolang dit False is, staat de naam wel
# op de site maar zonder link (een link naar een site die er niet is, is erger
# dan geen link). Zet op True zodra kozijnhorren.nl werkt en bouw opnieuw.
KOZIJNHORREN_LIVE = False


def kozijnhorren_link(tekst="kozijnhorren.nl", nieuw_venster=False):
    if not KOZIJNHORREN_LIVE:
        return tekst
    return '<a href="https://kozijnhorren.nl" rel="noopener"%s>%s</a>' % (
        ' target="_blank"' if nieuw_venster else "", tekst)


FEITEN = {
    "garantie_folie": "tien jaar fabrieksgarantie op de folie",
    "garantie_montage": "vijf jaar op de montage",
    # Dezelfde termijnen als getal: het opleverrapport rekent er de einddatum mee uit.
    "garantie_folie_jaren": "10",
    "garantie_montage_jaren": "5",
    "levensduur_profiel": "50 tot 75 jaar",
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
    ("dakkapel-kozijnen", "Dakkapellen"),
    ("werkwijze", "Werkwijze"),
    ("voorbeelden", "Voorbeelden"),
    ("kosten", "Kosten"),
    ("over-iwrap", "Over iWrap"),
]

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
        ("privacy", "Privacy"),
    ]),
]

# ---------------------------------------------------------------------------
# Kozijnmerken. Uit deze lijst komen de merkpagina's, de hub en de sitemap.
# Een merk toevoegen = hier een regel bijzetten en bouwen.
# ---------------------------------------------------------------------------
MERKEN = [
    {
        "slug": "weru",
        "naam": "Weru",
        "land": "Duitsland",
        "kenmerk": "Weru levert al decennia kunststof kozijnen in Nederland, vaak in "
                   "crèmewit en met een gecacheerde buitenzijde.",
        "herkenning": "Een Weru-kozijn herken je meestal aan het beslag en aan de "
                      "typerende, licht afgeronde profielvorm.",
        "dealer": True,
    },
    {
        "slug": "veka",
        "naam": "VEKA",
        "land": "Duitsland",
        "kenmerk": "VEKA maakt het profiel waar heel veel Nederlandse kozijnbouwers "
                   "hun kozijnen van maken -- het merk op je kozijn is daarom vaak "
                   "een ander dan VEKA.",
        "herkenning": "In de sponning of op de stalen versterking staat vaak een "
                      "VEKA-stempel.",
        "dealer": False,
    },
    {
        "slug": "schuco",
        "naam": "Schüco",
        "land": "Duitsland",
        "kenmerk": "Schüco-profielen zitten veel in nieuwbouw en in projecten van "
                   "woningcorporaties.",
        "herkenning": "Herkenbaar aan het strakke, hoekige profiel en het "
                      "Schüco-beslag.",
        "dealer": False,
    },
    {
        "slug": "gealan",
        "naam": "Gealan",
        "land": "Duitsland",
        "kenmerk": "Gealan wordt veel gebruikt voor kozijnen met een houtnerfdecor "
                   "aan de buitenzijde.",
        "herkenning": "De houtnerf in de folie loopt bij Gealan meestal in de "
                      "lengterichting van het profiel.",
        "dealer": False,
    },
    {
        "slug": "finstral",
        "naam": "Finstral",
        "land": "Italië",
        "kenmerk": "Finstral levert kozijnen met een aluminium schil of met folie, "
                   "afhankelijk van de uitvoering.",
        "herkenning": "Zit er een aluminium schaal op, dan is folieherstel niet aan "
                      "de orde -- dat vertellen we je eerlijk.",
        "dealer": False,
    },
    {
        "slug": "knipping",
        "naam": "Knipping",
        "land": "Nederland",
        "kenmerk": "Knipping is een Nederlandse fabrikant die veel in de "
                   "woningbouw en renovatie zit.",
        "herkenning": "Vaak te vinden in seriematige woningbouw uit de jaren "
                      "negentig en later.",
        "dealer": False,
    },
    {
        "slug": "kommerling",
        "naam": "Kömmerling",
        "land": "Duitsland",
        "kenmerk": "Kömmerling-profielen kom je zowel in nieuwbouw als in "
                   "renovatieprojecten tegen.",
        "herkenning": "Het profiel is herkenbaar aan de brede aanslag en het "
                      "Kömmerling-logo in de sponning.",
        "dealer": False,
    },
    {
        "slug": "kvision",
        "naam": "K-Vision",
        "land": "Nederland",
        "kenmerk": "K-Vision levert kunststof kozijnen aan particulieren via "
                   "eigen vestigingen.",
        "herkenning": "Meestal crèmewit of met houtnerfdecor aan de buitenzijde.",
        "dealer": False,
    },
]

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

FAVICON = "/images/logo/iwrap-mark-64.png"

LOGO = (
    '<img class="logo-img" src="/images/logo/iwrap-logo-donker-88.png" '
    'width="210" height="44" alt="iWrap" fetchpriority="high">'
)


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
    links = "\n".join(
        '      <a %shref="%s">%s</a>'
        % ('class="current" ' if s.split("/")[0] == top else "", url_for(s), label)
        for s, label in NAV
    )
    return f"""<header class="site">
  <div class="nav">
    <a class="brand" href="/" aria-label="iWrap, naar de homepage">{LOGO}</a>
    <button class="nav-toggle" aria-expanded="false" aria-controls="hoofdmenu">
      <span class="bars" aria-hidden="true"></span>
      <span class="sr-only">Menu</span>
    </button>
    <nav class="navlinks" id="hoofdmenu" aria-label="Hoofdnavigatie">
{links}
      <a class="nav-cta" href="/offerte">Offerte aanvragen</a>
    </nav>
  </div>
</header>"""


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
        <img src="/images/logo/iwrap-logo-licht-88.png" width="200" height="42" alt="iWrap" loading="lazy">
        <p>Wij herstellen kunststof kozijnen met Renolit folie. Al
        {b['ervaring_jaren']} jaar, door heel Nederland, met eigen gecertificeerde
        monteurs.</p>
        <p class="fcontact">
          <a href="tel:{b['telefoon_tel']}">{b['telefoon']}</a><br>
          <a href="mailto:{b['email']}">{b['email']}</a>
        </p>
        <p class="fsocial">
          <a href="{b['reviews_url']}" target="_blank" rel="noopener">&#9733; <span data-rv="score">{b['reviews_score']}</span> uit <span data-rv="aantal">{b['reviews_aantal']}</span> Google-reviews</a><br>
          <a href="{b['instagram']}" target="_blank" rel="noopener">iWrap op Instagram</a>
        </p>
      </div>
{kolommen}  </div>
  <div class="wrap fbottom">
    <p>&copy; 2026 {b['juridisch']}, {b['plaats']}{zakelijk}</p>
    <p class="fzus">Meer weten? <a href="https://kozijnwrap.nl" rel="noopener">kozijnwrap.nl</a>
    legt uit wanneer herstel zin heeft, <a href="https://houtnerffolie.nl" rel="noopener">houtnerffolie.nl</a>
    gaat over de folie zelf{zusterhorren}.</p>
  </div>
</footer>"""


# ---------------------------------------------------------------------------
# Structured data
# ---------------------------------------------------------------------------

def localbusiness():
    b = BEDRIJF
    return {
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
            "iWrap herstelt kunststof kozijnen met Renolit folie: de aangetaste "
            "toplaag eraf, een nieuwe folie erop. Duurzamer en vaak flink "
            "goedkoper dan vervangen."
        ),
        "aggregateRating": {
            "@type": "AggregateRating",
            "ratingValue": b["reviews_score_getal"],
            "reviewCount": b["reviews_aantal"],
            "bestRating": "5",
        },
        "review": [
            {
                "@type": "Review",
                "author": {"@type": "Person", "name": r["naam"]},
                "reviewRating": {"@type": "Rating", "ratingValue": str(r.get("sterren", 5)),
                                 "bestRating": "5"},
                "reviewBody": r["tekst"],
                **({"datePublished": r["datum"]} if r.get("datum") else {}),
            }
            for r in REVIEWS["reviews"]
        ],
    }


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
<link rel="canonical" href="{canonical}">
{robots}<meta property="og:type" content="{ogtype}">
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
<link rel="icon" href="{favicon}" type="image/png">
<link rel="apple-touch-icon" href="/images/logo/apple-touch-icon.png">
<script>document.documentElement.className+=" js";</script>
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

# Bezoekers tellen met Vercel Web Analytics: zonder cookies en zonder iets op het
# toestel van de bezoeker, dus zonder cookiebanner. Niet op de Max-modus en het
# rapport (noindex): die adressen bevatten een sleutel en horen nergens in een
# overzicht. Werkt pas als Analytics in Vercel aanstaat (zie LIVEGANG.md).
ANALYTICS = '<script defer src="/_vercel/insights/script.js"></script>\n'


def fonts_koppen(ver):
    """De lettertypen staan op de site zelf (css/fonts.css, fonts/): zo gaat het
    IP-adres van een bezoeker niet naar Google, en is er geen cookiebanner nodig.
    De twee die bovenaan elke pagina staan worden alvast geladen."""
    vooraf = "".join(
        '<link rel="preload" href="/fonts/%s" as="font" type="font/woff2" crossorigin>\n' % f.name
        for f in sorted((ROOT / "fonts").glob("*-latin-*.woff2")) if "-ext-" not in f.name)
    return vooraf + '<link rel="stylesheet" href="/css/fonts.css?v=%s">\n' % ver


def render(slug, meta, inhoud, ver):
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

    graph = [localbusiness()]
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
        robots='<meta name="robots" content="noindex,follow">\n' if meta.get("noindex") else "",
        ogtype=meta.get("ogtype", "website"),
        ogtitle=meta.get("ogtitle", meta["title"]),
        ogimage=SITE + ogpad,
        ogbreedte=ogbreedte,
        oghoogte=oghoogte,
        ogalt=meta.get("ogalt", "Hersteld kunststof kozijn met nieuwe Renolit folie"),
        favicon=FAVICON,
        fonts=fonts_koppen(ver),
        stylesheets=stylesheets,
        preload=preload,
        jsonld=jsonld,
        bodyclass=meta.get("bodyclass", ""),
        nav=render_kale_kop(meta["kaal"]) if meta.get("kaal") else render_nav(slug),
        inhoud=inhoud,
        footer="" if meta.get("kaal") else render_footer(),
        scripts=scripts + ("" if meta.get("noindex") else ANALYTICS),
    )


META_RE = re.compile(r"^\s*<!--\s*(\{.*?\})\s*-->\s*", re.S)


def substitueer(tekst):
    """{{bedrijf.telefoon}} en {{feit.doorlooptijd}} in de bron vervangen."""
    def rep(m):
        groep, sleutel = m.group(1), m.group(2)
        bron = {"bedrijf": BEDRIJF, "feit": FEITEN}[groep]
        return bron[sleutel]
    # Eerst de vaste blokken uit src/ (film, doorsnede, vergelijking): die bevatten
    # zelf ook plekhouders, zoals het reviewcijfer.
    for blok in ("film", "doorsnede", "vergelijking"):
        if "{{%s}}" % blok in tekst:
            bron = (SRC.parent / (blok + ".html")).read_text(encoding="utf-8")
            tekst = tekst.replace("{{%s}}" % blok, re.sub(r"<!--.*?-->\n", "", bron, count=1, flags=re.S).strip())
    tekst = tekst.replace("{{reviewstrook}}", render_reviewstrook())
    tekst = tekst.replace("{{reviewstrook_zakelijk}}", render_reviewstrook("Je klant is bij ons in goede handen"))
    tekst = tekst.replace("{{reviewbadge}}", render_reviewbadge())
    tekst = tekst.replace("{{reviewbadge_kort}}", render_reviewbadge(zin=False))
    # Cijfer en aantal als los veld, zodat main.js er de live stand in kan zetten.
    tekst = tekst.replace("{{rv.score}}", '<span data-rv="score">%s</span>' % BEDRIJF["reviews_score"])
    tekst = tekst.replace("{{rv.aantal}}", '<span data-rv="aantal">%s</span>' % BEDRIJF["reviews_aantal"])
    tekst = re.sub(r"\{\{(bedrijf|feit)\.([a-z_]+)\}\}", rep, tekst)
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

    schrijf_sitemap([(s, m) for s, m, _ in paginas])
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
    """Vult het merksjabloon; alle merkpagina's delen dus één opmaak."""
    n = merk["naam"]
    meta = {
        "title": f"{n} kozijn verkleurd? Folie herstellen | iWrap",
        "description": (
            f"Folie van je {n}-kozijn laat los of is verkleurd? iWrap haalt de "
            f"oude laag eraf en brengt nieuwe Renolit folie aan. Vaak zonder het "
            f"kozijn te vervangen."
        ),
        "ogtitle": f"{n}-kozijnen herstellen met Renolit folie",
        "bodyclass": "tekstpagina",
        "css": ["content"],
        "kruimels": [("Kozijnmerken", "/kozijnmerken"), (n, f"/kozijnmerken/{merk['slug']}")],
        "ogimage": "/images/na-herstelde-kozijnhoek-1600.webp",
    }
    inhoud = sjabloon
    for sleutel, waarde in [
        ("naam", n),
        ("slug", merk["slug"]),
        ("land", merk["land"]),
        ("kenmerk", merk["kenmerk"]),
        ("herkenning", merk["herkenning"]),
    ]:
        inhoud = inhoud.replace("{{merk." + sleutel + "}}", waarde)
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
    inhoud = inhoud.replace("{{merk.dealerblok}}", dealerblok)
    return meta, inhoud


def schrijf_sitemap(paginas):
    regels = []
    for slug, meta in paginas:
        if meta.get("noindex"):
            continue
        prio = meta.get("prioriteit", "0.7")
        regels.append(
            f"  <url><loc>{SITE}{url_for(slug)}</loc>"
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
