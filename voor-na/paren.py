"""De voor/na-paren van iwrap.nl, in perspectief op elkaar gelegd (26 november 2026).

Max: "dat de voor- en na-foto vanuit dezelfde hoek genomen lijken te zijn. Dit moet natuurlijk
in redelijkheid." Per paar wordt de voorfoto zo vervormd (homografie) dat hij op de nafoto valt.
Dat gebeurt met punten die op beide foto's hetzelfde zijn (hoeken van het verstek, de rand van de
dorpel, tegelvoegen), uitvergroot afgelezen, en waar dat hielp daarna fijn bijgesteld op de randen
in beide foto's (uitlijn.py). Ligt het kozijn op de foto's in verschillende vlakken (stijl, bovenkant
en voorkant van de dorpel), dan kan het niet overal kloppen: dan gaat de voorkant van de dorpel voor.

Gebruik (vanuit de hoofdmap):
    python3 voor-na/paren.py              alle paren opnieuw maken en in images/ zetten
    python3 voor-na/paren.py muurhoek     alleen dit paar
Daarna python3 build.py. Een paar dat al online staat een nieuwe naam geven (images/ staat een
jaar in de cache van de browser). Elk paar komt ook als controle in .data/voor-na/<naam>-controle.jpg:
de schuif op 40% en 60%; lopen de randen door over de rode lijn, dan klopt het.

De originelen (DNG en HEIC) staan in Max' Documenten (iCloud), zie BRON. sips (macOS) zet ze om naar
jpg van 4000 px in .data/voor-na/. De bron van de opengescheurde hoek is de vorige versie op de site
(git: 3c76297, images/project-hoek-*-1600.webp); de originelen daarvan zijn niet terug te vinden.
Alles wordt zonder EXIF opgeslagen (daar zit de GPS van het huis in).
"""
import os
import subprocess
import sys

from PIL import Image, ImageDraw

HIER = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(HIER)
sys.path.insert(0, HIER)
from uitlijn import Paar, laad, homografie, pas_toe  # noqa: E402

BRON = os.path.expanduser("~/Documents/iWrap/huisstijl:website:foto's iwrap/foto's en video's/foto's voor website")
CACHE = os.path.join(ROOT, ".data", "voor-na")
IMG = os.path.join(ROOT, "images")

# Origineel: (map in BRON, bestandsnaam)
FOTOS = {
    "IMG_0831_2": ("voor na kozijn 6 (klein badkamerraam) ", "IMG_0831 2.jpg"),
    "IMG_0832_2": ("voor na kozijn 6 (klein badkamerraam) ", "IMG_0832 2.HEIC"),
    "IMG_6100_2": ("voor na kozijn 4 (6009 groen)", "IMG_6100 2.JPG"),
    "IMG_6168_2": ("voor na kozijn 4 (6009 groen)", "IMG_6168 2.JPG"),
    "IMG_6576_2": ("voor na kozijn 5 (7016 grijs)", "IMG_6576 2.HEIC"),
    "IMG_6591_2": ("voor na kozijn 5 (7016 grijs)", "IMG_6591 2.HEIC"),
    "IMG_7144_2": ("voor na kozijn 7", "IMG_7144 2.HEIC"), "IMG_7152_2": ("voor na kozijn 7", "IMG_7152 2.HEIC"),
    "IMG_7145_2": ("voor na kozijn 7", "IMG_7145 2.HEIC"), "IMG_7156_2": ("voor na kozijn 7", "IMG_7156 2.HEIC"),
    "IMG_6485": ("voor na kozijn 3", "IMG_6485.DNG"), "IMG_6496": ("voor na kozijn 3", "IMG_6496.DNG"),
    "DSC05994": ("foto's met sony camera", "DSC05994.JPG"), "DSC06095": ("foto's met sony camera", "DSC06095.JPG"),
}

