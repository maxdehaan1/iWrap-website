#!/usr/bin/env python3
"""
Bouwt kozijnhorren.nl uit kozijnhorren/src/pages/ naar kozijnhorren/.

Dezelfde opzet als iwrap.nl (build.py in de repo-root): elke bron begint met een
JSON-blok in een HTML-comment, de rest is inhoud. Alles wat op elke pagina gelijk
is -- aankondigingsbalk, kop, winkelmand, footer -- staat hier.

Het assortiment, de prijzen, de kleuren en de winkelgegevens staan NIET hier maar
in backend/data/ (horren.json, folies.json, ral.json, winkel.json). Die leest de
kassa ook, dus de winkel kan nooit een andere prijs tonen dan er afgerekend wordt.

Gebruik:  python3 kozijnhorren/build.py
"""

import hashlib
import json
import re
import sys
from pathlib import Path
from urllib.parse import quote

HIER = Path(__file__).resolve().parent
REPO = HIER.parent
SRC = HIER / "src" / "pages"
DATA = REPO / "backend" / "data"

sys.path.insert(0, str(REPO))
from build import controleer_js  # noqa: E402  dezelfde stringcontrole als iwrap.nl


def lees(naam):
    return json.loads((DATA / naam).read_text(encoding="utf-8"))


WINKEL = lees("winkel.json")
CAT = lees("horren.json")
FOLIES = lees("folies.json")["folies"]
RAL = lees("ral.json")["kleuren"]
BASIS, LUXE = CAT["producten"]["basis"], CAT["producten"]["luxe"]
MAAT = CAT["maatgrenzen"]

SITE = "https://" + WINKEL["domein"]
# De API draait op iwrap.nl (zie backend/). Lokaal pakt de winkel vanzelf
# localhost:8010; dat regelt js/winkel.js.
API = "https://www.iwrap.nl/api"

NAV = [
    ("bestellen", "Bestellen"),
    ("inklemhor", "De hor"),
    ("meetinstructie", "Meten"),
    ("kleuren", "Kleuren"),
    ("veelgestelde-vragen", "Hulp"),
]

FOOTER_KOLOMMEN = [
    ("Winkel", [
        ("bestellen", "Bestel je horren"),
        ("inklemhor", "Basis of Luxe"),
        ("kleuren", "Kleuren"),
    ]),
    ("Hulp", [
        ("meetinstructie", "Meten en plaatsen"),
        ("veelgestelde-vragen", "Veelgestelde vragen"),
        ("levering-en-retour", "Levering en pasgarantie"),
    ]),
    ("Over", [
        ("over-ons", "Over ons"),
        ("voorwaarden", "Voorwaarden"),
        ("privacy", "Privacy"),
    ]),
]


# ---------------------------------------------------------------------------
# Afgeleide gegevens
# ---------------------------------------------------------------------------

def euro(n):
    return "€ " + "{:,.0f}".format(n).replace(",", ".")


def alle_prijzen(p):
    return [x for rij in p["prijstabel"]["prijzen"] for x in rij]


VANAF = min(alle_prijzen(BASIS))
LUXE_VANAF = min(alle_prijzen(LUXE))
LEV = CAT["levering"]
PASGARANTIE_DAGEN = CAT["pasgarantie"]["melden_binnen_dagen"]


def levertijd_tekst():
    van, tot = LEV["werkdagen"]
    return "%d tot %d werkdagen" % (van, tot)


def cm(mm):
    return ("%g" % (mm / 10)).replace(".", ",")


def prijs_voor(p, b, h):
    t = p["prijstabel"]
    bi = next(i for i, x in enumerate(t["breedtes"]) if b <= x)
    hi = next(i for i, x in enumerate(t["hoogtes"]) if h <= x)
    return t["prijzen"][bi][hi]


def render_prijstabel(p):
    t = p["prijstabel"]
    kop = "".join("<th>tot %s cm</th>" % cm(h) for h in t["hoogtes"])
    rijen = []
    for b, rij in zip(t["breedtes"], t["prijzen"]):
        cellen = "".join("<td>%s</td>" % euro(x) for x in rij)
        rijen.append('<tr><th scope="row">tot %s cm</th>%s</tr>' % (cm(b), cellen))
    return ('<div class="tabel-wrap"><table class="prijstabel"><caption>%s, prijs per hor inclusief btw. '
            'Breedte naar beneden, hoogte naar rechts. Gratis bezorgd.</caption>'
            '<thead><tr><th>Breedte \\ hoogte</th>%s</tr></thead><tbody>%s</tbody></table></div>'
            % (p["naam"], kop, "".join(rijen)))


