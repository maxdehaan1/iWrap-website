"""De teksten van alle mails. Elke functie geeft (onderwerp, html, tekst).

Twee afzenders, twee stijlen: het opleverrapport komt van iWrap (Max), alles over
een bestelling van kozijnhorren.nl. De opmaak is bewust eenvoudig: één kolom,
gewone tekst, één knop. Dat komt in elke mailbox goed aan, ook in Outlook.
"""

from html import escape

from . import instellingen as cfg
from .horren import catalogus, datum_nl, euro, levertijd_tekst

INKT = "#171717"
IWRAP_MINT = "#3f7468"
KH_GROEN = "#1f4a3d"


def _knop(url, label, kleur=INKT):
    return ('<p style="margin:26px 0"><a href="%s" style="display:inline-block;background:%s;'
            'color:#ffffff;text-decoration:none;font-weight:600;padding:13px 24px;'
            'border-radius:999px">%s</a></p>' % (escape(url, True), kleur, escape(label)))


def _opmaak(kop, inhoud, afzender, accent):
    return (
        '<!doctype html><html lang="nl"><body style="margin:0;background:#f6f3ed;'
        'font-family:-apple-system,Segoe UI,Arial,sans-serif;color:%s">'
        '<div style="max-width:600px;margin:0 auto;padding:28px 18px">'
        '<div style="background:#ffffff;border-radius:18px;padding:30px 28px;'
        'font-size:16px;line-height:1.6">'
        '<p style="margin:0 0 18px;font-size:13px;letter-spacing:.08em;text-transform:uppercase;'
        'color:%s;font-weight:700">%s</p>'
        '<h1 style="font-size:23px;line-height:1.25;margin:0 0 16px;font-weight:500">%s</h1>%s</div>'
        '<p style="font-size:12px;color:#8a8f94;margin:16px 6px 0">%s</p>'
        '</div></body></html>'
        % (INKT, accent, escape(afzender), escape(kop), inhoud, _voet(afzender))
    )


def _voet(afzender):
    w = cfg.WINKEL
    if afzender == "iWrap":
        return "iWrap &middot; Neuweg 128, Hilversum &middot; info@iwrap.nl &middot; +31 6 1441 5877"
    return "%s &middot; %s &middot; %s<br>%s is een handelsnaam van %s, %s" % (
        escape(w["domein"]), escape(w["email"]), escape(w["telefoon"]),
        escape(w["naam"]), escape(w["juridisch"]), escape(w["adres"]))


def _p(tekst):
    return '<p style="margin:0 0 14px">%s</p>' % tekst


def _voornaam(naam):
    naam = (naam or "").strip()
    return escape(naam.split(" ")[0]) if naam else ""


def _aanhef(naam):
    v = _voornaam(naam)
    return "Hallo %s," % v if v else "Hallo,"


def _detail(r):
    return "%s (RAL %s), %s" % (r["kleur"]["naam"], r["kleur"]["code"], r["gaas"].lower())


def _regels_html(b):
    rijen = []
    for r in b["regels"]:
        omschrijving = "%s %s &times; %s mm" % (escape(r["productnaam"]), r["breedte"], r["hoogte"])
        if r.get("naam"):
            omschrijving = "<b>%s</b><br>%s" % (escape(r["naam"]), omschrijving)
        rijen.append(
            '<tr><td style="padding:10px 12px 10px 0;vertical-align:top;border-top:1px solid #eeebe4">'
            '%s&times;</td><td style="padding:10px 0;border-top:1px solid #eeebe4">%s<br>'
            '<span style="color:#666;font-size:14px">%s</span></td>'
            '<td style="border-top:1px solid #eeebe4;padding:10px 0;text-align:right;white-space:nowrap;'
            'vertical-align:top">%s</td></tr>'
            % (r["aantal"], omschrijving, escape(_detail(r)), euro(r["bedrag"]))
        )
    verzend = "gratis" if not b.get("verzendkosten") else euro(b["verzendkosten"])
    totaal = (
        '<tr><td></td><td style="padding:10px 0;border-top:1px solid #e3dfd6;color:#666">Bezorgen</td>'
        '<td style="padding:10px 0;border-top:1px solid #e3dfd6;text-align:right;color:#666">%s</td></tr>'
        '<tr><td></td><td style="padding:4px 0"><b>Totaal</b> <span style="color:#666;font-size:14px">'
        'incl. %s btw</span></td><td style="padding:4px 0;text-align:right"><b>%s</b></td></tr>'
        % (verzend, euro(b["btw"]), euro(b["totaal"]))
    )
    return '<table style="width:100%%;border-collapse:collapse;font-size:15px;margin:8px 0 18px">%s%s</table>' % (
        "".join(rijen), totaal)


def _regels_tekst(b):
    uit = []
    for r in b["regels"]:
        regel = "%dx %s %d x %d mm, %s  %s" % (r["aantal"], r["productnaam"], r["breedte"], r["hoogte"],
                                               _detail(r), euro(r["bedrag"]))
        uit.append("- " + (r["naam"] + ": " if r.get("naam") else "") + regel)
    uit.append("Totaal %s (incl. %s btw)" % (euro(b["totaal"]), euro(b["btw"])))
    return "\n".join(uit)


