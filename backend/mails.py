"""De teksten van alle mails. Elke functie geeft (onderwerp, html, tekst).

Twee afzenders, twee stijlen: het opleverrapport komt van iWrap (Max), alles over
een bestelling van kozijnhorren.nl. De opmaak is bewust eenvoudig: één kolom,
gewone tekst, één knop. Dat komt in elke mailbox goed aan, ook in Outlook.
"""

import re
from html import escape

from . import instellingen as cfg
from .horren import catalogus, datum_nl, euro, levertijd_tekst

INKT = "#171717"
IWRAP_MINT = "#3f7468"
# kozijnhorren.nl: het woordmerk in het felle oranje, knoppen en links in het
# donkerdere oranje waar witte tekst wel goed op leesbaar is.
KH_LOGO = "#ff5000"
KH_ORANJE = "#d93d00"


def _knop(url, label, kleur=INKT):
    return ('<p style="margin:26px 0"><a href="%s" style="display:inline-block;background:%s;'
            'color:#ffffff;text-decoration:none;font-weight:600;padding:13px 24px;'
            'border-radius:999px">%s</a></p>' % (escape(url, True), kleur, escape(label)))


def _opmaak(kop, inhoud, afzender, accent):
    return (
        '<!doctype html><html lang="nl"><head><meta charset="utf-8"></head><body style="margin:0;background:#f8f3ee;'
        'font-family:-apple-system,Segoe UI,Arial,sans-serif;color:%s">'
        '<div style="max-width:600px;margin:0 auto;padding:28px 18px">'
        '<div style="background:#ffffff;border-radius:18px;padding:30px 28px;'
        'font-size:16px;line-height:1.6">'
        '%s'
        '<h1 style="font-size:23px;line-height:1.25;margin:0 0 16px;font-weight:500">%s</h1>%s</div>'
        '<p style="font-size:12px;color:#8a8f94;margin:16px 6px 0">%s</p>'
        '</div></body></html>'
        % (INKT, _afzender_kop(afzender, accent), escape(kop), inhoud, _voet(afzender))
    )


def _afzender_kop(afzender, accent):
    if afzender == "iWrap":
        return ('<p style="margin:0 0 18px;font-size:13px;letter-spacing:.08em;text-transform:uppercase;'
                'color:%s;font-weight:700">%s</p>' % (accent, escape(afzender)))
    # Het woordmerk van de winkel. Nunito heeft bijna geen mailprogramma; Arial
    # Rounded (Mac, Office) komt er het dichtst bij, anders Arial Black.
    return ('<p style="margin:0 0 20px;font-family:Nunito,\'Arial Rounded MT Bold\',\'Arial Black\',Arial,sans-serif;font-size:24px;'
            'line-height:1;font-weight:800;letter-spacing:-.02em;color:%s">%s</p>' % (KH_LOGO, escape(afzender)))


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
    return _opmaak(kop, "".join(delen), _winkel(), KH_ORANJE)


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
           % (cfg.SHOP_URL, KH_ORANJE)),
        _knop(statuslink, "Bekijk je bestelling", KH_ORANJE),
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
        _knop(beheerlink, "Open in de Max-modus", KH_ORANJE),
    ]
    html = _winkelmail("%s: %s" % (b["nr"], euro(b["totaal"])), delen)
    tekst = "Nieuwe bestelling %s, %s\n\n%s\n\n%s\n\n%s" % (
        b["nr"], euro(b["totaal"]), _regels_tekst(b), _adres(k), beheerlink)
    return "kozijnhorren.nl: %s, %s (%s)" % (b["nr"], euro(b["totaal"]), k.get("plaats", "")), html, tekst


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
                   % escape(tekst), cfg.WINKEL["naam"], KH_ORANJE)
    return "Bestelling %s, rechtstreeks leveren (%s)" % (b["nr"], b["klant"].get("plaats", "")), html, tekst