# Per paar: voorfoto, nafoto, het vak in de nafoto (zie vak()), de punten (voor, na) als fracties van de
# hele foto's, en of er daarna nog fijn bijgesteld wordt op de randen ("fijn"). "gok": het vak in de
# voorfoto als begin, als er geen punten zijn. "nadruk": deel van het vak dat bij het bijstellen het
# zwaarst telt. "grof": eerst grof zoeken (verschuiven, schalen, draaien).
# De hero (voor-gebarsten-dorpel en na-gebarsten-dorpel-hersteld) staat hier bewust niet in: Max wil die
# foto houden zoals hij is (26 november 2026). Een frontale dorpel (IMG_6514 en IMG_6526, map 1) viel
# beter over elkaar, maar vond hij veel minder goed; de punten daarvan staan in git (15cd017).
PAREN = {
    "project-raam-v2": dict(voor="IMG_0831_2", na="IMG_0832_2", vak=("f", .516, .527, .90),
                            gok=("f", .50, .505, .90), fijn=True, grof=True),
    "project-groen-v2": dict(voor="IMG_6100_2", na="IMG_6168_2", vak=("b", .08, .36, .84), fijn=True,
                             punten=[((.285, .555), (.30, .49)), ((.705, .555), (.645, .49)),
                                     ((.285, .965), (.30, .795)), ((.705, .965), (.645, .795))]),
    "project-antraciet-v2": dict(voor="IMG_6576_2", na="IMG_6591_2", vak=("b", .2, .05, .6), fijn=True,
                                 punten=[((.873, .320), (.795, .145)), ((.095, .548), (.205, .318)),
                                         ((.53, .64), (.49, .415)), ((.355, .865), (.385, .605)),
                                         ((.10, .70), (.21, .405))]),
    "project-verbinding-v2": dict(voor="IMG_7144_2", na="IMG_7152_2", vak=("f", .47, .58, 1.0), fijn=False,
                                  punten=[((.306, .595), (.3805, .4946)), ((.529, .598), (.644, .495)),
                                          ((.4205, .6795), (.5207, .5855)), ((.4205, .822), (.5207, .7497)),
                                          ((.306, .822), (.3805, .7525))]),
    "project-muurhoek": dict(voor="IMG_7145_2", na="IMG_7156_2", vak=("heel",), fijn=False,
                             punten=[((.52, .552), (.454, .544)), ((.854, .786), (.756, .755)),
                                     ((.10, .552), (.074, .544)), ((.10, .770), (.074, .755))]),
    "project-dorpel-v2": dict(voor="IMG_6485", na="IMG_6496", vak=("heel",), gok=("heel",), fijn=True,
                              nadruk=[(.12, .70), (.42, .40), (1, .55), (1, .98), (.5, .85), (.12, .73)]),
    "project-dorpel-wit": dict(voor="DSC05994", na="DSC06095", vak=("heel",), fijn=True, grof=True),
    "project-hoek-v2": dict(voor="git:project-hoek-voor", na="git:project-hoek-na", vak=("heel",), fijn=True,
                            nadruk=[(.50, 0), (.62, 0), (.62, .66), (1, .86), (1, 1), (.55, .80), (.50, .76)],
                            punten=[((.575, .68), (.59, .70)), ((1.0, .92), (1.0, .95)), ((.565, .02), (.567, .02)),
                                    ((.99, .26), (.977, .27))]),
}


def foto(naam):
    """Het origineel als jpg van 4000 px (eenmalig omgezet met sips)."""
    os.makedirs(CACHE, exist_ok=True)
    doel = os.path.join(CACHE, naam.replace("git:", "") + ".jpg")
    if os.path.exists(doel):
        return laad(doel)
    if naam.startswith("git:"):
        ruw = subprocess.run(["git", "show", "3c76297:images/%s-1600.webp" % naam[4:]], cwd=ROOT,
                             capture_output=True, check=True).stdout
        tmp = doel + ".webp"
        open(tmp, "wb").write(ruw)
        Image.open(tmp).convert("RGB").save(doel, quality=95)
        os.remove(tmp)
    else:
        map_, bestand = FOTOS[naam]
        subprocess.run(["sips", "-s", "format", "jpeg", "-s", "formatOptions", "92", "-Z", "4000",
                        os.path.join(BRON, map_, bestand), "--out", doel], check=True, capture_output=True)
    return laad(doel)