def render_prijsvoorbeelden():
    voorbeelden = [("Klein raam", "Toilet, badkamer", 500, 800),
                   ("Gewoon raam", "Slaapkamer, keuken", 800, 1200),
                   ("Groot raam", "Woonkamer", 1200, 1600)]
    rijen = "".join(
        "<tr><td><b>%s</b><br><small>%s &times; %s cm &middot; %s</small></td><td>%s</td><td>%s</td></tr>"
        % (titel, cm(b), cm(h), waar, euro(prijs_voor(BASIS, b, h)), euro(prijs_voor(LUXE, b, h)))
        for titel, waar, b, h in voorbeelden)
    return ('<div class="tabel-wrap"><table class="voorbeeldtabel"><thead><tr><th>Voorbeeld</th>'
            '<th>Basis</th><th>Luxe</th></tr></thead><tbody>%s</tbody></table></div>' % rijen)


def render_kleuren():
    uit = []
    for k in CAT["kleuren"]["standaard"]:
        uit.append('<li><span class="stip-groot" style="--kleur:%s" aria-hidden="true"></span>'
                   '<b>%s</b><small>RAL %s</small></li>' % (k["hex"], k["naam"], k["code"]))
    uit.append('<li class="alle"><span class="stip-groot regenboog" aria-hidden="true"></span>'
               "<b>Elke andere kleur</b><small>met de Luxe</small></li>")
    return '<ul class="kleurenrij">' + "".join(uit) + "</ul>"


def render_folietabel():
    rijen = []
    for f in FOLIES:
        naam, hexkleur = RAL.get(f["ral"], ["RAL " + f["ral"], "#ccc"])
        std = any(k["code"] == f["ral"] for k in CAT["kleuren"]["standaard"])
        soort = {"houtnerf": " <small>(houtnerf)</small>", "metallic": " <small>(metallic)</small>"}.get(f["soort"], "")
        rijen.append(
            '<tr><td>%s%s</td><td><span class="stip" style="--kleur:%s" aria-hidden="true"></span>'
            'RAL %s %s</td><td>%s</td></tr>'
            % (f["naam"], soort, hexkleur, f["ral"], naam, "Basis en Luxe" if std else "Luxe"))
    return ('<div class="tabel-wrap"><table class="folietabel"><thead><tr><th>Folie op je kozijn</th>'
            '<th>Horkleur</th><th>Te kiezen bij</th></tr></thead><tbody>%s</tbody></table></div>'
            % "".join(rijen))


def render_meetvideo():
    """De meetvideo van de leverancier, zodra die er is (winkel.json: meetvideo_url)."""
    url = WINKEL.get("meetvideo_url", "").strip()
    if not url:
        return ('<div class="video-plek">Hier komt de meetvideo. Tot die tijd: de stappen hieronder, '
                'of stuur ons een foto, dan kijken we mee.</div>')
    if url.endswith(".mp4"):
        return '<video class="video-plek" src="%s" controls preload="metadata" playsinline></video>' % url
    m = re.search(r"(?:youtu\.be/|v=|embed/)([\w-]{11})", url)
    if m:
        url = "https://www.youtube-nocookie.com/embed/" + m.group(1)
    return ('<iframe class="video-plek" src="%s" title="Meetvideo" loading="lazy" allowfullscreen '
            'style="border:0;width:100%%"></iframe>' % url)


def whatsapp(tekst=""):
    return "https://wa.me/%s%s" % (WINKEL["whatsapp"], ("?text=" + quote(tekst)) if tekst else "")


def catalogus_js():
    """Het assortiment voor de browser, zodat de winkel zonder te wachten een
    prijs kan laten zien. De kassa rekent het zelf nog een keer na."""
    data = {k: v for k, v in CAT.items() if not k.startswith("_")}
    data["folies"] = FOLIES
    data["ral"] = RAL
    data["api"] = API
    data["winkel"] = {k: WINKEL[k] for k in ("naam", "domein", "whatsapp", "email", "telefoon")}
    return ("/* Gegenereerd door kozijnhorren/build.py uit backend/data/. Niet met de hand bewerken. */\n"
            "window.HORREN = " + json.dumps(data, ensure_ascii=False, separators=(",", ":")) + ";\n")