def verzonden(b, statuslink):
    k = b["klant"]
    track = (b.get("verzending") or {}).get("track")
    delen = [
        _p(_aanhef(k.get("naam"))),
        _p("Je horren zijn onderweg naar %s." % escape(k.get("straat", "je adres"))),
    ]
    if track:
        delen.append(_knop(track, "Volg je pakket", KH_ORANJE))
    delen += [
        _p("<b>Even controleren bij ontvangst.</b> Pak de horren uit en kijk of er niets beschadigd is. "
           "Is er iets mis? Stuur dan binnen twee dagen een foto, dan regelen we een nieuwe."),
        _p('Plaatsen doe je zonder gereedschap. <a href="%s/meetinstructie#plaatsen" style="color:%s">Zo werkt het</a>.'
           % (cfg.SHOP_URL, KH_ORANJE)),
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
           "WhatsApp</a> met een foto. Dan lossen we het op; daar is de pasgarantie voor." % (wa, KH_ORANJE)),
    ]
    if reviewlink:
        delen += [_p("Ben je tevreden? Dan zouden we het heel fijn vinden als je dat in een review zet."),
                  _knop(reviewlink, "Schrijf een review", KH_ORANJE)]
    html = _winkelmail("Past alles?", delen)
    tekst = "%s\n\nJe horren zijn een paar dagen binnen. Passen ze goed? Zo niet, antwoord op deze mail.%s" % (
        _aanhef(k.get("naam")), ("\n\nTevreden? Een review helpt ons enorm: " + reviewlink) if reviewlink else "")
    return "Passen je horren? (%s)" % b["nr"], html, tekst


# ---------------------------------------------------------------------------
# iwrap.nl: offerteaanvragen (zie aanvragen.py)
# ---------------------------------------------------------------------------

def _m(centimeters):
    return ("%.2f m" % (centimeters / 100)).replace(".", ",")


def _kozijn_kop(k, nr):
    from .aanvragen import WAAR
    delen = ["Kozijn %d" % nr, WAAR.get(k["waar"], "")]
    if k["plek"]:
        delen.append(k["plek"])
    if k["aantal"] > 1:
        delen.append("%d× hetzelfde" % k["aantal"])
    return " · ".join(d for d in delen if d)


def _kozijn_werk(k, nr):
    """Wat er aan één kozijn moet gebeuren, als losse regels tekst."""
    regels = []
    if k["heel"]:
        regels.append("Het hele kozijn")
    elif k["aangestreept"]:
        regels.append("Aangestreept op de foto: zie kozijn-%d-aangestreept.jpg" % nr)
    for r in k["regels"]:
        if r["aantal"] > 1:
            regels.append("%s: %d × %s = %s" % (r["deel"], r["aantal"], _m(r["cm"]), _m(r["cm"] * r["aantal"])))
        else:
            regels.append("%s: %s" % (r["deel"], _m(r["cm"])))
    if k["breedte"]:
        regels.append("Breedte × hoogte: %d × %d cm" % (k["breedte"], k["hoogte"]))
    if k["regels"]:
        per_stuk = sum(r["cm"] * r["aantal"] for r in k["regels"])
        regels.append("Opgegeven lengte: %s%s" % (
            _m(per_stuk), " per kozijn, %s samen" % _m(per_stuk * k["aantal"]) if k["aantal"] > 1 else ""))
    return regels


def _kozijn_fotos(a, nr):
    from .aanvragen import fotolijst
    return [f["naam"] for f in fotolijst(a) if f["kozijn"] == nr and a["manier"] != "papier"]


def _aanvraag_onderwerp(a):
    from .aanvragen import MANIEREN
    g = a["gegevens"]
    if a["manier"] == "papier":
        wat = "tekening en %d foto%s" % (a["papier"]["fotos"], "'s" if a["papier"]["fotos"] != 1 else "")
    else:
        n = len(a["kozijnen"])
        wat = "%d kozijn%s" % (n, "en" if n != 1 else "")
    return "Aanvraag %s, %s: %s, %s" % (g["naam"], g["plaats"], wat, MANIEREN[a["manier"]].lower())


