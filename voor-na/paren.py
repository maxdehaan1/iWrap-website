"""De voor/na-paren van iwrap.nl, op elkaar gelegd (26 en 28 november 2026).

Max: "dat de voor- en na-foto vanuit dezelfde hoek genomen lijken te zijn. Dit moet natuurlijk
in redelijkheid." Per paar wordt de voorfoto zo vervormd dat hij op de nafoto valt. Twee manieren:

- Perspectief (uitlijn.py): met punten die op beide foto's hetzelfde zijn (hoeken van het verstek,
  de rand van de dorpel, tegelvoegen), uitvergroot afgelezen, en waar dat hielp fijn bijgesteld op
  de randen. Goed als beide foto's vanaf (bijna) hetzelfde punt zijn genomen.
- Per rand (vervorm.py, "lijnen"): als de voorfoto van iets hoger of lager is genomen, zijn de
  bovenkant en de voorkant van een dorpel op de twee foto's niet even groot. Eén perspectief kan dan
  maar één vlak goed leggen. Dan wordt elke rand die op beide foto's te zien is gevolgd, en legt een
  gladde vervorming elke rand op zijn plek (28 november 2026: de groene en de witte dorpel, waarvan
  Max zei: "deze 2 kloppen niet goed").

Gebruik (vanuit de hoofdmap):
    python3 voor-na/paren.py                  alle paren opnieuw maken en in images/ zetten
    python3 voor-na/paren.py project-muurhoek-v2   alleen dit paar
Daarna python3 build.py. Een paar dat al online staat een nieuwe naam geven (images/ staat een
jaar in de cache van de browser). Elk paar komt ook als controle in .data/voor-na/<naam>-controle.jpg:
de schuif op 30%, 50% en 70%; lopen de randen door over de rode lijn, dan klopt het.

De originelen (DNG, HEIC en jpg) staan in Max' Documenten (iCloud), zie BRON. sips (macOS) zet ze om
naar jpg van 4000 px in .data/voor-na/. Alles wordt zonder EXIF opgeslagen (daar zit de GPS van het
huis in).
"""
import os
import subprocess
import sys

from PIL import Image, ImageDraw

HIER = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(HIER)
sys.path.insert(0, HIER)
from uitlijn import Paar, laad, homografie, pas_toe  # noqa: E402
from vervorm import Koppeling, vervorm, vouwt, dekt  # noqa: E402

BRON = os.path.expanduser("~/Documents/iWrap/huisstijl:website:foto's iwrap/foto's en video's/foto's voor website")
CACHE = os.path.join(ROOT, ".data", "voor-na")
IMG = os.path.join(ROOT, "images")

# Origineel: (map in BRON, bestandsnaam)
FOTOS = {
    "IMG_0831_2": ("voor na kozijn 6 (klein badkamerraam) ", "IMG_0831 2.jpg"),
    "IMG_0832_2": ("voor na kozijn 6 (klein badkamerraam) ", "IMG_0832 2.HEIC"),
    "IMG_6100_2": ("voor na kozijn 4 (6009 groen)", "IMG_6100 2.JPG"),
    "IMG_6167_2": ("voor na kozijn 4 (6009 groen)", "IMG_6167 2.JPG"),
    "IMG_6576_2": ("voor na kozijn 5 (7016 grijs)", "IMG_6576 2.HEIC"),
    "IMG_6591_2": ("voor na kozijn 5 (7016 grijs)", "IMG_6591 2.HEIC"),
    "IMG_7144_2": ("voor na kozijn 7", "IMG_7144 2.HEIC"), "IMG_7152_2": ("voor na kozijn 7", "IMG_7152 2.HEIC"),
    "IMG_7145_2": ("voor na kozijn 7", "IMG_7145 2.HEIC"), "IMG_7156_2": ("voor na kozijn 7", "IMG_7156 2.HEIC"),
    "IMG_6485": ("voor na kozijn 3", "IMG_6485.DNG"), "IMG_6496": ("voor na kozijn 3", "IMG_6496.DNG"),
    "IMG_6534": ("voor na kozijn 2 ", "IMG_6534.DNG"), "IMG_6539": ("voor na kozijn 2 ", "IMG_6539.DNG"),
    "DSC05993": ("foto's met sony camera", "DSC05993.jpg"), "DSC06101": ("foto's met sony camera", "DSC06101.jpg"),
}

