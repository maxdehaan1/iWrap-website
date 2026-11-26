#!/usr/bin/env python3
"""Loopt de hele stroom door zonder browser.

iwrap.nl: een klant vraagt op drie manieren een offerte aan (foto en
aanstrepen, foto en maten, op papier); Max krijgt één mail met de foto's als
bijlage. Max maakt een klus, vult de kozijncheck in en zet het rapport klaar.
Staan de horren op oranje of rood, dan verwijst het rapport naar kozijnhorren.nl
met de kleur van de folie al gekozen.

kozijnhorren.nl: een klant bestelt, betaalt in de testkassa, Max stuurt door en
zet op verzonden, en de dagelijkse cron stuurt "past alles?". Een klant bestelt met
een partnercode en krijgt korting, en de leverancier bevestigt en meldt de
verzending via zijn eigen link.

Draait tegen een lege tijdelijke map, dus je echte .data/ blijft ongemoeid.

    python3 tests/test_backend.py
"""

import io
import json
import os
import shutil
import sys
import tempfile
from pathlib import Path
from urllib.parse import urlparse

TMP = tempfile.mkdtemp(prefix="iwrap-test-")
os.environ["DATA_MAP"] = TMP
for sleutel in ("MOLLIE_API_KEY", "MS_TENANT_ID", "MS_CLIENT_ID", "MS_CLIENT_SECRET", "KV_REST_API_URL",
                "UPSTASH_REDIS_REST_URL", "VERCEL", "LEVERANCIER_AUTOMATISCH", "GOOGLE_PLACES_API_KEY"):
    os.environ.pop(sleutel, None)
os.environ["MAX_WACHTWOORD"] = "test"
sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from backend.app import app  # noqa: E402
from backend import aanvragen, bestellingen, horren, reviews  # noqa: E402
from backend import instellingen as cfg  # noqa: E402

GOED = 0


def verzoek(methode, pad, data=None, token=None, form=None, origin=None, ruw=None, ip="127.0.0.1"):
    if ruw is not None:
        body, ctype = ruw, "image/jpeg"
    elif form is not None:
        body = "&".join("%s=%s" % kv for kv in form.items()).encode()
        ctype = "application/x-www-form-urlencoded"
    else:
        body = json.dumps(data).encode() if data is not None else b""
        ctype = "application/json"
    pad, _, query = pad.partition("?")
    environ = {"REQUEST_METHOD": methode, "PATH_INFO": pad, "QUERY_STRING": query,
               "CONTENT_LENGTH": str(len(body)), "CONTENT_TYPE": ctype,
               "wsgi.input": io.BytesIO(body), "REMOTE_ADDR": ip}
    if token:
        environ["HTTP_AUTHORIZATION"] = "Bearer " + token
    if origin:
        environ["HTTP_ORIGIN"] = origin
    uit = {}

    def sr(status, koppen):
        uit["status"] = int(status.split()[0])
        uit["koppen"] = dict(koppen)

    inhoud = b"".join(app(environ, sr))
    try:
        uit["json"] = json.loads(inhoud)
    except ValueError:
        uit["tekst"] = inhoud.decode("utf-8", "replace")
    return uit


def klopt(voorwaarde, wat):
    global GOED
    if not voorwaarde:
        raise SystemExit("FOUT: " + wat)
    GOED += 1
    print("  ok  " + wat)


# Een echte, piepkleine jpeg: begint met FFD8, zoals de server wil.
JPEG = bytes.fromhex("ffd8ffe000104a46494600010100000100010000ffdb004300") + b"\x08" * 64 + bytes.fromhex("ffd9")

GEGEVENS = {"naam": "Joke Jansen", "email": "joke@voorbeeld.nl", "telefoon": "06 12345678",
            "postcode": "1214ab", "straat": "Lindelaan", "huisnummer": "12", "plaats": "Hilversum",
            "toelichting": "Bel liever na 17 uur."}


