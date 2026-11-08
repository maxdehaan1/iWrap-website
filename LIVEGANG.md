# Livegang: alle sites op de echte domeinen

Het draaiboek voor de dag dat iwrap.nl, kozijnwrap.nl, houtnerffolie.nl en (als de
winkel meegaat) kozijnhorren.nl echt online gaan. **Gepland: rond eind december 2026.**

Dit is de enige lijst. Komt er door een wijziging iets bij wat ingesteld moet worden, dan
zet Claude het hier. Achter elke stap staat wie hem doet: **[Max]** voor alles met jouw
inlog (Vercel, GPO, Microsoft, Google), **[Claude]** voor code, bouwen en controleren.

**De gedachte:** zet alles van tevoren klaar op de testadressen (`*.vercel.app`) en test
het daar. Dan is de overstapdag zelf alleen nog het DNS omzetten en nakijken, en kan er
weinig misgaan.

---

## Hoe het er nu voor staat (nagekeken op 25 oktober 2026)

| Site | Testadres | Echt domein nu | Nog te doen |
|---|---|---|---|
| iwrap.nl | iwrap-website.vercel.app | WordPress bij GPO (A-record `91.198.171.121`) | Alles hieronder |
| kozijnwrap.nl | kozijnwrap-website.vercel.app | Wijst nog naar GPO: een lege standaardpagina. **Nog niet gekoppeld in Vercel** | Domein koppelen (kan nu al, zie stap 4) |
| houtnerffolie.nl | houtnerffolie-website.vercel.app | Draait al op Vercel (www.houtnerffolie.nl) | Alleen Search Console |
| kozijnhorren.nl | kozijnhorren.vercel.app | **Nog vrij**, niet geregistreerd | Alleen als de winkel live gaat |

- **Het DNS van alle domeinen staat bij GPO hosting** (ns1/ns2.gpohosting.nl). Daar
  verander je straks een paar records. De nameservers zelf blijven bij GPO.
- **De mail van iwrap.nl loopt via Microsoft 365** (MX naar outlook.com, met SPF, DKIM en
  DMARC). Die records blijven precies zoals ze zijn. Zie de waarschuwing bij stap 3.
- In Vercel staan nog **geen omgevingsvariabelen** bij iwrap-website: geen mail, geen
  opslag, geen reviewsleutel.

---

## 1. Beslissen en regelen (kan nu al)

- [ ] **[Max] Het Vercel-abonnement.** Volgens de regels van Vercel is het gratis
      Hobby-abonnement alleen voor persoonlijk, niet-commercieel gebruik. Een bedrijfssite
      met offerteformulier (en straks een winkel) hoort op **Pro** (rond $20 per maand,
      één abonnement voor alle projecten). Kijk bij Vercel > Settings > Billing wat je nu
      hebt. Wil je geen abonnement, zeg het dan, dan zoeken we samen naar een alternatief.
- [ ] **[Max] Beslissen: een vast zakelijk nummer** (085 of 035) dat doorschakelt naar je
      06, in plaats van het 06-nummer op de sites. Zo ja, regel het vóór de overstap: dan
      gaan de sites, het Google Bedrijfsprofiel en je reviewkaartjes in één keer om.
      **[Claude]** zet het nummer daarna overal goed (het staat op één plek per site).
      WhatsApp blijft op je 06, tenzij je WhatsApp Business op het nieuwe nummer zet.
- [ ] **[Max] kozijnhorren.nl registreren** bij GPO, alleen als de winkel doorgaat. Het
      domein was op 25 oktober nog vrij; wacht er niet te lang mee.
- [ ] **[Max] KvK-nummer en btw-id** doorgeven. **[Claude]** zet ze in `build.py` (footer
      en contactpagina) en, voor de winkel, in `backend/data/winkel.json`.
- [x] "Gecertificeerde monteurs in vaste dienst" is overal vervangen door **"wij besteden
      niets uit"** (25 oktober, akkoord Max).
- [x] **Levensduur van de folie:** overal "vijftien tot vijfentwintig jaar", en "versleten"
      in plaats van "op" (25 oktober, akkoord Max).
- [x] **Opgericht in 2014** bevestigd; daar rekenen de sites "12 jaar" mee uit.
- [x] **[Claude] Privacyverklaring voor iwrap.nl** staat op `/privacy` (25 oktober),
      met een link in de footer en bij het versturen van het formulier. kozijnwrap.nl en
      houtnerffolie.nl hebben een korte privacyregel.
