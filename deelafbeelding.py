#!/usr/bin/env python3
"""De deelafbeelding van iwrap.nl (WhatsApp, LinkedIn, Facebook): images/og/iwrap-voor-na-v1.jpg.

Links het logo en de kop van de homepage, rechts dezelfde onderdorpel als bovenaan de homepage,
half voor en half na het herstel, met de labels Voor en Na zoals bij de schuif op de site. Voor
de homepage en /offerte (ogimage in hun metadatablok); de andere pagina's houden hun eigen foto.
(Audit V6, 18 november 2026: eerst toonde WhatsApp een losse foto van een dorpel zonder logo.)

Gebruik: python3 deelafbeelding.py
Een nieuwe versie: geef hem een nieuw nummer (v2) en zet dat in index.html en offerte.html,
want /images/ staat een jaar in de cache.
Nodig: Chrome, en cdp.py uit beweging/tools.
"""
import base64, os, sys, time

ROOT = os.path.dirname(os.path.abspath(__file__))
sys.path.append(os.path.join(ROOT, "beweging", "tools"))
from cdp import Chrome  # noqa: E402

UIT = os.path.join(ROOT, "images", "og", "iwrap-voor-na-v1.jpg")
KOP = "Kunststof kozijnen herstellen met Renolit folie"

HTML = """<!doctype html><html lang="nl"><head><meta charset="utf-8"><style>
  @font-face{font-family:"Montserrat-og";font-weight:100 900;src:url(../../fonts/montserrat-latin-83a31c81.woff2) format("woff2");}
  :root{--mint:#a3cdc2;--mint-ink:#3f7468;--ink:#22262a;--rust:#a8523a;--paper:#f7f6f3;
    --kop:"Montserrat-og",Arial,sans-serif;}
  html,body{margin:0;width:1200px;height:630px;overflow:hidden;}
  body{background:radial-gradient(70%% 100%% at 30%% 0%%,rgba(163,205,194,.42),rgba(163,205,194,0) 72%%),var(--paper);
    font-family:var(--kop);-webkit-font-smoothing:antialiased;display:grid;
    grid-template-columns:500px 1fr;align-items:center;gap:40px;padding:0 64px;box-sizing:border-box;}
  .logo{width:210px;height:auto;display:block;margin:0 0 44px;}
  h1{font-weight:700;font-size:56px;line-height:1.08;letter-spacing:-.028em;color:var(--ink);margin:0;text-wrap:balance;}
  .adres{margin:30px 0 0;font-weight:600;font-size:24px;color:var(--mint-ink);letter-spacing:-.005em;}
  .beeld{position:relative;width:532px;height:399px;border-radius:30px;overflow:hidden;
    box-shadow:0 2px 6px rgba(34,38,42,.05),0 34px 64px -30px rgba(34,38,42,.45);}
  .beeld img{position:absolute;inset:0;width:100%%;height:100%%;object-fit:cover;}
  .beeld .na{clip-path:inset(0 0 0 50%%);}
  .streep{position:absolute;top:0;bottom:0;left:50%%;width:4px;margin-left:-2px;background:#fff;}
  .lab{position:absolute;top:18px;padding:9px 17px;border-radius:999px;font-weight:700;font-size:21px;line-height:1;}
  .voor{left:18px;background:var(--rust);color:#fff;} .na-lab{right:18px;background:var(--mint);color:var(--ink);}
</style></head><body>
<div>
  <img class="logo" src="../logo/iwrap-logo-liggend.svg" alt="">
  <h1>%(kop)s</h1>
  <p class="adres">iwrap.nl</p>
</div>
<div class="beeld">
  <img src="../voor-gebarsten-dorpel-1000.jpg" alt="">
  <img class="na" src="../na-gebarsten-dorpel-hersteld-1000.jpg" alt="">
  <span class="streep"></span>
  <span class="lab voor">Voor</span><span class="lab na-lab">Na</span>
</div>
</body></html>"""


def main():
    os.makedirs(os.path.dirname(UIT), exist_ok=True)
    tmp = os.path.join(os.path.dirname(UIT), "_deel.html")
    open(tmp, "w", encoding="utf-8").write(HTML % {"kop": KOP})
    c = Chrome(1200, 630)
    try:
        c.goto("file://" + tmp, wait=0.8)
        if not c.js("document.fonts.ready.then(() => document.fonts.check('700 56px Montserrat-og'))"):
            sys.exit("Montserrat niet geladen")
        if not c.js("Promise.all([...document.images].map(i => i.decode())).then(() => [...document.images].every(i => i.naturalWidth > 0))"):
            sys.exit("Een beeld ontbreekt")
        time.sleep(0.3)
        data = base64.b64decode(c.call("Page.captureScreenshot", {"format": "jpeg", "quality": 88})["data"])
        open(UIT, "wb").write(data)
        print("ok", os.path.relpath(UIT, ROOT))
    finally:
        c.close()
        os.remove(tmp)


if __name__ == "__main__":
    main()
