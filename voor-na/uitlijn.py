"""Legt een voorfoto in perspectief op een nafoto, alleen met PIL (geen numpy of OpenCV).

Het uitvoerbeeld is een vak in de nafoto (box, in pixels van de nafoto). De voorfoto wordt met een
homografie (perspectief) zo vervormd dat hij precies op dat vak valt. De homografie wordt gezocht
door de randen (Sobel) van beide foto's zo goed mogelijk te laten samenvallen (genormaliseerde
kruiscorrelatie), eerst grof (verschuiven, schalen, draaien) en dan fijn (de vier hoekpunten los),
van een klein naar een groter formaat.
"""
import math
from PIL import Image, ImageOps, ImageFilter, ImageChops, ImageStat, ImageDraw

Image.MAX_IMAGE_PIXELS = None


def laad(pad):
    return ImageOps.exif_transpose(Image.open(pad)).convert("RGB")


# ---------------------------------------------------------------- algebra (8x8, zonder numpy)

def los(A, b):
    n = len(b)
    M = [list(map(float, A[i])) + [float(b[i])] for i in range(n)]
    for c in range(n):
        p = max(range(c, n), key=lambda r: abs(M[r][c]))
        M[c], M[p] = M[p], M[c]
        if abs(M[c][c]) < 1e-12:
            raise ValueError("singulier")
        for r in range(n):
            if r != c and M[r][c]:
                f = M[r][c] / M[c][c]
                for k in range(c, n + 1):
                    M[r][k] -= f * M[c][k]
    return [M[i][n] / M[i][i] for i in range(n)]


def homografie(van, naar):
    """van: punten (x, y) in het uitvoerbeeld, naar: punten (u, v) in de bron (4 of meer).
    Geeft (a..h): u = (ax+by+c)/(gx+hy+1), v = (dx+ey+f)/(gx+hy+1), het formaat van PIL."""
    A, b = [], []
    for (x, y), (u, v) in zip(van, naar):
        A.append([x, y, 1, 0, 0, 0, -u * x, -u * y]); b.append(u)
        A.append([0, 0, 0, x, y, 1, -v * x, -v * y]); b.append(v)
    if len(A) == 8:
        return los(A, b)
    AtA = [[sum(r[i] * r[j] for r in A) for j in range(8)] for i in range(8)]
    Atb = [sum(A[k][i] * b[k] for k in range(len(A))) for i in range(8)]
    return los(AtA, Atb)


def pas_toe(H, x, y):
    a, b_, c, d, e, f, g, h = H
    w = g * x + h * y + 1
    return (a * x + b_ * y + c) / w, (d * x + e * y + f) / w


# ---------------------------------------------------------------- randen en overeenkomst

SOBEL_X = ImageFilter.Kernel((3, 3), [-1, 0, 1, -2, 0, 2, -1, 0, 1], scale=1, offset=128)
SOBEL_Y = ImageFilter.Kernel((3, 3), [-1, -2, -1, 0, 0, 0, 1, 2, 1], scale=1, offset=128)


def randkaart(im, vervaag):
    g = ImageOps.grayscale(im).filter(ImageFilter.GaussianBlur(0.7))
    grijs = Image.new("L", g.size, 128)
    gx = ImageChops.difference(g.filter(SOBEL_X), grijs)
    gy = ImageChops.difference(g.filter(SOBEL_Y), grijs)
    e = ImageChops.add(gx, gy)
    e = ImageOps.autocontrast(e, cutoff=0.5)
    if vervaag:
        e = e.filter(ImageFilter.GaussianBlur(vervaag))
    return e


def ncc(a, b, masker=None):
    sa, sb = ImageStat.Stat(a, masker), ImageStat.Stat(b, masker)
    ma, mb, da, db = sa.mean[0], sb.mean[0], sa.stddev[0], sb.stddev[0]
    prod = ImageStat.Stat(ImageChops.multiply(a, b), masker).mean[0] * 255.0
    return (prod - ma * mb) / (da * db + 1e-6)


def maak_masker(veelhoek, w, h):
    """veelhoek: punten als fracties (0..1) van het uitvoerbeeld; wit = telt mee."""
    if not veelhoek:
        return None
    m = Image.new("L", (w, h), 0)
    ImageDraw.Draw(m).polygon([(x * w, y * h) for x, y in veelhoek], fill=255)
    return m


# ---------------------------------------------------------------- het uitlijnen

def hoeken(w, h):
    return [(0.0, 0.0), (float(w), 0.0), (float(w), float(h)), (0.0, float(h))]


def _midden(P):
    return (sum(p[0] for p in P) / 4.0, sum(p[1] for p in P) / 4.0)


def _verschuif(P, dx, dy):
    return [(x + dx, y + dy) for x, y in P]


