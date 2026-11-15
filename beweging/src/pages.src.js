
  /* ====================================================================== PAGINA'S
   * Animaties voor losse pagina's van iwrap.nl. Ontwerpruimte 1200 x 900 (4:3).
   * Ze spelen één keer af zodra ze in beeld komen en blijven staan op een eindbeeld
   * dat zonder beweging ook alles vertelt. Rechtsonder verschijnt dan een knop om opnieuw af te spelen.
   * ====================================================================== */

  var PW = 1200, PH = 900;
  var GREEN = '#4C9F70', GREY = '#D6D3CB', LINE = '#E3E1DB', NEWCREAM = '#F3E9D4', WHITE = '#FFFFFF';

  function PageStage(o, label, bg) {
    var W = o.frame ? o.frame[0] : PW, H = o.frame ? o.frame[1] : PH, s = Math.min(W / PW, H / PH);
    var st = Stage({ frame: o.frame, label: label }, W, H, theme({ theme: 'light' }));
    Rc(st.svg, 0, 0, W, H, 0, bg || K.paper);
    var root = G(st.svg, { transform: 'translate(' + f((W - PW * s) / 2) + ' ' + f((H - PH * s) / 2) + ') scale(' + f(s) + ')' });
    return { st: st, root: root };
  }
  function Card(p, x, y, w, h, r) {
    var g = G(p);
    Rc(g, x, y + 10, w, h, r || 28, '#22262A', { opacity: 0.07 });
    Rc(g, x, y, w, h, r || 28, WHITE);
    return g;
  }
  // vinkje of kruisje in een rondje; middelpunt op (0,0)
  function Badge(p, r, bg, kind) {
    var g = G(p), w = f(r * 0.24);
    Ci(g, 0, 0, r, bg || K.mintDeep);
    if (kind === 'x') {
      var a = f(r * 0.36);
      Pa(g, 'M' + (-a) + ' ' + (-a) + 'L' + a + ' ' + a + 'M' + a + ' ' + (-a) + 'L' + (-a) + ' ' + a, 'none', { stroke: WHITE, 'stroke-width': w, 'stroke-linecap': 'round' });
    } else Pa(g, 'M' + f(-r * 0.42) + ' ' + f(r * 0.02) + 'l' + f(r * 0.3) + ' ' + f(r * 0.32) + 'l' + f(r * 0.56) + ' ' + f(-r * 0.66), 'none', { stroke: WHITE, 'stroke-width': w, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' });
    return g;
  }
  function place(n, x, y, s, rot) {
    if (s != null && s <= 0.001) { show(n, false); return; }
    show(n, true);
    sa(n, 'transform', 'translate(' + f(x) + ' ' + f(y) + ')' + (rot ? ' rotate(' + f(rot) + ')' : '') + (s != null && s !== 1 ? ' scale(' + f(s) + ')' : ''));
  }
  function ReplayBtn(p) {
    var g = G(p, { role: 'button', tabindex: '0', 'aria-label': 'Opnieuw afspelen', style: 'cursor:pointer' });
    Ci(g, 0, 0, 30, WHITE, { stroke: LINE, 'stroke-width': 2 });
    Pa(g, 'M9.2 -6.4A11.2 11.2 0 1 0 11 2.2', 'none', { stroke: K.ink, 'stroke-width': 3.4, 'stroke-linecap': 'round' });
    Pa(g, 'M3.4 -8.6L10 -7.2L10.4 -0.4', 'none', { stroke: K.ink, 'stroke-width': 3.4, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' });
    return g;
  }
  function pageScene(ps, rest, render, o) {
    var btn = null;
    if (o.ui !== false) { btn = ReplayBtn(ps.root); place(btn, 1150, 852); }
    return {
      svg: ps.st.svg, duration: rest + (o.hold != null ? o.hold : 2.5), rest: rest, posterT: rest, replayBtn: btn,
      render: function (t) { render(t); if (btn) op(btn, seg(t, rest - 0.1, 0.4)); }
    };
  }
  function brick(st, scale, color) {
    var id = st.id + 'bk' + (++uid), w = 64 * scale, h = 32 * scale, m = 1.6 * scale;
    var bp = el('pattern', { id: id, patternUnits: 'userSpaceOnUse', width: f(w), height: f(h) }, st.defs);
    Rc(bp, 0, 0, w, h, 0, color || K.brick);
    Rc(bp, 0, 0, w, m, 0, WHITE, { opacity: 0.2 }); Rc(bp, 0, h / 2, w, m, 0, WHITE, { opacity: 0.2 });
    Rc(bp, 0, 0, m, h / 2, 0, WHITE, { opacity: 0.2 }); Rc(bp, w / 2, h / 2, m, h / 2, 0, WHITE, { opacity: 0.2 });
    Rc(bp, 6 * scale, 4 * scale, 22 * scale, 9 * scale, 1, '#000000', { opacity: 0.05 });
    Rc(bp, 38 * scale, 20 * scale, 20 * scale, 9 * scale, 1, WHITE, { opacity: 0.06 });
    return 'url(#' + id + ')';
  }
  function glassFill(st) {
    if (st.__glass) return st.__glass;
    var id = st.id + 'gl', gg = el('linearGradient', { id: id, x1: 0, y1: 0, x2: 0, y2: 1 }, st.defs);
    el('stop', { offset: 0, 'stop-color': K.glass1 }, gg); el('stop', { offset: 1, 'stop-color': K.glass2 }, gg);
    return (st.__glass = 'url(#' + id + ')');
  }
  // glas met twee schuine lichtstrepen onder de hoek van het logo
  function glassRect(st, p, x, y, w, h) {
    Rc(p, x, y, w, h, 2, glassFill(st));
    var cid = st.id + 'gc' + (++uid), cp = el('clipPath', { id: cid }, st.defs);
    Rc(cp, x, y, w, h, 2);
    var g = G(p, { 'clip-path': 'url(#' + cid + ')' });
    [[0.1, 0.24, 0.36], [0.46, 0.08, 0.26]].forEach(function (r) {
      var a = x + w * r[0] - 0.5 * h * COT, b = w * r[1];
      Pa(g, 'M' + f(a) + ' ' + f(y) + 'L' + f(a + b) + ' ' + f(y) + 'L' + f(a + b + h * COT) + ' ' + f(y + h) + 'L' + f(a + h * COT) + ' ' + f(y + h) + 'Z', WHITE, { opacity: r[2] });
    });
  }
  function rrD(x, y, w, h, r) {
    return 'M' + f(x + r) + ' ' + f(y) + 'h' + f(w - 2 * r) + 'a' + r + ' ' + r + ' 0 0 1 ' + r + ' ' + r + 'v' + f(h - 2 * r) +
      'a' + r + ' ' + r + ' 0 0 1 ' + (-r) + ' ' + r + 'h' + f(-(w - 2 * r)) + 'a' + r + ' ' + r + ' 0 0 1 ' + (-r) + ' ' + (-r) +
      'v' + f(-(h - 2 * r)) + 'a' + r + ' ' + r + ' 0 0 1 ' + r + ' ' + (-r) + 'Z';
  }
  function frameD(x, y, w, h, holes, r) { return rrD(x, y, w, h, r || 5) + holes.map(function (q) { return rrD(q[0], q[1], q[2], q[3], 2.5); }).join(''); }
  // verweerde folie, alleen op de profielen (t = dikte van het profiel): vlekken, haarscheurtjes en gele lijm
  function weather(p, x, y, w, h, seed, t) {
    var r = rng(seed || 3), i, k;
    t = t || 16;
    for (i = 0; i < 2; i++) el('ellipse', { cx: f(x + w * (0.18 + 0.6 * r())), cy: f(y + h - t / 2), rx: f(w * (0.06 + 0.05 * r())), ry: f(t * 0.28), fill: K.creamOldDark, opacity: 0.5 }, p);
    el('ellipse', { cx: f(x + w * (0.3 + 0.4 * r())), cy: f(y + t / 2), rx: f(w * 0.08), ry: f(t * 0.24), fill: K.creamOldDark, opacity: 0.4 }, p);
    el('ellipse', { cx: f(x + t / 2), cy: f(y + h * (0.35 + 0.3 * r())), rx: f(t * 0.26), ry: f(h * 0.07), fill: K.creamOldDark, opacity: 0.4 }, p);
    for (i = 0; i < 2; i++) {
      var cx = x + w * (0.15 + 0.55 * r()), cy = y + h - t * (0.3 + 0.4 * r()), d = 'M' + f(cx) + ' ' + f(cy);
      for (k = 0; k < 3; k++) { cx += 5 + 7 * r(); cy = clamp(cy + (r() - 0.5) * t * 0.6, y + h - t + 2, y + h - 2); d += 'L' + f(cx) + ' ' + f(cy); }
      Pa(p, d, 'none', { stroke: '#8E7C55', 'stroke-width': 1.5, 'stroke-linejoin': 'round', opacity: 0.85 });
    }
    Rc(p, x + w * (0.3 + 0.4 * r()), y + h - t * 0.62, 14 + 10 * r(), t * 0.32, 2, K.glue);
  }
  // punt op een gebroken lijn, q = 0..1 (op lengte)
  function polyAt(pts, q) {
    var L = 0, i, seglen = [];
    for (i = 1; i < pts.length; i++) { var d = Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]); seglen.push(d); L += d; }
    var want = clamp(q, 0, 1) * L;
    for (i = 0; i < seglen.length; i++) {
      if (want <= seglen[i] || i === seglen.length - 1) {
        var k = seglen[i] ? clamp(want / seglen[i], 0, 1) : 0;
        return [lerp(pts[i][0], pts[i + 1][0], k), lerp(pts[i][1], pts[i + 1][1], k)];
      }
      want -= seglen[i];
    }
    return pts[pts.length - 1];
  }
  function polyD(pts, close) { return 'M' + pts.map(function (p) { return f(p[0]) + ' ' + f(p[1]); }).join('L') + (close ? 'Z' : ''); }
  function Sparks(p, list, size) {
    return list.map(function (q) { return { x: q[0], y: q[1], n: Pa(p, 'M0 -16Q2 -2 16 0Q2 2 0 16Q-2 2 -16 0Q-2 -2 0 -16Z', WHITE) }; });
  }
  function sparks(list, t, t0, dur, size) {
    list.forEach(function (s, j) {
      var q = (t - t0 - j * 0.16) / (dur || 1.1);
      if (q <= 0 || q >= 1) { show(s.n, false); return; }
      place(s.n, s.x, s.y, Math.sin(Math.PI * q) * (size || 1.1), q * 90);
    });
  }
  // tekstpil die van tekst wisselt (onderschrift binnen een animatie)
  function Caption(p, list, cx, cy, w) {
    var g = G(p);
    Rc(g, cx - w / 2, cy - 33 + 8, w, 66, 33, '#22262A', { opacity: 0.08 });
    var bg = Rc(g, cx - w / 2, cy - 33, w, 66, 33, WHITE);
    Ci(g, cx - w / 2 + 34, cy, 9, K.mint);
    var items = list.map(function (c) { return { c: c, n: Tx(g, c.text, cx + 12, cy + 9, 26, 600, K.ink, 'middle') }; });
    return function (t) {
      op(g, seg(t, list[0].t0 - 0.2, 0.4));
      items.forEach(function (it) {
        var a = Math.min(seg(t, it.c.t0, 0.35), it.c.t1 != null ? 1 - seg(t, it.c.t1 - 0.3, 0.3) : 1);
        op(it.n, a); sa(it.n, 'transform', 'translate(0 ' + f(10 * (1 - E.out(seg(t, it.c.t0, 0.5)))) + ')');
      });
    };
  }

  /* ---------------------------------------------------------------- 1. WERKGEBIED
   * Kaart met alle plaatsen waar iWrap gewerkt heeft. Per regio komen aanvragen binnen,
   * die worden gebundeld tot één rit vanuit Hilversum. Loopt door drie regio's heen.
   */
  var PLACES = [['Hilversum', 5.176, 52.224], ['Amsterdam', 4.895, 52.370], ['Haarlem', 4.646, 52.387], ['Alkmaar', 4.749, 52.632], ['Hoorn', 5.059, 52.642],
    ['Amstelveen', 4.864, 52.308], ['Purmerend', 4.959, 52.505], ['Utrecht', 5.122, 52.091], ['Amersfoort', 5.387, 52.156], ['Maartensdijk', 5.174, 52.155],
    ['Veenendaal', 5.555, 52.028], ['Zeist', 5.233, 52.089], ['Nieuwegein', 5.083, 52.029], ['Putten', 5.607, 52.259], ['Apeldoorn', 5.970, 52.211],
    ['Arnhem', 5.911, 51.985], ['Nijmegen', 5.865, 51.842], ['Ede', 5.666, 52.040], ['Harderwijk', 5.620, 52.342], ['Zutphen', 6.196, 52.143],
    ['Rotterdam', 4.479, 51.922], ['Den Haag', 4.300, 52.070], ['Leiden', 4.497, 52.160], ['Dordrecht', 4.690, 51.813], ['Gouda', 4.708, 52.011],
    ['Zoetermeer', 4.493, 52.061], ['Eindhoven', 5.479, 51.441], ['Tilburg', 5.091, 51.556], ['Breda', 4.776, 51.589], ['Den Bosch', 5.305, 51.690],
    ['Langenboom', 5.718, 51.716], ['Helmond', 5.661, 51.481], ['Middelburg', 3.611, 51.499], ['Vlissingen', 3.573, 51.442], ['Goes', 3.889, 51.504],
    ['Terneuzen', 3.828, 51.336], ['Zwolle', 6.094, 52.516], ['Enschede', 6.894, 52.221], ['Deventer', 6.163, 52.255], ['Almere', 5.222, 52.371],
    ['Lelystad', 5.471, 52.518], ['Groningen', 6.567, 53.219], ['Leeuwarden', 5.799, 53.201], ['Assen', 6.562, 52.993], ['Maastricht', 5.690, 50.851],
    ['Venlo', 6.172, 51.370], ['Roermond', 5.988, 51.194]];
  var RITTEN = [
    { titel: 'Rit naar Zeeland', stops: [['Goes', '4 kozijnen'], ['Middelburg', '2 onderdorpels'], ['Terneuzen', 'Een voordeur']],
      via: [[[5.05, 52.06], [4.78, 51.84], [4.42, 51.62], [4.14, 51.47]], [[3.75, 51.50]], [[3.70, 51.45], [3.80, 51.40]]] },
    { titel: 'Rit naar het noorden', stops: [['Assen', 'Een schuifpui'], ['Groningen', '6 kozijnen'], ['Leeuwarden', 'Een dakkapel']],
      via: [[[5.40, 52.20], [5.64, 52.33], [6.09, 52.52], [6.30, 52.73]], [[6.58, 53.11]], [[6.20, 53.20]]] },
    { titel: 'Rit naar Limburg', stops: [['Venlo', '3 kozijnen'], ['Roermond', '2 onderdorpels'], ['Maastricht', 'Een dakkapel']],
      via: [[[5.12, 52.02], [5.30, 51.73], [5.50, 51.46], [5.85, 51.40]], [[6.09, 51.27]], [[5.86, 51.03]]] }
  ];
  function prj(lon, lat) { return [(lon - 5.30) * 0.61291 * 300, -(lat - 52.15) * 300]; }

  SC.werkgebied = function (o) {
    var ps = PageStage(o, 'Kaart: wij komen door heel Nederland en bundelen klussen per regio'), st = ps.st, R = ps.root;
    var MS = 0.95, MX = 840, MY = 455;
    function D(p) { return [MX + MS * (p[0] + 5.15), MY + MS * (p[1] + 1)]; }
    var byName = {}; PLACES.forEach(function (p) { byName[p[0]] = prj(p[1], p[2]); });
    // kaart
    var world = G(R, { transform: 'translate(' + f(MX + MS * 5.15) + ' ' + f(MY + MS) + ') scale(' + MS + ')' });
    var landG = G(world), landD = NL.land.map(ringD).join('');
    Pa(landG, landD, '#E2E9E5', { transform: 'translate(0 7)' });
    Pa(landG, landD, K.mint, { stroke: K.mint, 'stroke-width': 2.4, 'stroke-linejoin': 'round' });
    Pa(landG, ringD(NL.lake), K.paper);
    Pa(landG, ringD(NL.flevo), '#E2E9E5', { transform: 'translate(0 5)' });
    Pa(landG, ringD(NL.flevo), K.mint, { stroke: K.mint, 'stroke-width': 1.6, 'stroke-linejoin': 'round' });
    var clip = new SlantClip(st, landG), routeG = G(world, { fill: 'none', 'stroke-linecap': 'round', 'stroke-linejoin': 'round' });
    // plaatsen
    var HOME = D(byName.Hilversum), pinsG = G(R), pins = [], maxD = 1;
    PLACES.forEach(function (p) {
      if (p[0] === 'Hilversum') return;
      var q = D(byName[p[0]]), d = Math.hypot(q[0] - HOME[0], q[1] - HOME[1]);
      maxD = Math.max(maxD, d);
      pins.push({ name: p[0], x: q[0], y: q[1], d: d, n: Ci(pinsG, q[0], q[1], 0, WHITE, { stroke: K.mintDeep, 'stroke-width': 1.6 }) });
    });
    var homeG = G(R);
    Ci(homeG, 0, 3, 25, '#22262A', { opacity: 0.12 }); Ci(homeG, 0, 0, 25, WHITE, { stroke: K.mintDeep, 'stroke-width': 1.8 });
    new Mark(G(homeG, { transform: 'translate(-16 -8.6) scale(0.108)' }), K.mint);
    // ritten: route, nummers op de kaart, regels in de planning
    var cardG = G(R), markG = G(R), vanG = G(R);
    Card(cardG, 56, 196, 414, 470, 30);
    Tx(cardG, 'PLANNING', 92, 254, 18, 600, K.mintInk, 'start', '0.22em');
    Li(cardG, 92, 594, 434, 594, LINE, 2);
    var foot = Badge(cardG, 13, K.mintDeep); place(foot, 105, 628);
    Tx(cardG, 'Reiskosten zitten in de prijs', 128, 636, 21, 600, K.ink);
    var legG = G(R);
    Ci(legG, 74, 718, 7, WHITE, { stroke: K.mintDeep, 'stroke-width': 1.6 });
    Tx(legG, 'Plaatsen waar we al gewerkt hebben', 94, 725, 20, 500, K.sub);
    Ci(legG, 74, 760, 12, WHITE, { stroke: K.mintDeep, 'stroke-width': 1.6 });
    new Mark(G(legG, { transform: 'translate(66.3 755.8) scale(0.052)' }), K.mint);
    Tx(legG, 'Thuisbasis Hilversum', 94, 767, 20, 500, K.sub);
    var ritten = RITTEN.map(function (rt) {
      var g = G(cardG), stops = rt.stops.map(function (s) { return byName[s[0]]; });
      Tx(g, rt.titel, 92, 300, 30, 700, K.ink);
      var rows = rt.stops.map(function (s, i) {
        var y = 334 + i * 84, rg = G(g);
        var num = G(rg); Ci(num, 0, 0, 18, K.ink); Tx(num, String(i + 1), 0, 7, 19, 700, WHITE, 'middle'); place(num, 110, y + 30);
        var ok = Badge(rg, 18, K.mintDeep);
        Tx(rg, s[0], 144, y + 26, 25, 600, K.ink); Tx(rg, s[1], 144, y + 55, 20, 500, K.sub);
        return { g: rg, num: num, ok: ok, y: y };
      });
      var legs = [0, 1, 2].map(function (i) {
        var a = i === 0 ? byName.Hilversum : stops[i - 1], pts = [a].concat(rt.via[i].map(function (v) { return prj(v[0], v[1]); })).concat([stops[i]]);
        return { r: new Route(pts, 10), bg: Pa(routeG, '', 'none', { stroke: WHITE, 'stroke-width': 6, opacity: 0.6 }), ln: Pa(routeG, '', 'none', { stroke: K.mintDeep, 'stroke-width': 3.6 }) };
      });
      var mk = stops.map(function (s, i) {
        var q = D(s), m = G(markG);
        var rings = [0, 1].map(function () { return Ci(m, 0, 0, 0, 'none', { stroke: K.ink, 'stroke-width': 1.6 }); });
        var num = G(m); Ci(num, 0, 0, 13, K.ink); Tx(num, String(i + 1), 0, 5, 15, 700, WHITE, 'middle');
        var ok = Badge(m, 14, K.mintDeep);
        return { x: q[0], y: q[1], g: m, rings: rings, num: num, ok: ok };
      });
      var xs = mk.map(function (m) { return m.x; }), ys = mk.map(function (m) { return m.y; });
      var ex = (Math.min.apply(null, xs) + Math.max.apply(null, xs)) / 2, ey = (Math.min.apply(null, ys) + Math.max.apply(null, ys)) / 2;
      var erx = (Math.max.apply(null, xs) - Math.min.apply(null, xs)) / 2 + 40, ery = (Math.max.apply(null, ys) - Math.min.apply(null, ys)) / 2 + 36;
      var ring = el('ellipse', { cx: f(ex), cy: f(ey), rx: f(erx), ry: f(ery), fill: K.ink, 'fill-opacity': 0.04, stroke: K.ink, 'stroke-width': 2, 'stroke-dasharray': '7 7' }, markG);
      return { g: g, rows: rows, legs: legs, mk: mk, ring: ring };
    });
    var VS = 0.068;
    Ci(vanG, 0, 3, 27, '#22262A', { opacity: 0.12 }); Ci(vanG, 0, 0, 27, WHITE, { stroke: K.mintDeep, 'stroke-width': 1.6 });
    var van = new Van(G(vanG));
    van.set(-270 * VS, 152 * VS, VS, 0, 0);

    var T0 = 1.7, CYC = 7.6, LOOP = CYC * 3;
    var LEG = [[1.3, 1.9], [3.65, 0.8], [4.9, 0.8]], ARR = [3.2, 4.45, 5.7];
    function render(t) {
      var lp = seg(t, 0.05, 1.0, E.inOut);
      if (lp >= 1) clip.off(); else clip.set(lerp(-560, 620, lp), -1);
      place(homeG, HOME[0], HOME[1], pop(t, 0.3, 0.5));
      pins.forEach(function (p) { sa(p.n, 'r', f(6.2 * pop(t, 0.45 + (p.d / maxD) * 1.0, 0.4))); });
      var ci = E.out(seg(t, 0.5, 0.7));
      op(cardG, seg(t, 0.5, 0.4)); sa(cardG, 'transform', 'translate(' + f(-28 * (1 - ci)) + ' 0)');
      op(legG, seg(t, 1.1, 0.5));
      var u = t < T0 ? -1 : (t - T0) % LOOP, k = u < 0 ? -1 : Math.floor(u / CYC), tc = u - k * CYC;
      ritten.forEach(function (rt, j) {
        var on = j === k;
        show(rt.g, on); show(rt.ring, on);
        rt.mk.forEach(function (m) { show(m.g, on); });
        rt.legs.forEach(function (l) { show(l.ln, on); show(l.bg, on); });
        if (!on) return;
        var out = seg(tc, CYC - 0.9, 0.6, E.inOut);
        op(rt.g, Math.min(seg(tc, 0, 0.35), 1 - out));
        rt.rows.forEach(function (r, i) {
          var a = seg(tc, 0.1 + i * 0.12, 0.4);
          op(r.g, a); sa(r.g, 'transform', 'translate(0 ' + f(10 * (1 - E.out(a))) + ')');
          var ok = pop(tc, ARR[i], 0.4);
          place(r.ok, 110, r.y + 30, ok); place(r.num, 110, r.y + 30, ok > 0.02 ? 0 : 1);
        });
        op(rt.ring, Math.min(seg(tc, 0.45, 0.4), 1 - out) * 0.9);
        rt.mk.forEach(function (m, i) {
          var a = pop(tc, 0.05 + i * 0.18, 0.45) * (1 - out), ok = pop(tc, ARR[i], 0.4);
          place(m.g, m.x, m.y, a);
          place(m.num, 0, 0, ok > 0.02 ? 0 : 1); place(m.ok, 0, 0, ok);
          m.rings.forEach(function (n, q) {
            var w = ((tc - 0.3) / 1.3 + q / 2) % 1, live = tc > 0.3 && tc < ARR[i];
            sa(n, 'r', f(live ? 13 + w * 22 : 0)); sa(n, 'opacity', f(live ? (1 - w) * 0.5 : 0));
          });
        });
        rt.legs.forEach(function (l, i) {
          var q = seg(tc, LEG[i][0], LEG[i][1], E.inOut);
          sa(l.ln, 'd', q > 0 ? l.r.d(q) : ''); sa(l.bg, 'd', q > 0 ? l.r.d(q) : '');
          op(l.ln, 1 - out); op(l.bg, (1 - out) * 0.6);
        });
        // busje
        var vp = byName.Hilversum, i;
        for (i = 0; i < 3; i++) if (tc >= LEG[i][0]) vp = rt.legs[i].r.at(seg(tc, LEG[i][0], LEG[i][1], E.inOut));
        var vq = D(vp), vs = pop(tc, 1.0, 0.4) * (1 - seg(tc, 6.3, 0.4, E.in));
        place(vanG, vq[0], vq[1], vs);
        var fp = pop(tc, 5.95, 0.45);
        place(foot, 105, 628, 1 + 0.25 * Math.sin(Math.PI * clamp(fp, 0, 1)));
      });
      if (k < 0) show(vanG, false);
    }
    var btnless = { ui: false };
    var sc = pageScene(ps, T0 + LOOP, render, btnless);
    sc.endless = true; sc.introDur = T0; sc.loopDur = LOOP; sc.duration = T0 + LOOP; sc.posterT = T0 + 6.0;
    return sc;
  };

  /* ---------------------------------------------------------------- 2. KOZIJNCHECK
   * Een vergrootglas loopt de zes onderdelen langs; in het rapport ernaast krijgt elk onderdeel zijn stoplicht.
   */
  SC.kozijncheck = function (o) {
    var ps = PageStage(o, 'Kozijncheck: zes onderdelen, elk met een stoplicht'), st = ps.st, R = ps.root;
    var wall = G(R), ink2 = '#3B4247';
    Rc(wall, 40, 70, 600, 770, 30, brick(st, 1.05));
    // rolluikkast
    Rc(wall, 146, 118, 388, 62, 6, '#D5DADB'); Rc(wall, 146, 170, 388, 10, 0, '#B9C3C6');
    [136, 151].forEach(function (y) { Li(wall, 160, y, 520, y, '#C2C9CB', 3); });
    // kitnaad, met rechtsonder een vergeelde, licht gekrompen strook
    Rc(wall, 145, 177, 390, 518, 7, 'none', { stroke: '#E4E0D6', 'stroke-width': 9 });
    Pa(wall, 'M420 695L534 695L534 590', 'none', { stroke: '#C9AE72', 'stroke-width': 9, 'stroke-linecap': 'round' });
    [[452, 695], [492, 695], [534, 660], [534, 622]].forEach(function (p) { Ci(wall, p[0], p[1], 2.6, '#7A5B2E'); });
    // kozijn in antracietgrijs (net hersteld), vast glas links, draairaam rechts
    Pa(wall, frameD(150, 182, 380, 508, [[172, 204, 156, 464], [342, 204, 166, 464]], 6), ink2, { 'fill-rule': 'evenodd' });
    glassRect(st, wall, 172, 204, 156, 464);
    Pa(wall, frameD(342, 204, 166, 464, [[362, 224, 126, 424]], 4), '#465056', { 'fill-rule': 'evenodd' });
    glassRect(st, wall, 362, 224, 126, 424);
    // hor over het draairaam
    var mid = st.id + 'mesh', mp = el('pattern', { id: mid, patternUnits: 'userSpaceOnUse', width: 7, height: 7 }, st.defs);
    Li(mp, 0, 0, 7, 0, '#55636A', 1); Li(mp, 0, 0, 0, 7, '#55636A', 1);
    Rc(wall, 370, 232, 110, 408, 3, 'url(#' + mid + ')', { opacity: 0.3 });
    Rc(wall, 370, 232, 110, 408, 3, 'none', { stroke: '#AEB8BB', 'stroke-width': 5 });
    // rubbers
    Rc(wall, 174, 206, 152, 460, 2, 'none', { stroke: '#141618', 'stroke-width': 4.5 });
    Rc(wall, 364, 226, 122, 420, 2, 'none', { stroke: '#141618', 'stroke-width': 4.5 });
    // hang- en sluitwerk
    Rc(wall, 491, 412, 11, 26, 4, '#B4BCBF'); Rc(wall, 493, 430, 8, 56, 4, '#C9CED0');
    Rc(wall, 338, 252, 7, 32, 3, '#9AA4A8'); Rc(wall, 338, 596, 7, 32, 3, '#9AA4A8');
    // vensterbank
    Rc(wall, 128, 690, 424, 24, 4, K.tile); Rc(wall, 128, 690, 424, 6, 3, WHITE, { opacity: 0.18 });

    var parts = [
      { name: 'Rubbers', status: 'Soepel en sluitend', col: GREEN, at: [326, 450] },
      { name: 'Kitwerk', status: 'Licht gekrompen', col: K.gold, at: [528, 668] },
      { name: 'Glas', status: 'Helder en heel', col: GREEN, at: [250, 330] },
      { name: 'Hang- en sluitwerk', status: 'Sluit soepel', col: GREEN, at: [497, 450] },
      { name: 'Horren', status: 'Past en oogt goed', col: GREEN, at: [425, 320] },
      { name: 'Rolluiken', status: 'Werkt goed', col: GREEN, at: [340, 149] }
    ];
    var pulse = Ci(R, 0, 0, 0, 'none', { stroke: WHITE, 'stroke-width': 5 });
    var lens = G(R);
    Li(lens, 36, 36, 84, 84, '#22262A', 16); Li(lens, 40, 40, 82, 82, '#3A4047', 9);
    Ci(lens, 0, 0, 52, WHITE, { 'fill-opacity': 0.16, stroke: '#22262A', 'stroke-width': 9 });
    Pa(lens, 'M-30 -14A32 32 0 0 1 -12 -32', 'none', { stroke: WHITE, 'stroke-width': 5, 'stroke-linecap': 'round', opacity: 0.8 });
    // rapport
    var card = G(R);
    Card(card, 690, 66, 460, 770, 30);
    Tx(card, 'OPLEVERRAPPORT', 724, 124, 18, 600, K.mintInk, 'start', '0.22em');
    Tx(card, 'Kozijncheck', 724, 172, 36, 700, K.ink);
    Tx(card, 'Zes onderdelen, elk met een stoplicht', 724, 206, 19, 500, K.sub);
    Li(card, 724, 232, 1116, 232, LINE, 2);
    var rows = parts.map(function (p, i) {
      var y = 244 + i * 80, g = G(card);
      var hl = Rc(g, 708, y + 4, 424, 72, 16, K.mintWash);
      Tx(g, p.name, 728, y + 36, 24, 600, K.ink);
      var pend = Tx(g, 'nog te bekijken', 728, y + 62, 19, 500, '#A9A59C');
      var stat = Tx(g, p.status, 728, y + 62, 19, 500, K.sub);
      Ci(g, 1108, y + 40, 13, GREY);
      var dot = Ci(g, 1108, y + 40, 0, p.col);
      return { g: g, hl: hl, pend: pend, stat: stat, dot: dot, y: y };
    });
    var sum = G(card), segs = [];
    Tx(sum, '5 van de 6 onderdelen in orde', 724, 774, 22, 700, K.ink);
    for (var i = 0; i < 6; i++) { Rc(sum, 724 + i * 68, 794, 60, 10, 5, GREY); segs.push(Rc(sum, 724 + i * 68, 794, 0, 10, 5, parts[i].col)); }

    var T1 = 1.0, STEP = 1.3, last = T1 + 5 * STEP, rest = last + 1.9;
    function render(t) {
      var a = E.out(seg(t, 0.15, 0.7));
      op(card, seg(t, 0.15, 0.5)); sa(card, 'transform', 'translate(0 ' + f(24 * (1 - a)) + ')');
      rows.forEach(function (r, i) { op(r.g, seg(t, 0.35 + i * 0.06, 0.4)); });
      // vergrootglas
      var pos = [980, 980], j;
      for (j = 0; j < parts.length; j++) {
        var ti = T1 + j * STEP, from = j ? parts[j - 1].at : [760, 1000];
        if (t >= ti - 0.55) { var q = seg(t, ti - 0.55, 0.55, E.inOut); pos = [lerp(from[0], parts[j].at[0], q), lerp(from[1], parts[j].at[1], q)]; }
      }
      if (t > last + 0.45) { var qo = seg(t, last + 0.45, 0.5, E.in); pos = [lerp(parts[5].at[0], 800, qo), lerp(parts[5].at[1], 1040, qo)]; }
      place(lens, pos[0], pos[1], t < 0.3 ? 0 : 1);
      // per onderdeel: puls, regel oplichten, stoplicht
      var pon = false;
      parts.forEach(function (p, i) {
        var ti = T1 + i * STEP, r = rows[i];
        op(r.hl, Math.min(seg(t, ti - 0.2, 0.25), 1 - seg(t, ti + STEP - 0.25, 0.25)));
        sa(r.dot, 'r', f(13 * pop(t, ti + 0.15, 0.4)));
        op(r.pend, 1 - seg(t, ti + 0.15, 0.25)); op(r.stat, seg(t, ti + 0.2, 0.3));
        var q = seg(t, ti, 0.75);
        if (q > 0 && q < 1) { pon = true; sa(pulse, 'cx', p.at[0]); sa(pulse, 'cy', p.at[1]); sa(pulse, 'r', f(40 + 50 * E.out(q))); sa(pulse, 'opacity', f((1 - q) * 0.9)); }
      });
      show(pulse, pon);
      op(sum, seg(t, last + 0.7, 0.4));
      segs.forEach(function (s, i) { sa(s, 'width', f(60 * seg(t, last + 0.8 + i * 0.09, 0.3, E.out))); });
    }
    return pageScene(ps, rest, render, o);
  };

  /* ---------------------------------------------------------------- 3. HERSTELLEN TEGENOVER VERVANGEN
   * Links wordt het kozijn eruit gebroken en vervangen, rechts gaat er alleen een laag folie af en weer op.
   */
  SC.vervangen = function (o) {
    var ps = PageStage(o, 'Een nieuw kozijn tegenover herstellen met folie'), st = ps.st, R = ps.root;
    var bk = brick(st, 0.95);
    function panel(x0, title, dot) {
      var g = G(R), P = { g: g, x0: x0 };
      Card(g, x0, 36, 546, 828, 30);
      Ci(g, x0 + 46, 92, 10, dot);
      Tx(g, title, x0 + 68, 101, 28, 700, K.ink);
      var cid = st.id + 'pw' + (++uid), cp = el('clipPath', { id: cid }, st.defs);
      Rc(cp, x0 + 30, 136, 486, 424, 20);
      P.scene = G(g, { 'clip-path': 'url(#' + cid + ')' });
      Rc(P.scene, x0 + 30, 136, 486, 424, 0, bk);
      P.chip = G(g); Rc(P.chip, x0 + 376, 160, 128, 44, 22, '#22262A', { opacity: 0.12, transform: 'translate(0 4)' }); P.chipBg = Rc(P.chip, x0 + 376, 160, 128, 44, 22, WHITE);
      P.chipTx = [];
      return P;
    }
    function chipText(P, s, col) { var n = Tx(P.chip, s, P.x0 + 440, 189, 21, 700, col || K.ink, 'middle'); P.chipTx.push(n); return n; }
    function windowAt(p, x0, col, old, seed) {
      var g = G(p), fx = x0 + 108, fy = 196;
      glassRect(st, g, fx + 18, fy + 18, 134, 268);
      glassRect(st, g, fx + 184, fy + 34, 112, 236);
      Pa(g, frameD(fx, fy, 330, 304, [[fx + 18, fy + 18, 134, 268], [fx + 166, fy + 18, 146, 268]]), col, { 'fill-rule': 'evenodd' });
      Pa(g, frameD(fx + 166, fy + 18, 146, 268, [[fx + 184, fy + 34, 112, 236]], 3), col, { 'fill-rule': 'evenodd' });
      Pa(g, 'M' + (fx + 166) + ' ' + (fy + 18) + 'h146v268h-146Z', 'none', { stroke: '#000000', 'stroke-opacity': 0.14, 'stroke-width': 1.5 });
      Rc(g, fx + 296, fy + 140, 8, 34, 4, '#C9CED0');
      if (old) { weather(g, fx, fy, 330, 304, seed, 18); weather(g, fx + 166, fy + 18, 146, 268, seed + 7, 16); }
      return g;
    }
    function bullets(P, list, kind, col) {
      return list.map(function (s, i) {
        var g = G(P.g), y = 612 + i * 60, b = Badge(g, 15, col, kind);
        place(b, P.x0 + 54, y);
        Tx(g, s, P.x0 + 82, y + 8, 22, 600, K.ink);
        return g;
      });
    }
    // ---- links: vervangen
    var L = panel(36, 'Een nieuw kozijn', K.rust), lx = 36;
    var hp = [], r0 = rng(4), X1 = lx + 100, X2 = lx + 446, Y1 = 188, Y2 = 508, q0;
    for (q0 = 0; q0 <= 8; q0++) hp.push([lerp(X1, X2, q0 / 8), Y1 + (r0() - 0.5) * 9]);
    for (q0 = 1; q0 <= 5; q0++) hp.push([X2 + (r0() - 0.5) * 9, lerp(Y1, Y2, q0 / 6)]);
    for (q0 = 8; q0 >= 0; q0--) hp.push([lerp(X1, X2, q0 / 8), Y2 + (r0() - 0.5) * 9]);
    for (q0 = 5; q0 >= 1; q0--) hp.push([X1 + (r0() - 0.5) * 9, lerp(Y1, Y2, q0 / 6)]);
    var hole = G(L.scene); Pa(hole, polyD(hp, true), '#33383D'); Rc(hole, lx + 120, 420, 306, 80, 0, '#3E444A');
    var cracks = ['M' + (lx + 100) + ' 260l-28 18l-12 30l-22 8', 'M' + (lx + 446) + ' 220l26 -14l10 -26l20 -8', 'M' + (lx + 120) + ' 506l-18 22l-30 6',
      'M' + (lx + 430) + ' 506l22 18l8 26', 'M' + (lx + 272) + ' 190l-6 -24l14 -18'].map(function (d) {
      return Pa(L.scene, d, 'none', { stroke: '#4A2A1E', 'stroke-width': 3.5, 'stroke-linecap': 'round', 'stroke-linejoin': 'round', pathLength: 1, 'stroke-dasharray': '1 1', 'stroke-dashoffset': 1 });
    });
    var patches = [[lx + 84, 278, 40, 24], [lx + 456, 206, 40, 22], [lx + 100, 512, 46, 22], [lx + 440, 514, 40, 22], [lx + 262, 170, 34, 20]].map(function (b) {
      return el('ellipse', { cx: f(b[0]), cy: f(b[1]), rx: f(b[2] / 2), ry: f(b[3] / 2), fill: '#D9D4C8' }, L.scene);
    });
    var sillL = G(L.scene); Rc(sillL, lx + 92, 500, 362, 22, 4, K.tile); Rc(sillL, lx + 92, 500, 362, 5, 3, WHITE, { opacity: 0.18 });
    var oldL = windowAt(L.scene, lx, K.creamOld, true, 5);
    var newL = windowAt(L.scene, lx, '#F7F7F4', false);
    var debris = []; (function () { var r = rng(9); for (var i = 0; i < 14; i++) debris.push({ x: lx + 120 + r() * 300, y: 200 + r() * 290, s: 6 + r() * 12, vx: (r() - 0.5) * 120, rot: r() * 360, n: Rc(L.scene, -6, -4, 12, 8, 1.5, i % 3 ? K.brickDark : K.creamOld) }); })();
    chipText(L, 'Dag 1'); chipText(L, 'Dag 2'); chipText(L, 'Dag 3'); chipText(L, '+ schilder');
    var bl = bullets(L, ['Kozijn eruit gebroken', 'Stucwerk aan de dagkanten kapot', 'Vensterbank eruit', 'Binnen schilderwerk achteraf'], 'x', K.rust);
    // ---- rechts: herstellen
    var Rp = panel(618, 'Herstellen met folie', K.mintDeep), rx = 618;
    var sillR = G(Rp.scene); Rc(sillR, rx + 92, 500, 362, 22, 4, K.tile); Rc(sillR, rx + 92, 500, 362, 5, 3, WHITE, { opacity: 0.18 });
    windowAt(Rp.scene, rx, K.creamOld, true, 5);
    var newR = windowAt(Rp.scene, rx, NEWCREAM, false);
    var clipR = new SlantClip(st, newR);
    var band = Li(Rp.scene, 0, 0, 0, 0, K.mint, 44), bandEdge = Li(Rp.scene, 0, 0, 0, 0, WHITE, 6, { opacity: 0.6 });
    var sp = Sparks(Rp.scene, [[rx + 160, 240], [rx + 400, 300], [rx + 250, 470], [rx + 420, 470], [rx + 140, 420]]);
    chipText(Rp, 'Dag 1'); var klaar = chipText(Rp, 'Klaar', WHITE);
    var br = bullets(Rp, ['Het kozijn blijft zitten', 'Alleen de folie gaat eraf', 'Klaar in een tot twee dagen', 'Binnen verandert er niets'], 'v', K.mintDeep);

    var rest = 6.4;
    function chips(P, list, t) {
      P.chipTx.forEach(function (n, i) { op(n, Math.min(seg(t, list[i], 0.25), i < list.length - 1 ? 1 - seg(t, list[i + 1] - 0.2, 0.2) : 1)); });
    }
    function render(t) {
      op(L.chip, seg(t, 0.4, 0.3)); op(Rp.chip, seg(t, 0.4, 0.3));
      chips(L, [0.4, 3.4, 4.9, 5.7], t);
      chips(Rp, [0.4, 3.2], t);
      sa(Rp.chipBg, 'fill', t >= 3.2 ? K.mintDeep : WHITE);
      // links: kozijn eruit
      var shake = seg(t, 0.8, 0.9) * (1 - seg(t, 1.6, 0.1));
      var fall = seg(t, 1.7, 0.75, E.in);
      sa(oldL, 'transform', 'translate(0 ' + f(560 * fall) + ') rotate(' + f(1.6 * Math.sin(t * 40) * shake + 16 * fall) + ' ' + (lx + 273) + ' 348)');
      op(oldL, 1 - seg(t, 2.3, 0.2));
      cracks.forEach(function (c, i) { sa(c, 'stroke-dashoffset', f(1 - seg(t, 1.0 + i * 0.12, 0.5))); op(c, 1 - seg(t, 5.0, 0.4)); });
      patches.forEach(function (p, i) { op(p, seg(t, 5.0 + i * 0.08, 0.35)); });
      debris.forEach(function (d) {
        var q = clamp((t - 1.9) / 1.1, 0, 1), on = q > 0 && q < 1;
        show(d.n, on); if (!on) return;
        sa(d.n, 'transform', 'translate(' + f(d.x + d.vx * q) + ' ' + f(d.y + 520 * q * q) + ') rotate(' + f(d.rot + 300 * q) + ') scale(' + f(d.s / 10) + ')');
      });
      var sf = seg(t, 2.8, 0.6, E.in);
      sa(sillL, 'transform', 'translate(' + f(-30 * sf) + ' ' + f(120 * sf) + ') rotate(' + f(-8 * sf) + ' ' + (lx + 273) + ' 511)'); op(sillL, 1 - seg(t, 3.2, 0.2));
      var ni = seg(t, 3.6, 0.8, E.out);
      sa(newL, 'transform', 'translate(0 ' + f(-560 * (1 - ni)) + ')'); show(newL, ni > 0);
      op(hole, 1 - seg(t, 4.2, 0.2));
      bl.forEach(function (b, i) { var q = seg(t, [1.8, 2.2, 3.0, 5.6][i], 0.4); op(b, q); sa(b, 'transform', 'translate(' + f(-14 * (1 - E.out(q))) + ' 0)'); });
      // rechts: rakel
      var wp = seg(t, 1.0, 2.0, E.inOut), xe = lerp(rx - 180, rx + 560, wp);
      if (wp <= 0) show(newR, false); else { show(newR, true); if (wp >= 1) clipR.off(); else clipR.set(xe - 200 * COT, -1); }
      var on = wp > 0 && wp < 1;
      show(band, on); show(bandEdge, on);
      if (on) {
        var xa = xe - 200 * COT;
        sa(band, 'x1', f(xa + 120 * COT + 22)); sa(band, 'y1', 120); sa(band, 'x2', f(xa + 580 * COT + 22)); sa(band, 'y2', 580);
        sa(bandEdge, 'x1', f(xa + 120 * COT - 2)); sa(bandEdge, 'y1', 120); sa(bandEdge, 'x2', f(xa + 580 * COT - 2)); sa(bandEdge, 'y2', 580);
      }
      sparks(sp, t, 3.2, 1.1);
      br.forEach(function (b, i) { var q = seg(t, [1.1, 2.0, 3.3, 4.1][i], 0.4); op(b, q); sa(b, 'transform', 'translate(' + f(-14 * (1 - E.out(q))) + ' 0)'); });
    }
    return pageScene(ps, rest, render, o);
  };

  /* ---------------------------------------------------------------- 4. AANVRAAG
   * Foto maken, aanstrepen (geel voor het kozijn, rood voor een draairaam of deur), maten erbij, versturen, vaste prijs.
   * Dezelfde stiften als het echte formulier (js/aanstrepen.js): geel #FFD400 en rood #E5212D met een donkere rand.
   */
  SC.aanvraag = function (o) {
    var ps = PageStage(o, 'Een offerte aanvragen: foto maken, aanstrepen en versturen'), st = ps.st, R = ps.root;
    var YEL = '#FFD400', RED = '#E5212D', RAND = '#1D1D1B';
    // telefoon
    var ph = G(R);
    Rc(ph, 160, 60, 380, 800, 60, '#22262A', { opacity: 0.1, transform: 'translate(0 14)' });
    Rc(ph, 160, 60, 380, 800, 60, K.ink);
    Rc(ph, 176, 76, 348, 768, 46, '#101214');
    var cid = st.id + 'scr', cp = el('clipPath', { id: cid }, st.defs); Rc(cp, 176, 76, 348, 768, 46);
    var scr = G(ph, { 'clip-path': 'url(#' + cid + ')' });
    // de foto: gevel met een crème kozijn
    var photo = G(scr);
    Rc(photo, 176, 160, 348, 500, 0, brick(st, 0.8));
    glassRect(st, photo, 218, 254, 100, 284);
    glassRect(st, photo, 344, 270, 78, 252);
    Pa(photo, frameD(200, 236, 252, 320, [[218, 254, 100, 284], [330, 254, 106, 284]], 4), K.creamOld, { 'fill-rule': 'evenodd' });
    Pa(photo, frameD(330, 254, 106, 284, [[344, 270, 78, 252]], 3), K.creamOld, { 'fill-rule': 'evenodd' });
    Rc(photo, 424, 382, 6, 26, 3, '#C9CED0');
    weather(photo, 200, 236, 252, 320, 11, 18); weather(photo, 330, 254, 106, 284, 13, 14);
    Rc(photo, 188, 556, 276, 18, 3, K.tile);
    // camera
    var cam = G(scr);
    [[196, 180, 1, 1], [504, 180, -1, 1], [196, 640, 1, -1], [504, 640, -1, -1]].forEach(function (c) {
      Pa(cam, 'M' + c[0] + ' ' + (c[1] + 30 * c[3]) + 'V' + c[1] + 'H' + (c[0] + 30 * c[2]), 'none', { stroke: WHITE, 'stroke-width': 4, 'stroke-linecap': 'round' });
    });
    Tx(cam, 'FOTO', 350, 128, 18, 700, YEL, 'middle', '0.18em');
    var shutter = G(cam); Ci(shutter, 0, 0, 38, 'none', { stroke: WHITE, 'stroke-width': 5 }); Ci(shutter, 0, 0, 29, WHITE);
    var flash = Rc(scr, 176, 76, 348, 768, 0, WHITE);
    // aanstrepen
    var mark = G(scr);
    var tip = Tx(mark, 'Streep aan wat er moet gebeuren', 350, 128, 18, 600, WHITE, 'middle');
    var pens = G(mark);
    Ci(pens, 206, 700, 12, YEL, { stroke: RAND, 'stroke-width': 2.5 }); Tx(pens, 'Kozijn', 226, 706, 17, 600, WHITE);
    Ci(pens, 312, 700, 12, RED, { stroke: RAND, 'stroke-width': 2.5 }); Tx(pens, 'Draairaam of deur', 332, 706, 17, 600, WHITE);
    var YP = [[209, 248], [209, 547], [443, 547]], RP = [[330, 254], [436, 254], [436, 538], [330, 538], [330, 254]];
    var ylwR = Pa(scr, polyD(YP), 'none', { stroke: RAND, 'stroke-width': 20, 'stroke-linecap': 'round', 'stroke-linejoin': 'round', opacity: 0.55, pathLength: 1, 'stroke-dasharray': '1 1', 'stroke-dashoffset': 1 });
    var redR = Pa(scr, polyD(RP), 'none', { stroke: RAND, 'stroke-width': 16, 'stroke-linecap': 'round', 'stroke-linejoin': 'round', opacity: 0.55, pathLength: 1, 'stroke-dasharray': '1 1', 'stroke-dashoffset': 1 });
    var ylw = Pa(scr, polyD(YP), 'none', { stroke: YEL, 'stroke-width': 15, 'stroke-linecap': 'round', 'stroke-linejoin': 'round', opacity: 0.88, pathLength: 1, 'stroke-dasharray': '1 1', 'stroke-dashoffset': 1 });
    var red = Pa(scr, polyD(RP), 'none', { stroke: RED, 'stroke-width': 11, 'stroke-linecap': 'round', 'stroke-linejoin': 'round', opacity: 0.9, pathLength: 1, 'stroke-dasharray': '1 1', 'stroke-dashoffset': 1 });
    function dim(p, x1, y1, x2, y2, s, lx, ly) {
      var g = G(p);
      Li(g, x1, y1, x2, y2, WHITE, 2.5);
      var v = x1 === x2;
      Li(g, x1 - (v ? 8 : 0), y1 - (v ? 0 : 8), x1 + (v ? 8 : 0), y1 + (v ? 0 : 8), WHITE, 2.5);
      Li(g, x2 - (v ? 8 : 0), y2 - (v ? 0 : 8), x2 + (v ? 8 : 0), y2 + (v ? 0 : 8), WHITE, 2.5);
      Rc(g, lx - 40, ly - 17, 80, 34, 17, WHITE);
      Tx(g, s, lx, ly + 7, 18, 700, K.ink, 'middle');
      return g;
    }
    var dimB = dim(scr, 200, 600, 452, 600, '1,60 m', 326, 600), dimR = dim(scr, 478, 236, 478, 556, '1,30 m', 478, 396);
    var send = G(scr); Rc(send, 222, 750, 256, 58, 29, K.mint); Tx(send, 'Versturen', 350, 787, 23, 700, K.ink, 'middle');
    var sent = G(scr); Rc(sent, 176, 76, 348, 768, 0, K.mintDeep);
    var sentOk = Badge(sent, 44, WHITE); place(sentOk, 350, 400);
    sentOk.firstChild.nextSibling.setAttribute('stroke', K.mintDeep);
    Tx(sent, 'Verstuurd', 350, 492, 30, 700, WHITE, 'middle');
    Tx(sent, 'Je hoort van ons wat het kost', 350, 530, 19, 500, '#DBECE7', 'middle');
    Rc(ph, 304, 88, 92, 26, 13, '#000000');
    // vinger
    var finger = G(R); Ci(finger, 0, 0, 30, '#22262A', { opacity: 0.22 }); Ci(finger, 0, 0, 22, 'none', { stroke: WHITE, 'stroke-width': 3.5, opacity: 0.9 });
    // vliegende foto
    var fly = G(R); Rc(fly, -64, -50, 128, 100, 14, WHITE); Rc(fly, -54, -40, 108, 80, 8, K.brick);
    Rc(fly, -30, -28, 60, 56, 3, K.creamOld); Rc(fly, -24, -22, 22, 44, 1, K.glass2); Rc(fly, 2, -22, 22, 44, 1, K.glass2);
    Li(fly, -27, 26, 27, 26, YEL, 4);
    // offerte
    var off = G(R);
    Card(off, 640, 196, 470, 500, 30);
    Tx(off, 'OFFERTE', 676, 254, 18, 600, K.mintInk, 'start', '0.22em');
    Tx(off, 'Vaste totaalprijs', 676, 302, 34, 700, K.ink);
    // Een offerte is een opsomming van het werk met één totaalprijs; voorrijden
    // staat er nooit apart in, het zit in de prijs. Vandaar "inclusief".
    var items = ['Onderdorpel en stijlen', 'Draairaam rondom', 'Inclusief voorrijden en materiaal'].map(function (s, i) {
      var g = G(off), b = Badge(g, 14, K.mintDeep); place(b, 690, 352 + i * 54);
      Tx(g, s, 716, 360 + i * 54, 22, 500, K.ink); return g;
    });
    Li(off, 676, 524, 1074, 524, LINE, 2);
    var tot = G(off);
    Tx(tot, 'Totaal', 676, 574, 26, 700, K.ink);
    Rc(tot, 916, 544, 158, 44, 22, K.ink); Tx(tot, 'Vast bedrag', 995, 573, 19, 600, WHITE, 'middle');
    Tx(tot, 'Wat hier staat, is wat je betaalt.', 676, 640, 19, 500, K.sub);
    var mon = G(R); Rc(mon, 640, 726, 470, 66, 33, WHITE);
    Rc(mon, 670, 744, 34, 30, 6, 'none', { stroke: K.mintDeep, 'stroke-width': 3 }); Li(mon, 670, 754, 704, 754, K.mintDeep, 3);
    Tx(mon, 'Offertes maken we op maandag', 722, 767, 21, 600, K.ink);

    var rest = 9.8;
    function render(t) {
      var camOn = t < 1.55;
      op(cam, 1 - seg(t, 1.3, 0.25));
      place(shutter, 350, 744, 1 - 0.14 * Math.sin(Math.PI * seg(t, 0.75, 0.3)));
      op(flash, t > 0.95 ? 0.9 * (1 - seg(t, 1.0, 0.45)) : 0);
      op(mark, Math.min(seg(t, 1.5, 0.35), 1 - seg(t, 6.05, 0.3)));
      op(pens, Math.min(seg(t, 1.6, 0.35), 1 - seg(t, 6.05, 0.3)));
      var yq = seg(t, 2.0, 1.5, E.inOut), rq = seg(t, 3.9, 1.5, E.inOut);
      sa(ylw, 'stroke-dashoffset', f(1 - yq)); sa(red, 'stroke-dashoffset', f(1 - rq));
      sa(ylwR, 'stroke-dashoffset', f(1 - yq)); sa(redR, 'stroke-dashoffset', f(1 - rq));
      op(ylw, 1 - seg(t, 7.2, 0.3)); op(red, 1 - seg(t, 7.2, 0.3));
      op(ylwR, 0.55 * (1 - seg(t, 7.2, 0.3))); op(redR, 0.55 * (1 - seg(t, 7.2, 0.3)));
      [[dimB, 5.6], [dimR, 5.85]].forEach(function (d) { op(d[0], Math.min(seg(t, d[1], 0.3), 1 - seg(t, 7.2, 0.3))); });
      op(send, Math.min(seg(t, 6.1, 0.35), 1 - seg(t, 7.2, 0.3)));
      place(send, 0, 0, 1 - 0.06 * Math.sin(Math.PI * seg(t, 6.75, 0.25)));
      op(sent, seg(t, 7.25, 0.35));
      place(sentOk, 350, 400, pop(t, 7.4, 0.45));
      // vinger: tikken, strepen, tikken
      var fp = null, fs = 1;
      if (t > 0.35 && t < 1.2) { fp = [350 + 80 * (1 - seg(t, 0.35, 0.4, E.out)), 744 + 60 * (1 - seg(t, 0.35, 0.4, E.out))]; fs = 1 - 0.15 * Math.sin(Math.PI * seg(t, 0.75, 0.3)); }
      else if (t >= 1.7 && t < 2.0) fp = [lerp(320, YP[0][0], seg(t, 1.7, 0.3, E.inOut)), lerp(700, YP[0][1], seg(t, 1.7, 0.3, E.inOut))];
      else if (t >= 2.0 && t < 3.5) fp = polyAt(YP, yq);
      else if (t >= 3.5 && t < 3.9) { var q1 = seg(t, 3.5, 0.4, E.inOut); fp = [lerp(YP[2][0], RP[0][0], q1), lerp(YP[2][1], RP[0][1], q1)]; }
      else if (t >= 3.9 && t < 5.4) fp = polyAt(RP, rq);
      else if (t >= 6.3 && t < 7.05) { var q2 = seg(t, 6.3, 0.45, E.inOut); fp = [lerp(330, 350, q2), lerp(254, 780, q2)]; fs = 1 - 0.15 * Math.sin(Math.PI * seg(t, 6.75, 0.25)); }
      if (fp) place(finger, fp[0], fp[1], fs); else show(finger, false);
      // foto vliegt naar de offerte
      var fq = seg(t, 7.1, 0.75, E.inOut);
      if (fq > 0 && fq < 1) place(fly, lerp(350, 760, fq), lerp(400, 300, fq) - 120 * Math.sin(Math.PI * fq), 1 - 0.4 * fq, -8 * Math.sin(Math.PI * fq));
      else show(fly, false);
      var oc = pop(t, 7.65, 0.5);
      place(off, 875, 446, oc); sa(off, 'transform', oc > 0.001 ? 'translate(875 446) scale(' + f(oc) + ') translate(-875 -446)' : null);
      items.forEach(function (it, i) { op(it, seg(t, 8.0 + i * 0.15, 0.3)); });
      op(tot, seg(t, 8.5, 0.35));
      var mq = seg(t, 9.0, 0.5, E.out); op(mon, seg(t, 9.0, 0.3)); sa(mon, 'transform', 'translate(0 ' + f(14 * (1 - mq)) + ')');
    }
    return pageScene(ps, rest, render, o);
  };

  /* ---------------------------------------------------------------- 5. VVE: UITVOERING IN BLOKKEN
   * Een flat met drie portieken. Per blok eerst een korte toelichting op papier voor de bewoners (zoals de
   * VvE-pagina belooft), dan gaat de hoogwerker erlangs. Met captions: false laat de scène haar eigen
   * onderschrift weg (de video's zetten er dan de ondertitels van de klusfilm onder).
   */
  SC.vve = function (o) {
    var ps = PageStage(o, 'Uitvoering in blokken bij een VvE of woningcorporatie'), st = ps.st, R = ps.root;
    var bld = G(R), BX = 90, BW = 1020, TOP = 206, GND = 724;
    Rc(R, 0, GND, 1200, 46, 0, K.walk); Rc(R, 0, GND + 46, 1200, 6, 0, '#CFCDC6');
    Rc(bld, BX, TOP, BW, GND - TOP, 0, brick(st, 0.82));
    Rc(bld, BX - 12, TOP - 18, BW + 24, 22, 4, K.roof);
    Rc(bld, BX, TOP + 4, BW, 8, 0, '#000000', { opacity: 0.1 });
    [430, 770].forEach(function (x) { Rc(bld, x - 3, TOP, 6, GND - TOP, 0, '#000000', { opacity: 0.08 }); });
    var reflClip = st.id + 'vrc', rcp = el('clipPath', { id: reflClip }, st.defs);
    var blocks = [0, 1, 2].map(function (b) {
      var x0 = BX + b * 340, panes = [], frames = [];
      for (var f2 = 0; f2 < 3; f2++) for (var c = 0; c < 2; c++) {
        var x = x0 + 34 + c * 160, y = TOP + 34 + f2 * 116, w = 126, h = 86;
        frames.push([x, y, w, h, [[x + 9, y + 9, 50, h - 18], [x + 67, y + 9, 50, h - 18]]]);
      }
      frames.push([x0 + 30, 596, 92, 72, [[x0 + 39, 605, 74, 54]]]);
      frames.push([x0 + 218, 596, 92, 72, [[x0 + 227, 605, 74, 54]]]);
      frames.push([x0 + 138, 588, 64, GND - 588, [[x0 + 148, 598, 44, 70]]]);
      frames.forEach(function (fr) { fr[4].forEach(function (q) { Rc(bld, q[0], q[1], q[2], q[3], 1.5, glassFill(st)); Rc(rcp, q[0], q[1], q[2], q[3]); }); });
      var oldG = G(bld), newG = G(bld);
      frames.forEach(function (fr, i) {
        Pa(oldG, frameD(fr[0], fr[1], fr[2], fr[3], fr[4], 3), K.creamOld, { 'fill-rule': 'evenodd' });
        if (i < 6) Rc(oldG, fr[0] + 6, fr[1] + fr[3] - 6, fr[2] * (0.3 + 0.1 * (i % 3)), 4, 2, K.glue);
        el('ellipse', { cx: f(fr[0] + fr[2] * 0.7), cy: f(fr[1] + 5), rx: f(fr[2] * 0.16), ry: 3, fill: K.creamOldDark, opacity: 0.55 }, oldG);
        Pa(newG, frameD(fr[0], fr[1], fr[2], fr[3], fr[4], 3), NEWCREAM, { 'fill-rule': 'evenodd' });
      });
      Rc(bld, x0 + 140, 650, 4, 22, 2, '#C9CED0');
      var cid = st.id + 'vb' + b, cp = el('clipPath', { id: cid }, st.defs); Rc(cp, x0, TOP, 340, GND - TOP);
      var bandG = G(bld, { 'clip-path': 'url(#' + cid + ')' });
      var band = Li(bandG, 0, 0, 0, 0, K.mint, 38), edge = Li(bandG, 0, 0, 0, 0, WHITE, 6, { opacity: 0.6 });
      // de toelichting voor de bewoners, bij de voordeur
      var env = [0, 1, 2].map(function (k) {
        var e = G(R); Rc(e, -19, -13, 38, 26, 4, WHITE, { stroke: LINE, 'stroke-width': 1.5 });
        Pa(e, 'M-17 -11L0 2L17 -11', 'none', { stroke: K.mint, 'stroke-width': 3, 'stroke-linejoin': 'round' });
        return e;
      });
      // planning
      // Alleen het blok, zonder weeknummer: hoe lang een blok duurt, beloven we niet.
      var chip = G(R), chipBg = Rc(chip, x0 + 90, 92, 160, 56, 28, WHITE, { stroke: LINE, 'stroke-width': 2 });
      var chipTx = Tx(chip, 'Blok ' + 'ABC'[b], x0 + 170, 128, 22, 600, K.ink, 'middle');
      var chipOk = Badge(chip, 15, WHITE); place(chipOk, x0 + 118, 120);
      chipOk.lastChild.setAttribute('stroke', K.mintDeep);
      return { x0: x0, newG: newG, clip: new SlantClip(st, newG), band: band, edge: edge, env: env, chip: chip, chipBg: chipBg, chipTx: chipTx, chipOk: chipOk,
        sp: Sparks(bld, [[x0 + 90, TOP + 60], [x0 + 260, TOP + 170], [x0 + 120, TOP + 290], [x0 + 250, 620]]) };
    });
    var refl = G(bld, { 'clip-path': 'url(#' + reflClip + ')' });
    for (var s = -2; s < 14; s++) {
      var x = BX + s * 92;
      Pa(refl, 'M' + f(x) + ' ' + TOP + 'l26 0l' + f((GND - TOP) * COT) + ' ' + (GND - TOP) + 'l-26 0Z', WHITE, { opacity: s % 2 ? 0.28 : 0.18 });
    }
    // hoogwerker
    var lift = G(R), scis = G(lift, { stroke: K.inkSoft, 'stroke-width': 7, 'stroke-linecap': 'round' }), arms = [];
    for (var k = 0; k < 6; k++) arms.push(Li(scis, 0, 0, 0, 0, K.inkSoft, 7));
    Rc(lift, -86, GND - 34, 172, 30, 10, K.ink);
    Ci(lift, -56, GND - 2, 13, '#22262A'); Ci(lift, 56, GND - 2, 13, '#22262A');
    var plat = G(lift);
    Rc(plat, -90, 0, 180, 16, 4, K.mint);
    Li(plat, -84, 0, -84, -50, K.mintDeep, 5); Li(plat, 84, 0, 84, -50, K.mintDeep, 5); Li(plat, -84, -50, 84, -50, K.mintDeep, 5);
    var worker = new Person(plat, { shirt: K.ink, pants: K.inkSoft, skin: K.skin, hair: 'cap', hairColor: '#17191B', logo: true });
    worker.set({ x: 22, y: 0, face: -1, s: 0.46, a: [150, 20], b: [20, 10] });
    var cap = o.captions === false ? function () {} : Caption(R, [{ t0: 0.4, t1: 3.3, text: 'Eerst een korte toelichting voor de bewoners' },
      { t0: 3.3, t1: 11.5, text: 'Daarna blok voor blok, van maart tot november' }, { t0: 11.5, text: 'Eén vaste prijs voor het hele complex' }], 600, 836, 820);

    var B0 = 0.6, BD = 3.5, rest = B0 + 3 * BD + 1.2;
    function render(t) {
      var lx = -160, h = 0, i;
      blocks.forEach(function (b, j) {
        var tb = B0 + j * BD;
        // planning
        var act = seg(t, tb + 0.1, 0.3), done = t >= tb + 3.05;
        op(b.chip, seg(t, 0.15 + j * 0.1, 0.4));
        sa(b.chipBg, 'fill', done ? K.mintDeep : (act > 0 ? K.mintSoft : WHITE)); sa(b.chipBg, 'stroke', done ? K.mintDeep : LINE);
        sa(b.chipTx, 'fill', done ? WHITE : K.ink);
        place(b.chipOk, b.x0 + 118, 120, pop(t, tb + 3.05, 0.4));
        sa(b.chipTx, 'transform', 'translate(' + f(18 * seg(t, tb + 3.05, 0.3, E.out)) + ' 0)');
        // brieven
        b.env.forEach(function (e, k2) {
          var a = pop(t, tb + k2 * 0.1, 0.4), q = seg(t, tb + 0.8, 0.35, E.in);
          place(e, b.x0 + 170 + (k2 - 1) * 34 * (1 - q), GND - 30 - 46 * (1 - q) + k2 * 0, a * (1 - q), (k2 - 1) * 10);
        });
        // rakel over het blok
        var wp = seg(t, tb + 1.6, 1.4, E.inOut), xe = lerp(b.x0 - 140 - 230 * COT, b.x0 + 360 - 230 * COT, wp);
        if (wp <= 0) show(b.newG, false); else { show(b.newG, true); if (wp >= 1) b.clip.off(); else b.clip.set(xe, -1); }
        var on = wp > 0 && wp < 1;
        show(b.band, on); show(b.edge, on);
        if (on) {
          sa(b.band, 'x1', f(xe + TOP * COT + 20)); sa(b.band, 'y1', TOP); sa(b.band, 'x2', f(xe + GND * COT + 20)); sa(b.band, 'y2', GND);
          sa(b.edge, 'x1', f(xe + TOP * COT - 2)); sa(b.edge, 'y1', TOP); sa(b.edge, 'x2', f(xe + GND * COT - 2)); sa(b.edge, 'y2', GND);
        }
        sparks(b.sp, t, tb + 3.0, 1.0, 0.9);
        // hoogwerker: naar het blok (na de brieven), omhoog, omlaag
        if (t >= tb + 0.55) lx = lerp(j ? blocks[j - 1].x0 + 170 : -160, b.x0 + 170, seg(t, tb + 0.55, j ? 0.7 : 0.9, E.inOut));
        if (t >= tb + 1.15) h = Math.min(seg(t, tb + 1.15, 0.5, E.inOut), 1 - seg(t, tb + 3.05, 0.4, E.inOut));
      });
      if (t > B0 + 3 * BD - 0.1) lx = lerp(blocks[2].x0 + 170, 1320, seg(t, B0 + 3 * BD - 0.1, 1.0, E.in));
      var py = lerp(GND - 52, 400, h), n = arms.length / 2, hs = (GND - 34 - (py + 16)) / n;
      for (i = 0; i < n; i++) {
        var ya = GND - 34 - i * hs, yb = ya - hs;
        sa(arms[2 * i], 'x1', -64); sa(arms[2 * i], 'y1', f(ya)); sa(arms[2 * i], 'x2', 64); sa(arms[2 * i], 'y2', f(yb));
        sa(arms[2 * i + 1], 'x1', 64); sa(arms[2 * i + 1], 'y1', f(ya)); sa(arms[2 * i + 1], 'x2', -64); sa(arms[2 * i + 1], 'y2', f(yb));
      }
      sa(plat, 'transform', 'translate(0 ' + f(py) + ')');
      place(lift, lx, 0, 1);
      worker.set({ x: 22, y: 0, face: -1, s: 0.46, a: h > 0.9 ? [150 + 10 * Math.sin(t * 6), 20] : [6, 10], b: [10, 10] });
      cap(t);
    }
    return pageScene(ps, rest, render, o);
  };