def _adres(k):
    return "%s\n%s\n%s %s" % (k.get("naam", ""), k.get("straat", ""), k.get("postcode", ""), k.get("plaats", ""))


def _adres_html(k):
    return "<br>".join(escape(x) for x in _adres(k).split("\n") if x.strip())


def _winkel():
    return cfg.WINKEL["naam"]


def _winkelmail(kop, delen):
    return _opmaak(kop, "".join(delen), _winkel(), KH_GROEN)


# ---------------------------------------------------------------------------
# iWrap: het opleverrapport
# ---------------------------------------------------------------------------

def rapport_klant(r, link, samenvatting):
    naam = r["klant"].get("naam", "")
    delen = [
        _p(_aanhef(naam)),
        _p("Bedankt dat we je kozijnen mochten herstellen. Hieronder vind je het opleverrapport. "
           "Daarin staat wat we gedaan hebben, welke folie erop zit en tot wanneer de garantie loopt. "
           "Bewaar hem dus goed."),
        _p("Terwijl we bezig waren hebben we ook naar de rest van je kozijnen gekeken. "
           "<b>%s</b>" % escape(samenvatting["zin"])),
        _knop(link, "Bekijk je rapport", IWRAP_MINT),
        _p("Vragen? Antwoord gewoon op deze mail.<br>Groet, Max"),
    ]
    html = _opmaak("Je opleverrapport en kozijncheck", "".join(delen), "iWrap", IWRAP_MINT)
    tekst = ("%s\n\nBedankt dat we je kozijnen mochten herstellen. Je opleverrapport met de kozijncheck staat hier:\n%s\n\n%s\n\nGroet, Max\niWrap"
             % (_aanhef(naam), link, samenvatting["zin"]))
    return "Je opleverrapport van iWrap", html, tekst


# ---------------------------------------------------------------------------
# kozijnhorren.nl: bestellingen
# ---------------------------------------------------------------------------

def _pasgarantie_zin():
    dagen = catalogus()["pasgarantie"]["melden_binnen_dagen"]
    return ("<b>Pasgarantie</b><br>Past een hor niet, terwijl je gemeten hebt zoals in de meetinstructie? "
            "Laat het ons binnen %d dagen na levering weten, dan maken we een nieuwe." % dagen)


def bevestiging(b, statuslink):
    k = b["klant"]
    lt = levertijd_tekst(b.get("levertijd"))
    delen = [
        _p(_aanhef(k.get("naam"))),
        _p("Bedankt voor je bestelling. De betaling is binnen en je horren gaan in productie. "
           "Ze worden op maat gemaakt en rechtstreeks bij je thuisbezorgd."),
        _regels_html(b),
        _p("<b>Bezorgadres</b><br>%s" % _adres_html(k)),
        _p("<b>Verwachte levering</b><br>%s. Zodra de horren onderweg zijn, krijg je een mail." % escape(lt)),
    ]
    if b.get("pasgarantie"):
        delen.append(_p(_pasgarantie_zin()))
    delen += [
        _p('Plaatsen gaat zonder boren of schroeven. <a href="%s/meetinstructie#plaatsen" style="color:%s">Zo werkt het</a>.'
           % (cfg.SHOP_URL, KH_GROEN)),
        _knop(statuslink, "Bekijk je bestelling", KH_GROEN),
        _p("Bestelnummer: <b>%s</b>. Dit is je betaalbewijs; bewaar de mail." % b["nr"]),
    ]
    html = _winkelmail("Bestelling %s is binnen" % b["nr"], delen)
    tekst = ("%s\n\nBedankt voor je bestelling %s. De betaling is binnen.\n\n%s\n\nBezorgadres:\n%s\n\n"
             "Verwachte levering: %s.\n\nJe bestelling: %s\n\n%s is een handelsnaam van %s, %s."
             % (_aanhef(k.get("naam")), b["nr"], _regels_tekst(b), _adres(k), lt, statuslink,
                cfg.WINKEL["naam"], cfg.WINKEL["juridisch"], cfg.WINKEL["adres"]))
    return "Je bestelling %s bij %s" % (b["nr"], _winkel()), html, tekst


def voor_max(b, beheerlink):
    k = b["klant"]
    stap = ("Staat automatisch door naar %s." % cfg.LEVERANCIER_NAAM if cfg.LEVERANCIER_AUTOMATISCH
            else "Controleer hem en druk in de Max-modus op 'Naar leverancier'.")
    delen = [
        _p("Nieuwe betaalde bestelling. %s" % escape(stap)),
        _regels_html(b),
        _p("<b>Klant</b><br>%s<br>%s<br>%s" % (_adres_html(k), escape(k.get("email", "")), escape(k.get("telefoon", "")))),
        _knop(beheerlink, "Open in de Max-modus", KH_GROEN),
    ]
    html = _winkelmail("%s: %s" % (b["nr"], euro(b["totaal"])), delen)
    tekst = "Nieuwe bestelling %s, %s\n\n%s\n\n%s\n\n%s" % (
        b["nr"], euro(b["totaal"]), _regels_tekst(b), _adres(k), beheerlink)
    return "Kozijnhorren: %s, %s (%s)" % (b["nr"], euro(b["totaal"]), k.get("plaats", "")), html, tekst


