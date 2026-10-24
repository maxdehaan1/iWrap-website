# iwrap.nl

De hoofdsite. Kozijnwrap.nl en houtnerffolie.nl leggen uit; **deze site offreert**.

## Het idee erachter

Je hebt geen tekort aan aanvragen — je hebt een tekort aan tijd. De planning zit vol,
de omzet is goed, en het knelpunt zit in de mail: elke offerte kost drie of vier
berichten heen en weer over aantallen, welke delen, hoe hoog het zit en welke kleur.

Deze site is daarom niet gebouwd om méér leads te vangen, maar om **completere leads**
te vangen. Het hart is `/offerte`: de klant laat op zijn eigen manier zien wat er moet
gebeuren (een foto aanstrepen, de maten erbij zetten, of tekenen op papier), altijd met
een foto van elk heel kozijn. Jij krijgt daar één mail van, met de foto's als bijlage,
waar je direct een offerte van kunt maken. Er staan bewust geen bedragen op de site
(zie "Wat er níet op de site mag").

Daarnaast staat er expliciet op de site wat je **niet** doet (krom kozijn, kapot beslag,
lekkage, aluminium schil). Dat scheelt de aanvragen die toch nergens toe leiden.

## Hoe alles samenhangt

Eén klant, van eerste vraag tot horren in de juiste kleur. Elke stap verwijst naar de
volgende, en jij ziet alles terug in de Max-modus (`/max`):

```
iwrap.nl/offerte          De klant laat zien wat er moet gebeuren (aanstrepen, maten
       |                  of op papier), met een foto van elk kozijn.
       v
mail in je Outlook        Per kozijn het werk, de foto's als bijlage, aanvraag.json.
       |                  Onderaan een link "maak er een klus van".
       v
Max-modus > Aanvragen     Dezelfde aanvraag, met de foto's. Knop "Klus aanmaken":
       |                  naam, adres, mail en het werk staan dan al in de klus.
       v
Max-modus > Klussen       Op locatie: de kozijncheck (zes onderdelen, stoplicht).
       |
       v
iwrap.nl/r/<id>           Het opleverrapport voor de klant: wat er gedaan is, de
       |                  garantie, de kozijncheck. Staan de horren op oranje of rood:
       |                  een tip met de kleur die bij de folie hoort.
       v
kozijnhorren.nl           Bestellen met die kleur al gekozen (/bestellen?kleur=7016).
       |
       v
Max-modus > kozijnhorren.nl   De bestelling, betaald via Mollie.
```

Verder verwijzen de sites naar elkaar waar het de klant helpt:

- Kiest iemand in het formulier **een andere kleur**, dan staat erbij dat de horren daarna
  nog de oude kleur hebben, met een link naar kozijnhorren.nl.
- Het formulier, de bevestigingsmail, de werkwijze en de homepage noemen de **gratis
  kozijncheck** bij de oplevering.
- De **footer van iwrap.nl** noemt de drie zustersites: kozijnwrap.nl (wanneer herstel
  zin heeft), houtnerffolie.nl (de folie), kozijnhorren.nl (horren in de kleur).
- **kozijnhorren.nl noemt iWrap** op "Over ons" (met het reviewcijfer uit
  `reviews.json`), in de veelgestelde vragen ("Wie zit er achter kozijnhorren.nl?") en
  in de footer, met een link naar de offerte voor wie het kozijn zelf wil laten herstellen.
  De winkel houdt wel zijn eigen uiterlijk (oranje, crème, Nunito): het is een winkel,
  geen dienst, en dat mag je zien.

## Wat er nieuw is ten opzichte van de oude site

