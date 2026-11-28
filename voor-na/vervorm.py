"""Legt een voorfoto ook dan op een nafoto als ze niet vanuit precies hetzelfde punt zijn genomen.

Eén perspectief (uitlijn.py) kan maar één vlak goed leggen. Is de voorfoto van iets hoger genomen,
dan is de bovenkant van de dorpel groter en de voorkant kleiner, en lopen de randen in de schuif
niet door. Hier wordt de voorfoto daarom per rand op zijn plek gelegd:

1. Elke rand die op beide foto's te zien is (de bovenkant van de dorpel, de knik, de onderkant,
   de zijkanten van een stijl, de voegen van de tegels) wordt op beide foto's precies gevolgd,
   vanaf een ruwe ligging ("lijnen" in paren.py).
2. Langs de randen ontstaan zo punten die op beide foto's hetzelfde zijn. Een horizontale rand
   legt vast waar iets in de hoogte ligt, een verticale rand waar het in de breedte ligt.
3. Een thin-plate spline (een zo glad mogelijke vervorming door al die punten) legt de voorfoto
   over de nafoto; PIL vervormt hem in kleine vakjes (Image.MESH).

Alleen PIL, geen numpy of OpenCV.
"""
import math

from PIL import Image, ImageDraw, ImageFilter, ImageOps

from uitlijn import homografie, pas_toe, los

Image.MAX_IMAGE_PIXELS = None


# ---------------------------------------------------------------- randen volgen

class Werkbeeld:
    """Grijze, licht vervaagde kopie (hoogstens 2000 px) om randen in te zoeken. Alles in fracties."""

    def __init__(self, im, maat=2000):
        k = min(1.0, maat / max(im.size))
        g = ImageOps.grayscale(im)
        if k < 1:
            g = g.resize((round(im.width * k), round(im.height * k)), Image.LANCZOS)
        self.g = g.filter(ImageFilter.GaussianBlur(1.2)).convert("F")
        self.W, self.H = self.g.size

    def profiel(self, soort, plek, van, tot, breedte):
        """Gemiddelde helderheid dwars op de rand. soort "h": een kolom (rand loopt horizontaal)."""
        if soort == "h":
            x = plek * self.W
            w = max(2, breedte * self.W)
            a, b = max(0, round(van * self.H)), min(self.H, round(tot * self.H))
            s = self.g.crop((round(x - w), a, round(x + w) + 1, b)).resize((1, b - a), Image.BOX)
            return a, list(s.getdata()), self.H
        y = plek * self.H
        w = max(2, breedte * self.H)
        a, b = max(0, round(van * self.W)), min(self.W, round(tot * self.W))
        s = self.g.crop((a, round(y - w), b, round(y + w) + 1)).resize((b - a, 1), Image.BOX)
        return a, list(s.getdata()), self.W


def _piek(waarden, teken):
    """Index van het sterkste punt (teken +1: hoogste, -1: laagste, 0: grootste afwijking), op een
    tiende pixel nauwkeurig (parabool door de top)."""
    if teken == 0:
        m = sum(waarden) / len(waarden)
        w = [abs(v - m) for v in waarden]
    else:
        w = [teken * v for v in waarden]
    i = max(range(len(w)), key=lambda k: w[k])
    if 0 < i < len(w) - 1:
        a, b, c = w[i - 1], w[i], w[i + 1]
        d = a - 2 * b + c
        if d < 0:
            return i + 0.5 * (a - c) / d, w[i]
    return float(i), w[i]