# ---------------------------------------------------------------------------
# Beeld: de hor als productfoto, en een raam met hor. Getekend in SVG, zodat
# hij in elke kleur kan: de kleur komt uit de CSS-variabele --kleur (hor) en
# --kozijn (kozijn). Luxe krijgt het fijnere, lichtere gaas (class "luxe").
# Zodra er echte productfoto's zijn, kunnen die hiervoor in de plaats komen.
# ---------------------------------------------------------------------------

SVG_HOR = """<svg class="hor-svg" viewBox="0 0 300 380" role="img" aria-label="{label}">
  <defs>
    <pattern id="gaas-{id}" width="4" height="4" patternUnits="userSpaceOnUse"><path d="M0 0H4M0 0V4" class="gaas-lijn"/></pattern>
    <linearGradient id="glans-{id}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#fff" stop-opacity=".22"/><stop offset=".5" stop-color="#fff" stop-opacity="0"/></linearGradient>
  </defs>
  <ellipse cx="150" cy="366" rx="112" ry="9" class="schaduw"/>
  <rect x="38" y="16" width="224" height="336" rx="5" class="hor-kader"/>
  <rect x="52" y="30" width="196" height="308" rx="1.5" class="hor-binnen"/>
  <rect x="52" y="30" width="196" height="308" fill="url(#gaas-{id})" class="hor-gaas"/>
  <rect x="52" y="30" width="196" height="308" fill="url(#glans-{id})"/>
  <rect x="140" y="20" width="20" height="7" rx="2" class="trekstrip"/>
  <rect x="33" y="96" width="7" height="30" rx="2" class="clip"/><rect x="33" y="244" width="7" height="30" rx="2" class="clip"/>
  <rect x="260" y="96" width="7" height="30" rx="2" class="clip"/><rect x="260" y="244" width="7" height="30" rx="2" class="clip"/>
</svg>"""

SVG_RAAM = """<svg class="raam-svg" viewBox="0 0 420 460" role="img" aria-label="{label}" preserveAspectRatio="xMidYMid slice">
  <defs>
    <linearGradient id="lucht-{id}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#c9dde3"/><stop offset="1" stop-color="#eef2ea"/></linearGradient>
    <pattern id="steen-{id}" width="64" height="28" patternUnits="userSpaceOnUse"><rect width="64" height="28" fill="#e6dccd"/><path d="M0 14H64M0 28H64M32 0V14M0 14V28M64 14V28" stroke="#d9ccbb" stroke-width="2"/></pattern>
    <pattern id="rgaas-{id}" width="3.4" height="3.4" patternUnits="userSpaceOnUse"><path d="M0 0H3.4M0 0V3.4" class="gaas-lijn"/></pattern>
  </defs>
  <rect width="420" height="460" fill="url(#steen-{id})"/>
  <rect x="70" y="38" width="280" height="370" rx="3" class="kozijn"/>
  <rect x="92" y="60" width="236" height="326" fill="url(#lucht-{id})"/>
  <path d="M92 300c30-30 60-20 90-45s70-10 100-40 40-10 46-12V386H92z" fill="#9fbf9a" opacity=".55"/>
  <path d="M92 330c40-20 80-10 120-30s80 0 116-20V386H92z" fill="#7ea57a" opacity=".55"/>
  <path d="M150 60 92 150v30L176 60zM226 60 92 256v22L242 60z" fill="#fff" opacity=".28"/>
  <rect x="98" y="66" width="224" height="314" fill="url(#rgaas-{id})" class="hor-gaas"/>
  <rect x="102.5" y="70.5" width="215" height="305" rx="1.5" fill="none" class="hor-rand"/>
  <rect x="200" y="72" width="20" height="4" class="hor-rand-vlak"/>
  <rect x="56" y="404" width="308" height="16" rx="2" fill="#b9ae9f"/>
  <rect x="56" y="418" width="308" height="5" fill="#9f9588"/>
</svg>"""

