"""Plakt de zes delen in src/ aan elkaar tot kozijn3d.js (het bestand dat op de site staat als js/kozijn-3d.js).
Gebruik: python3 bouw.py"""
import os
HIER = os.path.dirname(os.path.abspath(__file__))
DELEN = ["a-basis.js", "b-shaders.js", "c-motor.js", "d-verhaal.js", "f-zon.js", "e-speler.js"]
js = "".join(open(os.path.join(HIER, "src", d), encoding="utf-8").read() for d in DELEN)
open(os.path.join(HIER, "kozijn3d.js"), "w", encoding="utf-8").write(js)
print("kozijn3d.js", len(js.encode("utf-8")), "bytes")
