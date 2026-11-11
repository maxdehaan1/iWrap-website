#!/usr/bin/env python3
"""De algemene voorwaarden van iWrap: de tekst staat hier, op één plek.

Dit script maakt er twee dingen van, zodat ze nooit uit elkaar lopen:
  - src/pages/algemene-voorwaarden.html  (de pagina; daarna python3 build.py)
  - documenten/algemene-voorwaarden-iwrap.pdf  (de PDF om te downloaden en bij
    een offerte mee te sturen, in de opmaak van de offertes)

Wijzig je een artikel: pas het hier aan, zet VERSIE goed, draai
    python3 voorwaarden.py && python3 build.py
Verwijs je in een artikel naar een ander artikel, controleer dan de nummers.
"""
from pathlib import Path

ROOT = Path(__file__).resolve().parent
VERSIE = "november 2026"
from html import escape

ARTIKELEN = [
 ("Definities", [
  ("1.1", "<strong>iWrap</strong>: de vennootschap onder firma iWrap, gevestigd aan Neuweg 128, 1214 GZ Hilversum, ingeschreven bij de KvK onder nummer 80710964, bereikbaar via info@iwrap.nl en www.iwrap.nl."),
  ("1.2", "<strong>Opdrachtgever</strong>: iedere natuurlijke persoon of rechtspersoon die iWrap opdracht geeft, waaronder particulieren, woningbouwverenigingen, VvE's en bedrijven."),
  ("1.3", "<strong>Consument</strong>: een opdrachtgever die niet handelt in de uitoefening van een beroep of bedrijf."),
  ("1.4", "<strong>Werkzaamheden</strong>: het herstellen van kunststof kozijnen, deuren en bijbehorende delen met Renolit-folie, inclusief de voorbereiding, zoals reinigen en het verwijderen van de aangetaste toplaag."),
  ("1.5", "<strong>Overeenkomst</strong>: de afspraak tussen iWrap en de opdrachtgever over de uitvoering van de werkzaamheden."),
  ("1.6", "<strong>Schriftelijk</strong>: per brief of per e-mail."),
 ]),
 ("Toepasselijkheid", [
  ("2.1", "Deze voorwaarden gelden voor alle offertes, opdrachten en overeenkomsten van iWrap."),
  ("2.2", "Afwijkingen gelden alleen als ze schriftelijk zijn afgesproken."),
  ("2.3", "Algemene voorwaarden van de opdrachtgever gelden niet, tenzij iWrap daar schriftelijk mee instemt."),
  ("2.4", "Is een bepaling ongeldig, dan blijven de overige bepalingen gewoon gelden. De ongeldige bepaling wordt vervangen door een bepaling die zo dicht mogelijk bij de bedoeling ervan ligt."),
  ("2.5", "Deze voorwaarden staan op www.iwrap.nl/algemene-voorwaarden. In elke offerte verwijst iWrap ernaar. De opdrachtgever kan ze altijd opvragen en ontvangt ze dan kosteloos."),
 ]),
 ("Offerte en totstandkoming", [
  ("3.1", "Een offerte van iWrap is 30 dagen geldig, tenzij in de offerte anders staat."),
  ("3.2", "De offerte is gebaseerd op de informatie, foto's en maten die de opdrachtgever aanlevert, of op de inmeting door iWrap."),
  ("3.3", "De offerteprijs is een vaste prijs voor het werk dat in de offerte is omschreven. Werk dat niet in de offerte staat, valt erbuiten. Denk aan panelen in kozijnen en deuren, rolluiken en kozijnen die zonder steiger of hoogwerker niet veilig bereikbaar zijn."),
  ("3.4", "De overeenkomst komt tot stand zodra de opdrachtgever de offerte schriftelijk accepteert. Een akkoord per e-mail is voldoende."),
  ("3.5", "Kennelijke vergissingen of fouten in een offerte binden iWrap niet."),
 ]),
 ("Herroepingsrecht (alleen voor consumenten)", [
  ("4.1", "Sluit een consument de overeenkomst op afstand (per e-mail of telefoon) of bij hem thuis, dan heeft hij 14 dagen bedenktijd. Die gaat in op de dag dat de overeenkomst tot stand komt."),
  ("4.2", "Binnen de bedenktijd kan de consument de overeenkomst zonder opgave van reden ontbinden. Een e-mail aan info@iwrap.nl is voldoende. Het modelformulier hieronder mag, maar hoeft niet."),
  ("4.3", "Wil de consument dat iWrap al binnen de bedenktijd begint, dan vraagt hij daar uitdrukkelijk om. Herroept hij daarna alsnog, dan betaalt hij het deel van het werk dat al is uitgevoerd."),
  ("4.4", "Is het werk op uitdrukkelijk verzoek van de consument binnen de bedenktijd volledig uitgevoerd, en heeft hij verklaard te weten dat hij dan zijn herroepingsrecht verliest, dan kan hij niet meer herroepen."),
 ]),
 ("Uitvoering van de werkzaamheden", [
  ("5.1", "iWrap voert het werk vakkundig uit, volgens de verwerkingsrichtlijnen van Renolit."),
  ("5.2", "iWrap mag voor de uitvoering vakmensen van buiten het bedrijf inschakelen. Deze voorwaarden gelden dan ook voor hen."),
  ("5.3", "Folie volgt de ondergrond. Diepe krassen, deuken, scheuren of eerdere reparaties in het kozijn kunnen na het aanbrengen zichtbaar blijven. iWrap meldt duidelijke gevallen vooraf zo goed mogelijk."),
  ("5.4", "iWrap werkt netjes om scharnieren, sluitwerk en andere vaste delen heen. Kleine overlappen en naden op die plekken zijn zichtbaar. Dat hoort bij deze werkwijze."),
  ("5.5", "De kleur van nieuwe folie kan iets afwijken van een kleurstaal, een foto op een scherm of delen die niet behandeld worden. iWrap houdt de toleranties van de fabrikant aan."),
  ("5.6", "iWrap is niet verantwoordelijk voor gebreken in het kozijn zelf, zoals lekkage, slechte kitranden, versleten rubbers, beschadigd glas of hang- en sluitwerk dat niet goed werkt."),
 ]),
 ("Planning en weersomstandigheden", [
  ("6.1", "iWrap plant het werk in overleg met de opdrachtgever. Een afgesproken datum is een streefdatum en geen harde garantie."),
  ("6.2", "Het kan gebeuren dat iWrap een afspraak moet verzetten door omstandigheden die vooraf niet te voorzien waren. Denk aan het weer, ziekte, uitloop van een eerdere klus of vertraging in de levering van folie. iWrap laat dit zo snel mogelijk weten en plant in overleg een nieuwe datum."),
  ("6.3", "Verzetten om zulke redenen geeft geen recht op schadevergoeding. Dat is anders als de vertraging zo lang wordt dat de opdrachtgever redelijkerwijs niet langer hoeft te wachten. Dan mag hij de overeenkomst ontbinden voor het deel dat nog niet is uitgevoerd."),
  ("6.4", "iWrap kan in principe het hele jaar door werken. Ook bij lage temperaturen hecht de folie goed, omdat iWrap de folie en het kozijn met warmte voorbehandelt."),
  ("6.5", "Bij regen werkt iWrap niet buiten. Het kozijn moet droog en schoon zijn om de folie goed te laten hechten. iWrap beslist op de dag zelf of het werk door kan gaan, en mag het werk onderbreken als het weer omslaat. Het resterende werk volgt dan op een nieuwe datum."),
  ("6.6", "Van december tot en met februari plant iWrap standaard geen werk in, omdat het weer dan te onvoorspelbaar is. Werk in die periode is alleen mogelijk in overleg en altijd onder voorbehoud van het weer."),
 ]),
 ("Verplichtingen van de opdrachtgever", [
  ("7.1", "De opdrachtgever zorgt dat de kozijnen op de afgesproken dag goed bereikbaar zijn, binnen en buiten. Planten, meubels, decoratie en gordijnen bij de kozijnen zijn dan weggehaald of opzij gezet."),
  ("7.2", "De opdrachtgever zorgt voor toegang tot de woning op de afgesproken tijden, voor zover het werk aan de binnenzijde dat vraagt."),
  ("7.3", "De opdrachtgever stelt kosteloos stroom (230 V) beschikbaar en zorgt dat iWrap in de buurt kan parkeren."),
  ("7.4", "De opdrachtgever meldt vooraf bijzonderheden die van belang zijn, zoals eerdere reparaties, bekende schade of een lopende garantie van de kozijnleverancier."),
  ("7.5", "Is de opdrachtgever huurder of lid van een VvE, dan regelt hij zelf vooraf toestemming van de eigenaar of de VvE."),
  ("7.6", "Kan iWrap door het niet nakomen van deze punten niet (volledig) aan het werk, dan geldt artikel 9."),
 ]),
 ("Meerwerk en minderwerk", [
  ("8.1", "Meerwerk is werk dat niet in de offerte staat, maar dat de opdrachtgever erbij wil of dat tijdens het werk nodig blijkt."),
  ("8.2", "iWrap voert meerwerk alleen uit na overleg en akkoord van de opdrachtgever. De prijs spreken we vooraf af. Een mondeling akkoord op locatie bevestigt iWrap achteraf per e-mail."),
  ("8.3", "Vervalt een deel van het werk, dan wordt dat minderwerk in overleg verrekend."),
 ]),
 ("Afzeggen of verzetten door de opdrachtgever", [
  ("9.1", "De opdrachtgever kan een afspraak kosteloos afzeggen of verzetten tot 7 dagen voor de afgesproken datum."),
  ("9.2", "Zegt de opdrachtgever later af of verzet hij later, dan mag iWrap 25% van de opdrachtsom in rekening brengen. Dat geldt ook als iWrap op de afgesproken dag niet aan het werk kan doordat de opdrachtgever zich niet aan artikel 7 houdt."),
  ("9.3", "Heeft iWrap voor de opdracht al speciaal materiaal besteld, zoals folie in een afwijkende kleur, dan betaalt de opdrachtgever bij annulering ook die materiaalkosten."),
  ("9.4", "Het herroepingsrecht van consumenten uit artikel 4 blijft altijd gelden."),
 ]),
 ("Prijzen en betaling", [
  ("10.1", "Prijzen in de offerte zijn exclusief 21% btw. Voor consumenten staat ook de prijs inclusief btw vermeld."),
  ("10.2", "iWrap stuurt de factuur na oplevering. De opdrachtgever betaalt binnen 14 dagen na de factuurdatum."),
  ("10.3", "Betaalt de opdrachtgever niet op tijd, dan stuurt iWrap een herinnering. Consumenten krijgen daarin nog 14 dagen om zonder extra kosten te betalen."),
  ("10.4", "Blijft betaling daarna uit, dan is de opdrachtgever de wettelijke rente verschuldigd, en bij zakelijke opdrachtgevers de wettelijke handelsrente. Daarnaast komen de incassokosten volgens de wettelijke staffel voor rekening van de opdrachtgever."),
  ("10.5", "Een zakelijke opdrachtgever mag een factuur niet verrekenen en de betaling niet opschorten."),
 ]),
 ("Oplevering en handwerk", [
  ("11.1", "Het werk is opgeleverd zodra iWrap meldt dat het klaar is. Bij voorkeur lopen iWrap en de opdrachtgever het werk dan samen na."),
  ("11.2", "De folie wordt met de hand en op locatie aangebracht. Daardoor zijn kleine onvolkomenheden onvermijdelijk. Ze horen bij het karakter van handwerk."),
  ("11.3", "Onder deze onvolkomenheden vallen in elk geval:<ul><li>naden en overlappen bij hoeken, verstekken, scharnieren en sluitwerk;</li><li>kleine luchtbelletjes of stofjes die alleen van dichtbij zichtbaar zijn;</li><li>minimale hoogteverschillen bij aansluitingen;</li><li>oneffenheden in de ondergrond die door de folie heen zichtbaar blijven (zie artikel 5.3);</li><li>kleine kleurverschillen binnen de toleranties van de fabrikant (zie artikel 5.5).</li></ul>"),
  ("11.4", "Het werk wordt beoordeeld vanaf een normale kijkafstand van ongeveer 2 meter, bij normaal daglicht. Onvolkomenheden die alleen van dichterbij of onder scherp strijklicht te zien zijn, gelden niet als gebrek. Ze geven geen recht op herstel, korting of schadevergoeding."),
 ]),
 ("Klachten", [
  ("12.1", "De opdrachtgever meldt zichtbare gebreken het liefst bij de oplevering, en anders zo snel mogelijk."),
  ("12.2", "Een gebrek dat later wordt ontdekt, meldt de opdrachtgever binnen 2 maanden na ontdekking. Zakelijke opdrachtgevers melden zichtbare gebreken binnen 8 dagen na oplevering."),
  ("12.3", "Een klacht meldt de opdrachtgever schriftelijk, met een duidelijke omschrijving en foto's."),
  ("12.4", "iWrap krijgt de kans het gebrek te bekijken en binnen een redelijke termijn te herstellen. Laat de opdrachtgever het eerst zelf of door een ander herstellen, dan vervallen de rechten op herstel en garantie voor dat deel."),
  ("12.5", "Is herstel niet mogelijk, dan spreken iWrap en de opdrachtgever samen een passende prijsvermindering af."),
  ("12.6", "Een klacht over een deel van het werk geeft geen recht om het hele factuurbedrag in te houden. De opdrachtgever houdt hooguit een bedrag in dat in verhouding staat tot de klacht."),
 ]),
 ("Garantie", [
  ("13.1", "iWrap geeft 5 jaar garantie op de uitvoering, gerekend vanaf de opleverdatum. Deze garantie dekt gebreken die door de verwerking zijn ontstaan, zoals loslatende folie of opkrullende randen."),
  ("13.2", "Op de Renolit-folie zelf geldt 10 jaar garantie op kleurvastheid en weerbestendigheid, volgens de garantievoorwaarden van Renolit."),
  ("13.3", "De garantie geldt niet bij:<ul><li>mechanische schade, zoals stoten, krassen of schade door ladders;</li><li>onjuist onderhoud, zoals schurende of agressieve schoonmaakmiddelen, oplosmiddelen of een hogedrukreiniger;</li><li>boren, schroeven, plakken van tape of stickers in of op de folie;</li><li>reparaties of wijzigingen door anderen dan iWrap;</li><li>gebreken in het kozijn zelf (zie artikel 5.6);</li><li>onvolkomenheden zoals beschreven in artikel 11;</li><li>extreme omstandigheden, zoals brand, storm of vandalisme.</li></ul>"),
  ("13.4", "De garantie gaat pas in als de factuur volledig is betaald."),
  ("13.5", "Onderhoudsadvies: reinig de folie met lauw water, een milde zeep en een zachte doek of spons."),
  ("13.6", "Deze garantie komt bovenop de rechten die een consument volgens de wet heeft. Die wettelijke rechten blijven altijd gelden."),
 ]),
 ("Aansprakelijkheid", [
  ("14.1", "iWrap is alleen aansprakelijk voor directe schade die het gevolg is van een tekortkoming die aan iWrap te wijten is."),
  ("14.2", "De aansprakelijkheid is beperkt tot het bedrag dat de verzekering van iWrap in dat geval uitkeert. Keert de verzekering niet uit, dan is de aansprakelijkheid beperkt tot het factuurbedrag van de opdracht."),
  ("14.3", "iWrap is niet aansprakelijk voor indirecte schade, zoals gevolgschade of gederfde inkomsten."),
  ("14.4", "iWrap is niet aansprakelijk voor schade aan spullen bij de kozijnen die de opdrachtgever niet heeft weggehaald, terwijl artikel 7 dat vraagt."),
  ("14.5", "De opdrachtgever meldt schade zo snel mogelijk, uiterlijk binnen 14 dagen na ontdekking, schriftelijk en met foto's."),
  ("14.6", "De beperkingen in dit artikel gelden niet bij opzet of grove schuld van iWrap."),
 ]),
 ("Overmacht", [
  ("15.1", "Bij overmacht hoeft iWrap haar verplichtingen tijdelijk niet na te komen. Overmacht is elke omstandigheid buiten de invloed van iWrap, zoals extreem weer, ziekte, ongevallen, leveringsproblemen bij Renolit of maatregelen van de overheid."),
  ("15.2", "Duurt de overmacht langer dan 3 maanden, dan mogen beide partijen de overeenkomst ontbinden voor het deel dat nog niet is uitgevoerd. Het werk dat al is gedaan, betaalt de opdrachtgever naar verhouding."),
 ]),
 ("Toepasselijk recht en geschillen", [
  ("16.1", "Op alle overeenkomsten met iWrap is Nederlands recht van toepassing."),
  ("16.2", "Bij een meningsverschil proberen iWrap en de opdrachtgever er eerst samen uit te komen."),
  ("16.3", "Lukt dat niet, dan wordt het geschil voorgelegd aan de bevoegde rechter."),
  ("16.4", "iWrap mag deze voorwaarden wijzigen. Voor een lopende opdracht geldt de versie die op de website stond op de datum van de offerte."),
 ]),
]

