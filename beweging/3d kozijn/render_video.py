"""Rendert een canvas-animatie beeld voor beeld en maakt er een video van (met de encoder van de Motion Kit).
gebruik: python3 render_video.py '<json-lijst met opdrachten>'
opdracht = {src, obj, w, h, uit, video(0/1), variant, logo(0/1), fps=30, samples=4, sluiter=0.5, bitrate, poster: [t, pad]}"""
import os, sys, json, time, shutil, subprocess, urllib.parse
HIER = os.path.dirname(os.path.abspath(__file__))
# De Motion Kit-bron: één map hoger (in "Bron (voor aanpassingen)"), anders de werkmap van toen.
OUD = "/private/tmp/claude-501/-Users-phoebedehaan--claude-spares-spare-42foLb/e828fed7-2f73-4b79-a729-3e0639ebdcbf/scratchpad"
MK = os.path.dirname(HIER) if os.path.exists(os.path.join(os.path.dirname(HIER), "tools", "cdp.py")) else os.path.join(OUD, "mk")
sys.path.insert(0, os.path.join(MK, "tools"))
from cdp import Chrome
from video_maken import maak_video     # Mac: de eigen encoder; elders (Linux, cloud): ffmpeg

def maak(c, o):
    w, h, fps, N = o["w"], o["h"], o.get("fps", 30), o.get("samples", 4)
    q = urllib.parse.urlencode({"src": o["src"], "obj": o["obj"], "w": w, "h": h, "video": o.get("video", 0), "variant": o.get("variant", "licht"), "logo": o.get("logo", 1)})
    c.size(w, h)
    c.goto("file://" + urllib.parse.quote(os.path.join(HIER, "render.html")) + "?" + q, wait=0.5)
    for _ in range(300):
        if c.js("window.KLAAR") is True: break
        time.sleep(0.05)
    duur = c.js("window.DUUR"); nf = int(round(duur * fps)) + 1
    tmp = os.path.join(HIER, "beelden", os.path.splitext(os.path.basename(o["uit"]))[0])
    shutil.rmtree(tmp, ignore_errors=True); os.makedirs(tmp)
    t0 = time.time()
    for i in range(nf):
        c.js("beeld(%.6f, %d, %.3f, %d)" % (min(duur, i / fps), N, o.get("sluiter", 0.5), fps))
        c.shot(os.path.join(tmp, "f%05d_00.png" % i))
    if o.get("poster"):
        c.js("beeld(%.6f, 1, 0, %d)" % (o["poster"][0], fps)); c.shot(o["poster"][1])
    fout = [m for m in c.console() if "rror" in json.dumps(m)]
    if fout: print("console:", fout[:3])
    os.makedirs(os.path.dirname(o["uit"]), exist_ok=True)
    uitkomst = maak_video(tmp, o["uit"], fps=fps, codec=o.get("codec", "h264"), bitrate=o.get("bitrate"))
    shutil.rmtree(tmp, ignore_errors=True)
    print("%-60s %4d beelden in %5.1fs | %s" % (os.path.basename(o["uit"]), nf, time.time() - t0, uitkomst[-80:]), flush=True)

if __name__ == "__main__":
    taken = json.loads(open(sys.argv[1]).read()) if os.path.exists(sys.argv[1]) else json.loads(sys.argv[1])
    c = Chrome(1920, 1080)
    try:
        for o in taken:
            try: maak(c, o)
            except Exception as e: print("MISLUKT", o.get("uit"), str(e)[:400], flush=True)
    finally:
        c.close()
