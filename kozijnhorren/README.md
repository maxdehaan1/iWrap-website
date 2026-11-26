# kozijnhorren.nl

Horren in de kleur van je kozijn. Een losse webwinkel met een eigen uiterlijk. Dat iWrap
erachter zit is geen geheim, maar het staat niet op de voorkant (Max, 26 november 2026: "op
de achtergrond mag best een link zijn ... het hoeft niet schreeuwerig op de voorkant").
Alleen "Over ons", de veelgestelde vragen en de regel met de handelsnaam onderaan elke
pagina noemen iWrap; "Over ons" en de veelgestelde vragen met het reviewcijfer
(`{{iwrap.reviews}}`, uit `reviews.json` in de repo-root). De samenhang met iwrap.nl staat
in de README in de repo-root, onder "Hoe alles samenhangt".

Waar de horren vandaan komen, welke hor we verkopen en waarom: zie
[LEVERANCIERS.md](LEVERANCIERS.md).

## Het idee in drie regels

- **Eén soort hor**, de inklemhor, in twee uitvoeringen: **Basis** (zwart gaas, vier
  kleuren) en **Luxe** (bijna onzichtbaar gaas, elke kleur). Meten gaat voor allebei
  hetzelfde.
- **Zo min mogelijk keuzes.** De klant kiest uitvoering, kleur, maat en aantal. Geen
  gaassoorten, klemdieptes of montagesets.
- **Pasgarantie.** Past een hor niet terwijl er volgens de meetinstructie gemeten is,
  dan maken we een nieuwe. Staat in `backend/data/horren.json` onder `pasgarantie`.

## Eén manier van bestellen, met een code voor korting

Iedereen bestelt op dezelfde manier en betaalt dezelfde prijs: maten invullen, kleur kiezen,
afrekenen. Alleen met een **partnercode** krijg je een kleine korting (nu 5%, in
`backend/data/horren.json` onder `partnercode`), en dan zien wij via wie de bestelling kwam
(Max, november 2026: "dat je eigenlijk gewoon één manier hebt om die horren te bestellen").

- **Bij het afrekenen** staat het veld "Heb je een code van je vakman?". De kassa controleert de
  code en rekent de korting uit; de bestelling onthoudt de partner (`partner`) en de korting.
- **Een doorverwijslink** zet de code klaar: `kozijnhorren.nl/?code=MAX`. Hij blijft in de
  browser staan en staat dan al ingevuld bij het afrekenen.
- **De vakman bij de klant** (Max bij een iWrap-klus, of een partner) zet zijn code één keer op
  zijn telefoon (`/vakmensen` of de link), meet op, vult de winkelmand en stuurt hem door met
  "Bestelling bewaren of doorsturen". De code gaat mee in die link.
- De codes staan in de omgevingsvariabele `PARTNERCODES` (`CODE=Naam;CODE2=Naam`, zie
  `../LIVEGANG.md`); lokaal werkt `TEST`. De Max-modus laat per bestelling de code zien, en
  bovenaan de bestellingen een telling per code, voor de commissie.

## De leverancier doet de rest

In elke bestelmail aan de leverancier staat een **eigen link** (`/leverancier?nr=…&t=…`,
afgeleid van `GEHEIM`) en een CSV met de regels. Op die pagina zet de leverancier de
bestelling op "in productie" en later op "verzonden", met de track & trace; de klant krijgt
dan vanzelf de mail dat zijn horren onderweg zijn. Bevestigt de leverancier niet binnen drie
dagen, of is er na de verwachte levertijd niets verzonden, dan krijgt Max één seintje. Met
`LEVERANCIER_AUTOMATISCH=ja` gaat elke betaalde bestelling vanzelf naar de leverancier; dan
hoeft Max er niets meer voor te doen.

## Hoe het samenhangt met iwrap.nl

Staan de horren in het opleverrapport van iWrap op oranje of rood, dan staat daar een
tip met een link naar `kozijnhorren.nl/bestellen?kleur=<RAL>`: de kleur die bij de folie
hoort staat dan al klaar (en is het geen standaardkleur, dan de Luxe). De klant vult zelf
de maten in, of Max meet ter plekke en stuurt de winkelmand door met zijn code erin.
Andersom wijst "Over ons" de klant met een verweerd kozijn naar iwrap.nl.

Technisch is de winkel een **statische site** (deze map). Rekenen, betalen, bestellingen
en mails zitten in de achterkant van iwrap.nl (`backend/` in de repo-root), die de winkel
aanroept op `https://iwrap.nl/api`. Max ziet de bestellingen in de Max-modus op
iwrap.nl, onder "Kozijnhorren".

```
/bestellen  uitvoering, kleur, maat, aantal  ->  winkelmand (zijlade, in de browser)
     |                                             |-> "bewaren of doorsturen" (link)
     v
/afrekenen  adres, code (korting), 2 vinkjes  ->  kassa rekent de prijs opnieuw  ->  Mollie (iDEAL)
     v
/bestelling  bedankt + status        mails: bevestiging, onderweg, "past alles?"
     v
leverancier  bestelmail + CSV + /leverancier: bevestigd, verzonden (track & trace)
```

## Bewerken en bouwen

```bash
python3 kozijnhorren/build.py
```

Bron in `src/pages/`, gedeelde aankondigingsbalk, kop, winkelmand en footer in
`build.py`, opmaak in `css/winkel.css`. Bewerk de gegenereerde HTML in deze map niet met
de hand. `js/catalogus.js` wordt ook gegenereerd, uit `backend/data/`.

Plaatshouders in de bron: `{{prijs.vanaf}}`, `{{prijs.luxe_vanaf}}`, `{{levertijd}}`,
`{{pasgarantie.dagen}}`, `{{maat.*}}`, `{{prijstabel.basis}}`, `{{prijstabel.luxe}}`,
`{{prijsvoorbeelden}}`, `{{kleuren}}`, `{{folietabel}}`, `{{usp}}`, `{{svg.hor:<id>}}`,
`{{svg.raam:<id>}}`, `{{icoon.<naam>}}`, `{{whatsapp}}`, `{{whatsapp.meetcheck}}`,
`{{whatsapp.twijfel}}`, `{{whatsapp.vakman}}`, `{{partnercode.korting}}`, `{{winkel.<veld>}}`, `{{iwrap.reviews}}`,
`{{iwrap.jaren}}`. Een onbekende
plaatshouder laat de build stoppen.

## Stijl

In de stijl van stoov.com: wit met warme crème vlakken, grote koppen in een dunne letter
(Outfit), pilvormige knoppen, productkaarten op een crème vlak, een oranje aankondigingsbalk
en een winkelmand die van rechts inschuift.

- **Logo**: het woordmerk `kozijnhorren.nl`, gewoon tekst in Nunito 800 (rond, met afgeronde hoeken), in `--oranje`
  (#ff5000). Geen los beeldmerk; het favicon is een oranje vlak met een crème "k".
- `--oranje` alleen voor het logo en grote vlakken met donkere tekst. Witte tekst erop is
  slecht leesbaar (3,3:1).
- `--oranje-knop` (#d93d00) voor de belangrijkste knop per scherm, labels en vlakken met
  witte tekst (4,6:1). `--oranje-tekst` voor kleine oranje tekst. Maak ze niet lichter.
- `--donker` (warm donkerbruin) voor koppen, gewone knoppen, het garantiepaneel en de footer.
- De hor zelf is een SVG-tekening die van kleur wisselt (`--kleur`). Zodra er echte
  productfoto's zijn, kunnen die op de productkaarten en de bestelpagina in de plaats komen.

## Foto's

`images/held-*` is de hero (tijdelijk, aangeleverd door Max), `images/held-buiten-*` staat
bij "Zo werkt het". Een nieuwe foto: zet hem als `naam-640.webp`, `naam-1000.webp`,
`naam-1672.webp` (of 1600) en `naam-1000.jpg` in `images/` en pas de `<picture>` aan.
Let bij een definitieve foto op dat hor en kozijn dezelfde kleur hebben: daar gaat de
hele winkel over.

## Lokaal draaien

Twee vensters, want de winkel heeft de API van iwrap.nl nodig:

```bash
python3 serve.py
```

```bash
python3 kozijnhorren/serve.py
```

De winkel staat dan op http://localhost:8020. Betalen gaat lokaal via een testkassa en
mails komen als HTML in `.data/uitbak/`.

## Prijzen aanpassen

De verkoopprijzen staan in `backend/data/horren.json`, per uitvoering een tabel.
Inkoopprijzen horen daar niet in (de repo is openbaar); gebruik de rekenhulp:

```bash
python3 prijslijst.py basis --sjabloon
```

Vul `prive/inkoop-basis.csv` met de inkoopprijzen, kijk wat eruit komt met
`python3 prijslijst.py basis`, en schrijf weg met `--schrijf`. Hetzelfde voor `luxe`.

**Zolang `voorbeeldprijzen` op `true` staat**, toont de winkel een proefbalk en weigert de
kassa een echte (live) Mollie-betaling.

## Online zetten (eigen Vercel-project)

1. Vercel > Add New > Project > dezelfde repo (`iWrap-website`).
2. **Root Directory: `kozijnhorren`**. Framework: Other. Geen build command.
3. Domein kozijnhorren.nl koppelen (op 30 september 2026 nog vrij).
4. Zet `SHOP_URL=https://kozijnhorren.nl` in de omgevingsvariabelen van het
   **iwrap**-project, anders mag de winkel de API niet aanroepen en klopt de terug-link na
   het betalen niet.
5. Maak in Microsoft 365 het adres info@kozijnhorren.nl aan (een alias is genoeg) en zet
   het in `backend/data/winkel.json`. Nu staat daar nog info@iwrap.nl.

De winkel praat met de API op iwrap.nl, dus hij gaat pas echt live na de overstap van
iwrap.nl. Alle stappen voor de livegang, in volgorde, staan in `../LIVEGANG.md` (stap 6).

## Wat er bewust niet in zit

- Andere horren (plissé, voorzethor, rolhor, hordeuren). De site zegt eerlijk dat die er
  niet zijn.
- Pollengaas als keuze: te veel opties. Wie erom vraagt, krijgt maatwerk via WhatsApp.
- Reviews: er zijn er nog geen, en verzonnen reviews komen er niet op. Zet een
  `reviews_url` in `winkel.json` zodra er een reviewpagina is; dan vraagt de
  "past alles?"-mail er ook om.