| | Oud | Nieuw |
|---|---|---|
| Techniek | WordPress + Slider Revolution | Statische HTML, geen build-afhankelijkheden behalve Python |
| Offerte | Contactformulier (Tripetto, foto's achter de WordPress-login) | Drie manieren: foto aanstrepen, foto met maten, of op papier; één mail met alle foto's als bijlage |
| Prijzen | Niet genoemd | Eigen pagina: wat de prijs bepaalt, zonder bedragen |
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
src/film.html             De film: teksten en opmaak, via {{film}} op een pagina
src/doorsnede.html        De doorsnede van een onderdorpel, via {{doorsnede}}
src/vergelijking.html     Nieuw kozijn of herstellen, via {{vergelijking}}

index.html                Homepage                              (gegenereerd)
offerte.html              Het aanvraagformulier — de kern       (gegenereerd)
tekenblad.html            Tekenblad om te printen (op papier)   (gegenereerd)
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
kozijncheck.html          Uitleg van de gratis kozijncheck      (gegenereerd)
rapport.html              Het opleverrapport, op /r/<id>        (gegenereerd, noindex)
max.html                  De Max-modus, op /max                 (gegenereerd, noindex)
404.html                  (gegenereerd)

css/style.css             Gedeeld: kleuren, typografie, knoppen, kaarten, header, footer
css/home.css              Alleen de homepage
css/content.css           Tekstpagina's
css/offerte.css           Alleen het formulier, ook het aanstreepscherm
css/tekenblad.css         Het tekenblad, op het scherm en geprint op A4
css/rapport.css           Het rapport en de kozijncheck-pagina
css/max.css               De Max-modus
css/film.css              De film (homepage en /werkwijze)
css/doorsnede.css         De doorsnede en de vergelijking eronder
js/main.js                Menu, voor/na-schuif, scroll-animaties
js/film.js                De film van 15 seconden op de homepage
js/doorsnede.js           Speelt de doorsnede één keer af als hij in beeld komt
js/offerte.js             Het stappenformulier
js/fotos.js               Foto's verkleinen op de telefoon en bewaren in de browser
js/aanstrepen.js          Het aanstreepscherm (met de vinger op de foto)
js/rapport.js             Vult het rapport vanuit de API
js/max.js                 De Max-modus
js/vendor/                QR-code-bibliotheek (MIT), ongewijzigd
images/                   Elke foto als webp op drie breedtes, met een jpg als terugval
media/                    Videobestanden die op de site staan (de werkdag-video)

api/index.py              Vercel-ingang van de achterkant
backend/                  De achterkant: rapporten, kassa, mails (zie hieronder)
backend/data/             Kozijncheck, horren, prijzen, kleuren, winkelgegevens
tests/test_backend.py     Loopt de hele stroom door, van klus tot "past alles?"
prijslijst.py             Inkoopprijzen + marge -> verkoopprijzen voor de winkel
kozijnhorren/             kozijnhorren.nl: eigen site, eigen Vercel-project
video/                    Neemt de film op als MP4 (niet op de site, niet in git)
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

## Het offerteformulier

### Het idee

Je wilt niet langs, en toch snel een offerte kunnen maken. Klanten vinden het lastig om
op te schrijven welke delen er moeten gebeuren, en ze zijn niet allemaal even handig met
een telefoon. Daarom kiest de klant zelf **hoe** hij laat zien wat er moet gebeuren:

| Manier | Voor wie | Wat de klant doet |
|---|---|---|
| **Foto en aanstrepen** (het snelst) | Wie denkt: ik maak een foto en streep het aan | Per kozijn een foto; daarna opent vanzelf een scherm waarop hij met zijn vinger aanstreept wat er moet gebeuren. Of hij tikt "het hele kozijn". Maten mogen erbij, hoeven niet. |
| **Foto en maten** (het preciest) | Wie een rolmaat pakt | Per kozijn een foto, en per deel de lengte: hij tikt "+ Onderdorpel" en typt `1,60`, tikt "+ Stijl", zet het aantal op 2 en typt `130`. Moet het hele kozijn, dan alleen breedte × hoogte. |
| **Op papier** | Wie liever met pen en papier werkt | Kozijnen natekenen (op een gewoon vel, of op het tekenblad van `/tekenblad`), arceren wat er moet gebeuren, en er een foto van maken. Een maattekening van de leverancier mag ook. |

**Bij alle drie hoort een foto van elk kozijn in zijn geheel.** Dat staat al op het
keuzescherm, zodat niemand erdoor verrast wordt. Daaraan zie je het profiel, de kleur en
of herstel kan.

Een aanklikbare kozijntekening (vorm kiezen, delen aantikken) is bewust **niet** gebouwd:
te veel kozijntypes en maten, en voor ouderen te ingewikkeld. Ook een aanvinklijst per
kozijn zit er niet in: klanten kennen "onderdorpel" en "stijl" wel, en met de lengte
erbij heb je meer aan wat ze zelf typen.

### De stappen

1. **Manier**: de drie kaarten hierboven. Wisselen kan later altijd; de foto's blijven staan.
2. **Kozijnen**: per kozijn een kaart met drie genummerde vragen: (1) de foto, (2) wat er
   moet gebeuren (aanstrepen of maten, afhankelijk van de manier), (3) waar het zit
   (begane grond, verdieping, dakkapel; per kozijn, want daar hangt de steiger van af).
   Onderaan: "Komt dit kozijn vaker voor, met hetzelfde werk?" Drie gelijke
   slaapkamerramen zijn dus één kaart met één foto. Bij "Op papier" in plaats van
   kaarten: foto's van de tekening, foto's van de kozijnen (genummerd) en waar ze zitten.
3. **Kleur**: dezelfde houden of een andere.
4. **Gegevens**: naam, mail, telefoon, adres, opmerking.
5. **Versturen**: een overzicht met per kozijn een fotootje en wat er moet gebeuren, met
   bij elk blok een "Wijzig"-knop. Dan pas "Aanvraag versturen".

Klopt een kozijn nog niet, dan staat **bij die kaart** in gewone taal wat er ontbreekt
("Kies waar dit kozijn zit."), en de kop van de kaart wordt groen met "Compleet" zodra
alles er is. Maten mogen op elke manier worden getypt: `160`, `1,60` en `1.6` zijn
allemaal 160 cm, en naast het vak staat meteen "1,60 m" zodat de klant ziet dat het
klopt. Tot en met 10 lezen we als meters (`cm()` in `backend/aanvragen.py` en in
`offerte.js`, die twee moeten gelijk blijven).

### Het aanstreepscherm

Aanstrepen gebeurt op een eigen scherm dat de hele telefoon vult (`js/aanstrepen.js`).
Op een foto ín het formulier botst tekenen met scrollen: wie de pagina verschuift, zet
dan per ongeluk een streep. Het scherm gaat vanzelf open zodra er een foto gekozen is.
Er zijn drie knoppen (Ongedaan maken, Alles wissen, Klaar) en een link "Moet het hele
kozijn? Tik dan hier".

De streep is **geel als een markeerstift, met een donkere rand**. Terracotta (de kleur
van "voor" op de rest van de site) viel weg tegen baksteen, en daar zitten de meeste
kozijnen in. De strepen worden bewaard als lijnen in verhoudingen van de foto, en bij het
versturen op ware grootte op de foto gezet (`kozijn-1-aangestreept.jpg`).

### Foto's

`js/fotos.js` verkleint elke foto op de telefoon tot 1600 pixels (een telefoonfoto van
2 tot 12 MB wordt rond de 300 kB) en zet hem rechtop. De foto's worden in de browser
bewaard (IndexedDB), de antwoorden in localStorage: wie halverwege wegklikt, gaat later
verder waar hij was, mét foto's. Er gaat niets naar de server tot de klant op
"Aanvraag versturen" drukt.

### Versturen, en wat jij binnenkrijgt

In drie stappen (`backend/aanvragen.py`), zodat ook tien foto's op een matige
verbinding heel aankomen:

1. `POST /api/aanvragen`: de antwoorden. De server controleert alles en zegt welke foto's
   hij verwacht.
2. `PUT /api/aanvragen/<id>/fotos/<naam>`: elke foto apart, opnieuw geprobeerd als de
   verbinding hapert.
3. `POST /api/aanvragen/<id>/versturen`: alles compleet? Dan één mail aan jou en een
   bevestiging aan de klant. Nog een keer drukken stuurt niets dubbel.

**De mail aan jou** komt rechtstreeks in je eigen Outlook (zie "Mail via Microsoft 365"):

- Onderwerp: `Aanvraag Joke Jansen, Hilversum: 2 kozijnen, foto en maten`.
- Bovenin telefoon, mail, adres met een link naar Google Maps, de manier en de kleur.
- Per kozijn: waar het zit, hoe vaak het voorkomt, wat er moet gebeuren (bij maten in
  meters, met de opgegeven lengte al opgeteld) en welke foto's erbij horen.
- Onderaan "Samen": aantal kozijnen, opgegeven lengte, en hoeveel er op de verdieping of
  de dakkapel zitten.
- **Bijlagen** met een naam die zegt wat het is: `kozijn-1-foto.jpg`,
  `kozijn-1-aangestreept.jpg`, `kozijn-1-dichtbij.jpg`, `tekening-1.jpg`, plus
  `aanvraag.json` met alle gegevens.
- **Antwoorden** op die mail gaat naar de klant.

**Voor Claude (de offerte-ochtendronde):** de aanvraag is een gewone mail met gewone
jpg-bijlagen, dus die worden in de mailbox gelezen zoals elke andere mail met foto's. Lees
eerst `aanvraag.json`: daar staat alles als gegevens in (lengtes in centimeters, per
kozijn `regels` met deel, lengte en aantal, `aantal` = hoe vaak dat kozijn voorkomt,
`heel` = het hele kozijn). Bij de manier "streep" staat in `kozijn-N-aangestreept.jpg`
wat er moet gebeuren, bij "papier" op `tekening-N.jpg`; de `kozijn-N-foto.jpg` is altijd
het hele kozijn, voor profiel en kleur.

**De klant** krijgt een bevestiging met wat hij gestuurd heeft, en dat je een offerte met
een vaste totaalprijs stuurt. Bewust zonder termijn.

Op de server blijven een aanvraag en zijn foto's dertig dagen staan als reserve (een niet
verstuurde aanvraag twee dagen). De mail is het archief.

