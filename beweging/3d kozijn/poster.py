"""Een stilstaand beeld uit een animatie (voor de site: het beeld voordat het script loopt).
gebruik: python3 poster.py kozijn3d.js iwrapKozijn3D 1200 900 0 media/kozijn-3d-start.jpg"""
import os, sys, time, urllib.parse
HIER = os.path.dirname(os.path.abspath(__file__))
# De Motion Kit-bron: één map hoger (in "Bron (voor aanpassingen)"), anders de werkmap van toen.
OUD = "/private/tmp/claude-501/-Users-phoebedehaan--claude-spares-spare-42foLb/e828fed7-2f73-4b79-a729-3e0639ebdcbf/scratchpad"
MK = os.path.dirname(HIER) if os.path.exists(os.path.join(os.path.dirname(HIER), "tools", "cdp.py")) else os.path.join(OUD, "mk")
sys.path.insert(0, os.path.join(MK, "tools"))
from cdp import Chrome
src, obj, w, h, t, uit = sys.argv[1], sys.argv[2], int(sys.argv[3]), int(sys.argv[4]), float(sys.argv[5]), sys.argv[6]
c = Chrome(w, h)
c.goto("file://" + urllib.parse.quote(os.path.join(HIER, "render.html")) + "?" + urllib.parse.urlencode({"src": src, "obj": obj, "w": w, "h": h}), wait=0.5)
for _ in range(300):
    if c.js("window.KLAAR") is True: break
    time.sleep(0.05)
c.js("beeld(%f, 1, 0, 30)" % t)
if uit.lower().endswith((".jpg", ".jpeg")):          # meteen als JPG (werkt overal, zonder extra programma)
    import base64
    open(uit, "wb").write(base64.b64decode(c.call("Page.captureScreenshot", {"format": "jpeg", "quality": 82})["data"]))
else:
    c.shot(uit)
c.close(); print("ok", uit)