- [ ] **[Max] Privacyverklaring nalezen.** Twee dingen daarin zijn een keuze van jou, en
      Claude heeft er een redelijke standaard voor ingevuld: een aanvraag die geen opdracht
      wordt, verwijder je **binnen twee jaar** uit je mail, en het opleverrapport bewaar je
      **zolang de garantie loopt**. Klopt dat niet met hoe je werkt, zeg het dan. Daarna
      eventueel laten nakijken.
- [x] **Geen cookiebanner nodig.** De sites gebruiken geen cookies, de lettertypen staan
      op de sites zelf (niet meer bij Google), en de bezoekersmeting werkt zonder cookies.
      Komt er ooit iets bij dat wel cookies zet (een YouTube-video, een Google Maps-kaart,
      advertentiepixels), dan is er wél een banner nodig. Claude let daarop.

## 2. Koppelingen instellen en testen op het testadres (weken van tevoren)

Alles in Vercel > project **iwrap-website** > Settings > Environment Variables, met
Environment *Production* aangevinkt. Na het toevoegen: Deployments > de bovenste > Redeploy.

| Variabele | Waarde | Waar haal je hem |
|---|---|---|
| `MAX_WACHTWOORD` | Je wachtwoord voor de Max-modus | Zelf kiezen |
| `GEHEIM` | Lange willekeurige tekst | Zie hieronder |
| `CRON_SECRET` | Lange willekeurige tekst | Zie hieronder |
| `MS_TENANT_ID`, `MS_CLIENT_ID`, `MS_CLIENT_SECRET` | De koppeling met je mailbox | entra.microsoft.com, zie README "Mail via Microsoft 365" |
| `GOOGLE_PLACES_API_KEY` | De reviews live op alle sites | console.cloud.google.com, zie README "Reviews" |
| `KV_REST_API_URL`, `KV_REST_API_TOKEN` | De opslag | Komen er vanzelf bij: Vercel > Storage > Upstash for Redis (gratis) > Connect. **Kies als regio Frankfurt (eu-central-1)**: de privacyverklaring zegt dat we waar het kan EU-servers gebruiken |
| `IWRAP_URL` | `https://iwrap-website.vercel.app` | **Tijdelijk**, alleen tot de overstapdag (zie stap 3) |

Een willekeurige tekst maken, in je eigen Terminal (niet in een chat plakken):

```bash
python3 -c "import secrets; print(secrets.token_urlsafe(48))"
```

- [ ] **[Max] Opslag:** Upstash for Redis koppelen, regio Frankfurt. Komt de Vercel-versie van de
      iWrap-app ooit (stap 8), dan gebruikt die dezelfde database.
- [ ] **[Max] Bezoekers tellen:** zet in Vercel bij **iwrap-website**, **kozijnwrap-website**
      en **houtnerffolie-website** het tabblad *Analytics* aan (Enable Web Analytics). Het
      telscript staat al op de sites; zonder deze klik telt het niets. Dit kan nu al.
      (De functies van iwrap draaien al in Frankfurt, dat staat in `vercel.json`.)
- [ ] **[Max] Mail:** app-registratie in Microsoft Entra en de drie `MS_`-waarden (tien
      minuten, stappen in de README). **Zet in je agenda wanneer het client secret
      verloopt** (na 24 maanden), anders stopt de mail van de site op die dag.
- [ ] **[Max] Reviews:** de Google-sleutel, met een limiet van 50 aanvragen per dag.
- [ ] **[Max] Wachtwoord, `GEHEIM`, `CRON_SECRET`** en de tijdelijke `IWRAP_URL`.
- [ ] **[Max] Redeploy.**
- [ ] **[Max] Testen op iwrap-website.vercel.app:**
      - [ ] `/max`: inloggen, en bij Status staat "Alles gekoppeld" (opslag Upstash, mail
            Microsoft 365, reviews live van Google).
      - [ ] `/offerte`: een aanvraag met aanstrepen, een met maten en een op papier. Elke
            aanvraag staat in je Outlook met de foto's als bijlage, en het testadres krijgt de
            bevestiging.
      - [ ] Op `/offerte` de vierde manier (gewoon een mail): je mailprogramma opent met
            het sjabloon.
      - [ ] Een klus in de Max-modus, en het rapport openen op je telefoon.
- [ ] **[Claude] Alles nalopen** wat zonder inlog te controleren is: alle pagina's,
      `/api/reviews` met `"bron": "google"`, de koppen, en het formulier zonder te versturen.