### De uitweg

Boven het formulier staat in gewone taal: *"Lukt het formulier u niet? Stuur ons gewoon
een mail."* Die mailtolink is voorgevuld met een kort lijstje. Lukt het versturen niet
(geen verbinding, server onbereikbaar), dan blijft alles staan en zijn er twee knoppen:
nog een keer proberen, of een mail met de antwoorden erin waar de klant zijn foto's bij
doet.

### Lokaal uitproberen

`python3 serve.py`, dan http://localhost:8010/offerte. Zonder Microsoft-koppeling komt
de mail in `.data/uitbak/` terecht: een HTML-bestand met de mail, en een map ernaast met
de bijlagen precies zoals ze verstuurd zouden worden. `python3 tests/test_backend.py`
loopt alle drie de manieren door, inclusief een ontbrekende foto en dubbel versturen.

### Valkuil bij het bewerken

Nederlandse teksten met een apostrof (`foto's`) in JavaScript altijd tussen dubbele
aanhalingstekens. `build.py` controleert dat, want die fout heeft het formulier een keer
stilgelegd. **Na elke wijziging in `js/`: open `/offerte` en kijk in de console.**

## Kozijncheck, Max-modus en het opleverrapport

Uitgewerkt uit het productplan "Horren op maat + kozijncheck" (september 2026). Bij elke
klus vult Max op zijn telefoon in tien minuten een kozijncheck in. De klant krijgt bij de
oplevering een persoonlijk rapport via een link of een QR-code.

