
  /* --- poppetje: een stip en een paar banen, net als de "i" uit het logo ------------- */
  function Person(parent, o) {
    var g = G(parent), far = mix(o.shirt, '#000000', 0.22), L = Li;
    this.g = g; this.o = o;
    el('ellipse', { cx: 0, cy: 3, rx: 36, ry: 7, fill: '#22262A', opacity: 0.13 }, g);
    this.fu = L(g, 0, 0, 0, 0, far, 17); this.fl = L(g, 0, 0, 0, 0, mix(o.skin, '#000000', 0.12), 14);
    this.lf = L(g, 0, 0, 0, 0, mix(o.pants, '#000000', 0.2), 22); this.sf = L(g, 0, 0, 0, 0, '#17191B', 15);
    this.ln = L(g, 0, 0, 0, 0, o.pants, 22); this.sn = L(g, 0, 0, 0, 0, '#22262A', 15);
    var b = G(g);
    this.body = b;
    Rc(b, -24, -192, 48, 104, 22, o.shirt);
    Rc(b, -7, -203, 14, 18, 6, mix(o.skin, '#000000', 0.08));
    Ci(b, 0, -220, 24, o.skin);
    if (o.hair === 'cap') { Pa(b, 'M-25 -222A25 25 0 0 1 25 -222Z', o.hairColor); Rc(b, 6, -229, 36, 9, 4.5, o.hairColor); }
    else if (o.hair === 'bun') { Ci(b, -27, -238, 11, o.hairColor); Pa(b, 'M24 -226A25 25 0 0 0 -25.5 -214L-23 -199Q-12 -216 6 -224Q16 -228 24 -226Z', o.hairColor); }
    else Pa(b, 'M24 -224A25 25 0 0 0 -25.5 -216L-24 -207Q-10 -228 24 -224Z', o.hairColor);
    if (o.logo) new Mark(G(b, { transform: 'translate(-3 -176) scale(0.075)' }), '#FFFFFF');
    this.nu = L(g, 0, 0, 0, 0, o.shirt, 18); this.nl = L(g, 0, 0, 0, 0, o.skin, 15);
  }
  // p: x, y, face (1 of -1), walk (fase), a/b = [schouder, elleboog] in graden (0 = omlaag, + = naar voren),
  //    lean (graden), s (schaal), o (dekking)
  Person.prototype.set = function (p) {
    var s = (p.s == null ? 1 : p.s) * 0.93, wt = p.wt == null ? (p.walking ? 1 : 0) : p.wt, amp = (p.amp == null ? 25 : p.amp) * wt;
    var w = p.x / (p.stride || 168), sw = Math.sin(2 * Math.PI * w);
    var bob = -3.5 * Math.abs(Math.cos(2 * Math.PI * w)) * (amp / 25);
    if (p.o != null) op(this.g, p.o); else op(this.g, 1);
    sa(this.g, 'transform', 'translate(' + f(p.x) + ' ' + f(p.y + bob) + ') scale(' + f(s * (p.face || 1)) + ' ' + f(s) + ')');
    function leg(ln, sh, a, hx) {
      var r = rad(a), fx = hx + 106 * Math.sin(r), fy = -106 + 106 * Math.cos(r);
      sa(ln, 'x1', hx); sa(ln, 'y1', -106); sa(ln, 'x2', f(fx)); sa(ln, 'y2', f(fy));
      sa(sh, 'x1', f(fx)); sa(sh, 'y1', f(fy + 2)); sa(sh, 'x2', f(fx + 15 * Math.cos(r))); sa(sh, 'y2', f(fy + 2 - 15 * Math.sin(r)));
    }
    var la = sw * amp;
    leg(this.ln, this.sn, la, 4); leg(this.lf, this.sf, -la, -4);
    function arm(u, l, sx, a) {
      var r1 = rad(a[0]), r2 = rad(a[0] + a[1]), ex = sx + 46 * Math.sin(r1), ey = -178 + 46 * Math.cos(r1);
      var hx = ex + 44 * Math.sin(r2), hy = ey + 44 * Math.cos(r2);
      sa(u, 'x1', sx); sa(u, 'y1', -178); sa(u, 'x2', f(ex)); sa(u, 'y2', f(ey));
      sa(l, 'x1', f(ex)); sa(l, 'y1', f(ey)); sa(l, 'x2', f(hx)); sa(l, 'y2', f(hy));
    }
    var an = p.a || [-sw * 22 * wt + 4, 12], af = p.b || [sw * 22 * wt - 2, 10];
    arm(this.nu, this.nl, 3, an); arm(this.fu, this.fl, -3, af);
    sa(this.body, 'transform', p.lean ? 'rotate(' + f(p.lean) + ' 0 -106)' : null);
  };

  // loopgewicht: 0 bij stilstand, 1 onderweg (zachte overgang aan begin en eind)
  function ww(k) { return clamp(Math.min(k, 1 - k) * 7, 0, 1); }

  /* --- het huis: bakstenen gevel met kunststof kozijnen ------------------------------ */
  function House(st, parent) {
    var g = G(parent), self = this, i;
    this.g = g;
    var bid = st.id + 'br', bp = el('pattern', { id: bid, patternUnits: 'userSpaceOnUse', width: 64, height: 32 }, st.defs);
    Rc(bp, 0, 0, 64, 32, 0, K.brick);
    Rc(bp, 0, 0, 64, 1.6, 0, '#FFFFFF', { opacity: 0.2 }); Rc(bp, 0, 16, 64, 1.6, 0, '#FFFFFF', { opacity: 0.2 });
    Rc(bp, 0, 0, 1.6, 16, 0, '#FFFFFF', { opacity: 0.2 }); Rc(bp, 32, 16, 1.6, 16, 0, '#FFFFFF', { opacity: 0.2 });
    Rc(bp, 6, 4, 22, 9, 1, '#000000', { opacity: 0.05 }); Rc(bp, 38, 20, 20, 9, 1, '#FFFFFF', { opacity: 0.06 });
    this.brick = 'url(#' + bid + ')';
    // buren, vager, zodat het een straat wordt
    var pale = function (c) { return mix(c, K.paper, 0.58); };
    [[70, 760], [1570, 760]].forEach(function (n) {
      var x = n[0];
      Rc(g, x - 18, 204, n[1] + 36, 150, 4, pale(K.roof));
      Rc(g, x, 354, n[1], 506, 0, pale(K.brick));
      [[70, 404, 220, 168], [430, 404, 220, 168], [400, 626, 290, 190]].forEach(function (w) {
        Rc(g, x + w[0], w[1], w[2], w[3], 5, pale('#FFFFFF')); Rc(g, x + w[0] + 12, w[1] + 12, w[2] - 24, w[3] - 24, 2, pale(K.glass2));
      });
      Rc(g, x + 110, 612, 108, 248, 4, pale(K.inkSoft));
    });
    // dak, schoorsteen, goot
    Rc(g, 1368, 150, 64, 80, 3, K.brickDark); Rc(g, 1360, 142, 80, 14, 4, K.roof);
    Rc(g, 812, 196, 776, 162, 5, K.roof);
    for (i = 0; i < 6; i++) Rc(g, 812, 220 + i * 24, 776, 2, 0, '#FFFFFF', { opacity: 0.06 });
    Rc(g, 804, 350, 792, 15, 6, '#E3E7E6');
    Rc(g, 830, 364, 740, 496, 0, this.brick);
    Rc(g, 830, 838, 740, 22, 0, K.brickDark, { opacity: 0.55 });
    Rc(g, 830, 364, 740, 10, 0, '#000000', { opacity: 0.1 });
    // kozijnen: oud (verweerd) en nieuw, glas eroverheen
    var wins = [{ x: 896, y: 404, w: 232, h: 170, cols: [0.5, 0.5] }, { x: 1272, y: 404, w: 232, h: 170, cols: [0.5, 0.5] }, { x: 1180, y: 626, w: 324, h: 196, cols: [0.62, 0.38] }];
    var door = { x: 902, y: 612, w: 112, h: 248 };
    this.wins = wins; this.door = door;
    Rc(g, door.x, door.y, door.w, door.h, 3, '#2A2E32');                 // gang achter de deur
    var oldG = G(g), newG = G(g);
    function frames(p, col, old) {
      wins.forEach(function (w, wi) {
        Rc(p, w.x, w.y, w.w, w.h, 5, col);
        if (old) {
          Rc(p, w.x + 4, w.y + w.h - 15, w.w - 8, 11, 3, K.creamOldDark, { opacity: 0.7 });
          Rc(p, w.x + 2, w.y + 30 + wi * 14, 9, 46, 3, K.creamOldDark, { opacity: 0.6 });
          Rc(p, w.x + 26 + wi * 30, w.y + w.h - 12, 34, 7, 2, K.glue);
          Rc(p, w.x + w.w - 60 - wi * 22, w.y + w.h - 11, 22, 6, 2, K.glue);
          Pa(p, 'M' + (w.x + 70) + ' ' + (w.y + 4) + 'l14 5l10 -4l16 6', 'none', { stroke: '#9C8A62', 'stroke-width': 1.4 });
          Pa(p, 'M' + (w.x + w.w - 8) + ' ' + (w.y + 70) + 'l-5 12l4 9l-5 14', 'none', { stroke: '#9C8A62', 'stroke-width': 1.4 });
        }
      });
      Pa(p, 'M' + (door.x - 13) + ' ' + (door.y + door.h) + 'L' + (door.x - 13) + ' ' + (door.y - 8) + 'Q' + (door.x - 13) + ' ' + (door.y - 13) + ' ' + (door.x - 8) + ' ' + (door.y - 13) +
        'L' + (door.x + door.w + 8) + ' ' + (door.y - 13) + 'Q' + (door.x + door.w + 13) + ' ' + (door.y - 13) + ' ' + (door.x + door.w + 13) + ' ' + (door.y - 8) + 'L' + (door.x + door.w + 13) + ' ' + (door.y + door.h) +
        'L' + (door.x + door.w) + ' ' + (door.y + door.h) + 'L' + (door.x + door.w) + ' ' + door.y + 'L' + door.x + ' ' + door.y + 'L' + door.x + ' ' + (door.y + door.h) + 'Z', col);
      if (old) { Rc(p, door.x - 11, door.y + 150, 8, 60, 3, K.creamOldDark, { opacity: 0.6 }); Rc(p, door.x + door.w + 4, door.y + 40, 6, 20, 2, K.glue); }
    }
    frames(oldG, K.creamOld, true); frames(newG, K.creamNew, false);
    this.newClip = new SlantClip(st, newG); this.newG = newG;
    // glas + spiegeling onder de logo-hoek
    var gid = st.id + 'hg', gg = el('linearGradient', { id: gid, x1: 0, y1: 0, x2: 0, y2: 1 }, st.defs);
    el('stop', { offset: 0, 'stop-color': K.glass1 }, gg); el('stop', { offset: 1, 'stop-color': K.glass2 }, gg);
    var cid = st.id + 'hc', cp = el('clipPath', { id: cid }, st.defs), glassG = G(g), det = G(g, { fill: 'none' });
    wins.forEach(function (w) {
      var t = 13, m = 10, x = w.x + t, inner = w.w - 2 * t - m * (w.cols.length - 1);
      w.cols.forEach(function (c, ci) {
        var pw = inner * c;
        Rc(glassG, x, w.y + t, pw, w.h - 2 * t, 2, 'url(#' + gid + ')');
        Rc(cp, x, w.y + t, pw, w.h - 2 * t, 2);
        Rc(det, x, w.y + t, pw, w.h - 2 * t, 2, 'none', { stroke: '#000000', 'stroke-opacity': 0.18, 'stroke-width': 1.6 });
        if (ci > 0) Rc(det, x + 5, w.y + t + 5, pw - 10, w.h - 2 * t - 10, 1, 'none', { stroke: '#000000', 'stroke-opacity': 0.12, 'stroke-width': 1.4 });
        x += pw + m;
      });
      Rc(det, w.x, w.y, w.w, w.h, 5, 'none', { stroke: '#000000', 'stroke-opacity': 0.12, 'stroke-width': 1.4 });
      Rc(g, w.x - 9, w.y + w.h, w.w + 18, 12, 2, K.tile); Rc(g, w.x - 9, w.y + w.h, w.w + 18, 3, 1, '#FFFFFF', { opacity: 0.18 });
    });
    var refl = G(g, { 'clip-path': 'url(#' + cid + ')', fill: '#FFFFFF' });
    [[900, 46, 0.4], [990, 14, 0.28], [1250, 40, 0.36], [1330, 12, 0.26], [1120, 54, 0.3]].forEach(function (r) {
      Pa(refl, 'M' + f(r[0] + 390 * COT) + ' 390L' + f(r[0] + r[1] + 390 * COT) + ' 390L' + f(r[0] + r[1] + 840 * COT) + ' 840L' + f(r[0] + 840 * COT) + ' 840Z', '#FFFFFF', { opacity: r[2] });
    });
    // voordeur (scharniert links)
    var leaf = G(g);
    this.leaf = leaf;
    Rc(leaf, door.x, door.y, door.w, door.h, 3, '#2F4A3D');
    Rc(leaf, door.x + 24, door.y + 28, door.w - 48, 86, 4, K.glass2);
    Rc(leaf, door.x + 14, door.y + 140, door.w - 28, 90, 4, '#000000', { opacity: 0.12 });
    Rc(leaf, door.x + door.w - 22, door.y + 124, 8, 30, 4, '#C9CED0');
    this.setDoor = function (k) {   // 0 = dicht, 1 = open
      sa(leaf, 'transform', k <= 0 ? null : 'translate(' + door.x + ' 0) scale(' + f(1 - 0.8 * k) + ' 1) translate(' + (-door.x) + ' 0)');
    };
    // glinsteringen na oplevering
    this.sparks = [[940, 430], [1100, 548], [1320, 424], [1480, 560], [1240, 650], [1470, 800], [1000, 640]].map(function (p) {
      return { x: p[0], y: p[1], n: Pa(g, 'M0 -16Q2 -2 16 0Q2 2 0 16Q-2 2 -16 0Q-2 -2 0 -16Z', '#FFFFFF') };
    });
  }

  /* --- rolsteiger -------------------------------------------------------------------- */
  function Scaffold(parent) {
    var g = G(parent), parts = [];
    this.g = g;
    function tube(x1, y1, x2, y2, col, sw, a0) { parts.push({ n: Li(g, x1, y1, x1, y1, col, sw), a: [x1, y1, x2, y2], t: a0 }); }
    tube(1262, 852, 1262, 470, K.alu, 10, 0.0); tube(1522, 852, 1522, 470, K.alu, 10, 0.08);
    tube(1262, 800, 1522, 800, K.alu, 8, 0.28);
    tube(1262, 800, 1522, 620, K.aluDark, 6, 0.38); tube(1522, 800, 1262, 620, K.aluDark, 6, 0.46);
    tube(1246, 606, 1538, 606, K.inkSoft, 15, 0.56);
    tube(1262, 538, 1522, 538, K.alu, 8, 0.7); tube(1262, 474, 1522, 474, K.alu, 8, 0.78);
    var wheels = [Ci(g, 1262, 858, 0, K.inkSoft), Ci(g, 1522, 858, 0, K.inkSoft)];
    this.platformY = 598;
    this.set = function (b) {     // b = 0..1 opbouw
      show(g, b > 0.001);
      parts.forEach(function (p) {
        var k = E.out(clamp((b - p.t) / 0.22, 0, 1));
        show(p.n, k > 0.001);
        sa(p.n, 'x2', f(lerp(p.a[0], p.a[2], k))); sa(p.n, 'y2', f(lerp(p.a[1], p.a[3], k)));
      });
      wheels.forEach(function (w) { sa(w, 'r', f(10 * clamp(b / 0.1, 0, 1))); });
    };
  }

  function Tag(parent, str, x, y, bg, fg) {
    var g = G(parent), w = str.length * 22 + 52;
    Rc(g, 0, 0, w, 58, 29, bg);
    Tx(g, str, w / 2, 39, 25, 700, fg, 'middle', '0.14em');
    this.g = g; this.w = w; this.x = x; this.y = y;
    this.set = function (s, xx, yy) {
      show(g, s > 0.001);
      sa(g, 'transform', 'translate(' + f((xx == null ? x : xx) + w / 2) + ' ' + f((yy == null ? y : yy) + 29) + ') scale(' + f(s) + ') translate(' + f(-w / 2) + ' -29)');
    };
  }

  /* --- STRAAT: aankomen, kennismaken, steiger, en later de oplevering ----------------- */
  function StreetShot(st, parent, T) {
    var g = G(parent), cam = G(g), self = this, i;
    this.g = g; this.clip = new SlantClip(st, g);
    Rc(cam, -600, -400, 3200, 1300, 0, K.mintWash);
    var clouds = [[260, 96, 230, 56], [1180, 60, 180, 44], [1640, 130, 250, 60]].map(function (c) { return { n: Rc(cam, c[0], c[1], c[2], c[3], c[3] / 2, '#FFFFFF'), x: c[0] }; });
    var house = new House(st, cam);
    Rc(cam, -600, 860, 3200, 48, 0, K.walk); Rc(cam, -600, 904, 3200, 6, 0, '#CFCDC6'); Rc(cam, -600, 910, 3200, 400, 0, K.road);
    for (i = 0; i < 9; i++) Rc(cam, -500 + i * 330, 990, 150, 8, 4, '#FFFFFF', { opacity: 0.55 });
    // haag
    Rc(cam, 1150, 808, 436, 56, 24, K.hedge);
    for (i = 0; i < 7; i++) Ci(cam, 1185 + i * 62, 812, 26, i % 2 ? K.hedge : K.hedge2);
    Rc(cam, 1150, 836, 436, 28, 12, K.hedge);
    Rc(cam, 838, 822, 46, 42, 18, K.hedge2);
    var scaf = new Scaffold(cam);
    var back = G(cam);                                    // mensen achter de bus
    var wA = new Person(back, { shirt: K.ink, pants: K.inkSoft, skin: K.skin, hair: 'cap', hairColor: '#17191B', logo: true });
    var wB = new Person(back, { shirt: K.ink, pants: K.inkSoft, skin: '#EBC09C', hair: 'bun', hairColor: K.hair, logo: true });
    var cu = new Person(back, { shirt: K.mustard, pants: '#6C7B88', skin: '#EDC2A0', hair: 'short', hairColor: '#C9CED0' });
    var van = new Van(cam);
    // voor/na-scheidslijn en labels
    var divG = G(cam), divLine = Li(divG, 0, 0, 0, 0, '#FFFFFF', 8), tagNa = new Tag(divG, 'NA', 0, 0, K.mintDeep, '#FFFFFF'), tagVoor = new Tag(divG, 'VOOR', 0, 0, '#FFFFFF', K.rust);
    // pluspunten (schermruimte)
    var chips = ['10 jaar garantie op de folie', 'Opgeruimd achtergelaten', 'Gratis kozijncheck erbij'].map(function (s, k) {
      var cg = G(g), w = 0, tx;
      var bgR = Rc(cg, 0, 0, 100, 62, 31, '#FFFFFF'); Ci(cg, 31, 31, 16, K.mintDeep);
      Pa(cg, 'M23.5 31l5.4 5.8l9.6 -11.4', 'none', { stroke: '#FFFFFF', 'stroke-width': 3.8, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' });
      tx = Tx(cg, s, 60, 41, 25, 600, K.ink);
      return { g: cg, bg: bgR, tx: tx, s: s, y: 96 + k * 78 };
    });


    // ts = tijd sinds de straat in beeld kwam; tb = tijd sinds terugkeer na de close-up (of negatief)
    this.render = function (ts, tb) {
      var done = tb > 0, k, x;
      // camera
      var cz, cx, cy;
      if (!done) {
        cz = kf(ts, [[3.6, 1], [5.2, 1.3], [7.0, 1.3], [8.3, 1.12], [12.4, 1.12], [13.6, 1.3]]);
        cx = kf(ts, [[3.6, 960], [5.2, 930], [7.0, 930], [8.3, 1190], [12.4, 1190], [13.6, 1390]]);
        cy = kf(ts, [[3.6, 540], [5.2, 660], [7.0, 660], [8.3, 610], [12.4, 610], [13.6, 520]]);
      } else {
        cz = kf(tb, [[0, 1.12], [1.4, 1.0]]); cx = kf(tb, [[0, 1190], [1.4, 960]]); cy = kf(tb, [[0, 610], [1.4, 540]]);
      }
      sa(cam, 'transform', 'translate(960 540) scale(' + f(cz) + ') translate(' + f(-cx) + ' ' + f(-cy) + ')');
      clouds.forEach(function (c, j) { sa(c.n, 'x', f(c.x + (ts + (done ? 14 + tb : 0)) * (5 + j * 2))); });
      // bus rijdt voor
      var vq = seg(ts, 0.25, 2.5, E.out), vx = lerp(-720, 150, vq);
      van.set(vx, 922, 1, (vx + 720), 1.6 * Math.sin(Math.PI * seg(ts, 2.2, 0.9)) * (1 - seg(ts, 2.2, 0.9)));
      // deur
      house.setDoor(done ? 0 : kf(ts, [[4.2, 0], [4.7, 1], [12.75, 1], [13.2, 0]]));
      // --- monteur A (pet)
      var pA = { face: 1 };
      if (!done) {
        var a1 = seg(ts, 3.0, 1.9, E.inOut), a2 = seg(ts, 7.1, 1.5, E.inOut), climb = seg(ts, 12.0, 0.7, E.inOut);
        pA.x = lerp(lerp(590, 868, a1), 1330, a2) + climb * 60;
        pA.y = 862 - climb * (862 - scaf.platformY) - Math.sin(Math.PI * climb) * 40;
        pA.wt = Math.max(ww(a1), ww(a2));
        pA.o = seg(ts, 2.95, 0.25);
        var sh = seg(ts, 4.95, 0.35, E.out) * (1 - seg(ts, 6.75, 0.3, E.inOut));
        if (sh > 0) pA.a = [lerp(4, 62, sh), lerp(12, 28, sh) + 9 * Math.sin((ts - 5.3) * 15) * seg(ts, 5.3, 0.2) * (1 - seg(ts, 6.5, 0.2))];
        if (climb >= 1) { pA.a = [78 + 4 * Math.sin(ts * 5), 34]; pA.b = [58, 50]; }
      } else {
        var dn = seg(tb, 0.2, 0.7, E.inOut), wk = seg(tb, 0.9, 0.9, E.inOut);
        pA.x = lerp(1390, 1100, wk); pA.y = lerp(scaf.platformY, 862, dn) - Math.sin(Math.PI * dn) * 30;
        pA.face = wk > 0 && wk < 1 ? -1 : 1; pA.wt = ww(wk);
        k = seg(tb, 3.3, 0.4, E.out);
        if (k > 0) pA.a = [lerp(4, 152, k), lerp(12, 18, k) + 10 * Math.sin(tb * 9) * k];
      }
      wA.set(pA);
      // --- monteur B (knot)
      var pB = { face: 1, y: 862 };
      if (!done) {
        var b1 = seg(ts, 3.45, 1.2, E.inOut), b2 = seg(ts, 7.3, 1.5, E.inOut);
        pB.x = lerp(lerp(600, 742, b1), 1170, b2);
        pB.wt = Math.max(ww(b1), ww(b2));
        pB.o = seg(ts, 3.4, 0.25);
        k = seg(ts, 5.0, 0.4, E.out) * (1 - seg(ts, 6.8, 0.3, E.inOut));
        if (k > 0) pB.a = [lerp(4, 158, k), lerp(12, 24, k) + 16 * Math.sin(ts * 10) * k];
        if (ts > 9.2 && ts < 12.6) pB.a = [52, 78];
      } else {
        pB.x = 1010;
        k = seg(tb, 3.5, 0.4, E.out);
        if (k > 0) { pB.a = [lerp(4, 150, k), lerp(12, 20, k) - 10 * Math.sin(tb * 9) * k]; pB.b = [lerp(-2, 150, k), 20]; }
      }
      wB.set(pB);
      // --- klant
      var pC = { face: -1, y: 862 };
      if (!done) {
        var c1 = seg(ts, 4.45, 0.7, E.out), c2 = seg(ts, 7.2, 1.2, E.inOut), c3 = seg(ts, 11.8, 0.8, E.inOut);
        pC.x = lerp(lerp(lerp(958, 972, c1), 1060, c2), 958, c3); pC.o = Math.min(seg(ts, 4.4, 0.3), 1 - seg(ts, 12.5, 0.22));
        pC.face = (c2 > 0 && c2 < 1) ? 1 : (c3 > 0 ? -1 : (c2 >= 1 ? 1 : -1));
        pC.wt = Math.max(ww(c2), ww(c3)); pC.amp = 19; pC.stride = 128;
        var shc = seg(ts, 4.95, 0.35, E.out) * (1 - seg(ts, 6.75, 0.3, E.inOut));
        if (shc > 0) pC.a = [lerp(4, 62, shc), lerp(12, 28, shc) - 9 * Math.sin((ts - 5.3) * 15) * seg(ts, 5.3, 0.2) * (1 - seg(ts, 6.5, 0.2))];
        if (ts > 9.2 && ts < 11.8) pC.a = [52, 78];
      } else {
        pC.x = 1212; pC.face = -1; pC.o = seg(tb, 1.0, 0.3);
        k = seg(tb, 3.4, 0.4, E.out);
        if (k > 0) pC.a = [lerp(4, 150, k), lerp(12, 20, k) + 10 * Math.sin(tb * 9 + 1) * k];
      }
      cu.set(pC);
      // --- steiger
      scaf.set(done ? 1 - seg(tb, 0.9, 1.0) : seg(ts, 8.3, 2.2));
      // --- oplevering: schuine voor/na-veeg over de gevel
      var rv = done ? seg(tb, 1.5, 2.0, E.inOut) : 0, xe = lerp(760 - 870 * COT, 1660 - 330 * COT, rv);
      if (rv <= 0) show(house.newG, false);
      else { show(house.newG, true); if (rv >= 1) house.newClip.off(); else house.newClip.set(xe, -1); }
      var dv = done ? Math.min(seg(tb, 1.3, 0.3), 1 - seg(tb, 3.5, 0.3)) : 0;
      op(divG, dv);
      if (dv > 0) {
        sa(divLine, 'x1', f(xe + 300 * COT)); sa(divLine, 'y1', 300); sa(divLine, 'x2', f(xe + 880 * COT)); sa(divLine, 'y2', 880);
        tagNa.set(1, xe + 300 * COT - tagNa.w - 22, 232); tagVoor.set(1, xe + 300 * COT + 30, 232);
      }
      house.sparks.forEach(function (s, j) {
        var q = done ? ((tb - 3.3 - j * 0.23) / 1.5) : -1, on = q > 0 && tb < 7.5, qq = q % 1;
        show(s.n, on);
        if (on) sa(s.n, 'transform', 'translate(' + s.x + ' ' + s.y + ') rotate(' + f(qq * 90) + ') scale(' + f(Math.sin(Math.PI * qq) * 1.25) + ')');
      });
      chips.forEach(function (ch, j) {
        var s2 = done ? pop(tb, 3.7 + j * 0.42, 0.45) : 0;
        show(ch.g, s2 > 0.001);
        if (s2 > 0.001) {
          var w = textW(ch.tx, ch.s, 25) + 92;
          sa(ch.bg, 'width', f(w));
          sa(ch.g, 'transform', 'translate(96 ' + ch.y + ') scale(' + f(s2) + ')');
        }
      });
    };
  }

  /* --- de drie vaste werkstappen, rechtsboven in het close-up ----------------------------- */
  var STAP = [[1.5, 4.85], [4.85, 8.15], [8.15, 11.1]];
  function StappenPillen(outer) {
    var i;
    var stappen = ['Toplaag eraf', 'Reinigen en vetvrij', 'Nieuwe folie erop'].map(function (s2) { return { s: s2, w: Math.round(s2.length * 13.8 + 90) }; }), sx = 1824;
    for (i = stappen.length - 1; i >= 0; i--) { sx -= stappen[i].w; stappen[i].x = sx; sx -= 14; }
    stappen.forEach(function (sp, k2) {
      sp.g = G(outer);
      Rc(sp.g, 0, 8, sp.w, 58, 29, '#22262A', { opacity: 0.08 });
      sp.bg = Rc(sp.g, 0, 0, sp.w, 58, 29, '#FFFFFF');
      sp.dot = Ci(sp.g, 30, 29, 17, K.mintSoft);
      sp.nr = Tx(sp.g, String(k2 + 1), 30, 37, 21, 700, K.mintDeep, 'middle');
      sp.vink = Pa(sp.g, 'M22.5 29.5l5 5.3l9 -10.6', 'none', { stroke: '#FFFFFF', 'stroke-width': 3.6, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' });
      sp.tx = Tx(sp.g, sp.s, 58, 38, 23, 600, K.ink);
    });
    return stappen;
  }
  function stappenStand(stappen, tc) {
    stappen.forEach(function (sp, k2) {
      var a = pop(tc, 0.7 + k2 * 0.12, 0.4), nu = tc >= STAP[k2][0] && tc < STAP[k2][1], klaar = tc >= STAP[k2][1];
      show(sp.g, a > 0.001);
      sa(sp.g, 'transform', 'translate(' + f(sp.x + sp.w / 2) + ' 113) scale(' + f(a) + ') translate(' + f(-sp.w / 2) + ' -29)');
      sa(sp.bg, 'fill', nu ? K.mintDeep : '#FFFFFF');
      sa(sp.dot, 'fill', nu ? '#FFFFFF' : (klaar ? K.mintDeep : K.mintSoft));
      show(sp.nr, !klaar); show(sp.vink, klaar);
      sa(sp.tx, 'fill', nu ? '#FFFFFF' : K.ink); op(sp.tx, nu || klaar ? 1 : 0.62);
    });
  }

  /* --- CLOSE-UP: de vaste werkwijze in drie stappen ------------------------------------
   * In 3D (zie hieronder); dit platte close-up is alleen nog de terugval zonder WebGL.
   * 1 de toplaag (oude folie) gaat eraf, met warmte; 2 reinigen: de doek veegt de lijmresten weg,
   * er gaat ontvetter op en hij veegt nog een keer na; 3 de nieuwe folie rolt uit en de rakel drukt
   * hem aan. Rechtsboven lichten de drie stappen op terwijl ze gebeuren. */
  function CloseShot(st, parent) {
    var outer = G(parent), g = G(outer), i;
    this.g = outer; this.clip = new SlantClip(st, outer);
    // In 3D: hetzelfde kozijn als de hero op de homepage (kozijn3d.js en kozijn-klus.js, met WebGL).
    // Zonder die scripts of zonder WebGL: het platte close-up hieronder.
    var K3D = typeof window !== 'undefined' && window.iwrapKozijnKlus;
    if (K3D && K3D.kan()) {
      var fo = el('foreignObject', { x: 0, y: 0, width: 1920, height: 1080 }, outer);
      var cv3 = document.createElement('canvas'); cv3.width = 1920; cv3.height = 1080;
      cv3.setAttribute('style', 'display:block;width:1920px;height:1080px');
      fo.appendChild(cv3);
      var cx3 = cv3.getContext('2d');
      var tagV = new Tag(outer, 'VOOR', 96, 84, '#FFFFFF', K.rust), tagN = new Tag(outer, 'NA', 96, 84, K.mintDeep, '#FFFFFF');
      var st3 = StappenPillen(outer);
      this.render = function (tc) {
        K3D.teken(cx3, tc, 1920, 1080);
        tagV.set(pop(tc, 0.55, 0.4) * (1 - seg(tc, 4.9, 0.25, E.in)));
        tagN.set(pop(tc, 11.2, 0.45));
        stappenStand(st3, tc);
      };
      return;
    }
    var bid = st.id + 'b2', bp = el('pattern', { id: bid, patternUnits: 'userSpaceOnUse', width: 250, height: 124 }, st.defs);
    Rc(bp, 0, 0, 250, 124, 0, K.brick);
    Rc(bp, 0, 0, 250, 6, 0, '#FFFFFF', { opacity: 0.22 }); Rc(bp, 0, 62, 250, 6, 0, '#FFFFFF', { opacity: 0.22 });
    Rc(bp, 0, 0, 6, 62, 0, '#FFFFFF', { opacity: 0.22 }); Rc(bp, 125, 62, 6, 62, 0, '#FFFFFF', { opacity: 0.22 });
    Rc(bp, 24, 18, 80, 30, 3, '#000000', { opacity: 0.05 }); Rc(bp, 150, 82, 70, 28, 3, '#FFFFFF', { opacity: 0.06 });
    Rc(g, 0, 0, 1920, 1080, 0, 'url(#' + bid + ')');
    // glas
    var gid = st.id + 'cg', gg = el('linearGradient', { id: gid, x1: 0, y1: 0, x2: 0, y2: 1 }, st.defs);
    el('stop', { offset: 0, 'stop-color': '#E3EEF0' }, gg); el('stop', { offset: 1, 'stop-color': '#BFD4D8' }, gg);
    Rc(g, 430, -20, 1540, 560, 0, 'url(#' + gid + ')');
    [[640, 150, 0.4], [860, 44, 0.28], [1340, 190, 0.3], [1600, 50, 0.22]].forEach(function (r) {
      Pa(g, 'M' + r[0] + ' -20L' + (r[0] + r[1]) + ' -20L' + f(r[0] + r[1] + 560 * COT) + ' 540L' + f(r[0] + 560 * COT) + ' 540Z', '#FFFFFF', { opacity: r[2] });
    });
    // dorpelstenen
    for (i = 0; i < 9; i++) { Rc(g, 236 + i * 238, 760, 230, 92, 6, K.tile); Rc(g, 236 + i * 238, 760, 230, 16, 6, '#FFFFFF', { opacity: 0.16 }); }
    Rc(g, 236, 846, 1700, 10, 0, '#000000', { opacity: 0.16 });
    // het kozijn als L-vorm: stijl + onderdorpel
    var FD = 'M250 -20L430 -20L430 540L1960 540L1960 760L250 760Z';
    Pa(g, FD, K.profile);
    for (i = 0; i < 4; i++) { Rc(g, 430, 584 + i * 46, 1540, 3, 0, '#FFFFFF', { opacity: 0.5 }); Rc(g, 286 + i * 36, -20, 3, 600, 0, '#FFFFFF', { opacity: 0.5 }); }
    var glueG = G(g); Pa(glueG, FD, K.glue);
    for (i = 0; i < 26; i++) Li(glueG, 270 + i * 66, 752, 270 + i * 66 + 40, 560, '#C99A22', 5, { opacity: 0.28 });
    var oldG = G(g); Pa(oldG, FD, K.creamOld);
    // schade aan de oude folie
    [[520, 600, 220, 60], [980, 640, 300, 90], [1500, 580, 240, 70], [290, 240, 80, 200], [1740, 660, 150, 70]].forEach(function (b) { el('ellipse', { cx: b[0] + b[2] / 2, cy: b[1] + b[3] / 2, rx: b[2] / 2, ry: b[3] / 2, fill: K.creamOldDark, opacity: 0.45 }, oldG); });
    ['M470 548l40 46l-18 40l52 44l-10 52', 'M900 760l-30 -60l44 -40l-36 -62l30 -58', 'M1400 540l26 60l-40 34l48 60l-22 66', 'M300 60l44 50l-30 60l40 70', 'M1700 548l-20 50l40 30'].forEach(function (d) {
      Pa(oldG, d, 'none', { stroke: '#8E7C55', 'stroke-width': 4, 'stroke-linejoin': 'round', 'stroke-linecap': 'round' });
      Pa(oldG, d, 'none', { stroke: '#FFFFFF', 'stroke-width': 1.6, 'stroke-linejoin': 'round', opacity: 0.35, transform: 'translate(4 2)' });
    });
    Pa(oldG, 'M1090 760L1070 690Q1120 650 1210 668L1290 700L1310 760Z', K.glue);                       // plek waar de folie al los is
    Pa(oldG, 'M1070 690Q1120 650 1210 668L1290 700Q1220 640 1130 630Q1080 640 1070 690Z', '#EDE3C7');   // opgekrulde flap
    Pa(oldG, 'M1070 690Q1120 650 1210 668L1290 700', 'none', { stroke: '#000000', 'stroke-width': 5, opacity: 0.14 });
    [[620, 700, 16], [680, 716, 10], [1560, 700, 14], [330, 420, 12]].forEach(function (b) { Ci(oldG, b[0], b[1], b[2], '#E6DBBB'); Ci(oldG, b[0] - b[2] * 0.3, b[1] - b[2] * 0.3, b[2] * 0.35, '#FFFFFF', { opacity: 0.5 }); });
    var newG = G(g); Pa(newG, FD, K.creamNew); Rc(newG, 430, 540, 1540, 8, 0, '#FFFFFF', { opacity: 0.7 }); Rc(newG, 422, -20, 8, 560, 0, '#FFFFFF', { opacity: 0.5 });
    var hid = st.id + 'ch', hg = el('linearGradient', { id: hid, gradientUnits: 'userSpaceOnUse' }, st.defs);
    el('stop', { offset: 0, 'stop-color': '#FFFFFF', 'stop-opacity': 0 }, hg); el('stop', { offset: 1, 'stop-color': '#FFFFFF', 'stop-opacity': 0.75 }, hg);
    var gloss = Pa(newG, FD, 'url(#' + hid + ')');
    var cGlue = new SlantClip(st, glueG), cOld = new SlantClip(st, oldG), cNew = new SlantClip(st, newG);
    // glaslat en rubber
    Rc(g, 430, 524, 1540, 18, 0, K.inkSoft); Rc(g, 426, -20, 18, 562, 0, K.inkSoft);
    Rc(g, 250, 758, 1720, 6, 0, '#000000', { opacity: 0.18 });
    // reinigen: na de lijm een nevel ontvetter, nog een keer nadoen, dan glanst de schone ondergrond
    var shid = st.id + 'cs', shg = el('linearGradient', { id: shid, gradientUnits: 'userSpaceOnUse' }, st.defs);
    el('stop', { offset: 0, 'stop-color': '#FFFFFF', 'stop-opacity': 0 }, shg); el('stop', { offset: 0.5, 'stop-color': '#FFFFFF', 'stop-opacity': 0.8 }, shg); el('stop', { offset: 1, 'stop-color': '#FFFFFF', 'stop-opacity': 0 }, shg);
    var shine = Pa(g, FD, 'url(#' + shid + ')');
    var rnd = rng(41), mist = G(g), drops = [];
    for (i = 0; i < 46; i++) { var dx = 300 + rnd() * 1620, dy = 572 + rnd() * 172; drops.push({ x: dx, y: dy, n: Ci(mist, dx, dy, 2.6 + rnd() * 4.4, '#FFFFFF', { opacity: 0.85 }) }); }
    // gereedschap
    var rollOld = G(g), ro1 = Li(rollOld, 0, 0, 0, 0, '#000000', 30, { opacity: 0.14 }), ro2 = Li(rollOld, 0, 0, 0, 0, K.creamOldDark, 30), ro3 = Li(rollOld, 0, 0, 0, 0, '#E3D7B6', 8);
    var cloth = G(g); Pa(cloth, 'M-70 -60Q0 -84 64 -58Q86 0 60 62Q-4 84 -66 58Q-88 0 -70 -60Z', '#FFFFFF'); Pa(cloth, 'M-30 -40Q10 -10 -14 36', 'none', { stroke: K.mintSoft, 'stroke-width': 9, 'stroke-linecap': 'round' }); Pa(cloth, 'M14 -44Q46 -6 26 40', 'none', { stroke: K.mintSoft, 'stroke-width': 9, 'stroke-linecap': 'round' });
    var cone = el('polygon', { points: '0,0 0,0 0,0', fill: K.mint, opacity: 0.28 }, g);
    var bottle = G(g);
    Rc(bottle, 46, 24, 70, 136, 20, K.mint); Rc(bottle, 46, 66, 70, 42, 0, '#FFFFFF', { opacity: 0.55 });
    Rc(bottle, 58, -2, 44, 34, 8, K.ink); Rc(bottle, -6, -16, 84, 30, 12, K.ink); Rc(bottle, 38, 10, 16, 44, 7, K.inkSoft);
    Rc(bottle, -2, -8, 26, 6, 3, '#FFFFFF', { opacity: 0.18 });
    var stappen = StappenPillen(outer);
    var rollNew = G(g), rn1 = Li(rollNew, 0, 0, 0, 0, '#000000', 30, { opacity: 0.14 }), rn2 = Li(rollNew, 0, 0, 0, 0, '#E7DFCC', 30), rn3 = Li(rollNew, 0, 0, 0, 0, '#FFFFFF', 8);
    var rak = G(g);
    Li(rak, 0, 6, 0, 6, '#000000', 60, { opacity: 0.12 });
    var rk = G(rak); Rc(rk, -40, -170, 80, 250, 16, K.rust); Rc(rk, -40, 40, 80, 60, 10, '#F4F2EC'); Rc(rk, -40, 40, 80, 10, 0, '#000000', { opacity: 0.1 }); Rc(rk, -22, -140, 44, 120, 10, '#FFFFFF', { opacity: 0.14 });
    var gun = G(g);
    Rc(gun, -210, -64, 250, 128, 44, K.inkSoft); Rc(gun, -50, 30, 96, 210, 30, '#2A2E32'); Rc(gun, -250, -42, 70, 84, 12, K.alu);
    Rc(gun, -196, -64, 26, 128, 0, K.rust); Rc(gun, -120, -30, 110, 12, 6, '#FFFFFF', { opacity: 0.14 });
    var heat = [0, 1, 2].map(function () { return el('path', { d: '', fill: 'none', stroke: K.rust, 'stroke-width': 9, 'stroke-linecap': 'round', opacity: 0.6 }, g); });
    var tagVoor = new Tag(g, 'VOOR', 96, 84, '#FFFFFF', K.rust), tagNa = new Tag(g, 'NA', 96, 84, K.mintDeep, '#FFFFFF');
    var sparks = [[700, 640], [1180, 610], [1640, 690], [340, 300], [960, 700]].map(function (p) { return { x: p[0], y: p[1], n: Pa(g, 'M0 -34Q4 -4 34 0Q4 4 0 34Q-4 4 -34 0Q-4 -4 0 -34Z', '#FFFFFF') }; });
    var X0 = -160, X1 = 1760;
    function roll(a, b, c, xe, w) {
      var ya = 520, yb = 782;
      [a, b, c].forEach(function (n, j) {
        var off = j === 0 ? 10 : 0;
        sa(n, 'x1', f(xe + ya * COT + off)); sa(n, 'y1', ya + off); sa(n, 'x2', f(xe + yb * COT + off)); sa(n, 'y2', yb + off);
        sa(n, 'stroke-width', f(j === 2 ? Math.max(3, w * 0.22) : w));
      });
    }
    this.render = function (tc) {
      var k, zz = 1 + 0.045 * seg(tc, 0, 13, E.inOut);
      sa(g, 'transform', 'translate(960 620) scale(' + f(zz) + ') translate(-960 -620)');
      // oude folie rolt op (met warmte)
      var pp = seg(tc, 1.7, 3.1, E.inOut), xp = lerp(X0, X1, pp);
      if (pp <= 0) cOld.off(); else cOld.set(xp, 1);
      show(oldG, pp < 1);
      var ro = Math.min(seg(tc, 1.5, 0.3), 1 - seg(tc, 4.75, 0.35));
      op(rollOld, ro);
      if (ro > 0) roll(ro1, ro2, ro3, xp + 18, lerp(34, 92, pp));
      var gp = Math.min(seg(tc, 0.9, 0.6, E.out), 1 - seg(tc, 4.6, 0.5, E.in)), gx = xp + 520 * COT + 470, gy = lerp(120, 330, gp);
      show(gun, gp > 0.001);
      sa(gun, 'transform', 'translate(' + f(gx) + ' ' + f(gy) + ') rotate(-34)');
      heat.forEach(function (n, j) {
        var on = gp > 0.6, bx = gx - 250 - j * 54, by = gy + 170 + j * 36, d = 'M' + f(bx) + ' ' + f(by), q;
        for (q = 0; q < 3; q++) d += 'q' + f(-18 + 14 * Math.sin(tc * 9 + j + q)) + ' 22 -22 44';
        sa(n, 'd', on ? d : ''); sa(n, 'opacity', f(0.3 + 0.3 * Math.sin(tc * 7 + j * 2)));
      });
      // stap 2, reinigen: de doek veegt de lijmresten weg; ontvetter erop; de doek veegt nog een keer na
      var cp2 = seg(tc, 4.9, 1.5, E.inOut), xc = lerp(X0, X1, cp2);
      if (cp2 <= 0) cGlue.off(); else cGlue.set(xc, 1);
      show(glueG, cp2 < 1);
      var cq = seg(tc, 6.9, 1.1, E.inOut), xc2 = lerp(X0, X1, cq), tweede = tc >= 6.6;
      k = tweede ? Math.min(seg(tc, 6.8, 0.2), 1 - seg(tc, 7.95, 0.2)) : Math.min(seg(tc, 4.8, 0.25), 1 - seg(tc, 6.3, 0.2));
      show(cloth, k > 0.001);
      sa(cloth, 'transform', 'translate(' + f((tweede ? xc2 : xc) + 650 * COT + 20) + ' ' + f(650 + 54 * Math.sin(tc * 16)) + ') scale(' + f(k) + ')');
      var bq = seg(tc, 6.3, 0.9, E.inOut), xn = lerp(X0 + 260, X1 + 260, bq), bk = Math.min(seg(tc, 6.12, 0.2), 1 - seg(tc, 7.12, 0.2));
      show(bottle, bk > 0.001); sa(bottle, 'transform', 'translate(' + f(xn) + ' 260) scale(' + f(bk * 1.7) + ')');
      var spuit = bk > 0.5 && bq > 0 && bq < 1, yb2 = 760, xb2 = xn - 10 - (yb2 - 258) * COT;
      show(cone, spuit); if (spuit) sa(cone, 'points', f(xn - 10) + ',258 ' + f(xb2 - 70) + ',' + yb2 + ' ' + f(xb2 + 70) + ',' + yb2);
      drops.forEach(function (d) {
        var nat = tc > 6.3 && d.x < xn - 10 - (d.y - 258) * COT, weg = tc >= 6.9 && d.x < xc2 + d.y * COT + 20;
        show(d.n, nat && !weg && tc < 8.1);
      });
      var sq = seg(tc, 7.75, 0.6, E.inOut);
      show(shine, sq > 0 && sq < 1);
      if (sq > 0 && sq < 1) { var xs = lerp(X0, X1 + 300, sq); sa(shg, 'x1', f(xs - 170 * UY)); sa(shg, 'y1', f(170 * UX)); sa(shg, 'x2', f(xs + 170 * UY)); sa(shg, 'y2', f(-170 * UX)); }
      // nieuwe folie rolt uit, rakel drukt aan
      var ap = seg(tc, 8.2, 2.5, E.inOut), xa = lerp(X0, X1, ap);
      show(newG, ap > 0);
      if (ap >= 1) cNew.off(); else if (ap > 0) cNew.set(xa, -1);
      var rn = Math.min(seg(tc, 8.0, 0.3), 1 - seg(tc, 10.6, 0.3));
      op(rollNew, rn);
      if (rn > 0) roll(rn1, rn2, rn3, xa + 16, lerp(96, 36, ap));
      var rp = seg(tc, 8.9, 2.6, E.inOut), xr = lerp(X0 - 120, X1 + 200, rp);
      k = Math.min(seg(tc, 8.8, 0.3), 1 - seg(tc, 11.4, 0.3));
      show(rak, k > 0.001);
      sa(rak, 'transform', 'translate(' + f(xr + 650 * COT) + ' 650) rotate(' + f(90 - THETA * 180 / Math.PI + 4 * Math.sin(tc * 5)) + ') scale(' + f(k) + ')');
      sa(hg, 'x1', f(xr - 260 * UY)); sa(hg, 'y1', f(260 * UX)); sa(hg, 'x2', f(xr)); sa(hg, 'y2', 0);
      show(gloss, rp > 0 && rp < 1);
      // labels en glinstering
      tagVoor.set(pop(tc, 0.55, 0.4) * (1 - seg(tc, 4.9, 0.25, E.in)));
      tagNa.set(pop(tc, 11.2, 0.45));
      stappenStand(stappen, tc);
      sparks.forEach(function (s, j) {
        var q = (tc - 11.3 - j * 0.18) / 1.2, on = q > 0 && q < 1;
        show(s.n, on);
        if (on) sa(s.n, 'transform', 'translate(' + s.x + ' ' + s.y + ') rotate(' + f(q * 90) + ') scale(' + f(Math.sin(Math.PI * q) * 1.3) + ')');
      });
    };
  }

  /* --- montage: alle delen achter elkaar ---------------------------------------------- */
  SC.klus.build = function (st, root, T, o) {
    T.close = T.street + 13.6; T.closeD = 13.0;
    T.back = T.close + T.closeD;
    T.mapOut = T.back + 7.4;
    T.end = T.mapOut + 3.6;
    var street = new StreetShot(st, root, T);
    var close = new CloseShot(st, root);
    var mapOut = new MapShot(st, root, { T: T, dest: o.dest });
    var mapClip = new SlantClip(st, mapOut.g);
    // eindkaart
    var endG = G(root), endClip = new SlantClip(st, endG), th = theme({ theme: 'mint' });
    Rc(endG, -400, -400, 2720, 1880, 0, K.mint);
    var mid = st.id + 'em', rg = el('radialGradient', { id: mid + 'g', gradientUnits: 'userSpaceOnUse', cx: 960, cy: 540, r: 1180 }, st.defs);
    el('stop', { offset: 0, 'stop-color': '#000' }, rg); el('stop', { offset: 0.4, 'stop-color': '#000' }, rg); el('stop', { offset: 1, 'stop-color': '#fff' }, rg);
    var msk = el('mask', { id: mid, maskUnits: 'userSpaceOnUse', x: 0, y: 0, width: 1920, height: 1080 }, st.defs);
    Rc(msk, 0, 0, 1920, 1080, 0, 'url(#' + mid + 'g)');
    var pat = new Pattern(G(endG, { mask: 'url(#' + mid + ')' }), 1920, 1080, th.pat, { patScale: 1.25, patLoop: 16, seed: 11 });
    var L = GEO.lockups.tagline, ls = 0.86, lg = G(endG, { transform: 'translate(' + f(960 - L.w * ls / 2) + ' ' + f(470 - L.h * ls / 2) + ') scale(' + ls + ')' });
    var logo = uitrolInto(st, lg, L, 'tagline', th, { outro: false, hold: 0, shift: true });
    var url = Tx(endG, 'iwrap.nl', 960, 792, 46, 600, '#FFFFFF', 'middle', '0.06em');
    var dur = T.end + 0.5 + logo.rest + 2.6;
    var captions = [
      { t0: T.street + 3.3, t1: T.street + 7.0, text: 'Je weet vooraf wie er komt, en wanneer.' },
      { t0: T.street + 8.5, t1: T.street + 12.6, text: 'Steiger op. Samen lopen we het kozijn na.' },
      { t0: T.close + 1.4, t1: T.close + 4.6, text: 'Oude folie eraf. Het kozijn blijft gewoon zitten.' },
      { t0: T.close + 5.1, t1: T.close + 7.8, text: 'Lijmresten eraf, alles vetvrij.' },
      { t0: T.close + 8.3, t1: T.close + 12.5, text: 'Nieuwe Renolit folie erop.' },
      { t0: T.back + 2.0, t1: T.mapOut - 0.3, text: 'Weer als nieuw.' },
      { t0: T.mapOut + 0.7, t1: T.end - 0.2, text: 'Door heel Nederland.' }
    ];
    return {
      captions: captions, duration: dur, irisOff: T.street + 0.95,
      render: function (t, rakel) {
        var ts = t - T.street, tc = t - T.close, tb = t - T.back, to = t - T.mapOut, te = t - T.end, WD = 0.85, p = 0, w;
        // straat
        var sOn = ts >= 0 && to < WD + 0.05;
        show(street.g, sOn);
        if (sOn) {
          street.render(ts, tb);
          w = seg(ts, 0, WD, E.inOut);
          if (w < 1) { street.clip.set(rakel.x(w), -1); p = w; } else street.clip.off();
        }
        // close-up: veegt erin, en later weer weg
        var cOn = tc >= 0 && tb < WD + 0.05;
        show(close.g, cOn);
        if (cOn) {
          close.render(tc);
          w = seg(tc, 0, WD, E.inOut);
          if (w < 1) { close.clip.set(rakel.x(w), -1); p = w; }
          else if (tb > 0) { w = seg(tb, 0, WD, E.inOut); close.clip.set(rakel.x(w), 1); p = w; }
          else close.clip.off();
        }
        // kaart, uitgezoomd
        var mOn = to >= 0 && te < WD + 0.05;
        show(mapOut.g, mOn);
        if (mOn) {
          mapOut.render(t, 'out', to);
          w = seg(to, 0, WD, E.inOut);
          if (w < 1) { mapClip.set(rakel.x(w), -1); p = w; } else mapClip.off();
        }
        // eindkaart
        var eOn = te >= 0;
        show(endG, eOn);
        if (eOn) {
          pat.render(te); logo.render(te - 0.75);
          op(url, seg(te, 0.75 + logo.rest - 0.9, 0.5)); sa(url, 'transform', 'translate(0 ' + f(18 * (1 - seg(te, 0.75 + logo.rest - 0.9, 0.7, E.out))) + ')');
          w = seg(te, 0, WD, E.inOut);
          if (w < 1) { endClip.set(rakel.x(w), -1); p = w; } else endClip.off();
        }
        rakel.draw(p);
      }
    };
  };