# De groene onderdorpel (RAL 6009): de voorfoto is van hoger genomen, dus de bovenkant (afwatering) is
# daarop groter. Gevolgd: de onderkant van het glas links en rechts van de stijl, de lijn onder de
# stijl, de bovenkant en de knik van de afwatering, de onderkant (beton) en de stijl zelf. De zijkanten
# van de stijl zijn met de hand opgemeten: links zit het glas en een kabel ertegen, rechts een schuine
# kant die op de voorfoto breder te zien is (daar telt de buitenrand). Het beton ligt op de nafoto net
# onder de dorpel in de schaduw: de rand wordt daar gelegd waar het groen ophoudt (schuif_na).
GROEN = [
    ("h", (0.03, 0.506), (0.24, 0.506), (0.03, 0.421), (0.37, 0.421),
     dict(naam="glas-links", teken=-1, straal=0.012, graad=1)),
    ("h", (0.77, 0.512), (0.98, 0.512), (0.80, 0.433), (0.98, 0.433),
     dict(naam="glas-rechts", teken=-1, straal=0.012, graad=1)),
    ("h", (0.03, 0.556), (0.98, 0.561), (0.03, 0.472), (0.98, 0.469), dict(naam="band", teken=-1, straal=0.006)),
    ("h", (0.03, 0.598), (0.98, 0.594), (0.03, 0.514), (0.98, 0.508), dict(naam="afwatering", teken=1, straal=0.010)),
    ("h", (0.03, 0.776), (0.98, 0.779), (0.03, 0.630), (0.98, 0.629),
     dict(naam="knik", teken=-1, straal=0.008, graad=1)),
    ("h", (0.03, 0.921), (0.98, 0.938), (0.03, 0.781), (0.98, 0.774),
     dict(naam="beton", teken=1, straal=0.012, verleng=0.2, schuif_na=-0.006)),
    ("h", (0.32, 0.5445), (0.69, 0.546), (0.435, 0.4655), (0.75, 0.4645),
     dict(naam="stijl-onder", teken=1, straal=0.004, reik_voor=(0.3166, 0.6945), reik_na=(0.424, 0.756))),
    ("v", None, None, None, None,
     dict(naam="stijl-links", punten_voor=[(0.3095, 0.43), (0.312, 0.47), (0.3145, 0.51)],
          punten_na=[(0.416, 0.37), (0.418, 0.40), (0.421, 0.43)], reik_voor=(0.42, 0.5443), reik_na=(0.36, 0.466))),
    ("v", None, None, None, None,
     dict(naam="stijl-rechts", punten_voor=[(0.7097, 0.43), (0.7043, 0.47), (0.699, 0.51), (0.696, 0.535)],
          punten_na=[(0.7683, 0.37), (0.764, 0.40), (0.7605, 0.43)], reik_voor=(0.42, 0.546), reik_na=(0.35, 0.4645))),
]

