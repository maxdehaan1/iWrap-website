#!/usr/bin/env python3
"""Loopt de hele stroom door zonder browser.

iwrap.nl: een klant vraagt op drie manieren een offerte aan (foto en
aanstrepen, foto en maten, op papier); Max krijgt één mail met de foto's als
bijlage. Max maakt een klus, vult de kozijncheck in en zet het rapport klaar.
Staan de horren op oranje of rood, dan verwijst het rapport naar kozijnhorren.nl
met de kleur van de folie al gekozen.

kozijnhorren.nl: een klant bestelt, betaalt in de testkassa, Max stuurt door en
zet op verzonden, en de dagelijkse cron stuurt "past alles?".

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
                "UPSTASH_REDIS_REST_URL", "VERCEL", "LEVERANCIER_AUTOMATISCH"):
    os.environ.pop(sleutel, None)
os.environ["MAX_WACHTWOORD"] = "test"
sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from backend.app import app  # noqa: E402
from backend import bestellingen, horren  # noqa: E402

GOED = 0


def verzoek(methode, pad, data=None, token=None, form=None, origin=None, ruw=None):
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
               "wsgi.input": io.BytesIO(body), "REMOTE_ADDR": "127.0.0.1"}
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
            "postcode": "1214ab", "huisnummer": "12", "plaats": "Hilversum", "toelichting": "Bel liever na 17 uur."}


def aanvragen_testen():
    print("Offerteaanvragen (iwrap.nl)")
    r = verzoek("POST", "/api/aanvragen", {"manier": "maten", "kozijnen": [{"waar": "begane-grond"}],
                                           "gegevens": GEGEVENS})
    klopt(r["status"] == 422 and "minstens één deel" in r["json"]["fout"], "maten zonder delen wordt geweigerd")
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
        "kozijnen": [
            {"waar": "begane-grond", "plek": "voorkant", "aantal": 2, "dichtbij": True,
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
    bevestiging = open(os.path.join(uitbak, [m for m in mails if m.endswith("-aanvraag-bevestiging.html")][0]),
                       encoding="utf-8").read()
    klopt("We hebben je aanvraag ontvangen" in bevestiging and "werkdag" not in bevestiging,
          "bevestiging aan de klant, zonder belofte over wanneer")

    # Foto en aanstrepen: de aangestreepte foto komt als eigen bijlage mee.
    r = verzoek("POST", "/api/aanvragen", {"manier": "streep", "gegevens": GEGEVENS, "kozijnen": [
        {"waar": "verdieping", "aangestreept": True}, {"waar": "begane-grond", "heel": True}]})
    klopt(r["json"]["fotos"] == ["kozijn-1-foto.jpg", "kozijn-1-aangestreept.jpg", "kozijn-2-foto.jpg"],
          "bij aanstrepen hoort een aangestreepte foto, bij 'heel kozijn' niet")
    # Op papier: tekeningen en kozijnfoto's.
    r = verzoek("POST", "/api/aanvragen", {"manier": "papier", "gegevens": GEGEVENS,
                                           "papier": {"tekeningen": 2, "fotos": 3, "waar": ["begane-grond", "dakkapel"]}})
    klopt(r["json"]["fotos"] == ["tekening-1.jpg", "tekening-2.jpg", "kozijn-1-foto.jpg", "kozijn-2-foto.jpg",
                                 "kozijn-3-foto.jpg"], "op papier: tekeningen en een foto per kozijn")


def main():
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
    advies = pub["horren_advies"]
    klopt(advies and "kleur=7021" in advies["url"] and "uitvoering=luxe" in advies["url"],
          "rode horren: link naar kozijnhorren.nl in de kleur van de folie (Luxe, want geen standaardkleur)")
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

    uitbak = sorted(os.listdir(os.path.join(TMP, "uitbak")))
    print("\n%d controles goed. Mails die verstuurd zouden zijn:" % GOED)
    for naam in uitbak:
        print("   ", naam.split("-", 3)[-1])
    shutil.rmtree(TMP, ignore_errors=True)


if __name__ == "__main__":
    main()