MODEL = """      <div class="modelformulier" id="modelformulier">
        <h3>Modelformulier voor herroeping</h3>
        <p>Aan: iWrap, Neuweg 128, 1214 GZ Hilversum, info@iwrap.nl</p>
        <p>Ik deel u hierbij mede dat ik onze overeenkomst betreffende de volgende werkzaamheden herroep: [omschrijving / offertenummer]</p>
        <p>Overeenkomst gesloten op: [datum]</p>
        <p>Naam: [naam] — Adres: [adres]</p>
        <p>Datum en handtekening (alleen bij een formulier op papier): […]</p>
      </div>
"""

def mail(t):
    return t.replace("info@iwrap.nl", '<a href="mailto:{{bedrijf.email}}">info@iwrap.nl</a>') \
            .replace("www.iwrap.nl/algemene-voorwaarden", '<a href="/algemene-voorwaarden">www.iwrap.nl/algemene-voorwaarden</a>')

# --- PDF, in de opmaak van de offertes (ReportLab) ---------------------------

def maak_pdf():
    import re
    from reportlab.lib import colors
    from reportlab.lib.pagesizes import A4
    from reportlab.lib.units import mm
    from reportlab.lib.styles import ParagraphStyle
    from reportlab.platypus import (SimpleDocTemplate, Paragraph, Spacer, Table,
                                    TableStyle, KeepTogether)
    CYAN = colors.HexColor('#3C999E'); TEXT = colors.HexColor('#333333'); GRAY = colors.HexColor('#888888')
    BLOK = colors.HexColor('#F2FAFB'); RAND = colors.HexColor('#C8E8EA')
    LOGO = str(ROOT / "documenten" / "iwrap-logo-pdf.png")
    W, H = A4; L = 20 * mm; R = 20 * mm
    VOET1 = "iWrap \u2013 Neuweg 128 \u2013 1214GZ Hilversum \u2013 T: 06 14415877 \u2013 E: info@iWrap.nl"
    VOET2 = "KvK 80710964 \u2013 NL861770225B01 \u2013 IBAN: NL31 RABO 0191 8884 86"

    body = ParagraphStyle('b', fontName='Helvetica', fontSize=9, leading=13.5, textColor=TEXT)
    intro = ParagraphStyle('i', parent=body, spaceAfter=6)
    nr = ParagraphStyle('n', parent=body, fontName='Helvetica-Bold', textColor=CYAN)
    kop = ParagraphStyle('k', fontName='Helvetica-Bold', fontSize=11, textColor=CYAN, spaceBefore=9, spaceAfter=4, leftIndent=2)
    klein = ParagraphStyle('s', parent=body, fontName='Helvetica-Oblique', fontSize=8, textColor=GRAY, spaceBefore=10)

    def pdftekst(t):
        t = t.replace("<ul>", "").replace("</ul>", "")
        t = re.sub(r"<li>(.*?)</li>", lambda m: "<br/>\u2013&nbsp;&nbsp;" + m.group(1), t)
        return t

    class Doc(SimpleDocTemplate):
        def afterFlowable(self, f):
            pass

    def kader(c, doc, eerste):
        c.saveState()
        if eerste:
            c.setFont('Helvetica-Bold', 30); c.setFillColor(colors.HexColor('#333333'))
            c.drawCentredString(W / 2 - 12 * mm, H - 33 * mm, "Algemene voorwaarden")
            c.drawImage(LOGO, W - R - 22 * mm, H - 40 * mm, 22 * mm, 22 * mm)
            c.setStrokeColor(CYAN); c.setLineWidth(1.2); c.line(L, H - 45 * mm, W - R, H - 45 * mm)
        else:
            c.setFont('Helvetica', 8); c.setFillColor(GRAY)
            c.drawString(L, H - 22 * mm, "Algemene voorwaarden iWrap")
            c.drawImage(LOGO, W - R - 14 * mm, H - 27 * mm, 14 * mm, 14 * mm)
            c.setStrokeColor(CYAN); c.setLineWidth(1.2); c.line(L, H - 31 * mm, W - R, H - 31 * mm)
        c.setStrokeColor(CYAN); c.setLineWidth(1); c.line(L, 24 * mm, W - R, 24 * mm)
        c.setFont('Helvetica', 7.5); c.setFillColor(GRAY)
        c.drawCentredString(W / 2, 18 * mm, VOET1); c.drawCentredString(W / 2, 14 * mm, VOET2)
        c.restoreState()

    from reportlab.pdfgen import canvas as cv
    class Teller(cv.Canvas):
        """Zet 'pagina x van y' onderaan, nu het totaal bekend is."""
        def __init__(self, *a, **k):
            super().__init__(*a, **k); self._paginas = []
        def showPage(self):
            self._paginas.append(dict(self.__dict__)); self._startPage()
        def save(self):
            n = len(self._paginas)
            for st in self._paginas:
                self.__dict__.update(st)
                self.setFont('Helvetica', 7.5); self.setFillColor(GRAY)
                self.drawRightString(W - R, 14 * mm, "pagina %d van %d" % (self._pageNumber, n))
                super().showPage()
            super().save()

    uit = ROOT / "documenten" / "algemene-voorwaarden-iwrap.pdf"
    doc = Doc(str(uit), pagesize=A4, leftMargin=L, rightMargin=R, topMargin=36 * mm, bottomMargin=30 * mm,
              title="Algemene voorwaarden iWrap", author="iWrap")
    verhaal = [Spacer(1, 16 * mm),
               Paragraph("Deze algemene voorwaarden gelden voor alle offertes en opdrachten van iWrap, specialist in het "
                         "herstellen van kunststof kozijnen met Renolit-folie.", intro)]
    for i, (titel, regels) in enumerate(ARTIKELEN, 1):
        rijen = [[Paragraph(n, nr), Paragraph(pdftekst(t), body)] for n, t in regels]
        def tabel(r):
            t = Table(r, colWidths=[13 * mm, W - L - R - 13 * mm])
            t.setStyle(TableStyle([('VALIGN', (0, 0), (-1, -1), 'TOP'), ('LEFTPADDING', (0, 0), (-1, -1), 2),
                                   ('BOTTOMPADDING', (0, 0), (-1, -1), 3), ('TOPPADDING', (0, 0), (-1, -1), 1)]))
            return t
        # De kop blijft altijd bij zijn eerste bepaling: nooit een losse kop onderaan.
        verhaal.append(KeepTogether([Paragraph("Artikel %d \u2013 %s" % (i, titel), kop), tabel(rijen[:1])]))
        if len(rijen) > 1:
            verhaal.append(tabel(rijen[1:]))
        if i == 4:
            mf = [Paragraph("<b>Modelformulier voor herroeping</b>", ParagraphStyle('mk', parent=body, textColor=CYAN))]
            for regel in re.findall(r"<p>(.*?)</p>", MODEL):
                mf.append(Paragraph(regel, body))
            kaart = Table([[x] for x in mf], colWidths=[W - L - R])
            kaart.setStyle(TableStyle([('BACKGROUND', (0, 1), (-1, -1), BLOK), ('BOX', (0, 1), (-1, -1), 0.6, RAND),
                                       ('LEFTPADDING', (0, 0), (-1, -1), 8), ('TOPPADDING', (0, 0), (-1, -1), 3),
                                       ('BOTTOMPADDING', (0, 0), (-1, -1), 3)]))
            verhaal += [Spacer(1, 4), KeepTogether(kaart)]
    verhaal.append(Paragraph("Versie %s" % VERSIE, klein))
    doc.build(verhaal, onFirstPage=lambda c, d: kader(c, d, True), onLaterPages=lambda c, d: kader(c, d, False),
              canvasmaker=Teller)
    print("PDF:", uit.relative_to(ROOT))