# De witte onderdorpel van voren (Sony): voorfoto DSC05993 (met het losgekomen stuk folie) en nafoto
# DSC06101 zijn van ongeveer dezelfde hoogte genomen; in het glas zie je op beide de afstandhouder.
# Gevolgd: de rubberen pakking, de strip eronder (boven en onder), de bovenkant van het vlak, de
# onderkant (de tegels) en twee tegelvoegen. De smalle voorkant van de dorpel is alleen op de nafoto
# te zien; de onderkant van het vlak gaat daarom naar de tegels, niet naar die knik.
WIT = [
    ("h", (0.02, 0.268), (0.98, 0.268), (0.02, 0.287), (0.98, 0.287), dict(naam="pakking", teken=-1, straal=0.010)),
    ("h", (0.02, 0.302), (0.98, 0.302), (0.02, 0.310), (0.98, 0.310), dict(naam="strip-boven", teken=1, straal=0.010)),
    ("h", (0.02, 0.388), (0.98, 0.388), (0.02, 0.366), (0.98, 0.366), dict(naam="strip-onder", teken=-1, straal=0.010)),
    ("h", (0.02, 0.418), (0.98, 0.418), (0.02, 0.392), (0.98, 0.392), dict(naam="vlak-boven", teken=1, straal=0.010)),
    ("h", (0.02, 0.797), (0.98, 0.797), (0.02, 0.683), (0.98, 0.683), dict(naam="vlak-onder", teken=-1, straal=0.012)),
    ("v", (0.13, 0.815), (0.13, 0.99), (0.345, 0.695), (0.345, 0.99),
     dict(naam="voeg-1", teken=1, rug=True, straal=0.03, graad=1, dikte=0.022, reik_voor=(0.80, 0.99), reik_na=(0.684, 0.99))),
    ("v", (0.518, 0.815), (0.518, 0.99), (0.63, 0.695), (0.63, 0.99),
     dict(naam="voeg-2", teken=1, rug=True, straal=0.03, graad=1, dikte=0.022, reik_voor=(0.80, 0.99), reik_na=(0.684, 0.99))),
]

# De hoek tegen de muur: de voorfoto is van dichterbij en iets meer van opzij genomen, dus het raam
# (dat dieper ligt) schuift ten opzichte van de dorpel. Gevolgd: de onderkant van het raam, de boven- en
# onderkant van de dorpel, de stijl links en rechts (tegen de muur) en een tegelvoeg; het verstek (op
# de voorkant en bovenop de dorpel) is met de hand opgemeten. De lijnen lopen tot in de hoeken
# (reik_*), zodat die hoeken als vaste punten meetellen.
MUUR = [
    ("h", (0.02, 0.4375), (0.43, 0.4375), (0.02, 0.450), (0.36, 0.450),
     dict(naam="raam-onder", teken=1, straal=0.010, reik_voor=(0.02, 0.45), reik_na=(0.02, 0.376))),
    ("h", (0.02, 0.550), (0.47, 0.548), (0.02, 0.550), (0.42, 0.545),
     dict(naam="dorpel-boven", teken=-1, straal=0.012, reik_voor=(0.03, 0.523), reik_na=(0.02, 0.446))),
    ("h", (0.06, 0.772), (0.84, 0.783), (0.06, 0.760), (0.75, 0.758),
     dict(naam="dorpel-onder", teken=-1, straal=0.012, reik_voor=(0.06, 0.857), reik_na=(0.06, 0.758))),
    ("v", (0.45, 0.22), (0.45, 0.43), (0.376, 0.22), (0.376, 0.43),
     dict(naam="stijl-links", teken=1, straal=0.015, graad=1, reik_voor=(0.22, 0.4375), reik_na=(0.22, 0.45))),
    ("v", (0.933, 0.22), (0.90, 0.75), (0.767, 0.22), (0.765, 0.75),
     dict(naam="stijl-rechts", teken=-1, straal=0.02, reik_voor=(0.22, 0.783), reik_na=(0.22, 0.757))),
    ("v", (0.33, 0.79), (0.29, 0.95), (0.284, 0.775), (0.24, 0.95),
     dict(naam="voeg", teken=1, rug=True, dikte=0.02, straal=0.025, graad=1)),
    ("h", None, None, None, None,
     dict(naam="verstek", punten_voor=[(0.523, 0.557), (0.857, 0.783)], punten_na=[(0.446, 0.542), (0.758, 0.757)])),
    ("v", None, None, None, None,
     dict(naam="verstek-boven", punten_voor=[(0.45, 0.4375), (0.523, 0.557)], punten_na=[(0.376, 0.45), (0.446, 0.542)])),
]