def aanvraag_voor_max(a):
    """De mail aan Max. Werkbon-achtig: eerst wie en waar, dan per kozijn wat er
    moet gebeuren, en alle foto's als bijlage met het kozijnnummer in de naam."""
    from urllib.parse import quote

    from .aanvragen import MANIEREN, WAAR, fotolijst, totalen
    g = a["gegevens"]
    adres = "%s %s, %s" % (g["postcode"], g["huisnummer"], g["plaats"])
    kaart = "https://www.google.com/maps/search/?api=1&query=" + quote("%s %s %s" % (g["postcode"], g["huisnummer"], g["plaats"]))
    kleur = "Dezelfde kleur houden" if a["kleur"] == "zelfde" else "Andere kleur: " + a["kleur_anders"]
    aantal_fotos = len(fotolijst(a))

    def rij(label, waarde):
        return ('<tr><td style="padding:5px 16px 5px 0;color:#6b7075;vertical-align:top;white-space:nowrap">%s</td>'
                '<td style="padding:5px 0;vertical-align:top">%s</td></tr>' % (label, waarde))

    contact = "".join([
        rij("Telefoon", '<a href="tel:%s" style="color:%s">%s</a>' % (escape(re.sub(r"[^\d+]", "", g["telefoon"]), True), IWRAP_MINT, escape(g["telefoon"]))),
        rij("E-mail", '<a href="mailto:%s" style="color:%s">%s</a>' % (escape(g["email"], True), IWRAP_MINT, escape(g["email"]))),
        rij("Adres", '%s &nbsp;<a href="%s" style="color:%s">Google Maps</a>' % (escape(adres), escape(kaart, True), IWRAP_MINT)),
        rij("Manier", escape(MANIEREN[a["manier"]])),
        rij("Kleur", escape(kleur)),
        rij("Via de site", escape(a["via"])) if a["via"] else "",
        rij("Opmerking", escape(a["toelichting"]).replace("\n", "<br>")) if a["toelichting"] else "",
    ])

    blokken, tekstblokken = [], []
    if a["manier"] == "papier":
        p = a["papier"]
        tekeningen = ", ".join("tekening-%d.jpg" % n for n in range(1, p["tekeningen"] + 1))
        fotos = ", ".join("kozijn-%d-foto.jpg" % n for n in range(1, p["fotos"] + 1))
        waar = ", ".join(WAAR[w] for w in p["waar"])
        blokken.append(_werkblok("Getekend op papier", [
            "Wat er moet gebeuren staat op de tekening: %s" % tekeningen,
            "Foto's van de kozijnen: %s" % fotos,
            "Waar ze zitten: %s" % waar]))
        tekstblokken.append("Getekend op papier\n  Tekening: %s\n  Foto's: %s\n  Waar: %s" % (tekeningen, fotos, waar))
    else:
        for nr, k in enumerate(a["kozijnen"], 1):
            werk = _kozijn_werk(k, nr)
            fotos = "Foto's: " + ", ".join(_kozijn_fotos(a, nr))
            blokken.append(_werkblok(_kozijn_kop(k, nr), werk + [fotos]))
            tekstblokken.append(_kozijn_kop(k, nr) + "\n  " + "\n  ".join(werk + [fotos]))

    samen = ""
    if a["manier"] != "papier":
        t = totalen(a)
        delen = ["%d kozijn%s" % (t["kozijnen"], "en" if t["kozijnen"] != 1 else "")]
        if t["stuks"] != t["kozijnen"]:
            delen[0] += " (%d stuks)" % t["stuks"]
        if t["opgegeven_cm"]:
            delen.append("opgegeven lengte samen %s" % _m(t["opgegeven_cm"]))
        hoog = ["%d op de %s" % (n, WAAR[w]) for w, n in t["per_hoogte"].items() if w != "begane-grond"]
        if hoog:
            delen.append(", ".join(hoog))
        samen = " · ".join(delen)

    html = (
        '<!doctype html><html lang="nl"><head><meta charset="utf-8"></head>'
        '<body style="margin:0;background:#f4f2ee;font-family:-apple-system,Segoe UI,Arial,sans-serif;color:%s">'
        '<div style="max-width:680px;margin:0 auto;padding:24px 16px">'
        '<div style="background:#ffffff;border-radius:16px;padding:26px 26px 22px;font-size:15px;line-height:1.55">'
        '<p style="margin:0 0 6px;font-size:12px;letter-spacing:.08em;text-transform:uppercase;color:%s;font-weight:700">'
        'Nieuwe aanvraag via iwrap.nl</p>'
        '<h1 style="font-size:22px;line-height:1.25;margin:0 0 4px;font-weight:600">%s</h1>'
        '<p style="margin:0 0 18px;color:#6b7075">%s &middot; %d foto%s als bijlage</p>'
        '<table role="presentation" style="border-collapse:collapse;font-size:15px;margin:0 0 22px">%s</table>'
        '<h2 style="font-size:16px;margin:0 0 10px">Wat er moet gebeuren</h2>%s%s'
        '<p style="margin:18px 0 0;font-size:12px;color:#8a8f94">Antwoord je op deze mail, dan gaat hij naar '
        '%s. Aanvraag %s. Alle gegevens staan ook in de bijlage aanvraag.json.</p>'
        '</div></div></body></html>'
        % (INKT, IWRAP_MINT, escape("%s, %s" % (g["naam"], g["plaats"])),
           escape(MANIEREN[a["manier"]]), aantal_fotos, "'s" if aantal_fotos != 1 else "",
           contact, "".join(blokken),
           ('<p style="margin:14px 0 0;padding:12px 14px;background:#eef6f3;border-radius:10px">'
            '<b>Samen:</b> %s</p>' % escape(samen)) if samen else "",
           escape(g["email"]), escape(a["id"]))
    )
    tekst = "\n".join([
        "NIEUWE AANVRAAG VIA IWRAP.NL", "",
        "%s, %s" % (g["naam"], g["plaats"]),
        "Telefoon: %s" % g["telefoon"], "E-mail: %s" % g["email"], "Adres: %s" % adres,
        "Manier: %s" % MANIEREN[a["manier"]], "Kleur: %s" % kleur,
    ] + (["Via de site: %s" % a["via"]] if a["via"] else [])
      + (["Opmerking: %s" % a["toelichting"]] if a["toelichting"] else [])
      + ["", "WAT ER MOET GEBEUREN"] + tekstblokken
      + (["", "Samen: " + samen] if samen else [])
      + ["", "Aanvraag %s. Alle gegevens staan ook in aanvraag.json." % a["id"]])
    return _aanvraag_onderwerp(a), html, tekst