| Waar | Voor wie | Wat |
|---|---|---|
| `/kozijncheck` | iedereen | Uitleg: zes onderdelen, stoplicht, voorbeeldrapport. Extra reden om voor iWrap te kiezen. |
| `/max` | Max | Invulscherm voor op locatie, plus de bestellingen van kozijnhorren.nl. Wachtwoord. |
| `/r/<id>` | de klant | Het opleverrapport. Niet vindbaar in Google, alleen met de link. |

**De zes onderdelen** (rubbers, kitwerk, glas, hang- en sluitwerk, horren, rolluiken) met
hun groen/oranje/rood en de adviestekst staan in `backend/data/kozijncheck.json`. De
Max-modus, het rapport én de uitlegpagina lezen daaruit. Een tekst aanpassen is daar één
keer doen en `python3 build.py`.

**Het rapport is meer dan de check.** Het is ook het opleverbewijs: wat er gedaan is,
welke folie, de opleverdatum en tot wanneer de garantie loopt (de termijnen komen uit
`FEITEN` in `build.py`). Daarnaast onderhoudstips voor de folie, een reviewknop (het
moment na de oplevering is het beste moment om een review te vragen) en, als de horren op
oranje of rood staan, een tip met een link naar kozijnhorren.nl. In die link zit de
horkleur die bij de folie hoort (`/bestellen?kleur=6009`, en bij een niet-standaardkleur
meteen de Luxe). De klant vult daar zelf de maten in; horren worden niet meer in de
Max-modus ingemeten. Het rapport noemt geen prijzen.

