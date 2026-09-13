#!/usr/bin/env python3
"""
Maakt een doorstuurbare kopie van de site.

Op de server draait de site op schone URL's (/kosten). Wie een map met
bestanden opent via file:// heeft die server niet, dus daar moet elke link naar
het echte bestand wijzen (kosten.html) en moet elk pad relatief zijn.

Dit script bouwt de site, kopieert hem en schrijft alleen de URL's om. De
inhoud blijft ongewijzigd.

Gebruik:  python3 deel.py
Resultaat: iwrap-site-voorbeeld.zip naast de projectmap
"""

import re
import shutil
import subprocess
from pathlib import Path

ROOT = Path(__file__).parent
UIT = ROOT.parent / "iwrap-site-voorbeeld"
BESTANDEN = {p.relative_to(ROOT).as_posix() for p in ROOT.rglob("*.html")
             if ".git" not in p.parts and "src" not in p.parts}
SLUGS = {b[:-len(".html")] for b in BESTANDEN}


def herschrijf(html, diepte):
    """Zet elke root-relatieve URL om naar een relatieve die op schijf klopt."""
    op = "../" * diepte

    def rep(m):
        attr, url = m.group(1), m.group(2)
        if url == "/":
            return f'{attr}="{op or "./"}index.html"'
        pad = url.lstrip("/")
        # Alles achter ? of # hoort bij de URL, niet bij de bestandsnaam:
        # /offerte?klacht=verkleurd moet offerte.html?klacht=verkleurd worden.
        staart = ""
        snij = min((pad.index(t) for t in "?#" if t in pad), default=len(pad))
        pad, staart = pad[:snij], pad[snij:]
        anker = staart
        if pad in SLUGS:                      # /kosten -> kosten.html
            return f'{attr}="{op}{pad}.html{anker}"'
        if pad + "/index" in SLUGS:           # /kozijnmerken -> kozijnmerken/index.html
            return f'{attr}="{op}{pad}/index.html{anker}"'
        return f'{attr}="{op}{pad}{anker}"'   # /css/..., /images/...

    return re.sub(r'(href|src)="(/[^"]*)"', rep, html)


def main():
    subprocess.run(["python3", "build.py"], cwd=ROOT, check=True)

    if UIT.exists():
        shutil.rmtree(UIT)
    UIT.mkdir(parents=True)

    for map_ in ("css", "js", "images"):
        shutil.copytree(ROOT / map_, UIT / map_)

    for naam in sorted(BESTANDEN):
        bron = ROOT / naam
        diepte = naam.count("/")
        html = bron.read_text(encoding="utf-8")
        html = herschrijf(html, diepte)
        # srcset staat vol met root-relatieve paden en valt buiten de regex hierboven
        html = re.sub(r'(srcset=")([^"]*)(")',
                      lambda m: m.group(1) + m.group(2).replace("/images/", "../" * diepte + "images/") + m.group(3),
                      html)
        doel = UIT / naam
        doel.parent.mkdir(parents=True, exist_ok=True)
        doel.write_text(html, encoding="utf-8")

    lees = UIT / "OPENEN.txt"
    lees.write_text(
        "De nieuwe website van iWrap — voorbeeldversie\n"
        "=============================================\n\n"
        "Pak deze map uit en open 'index.html' met een dubbelklik.\n"
        "De hele site werkt dan gewoon, zonder internet of installatie.\n\n"
        "Het offerteformulier (index.html -> Offerte aanvragen) werkt ook:\n"
        "je kunt er doorheen klikken en de prijsindicatie zien meelopen.\n"
        "Alleen het daadwerkelijk versturen doet nog niets — dat wordt pas\n"
        "aangesloten als de site live gaat.\n",
        encoding="utf-8")

    zip_pad = shutil.make_archive(str(UIT), "zip", root_dir=UIT.parent, base_dir=UIT.name)
    mb = Path(zip_pad).stat().st_size / 1048576
    print(f"{len(BESTANDEN)} pagina's omgeschreven")
    print(f"{zip_pad}  ({mb:.1f} MB)")


if __name__ == "__main__":
    main()
