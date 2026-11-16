
  /* ====================================================================== FILM
   * "Van aanvraag tot afgeleverd kozijn" — animatie voor iwrap.nl.
   * Ontwerpruimte 1920 x 1080. Alles is een pure functie van de tijd, zodat de film
   * beeld voor beeld gerenderd kan worden.
   * ====================================================================== */

  var NL = __NLDATA__;
  var FONT = "Montserrat, 'Avenir Next', 'Segoe UI', sans-serif";
  var K = {
    paper: '#F7F6F3', ink: '#22262A', inkSoft: '#3A4047', sub: '#646B73', mint: C.mint, mintSoft: '#DBECE7',
    mintWash: '#EEF6F3', mintDeep: '#2F5A50', mintInk: '#3F7468', rust: '#A8523A', gold: '#D9940A',
    brick: '#C27A5C', brickDark: '#AE6A4E', roof: '#3A4047', roofLite: '#4B535A',
    creamOld: '#CFBF96', creamOldDark: '#B5A377', creamNew: '#F3E9D4', glue: '#E3B93F', profile: '#E3E7E8',
    glass1: '#DDEAEC', glass2: '#BFD4D8', skin: '#F0C6A2', hair: '#5B3D2A', mustard: '#D9A441',
    road: '#D6D4CD', walk: '#E9E7E1', hedge: '#7DAE92', hedge2: '#96C3A8', alu: '#B9C3C6', aluDark: '#8B979B', tile: '#8A4636'
  };

  function A(node, attrs) { for (var k in attrs) node.setAttribute(k, attrs[k]); return node; }
  function Rc(p, x, y, w, h, rx, fill, extra) { var n = el('rect', { x: f(x), y: f(y), width: f(w), height: f(h), rx: f(rx || 0), fill: fill }, p); return extra ? A(n, extra) : n; }
  function Ci(p, cx, cy, r, fill, extra) { var n = el('circle', { cx: f(cx), cy: f(cy), r: f(r), fill: fill }, p); return extra ? A(n, extra) : n; }
  function Li(p, x1, y1, x2, y2, stroke, sw, extra) { var n = el('line', { x1: f(x1), y1: f(y1), x2: f(x2), y2: f(y2), stroke: stroke, 'stroke-width': sw, 'stroke-linecap': 'round' }, p); return extra ? A(n, extra) : n; }
  function Pa(p, d, fill, extra) { var n = el('path', { d: d, fill: fill }, p); return extra ? A(n, extra) : n; }
  function Tx(p, str, x, y, size, weight, fill, anchor, ls) {
    var n = el('text', { x: f(x), y: f(y), 'font-family': FONT, 'font-size': size, 'font-weight': weight, fill: fill, 'text-anchor': anchor || 'start' }, p);
    if (ls) n.setAttribute('letter-spacing', ls);
    n.textContent = str;
    return n;
  }
  function G(p, extra) { return el('g', extra || null, p); }
  function op(n, v) { sa(n, 'opacity', v >= 0.999 ? null : f(Math.max(0, v))); sa(n, 'visibility', v <= 0.001 ? 'hidden' : null); }
  function show(n, on) { sa(n, 'visibility', on ? null : 'hidden'); }
  function rad(d) { return d * Math.PI / 180; }
  // sleutelwaarden: kf(t, [[t0, v0], [t1, v1], ...]) met vloeiende overgang per stuk
  function kf(t, pts, e) {
    if (t <= pts[0][0]) return pts[0][1];
    for (var i = 1; i < pts.length; i++) {
      if (t <= pts[i][0]) return lerp(pts[i - 1][1], pts[i][1], (pts[i][2] || e || E.inOut)(clamp((t - pts[i - 1][0]) / (pts[i][0] - pts[i - 1][0]), 0, 1)));
    }
    return pts[pts.length - 1][1];
  }
  // pop: schaal van 0 naar 1 met lichte doorveer
  function pop(t, t0, d) { return seg(t, t0, d || 0.45, E.pop); }
  function textW(n, str, size) {
    try { if (n.isConnected && n.getComputedTextLength) { var w = n.getComputedTextLength(); if (w > 0) return w; } } catch (e) {}
    return str.length * size * 0.6;
  }

  /* --- ondertitel-pil: rolt uit vanuit een stip, net als het logo --- */
  function Captions(parent, list) {
    var g = G(parent), items = [];
    list.forEach(function (c) {
      var ig = G(g), size = 36, h = 84, cy = 968;
      var sh = Rc(ig, 0, cy - h / 2 + 8, h, h, h / 2, '#22262A', { opacity: 0.1 });
      var pill = Rc(ig, 0, cy - h / 2, h, h, h / 2, '#FFFFFF');
      var dot = Ci(ig, 0, cy, 11, K.mint);
      var txt = Tx(ig, c.text, 0, cy + size * 0.355, size, 600, K.ink, 'start');
      items.push({ c: c, g: ig, sh: sh, pill: pill, dot: dot, txt: txt, h: h, size: size, w: 0, fonts: -1 });
    });
    this.render = function (t) {
      var fv = (document.fonts && document.fonts.status === 'loaded') ? document.fonts.size : 0;
      for (var i = 0; i < items.length; i++) {
        var it = items[i], c = it.c;
        if (t < c.t0 - 0.05 || t > c.t1 + 0.5) { show(it.g, false); continue; }
        show(it.g, true);
        if (it.fonts !== fv || !it.w) { it.w = textW(it.txt, c.text, it.size); it.fonts = fv; }
        var full = it.w + it.h + 58, a = seg(t, c.t0, 0.6, E.out), z = seg(t, c.t1, 0.4, E.in);
        var w = lerp(it.h, full, a) * (1 - z) + it.h * z, x = 960 - w / 2, s = pop(t, c.t0, 0.35) * (1 - seg(t, c.t1 + 0.25, 0.2, E.in));
        sa(it.pill, 'x', f(x)); sa(it.pill, 'width', f(w));
        sa(it.sh, 'x', f(x)); sa(it.sh, 'width', f(w));
        sa(it.dot, 'cx', f(x + it.h / 2));
        sa(it.txt, 'x', f(x + it.h - 6));
        op(it.txt, seg(t, c.t0 + 0.28, 0.3) * (1 - seg(t, c.t1 - 0.05, 0.22)));
        sa(it.g, 'transform', s >= 0.999 ? null : 'translate(960 968) scale(' + f(s) + ') translate(-960 -968)');
      }
    };
  }

  /* --- staande versie: ondertitels als grote regels onder het beeld --- */
  function vlines(text) {
    var out = [], parts = text.split('. '), i, pt, k;
    for (i = 0; i < parts.length; i++) {
      pt = parts[i] + (i < parts.length - 1 ? '.' : '');
      k = pt.indexOf(', ');
      if (pt.length > 30 && k > 0) { out.push(pt.slice(0, k + 1)); out.push(pt.slice(k + 2)); } else out.push(pt);
    }
    // nog steeds te lang voor het staande beeld: afbreken bij de spatie het dichtst bij het midden
    return out.reduce(function (acc, s) {
      if (s.length <= 34) { acc.push(s); return acc; }
      var best = -1, mid = s.length / 2;
      for (var j = 0; j < s.length; j++) if (s.charAt(j) === ' ' && (best < 0 || Math.abs(j - mid) < Math.abs(best - mid))) best = j;
      if (best < 0) acc.push(s); else { acc.push(s.slice(0, best)); acc.push(s.slice(best + 1)); }
      return acc;
    }, []);
  }
  function CaptionsV(parent, list, y0) {
    var g = G(parent), items = list.map(function (c) {
      var ig = G(g), lines = vlines(c.text);
      return { c: c, g: ig, dot: Ci(ig, 540, y0 - 84, 10, K.mint), n: lines.map(function (s, i) { return Tx(ig, s, 540, y0 + i * 72, 52, 600, K.ink, 'middle'); }) };
    });
    this.render = function (t) {
      items.forEach(function (it) {
        var c = it.c, on = t > c.t0 - 0.05 && t < c.t1 + 0.45, z = seg(t, c.t1, 0.35);
        show(it.g, on);
        if (!on) return;
        sa(it.dot, 'r', f(10 * pop(t, c.t0, 0.4) * (1 - z)));
        it.n.forEach(function (n, i) {
          var a = seg(t, c.t0 + 0.12 + i * 0.1, 0.55, E.out);
          op(n, Math.min(seg(t, c.t0 + 0.12 + i * 0.1, 0.3), 1 - z));
          sa(n, 'transform', 'translate(0 ' + f(26 * (1 - a)) + ')');
        });
      });
    };
  }

  /* --- rakel-overgang: een mint baan veegt het volgende shot erin --- */
  function Rakel(parent) {
    var band = Li(parent, 0, 0, 0, 0, K.mint, 120), edge = Li(parent, 0, 0, 0, 0, '#FFFFFF', 10, { opacity: 0.55 });
    show(band, false); show(edge, false);
    // p = 0..1; geeft de x van de schuine rand op y = 0
    this.x = function (p) { return lerp(-1080 * COT - 200, 1920 + 200, p); };
    this.draw = function (p) {
      var on = p > 0 && p < 1;
      show(band, on); show(edge, on);
      if (!on) return;
      var xe = this.x(p), ya = -160, yb = 1240;
      sa(band, 'x1', f(xe + ya * COT + 62)); sa(band, 'y1', ya); sa(band, 'x2', f(xe + yb * COT + 62)); sa(band, 'y2', yb);
      sa(edge, 'x1', f(xe + ya * COT - 4)); sa(edge, 'y1', ya); sa(edge, 'x2', f(xe + yb * COT - 4)); sa(edge, 'y2', yb);
    };
  }

  /* --- vloeiende lijn door punten (Catmull-Rom), als reeks monsters met lengte --- */
  function Route(pts, n) {
    var out = [], i, j, len = 0;
    for (i = 0; i < pts.length - 1; i++) {
      var p0 = pts[Math.max(0, i - 1)], p1 = pts[i], p2 = pts[i + 1], p3 = pts[Math.min(pts.length - 1, i + 2)];
      for (j = 0; j < n; j++) {
        var u = j / n, u2 = u * u, u3 = u2 * u;
        out.push([0.5 * (2 * p1[0] + (-p0[0] + p2[0]) * u + (2 * p0[0] - 5 * p1[0] + 4 * p2[0] - p3[0]) * u2 + (-p0[0] + 3 * p1[0] - 3 * p2[0] + p3[0]) * u3),
          0.5 * (2 * p1[1] + (-p0[1] + p2[1]) * u + (2 * p0[1] - 5 * p1[1] + 4 * p2[1] - p3[1]) * u2 + (-p0[1] + 3 * p1[1] - 3 * p2[1] + p3[1]) * u3)]);
      }
    }
    out.push(pts[pts.length - 1]);
    var L = [0];
    for (i = 1; i < out.length; i++) { len += Math.hypot(out[i][0] - out[i - 1][0], out[i][1] - out[i - 1][1]); L.push(len); }
    this.pts = out; this.len = len;
    this.at = function (q) {
      var d = clamp(q, 0, 1) * len, lo = 0, hi = L.length - 1;
      while (hi - lo > 1) { var m = (lo + hi) >> 1; if (L[m] <= d) lo = m; else hi = m; }
      var k = (d - L[lo]) / ((L[hi] - L[lo]) || 1);
      return [lerp(out[lo][0], out[hi][0], k), lerp(out[lo][1], out[hi][1], k), lo];
    };
    this.d = function (q) {
      var a = this.at(q), s = 'M' + f(out[0][0]) + ' ' + f(out[0][1]);
      for (var k2 = 1; k2 <= a[2]; k2++) s += 'L' + f(out[k2][0]) + ' ' + f(out[k2][1]);
      return s + 'L' + f(a[0]) + ' ' + f(a[1]);
    };
  }

  /* --- het busje (zijaanzicht, rijdt naar rechts). Oorsprong: grond onder de achterkant. --- */
  function Van(parent) {
    var g = G(parent), body = G(g), self = this;
    this.g = g;
    Rc(g, 30, -8, 480, 16, 8, '#22262A', { opacity: 0.12 });
    // dakdrager met steigerbuizen
    Li(body, 70, -278, 320, -278, K.alu, 9); Li(body, 96, -290, 300, -290, K.aluDark, 7);
    Li(body, 84, -272, 84, -262, K.aluDark, 6); Li(body, 300, -272, 300, -262, K.aluDark, 6);
    Pa(body, 'M16 -52L16 -236Q16 -262 42 -262L318 -262Q348 -262 366 -246L432 -176Q440 -168 452 -166L506 -156Q530 -152 532 -128L532 -74Q532 -52 510 -52Z', K.mint);
    Pa(body, 'M330 -242L356 -242Q364 -242 370 -236L418 -186Q424 -178 414 -178L330 -178Z', '#2C3A40');
    Pa(body, 'M346 -242L360 -242L392 -208L378 -208Z', '#FFFFFF', { opacity: 0.16 });
    Li(body, 322, -246, 322, -72, K.mintDeep, 2.2, { opacity: 0.28 });
    Rc(body, 292, -166, 20, 7, 3.5, K.inkSoft);
    Rc(body, 518, -140, 12, 24, 6, '#FFF1C9');
    Rc(body, 14, -176, 8, 36, 4, K.rust);
    Rc(body, 10, -72, 528, 24, 10, K.inkSoft);
    // wit logo op de zijkant, net als op de echte bus
    var lg = G(body, { transform: 'translate(38 -230) scale(0.285)' });
    new Mark(lg, '#FFFFFF');
    new Word(lg, '#FFFFFF');
    var tg = G(body, { transform: 'translate(38 -162) scale(0.2967)' }), tag = new Tagline(G(tg, { transform: 'translate(0 -418.5)' }), '#FFFFFF');
    tag.set(9);
    Ci(g, 118, -46, 56, K.inkSoft); Ci(g, 420, -46, 56, K.inkSoft);
    this.wheels = [118, 420].map(function (cx) {
      var w = G(g);
      Ci(w, cx, -46, 46, '#22262A'); Ci(w, cx, -46, 22, '#DDE3E2');
      for (var i = 0; i < 5; i++) Ci(w, cx + 13 * Math.cos(i * 1.2566), -46 + 13 * Math.sin(i * 1.2566), 3.4, '#8B979B');
      return { g: w, cx: cx };
    });
    // x = positie achterkant, dist = afgelegde weg (voor de wielen), pitch = duik bij remmen (graden)
    this.set = function (x, y, s, dist, pitch) {
      sa(g, 'transform', 'translate(' + f(x) + ' ' + f(y) + ') scale(' + f(s) + ')');
      var a = (dist || 0) / 46 * 180 / Math.PI;
      self.wheels.forEach(function (w) { sa(w.g, 'transform', 'rotate(' + f(a % 360) + ' ' + w.cx + ' -46)'); });
      sa(body, 'transform', pitch ? 'rotate(' + f(pitch) + ' 270 -52)' : null);
    };
  }

  /* --- KAART: aanvraag, route, inzoomen -------------------------------------------- */
  function ringD(r) { var s = 'M'; for (var i = 0; i < r.length; i++) s += (i ? 'L' : '') + r[i][0] + ' ' + r[i][1]; return s + 'Z'; }
  function MapShot(st, parent, o) {
    var g = G(parent);
    Rc(g, -400, -400, 2720, 1880, 0, K.paper);
    var world = G(g), self = this;
    var landD = NL.land.map(ringD).join(''), HOME = NL.cities.Hilversum, DEST = NL.cities[o.dest || 'Groningen'];
    var landG = G(world);
    Pa(landG, landD, '#E2E9E5', { transform: 'translate(0 7)' });
    Pa(landG, landD, K.mint, { stroke: K.mint, 'stroke-width': 2.4, 'stroke-linejoin': 'round' });
    Pa(landG, ringD(NL.lake), K.paper);
    Pa(landG, ringD(NL.flevo), '#E2E9E5', { transform: 'translate(0 5)' });
    Pa(landG, ringD(NL.flevo), K.mint, { stroke: K.mint, 'stroke-width': 1.6, 'stroke-linejoin': 'round' });
    var clip = new SlantClip(st, landG);
    // route + busje
    var route = new Route(NL.route, 14);
    var routeBg = Pa(world, route.d(1), 'none', { stroke: '#FFFFFF', 'stroke-width': 5.6, 'stroke-linecap': 'round', 'stroke-linejoin': 'round', opacity: 0.55 });
    var routeLn = Pa(world, 'M0 0', 'none', { stroke: K.mintDeep, 'stroke-width': 3.4, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' });
    // plaatsen
    var pins = [], name;
    for (name in NL.cities) {
      if (name === 'Hilversum') continue;
      var c = NL.cities[name], d = Math.hypot(c[0] - HOME[0], c[1] - HOME[1]);
      pins.push({ name: name, x: c[0], y: c[1], d: d, ring: Ci(world, c[0], c[1], 0, 'none', { stroke: K.mintDeep, 'stroke-width': 1.4, opacity: 0 }), n: Ci(world, c[0], c[1], 0, '#FFFFFF', { stroke: K.mintDeep, 'stroke-width': 1.5 }) });
    }
    var dest = pins.filter(function (p) { return p.name === (o.dest || 'Groningen'); })[0];
    var pulse = [0, 1, 2].map(function () { return Ci(world, DEST[0], DEST[1], 0, 'none', { stroke: K.ink, 'stroke-width': 1.6 }); });
    var destDot = Ci(world, DEST[0], DEST[1], 0, K.ink);
    var check = Pa(world, 'M' + (DEST[0] - 5) + ' ' + DEST[1] + 'l3.6 3.8l6.4 -7.6', 'none', { stroke: '#FFFFFF', 'stroke-width': 2.6, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' });
    var homeG = G(world), homeDisc = Ci(homeG, HOME[0], HOME[1], 21, '#FFFFFF', { stroke: K.mintDeep, 'stroke-width': 1.6 });
    new Mark(G(homeG, { transform: 'translate(' + (HOME[0] - 13.4) + ' ' + (HOME[1] - 7.2) + ') scale(0.09)' }), K.mint);
    var vanG = G(world);
    Ci(vanG, 0, 1.5, 21, '#22262A', { opacity: 0.12 }); Ci(vanG, 0, 0, 21, '#FFFFFF', { stroke: K.mintDeep, 'stroke-width': 1.5 });
    var van = new Van(vanG);
    // labels en kaartje in schermruimte (blijven even groot bij het inzoomen)
    var ui = G(g);
    var lblHome = Tx(ui, 'Hilversum', 0, 0, 24, 600, K.ink, 'end');
    var lblDest = Tx(ui, o.dest || 'Groningen', 0, 0, 24, 600, K.ink, 'start');
    var card = G(ui);
    Rc(card, 0, 10, 372, 118, 26, '#22262A', { opacity: 0.1 });
    Rc(card, 0, 0, 372, 118, 26, '#FFFFFF');
    Rc(card, 18, 18, 82, 82, 16, K.mintSoft);
    Rc(card, 36, 34, 46, 50, 5, K.creamOld); Rc(card, 43, 41, 32, 36, 2, K.glass1);
    Li(card, 34, 88, 84, 78, K.rust, 5);
    Tx(card, 'Nieuwe aanvraag', 118, 52, 27, 700, K.ink);
    Tx(card, 'foto + maten', 118, 86, 21, 500, K.sub);
    var chips = ['Vaste prijs', 'Afspraak gepland'].map(function (s, i) {
      var cg = G(ui), w = i ? 292 : 220;
      Rc(cg, 0, 0, w, 58, 29, K.mintDeep);
      Ci(cg, 29, 29, 15, '#FFFFFF');
      Pa(cg, 'M22 29l5 5.4l9 -10.6', 'none', { stroke: K.mintDeep, 'stroke-width': 3.6, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' });
      Tx(cg, s, 56, 38, 23, 600, '#FFFFFF');
      return { g: cg, w: w };
    });
    // titelblok links
    var title = G(g);
    var tl = [Tx(title, 'IWRAP  ·  SPECIALIST IN KOZIJNFOLIE', 150, 372, 21, 600, K.mintInk, 'start', '0.24em'),
      Tx(title, 'Waar je ook', 146, 476, 88, 700, K.ink), Tx(title, 'woont in', 146, 576, 88, 700, K.ink), Tx(title, 'Nederland', 146, 676, 88, 700, K.ink),
      Tx(title, 'Wij komen naar je toe.', 150, 752, 34, 500, K.sub)];
    var maxD = 0; pins.forEach(function (p) { maxD = Math.max(maxD, p.d); });

    // camera: [cx, cy, zoom] in kaart-eenheden
    function cam(t) {
      var T = o.T, vp = route.at(seg(t, T.route, T.routeD, E.glide)), k, z, cx, cy;
      var c0 = [-287, -5, 1.08], c1 = [40, -176, 1.45];
      if (t < T.book) return c0;
      if (t < T.route) { k = E.inOut(seg(t, T.book, 1.5)); return [lerp(c0[0], c1[0], k), lerp(c0[1], c1[1], k), lerp(c0[2], c1[2], k)]; }
      k = E.inOut(seg(t, T.route + 0.2, 2.2));
      z = lerp(c1[2], 2.7, E.inOut(seg(t, T.route + 0.2, T.routeD - 0.6))) * lerp(1, 2.4, E.in(seg(t, T.iris - 0.5, 1.4)));
      cx = lerp(c1[0], vp[0], k); cy = lerp(c1[1], vp[1] - 12, k);
      return [cx, cy, z];
    }
    this.cam = cam;
    this.screen = function (p, c) { return [960 + c[2] * (p[0] - c[0]), 540 + c[2] * (p[1] - c[1])]; };
    // mode 'in' = openingsdeel; mode 'out' = terug uitgezoomd aan het eind (to = tijd binnen dat deel)
    this.render = function (t, mode, to) {
      var T = o.T, c, i, p, a;
      if (mode === 'out') {
        var k2 = E.inOut(seg(to, 0, 1.6));
        c = [lerp(DEST[0], -150, k2), lerp(DEST[1] - 10, -5, k2), lerp(3.2, 1.08, k2)];
      } else c = cam(t);
      sa(world, 'transform', 'translate(960 540) scale(' + f(c[2]) + ') translate(' + f(-c[0]) + ' ' + f(-c[1]) + ')');
      if (mode === 'out') {
        clip.off();
        for (i = 0; i < pins.length; i++) {
          p = pins[i];
          sa(p.n, 'r', p === dest ? 0 : 6.2);
          a = ((to * 0.55 + p.d * 0.0031) % 1);
          sa(p.ring, 'r', f(6 + a * 16)); sa(p.ring, 'opacity', f((1 - a) * 0.55 * seg(to, 0.8, 0.6)));
        }
        pulse.forEach(function (n) { sa(n, 'r', 0); });
        sa(destDot, 'r', f(10 * pop(to, 0.2, 0.5))); op(check, seg(to, 0.5, 0.3));
        sa(routeLn, 'd', route.d(1)); op(routeLn, 1 - seg(to, 0.4, 0.8)); op(routeBg, 0);
        show(vanG, false); show(card, false); chips.forEach(function (ch) { show(ch.g, false); });
        show(title, false); show(lblDest, false);
        var hs = this.screen(HOME, c);
        sa(lblHome, 'x', f(hs[0] - 34)); sa(lblHome, 'y', f(hs[1] + 8)); op(lblHome, seg(to, 1.0, 0.4));
        sa(homeG, 'transform', null);
        return;
      }
      // land veegt erin
      var lp = seg(t, 0.15, 1.1, E.inOut);
      if (lp >= 1) clip.off(); else clip.set(lerp(-560, 620, lp), -1);
      // titel
      for (i = 0; i < tl.length; i++) {
        a = seg(t, 0.25 + i * 0.11, 0.7, E.out);
        var out = seg(t, T.book - 0.1 + i * 0.04, 0.45, E.in);
        op(tl[i], Math.min(seg(t, 0.25 + i * 0.11, 0.35), 1 - out));
        sa(tl[i], 'transform', 'translate(' + f(-70 * out) + ' ' + f(26 * (1 - a)) + ')');
      }
      // thuisbasis en plaatsen
      var hsS = pop(t, 1.0, 0.5);
      sa(homeG, 'transform', 'translate(' + HOME[0] + ' ' + HOME[1] + ') scale(' + f(hsS) + ') translate(' + (-HOME[0]) + ' ' + (-HOME[1]) + ')');
      for (i = 0; i < pins.length; i++) {
        p = pins[i];
        var t0 = 1.35 + (p.d / maxD) * 1.5;
        sa(p.n, 'r', f(6.2 * pop(t, t0, 0.4) * (p === dest ? 1 - seg(t, T.book + 0.2, 0.3) : 1)));
        a = seg(t, t0, 0.7);
        sa(p.ring, 'r', f(6 + a * 15)); sa(p.ring, 'opacity', f(a > 0 && a < 1 ? (1 - a) * 0.6 : 0));
      }
      // bestemming: pulserende ringen
      sa(destDot, 'r', f(9 * pop(t, T.book + 0.25, 0.45)));
      op(check, 0);
      pulse.forEach(function (n, j) {
        var q = ((t - T.book - 0.3) / 1.5 + j / 3) % 1, on = t > T.book + 0.3 && t < T.iris;
        sa(n, 'r', f(on ? 9 + q * 34 : 0)); sa(n, 'opacity', f(on ? (1 - q) * 0.5 : 0));
      });
      // labels
      var hs2 = this.screen(HOME, c), ds = this.screen(DEST, c);
      sa(lblHome, 'x', f(hs2[0] - 26 * c[2] / 1.08 - 8)); sa(lblHome, 'y', f(hs2[1] + 8));
      op(lblHome, Math.min(seg(t, 1.3, 0.4), 1 - seg(t, T.route + 1.4, 0.5)));
      sa(lblDest, 'x', f(ds[0] + 22)); sa(lblDest, 'y', f(ds[1] - 16));
      op(lblDest, Math.min(seg(t, T.book + 0.5, 0.4), 1 - seg(t, T.iris - 0.3, 0.3)));
      // kaartje met de aanvraag
      var cs = pop(t, T.book + 0.55, 0.5) * (1 - seg(t, T.route - 0.05, 0.3, E.in)), cxp = ds[0] - 420, cyp = ds[1] + 34;
      show(card, cs > 0.001);
      sa(card, 'transform', 'translate(' + f(cxp + 372) + ' ' + f(cyp) + ') scale(' + f(cs) + ') translate(-372 0)');
      chips.forEach(function (ch, j) {
        var s2 = pop(t, T.book + 1.55 + j * 0.75, 0.45) * (1 - seg(t, T.route - 0.05 + j * 0.05, 0.3, E.in));
        show(ch.g, s2 > 0.001);
        sa(ch.g, 'transform', 'translate(' + f(cxp + 372) + ' ' + f(cyp + 136 + j * 70) + ') scale(' + f(s2) + ') translate(' + (-ch.w) + ' 0)');
      });
      // route en busje
      var rq = seg(t, T.route, T.routeD, E.glide), vp = route.at(rq), vs = pop(t, T.route - 0.35, 0.4), VS = 0.056;
      sa(routeLn, 'd', route.d(rq)); op(routeLn, t >= T.route ? 1 : 0);
      op(routeBg, seg(t, T.route - 0.3, 0.5) * 0.55);
      show(vanG, vs > 0.0005);
      sa(vanG, 'transform', 'translate(' + f(vp[0]) + ' ' + f(vp[1]) + ') scale(' + f(vs) + ')');
      van.set(-270 * VS, 150 * VS, VS, rq * route.len / VS, 0);
    };
    this.g = g; this.dest = DEST;
  }

  /* ================================================================ de film */
  SC.klus = function (o) {
    var W = o.frame ? o.frame[0] : 1920, H = o.frame ? o.frame[1] : 1080, th = theme({ theme: 'light' });
    var st = Stage({ frame: [W, H], label: 'iWrap: van aanvraag tot afgeleverd kozijn' }, W, H, th);
    var vert = H > W * 1.2, sc = Math.min(W / 1920, H / 1080), root, vui = null;
    if (vert) {
      // staand: het filmbeeld als kaart in het midden, logo erboven, ondertitels groot eronder (ontwerpruimte 1080 breed)
      var fsc = W / 1080, fg = G(st.svg, { transform: 'scale(' + f(fsc) + ')' }), VH = H / fsc;
      Rc(fg, 0, 0, 1080, VH, 0, '#FFFFFF');
      var bx = 36, bw = 1008, bh = 567, by = Math.round(VH * 0.5 - 400);
      Rc(fg, bx, by + 16, bw, bh, 32, '#22262A', { opacity: 0.1 });
      var cpv = el('clipPath', { id: st.id + 'vb' }, st.defs);
      Rc(cpv, bx, by, bw, bh, 32);
      root = G(G(fg, { 'clip-path': 'url(#' + st.id + 'vb)' }), { transform: 'translate(' + bx + ' ' + by + ') scale(' + f(bw / 1920) + ')' });
      vui = { g: fg, by: by, bh: bh, VH: VH };
    } else root = G(st.svg, { transform: 'translate(' + f((W - 1920 * sc) / 2) + ' ' + f((H - 1080 * sc) / 2) + ') scale(' + f(sc) + ')' });
    Rc(root, -400, -400, 2720, 1880, 0, K.paper);
    var T = { book: 3.8, route: 7.7, routeD: 4.3 };
    T.iris = T.route + T.routeD + 0.35;            // de stip groeit tot het hele beeld mint is
    T.street = T.iris + 0.75;                      // straat veegt erin
    var mapIn = new MapShot(st, root, { T: T, dest: o.dest });
    var iris = Ci(root, 0, 0, 0, K.mint);
    var extra = SC.klus.build ? SC.klus.build(st, root, T, o) : null;
    var rakel = new Rakel(root);
    var capList = [
      { t0: T.book + 0.9, t1: T.route - 0.25, text: 'Stuur een foto. Je krijgt een vaste prijs.' },
      { t0: T.route + 0.5, t1: T.iris - 0.35, text: 'Wij komen naar je toe.' }
    ];
    if (extra) capList = capList.concat(extra.captions);
    // Op de site staan de ondertitels als tekst bij de video (leesbaar op een telefoon): dan rendert de film
    // zonder (opts.ondertitels = false). De lijst gaat mee terug als captions.
    var caps = o.ondertitels === false ? null : vert ? new CaptionsV(vui.g, capList, vui.by + vui.bh + 170) : new Captions(root, capList);
    if (vert) {
      var L0 = GEO.lockups.horizontal, ls0 = 500 / L0.w, thL = theme({ theme: 'light' }), thM = theme({ theme: 'mint' });
      vui.logo = uitrolInto(st, G(vui.g, { transform: 'translate(' + f(540 - L0.w * ls0 / 2) + ' ' + f(vui.by - 250) + ') scale(' + f(ls0) + ')' }), L0, 'horizontal', thL, { outro: false, hold: 0, shift: false, sheen: false });
      vui.url = Tx(vui.g, 'iwrap.nl', 540, vui.VH - 150, 40, 600, K.mintInk, 'middle', '0.06em');
      // eindkaart over het hele beeld
      var eg = G(vui.g), L1 = GEO.lockups.tagline, ls1 = 760 / L1.w;
      Rc(eg, 0, 0, 1080, vui.VH, 0, K.mint);
      var rgv = el('radialGradient', { id: st.id + 'vg', gradientUnits: 'userSpaceOnUse', cx: 540, cy: f(vui.VH / 2), r: f(vui.VH * 0.62) }, st.defs);
      el('stop', { offset: 0, 'stop-color': '#000' }, rgv); el('stop', { offset: 0.42, 'stop-color': '#000' }, rgv); el('stop', { offset: 1, 'stop-color': '#fff' }, rgv);
      var mkv = el('mask', { id: st.id + 'vm', maskUnits: 'userSpaceOnUse', x: 0, y: 0, width: 1080, height: f(vui.VH) }, st.defs);
      Rc(mkv, 0, 0, 1080, vui.VH, 0, 'url(#' + st.id + 'vg)');
      vui.pat = new Pattern(G(eg, { mask: 'url(#' + st.id + 'vm)' }), 1080, vui.VH, thM.pat, { patScale: 1.25, patLoop: 16, seed: 11 });
      vui.endLogo = uitrolInto(st, G(eg, { transform: 'translate(' + f(540 - L1.w * ls1 / 2) + ' ' + f(vui.VH / 2 - L1.h * ls1 / 2 - 60) + ') scale(' + f(ls1) + ')' }), L1, 'tagline', thM, { outro: false, hold: 0, shift: true });
      vui.endUrl = Tx(eg, 'iwrap.nl', 540, vui.VH / 2 + 300, 50, 600, '#FFFFFF', 'middle', '0.06em');
      vui.endG = eg;
    }
    var duration = extra ? extra.duration : T.street + 0.5;
    function render(t) {
      var mapOn = t < T.street + 0.05;
      show(mapIn.g, mapOn);
      if (mapOn) mapIn.render(t, 'in');
      // iris vanuit de bestemming
      var ip = seg(t, T.iris, 0.7, E.in), c = mapIn.cam(t), ds = mapIn.screen(mapIn.dest, c);
      var irisOn = ip > 0 && (!extra || t < extra.irisOff);
      show(iris, irisOn);
      if (irisOn) { sa(iris, 'cx', f(ds[0])); sa(iris, 'cy', f(ds[1])); sa(iris, 'r', f(ip * 2300)); }
      if (extra) extra.render(t, rakel);
      if (caps) caps.render(t);
      if (vert) {
        vui.logo.render(t - 0.2);
        op(vui.url, seg(t, 1.2, 0.5));
        var te = extra ? t - T.end - 0.45 : -1, eo = seg(te, 0, 0.55, E.inOut);
        op(vui.endG, eo);
        if (eo > 0) { vui.pat.render(te); vui.endLogo.render(te - 0.35); op(vui.endUrl, seg(te, 0.35 + vui.endLogo.rest - 0.9, 0.5)); }
      }
    }
    return { svg: st.svg, duration: duration, rest: duration, render: render, T: T, captions: capList };
  };