**Eerlijk invullen.** Bij de meeste klanten is bijna alles groen, en dat moet het rapport
ook laten zien; juist daardoor wordt een rood advies geloofd. De knop "Rest op groen" is
daarom een snelkoppeling voor wat je bekeken hebt, geen standaard.

### Zo werkt de Max-modus op locatie

De Max-modus heeft drie tabs, in de volgorde van een klus: **Aanvragen** (wat er via
de site binnenkwam), **Klussen** (kozijncheck en rapport) en **kozijnhorren.nl** (de
bestellingen).

1. `/max`, inloggen (de telefoon onthoudt het 120 dagen). Komt de klus uit een aanvraag
   van de site: **Aanvragen** > de aanvraag > **Klus aanmaken**. Klant en werk staan dan
   al ingevuld, en in de klus staat een link terug naar de aanvraag en de foto's. Anders:
   **Klussen** > **Nieuwe klus**.
2. Klant, oplevering (datum, wat gedaan, welke folie). De folie bepaalt ook de horkleur in
   de link naar kozijnhorren.nl, via de kleurentabel in `backend/data/folies.json`.
3. Kozijncheck: één tik per onderdeel. Bij oranje of rood een notitie en een foto.
4. **Rapport klaarzetten.** Daarna: laat de klant de QR-code scannen, of stuur de link
   via WhatsApp of mail.

Alles slaat vanzelf op. Zonder bereik bewaart de telefoon het en gaat het later alsnog
naar de server; de balk bovenin zegt wat er aan de hand is.

Wil je bij de klant meteen horren bestellen, doe dat dan gewoon op kozijnhorren.nl: vul
de maten in, en reken samen met de klant af of stuur de winkelmand via "Bestelling
bewaren of doorsturen" als link naar de klant. De bestelling verschijnt daarna in de
Max-modus onder "Kozijnhorren".

## De achterkant (`api/` en `backend/`)

Eén kleine Python-app zonder externe pakketten, voor iwrap.nl én kozijnhorren.nl:
rapporten, foto's, prijsberekening, bestellingen, betalen (Mollie), mails en een
dagelijkse taak voor herinneringen. Alle routes staan bovenin `backend/app.py`.

- **Lokaal** hangt `serve.py` hem onder `/api`. Zonder instellingen werkt alles: opslag
  in `.data/`, mails als HTML in `.data/uitbak/`, betalen via een testkassa, Max-modus
  op wachtwoord `test`. Lokale geheimen kun je in een bestand `.env` zetten.
- **Op Vercel** draait hij als functie (`api/index.py`) en slaat hij op in Upstash Redis.
- **Testen:** `python3 tests/test_backend.py` loopt de hele stroom door: een
  offerteaanvraag op alle drie de manieren, en van klus tot "past alles?", tegen een
  lege tijdelijke map.

Belangrijke keuzes:

- De kassa rekent de prijs altijd zelf opnieuw uit; wat de browser zegt telt niet.
- Betaalde bestellingen gaan **niet** vanzelf naar de leverancier zolang
  `LEVERANCIER_AUTOMATISCH` op `nee` staat. Max drukt op "Naar leverancier". Zet het pas
  op `ja` als de eerste twintig bestellingen goed gegaan zijn.
- Zolang er geen leverancier gekozen is, gaat de leveranciersmail naar Max zelf.
- Automatische mails: bevestiging na betaling, "onderweg" als Max op verzonden zet, en
  "past alles?" vijf dagen later.

## Livegang: in deze volgorde

Nu draait alles lokaal. Om het echt te gebruiken:

1. **iwrap.nl naar Vercel** (stond al op de lijst). De API moet op www.iwrap.nl bereikbaar
   zijn: de `*.vercel.app`-adressen zitten achter de Vercel-login, en daar kunnen de
   winkel, Mollie en de klant niet bij.
2. **Opslag:** Vercel > project iwrap-website > Storage > Upstash for Redis (gratis
   laag) > koppelen. Dat zet `KV_REST_API_URL` en `KV_REST_API_TOKEN` vanzelf.