## 3. De overstapdag van iwrap.nl

Kies een **maandag** (je kantoordag): dan zit je achter je mail als er iets is. Reken op
een uur, en daarna wachten tot het DNS overal is bijgewerkt (meestal binnen een uur, soms
langer).

- [ ] **[Max] De dag ervoor:** zet bij GPO de TTL van het A-record en het www-record van
      iwrap.nl op 300 seconden (5 minuten), als GPO dat toelaat. Dan gaat de overstap sneller.
- [ ] **[Max] De dag ervoor:** maak een volledige back-up van de WordPress-site (bij GPO,
      of met een back-up-plugin). Na de overstap is die site niet meer te bereiken via het
      domein.
- [ ] **[Max] Vercel:** haal de tijdelijke `IWRAP_URL` weg bij de omgevingsvariabelen.
      Dan wijzen de links in mails en rapporten naar `https://iwrap.nl`.
- [ ] **[Claude] Laatste build en push**, met verse reviews.
- [ ] **[Max] Vercel > iwrap-website > Settings > Domains:** voeg `iwrap.nl` en
      `www.iwrap.nl` toe. Zet **iwrap.nl (zonder www) als hoofddomein**, en www als
      doorverwijzing naar iwrap.nl. Zo kent Google de site nu al, en zo houd je je
      posities. Vercel toont daarna welke DNS-waarden het wil zien.
- [ ] **[Max] GPO, DNS van iwrap.nl:** verander **alleen** deze twee records, naar de
      waarden die Vercel toont:
      - het A-record `@`: nu `91.198.171.121`, wordt het IP van Vercel (bij houtnerffolie.nl
        was dat `216.198.79.1`)
      - `www`: wordt een CNAME naar het adres dat Vercel geeft (eindigt op `vercel-dns.com`
        of iets vergelijkbaars)

      **Alle andere records blijven staan, anders stopt je mail.** Het gaat om: het MX-record (`iwrap-nl.mail.protection.outlook.com`),
      de TXT-records (`MS=ms88982446` en de SPF met `spf.protection.outlook.com`),
      `_dmarc`, de DKIM-records (`selector1._domainkey` en `selector2._domainkey`) en
      `autodiscover` (allemaal op 25 oktober nagekeken). En, als die er staat, de CNAME
      `app` (de iWrap-app, stap 8).
- [ ] **[Max]** Wacht tot Vercel bij beide domeinen "Valid Configuration" toont. Het
      certificaat (https) regelt Vercel daarna zelf.
- [ ] **[Claude] Controleren:**
      - `https://iwrap.nl` toont de nieuwe site, en `https://www.iwrap.nl` stuurt door naar iwrap.nl.
      - Oude adressen sturen door: `/werkwijze/`, `/portfolio/...`, `/contact/` met de
        utm-codes van kozijnwrap en houtnerffolie (komt uit op `/offerte`).
      - Geen `noindex`-kop op iwrap.nl, de sitemap werkt, en `/api/gezond` en `/api/reviews` antwoorden.
- [ ] **[Max] Mail testen:** stuur vanaf een ander adres (je telefoon) een mail naar
      info@iwrap.nl. Die moet gewoon binnenkomen. Doe daarna één echte testaanvraag op
      iwrap.nl/offerte.

## 4. kozijnwrap.nl koppelen (los van de rest, kan nu al)

Deze hoeft niet op iwrap.nl te wachten. Hoe eerder hij op zijn eigen domein staat, hoe
eerder Google hem leert kennen.

- [ ] **[Max] Vercel > kozijnwrap-website > Settings > Domains:** voeg `kozijnwrap.nl`
      en `www.kozijnwrap.nl` toe, met **kozijnwrap.nl (zonder www) als hoofddomein**. De
      site noemt zichzelf zo in de canonical en de sitemap.
- [ ] **[Max] GPO, DNS van kozijnwrap.nl:** het A-record `@` en `www` naar de waarden van
      Vercel. Laat het MX-record (`mail.kozijnwrap.nl`) en het A-record van `mail` staan.
- [ ] **[Claude]** Nakijken: https, www-doorverwijzing, geen noindex, en de knoppen naar iwrap.nl.

## 5. Direct na de overstap (dezelfde week)