def zoek(wb, soort, plek, gok, straal, teken, rug=False, breedte=0.006, dikte=0.0):
    """Waar ligt de rand op deze kolom (soort "h") of rij (soort "v")? rug=True: een lichte of donkere
    lijn (een voeg) in plaats van een overgang; dan het midden van de lijn (dikte: ongeveer hoe dik
    de lijn is, als fractie van de foto)."""
    a, p, N = wb.profiel(soort, plek, gok - straal, gok + straal, breedte)
    if len(p) < 7:
        return None
    if rug:
        k = max(2, round(dikte * N / 2.5))
        z = [sum(p[max(0, i - k):i + k + 1]) / len(p[max(0, i - k):i + k + 1]) for i in range(len(p))]
        i, sterkte = _piek(z, teken)
    else:
        g = [0.0, 0.0] + [(p[i + 2] - p[i - 2]) / 4.0 for i in range(2, len(p) - 2)] + [0.0, 0.0]
        i, sterkte = _piek(g[2:-2], teken)
        i += 2
    if i < 2 or i > len(p) - 3:
        return None  # tegen de rand van het zoekgebied: niet betrouwbaar
    return (a + i + 0.5) / N, sterkte


def _fit(punten, graad=2, gewichten=None):
    """Kleinste kwadraten: y = c0 + c1 t + c2 t^2."""
    n = graad + 1
    A = [[0.0] * n for _ in range(n)]
    b = [0.0] * n
    for k, (t, y) in enumerate(punten):
        w = gewichten[k] if gewichten else 1.0
        m = [t ** j for j in range(n)]
        for i in range(n):
            b[i] += w * m[i] * y
            for j in range(n):
                A[i][j] += w * m[i] * m[j]
    return los(A, b)


class Lijn:
    """Een gevolgde rand: dwars = c0 + c1 * langs + c2 * langs^2 (fracties van de foto). verleng: zo ver
    mag de lijn buiten het gevolgde stuk doorgetrokken worden (een rechte rand die ergens slecht te
    zien is, bv. achter een kabel)."""

    def __init__(self, soort, c, van, tot, punten, verleng=0.0):
        self.soort, self.c, self.van, self.tot, self.punten = soort, c, van, tot, punten
        self.verleng = verleng

    def binnen(self, t, extra=0.0):
        return self.van - self.verleng - extra <= t <= self.tot + self.verleng + extra

    def __call__(self, t):
        return self.c[0] + self.c[1] * t + self.c[2] * t * t

    def xy(self, t):
        return (t, self(t)) if self.soort == "h" else (self(t), t)


