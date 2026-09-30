#!/usr/bin/env python3
"""Lokale server die zich net zo gedraagt als Vercel: /kosten serveert kosten.html,
/r/<id> serveert het rapport, en alles onder /api/ gaat naar backend/app.py.

Zonder instellingen werkt alles lokaal: opslag in .data/, mails in
.data/uitbak/, betalen via de testkassa, en de Max-modus op wachtwoord "test".
"""
import http.server, socketserver, os, io, re
from pathlib import Path

ROOT = Path(__file__).parent
POORT = int(os.environ.get("POORT", "8010"))

from backend.app import app as api_app  # noqa: E402
from backend import instellingen  # noqa: E402

# Dezelfde rewrites als in vercel.json.
HERSCHRIJVEN = [
    (re.compile(r"^/r/[a-z0-9]+/?$"), "/rapport"),
]


class Handler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *a, **kw):
        super().__init__(*a, directory=str(ROOT), **kw)

    def translate_path(self, path):
        schoon = path.split("?", 1)[0]
        for patroon, doel in HERSCHRIJVEN:
            if patroon.match(schoon):
                path = doel
        p = super().translate_path(path)
        if not os.path.exists(p) and not path.endswith("/"):
            kandidaat = p + ".html"
            if os.path.exists(kandidaat):
                return kandidaat
        if os.path.isdir(p):
            for naam in ("index.html",):
                if os.path.exists(os.path.join(p, naam)):
                    return os.path.join(p, naam)
        return p

    def send_error(self, code, message=None, explain=None):
        if code == 404 and (ROOT / "404.html").exists():
            self.error_message_format = (ROOT / "404.html").read_text(encoding="utf-8")
        super().send_error(code, message, explain)

    def log_message(self, *a):
        pass

    # --- API --------------------------------------------------------------

    def _api(self):
        lengte = int(self.headers.get("Content-Length") or 0)
        body = self.rfile.read(lengte) if lengte else b""
        pad, _, query = self.path.partition("?")
        environ = {
            "REQUEST_METHOD": self.command, "PATH_INFO": pad, "QUERY_STRING": query,
            "CONTENT_LENGTH": str(len(body)), "CONTENT_TYPE": self.headers.get("Content-Type", ""),
            "wsgi.input": io.BytesIO(body), "REMOTE_ADDR": self.client_address[0],
        }
        for k, v in self.headers.items():
            environ["HTTP_" + k.upper().replace("-", "_")] = v
        uitkomst = {}

        def start_response(status, koppen):
            uitkomst["status"], uitkomst["koppen"] = status, koppen

        inhoud = b"".join(api_app(environ, start_response))
        self.send_response(int(uitkomst["status"].split(" ")[0]))
        for k, v in uitkomst["koppen"]:
            self.send_header(k, v)
        self.send_header("Content-Length", str(len(inhoud)))
        self.end_headers()
        self.wfile.write(inhoud)

    def _is_api(self):
        return self.path.startswith("/api/")

    def do_GET(self):
        return self._api() if self._is_api() else super().do_GET()

    def do_HEAD(self):
        return self._api() if self._is_api() else super().do_HEAD()

    def do_POST(self):
        return self._api() if self._is_api() else self.send_error(405)

    def do_PUT(self):
        return self._api() if self._is_api() else self.send_error(405)

    def do_DELETE(self):
        return self._api() if self._is_api() else self.send_error(405)

    def do_OPTIONS(self):
        return self._api() if self._is_api() else self.send_error(405)


class Server(socketserver.ThreadingMixIn, socketserver.TCPServer):
    daemon_threads = True
    allow_reuse_address = True


with Server(("", POORT), Handler) as s:
    st = instellingen.status()
    print(f"http://localhost:{POORT}")
    print(f"  Max-modus: http://localhost:{POORT}/max"
          + ("  (wachtwoord: test)" if instellingen.MAX_WACHTWOORD == "test" else ""))
    print(f"  opslag: {st['opslag']}, mail: {st['mail']}, betalen: {st['betalen']}")
    s.serve_forever()