def leverancier_tekst(b):
    """De bestelling zoals de leverancier hem nodig heeft. Ook als tekst te
    kopiëren in de Max-modus, voor als de leverancier een bestelportaal heeft."""
    k = b["klant"]
    regels = []
    for i, r in enumerate(b["regels"], 1):
        regels.append(
            "%d. %d x inklemhor (%s) | B %d mm x H %d mm (dagmaat) | RAL %s %s | %s%s | ref. %s-%d%s"
            % (i, r["aantal"], r["uitvoering"], r["breedte"], r["hoogte"], r["kleur"]["code"],
               r["kleur"]["naam"], r["gaas"].lower(),
               " | met middenregel" if r.get("middenregel") else "",
               b["nr"], i, (" (" + r["naam"] + ")") if r.get("naam") else "")
        )
    vanaf = ""
    if b.get("levertijd", {}).get("voorjaar"):
        vanaf = "\nGraag leveren vanaf %s (niet eerder).\n" % datum_nl(b["levertijd"]["van"])
    return (
        "Bestelling %s\n\n%s\n\nRechtstreeks leveren aan:\n%s\nTel. %s\n%s\n"
        "Graag neutraal verpakken, zonder prijzen of pakbon met prijzen.\n"
        "Factuur naar: %s (%s)\n"
        % (b["nr"], "\n".join(regels), _adres(k), k.get("telefoon", ""), vanaf, cfg.MAX_EMAIL,
           cfg.WINKEL["juridisch"])
    )


def voor_leverancier(b):
    tekst = leverancier_tekst(b)
    html = _opmaak("Bestelling %s" % b["nr"],
                   '<pre style="font:14px/1.6 Menlo,Consolas,monospace;white-space:pre-wrap;margin:0">%s</pre>'
                   % escape(tekst), cfg.WINKEL["naam"], KH_GROEN)
    return "Bestelling %s, rechtstreeks leveren (%s)" % (b["nr"], b["klant"].get("plaats", "")), html, tekst


def verzonden(b, statuslink):
    k = b["klant"]
    track = (b.get("verzending") or {}).get("track")
    delen = [
        _p(_aanhef(k.get("naam"))),
        _p("Je horren zijn onderweg naar %s." % escape(k.get("straat", "je adres"))),
    ]
    if track:
        delen.append(_knop(track, "Volg je pakket", KH_GROEN))
    delen += [
        _p("<b>Even controleren bij ontvangst.</b> Pak de horren uit en kijk of er niets beschadigd is. "
           "Is er iets mis? Stuur dan binnen twee dagen een foto, dan regelen we een nieuwe."),
        _p('Plaatsen doe je zonder gereedschap. <a href="%s/meetinstructie#plaatsen" style="color:%s">Zo werkt het</a>.'
           % (cfg.SHOP_URL, KH_GROEN)),
    ]
    html = _winkelmail("Je horren zijn onderweg", delen)
    tekst = "%s\n\nJe horren zijn onderweg.%s\n\nIs er bij ontvangst iets beschadigd? Stuur binnen twee dagen een foto.\n\n%s" % (
        _aanhef(k.get("naam")), ("\nVolg je pakket: " + track) if track else "", statuslink)
    return "Je horren zijn onderweg (%s)" % b["nr"], html, tekst


def past_alles(b, reviewlink):
    k = b["klant"]
    wa = "https://wa.me/%s" % cfg.WINKEL["whatsapp"]
    delen = [
        _p(_aanhef(k.get("naam"))),
        _p("Je horren zijn een paar dagen binnen. Passen ze goed?"),
        _p('Zit er iets niet goed, antwoord dan op deze mail of <a href="%s" style="color:%s">stuur een '
           "WhatsApp</a> met een foto. Dan lossen we het op; daar is de pasgarantie voor." % (wa, KH_GROEN)),
    ]
    if reviewlink:
        delen += [_p("Ben je tevreden? Dan zouden we het heel fijn vinden als je dat in een review zet."),
                  _knop(reviewlink, "Schrijf een review", KH_GROEN)]
    html = _winkelmail("Past alles?", delen)
    tekst = "%s\n\nJe horren zijn een paar dagen binnen. Passen ze goed? Zo niet, antwoord op deze mail.%s" % (
        _aanhef(k.get("naam")), ("\n\nTevreden? Een review helpt ons enorm: " + reviewlink) if reviewlink else "")
    return "Passen je horren? (%s)" % b["nr"], html, tekst
