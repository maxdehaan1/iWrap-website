"""Opslag: kleine JSON-documenten onder een sleutel, plus gesorteerde lijsten.

Op Vercel: Upstash Redis via de REST-API (geen pakket nodig). Lokaal: gewone
bestanden in .data/, zodat je alles kunt testen zonder account. Beide kennen
precies dezelfde handvol bewerkingen; de rest van de code weet niet welke het is.

Sleutels:
  rapport:<id>        een klus: klant, oplevering, kozijncheck
  foto:<id>           een foto (base64-jpeg), klein gemaakt op de telefoon
  bestelling:<nr>     een horrenbestelling
  index rapporten     alle klussen, gesorteerd op laatst bijgewerkt
  index bestellingen  alle bestellingen, gesorteerd op aanmaakmoment
  teller:bestelling:<jaar>
"""

import json
import os
import re
import time
import urllib.request
from pathlib import Path

from . import instellingen as cfg


class Fout(Exception):
    pass


class RedisOpslag:
    def __init__(self, url, token):
        self.url = url.rstrip("/")
        self.token = token

    def _cmd(self, *args):
        req = urllib.request.Request(
            self.url,
            data=json.dumps([str(a) for a in args]).encode("utf-8"),
            headers={"Authorization": "Bearer " + self.token,
                     "Content-Type": "application/json"},
            method="POST",
        )
        try:
            with urllib.request.urlopen(req, timeout=10) as r:
                antwoord = json.loads(r.read().decode("utf-8"))
        except Exception as e:  # netwerk of Upstash-fout
            raise Fout("opslag niet bereikbaar: %s" % e)
        if "error" in antwoord:
            raise Fout(antwoord["error"])
        return antwoord.get("result")

    def get(self, sleutel):
        ruw = self._cmd("GET", sleutel)
        return json.loads(ruw) if ruw else None

    def put(self, sleutel, waarde):
        self._cmd("SET", sleutel, json.dumps(waarde, ensure_ascii=False, separators=(",", ":")))

    def get_ruw(self, sleutel):
        return self._cmd("GET", sleutel)

    def put_ruw(self, sleutel, tekst):
        self._cmd("SET", sleutel, tekst)

    def weg(self, sleutel):
        self._cmd("DEL", sleutel)

    def index_zet(self, naam, lid, score):
        self._cmd("ZADD", "index:" + naam, score, lid)

    def index_weg(self, naam, lid):
        self._cmd("ZREM", "index:" + naam, lid)

    def index_lijst(self, naam, aantal=500):
        return self._cmd("ZREVRANGE", "index:" + naam, 0, aantal - 1) or []

    def teller(self, sleutel):
        return int(self._cmd("INCR", sleutel))

    def teller_met_ttl(self, sleutel, seconden):
        n = int(self._cmd("INCR", sleutel))
        if n == 1:
            self._cmd("EXPIRE", sleutel, seconden)
        return n


class BestandOpslag:
    """Voor lokaal testen. Elk document is een bestand in .data/kv/."""

    def __init__(self, map_):
        self.map = Path(map_)
        (self.map / "kv").mkdir(parents=True, exist_ok=True)
        (self.map / "index").mkdir(parents=True, exist_ok=True)

    def _pad(self, sleutel):
        veilig = re.sub(r"[^a-zA-Z0-9_.-]", "_", sleutel)
        return self.map / "kv" / (veilig + ".json")

    def _schrijf(self, pad, tekst):
        pad.parent.mkdir(parents=True, exist_ok=True)
        tijdelijk = pad.with_suffix(".tmp")
        tijdelijk.write_text(tekst, encoding="utf-8")
        os.replace(tijdelijk, pad)

    def get(self, sleutel):
        p = self._pad(sleutel)
        if not p.exists():
            return None
        data = json.loads(p.read_text(encoding="utf-8"))
        if isinstance(data, dict) and data.get("_verloopt") and data["_verloopt"] < time.time():
            p.unlink()
            return None
        return data

    def put(self, sleutel, waarde):
        self._schrijf(self._pad(sleutel), json.dumps(waarde, ensure_ascii=False, indent=1))

    def get_ruw(self, sleutel):
        p = self._pad(sleutel)
        return json.loads(p.read_text(encoding="utf-8")) if p.exists() else None

    def put_ruw(self, sleutel, tekst):
        self._schrijf(self._pad(sleutel), json.dumps(tekst))

    def weg(self, sleutel):
        p = self._pad(sleutel)
        if p.exists():
            p.unlink()

    def _index(self, naam):
        p = self.map / "index" / (naam + ".json")
        return p, (json.loads(p.read_text(encoding="utf-8")) if p.exists() else {})

    def index_zet(self, naam, lid, score):
        p, d = self._index(naam)
        d[lid] = score
        self._schrijf(p, json.dumps(d))

    def index_weg(self, naam, lid):
        p, d = self._index(naam)
        d.pop(lid, None)
        self._schrijf(p, json.dumps(d))

    def index_lijst(self, naam, aantal=500):
        _, d = self._index(naam)
        return [k for k, _ in sorted(d.items(), key=lambda kv: -kv[1])][:aantal]

    def teller(self, sleutel):
        p = self._pad(sleutel)
        n = (json.loads(p.read_text()) if p.exists() else 0) + 1
        self._schrijf(p, json.dumps(n))
        return n

    def teller_met_ttl(self, sleutel, seconden):
        d = self.get(sleutel) or {}
        if not d or d.get("_verloopt", 0) < time.time():
            d = {"n": 0, "_verloopt": time.time() + seconden}
        d["n"] += 1
        self.put(sleutel, d)
        return d["n"]


_opslag = None


def opslag():
    global _opslag
    if _opslag is None:
        if cfg.REDIS_URL and cfg.REDIS_TOKEN:
            _opslag = RedisOpslag(cfg.REDIS_URL, cfg.REDIS_TOKEN)
        elif cfg.OP_VERCEL:
            # Zonder Redis is er op Vercel alleen /tmp, en dat is na een paar
            # minuten weg. Werkt om te proberen, niet om klanten op te laten
            # bestellen. De Max-modus toont dit als waarschuwing.
            _opslag = BestandOpslag("/tmp/iwrap-data")
        else:
            _opslag = BestandOpslag(cfg.DATA_MAP)
    return _opslag