def aanvragen_testen():
    print("Offerteaanvragen (iwrap.nl)")
    r = verzoek("POST", "/api/aanvragen", {"manier": "maten", "kozijnen": [{"waar": "begane-grond"}],
                                           "gegevens": GEGEVENS})
    klopt(r["status"] == 422 and "minstens één deel" in r["json"]["fout"], "maten zonder delen wordt geweigerd")
    from backend import instellingen
    instellingen.OP_VERCEL = True
    r = verzoek("POST", "/api/aanvragen", {"manier": "maten", "gegevens": GEGEVENS})
    instellingen.OP_VERCEL = False
    klopt(r["status"] == 503 and "staat nog uit" in r["json"]["fout"],
          "op Vercel zonder mailkoppeling zegt het formulier eerlijk dat versturen nog uitstaat")
    r = verzoek("POST", "/api/aanvragen", {"manier": "maten", "kleur_nu": "paars", "klant": "onzin",
                                           "kozijnen": [{"waar": "hoog", "kant": "boven", "heel": True,
                                                         "breedte": "120", "hoogte": "140"}],
                                           "gegevens": GEGEVENS}, ip="127.0.0.2")
    klopt(r["status"] == 201, "2e verdieping of hoger is een geldige plek; onbekende keuzes worden genegeerd")
    a = aanvragen.haal(r["json"]["id"])
    klopt(a["kleur_nu"] == "" and a["klant"] == "particulier" and a["kozijnen"][0]["kant"] == "",
          "een onbekende kleur, klant of kant valt terug op leeg of particulier")
    r = verzoek("POST", "/api/aanvragen", {"manier": "streep", "kozijnen": [{"waar": "verdieping"}],
                                           "gegevens": GEGEVENS})
    klopt(r["status"] == 422 and "streep" in r["json"]["fout"], "aanstrepen zonder aanstreping wordt geweigerd")
    r = verzoek("POST", "/api/aanvragen", {"manier": "papier", "papier": {"tekeningen": 1, "fotos": 2, "waar": ["dakkapel"]},
                                           "gegevens": dict(GEGEVENS, email="geen-mail")})
    klopt(r["status"] == 422 and "e-mailadres" in r["json"]["fout"], "een fout e-mailadres wordt geweigerd")
    r = verzoek("POST", "/api/aanvragen", {"manier": "papier", "website": "spam",
                                           "papier": {"tekeningen": 1, "fotos": 1, "waar": ["dakkapel"]}, "gegevens": GEGEVENS})
    klopt(r["status"] == 422, "het onzichtbare robotveld houdt spam tegen")

    # Foto en maten: 1,60 en 130 zijn allebei goed, en een kozijn dat twee keer voorkomt telt dubbel.
    r = verzoek("POST", "/api/aanvragen", {
        "manier": "maten", "kleur": "zelfde", "via": "folie laat los", "gegevens": GEGEVENS,
        "kleur_nu": "creme", "zijde": "beide", "rolluik": "ja", "klant": "vve", "wanneer": "voorjaar",
        "bron": "dealer", "dealer": "Weru Teststad",
        "kozijnen": [
            {"waar": "begane-grond", "kant": "achter", "plek": "keuken", "aantal": 2, "dichtbij": True,
             "regels": [{"deel": "Onderdorpel", "lengte": "1,60", "aantal": 1},
                        {"deel": "Stijl", "lengte": "130", "aantal": 2}]},
            {"waar": "dakkapel", "heel": True, "breedte": "2,40", "hoogte": "1,20"},
        ]})
    klopt(r["status"] == 201, "aanvraag met maten aangemaakt")
    aid, tok, namen = r["json"]["id"], r["json"]["token"], r["json"]["fotos"]
    klopt(namen == ["kozijn-1-foto.jpg", "kozijn-1-dichtbij.jpg", "kozijn-2-foto.jpg"],
          "de server zegt welke foto's hij verwacht, met het kozijnnummer erin")
    klopt(verzoek("PUT", "/api/aanvragen/%s/fotos/kozijn-1-foto.jpg?t=fout" % aid, ruw=JPEG)["status"] == 404,
          "zonder het juiste token geen foto's")
    klopt(verzoek("PUT", "/api/aanvragen/%s/fotos/kozijn-9-foto.jpg?t=%s" % (aid, tok), ruw=JPEG)["status"] == 422,
          "een foto die niet bij de aanvraag hoort wordt geweigerd")
    klopt(verzoek("PUT", "/api/aanvragen/%s/fotos/kozijn-1-foto.jpg?t=%s" % (aid, tok), ruw=b"GIF89a")["status"] == 422,
          "alleen jpeg")
    klopt(verzoek("PUT", "/api/aanvragen/%s/fotos/kozijn-1-foto.jpg?t=%s" % (aid, tok), ruw=JPEG)["status"] == 200,
          "foto 1 ontvangen")
    r = verzoek("POST", "/api/aanvragen/%s/versturen?t=%s" % (aid, tok))
    klopt(r["status"] == 409 and r["json"]["ontbreekt"] == ["kozijn-1-dichtbij.jpg", "kozijn-2-foto.jpg"],
          "versturen zegt welke foto's er nog missen")
    for naam in namen[1:]:
        verzoek("PUT", "/api/aanvragen/%s/fotos/%s?t=%s" % (aid, naam, tok), ruw=JPEG)
    r = verzoek("POST", "/api/aanvragen/%s/versturen?t=%s" % (aid, tok))
    klopt(r["status"] == 200 and r["json"]["bevestiging"], "verstuurd, met een bevestiging aan de klant")
    klopt(verzoek("POST", "/api/aanvragen/%s/versturen?t=%s" % (aid, tok))["status"] == 200,
          "nog een keer op versturen drukken stuurt niets dubbel")

    uitbak = os.path.join(TMP, "uitbak")
    mails = sorted(os.listdir(uitbak))
    klopt(len([m for m in mails if m.endswith("-aanvraag.html")]) == 1, "precies één mail aan Max")
    html = open(os.path.join(uitbak, [m for m in mails if m.endswith("-aanvraag.html")][0]), encoding="utf-8").read()
    klopt("Aanvraag Joke Jansen, Hilversum: 2 kozijnen, foto en maten" in html, "onderwerp zegt wie, waar en hoe")
    klopt("Stijl: 2 × 1,30 m = 2,60 m" in html and "Onderdorpel: 1,60 m" in html, "maten staan er netjes in, in meters")
    klopt("4,20 m per kozijn, 8,40 m samen" in html, "een kozijn dat twee keer voorkomt telt dubbel")
    klopt("Breedte × hoogte: 240 × 120 cm" in html and "1 op de dakkapel" in html, "heel kozijn en dakkapel staan erin")
    klopt("Antwoord naar: joke@voorbeeld.nl" in html, "antwoorden gaat naar de klant")
    bijlagen = sorted(os.listdir(os.path.join(uitbak, [m for m in mails if m.endswith("-aanvraag-bijlagen")][0])))
    klopt(bijlagen == ["aanvraag.json", "kozijn-1-dichtbij.jpg", "kozijn-1-foto.jpg", "kozijn-2-foto.jpg"],
          "alle foto's als bijlage, plus aanvraag.json")
    data = json.load(open(os.path.join(uitbak, [m for m in mails if m.endswith("-aanvraag-bijlagen")][0], "aanvraag.json")))
    klopt(data["totalen"]["opgegeven_cm"] == 840 and "token" not in data, "aanvraag.json klopt en bevat geen token")
    klopt(data["kleur_nu"] == "creme" and data["zijde"] == "beide" and data["rolluik"] is True
          and data["klant"] == "vve" and data["bron"] == "dealer" and data["dealer"] == "Weru Teststad"
          and data["kozijnen"][0]["kant"] == "achter",
          "de korte vragen (kleur nu, binnen/buiten, rolluikkasten, voor wie, hoe ken je ons, kant) in aanvraag.json")
    klopt("Kleur nu" in html and "crème" in html and "binnen en buiten" in html and "Rolluikkasten" in html
          and "een kozijndealer: Weru Teststad" in html and "achterkant" in html,
          "en in de mail aan Max")
    bevestiging = open(os.path.join(uitbak, [m for m in mails if m.endswith("-aanvraag-bevestiging.html")][0]),
                       encoding="utf-8").read()
    klopt("We hebben je aanvraag ontvangen" in bevestiging and "werkdag" not in bevestiging,
          "bevestiging aan de klant, zonder belofte over wanneer")
    klopt("Offertes maken we op maandag" in bevestiging, "de bevestiging zegt dat offertes op maandag gemaakt worden")

    # Een complex (VvE, corporatie): geen kaarten per kozijn, maar het complex, en dan een opname.
    r = verzoek("POST", "/api/aanvragen", {"manier": "complex", "klant": "vve", "gegevens": GEGEVENS,
                                           "complex": {"organisatie": "VvE De Proef", "woningen": "0"}}, ip="127.0.0.2")
    klopt(r["status"] == 422, "een complex zonder aantal woningen en zonder plek wordt geweigerd")
    r = verzoek("POST", "/api/aanvragen", {"manier": "complex", "klant": "vve", "gegevens": GEGEVENS,
                                           "complex": {"organisatie": "VvE De Proef", "woningen": "36",
                                                       "adres": "Proefstraat, Hilversum",
                                                       "omschrijving": "Alle onderdorpels aan de zonkant", "fotos": 1}}, ip="127.0.0.2")
    klopt(r["status"] == 201 and r["json"]["fotos"] == ["foto-1.jpg"], "complex aangemaakt; de server verwacht één foto")
    cid, ctok = r["json"]["id"], r["json"]["token"]
    verzoek("PUT", "/api/aanvragen/%s/fotos/foto-1.jpg?t=%s" % (cid, ctok), ruw=JPEG)
    r = verzoek("POST", "/api/aanvragen/%s/versturen?t=%s" % (cid, ctok))
    klopt(r["status"] == 200, "complex verstuurd")
    mails = sorted(os.listdir(uitbak))
    html = open(os.path.join(uitbak, [m for m in mails if m.endswith("-aanvraag.html")][-1]), encoding="utf-8").read()
    klopt("Aanvraag VvE De Proef, Hilversum: complex van 36 woningen, opname" in html
          and "Alle onderdorpels aan de zonkant" in html and "foto-1.jpg" in html,
          "de mail aan Max noemt het complex, het aantal woningen en de foto")
    bevestiging = open(os.path.join(uitbak, [m for m in mails if m.endswith("-aanvraag-bevestiging.html")][-1]),
                       encoding="utf-8").read()
    klopt("opname op locatie" in bevestiging and "vaste totaalprijs" not in bevestiging,
          "de bevestiging zegt dat we een opname komen inplannen")

    klopt("Lindelaan 12, 1214 AB Hilversum" in html, "het adres staat er compleet in, met de straat")

    # De Max-modus: de aanvraag staat onder Aanvragen, en wordt met één knop een klus.
    token = verzoek("POST", "/api/max/login", {"wachtwoord": "test"})["json"]["token"]
    klopt(verzoek("GET", "/api/max/aanvragen")["status"] == 401, "aanvragen alleen voor Max")
    lijst = verzoek("GET", "/api/max/aanvragen", token=token)["json"]["aanvragen"]
    ids = [x["id"] for x in lijst]
    klopt(sorted(ids) == sorted([aid, cid]) and [x for x in lijst if x["id"] == aid][0]["wat"] == "2 kozijnen"
          and [x for x in lijst if x["id"] == cid][0]["wat"] == "complex, 36 woningen",
          "verstuurde aanvragen staan in de lijst (ook het complex)")
    d = verzoek("GET", "/api/max/aanvragen/" + aid, token=token)["json"]
    klopt(d["overzicht"][0]["regels"][1] == "Stijl: 2 × 1,30 m = 2,60 m", "Max ziet per kozijn wat er moet gebeuren")
    r = verzoek("GET", "/api/max/aanvragen/%s/fotos/kozijn-1-foto.jpg" % aid, token=token)
    klopt(r["status"] == 200 and r["koppen"]["Content-Type"] == "image/jpeg", "Max ziet de foto's")
    klus = verzoek("POST", "/api/max/aanvragen/%s/klus" % aid, {}, token)["json"]["id"]
    r = verzoek("GET", "/api/max/rapporten/" + klus, token=token)["json"]
    klopt(r["klant"]["straat"] == "Lindelaan 12" and r["klant"]["email"] == "joke@voorbeeld.nl" and r["aanvraag"] == aid,
          "klus uit een aanvraag: klantgegevens staan al klaar")
    klopt(r["oplevering"]["werk"] == "Kozijn 1 (2×): onderdorpel, stijl. Kozijn 2: het hele kozijn.",
          "en het werk ook, als begin voor het rapport")
    klopt(verzoek("POST", "/api/max/aanvragen/%s/klus" % aid, {}, token)["json"]["id"] == klus,
          "nog een keer op de knop maakt geen tweede klus")
    klopt(verzoek("GET", "/api/max/aanvragen", token=token)["json"]["aanvragen"][0]["klus"] == klus,
          "in de lijst staat dat er al een klus van is")

    # Foto en aanstrepen: de aangestreepte foto komt als eigen bijlage mee.
    r = verzoek("POST", "/api/aanvragen", {"manier": "streep", "gegevens": GEGEVENS, "kozijnen": [
        {"waar": "verdieping", "aangestreept": True, "aanstreping": ["kozijn", "draai", "onzin"]},
        {"waar": "begane-grond", "heel": True}]})
    klopt(r["json"]["fotos"] == ["kozijn-1-foto.jpg", "kozijn-1-aangestreept.jpg", "kozijn-2-foto.jpg"],
          "bij aanstrepen hoort een aangestreepte foto, bij 'heel kozijn' niet")
    from backend import aanvragen as av, mails as ml
    a2 = av.haal(r["json"]["id"])
    klopt(a2["kozijnen"][0]["aanstreping"] == ["kozijn", "draai"] and a2["kozijnen"][1]["aanstreping"] == [],
          "de server onthoudt welke stiften er gebruikt zijn (geel en rood), en niets anders")
    klopt("(geel = kozijn, rood = draairaam of deur)" in ml.aanvraag_voor_max(a2)[1],
          "de mail aan Max zegt welke kleur wat is")
    # Op papier: tekeningen en kozijnfoto's.
    r = verzoek("POST", "/api/aanvragen", {"manier": "papier", "gegevens": GEGEVENS,
                                           "papier": {"tekeningen": 2, "fotos": 3, "waar": ["begane-grond", "dakkapel"]}})
    klopt(r["json"]["fotos"] == ["tekening-1.jpg", "tekening-2.jpg", "kozijn-1-foto.jpg", "kozijn-2-foto.jpg",
                                 "kozijn-3-foto.jpg"], "op papier: tekeningen en een foto per kozijn")


