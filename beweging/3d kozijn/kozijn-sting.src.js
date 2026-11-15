/* ---------------------------------------------------------------------------
   Van beschadigd naar mooi: het werk in een paar seconden, en dan het logo.

   Hetzelfde kozijn als in de 3D-animatie (kozijn3d.js moet eerst geladen zijn).
   1. Dichtbij en laag langs de dorpel: verweerde, gebarsten folie, een schilfer
      die loslaat (zoals de voor-foto op de site).
   2. Eén haal over de dorpel en dan de stijl omhoog: voorop krult de oude folie op,
      vlak erachter rolt de nieuwe folie erop en drukt de rakel aan. Ondertussen
      gaat de camera rustig achteruit, zodat je de hele hoek ziet.
   3. Een glans gaat over de nieuwe folie (zoals de na-foto).
   4. Het logo komt ernaast, met de uitrol van de Motion Kit. Het eindbeeld is het
      kozijn naast het logo met "Specialist in kozijnfolie".

   teken(ctx, t, breedte, hoogte, { variant: "licht" | "mint", logo: true | false })
   --------------------------------------------------------------------------- */
(function () {
  "use strict";
  var K3 = window.iwrapKozijn3D, Mo = K3 && K3.motor;
  if (!Mo) return;
  var m = Mo.maten, LEN = m.LEN, PH = m.PH, SW = m.SW, STI = m.STI, RV = m.RV, DN = m.DN, FLAP = m.FLAP, MARGE = m.MARGE;
  var klem = Mo.klem, mix = Mo.mix, fase = Mo.fase, E = Mo.E, kromme = Mo.kromme, som = Mo.som, maal = Mo.maal;
  var GEO = __GEO__;

  var DUUR = 6.6;
  var T = {
    oud: [0.95, 2.75], nieuw: [1.25, 3.05],        // dorpel: voorop de oude folie eraf, erachter de nieuwe erop
    oudS: [2.7, 3.45], nieuwS: [2.98, 3.75],       // dan de stijl omhoog
    glans: [3.95, 5.2], logo: 4.25
  };
  // camera: [t, doel x, doel y, zoom, draaiing, kanteling, afstand]
  var CAM = [
    [0.0, 396, 58, 2.55, 68, 14, 760],
    [0.95, 374, 60, 2.45, 64, 15, 780],
    [1.9, 312, 72, 1.75, 54, 17, 880],
    [2.9, 228, 104, 1.16, 43, 21, 1040],
    [3.8, 238, 118, 1.0, 37, 22, 1150],
    [DUUR, 250, 120, 0.97, 33, 23, 1150]
  ];

  /* Waar de rollen zijn ---------------------------------------------------------------- */
  function grens(iv, L, t) { return mix(L + MARGE, -MARGE, E.gelijk(fase(t, iv[0], iv[1] - iv[0]))); }
  function zones(t) {
    var gO = grens(T.oud, LEN, t), gN = grens(T.nieuw, LEN, t), gOS = grens(T.oudS, STI, t), gNS = grens(T.nieuwS, STI, t);
    var oud = t > T.oud[0] ? [gO, 1e5] : null, nw = t > T.nieuw[0] ? [gN, 1e5] : null;
    var oudS = t > T.oudS[0] ? [gOS, 1e5] : null, nwS = t > T.nieuwS[0] ? [gNS, 1e5] : null;
    return {
      z: { pel: [oud, oudS], krab: [oud, oudS], nieuw: [nw, nwS], doek: [oud, oudS], nat: [null, null], nieuwBoven: nw ? [gN + FLAP, 1e5] : null, doekG: [null, null], los: 0 },
      gO: gO, gN: gN, gOS: gOS, gNS: gNS
    };
  }

  /* Het logo (vormen uit de Motion Kit) ------------------------------------------------- */
  function bezier(x1, y1, x2, y2) {
    var cx = 3 * x1, bx = 3 * (x2 - x1) - cx, ax = 1 - cx - bx, cy = 3 * y1, by = 3 * (y2 - y1) - cy, ay = 1 - cy - by;
    function sx(t) { return ((ax * t + bx) * t + cx) * t; }
    function sy(t) { return ((ay * t + by) * t + cy) * t; }
    function dx(t) { return (3 * ax * t + 2 * bx) * t + cx; }
    return function (x) {
      if (x <= 0) return 0; if (x >= 1) return 1;
      var t = x, i, e, d;
      for (i = 0; i < 8; i++) { e = sx(t) - x; if (Math.abs(e) < 1e-6) return sy(t); d = dx(t); if (Math.abs(d) < 1e-6) break; t -= e / d; }
      var lo = 0, hi = 1; t = x;
      for (i = 0; i < 32; i++) { e = sx(t); if (Math.abs(e - x) < 1e-6) break; if (x > e) lo = t; else hi = t; t = (lo + hi) / 2; }
      return sy(t);
    };
  }
  var EL = {
    out: bezier(0.16, 1, 0.3, 1), inOut: bezier(0.65, 0, 0.35, 1), roll: bezier(0.6, 0, 0.2, 1.18),
    pop: function (t) { var c = 1.6, u = t - 1; return 1 + (c + 1) * u * u * u + c * u * u; }
  };
  function seg(t, t0, d, e) { var p = klem((t - t0) / d, 0, 1); return e ? e(p) : p; }
  var MK = GEO.mark, LK = GEO.lockups.tagline, KL = GEO.colors;
  var MX = LK.mark[0], MY = LK.mark[1], WX = LK.word[0], WY = LK.word[1];
  var P2 = MK.pills[1], UX = P2.S[0] / P2.len, UY = P2.S[1] / P2.len, COT = UX / UY;
  function bez(p0, p1, p2, p3, n, uit) {
    for (var i = 1; i <= n; i++) {
      var t = i / n, u = 1 - t;
      uit.push([u * u * u * p0[0] + 3 * u * u * t * p1[0] + 3 * u * t * t * p2[0] + t * t * t * p3[0], u * u * u * p0[1] + 3 * u * u * t * p1[1] + 3 * u * t * t * p2[1] + t * t * t * p3[1]]);
    }
  }
  function baanOmtrek(p, a, b) {
    var sx = p.S[0], sy = p.S[1], bx = (b - 1) * sx, by = (b - 1) * sy, tx = a * sx, ty = a * sy;
    function B(i) { return [p.bot[i][0] + bx, p.bot[i][1] + by]; }
    function Tp(i) { return [p.top[i][0] + tx, p.top[i][1] + ty]; }
    var o = [B(0)];
    bez(B(0), B(1), B(2), B(3), 10, o); o.push(B(4)); bez(B(4), B(5), B(6), B(7), 10, o);
    o.push(Tp(0)); bez(Tp(0), Tp(1), Tp(2), Tp(3), 10, o); o.push(Tp(4)); bez(Tp(4), Tp(5), Tp(6), Tp(7), 10, o);
    return o;
  }
  function stipOmtrek(d, s) {
    var o = [];
    for (var i = 0; i < 48; i++) { var h = i / 48 * Math.PI * 2; o.push([d.cx + Math.cos(h) * d.r * s, d.cy + Math.sin(h) * d.r * s]); }
    return o;
  }
  function schaal(o, cx, cy, s) { return o.map(function (q) { return [cx + (q[0] - cx) * s, cy + (q[1] - cy) * s]; }); }
  var PADEN = null, LETTER = [0, 0, 1, 2, 3, 4];
  function paden() {
    if (PADEN || typeof Path2D === "undefined") return PADEN;
    PADEN = { woord: GEO.word.parts.map(function (p) { return new Path2D(p.d); }), tag: GEO.tag.parts.map(function (p) { return new Path2D(p.d); }) };
    return PADEN;
  }
  // het hele logo met "Specialist in kozijnfolie", met de uitrol: stippen landen, banen rollen uit, woord en regel erbij
  function logo(ctx, t, ox, oy, s, kMerk, kWoord, kTag) {
    var t0 = T.logo;
    ctx.save(); ctx.setTransform(s, 0, 0, s, ox, oy);
    function vorm(o) { ctx.beginPath(); ctx.moveTo(o[0][0] + MX, o[0][1] + MY); for (var i = 1; i < o.length; i++) ctx.lineTo(o[i][0] + MX, o[i][1] + MY); ctx.closePath(); ctx.fill(); }
    ctx.fillStyle = kMerk;
    var sL = seg(t, t0, 0.42, EL.pop), sR = seg(t, t0 + 0.4, 0.42, EL.pop);
    if (sL > 0.001) vorm(stipOmtrek(MK.dots[0], sL));
    if (sR > 0.001) vorm(stipOmtrek(MK.dots[1], sR));
    [[0, t0 + 0.08], [1, t0 + 0.18], [2, t0 + 0.28]].forEach(function (pk) {
      var p = MK.pills[pk[0]], b = seg(t, pk[1], 0.5, EL.roll), sc = seg(t, pk[1] - 0.08, 0.24, EL.out);
      if (sc <= 0.001) return;
      var o = baanOmtrek(p, 0, Math.max(0.0001, b)), mm = b / 2;
      vorm(schaal(o, p.tc[0] + mm * p.S[0], p.tc[1] + mm * p.S[1], sc));
    });
    var P = paden();
    if (P) {
      var wb = GEO.word.bbox, wl = wb[0] + WX, wr = wb[2] + WX, wt = wb[1] + WY, wbt = wb[3] + WY;
      var wp = seg(t, t0 + 0.5, 0.66, EL.inOut);
      if (wp > 0) {
        ctx.save();
        if (wp < 1) {
          var x = mix(wl - wbt * COT - 34, wr - wt * COT + 12, wp);
          ctx.beginPath(); ctx.moveTo(x - 3000 * COT, -3000); ctx.lineTo(x + 4000 * COT, 4000); ctx.lineTo(-20000, 4000); ctx.lineTo(-20000, -3000); ctx.closePath(); ctx.clip();
        }
        ctx.fillStyle = kWoord;
        P.woord.forEach(function (p, i) {
          var dx = -28 * (1 - seg(t, t0 + 0.58 + LETTER[i] * 0.05, 0.55, EL.out));
          ctx.save(); ctx.translate(WX + dx, WY); ctx.fill(p); ctx.restore();
        });
        ctx.restore();
      }
      var tau = t - (t0 + 0.8);
      if (tau > 0) {
        var tg = GEO.tag, mid = (tg.bbox[0] + tg.bbox[2]) / 2;
        ctx.fillStyle = kTag;
        P.tag.forEach(function (p, i) {
          var pp = seg(tau, i * 0.014, 0.6, EL.out), op = seg(tau, i * 0.014, 0.3);
          if (op <= 0) return;
          var cx = (tg.parts[i].bbox[0] + tg.parts[i].bbox[2]) / 2;
          ctx.save(); ctx.globalAlpha = op; ctx.translate(LK.tag[0] + (cx - mid) * 0.09 * (1 - pp), LK.tag[1]); ctx.fill(p); ctx.restore();
        });
      }
    }
    ctx.restore();
  }

  /* Een beeld ------------------------------------------------------------------------------ */
  function teken(ctx, t, W, H, opties) {
    opties = opties || {};
    t = klem(t, 0, DUUR);
    var mint = opties.variant === "mint", metLogo = opties.logo !== false, vert = H > W * 1.2;
    var Z = zones(t), z = Z.z;
    // de camera; met het logo schuift het kozijn opzij (liggend naar links, staand naar onder)
    var opzij = metLogo ? E.zacht(fase(t, 3.55, 1.0)) : 0;
    var cam = { tx: kromme(t, CAM, 1), ty: kromme(t, CAM, 2), zoom: kromme(t, CAM, 3), yaw: kromme(t, CAM, 4), pitch: kromme(t, CAM, 5), D: kromme(t, CAM, 6) };
    if (vert) { cam.cyF = mix(0.5, 0.66, opzij); cam.zoom *= mix(1, 0.9, opzij); }
    else { cam.cxF = mix(0.5, 0.3, opzij); cam.zoom *= mix(1, 0.8, opzij); }
    var c = Mo.camera(cam, W, H);
    var sc = { cam: c, z: z, schaduwMaat: opties.schaduwMaat || 2048, achtergrond: opties.achtergrond === false ? null : (mint ? "mint" : "licht") };
    sc.kap = [laag(z, 0, LEN), laag(z, 1, 0)];
    if (t > T.glans[0] && t < T.glans[1]) {
      var gp = fase(t, T.glans[0], T.glans[1] - T.glans[0]), gv = E.zacht(gp);
      sc.sweep = [mix(-90, LEN + 200, gv), mix(-90, STI + 200, gv), Math.sin(Math.PI * gp), 0];
    }
    sc.dingen = function (B, BF) {
      Mo.schilfers(B, z);
      if (z.nieuw[0]) Mo.omzetten(B, { nieuw: z.nieuw[0], nieuwG: Z.gN });
      rollen(B, BF, t, "dorpel", Mo.FVOOR.om, LEN, PH, Z.gO, Z.gN, T.oud, T.nieuw);
      rollen(B, BF, t, "stijl", Mo.FSVOOR.om, STI, SW, Z.gOS, Z.gNS, T.oudS, T.nieuwS);
    };
    var cv = Mo.render(W, H, sc);
    if (!cv) return false;
    ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0);
    if (opties.achtergrond === false) ctx.clearRect(0, 0, W, H);
    Mo.plak(ctx, cv, W, H);
    // vonkjes op de nieuwe folie
    [[150, 0.6, Mo.FVOOR, PH], [360, 0.35, Mo.FVOOR, PH], [80, 0.5, Mo.FSVOOR, SW]].forEach(function (v, k) {
      var f = fase(t, T.glans[0] + 0.4 + k * 0.2, 0.75), zz = Math.sin(Math.PI * f);
      if (zz <= 0.01) return;
      var p = c.q(v[2].w(v[0], v[3] * v[1], DN));
      Mo.vonk(ctx, p[0], p[1], zz * 1.6 * c.S * 0.5, zz);
    });
    if (metLogo && t > T.logo) {
      var kMerk = mint ? "#FFFFFF" : KL.mint, kWoord = mint ? "#FFFFFF" : KL.ink, kTag = mint ? "#FFFFFF" : KL.gray;
      var s, ox, oy;
      if (vert) { s = W * 0.72 / LK.w; ox = W * 0.5 - LK.w * s / 2; oy = H * 0.2 - LK.h * s / 2; }
      else { s = H * 0.335 / LK.h; ox = W * 0.73 - LK.w * s / 2; oy = H * 0.47 - LK.h * s / 2; }
      logo(ctx, t, ox, oy, s, kMerk, kWoord, kTag);
    }
    ctx.restore();
    return true;
  }
  function laag(z, m, u) {
    if (Mo.binnen(z.nieuw[m], u)) return [0, 0, DN];
    if (!Mo.binnen(z.pel[m], u)) return [Mo.maten.DL, Mo.maten.DO, 0];
    return [0, 0, 0];
  }
  // de twee rollen op één deel: voorop de oude folie die oprolt, erachter de nieuwe rol met de rakel
  function rollen(B, BF, t, deel, F, L, vmax, gO, gN, ivO, ivN) {
    var uO = L - gO, uN = L - gN;
    var aO = Math.min(fase(t, ivO[0] - 0.05, 0.25), 1 - fase(uO, L - 6, 20));
    if (aO > 0.003) {
      var r = Math.sqrt(30 + Math.max(0, uO + MARGE) * (Mo.maten.DO + Mo.maten.DL) * 1.1 / Math.PI);
      Mo.rolOud(Mo.kies(B, BF, aO), F, uO, r, null);
    }
    var aN = Math.min(fase(t, ivN[0] - 0.05, 0.25), 1 - fase(uN, L + 6, 22));
    if (aN > 0.003) {
      var g = Mo.kies(B, BF, aN), rn = Math.sqrt(121 + Math.max(0, L + MARGE - uN) * DN * 0.62 / Math.PI);
      Mo.rakel(g, F, Math.max(-20, uN - 22), vmax, Math.min(1, fase(t, ivN[0], 0.3)));
      Mo.rolNieuw(g, F, uN, rn, vmax, maal(F.U, Math.max(0, uN - L + 4) * 0.5));
    }
  }

  window.iwrapKozijnSting = { teken: teken, duur: DUUR };
})();