ICONEN = {
    "pas": '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 17 17 3l4 4L7 21H3z"/><path d="m7 13 2 2M10 10l2 2M13 7l2 2"/></svg>',
    "boor": '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="m5.6 5.6 12.8 12.8"/><path d="M9 12h6"/></svg>',
    "bus": '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 6h11v10H3zM14 9h4l3 3v4h-7z"/><circle cx="7" cy="17.5" r="1.8"/><circle cx="17" cy="17.5" r="1.8"/></svg>',
    "kleur": '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3a9 9 0 1 0 0 18c1.2 0 1.8-.9 1.8-1.8 0-1.3-1-1.6-1-2.7 0-1 .8-1.7 1.8-1.7H17a4 4 0 0 0 4-4C21 6.6 17 3 12 3z"/><circle cx="7.5" cy="11" r="1"/><circle cx="10" cy="7" r="1"/><circle cx="15" cy="7" r="1"/></svg>',
    "klok": '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>',
    "slot": '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="5" y="10" width="14" height="10" rx="2"/><path d="M8 10V7a4 4 0 0 1 8 0v3"/></svg>',
    "meter": '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="2" y="8" width="20" height="8" rx="1.5"/><path d="M6 8v3M10 8v4M14 8v3M18 8v4"/></svg>',
    "hand": '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 11V5.5a1.5 1.5 0 0 1 3 0V11m0-1.5v-6a1.5 1.5 0 0 1 3 0V11m0-4.5a1.5 1.5 0 0 1 3 0V12m0-2.5a1.5 1.5 0 0 1 3 0V15a6 6 0 0 1-6 6h-1.5a6 6 0 0 1-5-2.7L3.8 14a1.5 1.5 0 0 1 2.5-1.7L7 13.5"/></svg>',
}


def svg_hor(label="Kozijnhor", uid="a"):
    return SVG_HOR.format(label=label, id=uid)


def svg_raam(label="Raam met kozijnhor", uid="r"):
    return SVG_RAAM.format(label=label, id=uid)


def icoon(naam):
    return '<span class="icoon">%s</span>' % ICONEN[naam]


def render_usp():
    items = [("pas", "Past altijd, of we maken een nieuwe"),
             ("boor", "Zonder boren of schroeven"),
             ("bus", "Gratis thuisbezorgd")]
    return ('<div class="usp-band"><ul class="breed">%s</ul></div>'
            % "".join("<li>%s<span>%s</span></li>" % (icoon(i), t) for i, t in items))


def render_vertrouwen():
    items = [("pas", "Pasgarantie", "Past hij niet? Dan maken we een nieuwe."),
             ("klok", "Snel in huis", "Klaar in %s." % levertijd_tekst()),
             ("slot", "Veilig betalen", "Met iDEAL, via Mollie.")]
    return ('<section class="vertrouwen"><div class="breed"><ul>%s</ul></div></section>'
            % "".join("<li>%s<div><b>%s</b><span>%s</span></div></li>" % (icoon(i), k, t) for i, k, t in items))


# ---------------------------------------------------------------------------
# Opbouw
# ---------------------------------------------------------------------------

# Het woordmerk: gewoon tekst in Figtree 900 (zie --logo in winkel.css). Het
# lettertype wordt alleen voor deze letters geladen, dus het kost bijna niets.
LOGO = "kozijnhorren.nl"

MELDINGEN = [
    "Past hij niet? Dan maken we een nieuwe",
    "Gratis thuisbezorgd in heel Nederland",
    "Zonder boren of schroeven geplaatst",
    "Klaar in " + levertijd_tekst(),
]


def url_for(slug):
    return "/" if slug == "index" else "/" + slug


def versie():
    h = hashlib.sha1()
    for d in ("css", "js"):
        for f in sorted((HIER / d).glob("*.*")):
            if f.name != "catalogus.js":
                h.update(f.read_bytes())
    h.update(catalogus_js().encode("utf-8"))
    return h.hexdigest()[:8]