3. **Omgevingsvariabelen** in Vercel (Settings > Environment Variables):

   | Naam | Wat |
   |---|---|
   | `MAX_WACHTWOORD` | Je wachtwoord voor de Max-modus |
   | `GEHEIM` | Een lange willekeurige tekst (40+ tekens); ondertekent de inlog |
   | `CRON_SECRET` | Een willekeurige tekst; Vercel stuurt hem mee met de dagelijkse taak |
   | `MOLLIE_API_KEY` | Eerst de `test_`-sleutel, later de `live_`-sleutel |
   | `MS_TENANT_ID`, `MS_CLIENT_ID`, `MS_CLIENT_SECRET` | De koppeling met Microsoft 365 (zie hieronder) |
   | `LEVERANCIER_NAAM`, `LEVERANCIER_EMAIL` | Zodra je een leverancier hebt |
   | `LEVERANCIER_AUTOMATISCH` | `nee` (standaard) of `ja` |
   | `SHOP_URL` | Het adres van de winkel: `https://kozijnhorren.nl` |

4. **Mail via Microsoft 365.** Zie het kopje hieronder. Daarna een testaanvraag doen op
   www.iwrap.nl/offerte en kijken of hij met alle foto's in je inbox staat.
5. **Mollie** in testmodus, en één keer de hele stroom doorlopen: klus in de Max-modus,
   rapport openen op je telefoon, via de tip naar kozijnhorren.nl, bestellen,
   testbetaling, mail, Naar leverancier, Verzonden.
6. **kozijnhorren.nl online** als tweede Vercel-project: zie `kozijnhorren/README.md`.
7. **Echte prijzen** (`prijslijst.py`), dan `voorbeeldprijzen` op `false`, dan de
   `live_`-sleutel van Mollie.
8. **Voorwaarden en privacy** laten nakijken (staan als concept in `kozijnhorren/src/pages/`),
   en KvK en btw-id invullen in `build.py` én `backend/data/winkel.json`.

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

## De film op de homepage

Een getekende film van vijftien seconden: verweerd kozijn,
foto sturen en vaste prijs, het busje voor de deur, oude folie eraf, nieuwe erop, en een
eindkaart met de drie beloftes en het reviewcijfer. Het kozijn is crème (RAL 9001) met
een dennengroen draairaam (RAL 6009), tegen een rode gevel. Vóór en ná dezelfde kleuren:
de nieuwe folie maakt het niet anders, alleen weer strak. De kleuren staan in `CREME` en
`GROEN` bovenin `js/film.js`. Hij speelt vanzelf af zodra hij in beeld komt, pauzeert als
je wegscrolt en blijft aan het eind op de eindkaart staan. Wie op zijn telefoon "minder
beweging" aan heeft staan, ziet meteen het eindbeeld met een afspeelknop.

**Waar hij staat.** Op de homepage in het donkere werkwijzeblok, en dat blok staat bewust
direct onder de hero: eerst het resultaat (de voor/na-schuif), meteen daarna hoe het gaat.
Daarnaast bovenaan `/werkwijze`, als samenvatting vóór de zes stappen. Op beide plekken
via `{{film}}` in de bron; build.py zet daar `src/film.html` neer. Elders erbij zetten is
dus één regel `{{film}}` plus `"film"` in de css- en js-lijst van die pagina (hij kan maar
één keer per pagina).

- **Teksten** staan in `src/film.html`, als blokken in `.film-tekst`.
- **Tijden** (wanneer welk blok komt) staan in `BLOKKEN` bovenin `js/film.js`.
- **Het beeld** tekent `js/film.js` zelf, in SVG. Alles is een functie van de tijd:
  `teken(t)`. Er zit dus geen videobestand op de site.

**De MP4** (om te delen via WhatsApp, mail of met dealers) wordt uit precies die code
opgenomen, zodat site en video nooit uit elkaar lopen. Na een wijziging:

```bash
python3 build.py
cd video && npm install && npm run opname
```

Dat levert `video/iwrap-zo-werkt-het.mp4` op: 1920×1080, 16 seconden (de eindkaart
blijft in de video een seconde langer staan), zonder geluid. Het script gebruikt je eigen
Google Chrome en start zelf een server op poort 8011. Met `node opname.mjs --beelden 0,8,15`
krijg je losse PNG's in `video/beelden/` om een moment te bekijken.

## De doorsnede en de vergelijking

