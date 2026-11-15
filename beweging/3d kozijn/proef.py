"""Proefbeelden: tekent de animatie op vaste momenten in een raster en maakt er één schermafdruk van.
gebruik: python3 proef.py uit.png "ts=0,1,2&w=1200&h=900&cols=4&cel=420" [paginabreedte]"""
import os, sys, time, json, urllib.parse
HIER = os.path.dirname(os.path.abspath(__file__))
# De Motion Kit-bron: één map hoger (in "Bron (voor aanpassingen)"), anders de werkmap van toen.
OUD = "/private/tmp/claude-501/-Users-phoebedehaan--claude-spares-spare-42foLb/e828fed7-2f73-4b79-a729-3e0639ebdcbf/scratchpad"
MK = os.path.dirname(HIER) if os.path.exists(os.path.join(os.path.dirname(HIER), "tools", "cdp.py")) else os.path.join(OUD, "mk")
sys.path.insert(0, os.path.join(MK, "tools"))
from cdp import Chrome
uit, qs = sys.argv[1], sys.argv[2]
breed = int(sys.argv[3]) if len(sys.argv) > 3 else 1760
c = Chrome(breed, 1000)
c.goto("file://" + urllib.parse.quote(os.path.join(HIER, "proef.html")) + "?" + qs, wait=1.0)
for _ in range(200):
    if c.js("document.body.getAttribute('data-klaar')") == "1": break
    time.sleep(0.1)
h = c.js("document.documentElement.scrollHeight")
c.size(breed, int(h))
time.sleep(0.2)
c.shot(uit, {"x": 0, "y": 0, "width": breed, "height": int(h), "scale": 1})
fouten = [m for m in c.console() if "rror" in json.dumps(m)]
for m in fouten[:8]: print("console:", json.dumps(m)[:300])
c.close()
print("ok", uit, h)
