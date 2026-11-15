"""Tiny Chrome DevTools Protocol driver over --remote-debugging-pipe (stdlib only)."""
import os, json, subprocess, base64, time, shutil, tempfile, sys

def _vind_chrome():
    """Google Chrome of Chromium zoeken: eerst de omgevingsvariabele CHROME, dan de gewone plekken (Mac, Linux, Windows)."""
    if os.environ.get("CHROME"):
        return os.environ["CHROME"]
    for p in ("/Applications/Google Chrome.app/Contents/MacOS/Google Chrome", "/Applications/Chromium.app/Contents/MacOS/Chromium",
              r"C:\Program Files\Google\Chrome\Application\chrome.exe"):
        if os.path.exists(p):
            return p
    for n in ("google-chrome", "google-chrome-stable", "chromium", "chromium-browser", "chrome"):
        p = shutil.which(n)
        if p:
            return p
    return "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"

CHROME = _vind_chrome()

class Chrome:
    def __init__(self, width=1920, height=1080, profile_dir=None, extra=None):
        self.profile = profile_dir or tempfile.mkdtemp(prefix="iwrap-chrome-")
        r_in, w_in = os.pipe()
        r_out, w_out = os.pipe()
        def pre():
            a = os.dup(r_in); b = os.dup(w_out)
            # move away from 3/4 if necessary, then place
            hi_a = os.dup2(a, 200); hi_b = os.dup2(b, 201)
            os.dup2(200, 3); os.dup2(201, 4)
        args = [CHROME, "--headless=new", "--remote-debugging-pipe", "--user-data-dir=" + self.profile,
                "--no-first-run", "--no-default-browser-check", "--hide-scrollbars", "--mute-audio",
                "--force-color-profile=srgb", "--disable-extensions", "--disable-background-networking",
                "--disable-sync", "--disable-component-update", "--disable-features=Translate,MediaRouter",
                "--force-device-scale-factor=1", "--window-size=%d,%d" % (width, height),
                "--allow-file-access-from-files", "--disable-lcd-text", "--disable-dev-shm-usage",
                "--enable-unsafe-swiftshader",   # WebGL ook zonder grafische kaart (cloud): dan rekent de processor
                "about:blank"] + (extra or [])
        if hasattr(os, "geteuid") and os.geteuid() == 0:
            args.insert(1, "--no-sandbox")          # in een container (cloud) draait alles als root
        self.proc = subprocess.Popen(args, preexec_fn=pre, pass_fds=(3, 4), stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
        os.close(r_in); os.close(w_out)
        self.w = os.fdopen(w_in, "wb", buffering=0)
        self.r = r_out
        self.buf = b""
        self.id = 0
        self.session = None
        self.events = []
        # attach to the page target
        targets = self.call("Target.getTargets")["targetInfos"]
        page = [t for t in targets if t["type"] == "page"]
        if not page:
            tid = self.call("Target.createTarget", {"url": "about:blank"})["targetId"]
        else:
            tid = page[0]["targetId"]
        self.session = self.call("Target.attachToTarget", {"targetId": tid, "flatten": True})["sessionId"]
        self.call("Page.enable"); self.call("Runtime.enable")
        self.size(width, height)

    def _read_msg(self, timeout=60):
        import select
        t0 = time.time()
        while b"\0" not in self.buf:
            if time.time() - t0 > timeout:
                raise TimeoutError("CDP read timeout")
            rl, _, _ = select.select([self.r], [], [], 1.0)
            if rl:
                chunk = os.read(self.r, 1 << 20)
                if not chunk:
                    raise RuntimeError("Chrome closed the pipe")
                self.buf += chunk
        msg, self.buf = self.buf.split(b"\0", 1)
        return json.loads(msg)

    def call(self, method, params=None, timeout=60):
        self.id += 1
        m = {"id": self.id, "method": method, "params": params or {}}
        if self.session and not method.startswith("Target."):
            m["sessionId"] = self.session
        self.w.write(json.dumps(m).encode() + b"\0")
        while True:
            r = self._read_msg(timeout)
            if r.get("id") == self.id:
                if "error" in r:
                    raise RuntimeError("%s -> %s" % (method, r["error"]))
                return r.get("result", {})
            else:
                self.events.append(r)
                if len(self.events) > 2000: self.events = self.events[-500:]

    def size(self, w, h, scale=1):
        self.call("Emulation.setDeviceMetricsOverride", {"width": w, "height": h, "deviceScaleFactor": scale, "mobile": False})

    def transparent(self, on=True):
        if on:
            self.call("Emulation.setDefaultBackgroundColorOverride", {"color": {"r": 0, "g": 0, "b": 0, "a": 0}})
        else:
            self.call("Emulation.setDefaultBackgroundColorOverride", {})

    def goto(self, url, wait=0.3):
        self.events = []
        self.call("Page.navigate", {"url": url})
        # wait for load event
        t0 = time.time()
        while time.time() - t0 < 30:
            if any(e.get("method") == "Page.loadEventFired" for e in self.events):
                break
            try:
                self.events.append(self._read_msg(1))
            except TimeoutError:
                pass
        time.sleep(wait)

    def js(self, expr, await_promise=True):
        r = self.call("Runtime.evaluate", {"expression": expr, "awaitPromise": await_promise, "returnByValue": True})
        if "exceptionDetails" in r:
            raise RuntimeError("JS error: %s" % json.dumps(r["exceptionDetails"])[:1500])
        return r["result"].get("value")

    def shot(self, path=None, clip=None):
        p = {"format": "png", "captureBeyondViewport": False, "optimizeForSpeed": True}
        if clip: p["clip"] = clip
        data = base64.b64decode(self.call("Page.captureScreenshot", p)["data"])
        if path:
            with open(path, "wb") as f: f.write(data)
        return data

    def console(self):
        out = []
        for e in self.events:
            if e.get("method") == "Runtime.consoleAPICalled":
                out.append(" ".join(str(a.get("value", a.get("description", ""))) for a in e["params"]["args"]))
            elif e.get("method") == "Runtime.exceptionThrown":
                out.append("EXC " + json.dumps(e["params"]["exceptionDetails"])[:800])
        return out

    def close(self):
        try:
            self.call("Browser.close")
        except Exception:
            pass
        try:
            self.proc.wait(timeout=5)
        except Exception:
            self.proc.kill()
        shutil.rmtree(self.profile, ignore_errors=True)

if __name__ == "__main__":
    out = sys.argv[1]
    html = os.path.join(out, "t.html")
    open(html, "w").write("""<!doctype html><html><body style="margin:0;background:transparent">
<svg width="400" height="200" viewBox="0 0 400 200"><circle cx="100" cy="100" r="80" fill="#A7CEC5"/><rect x="220" y="40" width="140" height="120" fill="#262626"/></svg>
<script>window.seek=function(t){document.querySelector('circle').setAttribute('cx',100+t*100);return new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(()=>r(t))));}</script></body></html>""")
    t0 = time.time()
    c = Chrome(400, 200)
    print("started in %.2fs" % (time.time() - t0))
    c.transparent(True)
    c.goto("file://" + html)
    for i in range(3):
        c.js("seek(%f)" % (i * 0.5))
        c.shot(os.path.join(out, "f%d.png" % i))
    t1 = time.time()
    for i in range(30):
        c.js("seek(%f)" % (i / 30))
        c.shot()
    print("30 frames in %.2fs" % (time.time() - t1))
    print(c.js("navigator.userAgent"))
    c.close()
    print("ok")
