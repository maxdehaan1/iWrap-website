/* ---------------------------------------------------------------------------
   De klusfilm, het werk van dichtbij: hetzelfde 3D-kozijn als op de homepage.

   In de klusfilm veegt het beeld van de straat naar dit close-up, en na 13 seconden
   weer terug. In die 13 seconden de drie vaste stappen, op het tempo van de film:
   1. Toplaag eraf (1,5 tot 4,85 s): de föhn en de rol oude folie, dorpel en stijl.
   2. Reinigen en vetvrij (4,85 tot 8,15 s): de krabber over de stijl en de dorpel,
      dan de doek: schoon en vetvrij.
   3. Nieuwe folie erop (8,15 tot 11,1 s): de rol en de rakel, de rand wordt omgezet.
   Daarna een glans over de nieuwe folie. De stappen, de ondertitels en de labels
   VOOR en NA tekent de film zelf (film2.src.js); dit script tekent alleen het kozijn.

   teken(ctx, t, breedte, hoogte) met t = de tijd sinds het close-up begon.
   kan() zegt of WebGL werkt; zo niet, dan laat de film het platte close-up zien.
   Gebruikt kozijn3d.js (die moet eerst geladen zijn).
   --------------------------------------------------------------------------- */
(function () {
  "use strict";
  var K3 = window.iwrapKozijn3D, Mo = K3 && K3.motor;
  if (!Mo) return;
  var m = Mo.maten, LEN = m.LEN, PH = m.PH, SW = m.SW, STI = m.STI, DL = m.DL, DO = m.DO, DN = m.DN, FLAP = m.FLAP, MARGE = m.MARGE;
  var klem = Mo.klem, mix = Mo.mix, fase = Mo.fase, E = Mo.E, kromme = Mo.kromme, maal = Mo.maal;

  var DUUR = 13.85;
  var T = {
    pel: [1.6, 3.4], pelS: [3.35, 4.55],
    krabS: [4.95, 5.75], krab: [5.7, 6.85],
    doek: [6.9, 7.72], doekS: [7.66, 8.15], vetvrij: [8.05, 8.6],
    nieuw: [8.25, 9.95], nieuwS: [9.9, 10.95],
    glans: [11.0, 12.4]
  };
  var BEW = { pel: ["dorpel", -1], pelS: ["stijl", -1], krabS: ["stijl", 1], krab: ["dorpel", 1], doek: ["dorpel", -1], doekS: ["stijl", -1], nieuw: ["dorpel", -1], nieuwS: ["stijl", -1] };
  // camera: [t, doel x, doel y, zoom, draaiing, kanteling]; heel rustig dichterbij, zoals het platte close-up deed
  var CAM = [[0, 252, 110, 1.04, 38, 22], [6.5, 246, 110, 1.09, 35, 21], [DUUR, 240, 112, 1.14, 32, 21]];

  function lang(deel) { return deel === "dorpel" ? LEN : STI; }
  function grens(n, t) { var b = BEW[n], iv = T[n], p = E.gelijk(fase(t, iv[0], iv[1] - iv[0])); return b[1] > 0 ? mix(-MARGE, lang(b[0]) + MARGE, p) : mix(lang(b[0]) + MARGE, -MARGE, p); }
  function klaar(n, t) { if (t <= T[n][0]) return null; var g = grens(n, t); return BEW[n][1] > 0 ? [-1e5, g] : [g, 1e5]; }
  function werkU(n, g) { var b = BEW[n]; return b[1] > 0 ? g : lang(b[0]) - g; }

  function zones(t) {
    var gN = grens("nieuw", t), nw = klaar("nieuw", t);
    return {
      gN: gN,
      z: {
        pel: [klaar("pel", t), klaar("pelS", t)], krab: [klaar("krab", t), klaar("krabS", t)],
        doek: [klaar("doek", t), klaar("doekS", t)], nat: [null, null],
        nieuw: [nw, klaar("nieuwS", t)], nieuwBoven: nw ? [gN + FLAP, 1e5] : null,
        doekG: [t > T.doek[0] ? [grens("doek", t), -1] : null, t > T.doekS[0] ? [grens("doekS", t), -1] : null], los: 0
      }
    };
  }

  function gereedschap(B, BF, sc, t, boven) {
    function bezig(n, voor, na) { var iv = T[n]; return t > iv[0] - (voor || 0.05) && t < iv[1] + (na || 0.3); }
    function info(n, F0, vmax) { var L = lang(BEW[n][0]); return { F: BEW[n][1] > 0 ? F0 : F0.om, L: L, u: werkU(n, grens(n, t)), vmax: vmax, iv: T[n] }; }
    sc.heat = [0, 0, 0, 0];
    /* 1. warmte en de rol oude folie */
    [["pel", Mo.FVOOR, PH], ["pelS", Mo.FSVOOR, SW]].forEach(function (x) {
      if (!bezig(x[0])) return;
      var b = info(x[0], x[1], x[2]), u = b.u;
      var r = Math.sqrt(30 + Math.max(0, u + MARGE) * (DO + DL) * 1.1 / Math.PI);
      var aIn = fase(t, b.iv[0], 0.3), val = x[0] === "pel" ? Math.max(0, u - b.L + 4) : 0;
      var aRol = Math.min(aIn, 1 - fase(u, b.L - 6, 20));
      if (aRol > 0.003) Mo.rolOud(Mo.kies(B, BF, aRol), b.F, u, r, val > 0 ? [0, -val * val * 0.08, 0] : null);
      var aF = Math.min(aIn, 1 - fase(u, b.L - 30, 30));
      if (aF > 0.003) {
        var f = Mo.fohn(Mo.kies(B, BF, aF), b.F, Math.min(u + r * 2 + 20, b.L - 6), x[2] * 0.55, t);
        sc.heat = [f.doel[0], f.doel[1], f.doel[2], aF];
        boven.push(function (ctx, c) { Mo.luchtLijnen(ctx, c, f, t, aF); });
      }
    });
    /* 2. de krabber duwt de lijm voor zich uit */
    [["krabS", Mo.FSVOOR, SW], ["krab", Mo.FVOOR, PH]].forEach(function (x) {
      if (!bezig(x[0])) return;
      var n = x[0], b = info(n, x[1], x[2]), u = b.u;
      var a = Math.min(fase(t, b.iv[0], 0.25), 1 - fase(t, b.iv[1] - 0.1, 0.3));
      Mo.lijmrug(B, b.F, u, x[2], t, Math.min(fase(u, 0, 22), fase(b.L - u, 0, 22)) * a);
      Mo.kruimels(B, b.F, x[2], t, b.L, b.iv, function (tk) { return werkU(n, grens(n, tk)); });
      if (a > 0.003) Mo.krabber(Mo.kies(B, BF, a), b.F, u, x[2], a);
    });
    /* 2. schoonmaken en ontvetten met een doek: de dorpel naar de hoek, dan de stijl omhoog */
    [["doek", Mo.FVOOR, PH], ["doekS", Mo.FSVOOR, SW]].forEach(function (x) {
      if (!bezig(x[0], 0.1, 0.25)) return;
      var bd = info(x[0], x[1], x[2]), ad = Math.min(fase(t, bd.iv[0], 0.2), 1 - fase(t, bd.iv[1] - 0.05, 0.25));
      if (ad > 0.003) Mo.doek(Mo.kies(B, BF, ad), bd.F, klem(bd.u, 14, bd.L - 14), x[2] * 0.5 + Math.sin(t * 8.5) * x[2] * 0.08, x[2], t);
    });
    /* 3. de rol nieuwe folie en de rakel */
    [["nieuw", Mo.FVOOR, PH], ["nieuwS", Mo.FSVOOR, SW]].forEach(function (x) {
      if (!bezig(x[0])) return;
      var b = info(x[0], x[1], x[2]), u = b.u;
      var r = Math.sqrt(121 + Math.max(0, b.L + MARGE - u) * DN * 0.62 / Math.PI);
      var a = Math.min(fase(t, b.iv[0], 0.3), 1 - fase(u, b.L + 6, 22));
      if (a <= 0.003) return;
      var g = Mo.kies(B, BF, a);
      Mo.rakel(g, b.F, Math.max(-20, u - 22), x[2], Math.min(1, fase(t, b.iv[0], 0.3)));
      Mo.rolNieuw(g, b.F, u, r, x[2], maal(b.F.U, Math.max(0, u - b.L + 4) * 0.5));
    });
  }

  function teken(ctx, t, W, H, opties) {
    opties = opties || {};
    t = klem(t, 0, DUUR);
    var Z = zones(t), z = Z.z, boven = [];
    var c = Mo.camera({ tx: kromme(t, CAM, 1), ty: kromme(t, CAM, 2), zoom: kromme(t, CAM, 3), yaw: kromme(t, CAM, 4), pitch: kromme(t, CAM, 5), D: 1150, cyF: 0.56 }, W, H);
    var sc = { cam: c, z: z, schaduwMaat: opties.schaduwMaat || 2048, achtergrond: "licht", kap: [Mo.kapLaag(z, 0, LEN), Mo.kapLaag(z, 1, 0)] };
    // buiten, zoals de hero en de werkwijzefilm: blauwe lucht, de zon linksboven, crème die verweert maar niet verkleurt
    if (Mo.licht) {
      var L = Mo.licht(W, H, 0.3);
      sc.lk = L.lk; sc.key = L.key; sc.hemel = L.hemel; sc.vloer = L.vloer; sc.lucht = L.lucht;
      sc.folie = Mo.FOLIE.cremeZon; sc.schaduwZacht = 5.0; sc.belichting = 0.92;
    }
    if (t > T.vetvrij[0] && t < T.vetvrij[1]) {
      var vp = fase(t, T.vetvrij[0], T.vetvrij[1] - T.vetvrij[0]), vv = E.zacht(vp);
      sc.sweep = [mix(-80, LEN + 160, vv), mix(-80, STI + 160, vv), Math.sin(Math.PI * vp) * 1.1, 1];
    }
    if (t > T.glans[0] && t < T.glans[1]) {
      var gp = fase(t, T.glans[0], T.glans[1] - T.glans[0]), gv = E.zacht(gp);
      sc.sweep = [mix(-90, LEN + 200, gv), mix(-90, STI + 200, gv), Math.sin(Math.PI * gp), 0];
    }
    sc.dingen = function (B, BF) {
      Mo.schilfers(B, z);
      if (z.nieuw[0]) Mo.omzetten(B, { nieuw: z.nieuw[0], nieuwG: Z.gN });
      gereedschap(B, BF, sc, t, boven);
    };
    var cv = Mo.render(W, H, sc);
    if (!cv) return false;
    ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0);
    Mo.plak(ctx, cv, W, H);
    boven.forEach(function (f) { f(ctx, c); });
    // klaar: vonkjes op de nieuwe folie
    [[150, 0.6, Mo.FVOOR, PH], [360, 0.35, Mo.FVOOR, PH], [80, 0.5, Mo.FSVOOR, SW]].forEach(function (v, k) {
      var f = fase(t, T.glans[0] + 0.35 + k * 0.2, 0.8), zz = Math.sin(Math.PI * f);
      if (zz <= 0.01) return;
      var p = c.q(v[2].w(v[0], v[3] * v[1], DN));
      Mo.vonk(ctx, p[0], p[1], zz * 1.7 * c.S * 0.5, zz);
    });
    ctx.restore();
    return true;
  }

  window.iwrapKozijnKlus = { teken: teken, duur: DUUR, kan: function () { return !!Mo.start(); } };
})();
