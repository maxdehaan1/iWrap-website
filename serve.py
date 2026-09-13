#!/usr/bin/env python3
"""Lokale server die zich net zo gedraagt als Vercel: /kosten serveert kosten.html."""
import http.server, socketserver, os
from pathlib import Path

ROOT = Path(__file__).parent
POORT = int(os.environ.get("POORT", "8010"))


class Handler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *a, **kw):
        super().__init__(*a, directory=str(ROOT), **kw)

    def translate_path(self, path):
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


socketserver.TCPServer.allow_reuse_address = True
with socketserver.TCPServer(("", POORT), Handler) as s:
    print(f"http://localhost:{POORT}")
    s.serve_forever()