- [ ] **[Max] Google Search Console, iwrap.nl:** kijk of iwrap.nl er al in staat (de oude
      Yoast-sitemap). Zo niet, voeg het toe als *domein* (verificatie met een TXT-record
      bij GPO; dat raakt je mail niet). Dan bij Sitemaps de oude `sitemap_index.xml`
      weghalen en `https://iwrap.nl/sitemap.xml` toevoegen. Met URL-inspectie de homepage,
      `/offerte` en `/kunststof-kozijn-herstellen` laten indexeren.
- [ ] **[Max] Search Console, kozijnwrap.nl en houtnerffolie.nl:** ook als domein
      toevoegen en de sitemap aanmelden (`https://kozijnwrap.nl/sitemap.xml` en
      `https://www.houtnerffolie.nl/sitemap.xml`).
- [ ] **[Max] Google Bedrijfsprofiel:** website `https://iwrap.nl` en de offertelink
      `https://iwrap.nl/offerte`.
- [ ] **[Max]** Instagram-bio, je e-mailhandtekening en eventueel materiaal voor
      Weru-dealers: het adres blijft iwrap.nl. Een link naar `/offerte` is wel handiger
      dan naar `/contact` (die blijft ook gewoon werken).
- [ ] **[Max + Claude] Na twee en na zes weken:** in Search Console bij Pagina's kijken of
      er 404's of uitgesloten pagina's opduiken. Claude zet een oude URL dan als
      doorverwijzing in `vercel.json`.

## 6. kozijnhorren.nl (alleen als de winkel tegelijk live gaat)

Dit hangt af van een leverancier en echte prijzen. Gaat de winkel later, sla dit dan over.
iwrap.nl noemt de naam kozijnhorren.nl wel al, maar linkt pas naar de winkel als hij er is.

- [ ] **[Max]** Leverancier kiezen. Daarna `LEVERANCIER_NAAM` en `LEVERANCIER_EMAIL` in
      Vercel (iwrap-website), met `LEVERANCIER_AUTOMATISCH` op `nee`.
- [ ] **[Max + Claude] Echte inkoopprijzen.** Die komen nooit in de repo (die is openbaar);
      Claude rekent ze om met `prijslijst.py` en zet `voorbeeldprijzen` op `false`.
- [ ] **[Max] Mollie:** account met KvK, eerst `MOLLIE_API_KEY` met de `test_`-sleutel,
      één keer de hele stroom doorlopen, dan de `live_`-sleutel.
- [ ] **[Max] Microsoft 365:** het adres info@kozijnhorren.nl aanmaken (een alias van
      info@iwrap.nl is genoeg). **[Claude]** zet het in `backend/data/winkel.json`.
- [ ] **[Max] Voorwaarden en privacy** van de winkel laten nakijken. Ze staan als concept
      in `kozijnhorren/src/pages/`.
- [ ] **[Max] Vercel > kozijnhorren > Domains:** kozijnhorren.nl toevoegen, en het DNS
      bij GPO zoals bij stap 4.
- [ ] **[Max] Vercel > iwrap-website:** `SHOP_URL` = `https://kozijnhorren.nl`.
- [ ] **[Claude]** Het telscript van Vercel ook op kozijnhorren.nl zetten, en **[Max]**
      Analytics aanzetten in het project kozijnhorren.
- [ ] **[Claude]** `KOZIJNHORREN_LIVE = True` in `build.py`. Dan linkt iwrap.nl naar de
      winkel (kozijncheck, rapport, footer). Opnieuw bouwen en pushen.

## 7. Na een maand

- [ ] **[Max] GPO-webhosting opzeggen**, als alles een maand goed loopt. Zeg **alleen de
      hosting** op, niet de domeinnamen en niet het DNS: die blijven bij GPO. Kijk eerst of
      je de mailboxen op `mail.kozijnwrap.nl` of `mail.houtnerffolie.nl` gebruikt; die
      draaien op diezelfde GPO-server.
- [ ] **[Max] Agenda:** het verloopmoment van het Microsoft client secret (stap 2).

## 8. iWrap-app

De eigen app van Max en Phoebe draait sinds 5 november 2026 als **artifact in Claude**. De link
staat in de README van `iwrap-app`. De versie met een eigen server (app.iwrap.nl op Vercel) ligt
stil: het Vercel-project `iwrap-app` en het domein bestaan, maar er draait niets. Dit hangt niet
af van de overstapdag.

