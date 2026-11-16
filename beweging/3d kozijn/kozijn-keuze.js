/* ---------------------------------------------------------------------------
   Herstellen of wrappen? De hero van kozijnwrap.nl.

   Hetzelfde kozijn als op iwrap.nl (kozijn3d.js moet eerst geladen zijn), in vier korte
   verhalen, één per keuze. Ze eindigen allemaal in hetzelfde beeld van de hele hoek, zodat
   je ze makkelijk naast elkaar legt.
   - herstel: versleten crème folie (dof, gebarsten, loslatend). Voorop krult de oude folie
     eraf, vlak erachter rolt de nieuwe erop, in dezelfde kleur. Dan een glans.
   - kleur:   een goed crème kozijn. De rol antraciet folie gaat eroverheen: wrappen.
   - verf:    een wat moe crème kozijn. Een verfroller gaat eroverheen, en dan lopen de
     jaren: na twee, drie jaar bladdert het, want de folie eronder laat los en neemt de
     verf mee (zie het artikel over schilderen op kozijnwrap.nl).
   - vervang: het kozijn tocht en klemt. Het wordt eruit getild en er zakt een nieuw in.
     Dat daar stucwerk, schilderwerk en een vensterbank bij horen, zegt de tekst ernaast.

   teken(ctx, t, W, H, { optie: "herstel" | "kleur" | "verf" | "vervang" })
   status(optie, t): de korte regel linksboven in beeld ({ tekst, soort }).
   De speler (onderaan) zit op [data-kozijn-keuze] in de hero van kozijnwrap.nl.
   --------------------------------------------------------------------------- */