def _schaal(P, s):
    cx, cy = _midden(P)
    return [(cx + (x - cx) * s, cy + (y - cy) * s) for x, y in P]


def _draai(P, hoek):
    cx, cy = _midden(P)
    c, s = math.cos(hoek), math.sin(hoek)
    return [(cx + (x - cx) * c - (y - cy) * s, cy + (x - cx) * s + (y - cy) * c) for x, y in P]


class Paar:
    """bron = voorfoto (wordt vervormd), doel = nafoto, box = (x0, y0, b, h) in de nafoto."""

    def __init__(self, bron, doel, box, uit=(1600, 1200), nadruk=None, modus="rand"):
        self.bron, self.doel, self.box, self.uit = bron, doel, box, uit
        self.nadruk = nadruk  # veelhoek (fracties van het vak) die het zwaarst telt, bv. de dorpel
        self.modus = modus    # "rand": randen vergelijken; "grijs": vervaagde licht-donkervlakken
        self._cache = {}

    def kaart(self, im, vervaag):
        if self.modus == "grijs":
            g = ImageOps.grayscale(im).filter(ImageFilter.GaussianBlur(max(1.5, vervaag * 1.6)))
            return ImageOps.autocontrast(g, cutoff=1)
        return randkaart(im, vervaag)

    def niveau(self, lw, vervaag, P):
        lh = round(lw * self.uit[1] / self.uit[0])
        x0, y0, bw, bh = self.box
        sleutel = (lw, vervaag)
        if sleutel not in self._cache:
            T = self.doel.crop((round(x0), round(y0), round(x0 + bw), round(y0 + bh))).resize((lw, lh), Image.LANCZOS)
            Te = self.kaart(T, vervaag)
            # de bron zo verkleinen dat hij ongeveer even groot is als het doel
            breed = math.dist(P[0], P[1])
            k = min(1.0, lw / max(breed, 1.0) * 1.15)
            S = self.bron.resize((max(8, round(self.bron.width * k)), max(8, round(self.bron.height * k))), Image.LANCZOS)
            Se = self.kaart(S, vervaag)
            wit = Image.new("L", S.size, 255)
            self._cache[sleutel] = (lh, Te, Se, wit, k, maak_masker(self.nadruk, lw, lh))
        return self._cache[sleutel]

    def score(self, P, lw, vervaag):
        lh, Te, Se, wit, k, masker = self.niveau(lw, vervaag, P)
        H = homografie(hoeken(lw, lh), [(x * k, y * k) for x, y in P])
        w = Se.transform((lw, lh), Image.PERSPECTIVE, H, Image.BILINEAR)
        m = wit.transform((lw, lh), Image.PERSPECTIVE, H, Image.NEAREST)
        dekking = ImageStat.Stat(m).mean[0] / 255.0
        if masker is None:
            return ncc(w, Te) - 2.5 * (1.0 - dekking)
        # het aangewezen deel (bv. de dorpel) telt zwaar, de rest licht
        return 0.75 * ncc(w, Te, masker) + 0.25 * ncc(w, Te) - 2.5 * (1.0 - dekking)

    def grof(self, P, lw=180, vervaag=2.5, schuif=0.2, n=9, schalen=(0.8, 0.88, 0.95, 1.0, 1.05, 1.13, 1.25), hoeken_=(-6, -3, 0, 3, 6)):
        breed = math.dist(P[0], P[1])
        beste, bP = -9, P
        for s in schalen:
            for a in hoeken_:
                Q0 = _draai(_schaal(P, s), math.radians(a))
                for i in range(n):
                    for j in range(n):
                        dx = (i - (n - 1) / 2) / ((n - 1) / 2) * schuif * breed
                        dy = (j - (n - 1) / 2) / ((n - 1) / 2) * schuif * breed
                        Q = _verschuif(Q0, dx, dy)
                        sc = self.score(Q, lw, vervaag)
                        if sc > beste:
                            beste, bP = sc, Q
        return bP, beste

    def fijn(self, P, lw, vervaag, stap=6.0, min_stap=0.3):
        lh, Te, Se, wit, k, _ = self.niveau(lw, vervaag, P)
        beste = self.score(P, lw, vervaag)
        while stap >= min_stap:
            verbeterd = False
            d = stap / k  # stap in pixels van het niveau, omgerekend naar de bron
            breed = math.dist(P[0], P[1])
            kandidaten = []
            for i in range(4):
                for j in range(2):
                    for s in (1, -1):
                        Q = [list(p) for p in P]
                        Q[i][j] += s * d
                        kandidaten.append([tuple(q) for q in Q])
            for s in (1, -1):
                kandidaten.append(_verschuif(P, s * d, 0))
                kandidaten.append(_verschuif(P, 0, s * d))
                kandidaten.append(_schaal(P, 1 + s * d / breed))
                kandidaten.append(_draai(P, s * d / breed))
            for Q in kandidaten:
                sc = self.score(Q, lw, vervaag)
                if sc > beste + 1e-6:
                    P, beste, verbeterd = Q, sc, True
            if not verbeterd:
                stap /= 2.0
        return P, beste

    def lijn_uit(self, P, grof=True, niveaus=((200, 2.5), (400, 1.8), (800, 1.2))):
        if grof:
            P, _ = self.grof(P)
        sc = None
        for lw, v in niveaus:
            P, sc = self.fijn(P, lw, v, stap=6.0 if lw <= 200 else 3.0)
        return P, sc

    def dekt(self, P):
        """Valt het hele uitvoerbeeld binnen de voorfoto?"""
        return all(0 <= x <= self.bron.width - 1 and 0 <= y <= self.bron.height - 1 for x, y in P)

    def herkader(self, P, box):
        """Hetzelfde perspectief, maar voor een ander vak in de nafoto: de nieuwe vier punten."""
        OW, OH = self.uit
        H = homografie(hoeken(OW, OH), P)
        x0, y0, bw, bh = self.box
        nx0, ny0, nbw, nbh = box
        uit = []
        for fx, fy in ((0, 0), (1, 0), (1, 1), (0, 1)):
            # punt in de nafoto -> uitvoercoördinaten van het oude vak -> voorfoto
            px, py = nx0 + fx * nbw, ny0 + fy * nbh
            uit.append(pas_toe(H, (px - x0) / bw * OW, (py - y0) / bh * OH))
        return uit

    def inpassen(self, P, marge=6, min_schaal=0.7):
        """Zoom zo weinig mogelijk in (4:3 blijft, zo veel mogelijk in het midden) tot de voorfoto
        het hele vak vult. Geeft (vak, punten, schaal)."""
        OW, OH = self.uit
        H = homografie(hoeken(OW, OH), P)
        x0, y0, bw, bh = self.box
        W, Hb = self.bron.width, self.bron.height

        def ok(sx, sy, s):
            for fx, fy in ((0, 0), (1, 0), (1, 1), (0, 1)):
                u, v = pas_toe(H, sx + fx * s * OW, sy + fy * s * OH)
                if not (marge <= u <= W - 1 - marge and marge <= v <= Hb - 1 - marge):
                    return False
            return True

        s = 1.0
        while s >= min_schaal - 1e-9:
            beste = None
            for i in range(21):
                for j in range(21):
                    sx, sy = (1 - s) * OW * i / 20, (1 - s) * OH * j / 20
                    if ok(sx, sy, s):
                        d = (i - 10) ** 2 + (j - 10) ** 2
                        if beste is None or d < beste[0]:
                            beste = (d, sx, sy)
            if beste:
                _, sx, sy = beste
                f = bw / OW
                box = (x0 + sx * f, y0 + sy * f, s * bw, s * bh)
                return box, self.herkader(P, box), s
            s -= 0.01
        return self.box, P, 1.0

    def maak(self, P):
        OW, OH = self.uit
        H = homografie(hoeken(OW, OH), P)
        voor = self.bron.transform((OW, OH), Image.PERSPECTIVE, H, Image.BICUBIC)
        x0, y0, bw, bh = self.box
        na = self.doel.crop((round(x0), round(y0), round(x0 + bw), round(y0 + bh))).resize((OW, OH), Image.LANCZOS)
        return voor, na


def overlay(voor, na, w=520):
    h = round(voor.height * w / voor.width)
    a = randkaart(voor.resize((w, h), Image.LANCZOS), 0)
    b = randkaart(na.resize((w, h), Image.LANCZOS), 0)
    return Image.merge("RGB", (a, b, b))


def blad(voor, na, titel, w=420):
    from PIL import ImageFont
    f = ImageFont.truetype("/System/Library/Fonts/Helvetica.ttc", 16)
    h = round(voor.height * w / voor.width)
    im = Image.new("RGB", (w * 4 + 30, h + 26), "white")
    d = ImageDraw.Draw(im)
    d.text((4, 4), titel, fill=(0, 0, 0), font=f)
    im.paste(voor.resize((w, h), Image.LANCZOS), (0, 26))
    im.paste(na.resize((w, h), Image.LANCZOS), (w + 10, 26))
    half = Image.blend(voor.resize((w, h), Image.LANCZOS), na.resize((w, h), Image.LANCZOS), 0.5)
    im.paste(half, (2 * w + 20, 26))
    im.paste(overlay(voor, na, w), (3 * w + 30, 26))
    return im
