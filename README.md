# iwrap.nl

De hoofdsite. Kozijnwrap.nl en houtnerffolie.nl leggen uit; **deze site offreert**.

## Het idee erachter

Je hebt geen tekort aan aanvragen — je hebt een tekort aan tijd. De planning zit vol,
de omzet is goed, en het knelpunt zit in de mail: elke offerte kost drie of vier
berichten heen en weer over aantallen, welke delen, hoe hoog het zit en welke kleur.

Deze site is daarom niet gebouwd om méér leads te vangen, maar om **completere leads**
te vangen. Het hart is `/offerte`: een formulier in zes stappen dat precies de vragen
stelt die anders per mail gesteld moeten worden, met een prijsindicatie die onderweg
meeloopt. Wie het invult stuurt een aanvraag waar je direct een offerte van kunt maken.
Wie schrikt van de indicatie, haakt af vóórdat het jou vier mailtjes heeft gekost.

Daarnaast staat er expliciet op de site wat je **niet** doet (krom kozijn, kapot beslag,
lekkage, aluminium schil). Dat scheelt de aanvragen die toch nergens toe leiden.

## Wat er nieuw is ten opzichte van de oude site

| | Oud | Nieuw |
|---|---|---|
| Techniek | WordPress + Slider Revolution | Statische HTML, geen build-afhankelijkheden behalve Python |
| Offerte | Contactformulier | Zes stappen met diagnose, prijsindicatie en foto-upload |
| Prijzen | Niet genoemd | Eigen pagina, plus indicatie in het formulier |
| Zakelijk | Niets | Pagina's voor VvE's/corporaties en voor kozijndealers |
| Merken | Opsomming in een zin | Eigen pagina per merk (8 stuks) |
| Bewijs | Drie reviews | Voor/na-schuifbalken met je eigen foto's |

De pagina `/voor-kozijnbedrijven` is de belangrijkste toevoeging voor de lange termijn:
het verwijzingsmodel (Weru en anderen) levert de best voorgekwalificeerde klanten en
stond nergens uitgelegd.

## Bewerken en bouwen

De HTML in de repo-root is **gegenereerd** — bewerk die bestanden niet met de hand.
De bron staat in `src/pages/`, de gedeelde `<head>`, navigatie en footer in `build.py`.

```bash
python3 build.py
```

Dat schrijft alle pagina's naar de root en genereert `sitemap.xml` en `robots.txt`
opnieuw. Draai het na élke wijziging in `src/`, `css/` of `js/` — die bestanden krijgen
een versiehash mee in de URL, en die wordt bij het bouwen bepaald.

Lokaal bekijken:

```bash
python3 serve.py
```

Dan draait de site op http://localhost:8010 met dezelfde schone URL's als op Vercel
(`/kosten` in plaats van `/kosten.html`).

### Een pagina toevoegen

Eén bestand in `src/pages/` zetten en bouwen. Elk bronbestand begint met een JSON-blok
in een HTML-comment (titel, omschrijving, welke stylesheets en scripts, structured data,
kruimelpad), gevolgd door de inhoud. Moet de pagina in de navigatie, zet hem dan in
`NAV` bovenin `build.py`; `FOOTER_KOLOMMEN` staat er direct onder.

### Een kozijnmerk toevoegen

Eén regel bijzetten in `MERKEN` in `build.py` en bouwen. Alle merkpagina's delen
`src/merk-sjabloon.html`, dus ze blijven vanzelf gelijk. Zet `"dealer": True` bij een
merk waarvan de dealers naar je doorverwijzen — dan komt daar een extra blok op.

### Een foto toevoegen

Zet het origineel in `images/` als `naam-640.webp`, `naam-1000.webp`,
`naam-1600.webp` en `naam-1000.jpg`. In de bron schrijf je dan:

```html
<x-beeld src="naam" alt="Wat er te zien is" sizes="(max-width:900px) 100vw, 560px">
```

