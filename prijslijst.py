#!/usr/bin/env python3
"""
Van de inkoopprijslijst van je leverancier naar de verkoopprijzen op kozijnhorren.nl.

Je inkoopprijzen horen niet in deze repo (die is openbaar) en ook niet op de
site. Ze staan in prive/ (in .gitignore). Dit script rekent ze om met jouw
marge en zet alleen de verkoopprijzen in backend/data/horren.json.

Er zijn twee uitvoeringen, dus twee inkooplijsten: basis en luxe.

1. Eenmalig een leeg sjabloon maken, met de maatstappen die de winkel nu kent:
       python3 prijslijst.py basis --sjabloon
       python3 prijslijst.py luxe --sjabloon
   Dat maakt prive/inkoop-basis.csv en prive/inkoop-luxe.csv. Open ze in Excel
   en vul de inkoopprijzen in (excl. btw) zoals ze op de prijslijst van je
   leverancier staan. Heeft de leverancier andere maatstappen, pas dan de eerste
   rij (hoogtes) en de eerste kolom (breedtes) aan.

2. Kijken wat eruit komt:
       python3 prijslijst.py basis
   Je ziet per maat de verkoopprijs en wat je eraan overhoudt.

3. Tevreden? Dan wegschrijven, en daarna de winkel opnieuw bouwen:
       python3 prijslijst.py basis --schrijf
       python3 kozijnhorren/build.py

Hoe de verkoopprijs berekend wordt (in te stellen met de opties):
   verkoop excl. btw = inkoop x --factor, maar minstens inkoop + --min-marge
   verkoop incl. btw = dat x 1,21, naar boven afgerond op hele euro's
Denk bij de marge ook aan de pasgarantie: een deel van de horren maak je twee
keer. Houd daarnaast de online concurrentie in de gaten (zie
kozijnhorren/LEVERANCIERS.md).
"""

import argparse
import csv
import json
import math
import re
from pathlib import Path

ROOT = Path(__file__).parent
PRIVE = ROOT / "prive"
CATALOGUS = ROOT / "backend" / "data" / "horren.json"


def getal(tekst):
    tekst = str(tekst).strip().replace("€", "").replace(" ", "")
    if "," in tekst:
        tekst = tekst.replace(".", "").replace(",", ".")
    return float(tekst)


def lees_csv(pad):
    if not pad.exists():
        raise SystemExit("Nog geen %s. Maak hem met --sjabloon." % pad.relative_to(ROOT))
    ruw = pad.read_text(encoding="utf-8-sig")
    scheiding = ";" if ruw.count(";") >= ruw.count(",") else ","
    rijen = [r for r in csv.reader(ruw.splitlines(), delimiter=scheiding) if any(c.strip() for c in r)]
    hoogtes = [int(getal(h)) for h in rijen[0][1:] if h.strip()]
    breedtes, prijzen = [], []
    for r in rijen[1:]:
        breedtes.append(int(getal(r[0])))
        waarden = [getal(c) for c in r[1:1 + len(hoogtes)]]
        if len(waarden) != len(hoogtes):
            raise SystemExit("De rij voor breedte %s heeft niet voor elke hoogte een prijs." % r[0])
        prijzen.append(waarden)
    if breedtes != sorted(breedtes) or hoogtes != sorted(hoogtes):
        raise SystemExit("Zet de breedtes en hoogtes van klein naar groot.")
    return breedtes, hoogtes, prijzen


def verkoop(inkoop, factor, min_marge, btw):
    excl = max(inkoop * factor, inkoop + min_marge)
    return int(math.ceil(excl * (1 + btw) - 1e-9))


def main():
    p = argparse.ArgumentParser(description="Inkoopprijzen omrekenen naar verkoopprijzen.")
    p.add_argument("uitvoering", choices=["basis", "luxe"])
    p.add_argument("--sjabloon", action="store_true", help="maak een leeg inkoopbestand in prive/")
    p.add_argument("--factor", type=float, default=1.9, help="verkoop excl. btw = inkoop x factor (standaard 1,9)")
    p.add_argument("--min-marge", type=float, default=30.0, help="minimaal overhouden per hor, excl. btw (standaard 30)")
    p.add_argument("--schrijf", action="store_true", help="zet de verkoopprijzen in backend/data/horren.json")
    a = p.parse_args()

    cat = json.loads(CATALOGUS.read_text(encoding="utf-8"))
    tabel = cat["producten"][a.uitvoering]["prijstabel"]
    csv_pad = PRIVE / ("inkoop-%s.csv" % a.uitvoering)

    if a.sjabloon:
        PRIVE.mkdir(exist_ok=True)
        if csv_pad.exists():
            raise SystemExit("%s bestaat al; die overschrijf ik niet." % csv_pad.relative_to(ROOT))
        regels = ["breedte \\ hoogte;" + ";".join(str(h) for h in tabel["hoogtes"])]
        regels += [str(b) + ";" * len(tabel["hoogtes"]) for b in tabel["breedtes"]]
        csv_pad.write_text("\n".join(regels) + "\n", encoding="utf-8")
        print("Gemaakt: %s. Vul de inkoopprijzen (excl. btw) in en draai dit script opnieuw." % csv_pad.relative_to(ROOT))
        return

    breedtes, hoogtes, inkoop = lees_csv(csv_pad)
    btw = cat["btw"]
    nieuw = [[verkoop(x, a.factor, a.min_marge, btw) for x in rij] for rij in inkoop]

    print("%s: verkoopprijs incl. btw  (wat je overhoudt excl. btw)   factor %.2f, minimaal EUR %.0f\n"
          % (cat["producten"][a.uitvoering]["naam"], a.factor, a.min_marge))
    print("breedte\\hoogte " + "".join("%14s" % ("<= %d" % h) for h in hoogtes))
    laagste = None
    for b, rij_in, rij_uit in zip(breedtes, inkoop, nieuw):
        cellen = []
        for i, v in zip(rij_in, rij_uit):
            marge = v / (1 + btw) - i
            laagste = marge if laagste is None else min(laagste, marge)
            cellen.append("%14s" % ("%d (%.0f)" % (v, marge)))
        print("<= %-11d" % b + "".join(cellen))
    print("\nLaagste marge in de tabel: EUR %.2f excl. btw" % laagste)
    print("Goedkoopste hor: EUR %d, duurste: EUR %d (incl. btw)" % (min(map(min, nieuw)), max(map(max, nieuw))))

    if a.schrijf:
        tabel["breedtes"], tabel["hoogtes"], tabel["prijzen"] = breedtes, hoogtes, nieuw
        tekst = json.dumps(cat, ensure_ascii=False, indent=2)
        # Lijstjes met getallen op één regel houden, zodat de tabel leesbaar blijft.
        tekst = re.sub(r"\[\s+([-\d.,\s]+?)\s+\]", lambda m: "[" + ", ".join(m.group(1).split()).replace(",,", ",") + "]", tekst)
        CATALOGUS.write_text(tekst + "\n", encoding="utf-8")
        print("\nWeggeschreven in %s." % CATALOGUS.relative_to(ROOT))
        print("Nu: python3 kozijnhorren/build.py. Is dit de echte prijslijst, zet dan 'voorbeeldprijzen' op false.")
    else:
        print("\nNiets veranderd. Met --schrijf zet je dit in de winkel.")


if __name__ == "__main__":
    main()
