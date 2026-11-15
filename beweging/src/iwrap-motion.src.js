/*!
 * iWrap Motion — logo-animaties voor website en video.
 * Eén bestand, geen afhankelijkheden. Alle vormen komen 1-op-1 uit de officiële logo-vectoren.
 *
 * Gebruik (website):
 *   <div data-iwrap="uitrol" data-lockup="horizontal" data-theme="light"></div>
 *   <script src="iwrap-motion.js"></script>
 * of in JavaScript:
 *   iWrapMotion.mount('#logo', 'uitrol', { lockup: 'horizontal', theme: 'light', play: 'once' });
 */
(function (root) {
  'use strict';

  var GEO = __GEO__;
  var NS = 'http://www.w3.org/2000/svg';
  var C = GEO.colors;
  var M = GEO.mark;

  // De schuinte van de banen in het beeldmerk: alle beweging volgt deze richting.
  var THETA = Math.atan2(M.pills[1].S[1], M.pills[1].S[0]);
  var UX = Math.cos(THETA), UY = Math.sin(THETA), COT = UX / UY;
  var uid = 0;

  /* ------------------------------------------------------------------ helpers */

  function clamp(x, a, b) { return x < a ? a : x > b ? b : x; }
  function lerp(a, b, t) { return a + (b - a) * t; }
  function f(n) { return Math.round(n * 1000) / 1000; }

  function bezier(x1, y1, x2, y2) {
    var cx = 3 * x1, bx = 3 * (x2 - x1) - cx, ax = 1 - cx - bx;
    var cy = 3 * y1, by = 3 * (y2 - y1) - cy, ay = 1 - cy - by;
    function sx(t) { return ((ax * t + bx) * t + cx) * t; }
    function sy(t) { return ((ay * t + by) * t + cy) * t; }
    function dx(t) { return (3 * ax * t + 2 * bx) * t + cx; }
    return function (x) {
      if (x <= 0) return 0;
      if (x >= 1) return 1;
      var t = x, i, e, d;
      for (i = 0; i < 8; i++) {
        e = sx(t) - x;
        if (Math.abs(e) < 1e-6) return sy(t);
        d = dx(t);
        if (Math.abs(d) < 1e-6) break;
        t -= e / d;
      }
      var lo = 0, hi = 1;
      t = x;
      for (i = 0; i < 32; i++) {
        e = sx(t);
        if (Math.abs(e - x) < 1e-6) break;
        if (x > e) lo = t; else hi = t;
        t = (lo + hi) / 2;
      }
      return sy(t);
    };
  }

  // Easing-set. "out" = aandrukken (snel starten, lang uitlopen), "roll" = uitrollen met mini-overshoot.
  var E = {
    lin: function (t) { return t; },
    out: bezier(0.16, 1, 0.3, 1),
    outSoft: bezier(0.25, 1, 0.5, 1),
    inOut: bezier(0.65, 0, 0.35, 1),
    glide: bezier(0.5, 0, 0.15, 1),
    roll: bezier(0.6, 0, 0.2, 1.18),
    rollFlat: bezier(0.6, 0, 0.2, 1),
    in: bezier(0.7, 0, 0.84, 0),
    inSoft: bezier(0.5, 0, 0.75, 0),
    pop: function (t) { var c = 1.6, u = t - 1; return 1 + (c + 1) * u * u * u + c * u * u; }
  };
  function seg(t, t0, d, e) { var p = clamp((t - t0) / d, 0, 1); return e ? e(p) : p; }

  function el(name, attrs, parent) {
    var n = document.createElementNS(NS, name), k;
    if (attrs) for (k in attrs) if (attrs[k] != null) n.setAttribute(k, attrs[k]);
    if (parent) parent.appendChild(n);
    return n;
  }
  // setAttribute met cache: alleen schrijven als de waarde echt verandert.
  function sa(n, k, v) {
    var c = n.__iw || (n.__iw = {});
    if (c[k] === v) return;
    c[k] = v;
    if (v === null) n.removeAttribute(k); else n.setAttribute(k, v);
  }
  function tr(x, y, s) {
    var out = (x || y) ? 'translate(' + f(x) + ' ' + f(y) + ')' : '';
    if (s != null && s !== 1) out += (out ? ' ' : '') + 'scale(' + f(s) + ')';
    return out || null;
  }

  // Mengt twee hex-kleuren.
  function mix(a, b, t) {
    function h(c, i) { return parseInt(c.substr(1 + i * 2, 2), 16); }
    var out = '#', i, v;
    for (i = 0; i < 3; i++) {
      v = Math.round(lerp(h(a, i), h(b, i), t)).toString(16);
      out += v.length < 2 ? '0' + v : v;
    }
    return out.toUpperCase();
  }

  /* ------------------------------------------------------------- vormen */

  // Exacte baan uit het logo. a = positie bovenkap (0 = thuis, 1 = helemaal onderaan),
  // b = positie onderkap (1 = thuis, 0 = helemaal bovenaan). a=0,b=1 is pixel-exact het origineel.
  function pillD(p, a, b) {
    var sx = p.S[0], sy = p.S[1];
    var tx = a * sx, ty = a * sy, bx = (b - 1) * sx, by = (b - 1) * sy;
    var B = p.bot, T = p.top;
    function P(q, ox, oy) { return f(q[0] + ox) + ' ' + f(q[1] + oy); }
    return 'M' + P(B[0], bx, by) + 'C' + P(B[1], bx, by) + ' ' + P(B[2], bx, by) + ' ' + P(B[3], bx, by) +
      'L' + P(B[4], bx, by) + 'C' + P(B[5], bx, by) + ' ' + P(B[6], bx, by) + ' ' + P(B[7], bx, by) +
      'L' + P(T[0], tx, ty) + 'C' + P(T[1], tx, ty) + ' ' + P(T[2], tx, ty) + ' ' + P(T[3], tx, ty) +
      'L' + P(T[4], tx, ty) + 'C' + P(T[5], tx, ty) + ' ' + P(T[6], tx, ty) + ' ' + P(T[7], tx, ty) + 'Z';
  }
  function circleD(cx, cy, r) {
    return 'M' + f(cx - r) + ' ' + f(cy) + 'A' + f(r) + ' ' + f(r) + ' 0 1 1 ' + f(cx + r) + ' ' + f(cy) +
      'A' + f(r) + ' ' + f(r) + ' 0 1 1 ' + f(cx - r) + ' ' + f(cy) + 'Z';
  }

  var THEMES = {
    light: { bg: '#FFFFFF', mark: C.mint, word: C.ink, tag: C.gray, sheen: '#CDE4DE', wordHi: '#8A8A8A',
             pat: ['#EEF6F4', '#E3F0EC'], under: C.ink },
    dark: { bg: C.ink, mark: C.mint, word: '#FFFFFF', tag: C.mint, sheen: '#CDE4DE', wordHi: '#CFE6E0',
            pat: ['#2E2F2F', '#353737'], under: '#FFFFFF' },
    mint: { bg: C.mint, mark: '#FFFFFF', word: '#FFFFFF', tag: '#FFFFFF', sheen: '#E4F1EE', wordHi: '#E4F1EE',
            pat: ['#9DC7BD', '#B3D6CE'], under: '#FFFFFF' }
  };
  function theme(o) {
    var t = o.theme || 'light', base = typeof t === 'string' ? (THEMES[t] || THEMES.light) : t, out = {}, k;
    for (k in THEMES.light) out[k] = THEMES.light[k];
    for (k in base) out[k] = base[k];
    return out;
  }

  function Stage(o, W, H, th) {
    var id = 'iw' + (++uid);
    var svg = el('svg', { xmlns: NS, viewBox: '0 0 ' + f(W) + ' ' + f(H), role: 'img', 'aria-label': o.label || 'iWrap' });
    svg.style.display = 'block';
    svg.style.width = '100%';
    svg.style.height = o.frame ? '100%' : 'auto';
    var defs = el('defs', null, svg);
    var bg = o.bg === true ? th.bg : (typeof o.bg === 'string' ? o.bg : null);
    if (bg) el('rect', { x: 0, y: 0, width: f(W), height: f(H), fill: bg }, svg);
    return { id: id, svg: svg, defs: defs, W: W, H: H };
  }

  // Plaatst een lock-up in het beeld. Zonder "frame" krijgt de SVG precies de maat van het logo (+ marge).
  function layout(o, lw, lh, pad) {
    var W, H, s;
    if (o.frame) {
      W = o.frame[0]; H = o.frame[1];
      s = Math.min(W * (o.fit || 0.44) / lw, H * (o.fitH || 0.56) / lh);
    } else {
      pad = o.pad != null ? o.pad : pad;
      W = lw + 2 * pad; H = lh + 2 * pad; s = 1;
    }
    return { W: W, H: H, s: s, ox: (W - lw * s) / 2 + (o.dx || 0), oy: (H - lh * s) / 2 + (o.dy || 0) };
  }

  /* --- beeldmerk --- */
  function Mark(parent, fill) {
    var g = el('g', null, parent);
    this.g = g;
    this.dots = M.dots.map(function (d) { return el('circle', { cx: d.cx, cy: d.cy, r: d.r, fill: fill }, g); });
    this.pills = M.pills.map(function (p) { return el('path', { d: pillD(p, 0, 1), fill: fill }, g); });
  }
  Mark.prototype.fill = function (c) {
    var i;
    for (i = 0; i < 2; i++) sa(this.dots[i], 'fill', c);
    for (i = 0; i < 3; i++) sa(this.pills[i], 'fill', c);
  };
  // st = { d: [schaalL, schaalR], p: [[a, b, schaal] x3], o: [[dx,dy],[dx,dy]] (optioneel, stip-verschuiving) }
  Mark.prototype.set = function (st) {
    var i, q, p, a, b, s, m, cx, cy, d, off;
    for (i = 0; i < 2; i++) {
      d = M.dots[i]; s = Math.max(0, st.d[i]); off = st.o ? st.o[i] : null;
      sa(this.dots[i], 'r', f(d.r * s));
      sa(this.dots[i], 'cx', f(d.cx + (off ? off[0] : 0)));
      sa(this.dots[i], 'cy', f(d.cy + (off ? off[1] : 0)));
    }
    for (i = 0; i < 3; i++) {
      q = st.p[i]; p = M.pills[i]; a = q[0]; b = q[1]; s = q[2];
      if (s <= 0.0005) { sa(this.pills[i], 'visibility', 'hidden'); continue; }
      sa(this.pills[i], 'visibility', null);
      sa(this.pills[i], 'd', pillD(p, a, b));
      if (s === 1) sa(this.pills[i], 'transform', null);
      else {
        m = (a + b) / 2; cx = p.tc[0] + m * p.S[0]; cy = p.tc[1] + m * p.S[1];
        sa(this.pills[i], 'transform', 'translate(' + f(cx) + ' ' + f(cy) + ') scale(' + f(s) + ') translate(' + f(-cx) + ' ' + f(-cy) + ')');
      }
    }
  };

  var MARK_FULL = { d: [1, 1], p: [[0, 1, 1], [0, 1, 1], [0, 1, 1]] };
  var MARK_NONE = { d: [0, 0], p: [[0, 1, 0], [0, 1, 0], [0, 1, 0]] };

  // "De uitrol": stippen landen, drie ervan rollen langs de schuinte uit tot banen.
  function markIntro(tau) {
    var p = [], k;
    for (k = 0; k < 3; k++) {
      p.push([0,
        seg(tau, 0.16 + 0.10 * k, k === 0 ? 0.72 : 0.92, E.roll),
        seg(tau, 0.06 + 0.09 * k, 0.32, E.out)]);
    }
    return { d: [seg(tau, 0, 0.5, E.pop), seg(tau, 0.84, 0.5, E.pop)], p: p };
  }
  markIntro.dur = 1.36;

  // Uitgang: de banen rollen door (staart haalt de kop in) en de stippen verdwijnen.
  function markOutro(tau) {
    var p = [], k;
    for (k = 0; k < 3; k++) {
      p.push([seg(tau, 0.05 * k, 0.36, E.in), 1, 1 - seg(tau, 0.30 + 0.05 * k, 0.22, E.in)]);
    }
    return { d: [1 - seg(tau, 0, 0.26, E.in), 1 - seg(tau, 0.34, 0.26, E.in)], p: p };
  }
  markOutro.dur = 0.64;

  /* --- woordmerk --- */
  var LETTER_OF = [0, 0, 1, 2, 3, 4];   // onderdeel -> letterindex (i-stip en i-stam horen bij "i")
  function Word(parent, fill) {
    var g = el('g', null, parent);
    this.g = g;
    this.parts = GEO.word.parts.map(function (p) { return el('path', { d: p.d, fill: fill }, g); });
  }
  Word.prototype.fill = function (c) { this.parts.forEach(function (n) { sa(n, 'fill', c); }); };
  // per letter een x-verschuiving (array van 5)
  Word.prototype.shift = function (dx) {
    for (var i = 0; i < this.parts.length; i++) {
      var v = dx[LETTER_OF[i]];
      sa(this.parts[i], 'transform', v ? 'translate(' + f(v) + ' 0)' : null);
    }
  };

  /* --- tagline --- */
  function Tagline(parent, fill) {
    var g = el('g', null, parent), T = GEO.tag;
    this.g = g;
    this.cx = T.parts.map(function (p) { return (p.bbox[0] + p.bbox[2]) / 2; });
    this.mid = (T.bbox[0] + T.bbox[2]) / 2;
    this.parts = T.parts.map(function (p) { return el('path', { d: p.d, fill: fill }, g); });
  }
  // "Track-in": letters komen van iets wijder gespatieerd naar hun plek.
  Tagline.prototype.set = function (tau, out) {
    var n = this.parts.length, i, p, o, x;
    for (i = 0; i < n; i++) {
      p = seg(tau, i * 0.02, 0.85, E.out);
      o = seg(tau, i * 0.02, 0.4) * (out == null ? 1 : out);
      x = (this.cx[i] - this.mid) * 0.09 * (1 - p);
      sa(this.parts[i], 'opacity', o >= 1 ? null : f(o));
      sa(this.parts[i], 'transform', Math.abs(x) < 0.001 ? null : 'translate(' + f(x) + ' 0)');
    }
  };
  Tagline.dur = 0.85 + 22 * 0.02;

  /* --- schuine maskers (de "rakel") --- */
  function SlantClip(stage, target) {
    var id = stage.id + 'c' + (++uid);
    var cp = el('clipPath', { id: id, clipPathUnits: 'userSpaceOnUse' }, stage.defs);
    var poly = el('polygon', { points: '0,0 0,0 0,0' }, cp);
    this.target = target;
    this.url = 'url(#' + id + ')';
    this.poly = poly;
  }
  // x = waar de schuine rand y=0 kruist. side: -1 = links zichtbaar, +1 = rechts zichtbaar.
  SlantClip.prototype.set = function (x, side) {
    var yA = -3000, yB = 4000, far = side < 0 ? -20000 : 20000;
    sa(this.poly, 'points', f(x + yA * COT) + ',' + yA + ' ' + f(x + yB * COT) + ',' + yB + ' ' + far + ',' + yB + ' ' + far + ',' + yA);
    sa(this.target, 'clip-path', this.url);
  };
  SlantClip.prototype.off = function () { sa(this.target, 'clip-path', null); };

  /* --- glans (folie-highlight) als meebewegend verloop --- */
  function Sheen(stage, base, light) {
    var id = stage.id + 'g' + (++uid);
    var lg = el('linearGradient', { id: id, gradientUnits: 'userSpaceOnUse' }, stage.defs);
    el('stop', { offset: 0, 'stop-color': base }, lg);
    el('stop', { offset: 0.5, 'stop-color': light }, lg);
    el('stop', { offset: 1, 'stop-color': base }, lg);
    this.lg = lg;
    this.url = 'url(#' + id + ')';
  }
  Sheen.prototype.at = function (x, w) {
    sa(this.lg, 'x1', f(x - w / 2 * UY)); sa(this.lg, 'y1', f(w / 2 * UX));
    sa(this.lg, 'x2', f(x + w / 2 * UY)); sa(this.lg, 'y2', f(-w / 2 * UX));
  };

  /* ================================================================ scènes */

  var SC = {};

  /* 1. UITROL — de signatuur-animatie -------------------------------------- */
  SC.uitrol = function (o) {
    var lockName = o.lockup || 'horizontal', L = GEO.lockups[lockName], th = theme(o);
    var lay = layout(o, L.w, L.h, 14);
    var st = Stage(o, lay.W, lay.H, th);
    var rootG = el('g', { transform: 'translate(' + f(lay.ox) + ' ' + f(lay.oy) + ') scale(' + f(lay.s) + ')' }, st.svg);
    return uitrolInto(st, rootG, L, lockName, th, o);
  };

  function uitrolInto(st, rootG, L, lockName, th, o) {
    var hasWord = !!L.word, hasTag = !!L.tag;
    var shift = hasWord && o.shift !== false;
    var emerge = shift && lockName === 'horizontal';
    var wordClipG, wordG, word, clip, tagG, tag;
    if (hasWord) {
      wordClipG = el('g', null, rootG);
      wordG = el('g', { transform: 'translate(' + L.word[0] + ' ' + L.word[1] + ')' }, wordClipG);
      word = new Word(wordG, th.word);
      clip = new SlantClip(st, wordClipG);
    }
    if (hasTag) {
      tagG = el('g', { transform: 'translate(' + L.tag[0] + ' ' + L.tag[1] + ')' }, rootG);
      tag = new Tagline(tagG, th.tag);
    }
    var markG = el('g', null, rootG);
    var mark = new Mark(markG, th.mark);
    var sheen = o.sheen === false ? null : new Sheen(st, th.mark, th.sheen);

    // beginpositie van het beeldmerk (gecentreerd in de lock-up)
    var dx0 = 0, dy0 = 0;
    if (shift) {
      if (lockName === 'horizontal') dx0 = (L.w - M.w) / 2 - L.mark[0];
      else dy0 = (L.h - M.h) / 2 - L.mark[1];
    }
    // woordmerk-geometrie in lock-up-coördinaten
    var wb = GEO.word.bbox, wl = 0, wr = 0, wt = 0, wbt = 0, EDGE0 = 0, DW = 0;
    if (hasWord) {
      wl = wb[0] + L.word[0]; wr = wb[2] + L.word[0]; wt = wb[1] + L.word[1]; wbt = wb[3] + L.word[1];
      // schuine lijn die de rechterstip raakt: daarachter komt het woordmerk vandaan
      EDGE0 = M.dots[1].cx + M.dots[1].r * UY - (M.dots[1].cy - M.dots[1].r * UX) * COT + 4;
      DW = wr - (L.mark[0] + dx0 + EDGE0 + wt * COT) + 16;
    }

    var k = o.speed || 1;                                  // interne temposchaal (1 = standaard)
    var T = {};
    T.mark = 0.12;
    T.shift = T.mark + 0.80; T.shiftD = 0.85;
    T.word = hasWord ? (shift ? T.shift + 0.04 : T.mark + 0.62) : 0;
    T.wordD = emerge ? 0.85 : 0.80;
    T.wordEnd = hasWord ? T.word + T.wordD + 0.32 : T.mark + markIntro.dur;
    T.tag = hasTag ? T.word + 0.42 : 0;
    T.tagEnd = hasTag ? T.tag + Tagline.dur : 0;
    T.sheen = Math.max(T.mark + markIntro.dur - 0.25, hasWord ? T.wordEnd - 0.55 : 0);
    T.sheenD = 0.95;
    var rest = Math.max(T.mark + markIntro.dur, T.wordEnd, T.tagEnd, sheen ? T.sheen + T.sheenD : 0);
    var hold = o.hold != null ? o.hold : 1.4;
    var outro = o.outro === false ? 0 : 0.72;
    var tail = o.outro === false ? 0 : (o.gap != null ? o.gap : 0.35);
    var duration = rest + hold + outro + tail;

    function render(t) {
      var tau = t - T.mark, to = t - (rest + hold), out = outro && to > 0;
      // --- beeldmerk
      var stt = tau < 0 ? MARK_NONE : (out ? markOutro(to) : markIntro(tau));
      mark.set(stt);
      var sp = shift ? seg(t, T.shift, T.shiftD, E.inOut) : 1;
      var mdx = dx0 * (1 - sp), mdy = dy0 * (1 - sp);
      sa(markG, 'transform', tr(L.mark[0] + mdx, L.mark[1] + mdy));
      // --- glans
      if (sheen) {
        var gp = seg(t, T.sheen, T.sheenD);
        if (gp > 0 && gp < 1 && !out) { sheen.at(lerp(-150, M.w + 80, E.inOut(gp)), 112); mark.fill(sheen.url); }
        else mark.fill(th.mark);
      }
      // --- woordmerk
      if (hasWord) {
        var dxs = [0, 0, 0, 0, 0], j, pj;
        if (out) {
          // wegvegen: de schuine rand loopt van links naar rechts over de letters
          var op = seg(to, 0.02, 0.46, E.inSoft);
          clip.set(lerp(wl - wbt * COT - 12, wr - wt * COT + 12, op), 1);
          for (j = 0; j < 5; j++) dxs[j] = 22 * seg(to, 0.02 + j * 0.03, 0.4, E.in);
        } else if (emerge) {
          for (j = 0; j < 5; j++) {
            pj = seg(t, T.word + (4 - j) * 0.024, T.wordD, E.inOut);
            dxs[j] = -DW * (1 - pj);
          }
          if (t >= T.wordEnd) clip.off(); else clip.set(L.mark[0] + mdx + EDGE0, 1);
        } else {
          var wp = seg(t, T.word, T.wordD, E.inOut);
          for (j = 0; j < 5; j++) dxs[j] = -28 * (1 - seg(t, T.word + 0.08 + j * 0.06, 0.62, E.out));
          if (t >= T.wordEnd) clip.off();
          else clip.set(lerp(wl - wbt * COT - 34, wr - wt * COT + 12, wp), -1);
        }
        word.shift(dxs);
      }
      // --- tagline
      if (hasTag) tag.set(t - T.tag, out ? 1 - seg(to, 0, 0.3) : 1);
    }
    return { svg: st.svg, duration: duration, rest: rest, render: render, T: T };
  }

  /* 2. WRAP — van lijn naar folie ------------------------------------------ */
  SC.wrap = function (o) {
    var lockName = o.lockup || 'horizontal', L = GEO.lockups[lockName], th = theme(o);
    var lay = layout(o, L.w, L.h, 14);
    var st = Stage(o, lay.W, lay.H, th);
    var rootG = el('g', { transform: 'translate(' + f(lay.ox) + ' ' + f(lay.oy) + ') scale(' + f(lay.s) + ')' }, st.svg);
    var hasWord = !!L.word, hasTag = !!L.tag, sw = o.stroke || 2.8;

    // laag 1: contouren (alleen zichtbaar waar nog geen folie ligt)
    var outG = el('g', { fill: 'none', 'stroke-width': sw, 'stroke-linejoin': 'round' }, rootG);
    var lines = [];
    function addLine(d, color, tx, ty) {
      var n = el('path', { d: d, stroke: color, pathLength: 1, 'stroke-dasharray': '1 1', 'stroke-dashoffset': 1 }, outG);
      if (tx || ty) n.setAttribute('transform', 'translate(' + tx + ' ' + ty + ')');
      lines.push(n);
    }
    var mx = L.mark[0], my = L.mark[1];
    addLine(circleD(M.dots[0].cx, M.dots[0].cy, M.dots[0].r), th.mark, mx, my);
    M.pills.forEach(function (p) { addLine(pillD(p, 0, 1), th.mark, mx, my); });
    addLine(circleD(M.dots[1].cx, M.dots[1].cy, M.dots[1].r), th.mark, mx, my);
    if (hasWord) GEO.word.parts.forEach(function (p) { addLine(p.d, th.word, L.word[0], L.word[1]); });
    var outClip = new SlantClip(st, outG);

    // laag 2: de folie (vulling) + glansrand vlak achter de rakel
    var fillG = el('g', null, rootG);
    var fMarkG = el('g', { transform: tr(mx, my) }, fillG);
    new Mark(fMarkG, th.mark);
    var fWord, hWord;
    if (hasWord) fWord = new Word(el('g', { transform: tr(L.word[0], L.word[1]) }, fillG), th.word);
    var gid = st.id + 'h' + (++uid);
    var lg = el('linearGradient', { id: gid, gradientUnits: 'userSpaceOnUse' }, st.defs);
    var s0 = el('stop', { offset: 0, 'stop-color': '#FFFFFF', 'stop-opacity': 0 }, lg);
    el('stop', { offset: 1, 'stop-color': '#FFFFFF', 'stop-opacity': 0.62 }, lg);
    var hiG = el('g', { fill: 'url(#' + gid + ')' }, fillG);
    var hMark = new Mark(el('g', null, hiG), 'url(#' + gid + ')');
    if (hasWord) hWord = new Word(el('g', null, hiG), 'url(#' + gid + ')');
    var fillClip = new SlantClip(st, fillG);

    var tagG, tag;
    if (hasTag) { tagG = el('g', { transform: tr(L.tag[0], L.tag[1]) }, rootG); tag = new Tagline(tagG, th.tag); }

    var n = lines.length, T = {};
    T.draw = 0.1; T.drawD = 0.8; T.drawStag = 0.055;
    T.drawEnd = T.draw + T.drawD + (n - 1) * T.drawStag;
    T.wipe = T.drawEnd - 0.25; T.wipeD = lockName === 'horizontal' ? 1.15 : 1.0;
    T.tag = hasTag ? T.wipe + T.wipeD * 0.55 : 0;
    var rest = Math.max(T.wipe + T.wipeD, hasTag ? T.tag + Tagline.dur : 0);
    var hold = o.hold != null ? o.hold : 1.4;
    var outro = o.outro === false ? 0 : 0.6;
    var tail = o.outro === false ? 0 : (o.gap != null ? o.gap : 0.35);
    var x0 = -L.h * COT - 70, x1 = L.w + 30, band = 150;

    function render(t) {
      var i, to = t - (rest + hold), out = outro && to > 0;
      for (i = 0; i < n; i++) sa(lines[i], 'stroke-dashoffset', f(1 - seg(t, T.draw + i * T.drawStag, T.drawD, E.inOut)));
      var wp = seg(t, T.wipe, T.wipeD, E.inOut), xe = lerp(x0, x1, wp);
      if (out) {
        // uitgang: folie wordt in dezelfde richting weer weggeveegd
        var op = seg(to, 0, 0.55, E.inSoft), xo = lerp(x0, x1, op);
        sa(outG, 'visibility', 'hidden');
        fillClip.set(xo, 1);
        sa(hiG, 'visibility', 'hidden');
        if (hasTag) tag.set(99, 1 - seg(to, 0, 0.3));
        return;
      }
      sa(outG, 'visibility', wp >= 1 ? 'hidden' : null);
      outClip.set(xe, 1);
      if (wp >= 1) fillClip.off(); else fillClip.set(xe, -1);
      sa(hiG, 'visibility', wp > 0 && wp < 1 ? null : 'hidden');
      // verloop in lock-up-coördinaten: van (rand - band) naar (rand), dwars op de schuinte
      sa(lg, 'x1', f(xe - band * UY)); sa(lg, 'y1', f(band * UX));
      sa(lg, 'x2', f(xe)); sa(lg, 'y2', 0);
      sa(hMark.g, 'transform', tr(mx, my));
      if (hasWord) sa(hWord.g, 'transform', tr(L.word[0], L.word[1]));
      if (hasTag) tag.set(t - T.tag, 1);
    }
    // de glanslaag gebruikt userSpaceOnUse per element: verloop in de ruimte van de groep zetten
    lg.setAttribute('gradientTransform', '');
    if (tr(mx, my)) hMark.g.setAttribute('transform', tr(mx, my));
    return { svg: st.svg, duration: rest + hold + outro + tail, rest: rest, render: render, T: T };
  };

  /* 3. LOADER — doorlopende lus -------------------------------------------- */
  function markLoader(ph) {   // ph = 0..1
    var p = [], k, q, a, b;
    for (k = 0; k < 3; k++) {
      q = ((ph - k * 0.085) % 1 + 1) % 1;
      // rups: kop rolt uit, staart haalt in, en weer terug omhoog
      if (q < 0.25) { a = 0; b = E.inOut(q / 0.25); }
      else if (q < 0.5) { a = E.inOut((q - 0.25) / 0.25); b = 1; }
      else if (q < 0.75) { a = 1 - E.inOut((q - 0.5) / 0.25); b = 1; }
      else { a = 0; b = 1 - E.inOut((q - 0.75) / 0.25); }
      p.push([a, b, 1]);
    }
    function pulse(x) { x = ((x % 1) + 1) % 1; return 1 - 0.2 * Math.pow(Math.sin(Math.PI * x), 2); }
    return { d: [pulse(ph * 2 + 0.25), pulse(ph * 2 - 0.1)], p: p };
  }
  SC.loader = function (o) {
    var th = theme(o), L = GEO.lockups.mark, lay = layout(o, L.w, L.h, 12);
    var st = Stage(o, lay.W, lay.H, th);
    var rootG = el('g', { transform: 'translate(' + f(lay.ox) + ' ' + f(lay.oy) + ') scale(' + f(lay.s) + ')' }, st.svg);
    var mark = new Mark(rootG, th.mark), period = o.period || 2.8;
    return {
      svg: st.svg, duration: period, rest: 0, endless: true, loopDur: period, introDur: 0,
      render: function (t) { mark.set(markLoader(t / period)); }
    };
  };

  /* 4. HOVER — micro-interactie voor de website ----------------------------- */
  function markHover(tau) {
    var p = [], k, q, w = 2 * Math.PI * 2.0, d = 7.2;
    function spring(q) { return q <= 0 ? 0 : Math.sin(w * q) * Math.exp(-d * q); }
    for (k = 0; k < 3; k++) p.push([0, 1 - 0.62 * spring(tau - 0.045 * k), 1]);
    var o0 = spring(tau) * 9, o1 = spring(tau - 0.16) * 9;
    return { d: [1, 1], p: p, o: [[-UX * o0, -UY * o0], [-UX * o1, -UY * o1]] };
  }
  SC.hover = function (o) {
    var lockName = o.lockup || 'horizontal', L = GEO.lockups[lockName], th = theme(o);
    var lay = layout(o, L.w, L.h, 14);
    var st = Stage(o, lay.W, lay.H, th);
    var rootG = el('g', { transform: 'translate(' + f(lay.ox) + ' ' + f(lay.oy) + ') scale(' + f(lay.s) + ')' }, st.svg);
    if (L.word) new Word(el('g', { transform: tr(L.word[0], L.word[1]) }, rootG), th.word);
    if (L.tag) new Tagline(el('g', { transform: tr(L.tag[0], L.tag[1]) }, rootG), th.tag);
    var mark = new Mark(el('g', { transform: tr(L.mark[0], L.mark[1]) }, rootG), th.mark);
    return {
      svg: st.svg, duration: 1.0, rest: 1.0, interactive: true,
      render: function (t) { mark.set(t >= 1 ? MARK_FULL : markHover(t)); }
    };
  };

  /* 5. BADGE — het uitgebreide logo: beeldmerk met draaiende tekstring ------ */
  SC.badge = function (o) {
    var th = theme(o), T = GEO.tag, i, r;
    var tw = T.bbox[2] - T.bbox[0], gap = 96, len = tw + gap, reps = 2, circ = len * reps;
    var R = circ / (2 * Math.PI), cyc = (T.bbox[1] + T.bbox[3]) / 2, capH = T.bbox[3] - T.bbox[1];
    var disc = !!o.disc, outer = R + capH / 2 + (disc ? 46 : 10), pad = o.pad != null ? o.pad : 10;
    var size = 2 * (outer + pad);
    var W = o.frame ? o.frame[0] : size, H = o.frame ? o.frame[1] : size;
    var s = o.frame ? Math.min(W, H) * (o.fit || 0.5) / size : 1;
    var st = Stage(o, W, H, th);
    var rootG = el('g', { transform: 'translate(' + f(W / 2) + ' ' + f(H / 2) + ') scale(' + f(s) + ')' }, st.svg);
    var cDisc = o.discColor || (th === THEMES.mint ? C.mint : th.bg), cMark = th.mark, cText = o.textColor || th.tag, cSep = th.mark;
    if (disc) {
      cDisc = o.discColor || C.mint; cMark = '#FFFFFF'; cText = '#FFFFFF'; cSep = '#FFFFFF';
      if (o.theme === 'dark') { cDisc = C.ink; cMark = C.mint; cText = '#FFFFFF'; cSep = C.mint; }
    }
    var discEl = disc ? el('circle', { cx: 0, cy: 0, r: f(outer), fill: cDisc }, rootG) : null;
    var ring = el('g', null, rootG), glyphs = [], seps = [];
    for (r = 0; r < reps; r++) {
      for (i = 0; i < T.parts.length; i++) {
        var p = T.parts[i], cx = (p.bbox[0] + p.bbox[2]) / 2;
        var ang = ((cx - T.bbox[0]) + r * len) / circ * 360;
        glyphs.push({ n: el('path', { d: p.d, fill: cText, transform: 'rotate(' + f(ang) + ') translate(' + f(-cx) + ' ' + f(-R - cyc) + ')' }, ring), ang: ang });
      }
      var sa2 = (tw + gap / 2 + r * len) / circ * 2 * Math.PI;
      seps.push({ n: el('circle', { cx: f(R * Math.sin(sa2)), cy: f(-R * Math.cos(sa2)), r: 6.2, fill: cSep }, ring), ang: sa2 * 180 / Math.PI });
    }
    var ms = o.markScale || 1.1;
    var markG = el('g', { transform: 'scale(' + ms + ') translate(' + f(-M.w / 2) + ' ' + f(-M.h / 2) + ')' }, rootG);
    var mark = new Mark(markG, cMark);
    var period = o.period || 24, intro = o.intro === false ? 0 : 1.9, start = o.startAngle != null ? o.startAngle : -62;
    return {
      svg: st.svg, duration: intro + period / reps, rest: intro, endless: true, loopDur: period / reps, introDur: intro,
      render: function (t) {
        var j, g, a;
        sa(ring, 'transform', 'rotate(' + f(start + (t / period) * 360) + ')');
        if (intro) {
          if (discEl) sa(discEl, 'r', f(outer * seg(t, 0, 0.6, E.out)));
          mark.set(t < 0.25 ? MARK_NONE : markIntro(t - 0.25));
          for (j = 0; j < glyphs.length; j++) {
            g = glyphs[j]; a = seg(t, 0.55 + (g.ang / 360) * 0.95, 0.3);
            sa(g.n, 'opacity', a >= 1 ? null : f(a));
          }
          for (j = 0; j < seps.length; j++) {
            a = seg(t, 0.55 + (seps[j].ang / 360) * 0.95, 0.35, E.pop);
            sa(seps[j].n, 'r', f(6.2 * Math.max(0, a)));
          }
        } else mark.set(MARK_FULL);
      }
    };
  };

  /* 6. PATROON — het logo als doorlopend merkpatroon ------------------------ */
  function rng(seed) {
    var s = seed >>> 0;
    return function () { s = (s + 0x6D2B79F5) >>> 0; var t = Math.imul(s ^ (s >>> 15), 1 | s); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
  }
  // Tekent het patroon in parent. W,H in beeldpunten; sc = schaal van de vormen.
  function Pattern(parent, W, H, colors, o) {
    var sc = o.patScale || 1, DX = M.pills[2].tc[0] - M.pills[1].tc[0], S = M.pills[1].S, RW = 61.04;
    var P = 4, slen = Math.sqrt(S[0] * S[0] + S[1] * S[1]);
    var g = el('g', { 'stroke-linecap': 'round', 'stroke-width': RW, fill: 'none' }, parent);
    var w = W / sc, h = H / sc, rand = rng(o.seed || 7), items = [];
    // reeksen per kolom; elk element beslaat L+1 rijen, -1 is een lege plek (1 rij). Elke reeks telt op tot P.
    var seqs = [[0, 2], [1, 1], [0, -1, 1], [1, -1, -1], [2, -1], [0, 1, -1], [3], [0, 0, -1, -1], [1, 0, -1], [-1, 2]];
    var jMin = -P - 1, jMax = Math.ceil(h / S[1]) + P + 1;
    var iMin = Math.floor(-(jMax * S[0]) / DX) - 2, iMax = Math.ceil(w / DX) + Math.ceil(P * S[0] / DX) + 2;
    for (var i = iMin; i <= iMax; i++) {
      var hsh = rng((i + 1000) * 7919 + (o.seed || 7));
      var seq = seqs[Math.floor(hsh() * seqs.length)], off = Math.floor(hsh() * P), j = jMin - off, q = 0;
      while (j <= jMax) {
        var L = seq[q % seq.length];
        if (L < 0) { j += 1; q++; continue; }
        items.push({
          i: i, j: j, L: L, tint: hsh() < 0.5 ? 0 : 1,
          live: L > 0 && hsh() < 0.62, ph: hsh(), n: hsh() < 0.5 ? 1 : 2, key: q % seq.length,
          n1: el('line', { stroke: colors[0] }, g)
        });
        j += L + 1; q++;
      }
    }
    // dezelfde kolom moet per periode identiek zijn (naadloze lus): tint/fase per (kolom, plek in reeks)
    var memo = {};
    items.forEach(function (it) {
      var kk = it.i + ':' + it.key;
      if (!memo[kk]) memo[kk] = { tint: it.tint, live: it.live, ph: it.ph, n: it.n };
      var m = memo[kk];
      it.tint = m.tint; it.live = m.live; it.ph = m.ph; it.n = m.n;
      it.n1.setAttribute('stroke', colors[it.tint]);
    });
    var loop = o.patLoop || 16, drift = o.drift === false ? 0 : 1;
    sa(g, 'transform', 'scale(' + sc + ')');
    this.loop = loop;
    this.render = function (t) {
      var ph = (t / loop) % 1, d = drift * ph * P;      // verschuiving in rijen langs de schuinte
      for (var k2 = 0; k2 < items.length; k2++) {
        var it = items[k2], jj = it.j + d;
        var x1 = it.i * DX + jj * S[0], y1 = jj * S[1];
        var Lc = it.L;
        if (it.live) {
          var c = 0.5 - 0.5 * Math.cos(2 * Math.PI * (ph * it.n + it.ph));
          Lc = it.L * E.inOut(c);
        }
        sa(it.n1, 'x1', f(x1)); sa(it.n1, 'y1', f(y1));
        sa(it.n1, 'x2', f(x1 + Lc * S[0] + 0.001)); sa(it.n1, 'y2', f(y1 + Lc * S[1]));
      }
    };
  }
  SC.patroon = function (o) {
    var th = theme(o), W = o.frame ? o.frame[0] : 1600, H = o.frame ? o.frame[1] : 900;
    var oo = {}; for (var k in o) oo[k] = o[k]; if (oo.bg == null) oo.bg = true;
    var st = Stage(oo, W, H, th);
    st.svg.setAttribute('preserveAspectRatio', 'xMidYMid slice');
    var pat = new Pattern(st.svg, W, H, o.patColors || th.pat, o);
    return { svg: st.svg, duration: pat.loop, rest: 0, endless: true, loopDur: pat.loop, introDur: 0, render: pat.render };
  };

  /* 7. WISSEL — overgang voor video (met transparantie) ---------------------- */
  SC.wissel = function (o) {
    var th = theme(o), W = o.frame ? o.frame[0] : 1920, H = o.frame ? o.frame[1] : 1080;
    var st = Stage(o, W, H, th);
    var n = o.bands || (W >= H ? 6 : 5), hw = (W + H * COT) / n, r = hw * UY / 2 + 1.5;
    var sA = -(r + 30) / UY, sB = (H + r + 30) / UY;
    var cBand = o.color || C.mint, cUnder = o.under || '#FFFFFF';
    var layers = [{ c: cUnder, dIn: 0, dOut: 0.085 }, { c: cBand, dIn: 0.085, dOut: 0 }];
    if (o.single) layers = [{ c: cBand, dIn: 0, dOut: 0 }];
    var g = el('g', { 'stroke-linecap': 'round', 'stroke-width': f(2 * r), fill: 'none' }, st.svg), bands = [];
    layers.forEach(function (ly) {
      for (var k = 0; k < n; k++) bands.push({ ly: ly, k: k, x0: -H * COT + (k + 0.5) * hw, n: el('line', { stroke: ly.c }, g) });
    });
    var logo = o.logo !== false, mark, markG, ms = Math.min(W * 0.24, H * 0.36) / M.w;
    if (logo) { markG = el('g', null, st.svg); mark = new Mark(markG, '#FFFFFF'); }
    var stag = 0.04, dIn = 0.46, dOut = 0.46, eIn = bezier(0.55, 0, 0.2, 1), eOut = bezier(0.75, 0, 0.45, 1);
    var cover = 0.085 + (n - 1) * stag + dIn, holdD = o.hold != null ? o.hold : (logo ? 0.42 : 0.14);
    var tOut = cover + holdD, total = tOut + 0.085 + (n - 1) * stag + dOut + 0.05;
    return {
      svg: st.svg, duration: total, rest: total, cut: cover + holdD / 2,
      render: function (t) {
        for (var i = 0; i < bands.length; i++) {
          var b = bands[i];
          var lead = lerp(sA, sB, seg(t, b.ly.dIn + b.k * stag, dIn, eIn));
          var tl = lerp(sA, sB, seg(t, tOut + b.ly.dOut + b.k * stag, dOut, eOut));
          if (lead - tl < 0.5) { sa(b.n, 'visibility', 'hidden'); continue; }
          sa(b.n, 'visibility', null);
          sa(b.n, 'x1', f(b.x0 + tl * UX)); sa(b.n, 'y1', f(tl * UY));
          sa(b.n, 'x2', f(b.x0 + lead * UX)); sa(b.n, 'y2', f(lead * UY));
        }
        if (logo) {
          var a = seg(t, cover - 0.22, 0.42, E.out), z = seg(t, tOut - 0.06, 0.2, E.in);
          var sc = ms * lerp(0.9, 1, a) * (1 - 0.12 * z);
          sa(markG, 'opacity', f(Math.min(seg(t, cover - 0.22, 0.2), 1 - z)));
          sa(markG, 'transform', 'translate(' + f(W / 2 - M.w * sc / 2) + ' ' + f(H / 2 - M.h * sc / 2) + ') scale(' + f(sc) + ')');
        }
      }
    };
  };

  /* 8. EINDKAART — afsluiter voor video: patroon + logo-onthulling ----------- */
  SC.eindkaart = function (o) {
    var th = theme({ theme: o.theme || 'mint' }), W = o.frame ? o.frame[0] : 1920, H = o.frame ? o.frame[1] : 1080;
    var st = Stage({ bg: true, frame: [W, H], label: o.label }, W, H, th);
    // patroon, met een rustige zone rond het logo
    var mid = st.id + 'm';
    var rg = el('radialGradient', { id: mid + 'g', gradientUnits: 'userSpaceOnUse', cx: f(W / 2), cy: f(H / 2), r: f(Math.max(W, H) * 0.62) }, st.defs);
    el('stop', { offset: 0, 'stop-color': '#000' }, rg);
    el('stop', { offset: 0.42, 'stop-color': '#000' }, rg);
    el('stop', { offset: 1, 'stop-color': '#fff' }, rg);
    var mask = el('mask', { id: mid, maskUnits: 'userSpaceOnUse', x: 0, y: 0, width: f(W), height: f(H) }, st.defs);
    el('rect', { x: 0, y: 0, width: f(W), height: f(H), fill: 'url(#' + mid + 'g)' }, mask);
    var patG = el('g', { mask: 'url(#' + mid + ')' }, st.svg);
    var pat = new Pattern(patG, W, H, o.patColors || th.pat, { patScale: o.patScale || Math.max(W, H) / 1500, patLoop: o.patLoop || 16, seed: o.seed || 11 });
    var lockName = o.lockup || 'tagline', L = GEO.lockups[lockName];
    var s = Math.min(W * (o.fit || (W >= H ? 0.4 : 0.66)) / L.w, H * 0.5 / L.h);
    var rootG = el('g', { transform: 'translate(' + f((W - L.w * s) / 2) + ' ' + f((H - L.h * s) / 2) + ') scale(' + f(s) + ')' }, st.svg);
    var u = uitrolInto(st, rootG, L, lockName, th, { outro: false, hold: 0, shift: true });
    var t0 = 0.35, hold = o.hold != null ? o.hold : 2.6;
    return {
      svg: st.svg, duration: t0 + u.rest + hold, rest: t0 + u.rest,
      render: function (t) { pat.render(t); u.render(t - t0); }
    };
  };

  /* 9. KLEURWISSEL — het beeldmerk wordt telkens opnieuw gewrapt ------------- */
  SC.kleurwissel = function (o) {
    var lockName = o.lockup || 'mark', L = GEO.lockups[lockName], th = theme(o);
    var lay = layout(o, L.w, L.h, 14);
    var st = Stage(o, lay.W, lay.H, th);
    var rootG = el('g', { transform: 'translate(' + f(lay.ox) + ' ' + f(lay.oy) + ') scale(' + f(lay.s) + ')' }, st.svg);
    if (L.word) new Word(el('g', { transform: tr(L.word[0], L.word[1]) }, rootG), th.word);
    var cols = o.colors || [C.mint, '#3A4045', '#D9D2C5', '#1D1D1F', '#5B6E63'];
    var mg = el('g', { transform: tr(L.mark[0], L.mark[1]) }, rootG);
    var base = new Mark(mg, cols[0]), top = new Mark(mg, cols[1]);
    var step = o.step || 2.3, n = cols.length;
    return {
      svg: st.svg, duration: step * n, rest: 0, endless: true, loopDur: step * n, introDur: 0, colors: cols,
      render: function (t) {
        var idx = Math.floor(t / step) % n, tau = t - Math.floor(t / step) * step, k, p = [];
        var t0 = step - 1.25;   // eerst even stilstaan, dan opnieuw wrappen
        // zodra de nieuwe laag er helemaal op ligt, neemt de onderlaag de kleur over (geen randje)
        base.fill(cols[tau >= t0 + 1.14 ? (idx + 1) % n : idx]); top.fill(cols[(idx + 1) % n]);
        for (k = 0; k < 3; k++) p.push([0, seg(tau, t0 + 0.12 + 0.09 * k, 0.8, E.rollFlat), tau > t0 + 0.06 + 0.09 * k ? 1 : 0]);
        top.set({ d: [seg(tau, t0, 0.5, E.out), seg(tau, t0 + 0.62, 0.5, E.out)], p: p });
      }
    };
  };


  /* 10. KOZIJN — idee voor de website: de rakel wrapt een kozijn in een nieuwe kleur -- */
  SC.kozijn = function (o) {
    var W = o.frame ? o.frame[0] : 1280, H = o.frame ? o.frame[1] : 800, th = theme(o);
    var st = Stage({ label: 'Een kozijn krijgt een nieuwe kleur', frame: o.frame }, W, H, th);
    el('rect', { x: 0, y: 0, width: f(W), height: f(H), fill: o.wall || '#EDF1EF' }, st.svg);
    var bw = 600, bh = 500, s = Math.min(W * 0.64 / bw, H * 0.86 / bh);
    var g = el('g', { transform: 'translate(' + f((W - bw * s) / 2) + ' ' + f((H - bh * s) / 2) + ') scale(' + f(s) + ')' }, st.svg);
    var OX = 40, OY = 16, OW = 520, OH = 440;
    var panes = [[74, 50, 452, 122], [74, 198, 213, 224], [313, 198, 213, 224]], sash = 16;
    function rr(x, y, w, h, r) {
      return 'M' + (x + r) + ' ' + y + 'h' + (w - 2 * r) + 'a' + r + ' ' + r + ' 0 0 1 ' + r + ' ' + r + 'v' + (h - 2 * r) +
        'a' + r + ' ' + r + ' 0 0 1 ' + (-r) + ' ' + r + 'h' + (-(w - 2 * r)) + 'a' + r + ' ' + r + ' 0 0 1 ' + (-r) + ' ' + (-r) +
        'v' + (-(h - 2 * r)) + 'a' + r + ' ' + r + ' 0 0 1 ' + r + ' ' + (-r) + 'Z';
    }
    var p3 = panes[2], hole3 = [p3[0] + sash, p3[1] + sash, p3[2] - 2 * sash, p3[3] - 2 * sash];
    var holes = [panes[0], panes[1], hole3];
    var frameD = rr(OX, OY, OW, OH, 16) + holes.map(function (q) { return rr(q[0], q[1], q[2], q[3], 5); }).join('');
    // muuropening + vensterbank
    el('rect', { x: OX - 8, y: OY - 8, width: OW + 16, height: OH + 12, rx: 22, fill: '#DFE6E3' }, g);
    // glas met spiegeling onder de logo-hoek
    var gid = st.id + 'gl';
    var gg = el('linearGradient', { id: gid, x1: 0, y1: 0, x2: 0, y2: 1 }, st.defs);
    el('stop', { offset: 0, 'stop-color': '#E2EEEF' }, gg);
    el('stop', { offset: 1, 'stop-color': '#C6D9DB' }, gg);
    holes.forEach(function (q) { el('rect', { x: q[0] - 2, y: q[1] - 2, width: q[2] + 4, height: q[3] + 4, fill: 'url(#' + gid + ')' }, g); });
    var cid = st.id + 'gc', cp = el('clipPath', { id: cid }, st.defs);
    holes.forEach(function (q) { el('rect', { x: q[0], y: q[1], width: q[2], height: q[3] }, cp); });
    var refl = el('g', { 'clip-path': 'url(#' + cid + ')', fill: '#FFFFFF' }, g);
    [[118, 58, 0.42], [196, 16, 0.3], [372, 44, 0.36], [434, 12, 0.26]].forEach(function (r) {
      var x = r[0] - OY * COT, sl = (OH + 2 * OY) * COT;
      el('polygon', { points: f(x) + ',0 ' + f(x + r[1]) + ',0 ' + f(x + r[1] + sl) + ',' + (OH + 2 * OY) + ' ' + f(x + sl) + ',' + (OH + 2 * OY), opacity: r[2] }, refl);
    });
    // het kozijn: onderlaag (huidige kleur) en bovenlaag (nieuwe folie) met glansrand
    var cols = o.colors || [['#E3DAC6', 'Crème'], ['#3B4247', 'Antraciet'], ['#1F2022', 'Zwart'], ['#8C9395', 'Grijs'], ['#31493E', 'Groen'], ['#F4F3EE', 'Wit']];
    var n = cols.length;
    var base = el('path', { d: frameD, 'fill-rule': 'evenodd', fill: cols[0][0] }, g);
    var topG = el('g', null, g);
    var top = el('path', { d: frameD, 'fill-rule': 'evenodd', fill: cols[1][0] }, topG);
    var hid = st.id + 'kh', hg = el('linearGradient', { id: hid, gradientUnits: 'userSpaceOnUse' }, st.defs);
    el('stop', { offset: 0, 'stop-color': '#FFFFFF', 'stop-opacity': 0 }, hg);
    el('stop', { offset: 1, 'stop-color': '#FFFFFF', 'stop-opacity': 0.5 }, hg);
    var hi = el('path', { d: frameD, 'fill-rule': 'evenodd', fill: 'url(#' + hid + ')' }, topG);
    var clip = new SlantClip(st, topG);
    // details die op elke kleur werken
    var det = el('g', { fill: 'none' }, g);
    holes.forEach(function (q) { el('rect', { x: q[0], y: q[1], width: q[2], height: q[3], rx: 5, stroke: '#000000', 'stroke-opacity': 0.16, 'stroke-width': 2 }, det); });
    el('rect', { x: p3[0], y: p3[1], width: p3[2], height: p3[3], rx: 5, stroke: '#000000', 'stroke-opacity': 0.2, 'stroke-width': 1.5 }, det);
    el('rect', { x: OX + 0.75, y: OY + 0.75, width: OW - 1.5, height: OH - 1.5, rx: 15.5, stroke: '#000000', 'stroke-opacity': 0.1, 'stroke-width': 1.5 }, det);
    el('rect', { x: p3[0] + 3.5, y: p3[1] + p3[3] / 2 - 21, width: 9, height: 42, rx: 4.5, fill: '#A4ADAF' }, g);
    el('rect', { x: 20, y: OY + OH, width: 560, height: 20, rx: 5, fill: '#CBD2D0' }, g);
    el('rect', { x: 32, y: OY + OH + 20, width: 536, height: 6, rx: 3, fill: '#000000', opacity: 0.06 }, g);
    // de rakel: een baan uit het logo
    var rakel = el('line', { stroke: C.mint, 'stroke-linecap': 'round' }, g);
    var step = o.step || 3.2, wipe0 = 1.25, wipeD = 1.3, x0 = -(OY + OH) * COT - 34, x1 = OX + OW + 34 - OY * COT;
    var plan = { t0: 0, seq: null, base: 0 };
    function at(t) {
      var k = Math.max(0, Math.floor((t - plan.t0) / step)), tau = (t - plan.t0) - k * step, a, b;
      if (plan.seq) { a = k === 0 ? plan.seq[0] : (plan.seq[1] + k - 1) % n; b = (plan.seq[1] + k) % n; }
      else { a = (plan.base + k) % n; b = (plan.base + k + 1) % n; }
      return { a: a, b: b, tau: tau, p: seg(tau, wipe0, wipeD, E.inOut) };
    }
    var last = { cur: 0 };
    function render(t) {
      var q = at(t), xe = lerp(x0, x1, q.p), on = q.p > 0 && q.p < 1;
      sa(base, 'fill', cols[q.p >= 1 ? q.b : q.a][0]);
      sa(top, 'fill', cols[q.b][0]);
      sa(topG, 'visibility', on ? null : 'hidden');
      last.cur = q.p >= 0.5 ? q.b : q.a;
      if (on) {
        clip.set(xe, -1);
        sa(hg, 'x1', f(xe - 120 * UY)); sa(hg, 'y1', f(120 * UX)); sa(hg, 'x2', f(xe)); sa(hg, 'y2', 0);
      }
      var kk = Math.min(seg(q.tau, wipe0 - 0.12, 0.3, E.out), 1 - seg(q.tau, wipe0 + wipeD - 0.2, 0.3, E.in));
      if (kk <= 0.001) sa(rakel, 'visibility', 'hidden');
      else {
        var ya = OY - 22, yb = OY + OH + 22;
        sa(rakel, 'visibility', null);
        sa(rakel, 'stroke-width', f(24 * kk));
        sa(rakel, 'x1', f(xe + ya * COT)); sa(rakel, 'y1', ya);
        sa(rakel, 'x2', f(xe + yb * COT)); sa(rakel, 'y2', yb);
      }
    }
    return {
      svg: st.svg, duration: step * n, rest: 0, endless: true, loopDur: step * n, introDur: 0, colors: cols, render: render,
      // kies een kleur: de rakel begint meteen, daarna loopt de reeks vanzelf verder
      pick: function (i, t) { plan = { t0: t - wipe0 + 0.1, seq: [last.cur, i], base: 0 }; },
      current: function () { return last.cur; }
    };
  };

  /* ================================================================ speler */

  function create(name, o) {
    if (!SC[name]) throw new Error('iWrapMotion: onbekende animatie "' + name + '"');
    var sc = SC[name](o || {});
    sc.name = name;
    return sc;
  }

  function mount(target, name, o) {
    o = o || {};
    var host = typeof target === 'string' ? document.querySelector(target) : target;
    if (!host) throw new Error('iWrapMotion: element niet gevonden');
    var sc = create(name, o);
    host.appendChild(sc.svg);
    var mode = o.play || (sc.endless ? 'loop' : (sc.interactive ? 'hover' : 'once'));
    var p = { scene: sc, t: 0, playing: false, speed: o.rate || 1, mode: mode, el: host }, raf = 0, last = 0, started = false;
    var reduce = !!(root.matchMedia && root.matchMedia('(prefers-reduced-motion: reduce)').matches) && !o.force;

    function frame(now) {
      raf = 0;
      if (!p.playing) return;
      var dt = Math.min(0.1, (now - last) / 1000);
      last = now;
      p.t += dt * p.speed;
      if (sc.endless) {
        if (p.t > sc.introDur + sc.loopDur * 4) p.t -= sc.loopDur * 3;
      } else {
        var e = mode === 'loop' ? sc.duration : sc.rest;
        if (p.t >= e) {
          if (mode === 'loop') p.t = p.t % e;
          else { p.t = e; p.playing = false; }
        }
      }
      sc.render(p.t);
      if (p.onframe) p.onframe(p.t);
      if (p.playing) raf = root.requestAnimationFrame(frame);
    }
    p.play = function () {
      if (p.playing) return p;
      p.playing = true; last = root.performance.now();
      raf = root.requestAnimationFrame(frame);
      return p;
    };
    p.pause = function () { p.playing = false; if (raf) root.cancelAnimationFrame(raf); raf = 0; return p; };
    p.seek = function (t) { p.t = t; sc.render(t); return p; };
    p.replay = function () { p.t = 0; sc.render(0); return p.play(); };
    p.destroy = function () { p.pause(); if (io) io.disconnect(); if (sc.svg.parentNode) sc.svg.parentNode.removeChild(sc.svg); };

    if (sc.replayBtn) {
      var rb = function (e) { if (e.type === 'keydown' && e.key !== 'Enter' && e.key !== ' ') return; if (e.preventDefault) e.preventDefault(); p.replay(); };
      sc.replayBtn.addEventListener('click', rb); sc.replayBtn.addEventListener('keydown', rb);
    }
    var io = null;
    if (reduce) {
      p.t = sc.posterT != null ? sc.posterT : (sc.endless ? sc.introDur : sc.rest);
      sc.render(p.t);                                                // rustig eindbeeld, geen beweging
    } else if (mode === 'hover') {
      sc.render(sc.rest);
      host.addEventListener('pointerenter', function () { p.replay(); });
      host.addEventListener('focus', function () { p.replay(); }, true);
    } else if (mode === 'manual') {
      p.t = o.at != null ? o.at : sc.rest;
      sc.render(p.t);
    } else {
      // start: 'rest' = eerste beeld is het complete logo (handig voor miniaturen), daarna loopt de lus door
      if (o.start === 'rest') p.t = sc.endless ? sc.introDur : sc.rest;
      sc.render(p.t);
      if ('IntersectionObserver' in root) {
        io = new IntersectionObserver(function (es) {
          es.forEach(function (en) {
            if (en.isIntersecting) { if (!started || mode === 'loop') { started = true; p.play(); } }
            else if (mode === 'loop' || sc.endless) p.pause();
          });
        }, { threshold: 0.25 });
        io.observe(host);
      } else p.play();
    }
    return p;
  }

  function auto() {
    var nodes = document.querySelectorAll('[data-iwrap]');
    Array.prototype.forEach.call(nodes, function (n) {
      if (n.__iwrap) return;
      var o = {}, d = n.dataset, k;
      for (k in d) {
        if (k === 'iwrap') continue;
        var v = d[k];
        o[k] = v === 'true' ? true : v === 'false' ? false : (v !== '' && !isNaN(v) ? +v : v);
      }
      n.__iwrap = mount(n, d.iwrap, o);
    });
  }

  var api = { version: '1.0.0', mount: mount, create: create, scenes: SC, auto: auto, geo: GEO, colors: C, themes: THEMES, ease: E, angle: THETA * 180 / Math.PI };
  root.iWrapMotion = api;
  if (typeof document !== 'undefined') {
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', auto);
    else auto();
  }
})(typeof window !== 'undefined' ? window : this);