def render_kop(slug):
    links = "\n".join(
        '      <a %shref="%s">%s</a>' % ('class="current" ' if s == slug else "", url_for(s), label)
        for s, label in NAV)
    meldingen = "".join('<li%s>%s</li>' % (' class="aan"' if i == 0 else "", m) for i, m in enumerate(MELDINGEN))
    return f"""<div class="aankondiging" aria-label="Voordelen">
  <button type="button" class="ak-vorige" aria-label="Vorige">&lsaquo;</button>
  <ul>{meldingen}</ul>
  <button type="button" class="ak-volgende" aria-label="Volgende">&rsaquo;</button>
</div>
<header class="kop">
  <div class="kop-binnen">
    <button class="menu-knop" aria-expanded="false" aria-controls="menu"><span class="streepjes" aria-hidden="true"></span><span class="sr-only">Menu</span></button>
    <a class="merk" href="/" aria-label="{WINKEL['naam']}, naar de homepage">{LOGO}</a>
    <nav class="menu" id="menu" aria-label="Hoofdmenu">
{links}
    </nav>
    <button type="button" class="mand-knop" aria-label="Winkelmand">
      <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 8h14l-1.2 11.2a2 2 0 0 1-2 1.8H8.2a2 2 0 0 1-2-1.8z"/><path d="M9 8V6a3 3 0 0 1 6 0v2"/></svg>
      <span class="mand-teller" hidden></span>
    </button>
  </div>
</header>"""


def render_mand():
    return """<div class="mand-laag" hidden></div>
<aside class="mand" id="mand" aria-label="Winkelmand" aria-hidden="true">
  <div class="mand-kop">
    <h2>Winkelmand</h2>
    <button type="button" class="mand-sluit" aria-label="Sluiten">&times;</button>
  </div>
  <div class="mand-inhoud">
    <ul class="mand-lijst"></ul>
    <div class="mand-leeg">
      <p>Je winkelmand is nog leeg.</p>
      <a class="knop knop-donker" href="/bestellen">Bereken je prijs</a>
    </div>
  </div>
  <div class="mand-voet" hidden>
    <div class="mand-totaal"><span>Totaal <small>incl. btw, gratis bezorgd</small></span><b class="mand-bedrag"></b></div>
    <p class="mand-levertijd"></p>
    <a class="knop knop-oranje knop-vol" href="/afrekenen">Afrekenen</a>
    <a class="mand-nog" href="/bestellen">+ Nog een raam toevoegen</a>
    <details class="mand-delen">
      <summary>Bestelling bewaren of doorsturen</summary>
      <p>Een link met deze horren erin. Handig als je bij iemand anders hebt gemeten, of later wilt afrekenen.</p>
      <div class="deel-knoppen">
        <a class="knop knop-rand knop-klein deel-whatsapp" href="#" target="_blank" rel="noopener">Via WhatsApp</a>
        <button type="button" class="knop knop-rand knop-klein deel-kopieer">Kopieer link</button>
      </div>
    </details>
  </div>
</aside>"""


def render_footer():
    kolommen = ""
    for titel, items in FOOTER_KOLOMMEN:
        links = "".join('<li><a href="%s">%s</a></li>' % (url_for(s), l) for s, l in items)
        kolommen += '<div class="vcol"><h2>%s</h2><ul>%s</ul></div>' % (titel, links)
    zakelijk = " &middot; ".join(x for x in [
        ("KvK " + WINKEL["kvk"]) if WINKEL["kvk"] else "",
        ("btw " + WINKEL["btw"]) if WINKEL["btw"] else ""] if x)
    return f"""<footer class="voet">
  <div class="breed voet-raster">
    <div class="vcol voet-merk">
      <a class="merk" href="/">{LOGO}</a>
      <p>{WINKEL['tagline']}. Op maat gemaakt, zonder boren geplaatst, en als hij niet past maken we een nieuwe.</p>
      <p class="voet-contact"><a href="{whatsapp()}">WhatsApp {WINKEL['telefoon']}</a><br>
      <a href="mailto:{WINKEL['email']}">{WINKEL['email']}</a></p>
    </div>
    {kolommen}
  </div>
  <div class="breed voet-onder">
    <p>&copy; 2026 {WINKEL['naam']}, een handelsnaam van {WINKEL['juridisch']}, {WINKEL['adres']}{(' &middot; ' + zakelijk) if zakelijk else ''}</p>
    <p class="betalen"><span class="betaal-label">iDEAL</span><span class="betaal-label">Mollie</span></p>
  </div>
</footer>"""