De generator maakt daar een volledige `<picture>` van, met de juiste afmetingen erbij
(tegen verspringende pagina's) en lazy loading. Zet `eager` erbij voor de eerste foto
boven de vouw — dat is er nu precies één, op de homepage.

## Structuur

```
build.py                  Generator
serve.py                  Lokale server met schone URL's
vercel.json               cleanUrls, cachekoppen, redirects van oude URL's
src/pages/                De bron van elke pagina
src/merk-sjabloon.html    Eén opmaak voor alle merkpagina's

index.html                Homepage                              (gegenereerd)
offerte.html              Het aanvraagformulier — de kern       (gegenereerd)
kunststof-kozijn-herstellen.html  De belangrijkste SEO-pagina   (gegenereerd)
werkwijze.html            Zes stappen met foto's                (gegenereerd)
kosten.html               Prijzen en waar ze vandaan komen      (gegenereerd)
voorbeelden.html          Voorbeelden van ons werk              (gegenereerd)
veelgestelde-vragen.html  Alle vragen op één plek               (gegenereerd)
werkgebied.html           Regio's waar je gewerkt hebt          (gegenereerd)
vve-en-woningcorporaties.html                                   (gegenereerd)
voor-kozijnbedrijven.html Het verwijzingsmodel                  (gegenereerd)
over-iwrap.html           (gegenereerd)
contact.html              (gegenereerd)
kozijnmerken/             Hub + 8 merkpagina's                  (gegenereerd)
404.html                  (gegenereerd)

css/style.css             Gedeeld: kleuren, typografie, knoppen, kaarten, header, footer
css/home.css              Alleen de homepage
css/content.css           Tekstpagina's
css/offerte.css           Alleen het formulier
js/main.js                Menu, voor/na-schuif, scroll-animaties
js/offerte.js             Het stappenformulier
images/                   Elke foto als webp op drie breedtes, met een jpg als terugval
```

## Huisstijl

- **Kleur.** Mint (`--mint`, uit je logo) en antraciet (`--ink`). Daarnaast een terracotta
  (`--rust`) die uit de baksteen op je eigen foto's komt. Dat is geen willekeurige derde
  kleur: op de hele site staat terracotta voor "voor"/schade en mint voor "na"/hersteld.
- **Let op bij het mint.** `--mint` is voor vlakken, randen en iconen. Zodra er tekst op
  wit komt, gebruik je `--mint-ink` — `--mint` haalt met wit maar 1,7:1 en is dan
  onleesbaar.
- **Letters.** Montserrat voor koppen en knoppen (dat is je bestaande huisstijl, en het
  iWrap-blok op kozijnwrap.nl leent hem bewust), Inter voor de lopende tekst.

## Het offerteformulier laten verzenden

Op dit moment staat in `js/offerte.js` bovenaan:

```js
var ACCESS_KEY = 'VERVANG_MET_JE_WEB3FORMS_KEY';
```

Zolang die plaatshouder er staat, opent het formulier bij verzenden de mailclient van
de bezoeker met de complete samenvatting erin. Dat werkt, maar foto's moet hij dan zelf
als bijlage toevoegen. Om het echt te laten binnenkomen:

1. Vraag op [web3forms.com](https://web3forms.com) een gratis access key aan met
   info@iwrap.nl.
2. Zet die key in `js/offerte.js` en draai `python3 build.py`.
3. Klaar — inzendingen komen met foto's en al in je mailbox.

**Richting een CRM.** Het formulier stuurt naast de leesbare samenvatting ook een veld
`gegevens_json` mee met alle antwoorden los. Een Make.com-scenario (of straks je CRM)
kan dat rechtstreeks uitlezen zonder de tekst te hoeven ontleden — dan komt een aanvraag
als kaart in je CRM te staan in plaats van als mailtje. Wil je het meteen zo:
vervang de `fetch`-aanroep onderin `js/offerte.js` door je Make-webhook-URL.

## Live: waar hij staat

**https://iwrap-website.vercel.app** — hier kun je hem altijd live bekijken.

- GitHub: `maxdehaan1/iWrap-website`, productiebranch `main`
- Vercel: project `iwrap-website` in team Max, gekoppeld aan die repo

Zelfde opzet als kozijnwrap.nl en houtnerffolie.nl, en dezelfde volgorde waarin het is
gedaan: **eerst de GitHub-repo, dan die repo importeren in Vercel.** Andersom kan ook,
maar dan moet je de koppeling achteraf alsnog leggen.

Het domein iwrap.nl blijft ongemoeid tot je het zelf koppelt. Doe dat in Vercel onder
Settings → Domains van dit project.

### Daarna: elke wijziging live krijgen

```bash
python3 build.py            # de HTML in de root opnieuw genereren
git add -A && git commit -m "wat je veranderd hebt"
git push
```

Vercel bouwt automatisch opnieuw bij elke push naar `main`. **Vergeet `build.py` niet** —
Vercel draait hem niet, het is de gegenereerde HTML in de repo die geserveerd wordt.

### Twee dingen om te weten

- **De canonicals wijzen naar `https://www.iwrap.nl`**, ook op het vercel.app-adres. Dat is
  precies de bedoeling: Google ziet dan dat de echte versie op je eigen domein staat en
  behandelt het voorbeeld niet als een concurrerende kopie. Niet weghalen.
- **De repo is publiek**, dus de Web3Forms-key die je er straks in zet is voor iedereen te
  zien. Dat is bij Web3Forms normaal — die key hoort client-side te staan — maar zet in je
  Web3Forms-account wél de domeinbeperking aan, anders kan iemand anders formulieren naar
  jouw mailbox sturen.

## Reviews

Score, aantal en de reviewteksten staan in **`reviews.json`** en nergens anders. Header,
homepage, footer en de structured data lezen daar allemaal uit.

```bash
python3 reviews.py     # haalt de actuele Google-reviews op
python3 build.py       # zet ze op de site
```

`reviews.py` doet zonder API-sleutel niets — dan blijft `reviews.json` gewoon staan en
bouwt de site door met de laatst opgehaalde reviews. Een build gaat dus nooit stuk omdat
Google even niet bereikbaar is.

**Verversen aanzetten:** maak in console.cloud.google.com een project, zet de *Places API
(New)* aan, maak een API-sleutel en beperk hem tot die ene API. Zet hem daarna in je
omgeving — **niet in de repo, die is openbaar**:

```bash
echo 'export GOOGLE_PLACES_API_KEY="AIza..."' >> ~/.zshrc
```

Kosten zijn in de praktijk nul: je haalt ze een paar keer per maand op en Google geeft
maandelijks $200 gratis tegoed.

**Waarom niet de Trustindex-widget?** Die draait op je huidige site en is wél live, maar
het is een extern script dat de pagina vertraagt en dat verdwijnt zodra iwrap.nl deze
site serveert. Deze opzet houdt de site snel en de reviews in je eigen beheer.

## Wat er nog moet gebeuren

**Voordat de site live gaat:**

1. **Controleer het reviewcijfer.** In `build.py` staat `BEDRIJF["reviews_score"] = "4,9"`
   en `reviews_aantal = "81"` — overgenomen van kozijnwrap.nl. Je huidige site zegt
   "80 recensies". Zet het juiste aantal in `build.py`; het werkt door in de footer, de
   homepage én de structured data.
2. **Vul KvK en btw-id in** in `BEDRIJF` in `build.py`. Die horen op de site te staan en
   staan nu nergens. Zolang ze leeg zijn, laat de footer ze gewoon weg.
3. **Web3Forms-key regelen** (zie hierboven), anders loopt elke aanvraag via de
   mailclient van de bezoeker.
4. **Controleer twee claims** die ik van je bestaande sites heb overgenomen maar niet zelf
   kan verifiëren: "gecertificeerde monteurs in vaste dienst" en "na vijftien tot twintig
   jaar is de fabrieksfolie op". De eerste staat al op kozijnwrap.nl, de tweede is mijn
   formulering — pas hem aan als jouw praktijkgetal anders is.

**Bij het overzetten van het domein:**

- De oude site draait op URL's mét slash (`/werkwijze/`), deze op URL's zónder
  (`/werkwijze`). `vercel.json` heeft `trailingSlash: false`, dus Vercel stuurt de oude
  variant automatisch door met een 301. De vier bestaande URL's
  (`/kunststof-kozijn-herstellen`, `/werkwijze`, `/over-iwrap`, `/contact`) zijn
  ongewijzigd overgenomen — dáár zit je ranking, dus die moeten blijven.
- In `vercel.json` staan alvast redirects voor een paar URL's die mensen intypen
  (`/prijzen`, `/faq`, `/kozijnherstel`). Kom je in Search Console andere oude URL's
  tegen met inkomende links, zet ze daar dan bij.
- Dien `sitemap.xml` opnieuw in via Search Console zodra de nieuwe pagina's live staan.

**Later, als je zin hebt:**

- **Echte projecten op `/voorbeelden`.** Nu staan er vijf voor/na-paren van één klus. Elke
  nieuwe klus met een fatsoenlijke voor- en na-foto kun je erbij zetten — mét plaatsnaam,
  want dat is precies waar "kunststof kozijnen herstellen [plaats]" op gaat ranken.
- **Meer merkpagina's.** Eén regel in `MERKEN` per merk. Kandidaten: Rehau, Deceuninck,
  Aluplast, Salamander.
- **Werkgebied uitbreiden.** In `REGIOS` in `build.py` staan alleen plaatsen waar je
  echt geweest bent. Hou dat zo — een lijst met alle Nederlandse gemeenten wordt door
  Google als spam gelezen en werkt averechts.
- **Geen analytics ingebouwd.** Wil je zien hoeveel aanvragen er binnenkomen en waar ze
  vandaan komen, dan is Vercel Analytics één regel werk.

## Feiten die op meerdere sites staan

Deze staan óók op kozijnwrap.nl en houtnerffolie.nl. Verander je ze hier, verander ze
daar dan mee — drie sites die verschillende bedragen of garantietermijnen noemen is voor
een klant alleen maar verwarrend. Ze staan hier op één plek, in `FEITEN` in `build.py`:

- Een paar dorpels: rond de €500
- Meerdere kozijnen of een woning: €500 – €3.000
- Vervangen ter vergelijking: €1.200 – €2.500 per kozijn, en dat is *alléén* het kozijn
  met glas en montage — stucwerk, schilderwerk, vensterbanken en afvoer komen erbij
- Tien jaar fabrieksgarantie op de folie, vijf jaar op de montage
- Kunststof profiel gaat 50 tot 75 jaar mee
- Doorlooptijd: een tot twee dagen
- Reactie binnen één werkdag

De prijsindicatie in het formulier gebruikt dezelfde bedragen, maar staat apart in
`js/offerte.js` in de constante `PRIJS`. Pas je `FEITEN` aan, loop dan even langs `PRIJS`.

## Verhouding tot de andere twee sites

- **iwrap.nl** (deze) — hier wordt besloten en aangevraagd. Enige plek met een formulier.
- **kozijnwrap.nl** — vangt wie nog niet weet dat folieherstel bestaat, en doet de
  diagnose herstellen-of-vervangen. Stuurt door hierheen.
- **houtnerffolie.nl** — de diepte over de folie zelf: decors, kleuren, specificaties.

Bouw op deze site dus géén kleurenoverzicht en géén keuzehulp — dan gaan de drie sites
met elkaar concurreren in plaats van elkaar aanvullen. Waar het onderwerp langskomt,
wordt er doorverwezen (op `/offerte` bij de kleurkeuze, op `/kosten` bij de
herstellen-of-vervangen-vraag).