(function () {
  "use strict";
  var K3 = window.iwrapKozijn3D, Mo = K3 && K3.motor;
  if (!Mo) return;
  var m = Mo.maten, LEN = m.LEN, PH = m.PH, PD = m.PD, SW = m.SW, STI = m.STI, DN = m.DN, DL = m.DL, DO = m.DO, FLAP = m.FLAP, MARGE = m.MARGE, GZ1 = m.GZ1;
  var klem = Mo.klem, mix = Mo.mix, fase = Mo.fase, E = Mo.E, kromme = Mo.kromme, som = Mo.som, maal = Mo.maal;

  /* Kleuren (sRGB 0..1) en de folie per verhaal ---------------------------------------------- */
  var CREME = [0.928, 0.9, 0.83], ANTRACIET = [0.255, 0.272, 0.286], VERF = [0.43, 0.49, 0.53];
  var FOLIE = {
    herstel: Mo.FOLIE.cremeZon,
    // een goed crème kozijn (jong) met antraciet erover
    kleur: { jong: CREME, oud: CREME, nieuw: ANTRACIET, nerf: 0.055, glans: 0.7, vuil: 0.25 },
    // verf erop: zijdemat blauwgrijs, zonder houtnerf
    verf: { jong: CREME, oud: CREME, nieuw: VERF, nerf: 0.0, glans: 1.5, vuil: 0.25 },
    // daarna verweert de verf zelf
    verfOud: { jong: VERF, oud: VERF, nieuw: VERF, nerf: 0.0, glans: 1.5, vuil: 0.15, schil: 6 }
  };

  /* De vier verhalen ------------------------------------------------------------------------ */
  // Camera: [t, doel x, doel y, zoom, draaiing, kanteling, afstand, hoogte van het midden in beeld]
  var EIND = [252, 122, 0.95, 38, 11, 1150, 0.6];
  function cam(rijen, duur, eind) { return rijen.concat([[duur].concat(eind || EIND)]); }
  var V = {
    herstel: {
      duur: 6.4,
      T: { oud: [0.65, 2.35], nieuw: [0.95, 2.65], oudS: [2.3, 3.0], nieuwS: [2.6, 3.35], glans: [3.7, 4.9] },
      status: [[0, 0.95, "Versleten folie", "rood"], [0.95, 3.5, "Oude folie eraf, nieuwe erop", ""], [3.5, 99, "Hersteld, in dezelfde kleur", "mint"]]
    },
    kleur: {
      duur: 6.4,
      T: { nieuw: [0.8, 2.6], nieuwS: [2.55, 3.3], glans: [3.65, 4.85] },
      status: [[0, 0.8, "Goed kozijn, in crème", ""], [0.8, 3.45, "Folie in een nieuwe kleur eroverheen", ""], [3.45, 99, "Nieuwe kleur: antraciet", "donker"]]
    },
    verf: {
      duur: 7.4,
      T: { verf: [0.7, 2.4], verfS: [2.35, 3.05], wissel: 3.55, jaren: [3.75, 6.0] },
      status: [[0, 0.7, "Wat moe, dus schilderen?", ""], [0.7, 3.55, "Verf erop", ""], [3.55, 6.05, "jaren", ""], [6.05, 99, "Na 3 jaar: het bladdert", "rood"]]
    },
    vervang: {
      duur: 7.4,
      T: { tocht: [0.0, 1.9], uit: [1.55, 3.05], wissel: 3.2, in_: [3.35, 4.95], glans: [5.2, 6.3], stof: [1.6, 3.2] },
      status: [[0, 1.6, "Het tocht en het klemt", "rood"], [1.6, 3.35, "Het kozijn gaat eruit", ""], [3.35, 99, "Nieuw kozijn, met stuc- en schilderwerk", ""]]
    }
  };
  V.herstel.CAM = cam([[0, 346, 74, 1.52, 52, 13, 880, 0.56], [0.75, 338, 78, 1.46, 50, 14, 900, 0.56], [2.1, 280, 98, 1.16, 44, 13, 1020, 0.58], [3.5, 254, 118, 0.98, 39, 11, 1130, 0.6]], 6.4);
  V.kleur.CAM = cam([[0, 300, 92, 1.28, 46, 12, 980, 0.57], [0.8, 296, 94, 1.26, 45, 12, 990, 0.57], [2.3, 268, 104, 1.12, 42, 11, 1050, 0.59], [3.4, 254, 118, 0.98, 39, 11, 1130, 0.6]], 6.4);
  V.verf.CAM = cam([[0, 300, 92, 1.28, 46, 12, 980, 0.57], [0.7, 296, 94, 1.26, 45, 12, 990, 0.57], [2.3, 266, 104, 1.12, 42, 11, 1050, 0.59], [3.3, 250, 114, 1.02, 40, 11, 1100, 0.6], [5.6, 318, 84, 1.42, 49, 15, 920, 0.56]], 7.4, [330, 80, 1.5, 51, 15, 900, 0.56]);
  V.vervang.CAM = cam([[0, 262, 108, 1.1, 42, 11, 1060, 0.6], [1.5, 256, 114, 1.02, 40, 11, 1100, 0.6], [3.2, 250, 128, 0.92, 38, 10, 1160, 0.6], [5.0, 252, 122, 0.95, 38, 11, 1150, 0.6]], 7.4);
  var OPTIES = ["herstel", "kleur", "verf", "vervang"];

  /* Hulp ------------------------------------------------------------------------------------ */
  function grens(iv, L, t) { return mix(L + MARGE, -MARGE, E.gelijk(fase(t, iv[0], iv[1] - iv[0]))); }
  function vanaf(iv, g, t) { return t > iv[0] ? [g, 1e5] : null; }
  function M(g, kl, ruw, me, id) { return Mo.mat(kl, ruw, me, id || 1, g.a); }
  function laag(z, mm, u) {
    if (Mo.binnen(z.nieuw[mm], u)) return [0, 0, DN];
    if (!Mo.binnen(z.pel[mm], u)) return [DL, DO, 0];
    return [0, 0, 0];
  }
  function leeg() { return { pel: [null, null], krab: [null, null], nieuw: [null, null], doek: [null, null], nat: [null, null], nieuwBoven: null, doekG: [null, null], los: 0 }; }
  function camera(v, t, W, H) {
    var C = v.CAM;
    return Mo.camera({ tx: kromme(t, C, 1), ty: kromme(t, C, 2), zoom: kromme(t, C, 3), yaw: kromme(t, C, 4), pitch: kromme(t, C, 5), D: kromme(t, C, 6), cyF: kromme(t, C, 7) }, W, H);
  }
  function glans(sc, iv, t) {
    if (!iv || t <= iv[0] || t >= iv[1]) return;
    var p = fase(t, iv[0], iv[1] - iv[0]), gv = E.zacht(p);
    sc.sweep = [mix(-90, LEN + 200, gv), mix(-90, STI + 200, gv), Math.sin(Math.PI * p) * 0.8, 0];
  }
  function vonkjes(ctx, c, t, t0, off) {
    [[150, 0.6, Mo.FVOOR, PH], [360, 0.35, Mo.FVOOR, PH], [80, 0.5, Mo.FSVOOR, SW]].forEach(function (v, k) {
      var f = fase(t, t0 + k * 0.2, 0.75), zz = Math.sin(Math.PI * f);
      if (zz <= 0.01) return;
      var P = v[2].w(v[0], v[3] * v[1], DN * 2.5);
      if (off) P = som(P, off);
      var p = c.q(P);
      Mo.vonk(ctx, p[0], p[1], zz * 1.6 * c.S * 0.5, zz);
    });
  }

  /* Gereedschap ------------------------------------------------------------------------------ */
  // De rol nieuwe folie met de rakel ervoor (zoals in "van beschadigd naar mooi"), en eventueel
  // voorop de rol met oude folie die eraf krult.
  function rollen(B, BF, t, F, L, vmax, gO, gN, ivO, ivN) {
    if (ivO) {
      var uO = L - gO, aO = Math.min(fase(t, ivO[0] - 0.05, 0.25), 1 - fase(uO, L - 6, 20));
      if (aO > 0.003) Mo.rolOud(Mo.kies(B, BF, aO), F, uO, Math.sqrt(30 + Math.max(0, uO + MARGE) * (DO + DL) * 1.1 / Math.PI), null);
    }
    var uN = L - gN, aN = Math.min(fase(t, ivN[0] - 0.05, 0.25), 1 - fase(uN, L + 6, 22));
    if (aN > 0.003) {
      var g = Mo.kies(B, BF, aN), rn = Math.sqrt(121 + Math.max(0, L + MARGE - uN) * DN * 0.62 / Math.PI);
      Mo.rakel(g, F, Math.max(-20, uN - 22), vmax, Math.min(1, fase(t, ivN[0], 0.3)));
      Mo.rolNieuw(g, F, uN, rn, vmax, maal(F.U, Math.max(0, uN - L + 4) * 0.5));
    }
  }
  // Een verfroller: een rol met blauwgrijze verf, een beugel van staaldraad en een zwart handvat
  // dat schuin naar achteren wijst (waar de schilder staat).
  function verfroller(B, BF, t, F, L, vmax, g, iv) {
    var u = L - g, a = Math.min(fase(t, iv[0] - 0.05, 0.25), 1 - fase(u, L + 4, 22));
    if (a <= 0.003) return;
    var k = Mo.kies(B, BF, a), r = 15, lift = (1 - Math.min(1, fase(t, iv[0], 0.3))) * 40;
    var u0 = Math.min(u, L + 10), h = DN + 2.4 + r + lift;
    var A = F.w(u0, -6, h), Bp = F.w(u0, vmax + 6, h);
    Mo.cil(k.b, A, Bp, r, M(k, VERF, 0.96, 0, 1), { hoek: u0 / r, bev: 3.2, seg: 30, kapM: M(k, "#c9ccce", 0.5, 0, 1) });
    // de beugel: vanaf de onderkant van de rol naar buiten, omhoog en naar achteren
    var achter = maal(F.U, -1), uit = F.n, onder = maal(F.V, -1);
    var p0 = F.w(u0, -6, h), p1 = som(p0, maal(onder, 9)), p2 = som(p1, som(maal(uit, 26), maal(achter, 8)));
    var p3 = som(p2, som(maal(uit, 34), maal(achter, 40)));
    Mo.buis(k.b, [p0, p1, p2, p3], 2.1, M(k, "#b7bcc0", 0.35, 0.9, 1), { seg: 10 });
    var richting = Mo.een(som(maal(uit, 0.62), maal(achter, 0.78)));
    Mo.cil(k.b, p3, som(p3, maal(richting, 92)), 8.5, M(k, "#232629", 0.45, 0, 1), { bev: 3, seg: 18 });
  }

  /* 2D bovenop: tocht, stof en de jaren ------------------------------------------------------- */
  // Tocht: dunne lichte strepen die van buiten naar de naad tussen glas en kozijn trekken
  function tocht(ctx, c, t, iv) {
    var a = Math.min(fase(t, iv[0] + 0.1, 0.4), 1 - fase(t, iv[1] - 0.45, 0.45));
    if (a <= 0.01) return;
    ctx.save(); ctx.lineCap = "round"; ctx.lineJoin = "round";
    for (var i = 0; i < 7; i++) {
      var p = (t * 0.62 + i / 7) % 1, stijl = i % 3 === 2, x = mix(SW + 60, LEN - 60, (i * 0.41 + 0.1) % 1), y0 = PH + 50 + (i % 4) * 38;
      var pts = [];
      for (var k = 0; k <= 18; k++) {
        var f = k / 18, wig = Math.sin(f * 5.5 + t * 3.2 + i * 1.7) * 14 * (1 - f) * (1 - f);
        // van ver voor het kozijn naar de naad tussen glas en kozijn (bij de rubber)
        var P = stijl ? [SW + 4 + (1 - f) * 110, y0 + wig, GZ1 + 3 + (1 - f) * 190] : [x + wig, PH + 4 + (1 - f) * 95, GZ1 + 3 + (1 - f) * 190];
        pts.push(c.q(P));
      }
      var kop = E.uit(klem(p * 1.3, 0, 1)), staart = klem(p * 1.3 - 0.42, 0, 1), alfa = a * Math.sin(Math.PI * klem(p, 0, 1));
      var i0 = Math.floor(staart * 18), i1 = Math.ceil(kop * 18);
      if (i1 - i0 < 2 || alfa < 0.02) continue;
      function lijn(kl, w) {
        ctx.strokeStyle = kl; ctx.lineWidth = w; ctx.beginPath(); ctx.moveTo(pts[i0][0], pts[i0][1]);
        for (var q = i0 + 1; q <= i1; q++) ctx.lineTo(pts[q][0], pts[q][1]);
        ctx.stroke();
      }
      lijn("rgba(255,255,255," + (0.55 * alfa).toFixed(3) + ")", Math.max(3, c.S * 4.2));
      lijn("rgba(86,150,196," + (0.9 * alfa).toFixed(3) + ")", Math.max(1.4, c.S * 1.7));
    }
    ctx.restore();
  }
  // Stof waar het kozijn uit de muur komt: zachte wolkjes die opstijgen en uitwaaieren
  function stof(ctx, c, t, iv) {
    if (t <= iv[0] || t >= iv[1]) return;
    var r = Mo.rng(41);
    ctx.save();
    for (var i = 0; i < 26; i++) {
      var t0 = iv[0] + r() * 0.5, p = fase(t, t0, 1.1 + r() * 0.5);
      if (p <= 0 || p >= 1) continue;
      var x = r() * LEN, z = r() * PD, opDorpel = r() < 0.7;
      var P = opDorpel ? [x, -40 + p * (30 + r() * 60), z + (r() - 0.3) * 80 * p] : [r() * SW, PH + r() * STI, PD + 10 + p * 60];
      var q = c.q(P), rr = c.S * (12 + 34 * E.uit(p)) * (0.6 + 0.6 * r()), al = 0.5 * Math.sin(Math.PI * p) * (opDorpel ? 1 : 0.6);
      var gr = ctx.createRadialGradient(q[0], q[1], 0, q[0], q[1], rr);
      gr.addColorStop(0, "rgba(200,192,178," + al.toFixed(3) + ")"); gr.addColorStop(1, "rgba(200,192,178,0)");
      ctx.fillStyle = gr; ctx.beginPath(); ctx.arc(q[0], q[1], rr, 0, Math.PI * 2); ctx.fill();
    }
    ctx.restore();
  }
  function jarenOp(t) { var T = V.verf.T; return 3 * E.zacht(fase(t, T.jaren[0], T.jaren[1] - T.jaren[0])); }

  /* Een beeld ------------------------------------------------------------------------------ */
  function teken(ctx, t, W, H, opties) {
    opties = opties || {};
    var naam = V[opties.optie] ? opties.optie : "herstel", v = V[naam], T = v.T;
    t = klem(t, 0, v.duur);
    var c = camera(v, t, W, H), L = Mo.licht(W, H, 0.3);
    var sc = {
      cam: c, schaduwMaat: opties.schaduwMaat || 2048, achtergrond: "licht",
      lk: L.lk, key: L.key, hemel: L.hemel, vloer: L.vloer, lucht: L.lucht, schaduwZacht: 5.0, belichting: 0.92
    };
    var z = leeg(), na = [];
    if (naam === "herstel") {
      var gO = grens(T.oud, LEN, t), gN = grens(T.nieuw, LEN, t), gOS = grens(T.oudS, STI, t), gNS = grens(T.nieuwS, STI, t);
      var oud = vanaf(T.oud, gO, t), oudS = vanaf(T.oudS, gOS, t), nw = vanaf(T.nieuw, gN, t), nwS = vanaf(T.nieuwS, gNS, t);
      z.pel = [oud, oudS]; z.krab = [oud, oudS]; z.doek = [oud, oudS]; z.nieuw = [nw, nwS]; z.nieuwBoven = nw ? [gN + FLAP, 1e5] : null;
      sc.folie = FOLIE.herstel; sc.leeftijd = 1;
      sc.dingen = function (B, BF) {
        Mo.schilfers(B, z);
        if (nw) Mo.omzetten(B, { nieuw: nw, nieuwG: gN });
        rollen(B, BF, t, Mo.FVOOR.om, LEN, PH, gO, gN, T.oud, T.nieuw);
        rollen(B, BF, t, Mo.FSVOOR.om, STI, SW, gOS, gNS, T.oudS, T.nieuwS);
      };
      glans(sc, T.glans, t);
      na.push(function (cx) { vonkjes(cx, c, t, T.glans[0] + 0.35); });
    } else if (naam === "kleur") {
      var kN = grens(T.nieuw, LEN, t), kNS = grens(T.nieuwS, STI, t), kw = vanaf(T.nieuw, kN, t), kwS = vanaf(T.nieuwS, kNS, t);
      z.nieuw = [kw, kwS]; z.nieuwBoven = kw ? [kN + FLAP, 1e5] : null;
      sc.folie = FOLIE.kleur; sc.leeftijd = 0; sc.over = true;
      sc.dingen = function (B, BF) {
        if (kw) Mo.omzetten(B, { nieuw: kw, nieuwG: kN });
        rollen(B, BF, t, Mo.FVOOR.om, LEN, PH, 0, kN, null, T.nieuw);
        rollen(B, BF, t, Mo.FSVOOR.om, STI, SW, 0, kNS, null, T.nieuwS);
      };
      glans(sc, T.glans, t);
      na.push(function (cx) { vonkjes(cx, c, t, T.glans[0] + 0.35); });
    } else if (naam === "verf") {
      if (t < T.wissel) {
        var vG = grens(T.verf, LEN, t), vGS = grens(T.verfS, STI, t), vw = vanaf(T.verf, vG, t), vwS = vanaf(T.verfS, vGS, t);
        z.nieuw = [vw, vwS]; z.nieuwBoven = vw;
        sc.folie = FOLIE.verf; sc.leeftijd = 0.6; sc.over = true;
        sc.dingen = function (B, BF) {
          verfroller(B, BF, t, Mo.FVOOR.om, LEN, PH, vG, T.verf);
          verfroller(B, BF, t, Mo.FSVOOR.om, STI, SW, vGS, T.verfS);
        };
      } else {
        // de verf is nu de bovenste laag, en die verweert: jaren tellen, de folie eronder laat los
        var a = 0.92 * jarenOp(t) / 3;
        sc.folie = FOLIE.verfOud; sc.leeftijd = a;
        sc.dingen = function (B) { Mo.schilfers(B, z, fase(a, 0.45, 0.4)); };
      }
    } else {
      // vervangen: het oude kozijn gaat omhoog en weg, het nieuwe zakt erin en veert even na
      var nieuwK = t >= T.wissel, y;
      if (!nieuwK) y = 820 * E.in_(fase(t, T.uit[0], T.uit[1] - T.uit[0]));
      else { var p = fase(t, T.in_[0], T.in_[1] - T.in_[0]); y = 820 * (1 - veer(p)); }
      sc.verschuif = [nieuwK ? 0 : 40 * fase(t, T.uit[0], T.uit[1] - T.uit[0]), y, 0];
      sc.folie = FOLIE.herstel; sc.leeftijd = nieuwK ? 0 : 0.72;
      sc.dingen = function (B) { if (!nieuwK) Mo.schilfers(B, z, 0.35); };
      if (nieuwK) glans(sc, T.glans, t);
      na.push(function (cx) {
        if (!nieuwK) { tocht(cx, c, t, T.tocht); stof(cx, c, t, T.stof); }
        else vonkjes(cx, c, t, T.glans[0] + 0.35, sc.verschuif);
      });
    }
    sc.z = z;
    sc.kap = [laag(z, 0, LEN), laag(z, 1, 0)];
    var cv = Mo.render(W, H, sc);
    if (!cv) return false;
    ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0);
    Mo.plak(ctx, cv, W, H);
    na.forEach(function (f) { f(ctx); });
    ctx.restore();
    return true;
  }
  // even doorveren bij het neerzetten
  function veer(p) { var c = 1.25; return p >= 1 ? 1 : 1 + (c + 1) * Math.pow(p - 1, 3) + c * Math.pow(p - 1, 2); }

  function status(naam, t) {
    var v = V[naam] || V.herstel, s = v.status, r = s[0];
    for (var i = 0; i < s.length; i++) if (t >= s[i][0] && t < s[i][1]) r = s[i];
    if (r[2] === "jaren") {
      var j = Math.max(1, Math.ceil(jarenOp(t) - 0.02));
      return { tekst: j === 1 ? "1 jaar later" : j + " jaar later", soort: j >= 3 ? "rood" : "" };
    }
    return { tekst: r[2], soort: r[3] };
  }

  /* De speler in de hero ---------------------------------------------------------------------
     <div data-kozijn-keuze> met daarin:
       een <canvas>, een poster (img.hk-poster, het beeld voordat het script tekent),
       een regel .hk-status, een knop .hk-pauze, en per keuze een knop [data-optie] met daarin
       een balkje .hk-balk > i (hoe ver het verhaal is) en direct erachter zijn paneel (.hk-paneel).
     Speelt de vier verhalen achter elkaar zodra de hero in beeld is, en begint dan opnieuw. Een
     klik op een keuze speelt die keuze en blijft daar staan. Pauzeert buiten beeld. Wie
     "minder beweging" aan heeft, ziet per keuze het eindbeeld, zonder beweging. Zonder WebGL2
     wisselt de poster per keuze (data-poster op de knop). */
  function speler(el) {
    if (el.iwrapKeuze) return;
    el.iwrapKeuze = true;
    var doek = el.querySelector("canvas"), poster = el.querySelector(".hk-poster");
    var statusEl = el.querySelector(".hk-status"), pauzeKnop = el.querySelector(".hk-pauze");
    var knoppen = Array.prototype.slice.call(el.querySelectorAll("[data-optie]"));
    var rustig = !!(window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches);
    var kan = !!(doek && doek.getContext && Mo.start(1536));
    var ctx = kan ? doek.getContext("2d") : null;
    if (!kan) el.classList.add("hk-geen-webgl");
    var nr = 0, t = 0, auto = !rustig, speelt = false, gepauzeerd = false, inBeeld = false, raf = 0, vorig = 0;
    var W = 0, H = 0, duurGem = 8, traag = false, overslaan = false, getekend = 0, rust = 0, statusNu = "";
    var RUST = 1.4;   // zo lang blijft het eindbeeld staan voordat de volgende keuze begint

    function naam() { return OPTIES[nr]; }
    function maat() {
      if (!kan) return;
      var r = doek.getBoundingClientRect();
      if (!r.width || !r.height) return;
      var dpr = Math.min(1.5, window.devicePixelRatio || 1), w = Math.round(r.width * dpr), h = Math.round(r.height * dpr);
      if (w !== W || h !== H) { W = doek.width = w; H = doek.height = h; }
      beeld();
    }
    function beeld() {
      if (kan && W) {
        var a = window.performance ? performance.now() : 0;
        if (teken(ctx, t, W, H, { optie: naam(), schaduwMaat: 1536 }) && !getekend++) el.classList.add("hk-getekend");
        if (a) duurGem = duurGem * 0.92 + (performance.now() - a) * 0.08;
      }
      stand();
    }
    function stand() {
      var s = status(naam(), t), sleutel = s.tekst + "|" + s.soort;
      if (statusEl && sleutel !== statusNu) {
        statusNu = sleutel;
        statusEl.textContent = s.tekst;
        statusEl.className = "hk-status" + (s.soort ? " hk-" + s.soort : "");
      }
      var duur = V[naam()].duur;
      knoppen.forEach(function (k, i) {
        var nu = i === nr;
        k.setAttribute("aria-expanded", nu ? "true" : "false");
        k.classList.toggle("is-nu", nu);
        var balk = k.querySelector(".hk-balk i");
        if (balk) balk.style.transform = "scaleX(" + (nu ? (rustig ? 1 : klem(t / duur, 0, 1)) : 0).toFixed(4) + ")";
      });
      if (pauzeKnop) {
        var aan = speelt && !gepauzeerd;
        pauzeKnop.setAttribute("aria-label", aan ? "Animatie pauzeren" : "Animatie afspelen");
        pauzeKnop.setAttribute("data-stand", aan ? "pauze" : "speel");
        pauzeKnop.hidden = rustig || !kan;
      }
    }
    function lus(nu) {
      raf = requestAnimationFrame(lus);
      if (traag && (overslaan = !overslaan)) return;             // gelijkmatig 30 beelden per seconde
      var dt = (nu - vorig) / 1000; vorig = nu;
      if (dt > 0.25 || dt < 0) dt = 1 / 60;
      var duur = V[naam()].duur;
      if (t < duur) { t = Math.min(duur, t + dt); beeld(); }
      else if (auto) {
        rust += dt;
        if (rust >= RUST) { rust = 0; kies((nr + 1) % OPTIES.length, true); }
      } else { stop(); stand(); return; }
      if (duurGem > 11) traag = true;
    }
    function start() {
      if (rustig || !kan || gepauzeerd || speelt || !inBeeld) return;
      speelt = true; vorig = performance.now(); cancelAnimationFrame(raf); raf = requestAnimationFrame(lus); stand();
    }
    function stop() { speelt = false; cancelAnimationFrame(raf); }
    function kies(i, vanzelf) {
      nr = i; rust = 0;
      if (!kan) {
        // zonder WebGL: het eindbeeld van deze keuze als foto (de webp-bron van de poster gaat eruit, anders wint die)
        var src = knoppen[i] && knoppen[i].getAttribute("data-poster");
        if (poster && src) {
          Array.prototype.forEach.call(el.querySelectorAll(".hk-beeld source"), function (b) { b.parentNode.removeChild(b); });
          poster.removeAttribute("srcset"); poster.src = src;
        }
        t = V[naam()].duur; stand(); return;
      }
      t = rustig ? V[naam()].duur : 0;
      // een korte overgang: het beeld knippert niet, het vervaagt even
      if (doek && !rustig) { doek.classList.remove("hk-in"); void doek.offsetWidth; doek.classList.add("hk-in"); }
      if (!vanzelf) { auto = false; gepauzeerd = false; }
      beeld();
      start();
    }
    knoppen.forEach(function (k, i) {
      k.addEventListener("click", function () { kies(i, false); });
    });
    if (pauzeKnop) pauzeKnop.addEventListener("click", function () {
      if (speelt && !gepauzeerd) { gepauzeerd = true; stop(); }
      else { gepauzeerd = false; if (t >= V[naam()].duur && !auto) t = 0; start(); }
      stand();
    });
    document.addEventListener("visibilitychange", function () { if (document.hidden) stop(); else start(); });

    if (kan) {
      if (window.ResizeObserver) new ResizeObserver(maat).observe(doek); else window.addEventListener("resize", maat);
    }
    if (rustig) t = V[naam()].duur;
    maat(); stand();
    if (!kan || rustig) return;
    if (window.IntersectionObserver) {
      new IntersectionObserver(function (es) {
        es.forEach(function (e) {
          inBeeld = e.isIntersecting && e.intersectionRatio >= 0.3;
          if (inBeeld) start(); else { stop(); stand(); }
        });
      }, { threshold: [0, 0.3, 0.6] }).observe(el);
    } else { inBeeld = true; start(); }
  }
  function begin() { Array.prototype.forEach.call(document.querySelectorAll("[data-kozijn-keuze]"), speler); }
  if (typeof document !== "undefined") {
    if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", begin); else begin();
  }

  window.iwrapKozijnKeuze = {
    teken: teken, status: status, opties: OPTIES,
    duur: 7.4, duren: { herstel: V.herstel.duur, kleur: V.kleur.duur, verf: V.verf.duur, vervang: V.vervang.duur }
  };
})();