def reviews_testen():
    print("Google-reviews")
    r = verzoek("GET", "/api/reviews", origin="https://kozijnwrap.nl")
    vast = reviews.basis()
    klopt(r["status"] == 200 and r["json"]["aantal"] == vast["aantal"] and r["json"]["bron"] == "reviews.json",
          "zonder sleutel: de stand uit reviews.json")
    klopt(r["koppen"].get("Access-Control-Allow-Origin") == "*", "elke site mag de reviews ophalen")
    klopt("s-maxage" in r["koppen"]["Cache-Control"], "Vercel mag het antwoord bewaren")
    klopt(all(k["url"].startswith("https://") for k in r["json"]["reviews"]), "elke review is aan te klikken")

    nep = {"rating": 4.87, "userRatingCount": 91, "reviews": [
        {"rating": 5, "publishTime": "2026-10-20T10:00:00Z", "relativePublishTimeDescription": "5 dagen geleden",
         "originalText": {"text": "Prachtig  werk aan   onze dakkapel, alles netjes opgeruimd en goed uitgelegd."},
         "authorAttribution": {"displayName": "Nieuwe Klant"}, "googleMapsUri": "https://maps.google.com/?r=1"},
        {"rating": 2, "originalText": {"text": "Dit is een lange maar negatieve review die niet op de site hoort."},
         "authorAttribution": {"displayName": "Boze Klant"}},
        {"rating": 5, "originalText": {"text": "Top!"}, "authorAttribution": {"displayName": "Kort"}},
    ]}

    class Antwoord(io.BytesIO):
        def __enter__(self):
            return self

        def __exit__(self, *a):
            return False

    aanroepen = []

    def nep_google(verzoek_, timeout=None):
        aanroepen.append(verzoek_.full_url)
        return Antwoord(json.dumps(nep).encode())

    echt = reviews.urllib.request.urlopen
    reviews.urllib.request.urlopen = nep_google
    cfg.GOOGLE_PLACES_API_KEY = "test-sleutel"
    try:
        d = verzoek("GET", "/api/reviews")["json"]
        klopt(d["bron"] == "google" and d["aantal"] == 91 and d["score_tekst"] == "4,9",
              "met sleutel: cijfer en aantal van Google")
        klopt(d["reviews"][0]["naam"] == "Nieuwe Klant" and "  " not in d["reviews"][0]["tekst"],
              "de nieuwste goede review staat vooraan")
        namen = [k["naam"] for k in d["reviews"]]
        klopt("Boze Klant" not in namen and "Kort" not in namen, "slechte en lege reviews komen niet op de site")
        klopt(len(namen) == reviews.MAX_KAARTEN, "aangevuld met reviews uit reviews.json")
        verzoek("GET", "/api/reviews")
        klopt(len(aanroepen) == 1, "Google wordt maar een keer per zes uur gevraagd")

        def plat(*a, **k):
            raise reviews.urllib.error.URLError("plat")
        reviews.urllib.request.urlopen = plat
        reviews._geheugen.update(t=0, d=None)
        reviews.opslag().weg(reviews.SLEUTEL)
        r = verzoek("GET", "/api/reviews")
        klopt(r["status"] == 200 and r["json"]["aantal"] == vast["aantal"] and "s-maxage=900" in r["koppen"]["Cache-Control"],
              "Google plat: de vaste stand, en kort bewaard")
    finally:
        reviews.urllib.request.urlopen = echt
        cfg.GOOGLE_PLACES_API_KEY = ""
        reviews._geheugen.update(t=0, d=None)


