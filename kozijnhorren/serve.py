#!/usr/bin/env python3
"""Lokale server voor de horrenwinkel, op http://localhost:8020.

De winkel praat met de API van iwrap.nl; start daarvoor in een tweede venster
ook `python3 serve.py` in de repo-root (poort 8010). js/winkel.js ziet vanzelf
dat hij lokaal draait en gebruikt dan localhost:8010.
"""
import http.server, socketserver, os
from pathlib import Path

HIER = Path(__file__).parent
POORT = int(os.environ.get("POORT", "8020"))


class Handler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *a, **kw):
        super().__init__(*a, directory=str(HIER), **kw)

    def translate_path(self, path):
        p = super().translate_path(path)
        schoon = path.split("?", 1)[0].split("#", 1)[0]
        if not os.path.exists(p) and not schoon.endswith("/"):
            if os.path.exists(p + ".html"):
                return p + ".html"
        return p

    def send_error(self, code, message=None, explain=None):
        if code == 404 and (HIER / "404.html").exists():
            self.error_message_format = (HIER / "404.html").read_text(encoding="utf-8")
        super().send_error(code, message, explain)

    def log_message(self, *a):
        pass


class Server(socketserver.ThreadingMixIn, socketserver.TCPServer):
    daemon_threads = True
    allow_reuse_address = True


with Server(("", POORT), Handler) as s:
    print(f"Horrenwinkel: http://localhost:{POORT}  (API: start ook serve.py in de repo-root)")
    s.serve_forever()