Op de homepage (blok "Waarom herstellen werkt") en op `/kunststof-kozijn-herstellen`
staat een doorsnede van een onderdorpel in drie standen: verweerd (met de gele lijmlaag
waar de folie los is), oude laag eraf, nieuwe folie om de rand. Hij speelt één keer af
als hij in beeld komt en blijft dan op de nieuwe folie staan; een klik op een stap zet
hem daar neer. Wie "minder beweging" aan heeft ziet meteen het eindbeeld.

- De tekening en de stapteksten staan in `src/doorsnede.html`, de overgangen in
  `css/doorsnede.css`. De kleur is antraciet, de meest voorkomende foliekleur.
- De folie is veel dikker getekend dan hij is. Het bijschrift zegt dat; laat dat staan.
- Daaronder staat `src/vergelijking.html`: een nieuw kozijn tegenover herstellen,
  **zonder bedragen**. Elke regel daarin stond al elders op de site. Zet er geen nieuwe
  beweringen bij die je niet zelf gecontroleerd hebt.

Daarnaast heeft `/dakkapel-kozijnen` een getekende illustratie bij "Hoe we erbij
komen" (valbeveiliging, ladder of steiger, een paar pannen eraf), en heeft elk donker
afsluitblok (`.slot.met-beeld`) rechts een echte werkfoto met het reviewcijfer erop.

## De werkdag-video op /over-iwrap

Naast de film staat er nog een tweede animatie van vijftien seconden op de site: *een
werkdag bij iWrap* (folie inladen, onderweg, aanbellen, steiger, eerst een bakje koffie,
oude folie eraf, nieuwe erop, hand erop). Die gaat niet over wát er gebeurt maar over wíe
er komt, en staat daarom bovenaan **Over iWrap**, direct onder de paginakop.

- Het bestand is `media/iwrap-werkdag.mp4` (het origineel staat in
  `Documents/iWrap/Offertes ICM/_media/`). De poster is `images/werkdag-poster.jpg`, het
  eerste beeld van de video, zodat het starten naadloos gaat.
- Hij laadt pas als hij in beeld komt (`preload="none"`), speelt dan zonder geluid af,
  pauzeert als je wegscrolt en blijft aan het eind op de eindkaart staan. Dat gedrag zit
  in `main.js` en werkt voor elke `<figure data-video>`, dus een tweede video ergens anders
  is alleen opmaak.
- In de structured data van de pagina staat een `VideoObject`, zodat Google hem als
  video kan tonen. Vervang je de video, pas dan daar ook de `uploadDate` aan.
- Vervangen: nieuw bestand onder dezelfde naam in `media/`, nieuwe poster eruit halen met
  `video/node_modules/ffmpeg-static/ffmpeg -ss 0 -i media/iwrap-werkdag.mp4 -frames:v 1
  -vf scale=1280:-1 -q:v 3 images/werkdag-poster.jpg`, en bouwen. Let op: `/media/` wordt
  dertig dagen gecachet, dus wie hem al gezien heeft krijgt pas daarna de nieuwe. Wil je
  dat meteen, geef het bestand dan een nieuwe naam.

## Mail via Microsoft 365

iwrap.nl draait op Microsoft 365 (de MX wijst naar outlook.com). De site mailt daarom
rechtstreeks vanuit info@iwrap.nl, via Microsoft Graph: geen Make, geen Resend, geen
abonnement. Alles wat de site verstuurt staat daarna in je verzonden items, en een
offerteaanvraag komt in je eigen inbox binnen met de foto's als echte bijlagen.

Eenmalig instellen, ongeveer tien minuten, met je beheerdersaccount:

1. Ga naar **entra.microsoft.com** > *Applications* > *App registrations* > *New
   registration*. Naam: `iwrap-website`. Accounttype: alleen deze organisatie. Geen
   redirect-URL. *Register*.
2. Noteer op de overzichtspagina de **Application (client) ID** en de **Directory
   (tenant) ID**.
3. *Certificates & secrets* > *New client secret*, geldig 24 maanden. Kopieer meteen de
   **Value** (die zie je maar één keer). Zet in je agenda wanneer hij verloopt.
4. *API permissions* > *Add a permission* > *Microsoft Graph* > *Application
   permissions* > `Mail.Send` > *Add*. Daarna **Grant admin consent**.