HEAD = """<!DOCTYPE html>
<html lang="nl">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>{title}</title>
<meta name="description" content="{description}">
<link rel="canonical" href="{canonical}">
{robots}<meta property="og:type" content="website">
<meta property="og:site_name" content="{naam}">
<meta property="og:locale" content="nl_NL">
<meta property="og:title" content="{ogtitle}">
<meta property="og:description" content="{description}">
<meta property="og:url" content="{canonical}">
<meta name="theme-color" content="#f8f3ee">
<link rel="icon" href="/favicon.svg" type="image/svg+xml">
<script>document.documentElement.className+=" js";</script>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600&display=swap">
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Figtree:wght@900&display=block&text=kozijnhorren.nl">
<link rel="stylesheet" href="/css/winkel.css?v={ver}">
<script type="application/ld+json">{jsonld}</script>
</head>
<body class="{bodyclass}">
<a class="skip" href="#inhoud">Naar de inhoud</a>
{balk}{kop}
<main id="inhoud">
{inhoud}
</main>
{vertrouwen}{footer}
{mand}
<div class="toast" role="status" aria-live="polite" hidden></div>
<script src="/js/catalogus.js?v={ver}"></script>
<script src="/js/winkel.js?v={ver}" defer></script>
{scripts}</body>
</html>
"""


def winkel_schema():
    return {
        "@type": "OnlineStore",
        "@id": SITE + "/#winkel",
        "name": WINKEL["naam"],
        "url": SITE + "/",
        "email": WINKEL["email"],
        "telephone": WINKEL["telefoon_tel"],
        "slogan": WINKEL["tagline"],
        "areaServed": {"@type": "Country", "name": "Nederland"},
    }


def product_schema():
    return {
        "@type": "Product",
        "name": "Kozijnhor, inklemhor op maat",
        "description": "Inklemhor op maat voor draaikiepramen, zonder boren geplaatst. Basis met zwart gaas "
                       "in vier kleuren, of Luxe met bijna onzichtbaar gaas in elke RAL-kleur.",
        "brand": {"@type": "Brand", "name": WINKEL["naam"]},
        "offers": {
            "@type": "AggregateOffer",
            "priceCurrency": "EUR",
            "lowPrice": str(VANAF),
            "highPrice": str(max(alle_prijzen(LUXE))),
            "availability": "https://schema.org/InStock",
            "seller": {"@id": SITE + "/#winkel"},
        },
    }


def faq_schema(paren):
    return {"@type": "FAQPage", "mainEntity": [
        {"@type": "Question", "name": v, "acceptedAnswer": {"@type": "Answer", "text": a}} for v, a in paren]}


def substitueer(tekst):
    vervang = {
        "{{prijs.vanaf}}": euro(VANAF),
        "{{prijs.luxe_vanaf}}": euro(LUXE_VANAF),
        "{{levertijd}}": levertijd_tekst(),
        "{{ral.extra_werkdagen}}": str(CAT["kleuren"]["ral_extra_werkdagen"]),
        "{{pasgarantie.dagen}}": str(PASGARANTIE_DAGEN),
        "{{maat.breedte_min}}": cm(MAAT["breedte"]["min"]),
        "{{maat.breedte_max}}": cm(MAAT["breedte"]["max"]),
        "{{maat.hoogte_min}}": cm(MAAT["hoogte"]["min"]),
        "{{maat.hoogte_max}}": cm(MAAT["hoogte"]["max"]),
        "{{maat.middenregel}}": cm(MAAT["middenregel_vanaf_hoogte"]),
        "{{maat.uitsteek}}": str(MAAT["max_uitsteek_mm"]),
        "{{maat.aanslag}}": str(MAAT["min_aanslag_mm"]),
        "{{prijstabel.basis}}": render_prijstabel(BASIS),
        "{{prijstabel.luxe}}": render_prijstabel(LUXE),
        "{{prijsvoorbeelden}}": render_prijsvoorbeelden(),
        "{{kleuren}}": render_kleuren(),
        "{{folietabel}}": render_folietabel(),
        "{{meetvideo}}": render_meetvideo(),
        "{{usp}}": render_usp(),
        "{{whatsapp}}": whatsapp(),
        "{{whatsapp.meetcheck}}": whatsapp("Hoi, kunnen jullie mijn maten even controleren? Ik stuur foto's met de rolmaat erbij."),
        "{{whatsapp.twijfel}}": whatsapp("Hoi, ik weet niet zeker of jullie hor op mijn raam past. Ik stuur een foto."),
        "{{basis.gaas}}": BASIS["gaas"],
        "{{luxe.gaas}}": LUXE["gaas"],
        "{{basis.gaas_uitleg}}": BASIS["gaas_uitleg"],
        "{{luxe.gaas_uitleg}}": LUXE["gaas_uitleg"],
    }
    for k, v in vervang.items():
        tekst = tekst.replace(k, v)
    tekst = re.sub(r"\{\{svg\.hor:([a-z0-9]+)\}\}", lambda m: svg_hor(uid=m.group(1)), tekst)
    tekst = re.sub(r"\{\{svg\.raam:([a-z0-9]+)\}\}", lambda m: svg_raam(uid=m.group(1)), tekst)
    tekst = re.sub(r"\{\{icoon\.([a-z]+)\}\}", lambda m: icoon(m.group(1)), tekst)
    tekst = re.sub(r"\{\{winkel\.([a-z_]+)\}\}", lambda m: WINKEL[m.group(1)], tekst)
    rest = re.findall(r"\{\{[^}]+\}\}", tekst)
    if rest:
        raise SystemExit("onbekende plaatshouder(s): %s" % ", ".join(sorted(set(rest))))
    return tekst