def _werkblok(kop, regels):
    return ('<div style="border:1px solid #e3e1db;border-radius:12px;padding:12px 16px;margin:0 0 10px">'
            '<p style="margin:0 0 6px;font-weight:600">%s</p>%s</div>'
            % (escape(kop), "".join('<p style="margin:0 0 3px">%s</p>' % escape(r) for r in regels)))


def aanvraag_bevestiging(a):
    """De bevestiging aan de klant: wat hij stuurde, en wat er nu gebeurt.
    Bewust zonder termijn: wanneer Max antwoordt, hangt van de planning af."""
    g = a["gegevens"]
    if a["manier"] == "papier":
        regels = ["Je tekening en %d foto%s van je kozijnen" % (a["papier"]["fotos"], "'s" if a["papier"]["fotos"] != 1 else "")]
    else:
        regels = []
        for nr, k in enumerate(a["kozijnen"], 1):
            werk = _kozijn_werk(k, nr)
            if k["aangestreept"]:
                werk = ["wat je op de foto hebt aangestreept"] + werk[1:]
            regels.append("%s: %s" % (_kozijn_kop(k, nr), "; ".join(w for w in werk if not w.startswith("Opgegeven"))))
    lijst = "".join('<li style="margin:0 0 6px">%s</li>' % escape(r) for r in regels)
    delen = [
        _p(_aanhef(g["naam"])),
        _p("Bedankt voor je aanvraag. Dit is wat je ons hebt gestuurd:"),
        '<ul style="margin:0 0 16px;padding-left:20px">%s</ul>' % lijst,
        _p("We bekijken je foto's en sturen je een offerte met een vaste totaalprijs. Kunnen we "
           "iets niet goed zien, dan bellen of mailen we je even."),
        _p("Wil je nog iets toevoegen, bijvoorbeeld een extra foto? Beantwoord deze mail gewoon."),
        _p("Groet, Max"),
    ]
    html = _opmaak("We hebben je aanvraag ontvangen", "".join(delen), "iWrap", IWRAP_MINT)
    tekst = "%s\n\nBedankt voor je aanvraag. Dit is wat je ons hebt gestuurd:\n- %s\n\n" \
            "We bekijken je foto's en sturen je een offerte met een vaste totaalprijs. Kunnen we iets niet " \
            "goed zien, dan bellen of mailen we je even.\n\nGroet, Max\niWrap" % (_aanhef(g["naam"]), "\n- ".join(regels))
    return "We hebben je aanvraag ontvangen", html, tekst