5. In Vercel (Settings > Environment Variables): `MS_TENANT_ID`, `MS_CLIENT_ID`,
   `MS_CLIENT_SECRET`. Optioneel `MAIL_AFZENDER` (standaard `info@iwrap.nl`). Opnieuw
   deployen.
6. In de Max-modus staat bij Status of de mail gekoppeld is.

`Mail.Send` mag in principe namens elke mailbox in je organisatie versturen. Heb je meer
mailboxen dan info@iwrap.nl, beperk de app dan tot die ene met een *application access
policy* in Exchange Online (`New-ApplicationAccessPolicy`, documentatie van Microsoft).
Met alleen info@iwrap.nl hoeft dat niet.

Zolang dit niet is ingesteld komt alles in `.data/uitbak/` terecht (lokaal), of gaat het
op Vercel verloren. **Zet de site dus pas live als de koppeling werkt.**

## Wat er nog moet gebeuren

**Voordat de site live gaat:**

1. **Reviews verversen.** Score en aantal komen uit `reviews.json` (zie "Reviews"
   hieronder). Draai `python3 reviews.py` vlak voor de livegang.
2. **Vul KvK en btw-id in** in `BEDRIJF` in `build.py`. Die horen op de site te staan en
   staan nu nergens. Zolang ze leeg zijn, laat de footer ze gewoon weg.
3. **De mailkoppeling met Microsoft 365** (zie "Mail via Microsoft 365") en Upstash
   Redis. Zonder die twee komt een offerteaanvraag nergens aan.
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
daar dan mee — drie sites die verschillende garantietermijnen noemen is voor een klant
alleen maar verwarrend. Ze staan hier op één plek, in `FEITEN` in `build.py`:

- Tien jaar fabrieksgarantie op de folie, vijf jaar op de montage
- Kunststof profiel gaat 50 tot 75 jaar mee
- Doorlooptijd: een tot twee dagen

## Wat er níet op de site mag

Drie dingen die er ooit op stonden en er bewust af zijn. Zet ze er niet opnieuw in:

- **Geen bedragen.** Niet in de teksten, niet in het formulier, niet in de structured
  data. Alleen bij een paar strekkende meter is een bedrag betrouwbaar; daarboven is het
  niet in te schatten, en een indicatie die niet klopt is verwarrend en schrikt af bij
  klussen die juist overzichtelijk zijn. Wat er wél staat: een vaste totaalprijs op basis
  van foto's, en waar die prijs vanaf hangt. Ook geen bandbreedte dus.
- **Geen reactietijd.** Er stond "reactie binnen één werkdag"; dat kan iWrap niet
  garanderen.
- **Geen gespecificeerde offerte.** Het is een opsomming van de werkzaamheden met
  daaronder één totaalprijs. Schrijf dus nergens dat steiger, reiskosten of
  bereikbaarheid apart in de offerte staan — dat gebeurt niet.

**Let op bij kozijnwrap.nl:** daar staan de bedragen nog wél (de keuzehulp noemt €500 en
€500–€3.000, en het kostenartikel noemt €1.200–€2.500 voor vervangen). Die site linkt
hierheen. Overleg met Max of die er daar ook af moeten.

## Verhouding tot de andere twee sites

- **iwrap.nl** (deze) — hier wordt besloten en aangevraagd. Enige plek met een formulier.
- **kozijnwrap.nl** — vangt wie nog niet weet dat folieherstel bestaat, en doet de
  diagnose herstellen-of-vervangen. Stuurt door hierheen.
- **houtnerffolie.nl** — de diepte over de folie zelf: decors, kleuren, specificaties.
- **kozijnhorren.nl** (`kozijnhorren/`) — verkoopt horren in de kleur van het kozijn. Een
  zelfstandige winkel met prijzen, want het is een product met een vaste prijs per maat.
  De iWrap-klant komt er via de tip in het opleverrapport; de achterkant deelt hij met deze
  site. De kleurentabel folie > horkleur staat dáár, niet hier.

Bouw op deze site dus géén kleurenoverzicht en géén keuzehulp — dan gaan de drie sites
met elkaar concurreren in plaats van elkaar aanvullen. Waar het onderwerp langskomt,
wordt er doorverwezen (op `/offerte` bij de kleurkeuze, op `/kosten` bij de
herstellen-of-vervangen-vraag).