def vak(im, spec):
    """("heel",): het grootste 4:3-vak in het midden; ("f", cx, cy, wf): 4:3 rond (cx, cy) met breedte
    wf van het beeld; ("b", x0, y0, w): vanaf (x0, y0), breedte w (fracties)."""
    W, H = im.width, im.height
    if spec[0] == "heel":
        w = min(W, H * 4 / 3)
        return ((W - w) / 2, (H - w * 3 / 4) / 2, w, w * 3 / 4)
    if spec[0] == "f":
        _, cx, cy, wf = spec
        w = min(W * wf, H * 4 / 3)
        h = w * 3 / 4
        return (min(max(cx * W - w / 2, 0), W - w), min(max(cy * H - h / 2, 0), H - h), w, h)
    _, fx, fy, fw = spec
    return (fx * W, fy * H, W * fw, W * fw * 3 / 4)


def maak(naam, d):
    bron, doel = foto(d["voor"]), foto(d["na"])
    box = vak(doel, d["vak"])
    x0, y0, w, h = box
    if d.get("punten"):
        Hn = homografie([(n[0] * doel.width, n[1] * doel.height) for _, n in d["punten"]],
                        [(v[0] * bron.width, v[1] * bron.height) for v, _ in d["punten"]])
        P = [pas_toe(Hn, x, y) for x, y in ((x0, y0), (x0 + w, y0), (x0 + w, y0 + h), (x0, y0 + h))]
    else:
        gx, gy, gw, gh = vak(bron, d.get("gok", d["vak"]))
        P = [(gx, gy), (gx + gw, gy), (gx + gw, gy + gh), (gx, gy + gh)]
    p = Paar(bron, doel, box, nadruk=d.get("nadruk"))
    if d.get("fijn"):
        P, _ = p.lijn_uit(P, grof=d.get("grof", False))
    box2, P2, s = p.inpassen(P)
    voor, na = Paar(bron, doel, box2).maak(P2)
    for kant, im in (("voor", voor), ("na", na)):
        basis = os.path.join(IMG, "%s-%s" % (naam, kant))
        for b in (640, 1000, 1600):
            (im if b == im.width else im.resize((b, round(im.height * b / im.width)), Image.LANCZOS)).save(
                "%s-%d.webp" % (basis, b), "WEBP", quality=82, method=6)
        im.resize((1000, 750), Image.LANCZOS).save("%s-1000.jpg" % basis, "JPEG", quality=80, optimize=True,
                                                    progressive=True)
    # controle: de schuif op 40% en 60%
    Wc = 700
    v, a = voor.resize((Wc, 525), Image.LANCZOS), na.resize((Wc, 525), Image.LANCZOS)
    blad = Image.new("RGB", (2 * Wc + 10, 525), "white")
    for k, pos in enumerate((.4, .6)):
        x = round(Wc * pos)
        s_ = a.copy()
        s_.paste(v.crop((0, 0, x, 525)), (0, 0))
        ImageDraw.Draw(s_).line([(x, 0), (x, 525)], fill=(255, 0, 0), width=2)
        blad.paste(s_, (k * (Wc + 10), 0))
    blad.save(os.path.join(CACHE, naam + "-controle.jpg"), quality=85)
    print("%-22s %s -> %s  ingezoomd %.0f%%" % (naam, d["voor"], d["na"], (1 - s) * 100))


if __name__ == "__main__":
    for naam in (sys.argv[1:] or list(PAREN)):
        maak(naam, PAREN[naam])
