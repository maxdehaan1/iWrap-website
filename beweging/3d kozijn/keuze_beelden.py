"""De stilstaande beelden voor de hero van kozijnwrap.nl ("Herstellen of wrappen?").

Maakt het startbeeld (het versleten kozijn, zoals het eerste beeld van de animatie) en per keuze het
eindbeeld (voor apparaten zonder WebGL), en zet ze in de map images van kozijnwrap.nl.
Gebruik: python3 keuze_beelden.py [map]   (standaard ../../../kozijnwrap-project/images)
Proefbeelden van één keuze: python3 keuze_beelden.py --proef kleur 0,1.5,3,6.4
"""
import base64, io, os, sys, time, urllib.parse
HIER = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.join(os.path.dirname(HIER), "tools"))
from cdp import Chrome
from PIL import Image


def beelden(optie, ts, w, h):
    c = Chrome(w, h)
    c.goto("file://" + urllib.parse.quote(os.path.join(HIER, "render.html")) + "?" + urllib.parse.urlencode(
        {"src": "kozijn3d.js,kozijn-keuze.js", "obj": "iwrapKozijnKeuze", "w": w, "h": h}), wait=0.4)
    for _ in range(300):
        if c.js("window.KLAAR") is True:
            break
        time.sleep(0.05)
    c.js("opts.optie = %r; opts.schaduwMaat = 2048;" % optie)
    uit = []
    for t in ts:
        c.js("beeld(%f, 1, 0, 30)" % t)
        uit.append(Image.open(io.BytesIO(base64.b64decode(c.call("Page.captureScreenshot", {"format": "png"})["data"]))).convert("RGB"))
    c.close()
    return uit


if len(sys.argv) > 1 and sys.argv[1] == "--proef":
    optie, ts = sys.argv[2], [float(x) for x in sys.argv[3].split(",")]
    ims = beelden(optie, ts, 560, 420)
    blad = Image.new("RGB", (3 * 566 - 6, ((len(ims) + 2) // 3) * 426 - 6), "white")
    for i, im in enumerate(ims):
        blad.paste(im, ((i % 3) * 566, (i // 3) * 426))
    blad.save("proef-keuze.jpg", quality=85)
    print("ok proef-keuze.jpg")
    sys.exit()

MAP = sys.argv[1] if len(sys.argv) > 1 else os.path.normpath(os.path.join(HIER, "..", "..", "..", "kozijnwrap-project", "images"))
start = beelden("herstel", [0], 1400, 1050)[0]
start.save(os.path.join(MAP, "keuze-start-1400.webp"), quality=80, method=6)
start.save(os.path.join(MAP, "keuze-start-1400.jpg"), quality=80, optimize=True, progressive=True)
start.resize((800, 600), Image.LANCZOS).save(os.path.join(MAP, "keuze-start-800.webp"), quality=80, method=6)
for optie, t in [("herstel", 6.4), ("kleur", 6.4), ("vervang", 8.6)]:
    beelden(optie, [t], 1000, 750)[0].save(os.path.join(MAP, "keuze-%s-1000.jpg" % optie), quality=78, optimize=True, progressive=True)
print("ok", MAP)