# De opengescheurde hoek (5 maart 2026): voorfoto IMG_6534 (07:54) en nafoto IMG_6539 (13:12), allebei
# recht van voren; de nafoto staat iets verder weg. Gevolgd: de voeg langs de muur, de glaslat, de
# hoek tussen de zijkant en de voorkant van de stijl, de aansluiting van stijl en dorpel (voor en
# opzij), de onderkant van het glas en een tegelvoeg. De onderkant van de dorpel is met de hand
# opgemeten (op de nafoto valt rechts de schaduw van de fotograaf, die het volgen in de war bracht).
# Rechts staat die schaduw buiten het vak.
HOEK = [
    ("v", (0.206, 0.06), (0.294, 0.72), (0.242, 0.08), (0.233, 0.68),
     dict(naam="muur", teken=0, straal=0.02, reik_voor=(0.12, 0.733), reik_na=(0.08, 0.691))),
    ("v", (0.705, 0.06), (0.711, 0.50), (0.678, 0.08), (0.672, 0.48), dict(naam="glaslat", teken=0, straal=0.015)),
    ("v", (0.400, 0.10), (0.438, 0.63), (0.405, 0.10), (0.400, 0.60), dict(naam="stijlhoek", teken=1, straal=0.02, graad=1)),
    ("h", (0.45, 0.645), (0.69, 0.535), (0.41, 0.603), (0.665, 0.508),
     dict(naam="dorpel-achter", teken=0, straal=0.015, graad=1)),
    ("h", (0.30, 0.728), (0.43, 0.655), (0.245, 0.686), (0.39, 0.612),
     dict(naam="dorpel-zij", teken=0, straal=0.012, graad=1, reik_voor=(0.303, 0.43), reik_na=(0.24, 0.39))),
    ("h", None, None, None, None,
     dict(naam="dorpel-onder", reik_voor=(0.303, 0.81), reik_na=(0.24, 0.78),
          punten_voor=[(0.36, 0.7562), (0.45, 0.7923), (0.50, 0.8117), (0.60, 0.8518), (0.65, 0.8722), (0.70, 0.8922)],
          punten_na=[(0.26, 0.6987), (0.40, 0.7508), (0.55, 0.8053), (0.65, 0.8433), (0.72, 0.8688)])),
    ("h", (0.73, 0.507), (0.98, 0.555), (0.71, 0.495), (0.98, 0.548), dict(naam="glas-onder", teken=0, straal=0.012, graad=1)),
    ("v", (0.628, 0.875), (0.53, 0.99), (0.567, 0.835), (0.475, 0.90),
     dict(naam="voeg", teken=1, rug=True, dikte=0.01, straal=0.025, graad=1)),
]

