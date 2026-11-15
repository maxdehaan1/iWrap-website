
  /* ======================= Het verhaal: werkvlakken, gereedschap, scène ======================= */
  // Een vlak van het kozijn als werkvlak: w(u, v, d) = o + U*u + V*v + n*d (d = hoogte boven het vlak)
  function Vlak(o, U, V, n) { this.o = o; this.U = U; this.V = V; this.n = n; }
  Vlak.prototype.w = function (u, v, d) {
    var o = this.o, U = this.U, V = this.V, n = this.n; d = d || 0;
    return [o[0] + U[0] * u + V[0] * v + n[0] * d, o[1] + U[1] * u + V[1] * v + n[1] * d, o[2] + U[2] * u + V[2] * v + n[2] * d];
  };
  var FVOOR = new Vlak([0, 0, PD], [1, 0, 0], [0, 1, 0], [0, 0, 1]);              // dorpel, voorkant: u = x, v = y
  var FBOVEN = new Vlak([0, PH, PD], [1, 0, 0], [0, 0, -1], [0, 1, 0]);           // dorpel, dagkant: v = vanaf de voorkant naar binnen
  var FSVOOR = new Vlak([0, PH + STI, PD], [0, -1, 0], [1, 0, 0], [0, 0, 1]);     // stijl, voorkant: u = vanaf de bovenkant naar beneden, v = x
  FVOOR.deel = "dorpel"; FSVOOR.deel = "stijl";
  function omgekeerd(F, L) { var G = new Vlak(F.w(L, 0, 0), maal(F.U, -1), F.V, F.n); G.deel = F.deel; return G; }
  FVOOR.om = omgekeerd(FVOOR, LEN); FSVOOR.om = omgekeerd(FSVOOR, STI);
  function werkvlak(F, naam) { return BEW[naam][1] > 0 ? F : F.om; }

  // De dwarsdoorsnede van voorkant, afgeronde rand en dagkant: daarlangs liggen de rollen en de tong.
  function maakPad(deel) {
    var pts = [], k, d = deel === "dorpel", H = d ? PH : SW;
    function o(a, b) { return d ? [0, a, b] : [a, 0, b]; }
    function n(a, b) { return d ? [0, a, b] : [a, 0, b]; }
    for (k = 0; k <= 10; k++) { var v = mix(-1.5, H - RR, k / 10); pts.push({ o: o(v, 0), n: n(0, 1), v: v }); }
    for (k = 1; k <= 7; k++) { var th = k / 7 * Math.PI / 2, sn = Math.sin(th), cs = Math.cos(th); pts.push({ o: o(H - RR + RR * sn, -RR + RR * cs), n: n(sn, cs), v: H - RR + th * RR }); }
    for (k = 1; k <= 6; k++) { var zo = mix(RR, RV - 1.2, k / 6); pts.push({ o: o(H, -zo), n: n(1, 0), v: H - RR + Math.PI / 2 * RR + zo - RR }); }
    return pts;
  }
  var PAD = { dorpel: maakPad("dorpel"), stijl: maakPad("stijl") };
  function padPunt(F, u, q, h) { return som(som(F.w(u, 0, 0), q.o), maal(q.n, h)); }

  // Buis langs middelpunten C (straal: getal of lijst), met platte kopse kanten
  function buis(Bw, C, rad, m, o) {
    o = o || {};
    var n = C.length, seg = o.seg || 26, R = [], i, j, hk = o.hoek || 0, r0 = Array.isArray(rad) ? rad[0] : rad;
    var T = []; for (i = 0; i < n; i++) T.push(een(ver(C[Math.min(i + 1, n - 1)], C[Math.max(i - 1, 0)])));
    var e1 = assen(T[0])[0], s = 0, fr = [];
    for (i = 0; i < n; i++) {
      if (i) { e1 = een(ver(e1, maal(T[i], inw(e1, T[i])))); s += lengteV(ver(C[i], C[i - 1])); }
      fr.push([e1, uitw(T[i], e1), s]);
    }
    function straal(i) { return Array.isArray(rad) ? rad[i] : rad; }
    for (j = 0; j <= seg; j++) {
      var h = j / seg * Math.PI * 2, rij = [];
      for (i = 0; i < n; i++) {
        var f = fr[i], nn = som(maal(f[0], Math.cos(h)), maal(f[1], Math.sin(h)));
        rij.push(pt(som(C[i], maal(nn, straal(i))), nn, [(h + hk) * r0, f[2]], T[i]));
      }
      R.push(rij);
    }
    Bw.raster(R, m);
    if (o.kap === false) return;
    [[0, -1], [n - 1, 1]].forEach(function (e) {
      var i = e[0], f = fr[i], r = straal(i), Rk = [];
      for (var j = 0; j <= seg; j++) {
        var h = j / seg * Math.PI * 2, rij = [], nn = som(maal(f[0], Math.cos(h)), maal(f[1], Math.sin(h)));
        for (var k = 0; k <= 5; k++) { var rr = r * k / 5; rij.push(pt(som(C[i], maal(nn, rr)), maal(T[i], e[1]), [Math.cos(h + hk * e[1]) * rr, Math.sin(h + hk * e[1]) * rr], f[0])); }
        Rk.push(rij);
      }
      Bw.raster(Rk, o.kapM || m);
    });
  }

  // Gereedschap gaat in de gewone buffer, of (als het in- of uitfaadt) in de fade-buffer
  function kies(B, BF, a) { return a >= 0.999 ? { b: B, a: 1 } : { b: BF, a: Math.max(0, a) }; }
  function M(g, hex, ruw, metaal, soort) { return mat(hex, ruw, metaal, soort, g.a); }

  /* De oude folie komt los: een tong van het vlak naar de rol (de achterkant, met lijm), en de rol zelf.
     De rol volgt de voorkant, de afgeronde rand en de dagkant. */
  function rolOud(g, F, uB, r, val) {
    var d = DL + DO, ur = uB + r * 0.95, pad = PAD[F.deel], w = val || [0, 0, 0];
    var C = pad.map(function (q) { return som(padPunt(F, ur, q, d + r), w); });
    buis(g.b, C, r, M(g, [0.62, 0, 0], 0.8, 0, 2), { hoek: -uB / r, kapM: M(g, "#ffffff", 0.6, 0, 6), seg: 30 });
    if (!val) {
      var R = [];
      for (var k = 0; k <= 6; k++) {
        var f = k / 6, rij = [];
        pad.forEach(function (q) {
          // van het vlak (bij uB) in een boog omhoog naar de achterkant van de rol
          var a = f * Math.PI * 0.62, uu = mix(uB, ur - r * Math.sin(a + 0.25) * 0.85, f), hh = d + 0.15 + (r * 0.95) * (1 - Math.cos(a)) * 0.9;
          rij.push(pt(padPunt(F, uu, q, hh), q.n, [uu, q.v], F.U));
        });
        R.push(rij);
      }
      rasterNormalen(R, null);
      g.b.raster(R, M(g, "#ffffff", 0.35, 0, 3));
    }
  }
  function fohn(g, F, u, v, t) {
    var doel = F.w(u, v, DL + DO);
    var terug = een(som(som(maal(F.U, 0.5), maal(F.V, 0.42)), maal(F.n, 0.76))), dir = maal(terug, -1);
    var tip = som(doel, maal(terug, 30)), mond = som(tip, maal(terug, 40)), lijf = som(mond, maal(terug, 118));
    var wy = [0, 1, 0], up = een(ver(wy, maal(dir, inw(dir, wy)))), zij = een(uitw(dir, up));
    if (Math.abs(inw(dir, wy)) > 0.95) { up = een(ver(F.V, maal(dir, inw(dir, F.V)))); zij = een(uitw(dir, up)); }
    cil(g.b, tip, mond, 9, M(g, "#aeb6ba", 0.3, 1.0, 1), { kapM: M(g, "#2a2f33", 0.6, 0, 1) });
    cil(g.b, som(tip, maal(terug, 0.2)), som(tip, maal(terug, 0.6)), 6.5, mat("#000000", 1, 0, 7, g.a), { bev: 0.1 });
    var g0 = som(som(lijf, maal(dir, 42)), maal(zij, -8));
    kist(g.b, g0, maal(dir, 26), maal(up, -80), maal(zij, 16), M(g, "#2b3035", 0.45, 0, 1), 5);
    cil(g.b, lijf, mond, 19, M(g, "#353b41", 0.42, 0, 1), { bev: 5, kapM: M(g, "#262a2e", 0.5, 0, 1) });
    cil(g.b, som(mond, maal(terug, 10)), som(mond, maal(terug, 24)), 19.7, M(g, K.mint, 0.5, 0, 1), { bev: 1.5, kap: false });
    return { doel: doel, tip: tip, up: up, zij: zij };
  }
  // De krabber: een trekkrabber zoals de Bahco 665 ERGO. Een breed hardmetalen blad in een schuine houder,
  // een zilveren hals, een zwarte bolknop bovenop voor de tweede hand en een lang oranje handvat met een
  // zwarte grip. Je trekt hem naar je toe: het handvat wijst de kant op waar hij heen gaat, de lijm
  // komt vóór het blad (onder de houder) bij elkaar.
  // a: 0..1, het blad zakt van iets boven het vlak op het vlak (en tilt er aan het eind weer af).
  function krabber(g, F, u, vmax, a) {
    var lift = (1 - a) * 55, vc = vmax / 2, bw = Math.min(65, vmax - 4);
    var E0 = F.w(u, vc, DL + 0.35 + lift), hk = 38 * RAD;
    var b = een(som(maal(F.U, Math.cos(hk)), maal(F.n, Math.sin(hk))));            // van de snijkant schuin omhoog, naar voren
    var nb = een(uitw(F.V, b)); if (inw(nb, F.U) > 0) nb = maal(nb, -1);           // de achterkant van het blad
    var o = som(E0, maal(F.V, -bw / 2)), X = maal(F.V, bw);
    var staal = M(g, "#b9bec1", 0.3, 1.0, 1);
    kist(g.b, o, X, maal(b, 6), maal(nb, 2.4), M(g, "#41464a", 0.32, 0.9, 1), 0.4);   // hardmetalen snijkant
    kist(g.b, som(o, maal(b, 5)), X, maal(b, 21), maal(nb, 3.2), M(g, "#9aa1a6", 0.34, 1.0, 1), 0.8);   // de houder
    var H0 = som(E0, maal(b, 25)), dH = een(som(maal(F.U, 0.86), maal(F.n, 0.5))), H1 = som(H0, maal(dH, 48));
    kist(g.b, som(som(H0, maal(F.V, -12)), maal(b, -6)), maal(F.V, 24), maal(b, 13), maal(nb, 8.5), staal, 3);   // de kop
    cil(g.b, H0, H1, 6.5, staal, { bev: 2 });                                           // de hals
    var K0 = som(H0, maal(F.n, 4)), K1 = som(som(H0, maal(F.n, 28)), maal(F.U, -5));
    cil(g.b, K0, K1, 5.5, staal);
    bol(g.b, som(K1, maal(F.n, 13)), 17, M(g, "#1b1c1e", 0.3, 0, 1), 16);               // de zwarte knop
    // op de dorpel loopt het handvat schuin omhoog langs het kozijn (dan blijft de hele krabber in beeld)
    var opDorpel = Math.abs(F.U[0]) > 0.5;
    var dG = een(som(som(maal(F.U, 0.93), maal(F.n, opDorpel ? 0.2 : 0.3)), maal(F.V, opDorpel ? 0.32 : 0))), G0 = som(H1, maal(dG, -6)), G1 = som(G0, maal(dG, 166));
    cil(g.b, G0, G1, 12, M(g, "#e5560a", 0.82, 0, 1), { bev: 5 });                        // het oranje handvat (Bahco-oranje)
    cil(g.b, som(G0, maal(dG, 34)), som(G0, maal(dG, 150)), 13.5, M(g, "#1f2123", 0.72, 0, 1), { bev: 4, kap: false });   // de zwarte grip
  }
  // Vóór het blad schuift de lijm op tot een golvende rug van kleine bobbels.
  function lijmrug(B, F, u, vmax, t, a) {
    if (a <= 0.02) return;
    var C = [], R = [], n = 26;
    for (var i = 0; i <= n; i++) {
      var v = mix(5, vmax - 5, i / n), ruis = 0.5 + 0.5 * Math.sin(i * 2.7 + 1.3) * Math.sin(i * 1.3 + t * 1.6);
      var rr = (1.5 + 1.3 * ruis) * a;
      C.push(F.w(u + 1.0 + rr * 0.7, v, DL + rr * 0.35)); R.push(rr);
    }
    buis(B, C, R, mat("#ffffff", 0.3, 0, 3), { seg: 14 });
  }
  // Af en toe valt er een kruimel lijm van de rug af: klein, rustig tuimelend, en weg.
  function kruimels(B, naam, F, vmax, t, L) {
    kruimelsBij(B, F, vmax, t, L, T[naam], function (tk) { return werkU(naam, bewGrens(naam, tk)); });
  }
  // dezelfde kruimels, voor een andere tijdlijn: iv = [van, tot], uOp(tk) = waar het blad was op tijd tk
  function kruimelsBij(B, F, vmax, t, L, iv, uOp) {
    var n = Math.floor((iv[1] - iv[0]) / 0.1);
    for (var k = 0; k < n; k++) {
      var tk = iv[0] + 0.2 + k * 0.1, a = t - tk;
      if (a < 0 || a > 0.75) continue;
      var u = uOp(tk);
      if (u < 8 || u > L - 8) continue;
      var h1 = ((k * 0.618) % 1), h2 = ((k * 0.414 + 0.3) % 1), h3 = ((k * 0.732 + 0.6) % 1);
      var P0 = F.w(u + 4, 6 + h1 * (vmax - 12), DL + 2);
      var P = som(som(P0, maal(F.U, (18 + h2 * 30) * a)), som(maal(F.n, (30 + h3 * 50) * a), [0, (25 + h2 * 35) * a - 760 * a * a, 0]));
      bol(B, P, 1.3 + h3 * 1.3, mat("#ffffff", 0.35, 0, 3), 6);
    }
  }
  // De rakel: een folie-rakel zoals vakmensen hem gebruiken (zie de voorbeeldfoto van de opdrachtgever):
  // een blauw kaartje van stevig kunststof, 10 bij 7 cm, met afgeronde hoeken, een opstaande ribbel bovenin
  // voor de grip, en onderaan een brede zwarte viltstrook die om de rand loopt en over de folie glijdt.
  // Schuin gehouden, de bovenkant naar achteren.
  function rakel(g, F, u, vmax, a) {
    var lift = (1 - a) * 55, w = vmax + 30, h = 70, dik = 3.4, hoek = 30 * RAD;
    var Yd = een(som(maal(F.U, -Math.cos(hoek)), maal(F.n, Math.sin(hoek))));      // van de viltrand schuin omhoog, naar achteren
    var nb = een(uitw(F.V, Yd)); if (inw(nb, F.U) < 0) nb = maal(nb, -1);              // de voorkant (in de rijrichting)
    var rand = F.w(u, vmax / 2, DN + 1.7 + lift), blauw = M(g, "#2b97d6", 0.36, 0, 1);
    kaart(g.b, som(rand, maal(Yd, h / 2 + 1.2)), F.V, Yd, nb, w, h, dik, 5, blauw);
    // de ribbel bovenin, aan twee kanten
    var rib = som(som(rand, maal(Yd, h * 0.74)), maal(F.V, -(w - 7) / 2));
    kist(g.b, som(rib, maal(nb, -(dik / 2 + 1.5))), maal(F.V, w - 7), maal(Yd, 5.5), maal(nb, dik + 3), M(g, "#2a8fcc", 0.34, 0, 1), 1.6);
    // de viltstrook: aan beide kanten zo'n 2 cm hoog, en om de onderrand heen
    var vilt = M(g, "#1d1e20", 0.97, 0, 1);
    kist(g.b, som(som(rand, maal(F.V, -(w - 1) / 2)), som(maal(Yd, -1.4), maal(nb, -(dik / 2 + 1.3)))), maal(F.V, w - 1), maal(Yd, 22), maal(nb, dik + 2.6), vilt, 1.0);
  }
  // De spuitfles staat aan de linkerkant van wat hij nat maakt en spuit schuin op het vlak.
  function spuitfles(g, F, u, vmax) {
    var links = F.U[0] > 0.5 ? -1 : (F.U[0] < -0.5 ? 1 : -1);
    var doel = F.w(u, vmax * 0.45, 0), mond = F.w(u + links * 70, vmax + 4, 66);
    var dir = een(ver(doel, mond)), wy = [0, 1, 0], up = een(ver(wy, maal(dir, inw(dir, wy)))), zij = een(uitw(dir, up));
    var kop0 = som(mond, maal(dir, -36)), hals = som(som(kop0, maal(dir, 9)), maal(up, -9)), voet = som(hals, [0, -84, 0]);
    cil(g.b, voet, hals, 20, M(g, K.mint, 0.38, 0, 1), { bev: 6 });
    var e0 = som(voet, [0, 24, 0]);
    cil(g.b, e0, som(e0, [0, 30, 0]), 20.5, M(g, "#fbfbf8", 0.55, 0, 1), { kap: false, bev: 0.5 });
    cil(g.b, hals, som(hals, maal(up, 9)), 8.5, M(g, K.inkt, 0.45, 0, 1));
    kist(g.b, som(kop0, maal(zij, -7)), maal(dir, 36), maal(up, 14), maal(zij, 14), M(g, K.inkt, 0.42, 0, 1), 3);
    kist(g.b, som(som(kop0, maal(dir, 20)), maal(zij, -3.5)), maal(dir, 6), maal(up, -22), maal(zij, 7), M(g, "#3a4045", 0.45, 0, 1), 2);
    return { mond: mond, doel: doel, up: up, zij: zij };
  }
  // Een microvezeldoek, een beetje opgepropt onder de hand
  // De doek: een opgepropte microvezeldoek onder de hand, met plooien, een zoom en randen die een
  // beetje opkrullen. Hij poetst schoon en vetvrij en laat een natte glans achter (zie de shader).
  function doek(g, F, u, v, vmax, t) {
    var sc = vmax / 70, kl = M(g, "#a3d5c8", 0.95, 0, 5), zoom = M(g, "#6fb1a1", 0.95, 0, 5);
    var n1 = 44, n2 = 12, R = [], hk = 0.16 * Math.sin(t * 2.7);
    for (var i = 0; i <= n1; i++) {
      var h = i / n1 * Math.PI * 2, rij = [];
      var wob = 1 + 0.1 * Math.sin(h * 3 + 0.7) + 0.06 * Math.sin(h * 5 + 2.1) + 0.04 * Math.sin(h * 9 + 1.3);
      for (var j = 0; j <= n2; j++) {
        var f = j / n2, ru = 42 * sc * f * wob, rv = 29 * sc * f * wob;
        var bult = 15 * Math.pow(Math.cos(f * Math.PI / 2), 1.2);
        var plooi = 2.8 * Math.sin(h * 4 + f * 5) * f * (1 - f) * 4 + 1.2 * Math.sin(h * 11 + 2) * f;
        var krul = f > 0.82 ? (f - 0.82) / 0.18 * 3 * (0.5 + 0.5 * Math.sin(h * 2 + 1)) : 0;
        var du = Math.cos(h + hk) * ru, dv = Math.sin(h + hk) * rv;
        rij.push(pt(F.w(u + du, v + dv, 0.8 + bult + Math.max(-0.4, plooi) + krul), F.n, [du, dv], F.U));
      }
      R.push(rij);
    }
    rasterNormalen(R, F.n);
    g.b.raster(R.map(function (rij) { return rij.slice(0, n2); }), kl);
    g.b.raster(R.map(function (rij) { return rij.slice(n2 - 1); }), zoom);
  }
  // De rol nieuwe folie: crème met een kartonnen kern
  function rolNieuw(g, F, u, r, vmax, wv) {
    var as0 = som(F.w(u + r * 0.55, -1, DN + 0.6 + r), wv), as1 = som(F.w(u + r * 0.55, vmax + RV + 1, DN + 0.6 + r), wv);
    cil(g.b, as0, as1, r, M(g, "#ffffff", 0.35, 0, 4), { hoek: u / r, bev: 1.2, kapM: M(g, "#ffffff", 0.6, 0, 14), seg: 34 });
  }
  // Het omzetten: het bovenste deel van de nieuwe baan staat eerst rechtop boven de rand en klapt dan om
  function omzetten(B, st) {
    if (!st.nieuw) return;
    var g = st.nieuwG, r = BEW.nieuw[1];
    var a = Math.max(SW, r > 0 ? g - FLAP : g), b = Math.min(LEN, r > 0 ? g : g + FLAP);
    if (b <= a + 0.5) return;
    var R = [], n = 18;
    for (var i = 0; i <= n; i++) {
      var x = mix(a, b, i / n), f = klem(r * (g - x) / FLAP, 0, 1), h = E.zacht(f) * Math.PI / 2, rij = [];
      for (var k = 0; k <= 6; k++) {
        var w = k / 6 * (RV - 1.5), P = [x, PH + DN * 0.6 + Math.cos(h) * w, PD + DN * 0.6 - Math.sin(h) * w];
        rij.push(pt(P, [0, Math.sin(h), Math.cos(h)], [x, PH + w], [1, 0, 0]));
      }
      R.push(rij);
    }
    rasterNormalen(R, [0, 0.7, 0.7]);
    B.raster(R, mat("#ffffff", 0.35, 0, 4));
  }
  // Schilfers: losgelaten stukjes oude folie die omhoog krullen (tot de oude folie eraf gaat)
  var SCHILFERS = [
    { F: "boven", u: 408, v: 9, l: 20, b: 12, krul: 0.9, draai: 0.4 },
    { F: "boven", u: 446, v: 20, l: 13, b: 9, krul: 0.7, draai: -0.6 },
    { F: "voor", u: 372, v: PH - 13, l: 16, b: 10, krul: 0.6, draai: 1.9 },
    { F: "svoor", u: 52, v: 30, l: 14, b: 9, krul: 0.65, draai: 2.6 }
  ];
  function schilfers(B, z) {
    SCHILFERS.forEach(function (s) {
      var m = s.F === "svoor" ? 1 : 0, F = s.F === "boven" ? FBOVEN : (m ? FSVOOR : FVOOR);
      if (binnen(z.pel[m], s.u) || (m === 0 && z.los > 0.001 && s.u > LOS0)) return;
      var R = [], ca = Math.cos(s.draai), sa = Math.sin(s.draai);
      for (var i = 0; i <= 7; i++) {
        var rij = [], fi = i / 7;
        for (var j = 0; j <= 5; j++) {
          var fj = j / 5 - 0.5, lu = fi * s.l, lv = fj * s.b * (1 - 0.25 * fi * fi);
          // vast aan het begin, krult naar het eind omhoog en een beetje terug
          var hk = s.krul * fi * fi * 2.2, hoogte = DL + DO + 0.15 + Math.sin(hk) * s.l * 0.42, terug = (1 - Math.cos(hk)) * s.l * 0.3;
          var du = (lu - terug) * ca - lv * sa, dv = (lu - terug) * sa + lv * ca;
          var uvw = (s.F === "boven" ? 1 : 0);
          rij.push(pt(F.w(s.u + du, s.v + dv, hoogte), F.n, [s.u + du, (uvw ? PH + s.v : s.v) + dv], F.U));
        }
        R.push(rij);
      }
      rasterNormalen(R, F.n);
      B.raster(R, mat([0.95, 0, 0], 0.8, 0, 2));
    });
  }
  // De lagen op het stuk bij de zaagsnede komen in het begin even los van de voorkant
  function losOffset(st, i) { var e = st.los; return i ? [8 * e, 68 * e, 34 * e] : [4 * e, 34 * e, 17 * e]; }
  function losseLagen(B, st) {
    var x0 = LOS0, x1 = LEN;
    var lg = losOffset(st, 0), fo = losOffset(st, 1);
    kist(B, som([x0, 0, PD], lg), [x1 - x0, 0, 0], [0, PH, 0], [0, 0, 1.4], mat("#ffffff", 0.3, 0, 3), 0.5);
    kist(B, som([x0, 0, PD + 1.4], fo), [x1 - x0, 0, 0], [0, PH, 0], [0, 0, 1.9], mat([0.6, 0, 0], 0.8, 0, 2), 0.6);
  }

  /* 2D bovenop het beeld: warme lucht, nevel, vonkjes, uitleg -------------------------------- */
  function luchtLijnen(ctx, c, f, t, a) {
    ctx.save(); ctx.globalAlpha = a; ctx.beginPath();
    for (var k = 0; k < 3; k++) {
      for (var j = 0; j <= 10; j++) {
        var q = j / 10, P = som(som(f.tip, maal(ver(f.doel, f.tip), q)), som(maal(f.up, (k - 1) * 6 + Math.sin(q * 7 - t * 7 + k * 2) * 2.2 * q), maal(f.zij, (k - 1) * 3)));
        var p = c.q(P); if (j) ctx.lineTo(p[0], p[1]); else ctx.moveTo(p[0], p[1]);
      }
    }
    ctx.strokeStyle = "rgba(" + K.hitte + ",0.42)"; ctx.lineWidth = 2 * c.S * 0.5; ctx.lineCap = "round"; ctx.lineJoin = "round"; ctx.stroke();
    ctx.restore();
  }
  var r0 = rng(99), NEVEL = []; for (var di = 0; di < 46; di++) NEVEL.push([r0(), r0(), r0()]);
  function nevel(ctx, c, s, t, spuit) {
    if (spuit <= 0) return;
    var pm = c.q(s.mond), pdl = c.q(s.doel), w = 26 * c.S;
    var nx = -(pdl[1] - pm[1]), ny = pdl[0] - pm[0], nl = Math.sqrt(nx * nx + ny * ny) || 1; nx /= nl; ny /= nl;
    var gr = ctx.createLinearGradient(pm[0], pm[1], pdl[0], pdl[1]);
    gr.addColorStop(0, "rgba(235,246,243," + (0.55 * spuit) + ")"); gr.addColorStop(1, "rgba(235,246,243,0.04)");
    ctx.fillStyle = gr; ctx.beginPath(); ctx.moveTo(pm[0], pm[1]); ctx.lineTo(pdl[0] + nx * w, pdl[1] + ny * w); ctx.lineTo(pdl[0] - nx * w, pdl[1] - ny * w); ctx.closePath(); ctx.fill();
    NEVEL.forEach(function (nv) {
      var f = (nv[0] + t * 2.2) % 1, sp = som(maal(s.zij, (nv[1] - 0.5) * 52 * f), maal(s.up, (nv[2] - 0.5) * 42 * f));
      var p = c.q(som(som(s.mond, maal(ver(s.doel, s.mond), f)), sp)), pr = (0.9 + f * 1.6) * c.S * 0.5;
      ctx.fillStyle = "rgba(255,255,255," + (0.85 * spuit * (1 - f * 0.6)) + ")"; ctx.beginPath(); ctx.arc(p[0], p[1], pr, 0, Math.PI * 2); ctx.fill();
    });
  }
  function vonk(ctx, x, y, s, a) {
    ctx.save(); ctx.globalAlpha *= a;
    var g = ctx.createRadialGradient(x, y, 0, x, y, s * 9); g.addColorStop(0, "rgba(255,255,255,0.7)"); g.addColorStop(1, "rgba(255,255,255,0)");
    ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x, y, s * 9, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.moveTo(x, y - 11 * s); ctx.quadraticCurveTo(x + s, y - s, x + 11 * s, y); ctx.quadraticCurveTo(x + s, y + s, x, y + 11 * s);
    ctx.quadraticCurveTo(x - s, y + s, x - 11 * s, y); ctx.quadraticCurveTo(x - s, y - s, x, y - 11 * s); ctx.fillStyle = "#fff"; ctx.fill();
    ctx.restore();
  }
  function lijn2(ctx, q, stijl, w) {
    ctx.beginPath(); ctx.moveTo(q[0][0], q[0][1]); for (var i = 1; i < q.length; i++) ctx.lineTo(q[i][0], q[i][1]);
    ctx.strokeStyle = stijl; ctx.lineWidth = w; ctx.lineJoin = "round"; ctx.lineCap = "round"; ctx.stroke();
  }
  function labels(ctx, c, st, opties) {
    var a = st.labels, px = opties.pxPerCss || c.W / 700, fs = 15 * px;
    var oF = losOffset(st, 1), oL = losOffset(st, 0);
    var ankers = [
      [c.q(som([LEN - 18, PH * 0.62, PD + 3.3], oF)), "Folie", "verweerd en gescheurd"],
      [c.q(som([LEN - 12, 12, PD + 1.4], oL)), "Lijmlaag", "houdt de folie vast"],
      [c.p(LEN, 20, PD * 0.4), "Kunststof profiel", "blijft heel"]
    ];
    var x = 0, yMax = 0; ankers.forEach(function (k) { x = Math.max(x, k[0][0]); yMax = Math.max(yMax, k[0][1]); });
    ctx.font = "600 " + fs.toFixed(1) + "px Montserrat, sans-serif";
    var breed = ctx.measureText("Kunststof profiel").width, onder = x + 30 * px + breed > c.W - 18 * px;
    x = onder ? Math.max(24 * px, c.W * 0.5 - breed * 0.2) : Math.min(x + 30 * px, c.W - breed - 18 * px);
    var y = onder ? yMax + 70 * px : -1e9;
    ctx.save(); ctx.globalAlpha *= a; ctx.textBaseline = "alphabetic";
    ankers.forEach(function (k) {
      var ly = onder ? y : Math.max(y, k[0][1] + 5 * px); y = ly + fs * 2.9;
      lijn2(ctx, [[k[0][0], k[0][1]], [x - 8 * px, ly - fs * 0.36]], kleur(K.inkt, 1, 0.5), 1.2 * px);
      ctx.fillStyle = "#fff"; ctx.beginPath(); ctx.arc(k[0][0], k[0][1], 4.6 * px, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = K.inkt; ctx.beginPath(); ctx.arc(k[0][0], k[0][1], 3.1 * px, 0, Math.PI * 2); ctx.fill();
      ctx.font = "600 " + fs.toFixed(1) + "px Montserrat, sans-serif"; ctx.fillStyle = K.inkt; ctx.fillText(k[1], x, ly);
      ctx.font = (fs * 0.84).toFixed(1) + "px Inter, sans-serif"; ctx.fillStyle = K.sub; ctx.fillText(k[2], x, ly + fs * 1.2);
    });
    ctx.restore();
  }
  function rond(ctx, x, y, w, h, r) {
    ctx.beginPath(); ctx.moveTo(x + r, y); ctx.lineTo(x + w - r, y); ctx.quadraticCurveTo(x + w, y, x + w, y + r);
    ctx.lineTo(x + w, y + h - r); ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h); ctx.lineTo(x + r, y + h);
    ctx.quadraticCurveTo(x, y + h, x, y + h - r); ctx.lineTo(x, y + r); ctx.quadraticCurveTo(x, y, x + r, y); ctx.closePath();
  }
  /* Alleen voor de video: stappen en ondertitel in beeld (op de site doet de HTML dat) */
  function videoTekst(ctx, t, W, H) {
    var vert = H > W * 1.2, s = vert ? W / 1080 * 1.3 : Math.min(W / 1920, H / 1080);
    var zin = null;
    ZINNEN.forEach(function (z) { if (t >= z[0] && t < z[1] + 0.4) zin = z; });
    if (zin) {
      var a = Math.min(fase(t, zin[0], 0.3), 1 - fase(t, zin[1], 0.35)), fs = 34 * s;
      ctx.save(); ctx.globalAlpha = a; ctx.font = "600 " + fs.toFixed(1) + "px Montserrat, sans-serif";
      var regels = [zin[2]], maxW = W - 150 * s;
      if (ctx.measureText(zin[2]).width > maxW) {
        var wd = zin[2].split(" "), best = 1, bestD = 1e9;
        for (var i = 1; i < wd.length; i++) { var d = Math.abs(ctx.measureText(wd.slice(0, i).join(" ")).width - ctx.measureText(wd.slice(i).join(" ")).width); if (d < bestD) { bestD = d; best = i; } }
        regels = [wd.slice(0, best).join(" "), wd.slice(best).join(" ")];
      }
      var tw = 0; regels.forEach(function (r) { tw = Math.max(tw, ctx.measureText(r).width); });
      var lh = fs * 1.3, h = 80 * s + (regels.length - 1) * lh, w = tw + 110 * s, x = W / 2 - w / 2, y = vert ? H * 0.8 : H - 36 * s - h;
      var rr = Math.min(h / 2, 40 * s);
      ctx.fillStyle = "rgba(34,38,42,0.10)"; rond(ctx, x, y + 8 * s, w, h, rr); ctx.fill();
      ctx.fillStyle = "#fff"; rond(ctx, x, y, w, h, rr); ctx.fill();
      ctx.fillStyle = K.mint; ctx.beginPath(); ctx.arc(x + 40 * s, y + h / 2, 10 * s, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = K.inkt; ctx.textBaseline = "middle";
      regels.forEach(function (r, i) { ctx.fillText(r, x + 76 * s, y + h / 2 + (i - (regels.length - 1) / 2) * lh + 1); });
      ctx.restore();
    }
    var x0 = vert ? 54 * s : 64 * s, y0 = vert ? 120 * s : 60 * s;
    STAPPEN.forEach(function (sp, k) {
      var nu = t >= sp.van && t < sp.tot, klaar = t >= sp.tot, a = fase(t, INTRO + 0.4 + k * 0.12, 0.4);
      if (a <= 0) return;
      ctx.save(); ctx.globalAlpha = a;
      ctx.font = "600 " + (24 * s).toFixed(1) + "px Montserrat, sans-serif";
      var w = ctx.measureText(sp.naam).width + 92 * s, h = 58 * s, y = y0 + k * (h + 12 * s);
      ctx.fillStyle = "rgba(34,38,42,0.08)"; rond(ctx, x0, y + 6 * s, w, h, h / 2); ctx.fill();
      ctx.fillStyle = nu ? K.mintDiep : "#fff"; rond(ctx, x0, y, w, h, h / 2); ctx.fill();
      ctx.fillStyle = nu ? "#fff" : (klaar ? K.mintDiep : "#dbece7"); ctx.beginPath(); ctx.arc(x0 + 30 * s, y + h / 2, 17 * s, 0, Math.PI * 2); ctx.fill();
      if (klaar) { ctx.strokeStyle = "#fff"; ctx.lineWidth = 3.6 * s; ctx.lineCap = "round"; ctx.beginPath(); ctx.moveTo(x0 + 22 * s, y + h / 2); ctx.lineTo(x0 + 28 * s, y + h / 2 + 6 * s); ctx.lineTo(x0 + 38 * s, y + h / 2 - 6 * s); ctx.stroke(); }
      else { ctx.fillStyle = K.mintDiep; ctx.font = "700 " + (20 * s).toFixed(1) + "px Montserrat, sans-serif"; ctx.textAlign = "center"; ctx.textBaseline = "middle"; ctx.fillText(String(sp.nr), x0 + 30 * s, y + h / 2 + 1); ctx.textAlign = "start"; }
      ctx.fillStyle = nu ? "#fff" : K.inkt; ctx.globalAlpha = a * (nu || klaar ? 1 : 0.62);
      ctx.font = "600 " + (24 * s).toFixed(1) + "px Montserrat, sans-serif"; ctx.textBaseline = "middle"; ctx.fillText(sp.naam, x0 + 60 * s, y + h / 2 + 1);
      ctx.restore();
    });
  }

  /* Het gereedschap van het verhaal, op het juiste moment ------------------------------------ */
  function gereedschap(B, BF, sc, st, t, boven) {
    function bezig(naam, voor, na) { var iv = T[naam]; return t > iv[0] - (voor || 0.05) && t < iv[1] + (na || 0.3); }
    function info(naam, F0, vmax) {
      var L = lengte(BEW[naam][0]);
      return { F: werkvlak(F0, naam), L: L, u: werkU(naam, st[naam + "G"]), vmax: vmax, iv: T[naam] };
    }
    var heat = [0, 0, 0, 0];
    /* stap 1: warmte en de rol oude folie */
    [["pel", FVOOR, PH], ["pelS", FSVOOR, SW]].forEach(function (x) {
      if (!bezig(x[0])) return;
      var b = info(x[0], x[1], x[2]), u = b.u;
      var r = Math.sqrt(30 + Math.max(0, u + MARGE) * (DO + DL) * 1.1 / Math.PI);
      var aIn = fase(t, b.iv[0], 0.3), val = x[0] === "pel" ? Math.max(0, u - b.L + 4) : 0;
      var aRol = Math.min(aIn, 1 - fase(u, b.L - 6, 20));
      if (aRol > 0.003) rolOud(kies(B, BF, aRol), b.F, u, r, val > 0 ? [0, -val * val * 0.08, 0] : null);
      var aF = Math.min(aIn, 1 - fase(u, b.L - 30, 30));
      if (aF > 0.003) {
        var f = fohn(kies(B, BF, aF), b.F, Math.min(u + r * 2 + 20, b.L - 6), x[2] * 0.55, t);
        heat = [f.doel[0], f.doel[1], f.doel[2], aF];
        boven.push(function (ctx, c) { luchtLijnen(ctx, c, f, t, aF); });
      }
    });
    sc.heat = heat;
    /* stap 2: de krabber duwt de lijm voor zich uit */
    [["krabS", FSVOOR, SW], ["krab", FVOOR, PH]].forEach(function (x) {
      if (!bezig(x[0])) return;
      var b = info(x[0], x[1], x[2]), u = b.u;
      var a = Math.min(fase(t, b.iv[0], 0.3), 1 - fase(t, b.iv[1] - 0.1, 0.3));
      lijmrug(B, b.F, u, x[2], t, Math.min(fase(u, 0, 22), fase(b.L - u, 0, 22)) * a);
      kruimels(B, x[0], b.F, x[2], t, b.L);
      if (a > 0.003) krabber(kies(B, BF, a), b.F, u, x[2], a);
    });
    /* stap 2: schoonmaken en ontvetten met een doek: eerst de dorpel, dan de stijl omhoog */
    [["doek", FVOOR, PH], ["doekS", FSVOOR, SW]].forEach(function (x) {
      if (!bezig(x[0], 0.1, 0.25)) return;
      var b = info(x[0], x[1], x[2]);
      var a = Math.min(fase(t, b.iv[0], 0.2), 1 - fase(t, b.iv[1] - 0.05, 0.25));
      if (a > 0.003) doek(kies(B, BF, a), b.F, klem(b.u, 14, b.L - 14), x[2] * 0.5 + Math.sin(t * 8.5) * x[2] * 0.08, x[2], t);
    });
    /* stap 3: de rol nieuwe folie en de rakel */
    [["nieuw", FVOOR, PH], ["nieuwS", FSVOOR, SW]].forEach(function (x) {
      if (!bezig(x[0])) return;
      var b = info(x[0], x[1], x[2]), u = b.u;
      var r = Math.sqrt(121 + Math.max(0, b.L + MARGE - u) * DN * 0.62 / Math.PI);
      var a = Math.min(fase(t, b.iv[0], 0.3), 1 - fase(u, b.L + 6, 22));
      if (a <= 0.003) return;
      var g = kies(B, BF, a);
      rakel(g, b.F, Math.max(-20, u - 22), x[2], Math.min(1, fase(t, b.iv[0], 0.3)));
      var weg = Math.max(0, u - b.L + 4);
      rolNieuw(g, b.F, u, r, x[2], maal(b.F.U, weg * 0.5));
    });
  }

  /* Een beeld van het verhaal ------------------------------------------------------------- */
  function kapLaag(z, m, u) {
    if (m === 0 && z.los > 0.001) return [0, 0, 0];
    if (binnen(z.nieuw[m], u)) return [0, 0, DN];
    if (!binnen(z.pel[m], u)) return [DL, DO, 0];
    if (!binnen(z.krab[m], u)) return [DL, 0, 0];
    return [0, 0, 0];
  }
  function teken(ctx, t, W, H, opties) {
    opties = opties || {};
    t = klem(t, 0, DUUR);
    var st = staat(t), c = maakCamera(camVoor(t), W, H), z = zonesVoor(st), boven = [];
    var sc = {
      cam: c, z: z, schaduwMaat: opties.schaduwMaat || 2048,
      achtergrond: opties.achtergrond === false ? null : (opties.variant === "mint" ? "mint" : "licht"),
      kap: [kapLaag(z, 0, LEN), kapLaag(z, 1, 0)]
    };
    if (st.vetvrij > 0 && st.vetvrij < 1) {
      var vv = E.zacht(st.vetvrij); sc.sweep = [mix(-80, LEN + 160, vv), mix(-80, STI + 160, vv), Math.sin(Math.PI * st.vetvrij) * 1.1, 1];
    }
    if (st.glans > 0 && st.glans < 1) {
      var gv = E.zacht(st.glans); sc.sweep = [mix(-90, LEN + 200, gv), mix(-90, STI + 200, gv), Math.sin(Math.PI * st.glans), 0];
    }
    sc.dingen = function (B, BF) {
      schilfers(B, z);
      if (st.los > 0.001) losseLagen(B, st);
      omzetten(B, st);
      gereedschap(B, BF, sc, st, t, boven);
    };
    var cv = renderScene(W, H, sc);
    if (!cv) return false;
    ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0);
    if (opties.achtergrond === false) ctx.clearRect(0, 0, W, H);
    plak(ctx, cv, W, H);
    boven.forEach(function (f) { f(ctx, c); });
    // klaar: vonkjes op de nieuwe folie
    [[150, 0.6, FVOOR, PH], [360, 0.35, FVOOR, PH], [80, 0.5, FSVOOR, SW]].forEach(function (v, k) {
      var f = fase(t, T.glans[0] + 0.45 + k * 0.22, 0.8), zz = Math.sin(Math.PI * f);
      if (zz <= 0.01) return;
      var p = c.q(v[2].w(v[0], v[3] * v[1], DN));
      vonk(ctx, p[0], p[1], zz * 1.7 * c.S * 0.5, zz);
    });
    if (st.labels > 0.01 && opties.labels !== false) labels(ctx, c, st, opties);
    ctx.restore();
    if (opties.video) videoTekst(ctx, t, W, H);
    return true;
  }