- [x] **[Claude]** De app als artifact in Claude.
- [ ] **[Max]** Openen en uitproberen.
- [ ] **[Max]** Phoebe uitnodigen: in Claude bij de app *Delen*, haar mailadres, **Editor**. Zij
      heeft een eigen Claude-account nodig. Nooit delen via een openbare link.
- [x] **[Max]** Akkoord op de verhuizing van de dossiers (6 nov): de klantgegevens staan bij Anthropic
      (Claude), niet op een server in Frankfurt.
- [x] **[Claude]** De verhuizing (6 nov): 78 klanten met hun klus, taken en tijdlijn.
- [x] **[Max]** Toestemming zodat de inbox-ronde zonder te vragen in de app mag schrijven (6 nov).
- [x] **[Claude]** De inbox-ronde schrijft in de app (`Offertes ICM/stappen/00-inbox/RONDE.md`, sinds 6 nov).
- [x] **[Claude]** De inbox-ronde draait als cloudroutine in Claude, 4× per dag, ook als de Mac uit staat
      (6 nov). De oude planning in de chat is gestopt.
- [x] **[Max]** iCloud-agenda koppelen: de agenda delen als openbare agenda en de link in de app zetten (7 nov).
- [ ] **[Max]** De cloud mag de agenda ophalen: op claude.ai/code bij de omgeving **Default** (instellingen van de
      omgeving, netwerktoegang) `p167-caldav.icloud.com` (of `*.icloud.com`) toestaan. Nu blokkeert de cloud iCloud
      en leest de ronde de agenda niet in; Claude zette hem op 7 nov één keer zelf in de app.
- [ ] **[Claude]** Daarna de routine bijwerken met `scripts/routine_opdracht.py` (agenda 30 weken vooruit, "de agenda
      is leidend" met `agenda_volgen.py` en het logboek, en de dag van het akkoord bij de klus) en een ronde draaien om
      te zien dat de agenda binnenkomt. Daarbij nalopen of elke klus bij "Nog inplannen" een akkoorddatum heeft.
- [x] **[Claude]** Bij "Nog inplannen" staat sinds wanneer het akkoord er is ("Akkoord sinds 2 nov · 6 dagen"), wie het
      langst wacht staat bovenaan (8 nov). Aanpassen kan bij Klus bewerken.
- [x] **[Claude]** De agenda is leidend (7 nov): wat in de iCloud-agenda verandert, neemt de ronde over in de app; elke
      wijziging staat in Planning onder "Uit de agenda overgenomen". Wil je dat een klant nog niet vaststaat, zet dan
      "Optie" voor de titel in de agenda.
- [ ] **[Max]** De bijgewerkte offerte-skill uploaden in Claude (`Offertes ICM/_skills/iwrap-offerte-maken.zip`).
- [ ] **[Max]** In de mailbox max@iwrap.nl een doorstuurregel naar info@iwrap.nl (Outlook > Instellingen > E-mail >
      Doorsturen). De inbox-ronde leest alleen info@; mail van dealers aan max@ ziet hij nu niet. Daarna de
      oude dealermails uit max@ één keer doorsturen.
- [x] **[Claude]** De app op jullie werkwijze (6 nov): op de klus, planning uit de mail, offertes klaarzetten
      ("maak de offertes"), nog factureren met het meerwerk, en een plek voor de cijfers uit SnelStart.
- [x] **[Claude]** Controle met de echte gegevens (7 nov): de planning kijkt verder vooruit, de agenda telt mee
      zodra hij gekoppeld is, en de inbox-ronde vult de ontbrekende datums en woonplaatsen aan uit de mail.
- [ ] **[Max]** De taken die Claude in de app zette nalopen (op Vandaag: 4 voor Max, 4 voor Phoebe), onder andere
      dagen werk invullen bij klussen zonder duur.
- [ ] **[Phoebe]** Cijfers voor Geld: in SnelStart de resultatenrekening per maand (dit jaar en vorig jaar) en de
      openstaande posten exporteren naar `Offertes ICM/dossiers/_app-import/snelstart/`, dan in Claude zeggen:
      "lees de cijfers van SnelStart in". Daarna elke maand opnieuw.
- Later, alleen als het nodig is (bijvoorbeeld voor meldingen op de iPhone): de Vercel-versie
  met een GitHub-repo, Upstash, wachtwoorden en de CNAME `app` bij GPO. Die stappen staan in de
  tak `vercel` van `iwrap-app`.

---

*Bijgehouden door Claude. Laatst bijgewerkt: 7 november 2026 (controle met de echte gegevens; taken in de app).*