# Per paar: voorfoto, nafoto, het vak in de nafoto (zie vak()), en dan óf "lijnen" (per rand, zie boven)
# óf punten (voor, na) als fracties van de hele foto's voor één perspectief, met "fijn": daarna nog
# bijstellen op de randen. "gok": het vak in de voorfoto als begin, als er geen punten zijn. "nadruk":
# deel van het vak dat bij het bijstellen het zwaarst telt. "grof": eerst grof zoeken. "uit": de maat
# van het uitvoerbeeld (standaard 1600x1200; de twee grote hoeken zijn vierkant, zodat je meer van het
# kozijn ziet: Max, 28 november 2026, "kunnen deze wat verder uitgezoomd?").
# De hero (voor-gebarsten-dorpel en na-gebarsten-dorpel-hersteld) staat hier bewust niet in: Max wil die
# foto houden zoals hij is (26 november 2026).
PAREN = {
    "project-raam-v2": dict(voor="IMG_0831_2", na="IMG_0832_2", vak=("f", .516, .527, .90),
                            gok=("f", .50, .505, .90), fijn=True, grof=True),
    "project-groen-v3": dict(voor="IMG_6100_2", na="IMG_6167_2", vak=("b", .18, .36, .81), lijnen=GROEN),
    "project-antraciet-v2": dict(voor="IMG_6576_2", na="IMG_6591_2", vak=("b", .2, .05, .6), fijn=True,
                                 punten=[((.873, .320), (.795, .145)), ((.095, .548), (.205, .318)),
                                         ((.53, .64), (.49, .415)), ((.355, .865), (.385, .605)),
                                         ((.10, .70), (.21, .405))]),
    "project-verbinding-v2": dict(voor="IMG_7144_2", na="IMG_7152_2", vak=("f", .47, .58, 1.0), fijn=False,
                                  punten=[((.306, .595), (.3805, .4946)), ((.529, .598), (.644, .495)),
                                          ((.4205, .6795), (.5207, .5855)), ((.4205, .822), (.5207, .7497)),
                                          ((.306, .822), (.3805, .7525))]),
    # De voorfoto is van dichtbij genomen; breder dan 80% van de nafoto dekt hij niet. Vierkant laat de
    # onderdorpel en de tegels erbij zien.
    "project-muurhoek-v2": dict(voor="IMG_7145_2", na="IMG_7156_2", vak=("b", .01, .30, .80, 1.0), uit=(1600, 1600),
                                lijnen=MUUR),
    "project-dorpel-v2": dict(voor="IMG_6485", na="IMG_6496", vak=("heel",), gok=("heel",), fijn=True,
                              nadruk=[(.12, .70), (.42, .40), (1, .55), (1, .98), (.5, .85), (.12, .73)]),
    "project-dorpel-wit-v2": dict(voor="DSC05993", na="DSC06101", vak=("b", .30, .135, .586), lijnen=WIT),
    # De opengescheurde hoek, uit de originelen (5 maart 2026, 07:54 en 13:12; tot 28 november stond hier
    # een uitsnede van de vorige site).
    "project-hoek-v3": dict(voor="IMG_6534", na="IMG_6539", vak=("b", .07, .24, .78, 1.0), uit=(1600, 1600),
                            lijnen=HOEK),
}


def foto(naam):
    """Het origineel als jpg van 4000 px (eenmalig omgezet met sips)."""
    os.makedirs(CACHE, exist_ok=True)
    doel = os.path.join(CACHE, naam + ".jpg")
    if os.path.exists(doel):
        return laad(doel)
    map_, bestand = FOTOS[naam]
    subprocess.run(["sips", "-s", "format", "jpeg", "-s", "formatOptions", "92", "-Z", "4000",
                    os.path.join(BRON, map_, bestand), "--out", doel], check=True, capture_output=True)
    return laad(doel)


def vak(im, spec):
    """("heel"[, v]): het grootste vak met verhouding v (hoogte/breedte, standaard 3/4) in het midden;
    ("f", cx, cy, wf[, v]): rond (cx, cy) met breedte wf van het beeld; ("b", x0, y0, w[, v]): vanaf
    (x0, y0), breedte w (fracties)."""
    W, H = im.width, im.height
    if spec[0] == "heel":
        v = spec[1] if len(spec) > 1 else 0.75
        w = min(W, H / v)
        return ((W - w) / 2, (H - w * v) / 2, w, w * v)
    if spec[0] == "f":
        _, cx, cy, wf = spec[:4]
        v = spec[4] if len(spec) > 4 else 0.75
        w = min(W * wf, H / v)
        h = w * v
        return (min(max(cx * W - w / 2, 0), W - w), min(max(cy * H - h / 2, 0), H - h), w, h)
    _, fx, fy, fw = spec[:4]
    v = spec[4] if len(spec) > 4 else 0.75
    return (fx * W, fy * H, W * fw, W * fw * v)