delen = []
inhoud = []
for i, (titel, regels) in enumerate(ARTIKELEN, 1):
    inhoud.append(f'          <li><a href="#artikel-{i}">{i}. {titel}</a></li>')
    rij = "\n".join(f'        <li><span class="nr">{nr}</span><div>{mail(t)}</div></li>' for nr, t in regels)
    blok = f'      <h2 id="artikel-{i}">Artikel {i} – {titel}</h2>\n      <ol class="bepalingen">\n{rij}\n      </ol>\n'
    if i == 4:
        blok += MODEL
    delen.append(blok)

PDF = "/documenten/algemene-voorwaarden-iwrap.pdf"
pagina = f"""<!-- {{
  "title": "Algemene voorwaarden | iWrap",
  "description": "De algemene voorwaarden van iWrap voor het herstellen van kunststof kozijnen met Renolit-folie: offerte, planning, oplevering, garantie en klachten.",
  "ogtitle": "Algemene voorwaarden van iWrap",
  "bodyclass": "tekstpagina",
  "css": ["content"],
  "js": ["main"],
  "prioriteit": "0.3",
  "kruimels": [["Algemene voorwaarden", "/algemene-voorwaarden"]]
}} -->

<section class="pagina-hero">
  <div class="wrap">
    <nav class="kruimels" aria-label="Kruimelpad">
      <ol><li><a href="/">Home</a></li><li>Algemene voorwaarden</li></ol>
    </nav>
    <p class="opschrift">Algemene voorwaarden</p>
    <h1>De afspraken bij een opdracht</h1>
    <p class="lede">Deze voorwaarden gelden voor alle offertes en opdrachten van iWrap. In je
    offerte verwijzen we ernaar. Liever op papier of als bijlage? Download de PDF.</p>
    <div class="knoprij">
      <a class="knop knop-primair" href="{PDF}" download>Download de PDF</a>
      <a class="knop knop-tweede" href="#artikel-1">Lees ze hier</a>
    </div>
  </div>
</section>

<section>
  <div class="wrap zij-indeling">
    <div class="tekst voorwaarden">
      <div class="callout in-het-kort">
        <h3>In het kort</h3>
        <ul>
          <li>Een offerte is 30 dagen geldig en is een vaste prijs voor het omschreven werk.</li>
          <li>Particulieren hebben 14 dagen bedenktijd.</li>
          <li>Kosteloos afzeggen of verzetten kan tot 7 dagen voor de afspraak.</li>
          <li>Je betaalt na oplevering, binnen 14 dagen.</li>
          <li>5 jaar garantie op de uitvoering, 10 jaar Renolit-garantie op de folie.</li>
        </ul>
        <p class="bijschrift">Deze samenvatting is alleen een hulp bij het lezen. De artikelen hieronder gelden.</p>
      </div>

{chr(10).join(delen)}
      <p class="bijschrift">Versie {VERSIE}. {{{{bedrijf.juridisch}}}}, {{{{bedrijf.straat}}}}, {{{{bedrijf.postcode}}}} {{{{bedrijf.plaats}}}} &middot; KvK 80710964 &middot; btw NL861770225B01.</p>
    </div>

    <aside class="zij">
      <div class="zijkaart inhoud-kaart">
        <h3>Inhoud</h3>
        <ol>
{chr(10).join(inhoud)}
        </ol>
      </div>
      <div class="zijkaart">
        <h3>Als PDF</h3>
        <p>Dezelfde tekst om te bewaren of te printen.</p>
        <a class="knop knop-tweede" href="{PDF}" download>Download de PDF</a>
      </div>
      <div class="zijkaart">
        <h3>Vragen?</h3>
        <p><a href="mailto:{{{{bedrijf.email}}}}">{{{{bedrijf.email}}}}</a><br>
        <a href="tel:{{{{bedrijf.telefoon_tel}}}}">{{{{bedrijf.telefoon}}}}</a></p>
      </div>
    </aside>
  </div>
</section>
"""
(ROOT / "src" / "pages" / "algemene-voorwaarden.html").write_text(pagina, encoding="utf-8")
print(sum(len(r) for _, r in ARTIKELEN), "bepalingen op de pagina")
maak_pdf()