def bestel_en_betaal(klant, regels):
    r = verzoek("POST", "/api/horren/bestellingen", {"regels": regels, "klant": klant,
                                                     "akkoord": {"gemeten": True, "voorwaarden": True}})
    kassa = urlparse(r["json"]["betaal_url"])
    verzoek("POST", kassa.path, form={"t": r["json"]["token"], "uitkomst": "paid"})
    return r["json"]["nr"]


def code_en_leverancier_testen(token):
    print("Een partnercode geeft korting (kozijnhorren.nl)")
    r = verzoek("GET", "/api/horren/code/test")
    klopt(r["status"] == 200 and r["json"]["naam"] == "Testpartner" and r["json"]["korting_procent"] == 5,
          "de testcode werkt lokaal, hoofdletters maken niet uit")
    klopt(verzoek("GET", "/api/horren/code/GERADEN")["status"] == 404, "een onbekende code niet")
    r = verzoek("GET", "/api/horren/code/max")
    klopt(r["status"] == 200 and r["json"]["naam"] == "iWrap" and r["json"]["korting_procent"] == 5,
          "de eigen code van iWrap (MAX) werkt altijd, zonder PARTNERCODES")
    s = verzoek("GET", "/api/max/status", token=token)["json"]
    klopt(s["eigen_code"] == "MAX" and s["partnercodes"] == 1 and s["winkel_live"] is False,
          "de Max-modus kent je eigen code, telt alleen andere vakmensen, en weet dat de winkel nog dicht is")
    regels = [{"uitvoering": "basis", "breedte": 812, "hoogte": 1204, "kleur": "7016", "naam": "Keuken", "aantal": 4}]
    r = verzoek("POST", "/api/horren/prijs", {"regels": regels, "code": "TEST"})["json"]
    klopt(r["subtotaal"] == 452 and r["korting"] == 22.6 and r["totaal"] == 429.4
          and r["partner"]["naam"] == "Testpartner", "met de code 5% korting op de horren: 452 wordt 429,40")
    r = verzoek("POST", "/api/horren/prijs", {"regels": regels, "code": "GERADEN"})["json"]
    klopt(r["korting"] == 0 and r["totaal"] == 452 and "code_fout" in r,
          "een onbekende code geeft geen korting, wel een melding")
    klopt(verzoek("POST", "/api/horren/prijs", {"regels": regels})["json"]["totaal"] == 452,
          "zonder code: dezelfde prijs voor iedereen")

    klant = {"naam": "Els Bakker", "email": "els@voorbeeld.nl", "telefoon": "0687654321",
             "straat": "Kerkweg 3", "postcode": "1214ab", "plaats": "Hilversum"}
    akkoord = {"gemeten": True, "voorwaarden": True}
    r = verzoek("POST", "/api/horren/bestellingen", {"regels": regels, "klant": klant, "akkoord": akkoord,
                                                     "code": "GERADEN"})
    klopt(r["status"] == 422 and "code" in r["json"]["fout"], "bestellen met een onbekende code kan niet")
    r = verzoek("POST", "/api/horren/bestellingen", {"regels": regels, "klant": klant, "akkoord": akkoord,
                                                     "code": "test"})
    klopt(r["status"] == 201, "bestellen met de code")
    nr, t = r["json"]["nr"], r["json"]["token"]
    b = bestellingen.haal(nr)
    klopt(b["totaal"] == 429.4 and b["korting"] == 22.6 and b["partner"]["code"] == "TEST",
          "de bestelling onthoudt de korting en via welke partner hij kwam")
    kassa = urlparse(r["json"]["betaal_url"])
    klopt(verzoek("GET", "%s?t=%s&uitkomst=paid" % (kassa.path, t))["status"] == 303,
          "de testkassa werkt met een gewone link (die de beveiliging van de browser doorlaat)")
    uitbak = os.path.join(TMP, "uitbak")
    namen = sorted(os.listdir(uitbak))
    html = open(os.path.join(uitbak, [m for m in namen if m.endswith("-bevestiging.html")][-1]), encoding="utf-8").read()
    klopt("Korting (code TEST)" in html and "429,40" in html, "de klant ziet de korting in zijn bevestiging")
    html = open(os.path.join(uitbak, [m for m in namen if m.endswith("-melding-max.html")][-1]), encoding="utf-8").read()
    klopt("Via code TEST (Testpartner)" in html, "Max ziet via welke partner de bestelling kwam")
    lijst = verzoek("GET", "/api/max/bestellingen", token=token)["json"]["bestellingen"]
    klopt([x for x in lijst if x["nr"] == nr][0]["partner"]["naam"] == "Testpartner",
          "en ook in het overzicht van de Max-modus")

    print("De leverancier, via zijn eigen link")
    r = verzoek("POST", "/api/max/bestellingen/%s/actie" % nr, {"actie": "naar_leverancier"}, token)
    link = r["json"]["_leverancierlink"]
    klopt(r["json"]["status"] == "besteld" and "/leverancier?nr=%s&t=" % nr in link,
          "doorgestuurd, met een eigen link voor de leverancier")
    namen = sorted(os.listdir(uitbak))
    html = open(os.path.join(uitbak, [m for m in namen if m.endswith("-leverancier.html")][-1]), encoding="utf-8").read()
    klopt("Bestelling bevestigen of verzenden" in html and "korting" not in html.lower(),
          "de bestelmail heeft een knop naar die link (en de korting gaat de leverancier niet aan)")
    csvmap = [m for m in namen if m.endswith("-leverancier-bijlagen")][-1]
    csv = open(os.path.join(uitbak, csvmap, "bestelling-%s.csv" % nr), encoding="utf-8-sig").read()
    klopt("812;1204;dagmaat;7016" in csv and "Kerkweg 3" in csv, "met een CSV erbij: maten, kleur en bezorgadres")
    t_lev = link.split("t=")[1]
    klopt(verzoek("GET", "/api/horren/leverancier/%s?t=fout" % nr)["status"] == 404,
          "zonder de juiste link ziet niemand de bestelling")
    d = verzoek("GET", "/api/horren/leverancier/%s?t=%s" % (nr, t_lev))["json"]
    klopt(d["klant"]["straat"] == "Kerkweg 3" and "email" not in d["klant"] and not d["bevestigd"],
          "de leverancier ziet wat hij moet maken en waar het heen moet (geen mailadres)")
    d = verzoek("POST", "/api/horren/leverancier/" + nr, {"t": t_lev, "actie": "bevestigd"})["json"]
    klopt(bool(d["bevestigd"]), "de leverancier bevestigt")
    voor = len([m for m in os.listdir(uitbak) if m.endswith("-verzonden.html")])
    d = verzoek("POST", "/api/horren/leverancier/" + nr,
                {"t": t_lev, "actie": "verzonden", "track": "https://jouw.postnl.nl/track/3S999"})["json"]
    klopt(d["status"] == "verzonden" and d["verzending"]["track"].endswith("3S999"),
          "en meldt de verzending, met track & trace")
    klopt(len([m for m in os.listdir(uitbak) if m.endswith("-verzonden.html")]) == voor + 1,
          "de klant krijgt vanzelf de mail dat zijn horren onderweg zijn")
    r = verzoek("POST", "/api/horren/leverancier/" + nr, {"t": t_lev, "actie": "probleem", "opmerking": "Even een vraag"})
    klopt(r["status"] == 200 and any(m.endswith("-leverancier-probleem.html") for m in os.listdir(uitbak)),
          "meldt de leverancier een probleem, dan komt dat bij Max")

    print("Een stille leverancier (cron)")
    nr3 = bestel_en_betaal(dict(klant, naam="Bas Smit", email="bas@voorbeeld.nl"), regels)
    verzoek("POST", "/api/max/bestellingen/%s/actie" % nr3, {"actie": "naar_leverancier"}, token)
    b3 = bestellingen.haal(nr3)
    b3["leverancier"]["op"] -= 4 * 86400
    bestellingen.bewaar(b3)
    klopt(verzoek("GET", "/api/cron")["json"]["leverancier_stil"] == 1,
          "bevestigt de leverancier na drie dagen niet, dan krijgt Max een seintje")
    klopt(verzoek("GET", "/api/cron")["json"]["leverancier_stil"] == 0, "maar één keer")