def maak_perspectief(d, bron, doel, uit):
    box = vak(doel, d["vak"])
    x0, y0, w, h = box
    if d.get("punten"):
        Hn = homografie([(n[0] * doel.width, n[1] * doel.height) for _, n in d["punten"]],
                        [(v[0] * bron.width, v[1] * bron.height) for v, _ in d["punten"]])
        P = [pas_toe(Hn, x, y) for x, y in ((x0, y0), (x0 + w, y0), (x0 + w, y0 + h), (x0, y0 + h))]
    else:
        gx, gy, gw, gh = vak(bron, d.get("gok", d["vak"]))
        P = [(gx, gy), (gx + gw, gy), (gx + gw, gy + gh), (gx, gy + gh)]
    p = Paar(bron, doel, box, uit=uit, nadruk=d.get("nadruk"))
    if d.get("fijn"):
        P, _ = p.lijn_uit(P, grof=d.get("grof", False))
    box2, P2, s = p.inpassen(P)
    voor, na = Paar(bron, doel, box2, uit=uit).maak(P2)
    return voor, na, "ingezoomd %.0f%%" % ((1 - s) * 100)


def maak_lijnen(d, bron, doel, uit):
    k = Koppeling(bron, doel, vak(doel, d["vak"]), d["lijnen"], uit=uit)
    f = k.maak()
    voor, (xs, ys, R) = vervorm(bron, f, uit)
    if vouwt(xs, ys, R) <= 0:
        raise SystemExit("de vervorming klapt ergens om: kijk de lijnen na")
    if not dekt(bron, xs, ys, R):
        raise SystemExit("de voorfoto dekt het vak niet: kies een kleiner vak")
    rest = ", ".join("%s %.1f" % (n, med) for n, _, _, _, med in k.afwijking(voor))
    return voor, k.na_beeld(), "%d punten; afwijking per rand (px, mediaan): %s" % (len(k.van), rest)


def controle(voor, na, pad):
    """De schuif op 30%, 50% en 70% naast elkaar; lopen de randen door over de rode lijn, dan klopt het."""
    Wc = 600
    Hc = round(voor.height * Wc / voor.width)
    v, a = voor.resize((Wc, Hc), Image.LANCZOS), na.resize((Wc, Hc), Image.LANCZOS)
    blad = Image.new("RGB", (3 * Wc + 20, Hc), "white")
    for k, pos in enumerate((.3, .5, .7)):
        x = round(Wc * pos)
        s_ = a.copy()
        s_.paste(v.crop((0, 0, x, Hc)), (0, 0))
        ImageDraw.Draw(s_).line([(x, 0), (x, Hc)], fill=(255, 0, 0), width=2)
        blad.paste(s_, (k * (Wc + 10), 0))
    blad.save(pad, quality=85)


def maak(naam, d):
    bron, doel = foto(d["voor"]), foto(d["na"])
    uit = d.get("uit", (1600, 1200))
    voor, na, info = (maak_lijnen if d.get("lijnen") else maak_perspectief)(d, bron, doel, uit)
    for kant, im in (("voor", voor), ("na", na)):
        basis = os.path.join(IMG, "%s-%s" % (naam, kant))
        for b in (640, 1000, 1600):
            (im if b == im.width else im.resize((b, round(im.height * b / im.width)), Image.LANCZOS)).save(
                "%s-%d.webp" % (basis, b), "WEBP", quality=82, method=6)
        im.resize((1000, round(im.height * 1000 / im.width)), Image.LANCZOS).save(
            "%s-1000.jpg" % basis, "JPEG", quality=80, optimize=True, progressive=True)
    controle(voor, na, os.path.join(CACHE, naam + "-controle.jpg"))
    print("%-22s %s -> %s  %s" % (naam, d["voor"], d["na"], info))


if __name__ == "__main__":
    for naam in (sys.argv[1:] or list(PAREN)):
        maak(naam, PAREN[naam])
