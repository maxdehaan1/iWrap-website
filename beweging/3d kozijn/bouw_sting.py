"""Maakt kozijn-sting.js: de bron met de vormen van het logo (uit de Motion Kit) erin."""
import json, os
HIER = os.path.dirname(os.path.abspath(__file__))
# De Motion Kit-bron: één map hoger (in "4 - Bronbestanden"), anders de werkmap van toen.
OUD = "/private/tmp/claude-501/-Users-phoebedehaan--claude-spares-spare-42foLb/e828fed7-2f73-4b79-a729-3e0639ebdcbf/scratchpad"
MK = os.path.dirname(HIER) if os.path.exists(os.path.join(os.path.dirname(HIER), "geo.json")) else os.path.join(OUD, "mk")
g = json.load(open(os.path.join(MK, "geo.json")))
geo = {"mark": g["mark"], "word": g["word"], "tag": {"parts": g["tag"]["parts"], "bbox": g["tag"]["bbox"]},
       "lockups": {"tagline": g["lockups"]["tagline"]}, "colors": g["colors"]}
src = open(os.path.join(HIER, "kozijn-sting.src.js"), encoding="utf-8").read()
assert "__GEO__" in src
open(os.path.join(HIER, "kozijn-sting.js"), "w", encoding="utf-8").write(src.replace("__GEO__", json.dumps(geo, separators=(",", ":"))))
print("kozijn-sting.js", os.path.getsize(os.path.join(HIER, "kozijn-sting.js")), "bytes")