def main():
    reviews_testen()
    print("Prijzen")
    p = horren.prijs_regel({"uitvoering": "basis", "breedte": 812, "hoogte": 1204, "kleur": "7016"})
    klopt(p["stukprijs"] == 113, "Basis 812 x 1204 antraciet valt in de cel 1000 x 1250 (EUR 113)")
    p = horren.prijs_regel({"uitvoering": "luxe", "breedte": 812, "hoogte": 1204, "kleur": "6021", "aantal": 2})
    klopt(p["stukprijs"] == 148 and p["bedrag"] == 296, "Luxe in een eigen RAL-kleur, zonder meerprijs")
    klopt(horren.prijs_regel({"uitvoering": "basis", "breedte": 800, "hoogte": 1000, "kleur": "6021"}).get("fouten"),
          "Basis in een niet-standaardkleur wordt geweigerd")
    klopt(horren.prijs_regel({"breedte": 250, "hoogte": 1000}).get("fouten"), "te smal wordt geweigerd")
    klopt(horren.prijs_regel({"uitvoering": "luxe", "breedte": 900, "hoogte": 1000, "kleur": "7099"}).get("fouten"),
          "onbestaande RAL wordt geweigerd")
    klopt(horren.prijs_regel({"breedte": 1500, "hoogte": 2200}).get("fouten"), "te groot oppervlak wordt geweigerd")
    klopt(horren.prijs_regel({"breedte": 900, "hoogte": 1600})["middenregel"], "vanaf 1500 mm hoog een middenregel")
    klopt(horren.bereken([{"uitvoering": "luxe", "breedte": 700, "hoogte": 1100, "kleur": "3005"}])["levertijd"]["van"]
          > horren.bereken([{"uitvoering": "luxe", "breedte": 700, "hoogte": 1100, "kleur": "7016"}])["levertijd"]["van"],
          "een eigen RAL-kleur duurt langer")

    aanvragen_testen()

    print("Max-modus en rapport (iwrap.nl)")
    klopt(verzoek("POST", "/api/max/login", {"wachtwoord": "fout"})["status"] == 401, "verkeerd wachtwoord wordt geweigerd")
    token = verzoek("POST", "/api/max/login", {"wachtwoord": "test"})["json"]["token"]
    klopt(verzoek("GET", "/api/max/rapporten")["status"] == 401, "zonder token geen toegang")
    klus = verzoek("POST", "/api/max/rapporten", {}, token)["json"]
    rid = klus["id"]
    klus.update({
        "klant": {"naam": "Anna de Vries", "straat": "Lindelaan 12", "postcode": "1214ab",
                  "plaats": "Hilversum", "email": "anna@voorbeeld.nl", "telefoon": "06 12345678"},
        "oplevering": {"datum": "2026-09-29", "werk": "Vier kozijnen voorgevel", "folie": "Zwartgrijs",
                       "folie_ral": "7021"},
        "check": {"rubbers": {"stand": "groen"}, "kitwerk": {"stand": "oranje", "notitie": "Boven de voordeur"},
                  "glas": {"stand": "groen"}, "beslag": {"stand": "groen"}, "horren": {"stand": "rood"},
                  "rolluiken": {"stand": "nvt"}},
        "_versie": klus["versie"],
    })
    r = verzoek("PUT", "/api/max/rapporten/" + rid, klus, token)
    klopt(r["status"] == 200, "klus opslaan")
    klopt("3 van de 5" in r["json"]["_samenvatting"]["zin"], "samenvatting telt n.v.t. niet mee")
    klopt(verzoek("GET", "/api/rapporten/" + rid)["status"] == 404, "concept is niet openbaar")
    klopt(verzoek("GET", "/api/rapporten/" + rid, token=token)["status"] == 200, "Max ziet het concept wel")
    klopt(verzoek("PUT", "/api/max/rapporten/" + rid, dict(klus, _versie=0), token)["status"] == 409,
          "oudere versie overschrijft niet")
    klus = verzoek("PUT", "/api/max/rapporten/" + rid, dict(r["json"], status="klaar",
                                                            _versie=r["json"]["versie"]), token)["json"]
    klopt(klus["status"] == "klaar", "rapport klaarzetten")
    klopt(verzoek("POST", "/api/max/rapporten/%s/mail" % rid, {}, token)["status"] == 200, "rapport mailen")
    r = verzoek("PUT", "/api/max/rapporten/" + rid, dict(klus, _versie=klus["versie"]), token)
    klopt(r["status"] == 200, "na het mailen kan Max gewoon verder (geen vals conflict)")
    klus = r["json"]

    pub = verzoek("GET", "/api/rapporten/" + rid)["json"]
    klopt("telefoon" not in pub["klant"] and "email" not in pub["klant"], "rapport lekt geen contactgegevens")
    klopt(pub["horren_advies"] is None, "zolang de winkel dicht is (live in winkel.json), geen horrentip in het rapport")
    cfg.WINKEL_LIVE = True
    try:
        advies = verzoek("GET", "/api/rapporten/" + rid)["json"]["horren_advies"]
    finally:
        cfg.WINKEL_LIVE = False
    klopt(advies and "kleur=7021" in advies["url"] and "uitvoering=luxe" in advies["url"],
          "rode horren: link naar kozijnhorren.nl in de kleur van de folie (Luxe, want geen standaardkleur)")
    klopt("code=MAX" in advies["url"] and advies["korting"] == 5,
          "de horrentip heeft de code van iWrap erin: de klant krijgt korting, wij zien dat hij van de klus komt")
    klus["check"]["horren"] = {"stand": "groen"}
    verzoek("PUT", "/api/max/rapporten/" + rid, dict(klus, _versie=klus["versie"]), token)
    klopt(verzoek("GET", "/api/rapporten/" + rid)["json"]["horren_advies"] is None, "groene horren: geen verkooppraatje")

    print("Bestellen op kozijnhorren.nl")
    klant = {"naam": "Piet Jansen", "email": "piet@voorbeeld.nl", "telefoon": "0612345678",
             "straat": "Dorpsstraat 1", "postcode": "3811aa", "plaats": "Amersfoort"}
    regels = [{"uitvoering": "basis", "breedte": 812, "hoogte": 1204, "kleur": "7016", "naam": "Woonkamer"},
              {"uitvoering": "luxe", "breedte": 600, "hoogte": 1000, "kleur": "7021", "aantal": 2}]
    r = verzoek("POST", "/api/horren/prijs", {"regels": regels}, origin="http://localhost:8020")
    klopt(r["koppen"].get("Access-Control-Allow-Origin") == "http://localhost:8020", "CORS voor de winkel")
    klopt(r["json"]["totaal"] == 113 + 2 * 127, "totaal klopt (Basis + 2x Luxe)")
    bestel = {"regels": regels, "klant": klant, "akkoord": {"voorwaarden": True}}
    r = verzoek("POST", "/api/horren/bestellingen", bestel)
    klopt(r["status"] == 422 and any("meetinstructie" in f for f in r["json"]["fouten"]),
          "zonder vinkje 'gemeten' geen bestelling (daar hangt de pasgarantie aan)")
    bestel["akkoord"]["gemeten"] = True
    r = verzoek("POST", "/api/horren/bestellingen", bestel)
    klopt(r["status"] == 201, "bestelling aangemaakt")
    nr, t = r["json"]["nr"], r["json"]["token"]
    b = bestellingen.haal(nr)
    klopt(b["pasgarantie"] and b["klant"]["postcode"] == "3811 AA", "pasgarantie aan, postcode netjes")
    klopt(verzoek("GET", "/api/horren/bestellingen/%s?t=fout" % nr)["status"] == 404, "status alleen met token")

    kassa = urlparse(r["json"]["betaal_url"])
    klopt(verzoek("GET", kassa.path + "?" + kassa.query)["status"] == 200, "testkassa opent")
    klopt(verzoek("POST", kassa.path, form={"t": t, "uitkomst": "paid"})["status"] == 303, "betalen in de testkassa")
    klopt(verzoek("GET", "/api/horren/bestellingen/%s?t=%s" % (nr, t))["json"]["status"] == "betaald",
          "bestelling staat op betaald")

    print("Afhandelen door Max")
    r = verzoek("POST", "/api/max/bestellingen/%s/actie" % nr, {"actie": "naar_leverancier"}, token)
    klopt(r["json"]["status"] == "besteld", "doorgestuurd naar de leverancier")
    klopt("B 812 mm x H 1204 mm (dagmaat) | RAL 7016" in r["json"]["_leverancier_tekst"], "leveranciersregel is compleet")
    r = verzoek("POST", "/api/max/bestellingen/%s/actie" % nr,
                {"actie": "verzonden", "track": "https://jouw.postnl.nl/track/3S123"}, token)
    klopt(r["json"]["status"] == "verzonden", "op verzonden gezet")
    b = bestellingen.haal(nr)
    b["verzending"]["op"] -= 6 * 86400
    bestellingen.bewaar(b)
    klopt(verzoek("GET", "/api/cron")["json"]["past_alles"] == 1, "cron stuurt na vijf dagen 'past alles?'")
    klopt(bestellingen.haal(nr)["status"] == "afgerond", "bestelling afgerond")

    code_en_leverancier_testen(token)

    uitbak = sorted(os.listdir(os.path.join(TMP, "uitbak")))
    print("\n%d controles goed. Mails die verstuurd zouden zijn:" % GOED)
    for naam in uitbak:
        print("   ", naam.split("-", 3)[-1])
    shutil.rmtree(TMP, ignore_errors=True)


if __name__ == "__main__":
    main()