def render(slug, meta, inhoud, ver):
    graph = [winkel_schema()]
    if meta.get("product"):
        graph.append(product_schema())
    if meta.get("faq"):
        graph.append(faq_schema([(q["v"], q["a"]) for q in meta["faq"]]))
    balk = ""
    if CAT.get("voorbeeldprijzen"):
        balk = ('<div class="proefbalk">Proefversie: de prijzen zijn nog voorbeeldprijzen '
                'en betalen gaat via een testkassa.</div>\n')
    scripts = "".join('<script src="/js/%s.js?v=%s" defer></script>\n' % (s, ver) for s in meta.get("js", []))
    return HEAD.format(
        title=meta["title"],
        description=meta["description"],
        canonical=SITE + url_for(slug),
        robots='<meta name="robots" content="noindex">\n' if meta.get("noindex") else "",
        naam=WINKEL["naam"],
        ogtitle=meta.get("ogtitle", meta["title"]),
        ver=ver,
        jsonld=json.dumps({"@context": "https://schema.org", "@graph": graph}, ensure_ascii=False, separators=(",", ":")),
        bodyclass=meta.get("bodyclass", ""),
        balk=balk,
        kop=render_kop(slug),
        inhoud=inhoud,
        vertrouwen="" if meta.get("zonder_vertrouwen") else render_vertrouwen(),
        footer=render_footer(),
        mand=render_mand(),
        scripts=scripts,
    )


META_RE = re.compile(r"^\s*<!--\s*(\{.*?\})\s*-->\s*", re.S)


def main():
    (HIER / "js" / "catalogus.js").write_text(catalogus_js(), encoding="utf-8")
    controleer_js(HIER / "js")
    ver = versie()
    paginas = []
    for bron in sorted(SRC.glob("*.html")):
        ruw = bron.read_text(encoding="utf-8")
        m = META_RE.match(ruw)
        if not m:
            raise SystemExit("%s: mist het JSON-metablok bovenaan" % bron)
        meta = json.loads(m.group(1))
        slug = bron.stem
        # Interne notities (<!-- CONCEPT ... -->) horen niet in de broncode van de site.
        inhoud = re.sub(r"<!--\s*CONCEPT.*?-->\s*", "", ruw[m.end():], flags=re.S)
        html = substitueer(render(slug, meta, inhoud, ver))
        (HIER / (slug + ".html")).write_text(html, encoding="utf-8")
        paginas.append((slug, meta))

    regels = ["  <url><loc>%s%s</loc></url>" % (SITE, url_for(s)) for s, m in paginas if not m.get("noindex")]
    (HIER / "sitemap.xml").write_text(
        '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n'
        + "\n".join(sorted(regels)) + "\n</urlset>\n", encoding="utf-8")
    (HIER / "robots.txt").write_text(
        "User-agent: *\nAllow: /\nDisallow: /afrekenen\nDisallow: /bestelling\n\nSitemap: %s/sitemap.xml\n" % SITE,
        encoding="utf-8")
    print("%d pagina's gebouwd voor %s (versie %s)" % (len(paginas), WINKEL["domein"], ver))


if __name__ == "__main__":
    main()