def volg(wb, soort, p0, p1, teken=0, straal=0.012, stap=0.008, rug=False, graad=2, breedte=0.006, dikte=0.0,
         verleng=0.0):
    """Volg een rand van ongeveer p0 naar p1 (fracties (x, y)). soort "h": loopt van links naar rechts."""
    if soort == "h":
        (t0, d0), (t1, d1) = p0, p1
    else:
        (d0, t0), (d1, t1) = p0, p1
    if t1 < t0:
        t0, d0, t1, d1 = t1, d1, t0, d0
    punten, sterktes = [], []
    n = max(2, int((t1 - t0) / stap))
    for k in range(n + 1):
        t = t0 + (t1 - t0) * k / n
        gok = d0 + (d1 - d0) * (t - t0) / (t1 - t0)
        r = zoek(wb, soort, t, gok, straal, teken, rug, breedte, dikte)
        if r:
            punten.append((t, r[0]))
            sterktes.append(r[1])
    if len(punten) < 5:
        raise ValueError("rand niet gevonden bij %s-%s" % (p0, p1))
    # zwakke punten (textuur, beschadiging) eruit, dan robuust passen
    grens = sorted(sterktes)[len(sterktes) // 2] * 0.35
    punten = [p for p, s in zip(punten, sterktes) if s >= grens]
    g = graad if len(punten) >= 8 else 1
    for _ in range(4):
        c = _fit(punten, g)
        if g == 1:
            c = c + [0.0]
        res = [abs(y - (c[0] + c[1] * t + c[2] * t * t)) for t, y in punten]
        mad = sorted(res)[len(res) // 2]
        grens = max(3.0 * mad, 0.0012)
        goed = [p for p, r in zip(punten, res) if r <= grens]
        if len(goed) == len(punten) or len(goed) < 5:
            break
        punten = goed
    c = _fit(punten, g)
    if g == 1:
        c = c + [0.0]
    return Lijn(soort, c, min(t for t, _ in punten), max(t for t, _ in punten), punten, verleng)


def met_de_hand(soort, punten):
    """Een lijn door opgemeten punten (fracties (x, y)); recht bij twee punten."""
    pt = [((x, y) if soort == "h" else (y, x)) for x, y in punten]
    g = min(2, len(pt) - 1)
    c = _fit(pt, g)
    c = c + [0.0] * (3 - len(c))
    return Lijn(soort, c, min(t for t, _ in pt), max(t for t, _ in pt), pt)


# ---------------------------------------------------------------- thin-plate spline

def los_meer(A, B):
    """A X = B (Gauss met rijwisseling), voor meerdere rechterkanten tegelijk."""
    n, m = len(A), len(B[0])
    M = [list(map(float, A[i])) + list(map(float, B[i])) for i in range(n)]
    for c in range(n):
        p = max(range(c, n), key=lambda r: abs(M[r][c]))
        M[c], M[p] = M[p], M[c]
        rij = M[c]
        piv = rij[c]
        if abs(piv) < 1e-14:
            raise ValueError("singulier")
        staart = rij[c:]
        for r in range(c + 1, n):
            Mr = M[r]
            f = Mr[c] / piv
            if f:
                M[r] = Mr[:c] + [a - f * b for a, b in zip(Mr[c:], staart)]
    X = [[0.0] * m for _ in range(n)]
    for i in range(n - 1, -1, -1):
        Mi = M[i]
        for j in range(m):
            X[i][j] = (Mi[n + j] - sum(Mi[k] * X[k][j] for k in range(i + 1, n))) / Mi[i]
    return X


def _U(r2):
    return r2 * math.log(r2) if r2 > 1e-12 else 0.0


class Tps:
    """Gladde vervorming door punten: (x, y) in het uitvoerbeeld -> (u, v) in de voorfoto."""

    def __init__(self, van, naar, schaal, lam=1e-6):
        self.s = schaal
        self.p = [(x / schaal, y / schaal) for x, y in van]
        n = len(self.p)
        M = [[0.0] * (n + 3) for _ in range(n + 3)]
        for i in range(n):
            xi, yi = self.p[i]
            for j in range(i + 1, n):
                xj, yj = self.p[j]
                M[i][j] = M[j][i] = _U((xi - xj) ** 2 + (yi - yj) ** 2)
            M[i][i] = lam
            M[i][n], M[i][n + 1], M[i][n + 2] = 1.0, xi, yi
            M[n][i], M[n + 1][i], M[n + 2][i] = 1.0, xi, yi
        X = los_meer(M, [[u, v] for u, v in naar] + [[0.0, 0.0]] * 3)
        self.wu = [r[0] for r in X]
        self.wv = [r[1] for r in X]

    def __call__(self, x, y):
        x, y = x / self.s, y / self.s
        n = len(self.p)
        u = self.wu[n] + self.wu[n + 1] * x + self.wu[n + 2] * y
        v = self.wv[n] + self.wv[n + 1] * x + self.wv[n + 2] * y
        for i, (px, py) in enumerate(self.p):
            k = _U((x - px) ** 2 + (y - py) ** 2)
            u += self.wu[i] * k
            v += self.wv[i] * k
        return u, v


class Homografie:
    def __init__(self, van, naar):
        self.H = homografie(van, naar)

    def __call__(self, x, y):
        return pas_toe(self.H, x, y)


# ---------------------------------------------------------------- vervormen

def rooster(f, uit, cel):
    OW, OH = uit
    nx, ny = OW // cel, OH // cel
    xs = [OW * i / nx for i in range(nx + 1)]
    ys = [OH * j / ny for j in range(ny + 1)]
    return xs, ys, [[f(x, y) for x in xs] for y in ys]


def vouwt(xs, ys, R, waar=False):
    """Kleinste Jacobiaan-determinant (<= 0: de vervorming klapt ergens om); waar=True: ook de plek."""
    m, plek = float("inf"), None
    for j in range(len(ys) - 1):
        for i in range(len(xs) - 1):
            (u0, v0), (u1, v1), (u2, v2) = R[j][i], R[j][i + 1], R[j + 1][i]
            d = (u1 - u0) * (v2 - v0) - (v1 - v0) * (u2 - u0)
            if d < m:
                m, plek = d, (xs[i], ys[j])
    return (m, plek) if waar else m


def vervorm(bron, f, uit=(1600, 1200), cel=12):
    """De voorfoto volgens f in het uitvoerbeeld leggen. Eerst zo ver verkleind (LANCZOS) dat hij niet
    veel groter is dan nodig, zodat het vervormen geen trapjes of moiré geeft."""
    OW, OH = uit
    xs, ys, R = rooster(f, uit, cel)
    # schaal: bronpixels per uitvoerpixel, in het midden
    j, i = len(ys) // 2, len(xs) // 2
    d = math.dist(R[j][i], R[j][i + 1]) / (xs[1] - xs[0])
    k = min(1.0, 1.3 / d) if d > 0 else 1.0
    b = bron if k >= 0.999 else bron.resize((round(bron.width * k), round(bron.height * k)), Image.LANCZOS)
    data = []
    for j in range(len(ys) - 1):
        for i in range(len(xs) - 1):
            nw, ne = R[j][i], R[j][i + 1]
            sw, se = R[j + 1][i], R[j + 1][i + 1]
            quad = tuple(c * k for p in (nw, sw, se, ne) for c in p)
            data.append(((round(xs[i]), round(ys[j]), round(xs[i + 1]), round(ys[j + 1])), quad))
    return b.transform((OW, OH), Image.MESH, data, Image.BICUBIC), (xs, ys, R)


def dekt(bron, xs, ys, R, marge=4):
    W, H = bron.size
    rand = R[0] + R[-1] + [r[0] for r in R] + [r[-1] for r in R]
    return all(marge <= u <= W - 1 - marge and marge <= v <= H - 1 - marge for u, v in rand)


# ---------------------------------------------------------------- de punten tussen de foto's

class Koppeling:
    """lijnen: [(soort, voor_p0, voor_p1, na_p0, na_p1, opties)], met p in fracties van elke hele foto.
    vak: (x0, y0, b, h) in pixels van de nafoto; uit: maat van het uitvoerbeeld."""

    def __init__(self, voor, na, vak, lijnen, uit=(1600, 1200)):
        self.voor, self.na, self.vak, self.uit = voor, na, vak, uit
        wv, wn = Werkbeeld(voor), Werkbeeld(na)
        self.lijnen = []
        self.opties = {}
        for soort, v0, v1, n0, n1, opt in lijnen:
            opt = dict(opt or {})
            naam = opt.pop("naam", "%s %s" % (soort, n0))
            # reik_voor / reik_na: tot waar de lijn echt loopt (bv. een stijl tot zijn onderkant),
            # ook als hij daar niet overal te volgen is; de gevolgde lijn wordt tot daar doorgetrokken
            reik = {"voor": opt.pop("reik_voor", None), "na": opt.pop("reik_na", None)}
            # punten_voor / punten_na: een rand die niet te volgen is (te weinig verschil met wat ernaast
            # ligt), met de hand opgemeten
            hand = {"voor": opt.pop("punten_voor", None), "na": opt.pop("punten_na", None)}
            # schuif_voor / schuif_na: de gevonden rand een vast stukje verleggen, als de scherpste
            # overgang niet de rand is die je ziet (bv. beton dat net onder de dorpel in de schaduw ligt)
            schuif = {"voor": opt.pop("schuif_voor", 0.0), "na": opt.pop("schuif_na", 0.0)}
            lv = met_de_hand(soort, hand["voor"]) if hand["voor"] else volg(wv, soort, v0, v1, **opt)
            ln = met_de_hand(soort, hand["na"]) if hand["na"] else volg(wn, soort, n0, n1, **opt)
            for kant, l in (("voor", lv), ("na", ln)):
                if reik[kant]:
                    l.van, l.tot = reik[kant]
                    l.verleng = 0.0
                if schuif[kant]:
                    l.c = [l.c[0] + schuif[kant]] + list(l.c[1:])
            self.lijnen.append((naam, soort, lv, ln))
            self.opties[naam] = opt

    # omrekenen
    def na_uit(self, fx, fy):
        x0, y0, b, h = self.vak
        return ((fx * self.na.width - x0) / b * self.uit[0], (fy * self.na.height - y0) / h * self.uit[1])

    def uit_na(self, x, y):
        x0, y0, b, h = self.vak
        return ((x0 + x / self.uit[0] * b) / self.na.width, (y0 + y / self.uit[1] * h) / self.na.height)

    def voor_px(self, fx, fy):
        return fx * self.voor.width, fy * self.voor.height

    def px_voor(self, u, v):
        return u / self.voor.width, v / self.voor.height

    @staticmethod
    def _snijpunt(a, b, marge=0.004):
        """Snijpunt van een horizontale (a) en een verticale (b) gevolgde lijn, als ze elkaar echt raken."""
        t = 0.5
        for _ in range(30):
            x = b(t)          # verticale lijn: x als functie van y
            y = a(x)          # horizontale lijn: y als functie van x
            if abs(y - t) < 1e-9:
                break
            t = y
        x, y = b(t), a(b(t))
        if a.binnen(x, marge) and b.binnen(y, marge):
            return x, y
        return None

    def snijpunten(self):
        uit = []
        hor = [(n, lv, ln) for n, s, lv, ln in self.lijnen if s == "h"]
        ver = [(n, lv, ln) for n, s, lv, ln in self.lijnen if s == "v"]
        for nh, hv, hn in hor:
            for nv, vv, vn in ver:
                a, b = self._snijpunt(hv, vv), self._snijpunt(hn, vn)
                if a and b:
                    uit.append(((nh, nv), self.na_uit(*b), self.voor_px(*a)))
        # twee snijpunten op (bijna) dezelfde plek (drie lijnen die in één hoek samenkomen): samenvoegen,
        # anders trekt de vervorming op één plek twee kanten op
        samen = []
        for naam, a, b in uit:
            for i, (n2, a2, b2, k) in enumerate(samen):
                if math.dist(a, a2) < 8:
                    samen[i] = (n2 + naam, ((a2[0] * k + a[0]) / (k + 1), (a2[1] * k + a[1]) / (k + 1)),
                                ((b2[0] * k + b[0]) / (k + 1), (b2[1] * k + b[1]) / (k + 1)), k + 1)
                    break
            else:
                samen.append((naam, a, b, 1))
        return [(n, a, b) for n, a, b, _ in samen]

    def _ver_x(self, ln):
        """Verticale lijn van de nafoto: x in het uitvoerbeeld bij een y, of None buiten de lijn."""
        def x_bij(y):
            _, fy = self.uit_na(0, y)
            if not ln.binnen(fy, 0.003):
                return None
            return self.na_uit(ln(fy), fy)[0]
        return x_bij

    def _hor_y(self, ln):
        def y_bij(x):
            fx, _ = self.uit_na(x, 0)
            if not ln.binnen(fx, 0.003):
                return None
            return self.na_uit(fx, ln(fx))[1]
        return y_bij

    def punten(self, fu, fv, stap=40, afstand=18):
        """Punten (uitvoer -> voorfoto) langs alle lijnen. Een horizontale lijn bepaalt de hoogte: waar
        het punt in de breedte valt komt uit fu (de schatting uit de verticale lijnen). Een verticale
        lijn bepaalt de breedte, de hoogte komt uit fv (de schatting uit de horizontale lijnen). Zo
        trekt een schuine lijn (de rand van een dorpel in een hoek) zijn punten niet naar de verkeerde
        plek langs de lijn. Geeft (snijpunten, punten op horizontale lijnen, op verticale lijnen)."""
        OW, OH = self.uit
        sn_lijst = [(a, b) for _, a, b in self.snijpunten()]
        sn = [a for a, _ in sn_lijst]
        hp, vp = [], []
        ver = [self._ver_x(ln) for _, s, _, ln in self.lijnen if s == "v"]
        hor = [self._hor_y(ln) for _, s, _, ln in self.lijnen if s == "h"]

        def dichtbij(waarden, w, p):
            # vlak bij een kruisende lijn of een snijpunt: daar beslist het snijpunt
            if any(math.dist(p, q) < 2 * afstand for q in sn):
                return True
            return any(v is not None and abs(v - w) < afstand for v in waarden)

        for naam, soort, lv, ln in self.lijnen:
            if soort == "h":
                y_bij = self._hor_y(ln)
                for k in range(0, OW + 1, stap):
                    x = float(k)
                    y = y_bij(x)
                    if y is None or not (-OH * 0.02 <= y <= OH * 1.02):
                        continue
                    if dichtbij([g(y) for g in ver], x, (x, y)):
                        continue
                    f_u = fu(x, y)[0] / self.voor.width
                    if not lv.binnen(f_u, 0.01):
                        continue
                    hp.append(((x, y), self.voor_px(f_u, lv(f_u))))
            else:
                x_bij = self._ver_x(ln)
                for k in range(0, OH + 1, stap):
                    y = float(k)
                    x = x_bij(y)
                    if x is None or not (-OW * 0.02 <= x <= OW * 1.02):
                        continue
                    if dichtbij([g(x) for g in hor], y, (x, y)):
                        continue
                    f_v = fv(x, y)[1] / self.voor.height
                    if not lv.binnen(f_v, 0.01):
                        continue
                    vp.append(((x, y), self.voor_px(lv(f_v), f_v)))
        return sn_lijst, hp, vp

    def start(self):
        """Eerste schatting. Met vier of meer snijpunten een perspectief daardoor; anders een rechte
        schaling: de hoogte uit de horizontale lijnen, de breedte uit de verticale (of, met minder dan
        twee verticale lijnen, dezelfde schaal als de hoogte)."""
        sn = self.snijpunten()
        if len(sn) >= 4:
            return Homografie([a for _, a, _ in sn], [b for _, _, b in sn])

        def lijnfit(paren):
            n = len(paren)
            mx = sum(a for a, _ in paren) / n
            my = sum(b for _, b in paren) / n
            sxx = sum((a - mx) ** 2 for a, _ in paren)
            k = sum((a - mx) * (b - my) for a, b in paren) / sxx
            return k, my - k * mx

        hy, vx = [], []
        for naam, soort, lv, ln in self.lijnen:
            tm_n, tm_v = (ln.van + ln.tot) / 2, (lv.van + lv.tot) / 2
            if soort == "h":
                hy.append((self.na_uit(tm_n, ln(tm_n))[1], self.voor_px(tm_v, lv(tm_v))[1]))
            else:
                vx.append((self.na_uit(ln(tm_n), tm_n)[0], self.voor_px(lv(tm_v), tm_v)[0]))
        a, b = lijnfit(hy)
        if len(vx) >= 2:
            c, d = lijnfit(vx)
        else:
            c = a
            d = (vx[0][1] - c * vx[0][0]) if vx else self.voor.width / 2 - c * self.uit[0] / 2
        return lambda x, y: (c * x + d, a * y + b)

    def maak(self, rondes=4, lam=1e-6, stap=40, afstand=18, start=None):
        f = start or self.start()
        fu = fv = f
        OW, OH = self.uit
        for _ in range(rondes):
            sn, hp, vp = self.punten(fu, fv, stap, afstand)
            alles = sn + hp + vp
            # ankers in de hoeken van het beeld (uit de vorige schatting) houden de deelschattingen recht
            ankers = [((x, y), f(x, y)) for x in (0.0, float(OW)) for y in (0.0, float(OH))]
            nieuw = Tps([a for a, _ in alles], [b for _, b in alles], OW, lam)

            def deel(punten):
                xs = [a[0] for a, _ in punten]
                ys = [a[1] for a, _ in punten]
                if len(punten) < 3 or max(xs) - min(xs) < OW * 0.05 or max(ys) - min(ys) < OH * 0.05:
                    return nieuw
                p = punten + ankers
                return Tps([a for a, _ in p], [b for _, b in p], OW, lam)

            fu, fv, f = deel(sn + vp), deel(sn + hp), nieuw
        self.f, self.van, self.naar = f, [a for a, _ in alles], [b for _, b in alles]
        return f

    def na_beeld(self):
        x0, y0, b, h = self.vak
        return self.na.crop((round(x0), round(y0), round(x0 + b), round(y0 + h))).resize(self.uit, Image.LANCZOS)

    def afwijking(self, voor_uit, details=False):
        """Hoe ver liggen de randen van de vervormde voorfoto nog van die van de nafoto (in pixels
        van het uitvoerbeeld)? Per lijn: gemiddeld en grootst."""
        wv = Werkbeeld(voor_uit, maat=max(self.uit))
        OW, OH = self.uit
        uit = []
        for naam, soort, lv, ln in self.lijnen:
            d = []
            o = self.opties.get(naam, {})
            zk = dict(teken=o.get("teken", 0), rug=o.get("rug", False), dikte=o.get("dikte", 0.0))
            if soort == "h":
                for k in range(0, OW + 1, 20):
                    fx, _ = self.uit_na(k, 0)
                    if not ln.binnen(fx):
                        continue
                    _, y = self.na_uit(fx, ln(fx))
                    if not (4 <= y <= OH - 4):
                        continue
                    r = zoek(wv, "h", k / OW, y / OH, 0.02, zk["teken"], zk["rug"], 0.006, zk["dikte"])
                    if r:
                        d.append((r[0] * OH - y, k))
            else:
                for k in range(0, OH + 1, 20):
                    _, fy = self.uit_na(0, k)
                    if not ln.binnen(fy):
                        continue
                    x, _ = self.na_uit(ln(fy), fy)
                    if not (4 <= x <= OW - 4):
                        continue
                    r = zoek(wv, "v", k / OH, x / OW, 0.02, zk["teken"], zk["rug"], 0.006,
                             zk["dikte"] * self.na.width / self.vak[2])
                    if r:
                        d.append((r[0] * OW - x, k))
            if d:
                w = sorted(v for v, _ in d)
                r = (naam, len(d), sum(abs(v) for v in w) / len(w), max(abs(v) for v in w), w[len(w) // 2])
                uit.append(r + (d,) if details else r)
        return uit


# ---------------------------------------------------------------- controle

def controle(voor, na, standen=(0.3, 0.5, 0.7), breed=640):
    """De schuif op een paar standen naast elkaar, met een rode lijn op de naad."""
    h = round(voor.height * breed / voor.width)
    v, a = voor.resize((breed, h), Image.LANCZOS), na.resize((breed, h), Image.LANCZOS)
    blad = Image.new("RGB", (len(standen) * (breed + 10) - 10, h), "white")
    for k, pos in enumerate(standen):
        x = round(breed * pos)
        s = a.copy()
        s.paste(v.crop((0, 0, x, h)), (0, 0))
        ImageDraw.Draw(s).line([(x, 0), (x, h)], fill=(255, 0, 0), width=1)
        blad.paste(s, (k * (breed + 10), 0))
    return blad


def randen_over_elkaar(voor, na, breed=1000):
    """Randen van de voorfoto rood, van de nafoto cyaan: waar ze samenvallen wordt het grijs/wit."""
    from uitlijn import randkaart
    h = round(voor.height * breed / voor.width)
    a = randkaart(voor.resize((breed, h), Image.LANCZOS), 0)
    b = randkaart(na.resize((breed, h), Image.LANCZOS), 0)
    return Image.merge("RGB", (a, b, b))
