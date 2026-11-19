/* ---------------------------------------------------------------------------
   Kozijn in 3D (versie 3): zo herstellen we een kozijn.

   Een zwevende hoek van een kozijn met een blokprofiel, zoals een hoekmonster:
   een stuk onderdorpel, een stuk stijl en dubbel glas. Op de doorgezaagde kanten
   zie je het holle profiel van binnen (de kamers en het staal).

   Getekend met WebGL, met echt licht: een zachte lichtbak linksboven, schaduwen
   van het gereedschap op het kozijn, glans op de nieuwe folie.
   - De oude folie ziet eruit zoals op de voor-foto van de site: verweerd, krijtig,
     gebarsten in eilandjes met opgekrulde randen, vuil in de barsten en hier en
     daar een schilfer die loslaat.
   - De nieuwe folie ziet eruit zoals op de na-foto: zijdeglans, een lichtstreep
     langs de afgeronde rand en een heel fijne houtnerf die je alleen in de glans ziet.

   Het verhaal (27 seconden):
   - Dichtbij: zo ziet het kozijn er nu uit. Dan de hele hoek.
   - De lagen komen even los: folie, lijmlaag, kunststof profiel.
   1. Toplaag eraf: met warmte rolt de oude folie op, van de zaagkant naar de hoek
      en dan de stijl omhoog. De gele lijm blijft over.
   2. Reinigen en vetvrij: de krabber (een Bahco-trekkrabber) haalt de lijm weg (stijl omlaag,
      dorpel naar de zaagkant), dan maakt de doek alles schoon en vetvrij.
   3. Nieuwe folie erop: de rol rolt uit, de rakel drukt aan en de rand wordt
      omgezet. Tot slot dichtbij langs de nieuwe folie, en weer de hele hoek.

   Alles hangt af van één getal, de tijd: teken(ctx, t, breedte, hoogte, opties)
   tekent het beeld van seconde t op een gewoon 2D-canvas. Daardoor speelt dezelfde
   code live op de site en kan er beeld voor beeld een video van gemaakt worden.
   Zonder WebGL2 tekent hij niets en blijft het startbeeld (een JPG) staan.

   Maten in millimeters. De lagen zijn iets dikker dan in het echt, anders zie je ze niet.

   Let op bij bewerken: Nederlandse teksten met een apostrof altijd tussen
   dubbele aanhalingstekens.
   --------------------------------------------------------------------------- */
(function () {
  "use strict";

  /* Maten ------------------------------------------------------------------- */
  var LEN = 480;            // onderdorpel, rechts doorgezaagd
  var PH = 70, PD = 70;     // hoogte en diepte van het profiel
  var SW = 70;              // breedte van de stijl
  var STI = 230;            // stuk stijl boven de dorpel, boven doorgezaagd
  var GZ0 = 10, GZ1 = 34;   // het glas zit van z = 10 tot z = 34 (z = PD is de buitenkant)
  var RV = PD - GZ1;        // de dagkant: van het glas tot de voorkant
  var RR = 4.6;             // straal van de afgeronde randen van het profiel
  var DL = 0.9, DO = 1.5, DN = 1.4;   // dikte lijm, oude folie, nieuwe folie
  var LOS0 = LEN - 165;     // vanaf hier komen de lagen in het begin even los
  var FLAP = 78;            // zo ver loopt het omzetten van de rand achter de rol aan
  var MARGE = 34;           // het gereedschap begint en eindigt net buiten het profiel
  var RAD = Math.PI / 180;
  // Letters in het beeld: het lettertype van het apparaat zelf, net als de site (sinds november 2026).
  var LETTERS = '-apple-system, BlinkMacSystemFont, "SF Pro Text", "Segoe UI", Roboto, Helvetica, Arial, sans-serif';
  var HOEK = 64.56 * RAD, COT = Math.cos(HOEK) / Math.sin(HOEK);   // de schuinte van het logo

  /* Tijdlijn (seconden) ------------------------------------------------------ */
  var INTRO = 1.6;          // eerst even dichtbij: zo ziet het kozijn er nu uit
  var DUUR = 28.6;
  var T = {
    los: [0.9, 3.9],
    pel: [4.3, 7.2], pelS: [7.1, 8.6],          // oude folie: dorpel van de zaagkant naar de hoek, dan de stijl omhoog
    krabS: [9.0, 10.4], krab: [10.3, 13.0],     // krabber: stijl omlaag, dan de dorpel naar de zaagkant
    doek: [13.35, 15.1], doekS: [15.0, 16.3],   // schoonmaken met een doek: dorpel naar de hoek, dan de stijl omhoog
    vetvrij: [16.4, 17.3],
    nieuw: [18.2, 21.3], nieuwS: [21.2, 22.8],  // nieuwe folie: dorpel naar de hoek, dan de stijl omhoog
    glans: [23.5, 25.5]
  };
  // alles na het dichtbij-begin schuift INTRO seconden op
  (function () { for (var n in T) { T[n][0] += INTRO; T[n][1] += INTRO; } })();
  // Per bewerking: op welk deel, en welke kant op (+1: u wordt groter).
  // Dorpel: u = x (0 bij de hoek, LEN bij de zaagkant). Stijl: u = vanaf de bovenkant (0) naar de hoek (STI).
  var BEW = {
    pel: ["dorpel", -1], pelS: ["stijl", -1], krabS: ["stijl", 1], krab: ["dorpel", 1],
    doek: ["dorpel", -1], doekS: ["stijl", -1],
    nieuw: ["dorpel", -1], nieuwS: ["stijl", -1]
  };
  var STAPPEN = [
    { nr: 1, naam: "Toplaag eraf", van: 4.15 + INTRO, tot: 8.85 + INTRO },
    { nr: 2, naam: "Reinigen en vetvrij", van: 8.9 + INTRO, tot: 18.0 + INTRO },
    { nr: 3, naam: "Nieuwe folie erop", van: 18.05 + INTRO, tot: 23.0 + INTRO }
  ];
  var ZINNEN = [
    [0.25, INTRO + 0.55, "Verweerd, gebarsten en dof."],
    [0.9 + INTRO, 3.85 + INTRO, "Folie, lijmlaag, kunststof profiel."],
    [4.2 + INTRO, 8.75 + INTRO, "Met warmte gaat de oude folie eraf."],
    [8.95 + INTRO, 13.05 + INTRO, "De krabber haalt de oude lijmresten weg."],
    [13.2 + INTRO, 17.95 + INTRO, "Met een doek ontvetten: helemaal schoon en vetvrij."],
    [18.1 + INTRO, 22.95 + INTRO, "Nieuwe Renolit folie, aangedrukt en om de rand gezet."],
    [23.2 + INTRO, DUUR, "Tien jaar fabrieksgarantie op de folie."]
  ];
  var STIL = [5.8 + INTRO, 11.7 + INTRO, 19.8 + INTRO];      // stilstaand beeld per stap (bij "minder beweging")

  // Camera: sleutelbeelden [t, doel x, doel y, zoom, draaiing, kanteling, (afstand)]. Daartussen loopt een vloeiende
  // kromme: de camera remt niet af bij elk sleutelbeeld, en volgt het gereedschap rustig.
  // Het begin en het eind (dichtbij, laag langs de dorpel) zijn zoals de voor- en na-foto op de site.
  var CAM = [
    [0.0, 392, 58, 2.5, 68, 15, 760],
    [1.05, 366, 60, 2.38, 62, 17, 800],
    [INTRO + 0.6, 262, 104, 1.03, 44, 25],
    [1.2 + INTRO, 340, 96, 1.06, 40, 23],
    [2.5 + INTRO, 392, 90, 1.15, 38, 22],
    [3.8 + INTRO, 388, 90, 1.15, 36, 21],
    [4.6 + INTRO, 392, 62, 1.2, 33, 20],
    [7.0 + INTRO, 150, 62, 1.2, 31, 20],
    [7.7 + INTRO, 100, 140, 1.14, 30, 20],
    [8.6 + INTRO, 100, 222, 1.12, 30, 20],
    [9.1 + INTRO, 100, 220, 1.12, 30, 20],
    [10.3 + INTRO, 104, 118, 1.14, 30, 20],
    [10.9 + INTRO, 168, 62, 1.21, 31, 20],
    [12.9 + INTRO, 392, 58, 1.21, 33, 20],
    [13.6 + INTRO, 360, 64, 1.2, 33, 20],
    [14.4 + INTRO, 232, 64, 1.2, 32, 20],
    [15.1 + INTRO, 116, 80, 1.15, 31, 20],
    [15.7 + INTRO, 100, 160, 1.12, 30, 20],
    [16.3 + INTRO, 100, 218, 1.12, 30, 20],
    [17.2 + INTRO, 250, 112, 1.0, 33, 22],
    [17.9 + INTRO, 340, 92, 1.06, 33, 21],
    [18.5 + INTRO, 392, 62, 1.2, 33, 20],
    [21.2 + INTRO, 150, 62, 1.2, 31, 20],
    [21.9 + INTRO, 100, 140, 1.14, 30, 20],
    [22.8 + INTRO, 100, 220, 1.12, 30, 20],
    [23.85 + INTRO, 262, 70, 2.1, 58, 15, 760],
    [25.15 + INTRO, 318, 62, 2.35, 66, 11, 720],
    [26.25 + INTRO, 256, 112, 1.04, 38, 23],
    [DUUR, 240, 120, 0.97, 35, 23]
  ];

  var K = {
    papier: "#f7f6f3", inkt: "#22262a", sub: "#646b73", mint: "#a3cdc2", mintDiep: "#2f5a50", mintInkt: "#3f7468",
    oud: "#ddd6c3", nieuw: "#ebe4d3", lijm: "#d4a43e", lijmDonker: "#a87f29", lijmLicht: "#e8c46c",
    blad: "#c9d0d4", karton: "#c7a478", hitte: "224,122,79", rubber: "#1d1f21"
  };

  /* Rekenhulpjes ------------------------------------------------------------- */
  function klem(x, a, b) { return x < a ? a : x > b ? b : x; }
  function mix(a, b, p) { return a + (b - a) * p; }
  function fase(t, van, duur) { return klem((t - van) / duur, 0, 1); }
  var E = {
    zacht: function (p) { return p < 0.5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2; },
    uit: function (p) { return 1 - Math.pow(1 - p, 3); },
    in_: function (p) { return p * p * p; },
    // rustig op gang, dan gelijkmatig, en rustig weer stil: zo beweegt gereedschap in een hand
    gelijk: function (p) { var a = 0.2, v = 1 / (1 - a); return p < a ? 0.5 * v * p * p / a : p > 1 - a ? 1 - 0.5 * v * (1 - p) * (1 - p) / a : v * (p - a / 2); }
  };
  function kf(t, pts) {
    if (t <= pts[0][0]) return pts[0][1];
    for (var i = 1; i < pts.length; i++) {
      if (t <= pts[i][0]) return mix(pts[i - 1][1], pts[i][1], E.zacht((t - pts[i - 1][0]) / (pts[i][0] - pts[i - 1][0])));
    }
    return pts[pts.length - 1][1];
  }
  // Een vloeiende kromme door sleutelwaarden: de helling komt uit de buren, dus geen stilstand bij elk punt.
  function kromme(t, keys, k) {
    var n = keys.length;
    if (t <= keys[0][0]) return keys[0][k];
    if (t >= keys[n - 1][0]) return keys[n - 1][k];
    var i = 0; while (keys[i + 1][0] < t) i++;
    var t0 = keys[i][0], t1 = keys[i + 1][0], h = t1 - t0, s = (t - t0) / h;
    function helling(j) { return (j <= 0 || j >= n - 1) ? 0 : (keys[j + 1][k] - keys[j - 1][k]) / (keys[j + 1][0] - keys[j - 1][0]); }
    var m0 = helling(i) * h, m1 = helling(i + 1) * h, s2 = s * s, s3 = s2 * s;
    return (2 * s3 - 3 * s2 + 1) * keys[i][k] + (s3 - 2 * s2 + s) * m0 + (-2 * s3 + 3 * s2) * keys[i + 1][k] + (s3 - s2) * m1;
  }
  function rng(seed) {
    var s = seed >>> 0;
    return function () { s = (s + 0x6D2B79F5) >>> 0; var t = Math.imul(s ^ (s >>> 15), 1 | s); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
  }
  function som(a, b) { return [a[0] + b[0], a[1] + b[1], a[2] + b[2]]; }
  function ver(a, b) { return [a[0] - b[0], a[1] - b[1], a[2] - b[2]]; }
  function maal(a, s) { return [a[0] * s, a[1] * s, a[2] * s]; }
  function inw(a, b) { return a[0] * b[0] + a[1] * b[1] + a[2] * b[2]; }
  function uitw(a, b) { return [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]]; }
  function een(a) { var l = Math.sqrt(inw(a, a)) || 1; return [a[0] / l, a[1] / l, a[2] / l]; }
  function lengteV(a) { return Math.sqrt(inw(a, a)); }
  function binnen(iv, u) { return !!iv && u >= iv[0] && u <= iv[1]; }

  var RGB = {};
  function rgb(hex) {
    var c = RGB[hex];
    if (!c) { var n = parseInt(hex.slice(1), 16); c = RGB[hex] = [(n >> 16) & 255, (n >> 8) & 255, n & 255]; }
    return c;
  }
  function kleur(hex, k, a) {
    var c = rgb(hex);
    return "rgba(" + (klem(c[0] * k, 0, 255) | 0) + "," + (klem(c[1] * k, 0, 255) | 0) + "," + (klem(c[2] * k, 0, 255) | 0) + "," + (a == null ? 1 : a) + ")";
  }

  /* De bewerkingen: waar is het gereedschap, en waar is het al geweest ------------- */
  function lengte(deel) { return deel === "dorpel" ? LEN : STI; }
  function bewGrens(naam, t) {
    var b = BEW[naam], iv = T[naam], L = lengte(b[0]), p = E.gelijk(fase(t, iv[0], iv[1] - iv[0]));
    return b[1] > 0 ? mix(-MARGE, L + MARGE, p) : mix(L + MARGE, -MARGE, p);
  }
  function klaar(naam, t) {
    if (t <= T[naam][0]) return null;
    var g = bewGrens(naam, t);
    return BEW[naam][1] > 0 ? [-1e5, g] : [g, 1e5];
  }
  function werkU(naam, g) { var b = BEW[naam]; return b[1] > 0 ? g : lengte(b[0]) - g; }

  function staat(t) {
    var s = {};
    s.los = E.uit(fase(t, T.los[0], 0.8)) * (1 - E.zacht(fase(t, T.los[1] - 0.65, 0.65)));
    s.labels = fase(t, T.los[0] + 0.45, 0.3) * (1 - fase(t, T.los[1] - 0.95, 0.3));
    for (var n in BEW) { s[n] = klaar(n, t); s[n + "G"] = bewGrens(n, t); }
    s.vetvrij = fase(t, T.vetvrij[0], T.vetvrij[1] - T.vetvrij[0]);
    s.glans = fase(t, T.glans[0], T.glans[1] - T.glans[0]);
    return s;
  }
  // de zones per deel, zoals de motor ze wil hebben: [van, tot] of null
  function zonesVoor(s) {
    var r = BEW.nieuw[1], g = s.nieuwG;
    return {
      pel: [s.pel, s.pelS], krab: [s.krab, s.krabS], nieuw: [s.nieuw, s.nieuwS], doek: [s.doek, s.doekS],
      nat: [null, null],
      // de dagkant van de dorpel krijgt de nieuwe folie pas na het omzetten (die loopt achter de rol aan)
      nieuwBoven: s.nieuw ? (r > 0 ? [-1e5, g - FLAP] : [g + FLAP, 1e5]) : null,
      doekG: [s.doek && s.doekG != null ? [s.doekG, BEW.doek[1]] : null, s.doekS && s.doekSG != null ? [s.doekSG, BEW.doekS[1]] : null],
      los: s.los, los0: LOS0
    };
  }

  /* De camera -------------------------------------------------------------------
     cam = {tx, ty, tz, zoom, yaw, pitch, D, cyF}. De projectie is dezelfde als in de
     vorige versies: op de diepte van het doel is 1 mm precies S pixels. */
  function maakCamera(cam, W, H) {
    var tx = cam.tx, ty = cam.ty, tz = cam.tz == null ? PD * 0.8 : cam.tz, zoom = cam.zoom;
    var yaw = cam.yaw * RAD, pitch = cam.pitch * RAD;
    var ca = Math.cos(yaw), sa = Math.sin(yaw), cb = Math.cos(pitch), sb = Math.sin(pitch);
    var vert = H > W * 1.2, D = cam.D || 1150;
    var S = (vert ? W / 470 : Math.min(W / 600, H / 450)) * zoom;
    var cx = W * (cam.cxF != null ? cam.cxF : 0.5), cy = H * (cam.cyF != null ? cam.cyF : (vert ? 0.5 : 0.53));
    var c = { W: W, H: H, S: S, yaw: yaw, D: D, vert: vert };
    c.C = [tx + D * cb * sa, ty + D * sb, tz + D * cb * ca];
    c.p = function (x, y, z) {
      var dx = x - tx, dy = y - ty, dz = z - tz;
      var x1 = dx * ca - dz * sa, z1 = dx * sa + dz * ca;
      var y2 = dy * cb - z1 * sb, z2 = dy * sb + z1 * cb;
      var k = D / (D - z2);
      return [cx + x1 * k * S, cy - y2 * k * S, k];
    };
    c.q = function (P) { return c.p(P[0], P[1], P[2]); };
    c.ziet = function (n, P) { return n[0] * (c.C[0] - P[0]) + n[1] * (c.C[1] - P[1]) + n[2] * (c.C[2] - P[2]) > 0; };
    // voor WebGL: kijk- en projectiematrix (kolom voor kolom)
    var R0 = [ca, -sb * sa, cb * sa], R1 = [0, cb, sb], R2 = [-sa, -sb * ca, cb * ca];
    var vx = -(R0[0] * tx + R1[0] * ty + R2[0] * tz), vy = -(R0[1] * tx + R1[1] * ty + R2[1] * tz), vz = -(R0[2] * tx + R1[2] * ty + R2[2] * tz) - D;
    var V = [R0[0], R0[1], R0[2], 0, R1[0], R1[1], R1[2], 0, R2[0], R2[1], R2[2], 0, vx, vy, vz, 1];
    var f = S * D, n = Math.max(40, D * 0.15), fa = D + 2600;
    var P = [2 * f / W, 0, 0, 0, 0, 2 * f / H, 0, 0, -(2 * cx / W - 1), -(1 - 2 * cy / H), -(fa + n) / (fa - n), -1, 0, 0, -2 * fa * n / (fa - n), 0];
    c.V = V; c.P = P; c.VP = M4.mul(P, V);
    return c;
  }
  CAM.forEach(function (k) { if (k.length < 7) k.push(1150); });   // de 7e waarde: afstand van de camera (dichtbij: meer diepte)
  function camVoor(t) {
    return { tx: kromme(t, CAM, 1), ty: kromme(t, CAM, 2), zoom: kromme(t, CAM, 3), yaw: kromme(t, CAM, 4), pitch: kromme(t, CAM, 5), D: kromme(t, CAM, 6) };
  }

  /* 4x4-matrices (kolom voor kolom) ------------------------------------------------- */
  var M4 = {
    mul: function (a, b) {
      var r = new Array(16);
      for (var c = 0; c < 4; c++) for (var w = 0; w < 4; w++) {
        var s = 0; for (var k = 0; k < 4; k++) s += a[k * 4 + w] * b[c * 4 + k]; r[c * 4 + w] = s;
      }
      return r;
    },
    kijk: function (oog, doel, op) {
      var z = een(ver(oog, doel)), x = een(uitw(op, z)), y = uitw(z, x);
      return [x[0], y[0], z[0], 0, x[1], y[1], z[1], 0, x[2], y[2], z[2], 0, -inw(x, oog), -inw(y, oog), -inw(z, oog), 1];
    },
    ortho: function (l, r, b, t, n, f) {
      return [2 / (r - l), 0, 0, 0, 0, 2 / (t - b), 0, 0, 0, 0, -2 / (f - n), 0, -(r + l) / (r - l), -(t + b) / (t - b), -(f + n) / (f - n), 1];
    },
    inv: function (m) {
      var a = m, r = new Array(16);
      var b00 = a[0] * a[5] - a[1] * a[4], b01 = a[0] * a[6] - a[2] * a[4], b02 = a[0] * a[7] - a[3] * a[4];
      var b03 = a[1] * a[6] - a[2] * a[5], b04 = a[1] * a[7] - a[3] * a[5], b05 = a[2] * a[7] - a[3] * a[6];
      var b06 = a[8] * a[13] - a[9] * a[12], b07 = a[8] * a[14] - a[10] * a[12], b08 = a[8] * a[15] - a[11] * a[12];
      var b09 = a[9] * a[14] - a[10] * a[13], b10 = a[9] * a[15] - a[11] * a[13], b11 = a[10] * a[15] - a[11] * a[14];
      var det = b00 * b11 - b01 * b10 + b02 * b09 + b03 * b08 - b04 * b07 + b05 * b06;
      if (!det) return m.slice();
      det = 1 / det;
      r[0] = (a[5] * b11 - a[6] * b10 + a[7] * b09) * det; r[1] = (a[2] * b10 - a[1] * b11 - a[3] * b09) * det;
      r[2] = (a[13] * b05 - a[14] * b04 + a[15] * b03) * det; r[3] = (a[10] * b04 - a[9] * b05 - a[11] * b03) * det;
      r[4] = (a[6] * b08 - a[4] * b11 - a[7] * b07) * det; r[5] = (a[0] * b11 - a[2] * b08 + a[3] * b07) * det;
      r[6] = (a[14] * b02 - a[12] * b05 - a[15] * b01) * det; r[7] = (a[8] * b05 - a[10] * b02 + a[11] * b01) * det;
      r[8] = (a[4] * b10 - a[5] * b08 + a[7] * b06) * det; r[9] = (a[1] * b08 - a[0] * b10 - a[3] * b06) * det;
      r[10] = (a[12] * b04 - a[13] * b02 + a[15] * b00) * det; r[11] = (a[9] * b02 - a[8] * b04 - a[11] * b00) * det;
      r[12] = (a[5] * b07 - a[4] * b09 - a[6] * b06) * det; r[13] = (a[0] * b09 - a[1] * b07 + a[2] * b06) * det;
      r[14] = (a[13] * b01 - a[12] * b03 - a[14] * b00) * det; r[15] = (a[8] * b03 - a[9] * b01 + a[10] * b00) * det;
      return r;
    }
  };

  /* ======================= De shaders (GLSL ES 3.00) =======================
     Eén belichting voor alles: een warme lichtbak linksboven (met zachte schaduwen),
     zacht licht van boven en van de vloer, en weerspiegeling van een lichte studio.
     De materialen:
       0  het kozijn zelf: welke laag waar ligt, volgt uit de zones (zie dikte en kozijn)
       1  effen (gereedschap)       2  oude folie        3  lijm          4  nieuwe folie
       5  microvezeldoek            6  kopse kant van een rol oude folie
       7  gloed (hete mond van de föhn)                  8  zaagsnede van het profiel
       9  kaal kunststof            10 afstandhouder in het glas (met gaatjes)
       11 glasrand                  12 glas (doorzichtig)  13 rubber
       14 kopse kant van een rol nieuwe folie (met kartonnen kern) */
  var GLSL_ALG = [
    "#version 300 es",
    "precision highp float; precision highp int; precision highp sampler2D; precision highp sampler2DShadow;",
    "#define LEN " + LEN.toFixed(1), "#define PH " + PH.toFixed(1), "#define PD " + PD.toFixed(1),
    "#define SW " + SW.toFixed(1), "#define STI " + STI.toFixed(1), "#define GZ0 " + GZ0.toFixed(1), "#define GZ1 " + GZ1.toFixed(1),
    "#define RV " + RV.toFixed(1), "#define RR " + RR.toFixed(2), "#define DL " + DL.toFixed(2), "#define DO " + DO.toFixed(2), "#define DN " + DN.toFixed(2),
    "#define RW 0.9",
    "uniform vec4 uZa[2]; uniform vec4 uZb[2]; uniform vec4 uZc[2]; uniform vec4 uLos;",
    // uOver 1: de nieuwe laag komt óp de oude folie (wrappen, verf) in plaats van op het kale profiel.
    // uOff: het kozijn als geheel verplaatst (een kozijn dat eruit gaat en een nieuw dat erin komt).
    "uniform float uOver; uniform vec3 uOff;",
    // zachte overgang: 1 binnen [van, tot], 0 erbuiten
    "float bin(float u, vec2 iv){ return clamp(min(u - iv.x, iv.y - u) / RW + 0.5, 0.0, 1.0); }",
    // hoe dik de lagen zijn op plek u van deel m (0 dorpel, 1 stijl), vlak f (0 voorkant, 1 dagkant)
    "float dikte(float u, int m, int f){",
    "  vec4 za = uZa[m], zb = uZb[m], zc = uZc[m];",
    "  float pel = bin(u, za.xy), krab = bin(u, za.zw);",
    "  float nw = bin(u, (f == 1 && m == 0) ? zc.zw : zb.xy);",
    "  float los = (m == 0 && uLos.x > 0.001) ? clamp((u - uLos.y) / RW + 0.5, 0.0, 1.0) : 0.0;",
    "  float oud = (1.0 - pel) * (DL + DO) + pel * (1.0 - krab) * DL;",
    "  return mix(oud * (1.0 - los), DN + uOver * oud * (1.0 - los), nw);",
    "}"
  ].join("\n");

  var VS_KOZIJN = GLSL_ALG + "\n" + [
    "in vec3 aPos; in vec3 aNrm; in vec4 aUV; in vec3 aTan;",
    "uniform mat4 uVP;",
    "out vec3 vPos; out vec3 vNrm; out vec3 vTan; out vec4 vUV; out vec3 vCol; out vec4 vPrm;",
    "void main(){",
    "  int m = int(aUV.z + 0.5), f = int(aUV.w + 0.5);",
    "  float d = f == 2 ? 0.0 : dikte(aUV.x, m, f);",
    "  vec3 P = aPos + aNrm * d + uOff;",
    "  vPos = P; vNrm = aNrm; vTan = aTan; vUV = aUV; vCol = vec3(1.0); vPrm = vec4(0.5, 0.0, 0.0, 1.0);",
    "  gl_Position = uVP * vec4(P, 1.0);",
    "}"
  ].join("\n");

  var VS_DING = GLSL_ALG + "\n" + [
    "in vec3 aPos; in vec3 aNrm; in vec2 aUV; in vec3 aTan; in vec3 aCol; in vec4 aPrm;",
    "uniform mat4 uVP;",
    "out vec3 vPos; out vec3 vNrm; out vec3 vTan; out vec4 vUV; out vec3 vCol; out vec4 vPrm;",
    "void main(){",
    "  vPos = aPos + uOff; vNrm = aNrm; vTan = aTan; vUV = vec4(aUV, 0.0, 0.0); vCol = aCol; vPrm = aPrm;",
    "  gl_Position = uVP * vec4(vPos, 1.0);",
    "}"
  ].join("\n");

  // schaduwkaart: diepte (vanzelf) en hoe ondoorzichtig de schaduwgever is
  var FS_SCHADUW = GLSL_ALG + "\n" + [
    "in vec3 vPos; in vec3 vNrm; in vec3 vTan; in vec4 vUV; in vec3 vCol; in vec4 vPrm;",
    "uniform float uSoort;",
    "out vec4 uit;",
    "void main(){ float id = uSoort < 0.5 ? 0.0 : vPrm.z; if (id > 11.5 && id < 12.5) discard; uit = vec4(uSoort < 0.5 ? 1.0 : vPrm.w, 0.0, 0.0, 1.0); }"
  ].join("\n");

  var FS_OPP = GLSL_ALG + "\n" + [
    "in vec3 vPos; in vec3 vNrm; in vec3 vTan; in vec4 vUV; in vec3 vCol; in vec4 vPrm;",
    "out vec4 uit;",
    "uniform float uSoort;",                          // 0 kozijn, 1 dingen
    "uniform vec3 uEye; uniform vec3 uLk; uniform vec3 uKey; uniform vec3 uHemel; uniform vec3 uVloer; uniform vec3 uAchter;",
    "uniform float uBel;",
    "uniform mat4 uLmat; uniform sampler2DShadow uSh; uniform sampler2D uShRaw; uniform sampler2D uShA; uniform vec3 uShInfo;",
    "uniform vec4 uHeat; uniform vec4 uDoekG; uniform vec4 uSweep; uniform vec4 uCapL[2]; uniform vec3 uCapA[2]; uniform vec3 uCapB[2]; uniform vec3 uCapI[2];",
    // De zon (alleen in "25 jaar zon"): uLeeftijd 0 = nieuwe folie, 1 = versleten (de gewone animatie: altijd 1);
    // uZon.xyz = richting van de zon, uZon.w = hoeveel de lucht meedoet in de weerspiegeling; uLuchtB/H = lucht boven en aan de horizon.
    "uniform float uLeeftijd; uniform vec4 uZon; uniform vec3 uLuchtB; uniform vec3 uLuchtH;",
    // De kleur van de folie (sRGB): uFN nieuw, uFO verweerd; uNerf: hoe sterk je de houtnerf ziet. Standaard crème.
    "uniform vec3 uFN; uniform vec3 uFO; uniform float uNerf; uniform float uGlansF; uniform float uVuil;",
    // uFJ: de kleur van de oude folie toen hij nieuw was (folie.jong; standaard dezelfde als uFN). Zo kan een goed
    // crème kozijn een antraciet wrap krijgen, of een geschilderd kozijn verweren.
    "uniform vec3 uFJ;",
    // uSchil: hoeveel stukjes er loslaten als de laag verweert (folie.schil; standaard 1). Verf op folie bladdert meer.
    "uniform float uSchil;",
    "const float PI = 3.14159265;",
    "float h12(vec2 p){ vec3 p3 = fract(vec3(p.xyx) * 0.1031); p3 += dot(p3, p3.yzx + 33.33); return fract((p3.x + p3.y) * p3.z); }",
    "vec2 h22(vec2 p){ vec3 p3 = fract(vec3(p.xyx) * vec3(0.1031, 0.1030, 0.0973)); p3 += dot(p3, p3.yzx + 33.33); return fract((p3.xx + p3.yz) * p3.zy); }",
    "vec3 vnd(vec2 p){",
    "  vec2 i = floor(p), f = fract(p); vec2 u = f * f * (3.0 - 2.0 * f), du = 6.0 * f * (1.0 - f);",
    "  float a = h12(i), b = h12(i + vec2(1.0, 0.0)), c = h12(i + vec2(0.0, 1.0)), d = h12(i + vec2(1.0, 1.0));",
    "  float k1 = b - a, k2 = c - a, k4 = a - b - c + d;",
    "  return vec3(a + k1 * u.x + k2 * u.y + k4 * u.x * u.y, du * vec2(k1 + k4 * u.y, k2 + k4 * u.x));",
    "}",
    "float vn(vec2 p){ return vnd(p).x; }",
    "float fbm(vec2 p){ float s = 0.0, a = 0.5; for (int i = 0; i < 4; i++){ s += a * vn(p); p = p * 2.03 + vec2(1.7, 9.2); a *= 0.5; } return s; }",
    // Voronoi met de afstand tot de dichtstbijzijnde rand (de barst) en de richting ervan
    "vec4 vrand(vec2 x){",
    "  vec2 n = floor(x), f = fract(x), mg = vec2(0.0), mr = vec2(0.0); float md = 8.0;",
    "  for (int j = -1; j <= 1; j++) for (int i = -1; i <= 1; i++){",
    "    vec2 g = vec2(float(i), float(j)), o = h22(n + g) * 0.8 + 0.1, r = g + o - f; float d = dot(r, r);",
    "    if (d < md){ md = d; mr = r; mg = g; }",
    "  }",
    "  md = 8.0; vec2 bn = vec2(0.0, 1.0);",
    "  for (int j = -2; j <= 2; j++) for (int i = -2; i <= 2; i++){",
    "    vec2 g = mg + vec2(float(i), float(j)), o = h22(n + g) * 0.8 + 0.1, r = g + o - f, dr = r - mr;",
    "    if (dot(dr, dr) > 1e-5){ vec2 nn = normalize(dr); float d = dot(0.5 * (mr + r), nn); if (d < md){ md = d; bn = nn; } }",
    "  }",
    "  return vec4(md, bn, h12(n + mg));",
    "}",
    "vec3 srgb(vec3 c){ return pow(c, vec3(2.2)); }",
    // ---- oude folie: verweerd, krijtig, gebarsten in eilandjes met opgekrulde randen (zoals de voor-foto)
    "vec3 oudeFolie(vec2 s, float st, inout vec3 nT, out float ro, float pix){",
    "  vec2 w = vec2(fbm(s * 0.045), fbm(s * 0.045 + 13.7)) - 0.5;",
    "  float masker = 0.35 + 0.65 * smoothstep(0.3, 0.62, fbm(s * 0.018 + 3.0));",
    "  float sm = st * masker;",
    "  vec4 v1 = vrand(vec2(s.x / 15.0, s.y / 9.0) + w * 1.25);",
    "  float d1 = v1.x * 11.0; vec2 g1 = -v1.yz * vec2(11.0 / 15.0, 11.0 / 9.0); float id = v1.w;",
    "  vec4 v2 = vrand(vec2(s.x / 5.0, s.y / 3.6) + w * 0.8 + 7.3);",
    "  float d2 = v2.x * 4.2; vec2 g2 = -v2.yz * vec2(4.2 / 5.0, 4.2 / 3.6);",
    "  float lod = 1.0 - smoothstep(0.35, 1.5, pix);",
    "  float fw1 = max(fwidth(d1), 1e-3), fw2 = max(fwidth(d2), 1e-3);",
    "  float cw = 0.05 + 0.08 * sm;",
    "  float b1 = (1.0 - smoothstep(cw - fw1, cw + fw1, d1)) * smoothstep(0.08, 0.4, sm);",
    "  float b2 = (1.0 - smoothstep(0.035 - fw2, 0.035 + fw2, d2)) * smoothstep(0.35, 0.9, sm);",
    "  float pm = 0.014 * uSchil * st * st * masker;",
    "  float mis = step(id, pm);",
    "  float krul = (1.0 - mis) * step(pm, id) * step(id, pm + 0.16 * sm * min(uSchil, 2.0));",
    "  float lipH = (0.2 + 0.75 * krul) * sm * lod, lipW = 0.75 + 1.1 * krul;",
    "  float e = exp(-max(d1 - cw, 0.0) / lipW), e2 = exp(-max(d2 - 0.035, 0.0) / 0.45);",
    "  vec2 grad = (-lipH / lipW * e * step(cw, d1)) * g1 + (-0.05 * sm * lod / 0.45 * e2 * step(0.035, d2)) * g2;",
    "  if (mis > 0.5) grad = -grad;",
    "  nT.xy -= grad * 1.5;",
    "  float bl = fbm(s * 0.03 + 4.0), str = fbm(vec2(s.x * 0.16, s.y * 0.018) + 9.0);",
    "  vec3 c = mix(uFO * vec3(0.945, 0.938, 0.924), uFO, smoothstep(0.3, 0.72, bl));",
    "  c *= 0.975 + 0.05 * fract(id * 7.13);",
    "  c = mix(c, uFO * vec3(0.884, 0.865, 0.81), smoothstep(0.55, 0.85, fbm(s * 0.012 + 2.0)) * 0.3 * uVuil);",
    "  c = mix(c, uFO * vec3(0.73, 0.725, 0.718), smoothstep(0.5, 0.8, str) * 0.18 * st * uVuil);",
    "  c = mix(c, mix(uFO, vec3(1.0), 0.52), e * (0.18 + 0.4 * krul) * sm * (1.0 - mis));",
    "  if (mis > 0.5) c = mix(vec3(0.72, 0.64, 0.47), vec3(0.6, 0.57, 0.5), fbm(s * 0.4));",
    "  c = mix(c, uFO * vec3(0.486, 0.472, 0.447), b1 * 0.62);",
    "  c = mix(c, uFO * vec3(0.663, 0.657, 0.647), b2 * 0.4);",
    "  ro = mix(0.74, 0.88, clamp(b1 + 0.5 * b2, 0.0, 1.0));",
    "  return srgb(c);",
    "}",
    // ---- nieuwe folie: zijdeglans, een heel fijne nerf die je in de glans ziet
    "vec3 nieuweFolieK(vec2 s, inout vec3 nT, out float ro, float pix, vec3 kl){",
    "  float lod = 1.0 - smoothstep(0.1, 0.45, pix);",
    "  vec3 g = vnd(vec2(s.x * 0.55, s.y * 4.0));",
    "  vec3 g2 = vnd(vec2(s.x * 0.08, s.y * 1.25) + 3.1);",
    "  nT.xy -= g.yz * vec2(0.55, 4.0) * 0.018 * lod + g2.yz * vec2(0.08, 1.25) * 0.03;",
    "  float streep = vn(vec2(s.x * 0.011, s.y * 0.8));",
    "  float golf = vn(vec2(s.x * 0.006, s.y * 0.04)) * 7.0 + vn(vec2(s.x * 0.0022, s.y * 0.02) + 4.0) * 12.0;",
    "  float nerf = smoothstep(0.25, 0.75, vn(vec2(s.x * 0.012, (s.y + golf) * 0.42))) * 0.7 + vn(vec2(s.x * 0.05, (s.y + golf) * 1.6) + 7.0) * 0.3;",
    "  vec3 c = kl * (1.0 + (streep - 0.5) * 0.03 + (nerf - 0.5) * uNerf);",
    "  ro = (0.25 + (g2.x - 0.5) * 0.05 + (1.0 - lod) * 0.05) * uGlansF;",
    "  return srgb(c);",
    "}",
    "vec3 nieuweFolie(vec2 s, inout vec3 nT, out float ro, float pix){ return nieuweFolieK(s, nT, ro, pix, uFN); }",
    // ---- de folie die verweert: van nieuw (zijdeglans) via dof en krijtig naar gebarsten en opgekruld.
    // Eerst gaat de glans eraf, dan verbleekt de kleur, pas in de tweede helft komen de barsten.
    "vec3 folieOud(vec2 s, float st, inout vec3 nT, out float ro, float pix){",
    "  if (uLeeftijd > 0.999) return oudeFolie(s, st, nT, ro, pix);",
    "  float a = uLeeftijd;",
    "  vec3 nN = nT, nO = nT; float rN, rO;",
    "  vec3 cN = nieuweFolieK(s, nN, rN, pix, uFJ);",
    "  float sb = st * smoothstep(0.2, 1.0, a) * (0.55 + 0.45 * smoothstep(0.5, 1.0, a));",
    "  vec3 cO = oudeFolie(s, sb, nO, rO, pix);",
    // de zon bleekt de folie niet overal even snel: vlekkerig, de bovenkant van de dorpel het eerst
    "  float vlek = smoothstep(0.25, 0.75, fbm(s * 0.02 + 5.0));",
    "  float k = clamp(smoothstep(0.04, 0.98, a) * (0.8 + 0.4 * vlek * st), 0.0, 1.0);",
    "  ro = mix(rN, rO, smoothstep(0.0, 0.42, a + 0.08 * vlek));",
    "  nT = normalize(mix(nN, nO, smoothstep(0.2, 0.85, a)));",
    "  return mix(cN, cO, k);",
    "}",
    // ---- lijm: honinggeel, plakkerig glanzend, met strepen
    "vec3 lijm(vec2 s, inout vec3 nT, out float ro){",
    "  float st = fbm(s * 0.035);",
    "  vec3 r = vnd(s * 0.32), r2 = vnd(vec2(s.x * 0.04, s.y * 0.5) + 5.0);",
    "  nT.xy -= r.yz * 0.32 * 0.1 + r2.yz * vec2(0.04, 0.5) * 0.035;",
    "  vec3 c = mix(vec3(0.83, 0.69, 0.41), vec3(0.87, 0.75, 0.48), smoothstep(0.3, 0.7, st));",
    "  c *= 0.99 + 0.025 * r.x + 0.008 * (r2.x - 0.5);",
    "  ro = 0.2 + 0.1 * st;",
    "  return srgb(c);",
    "}",
    // ---- kaal kunststof: eerst met een waas van lijm en vet, na de doek schoon
    "vec3 pvc(vec2 s, float waas, out float ro){",
    "  float st = fbm(vec2(s.x * 0.035, s.y * 0.5));",
    "  float res = smoothstep(0.42, 0.78, st) * waas;",
    "  vec3 c = mix(vec3(0.94, 0.945, 0.935), vec3(0.88, 0.83, 0.68), res * 0.6);",
    "  ro = mix(0.36, 0.62, waas * 0.6 + res * 0.4);",
    "  return srgb(c);",
    "}",
    // ---- druppels ontvetter
    "float druppels(vec2 s, inout vec3 nT){",
    "  vec2 q = s / 3.6, i = floor(q), f = fract(q); float m = 0.0;",
    "  for (int j = -1; j <= 1; j++) for (int k = -1; k <= 1; k++){",
    "    vec2 g = vec2(float(k), float(j)), h = h22(i + g);",
    "    if (h.x > 0.58) continue;",
    "    vec2 c = g + 0.2 + 0.6 * h - f; float r = 0.12 + 0.3 * fract(h.y * 7.3); float d = length(c) / r;",
    "    if (d < 1.0){ float z = sqrt(1.0 - d * d); nT = normalize(vec3(-c / r * 0.85, z + 0.15)); m = 1.0; }",
    "  }",
    "  return m;",
    "}",
    // ---- licht
    "vec3 omgeving(vec3 r, float ro){",
    "  float y = r.y;",
    "  vec3 c = y > 0.0 ? mix(vec3(0.8, 0.81, 0.82), vec3(1.02, 1.02, 1.0), pow(y, 0.6)) : mix(vec3(0.86, 0.86, 0.86), uAchter * 0.92, pow(-y, 0.6));",
    "  float w = 0.03 + ro * 0.55, k = 1.0 / (1.0 + ro * 3.0);",
    "  c += vec3(2.4, 2.3, 2.15) * k * smoothstep(0.88 - w, 0.88 + w * 0.4, dot(r, normalize(vec3(-0.5, 0.72, 0.48))));",
    "  c += vec3(2.5, 2.46, 2.36) * k * smoothstep(0.8 - w, 0.84 + w * 0.3, dot(r, normalize(vec3(-0.42, 0.55, -0.72))));",
    "  c += vec3(0.9, 0.9, 0.88) * k * smoothstep(0.7 - w, 0.86 + w * 0.2, dot(r, normalize(vec3(-0.62, -0.18, 0.76))));",
    "  float zij = smoothstep(0.9 - w, 0.9 + w * 0.4, dot(normalize(r.xz + vec2(1e-4)), normalize(vec2(0.95, 0.3)))) * smoothstep(-0.35 - w, 0.1, r.y) * smoothstep(0.8 + w, 0.45, r.y);",
    "  c += vec3(1.1, 1.12, 1.15) * k * zij;",
    "  if (uZon.w < 0.001) return c;",
    // buiten: de lucht, en de zon zelf als heldere vlek (daardoor glimt de nieuwe folie waar de zon in spiegelt)
    "  vec3 l = y > 0.0 ? mix(uLuchtH, uLuchtB, pow(y, 0.7)) : mix(uLuchtH, uAchter * 0.95, pow(-y, 0.5));",
    "  float zd = dot(r, uZon.xyz);",
    "  l += uKey * k * (0.42 * smoothstep(0.996 - w * 0.6, 1.0 - w * 0.12, zd) + 0.06 * pow(max(zd, 0.0), 6.0));",
    "  return mix(c, l * 1.15, uZon.w);",
    "}",
    "const vec2 PS[16] = vec2[16](vec2(-0.94, -0.40), vec2(0.95, -0.77), vec2(-0.09, -0.93), vec2(0.34, 0.29), vec2(-0.92, 0.46), vec2(-0.25, 0.25), vec2(0.40, -0.48), vec2(0.70, 0.71),",
    "  vec2(-0.72, -0.15), vec2(0.13, 0.82), vec2(-0.44, -0.75), vec2(0.86, 0.15), vec2(-0.57, 0.80), vec2(0.30, -0.12), vec2(-0.08, -0.36), vec2(0.58, -0.92));",
    "float schaduw(vec3 P, vec3 N){",
    "  if (uShInfo.x < 0.5) return 1.0;",
    "  float nl = clamp(dot(N, uLk), 0.0, 1.0);",
    "  vec4 lp = uLmat * vec4(P + N * (0.5 + 1.2 * (1.0 - nl)), 1.0);",
    "  vec3 c = lp.xyz / lp.w * 0.5 + 0.5;",
    "  if (c.x < 0.0 || c.x > 1.0 || c.y < 0.0 || c.y > 1.0 || c.z > 1.0) return 1.0;",
    "  float dRef = c.z - 0.0004;",
    "  float bs = 0.0, bn = 0.0, rs = 12.0 * uShInfo.y;",
    "  for (int i = 0; i < 8; i++){ float d = texture(uShRaw, c.xy + PS[i * 2] * rs).r; if (d < dRef){ bs += d; bn += 1.0; } }",
    "  if (bn < 0.5) return 1.0;",
    "  float pen = clamp((dRef - bs / bn) * uShInfo.z, 1.2, 22.0) * uShInfo.y;",
    "  float v = 0.0;",
    "  for (int i = 0; i < 16; i++){ vec2 q = c.xy + PS[i] * pen; float s = texture(uSh, vec3(q, dRef)); float a = texture(uShA, q).r; v += 1.0 - (1.0 - s) * a; }",
    "  return v / 16.0;",
    "}",
    "vec3 belicht(vec3 P, vec3 N, vec3 alb, float ro, float me, float ao, float sh){",
    "  vec3 V = normalize(uEye - P), L = uLk, H = normalize(L + V);",
    "  float nv = max(dot(N, V), 1e-3), nl = max(dot(N, L), 0.0), nh = max(dot(N, H), 0.0), vh = max(dot(V, H), 0.0);",
    "  float a = max(ro * ro, 0.003), a2 = a * a, dd = nh * nh * (a2 - 1.0) + 1.0, D = a2 / (PI * dd * dd);",
    "  float k = a * 0.5, Vs = 0.25 / ((nv * (1.0 - k) + k) * (nl * (1.0 - k) + k));",
    "  vec3 f0 = mix(vec3(0.04), alb, me), F = f0 + (1.0 - f0) * pow(1.0 - vh, 5.0);",
    "  vec3 kd = (1.0 - F) * (1.0 - me);",
    "  vec3 direct = (kd * alb / PI + D * Vs * F) * uKey * nl * sh;",
    "  vec3 amb = mix(uVloer, uHemel, N.y * 0.5 + 0.5) * alb * (1.0 - me) * ao;",
    "  vec3 Fe = f0 + (max(vec3(1.0 - ro), f0) - f0) * pow(1.0 - nv, 5.0);",
    "  vec3 R = reflect(-V, N);",
    "  vec3 env = omgeving(R, ro) * Fe * ao * mix(0.55, 1.0, sh);",
    "  return direct + amb + env;",
    "}",
    "vec3 filmisch(vec3 x){",
    "  x *= uBel; float L = max(dot(x, vec3(0.2126, 0.7152, 0.0722)), 1e-5);",
    "  float Lt = (L * (2.51 * L + 0.03)) / (L * (2.43 * L + 0.59) + 0.14);",
    "  vec3 y = x * (Lt / L); float m = max(y.r, max(y.g, y.b)); if (m > 1.0) y = mix(y / m, vec3(1.0), clamp((m - 1.0) * 0.28, 0.0, 0.3));",
    "  return pow(clamp(y, 0.0, 1.0), vec3(1.0 / 2.2));",
    "}",
    // ---- de zaagsnede: hol profiel met kamers en het staal
    "float sdRR(vec2 p, vec2 c, vec2 h, float r){ vec2 q = abs(p - c) - h + r; return length(max(q, 0.0)) + min(max(q.x, q.y), 0.0) - r; }",
    "const vec4 KAM[5] = vec4[5](vec4(3.5, 3.5, 13.0, 63.0), vec4(20.0, 3.5, 30.0, 9.0), vec4(20.0, 16.0, 30.0, 38.0), vec4(20.0, 57.5, 30.0, 9.0), vec4(53.5, 3.5, 13.0, 63.0));",
    "vec3 hol(vec2 ab, vec2 c, vec2 h, int k, vec3 kl){",
    "  vec3 V = normalize(vPos - uEye);",
    "  float da = dot(V, uCapA[k]), db = dot(V, uCapB[k]), dd = max(dot(V, uCapI[k]), 0.05);",
    "  float ta = abs(da) < 1e-4 ? 1e5 : ((da > 0.0 ? c.x + h.x : c.x - h.x) - ab.x) / da;",
    "  float tb = abs(db) < 1e-4 ? 1e5 : ((db > 0.0 ? c.y + h.y : c.y - h.y) - ab.y) / db;",
    "  float t = min(ta, tb), diep = t * dd;",
    "  vec3 wn = ta < tb ? -sign(da) * uCapA[k] : -sign(db) * uCapB[k];",
    "  float l = 0.42 + 0.58 * max(dot(wn, uLk), 0.0);",
    "  return mix(vec3(0.05, 0.055, 0.06), srgb(kl) * l * 1.05, exp(-diep / 34.0));",
    "}",
    "void main(){",
    "  vec3 N = normalize(vNrm);",
    "  float id = uSoort < 0.5 ? 0.0 : vPrm.z;",
    "  bool achter = !gl_FrontFacing && uSoort > 0.5;",
    "  if (achter) N = -N;",
    "  vec3 Tt = vTan - N * dot(vTan, N); Tt = dot(Tt, Tt) > 1e-6 ? normalize(Tt) : normalize(cross(N, vec3(0.31, 0.83, 0.47)));",
    "  vec3 Bt = cross(N, Tt);",
    "  vec2 s = vUV.xy;",
    "  float pix = length(fwidth(s));",
    "  vec3 alb = vec3(0.8), nT = vec3(0.0, 0.0, 1.0), em = vec3(0.0);",
    "  float ro = 0.5, me = 0.0, ao = 1.0, alpha = uSoort < 0.5 ? 1.0 : vPrm.w, glansBand = 0.0;",
    "  if (id < 0.5){",
    // het kozijn
    "    float u = vUV.x, v = vUV.y; int m = int(vUV.z + 0.5), f = int(vUV.w + 0.5);",
    "    if (f == 2){ alb = srgb(vec3(0.95, 0.955, 0.95)); ro = 0.45; }",
    "    else {",
    "      vec4 za = uZa[m], zb = uZb[m], zc = uZc[m];",
    "      float pel = bin(u, za.xy), krab = bin(u, za.zw), nw = bin(u, (f == 1 && m == 0) ? zc.zw : zb.xy);",
    "      float doek = bin(u, zb.zw), nat = bin(u, zc.xy);",
    "      float los = (m == 0 && uLos.x > 0.001) ? clamp((u - uLos.y) / RW + 0.5, 0.0, 1.0) : 0.0;",
    "      float wO = (1.0 - pel) * (1.0 - los), wL = pel * (1.0 - krab) * (1.0 - los), wK = max(0.0, 1.0 - wO - wL);",
    // de stap in hoogte tussen de lagen: de normaal kantelt mee
    "      float dT = (dikte(u + 0.3, m, f) - dikte(u - 0.3, m, f)) / 0.6;",
    "      N = normalize(N - Tt * dT * 0.85);",
    "      Tt = normalize(Tt - N * dot(Tt, N)); Bt = cross(N, Tt);",
    "      float st = m == 0 ? (f == 1 ? 1.0 : 0.3 + 0.7 * smoothstep(PH * 0.3, PH - 6.0, v)) : (f == 1 ? 0.6 : 0.72);",
    "      vec3 A = vec3(0.0), NT = vec3(0.0); float R = 0.0;",
    "      if (wO > 0.001){ vec3 n = vec3(0.0, 0.0, 1.0); float r; vec3 a = folieOud(s, st, n, r, pix); A += a * wO; NT += n * wO; R += r * wO; }",
    "      if (wL > 0.001){ vec3 n = vec3(0.0, 0.0, 1.0); float r; vec3 a = lijm(s, n, r); A += a * wL; NT += n * wL; R += r * wL; }",
    "      if (wK > 0.001){",
    "        vec3 n = vec3(0.0, 0.0, 1.0); float r;",
    "        vec3 a = pvc(s, 1.0 - doek, r);",
    "        float natw = nat * (1.0 - doek);",
    "        if (natw > 0.01){ vec3 n2 = n; float dm = druppels(s, n2); n = normalize(mix(n, n2, natw)); r = mix(r, mix(0.16, 0.04, dm), natw); a *= 1.0 - 0.08 * natw; }",
    "        vec2 dg = m == 0 ? uDoekG.xy : uDoekG.zw;",
    "        if (dg.y != 0.0){ float acht = dg.y > 0.0 ? dg.x - u : u - dg.x; float gl = (1.0 - smoothstep(0.0, 95.0, acht)) * step(0.0, acht) * doek; r = mix(r, 0.1, gl * 0.8); }",
    "        A += a * wK; NT += n * wK; R += r * wK;",
    "      }",
    "      if (nw > 0.001){ vec3 n = vec3(0.0, 0.0, 1.0); float r; vec3 a = nieuweFolie(s, n, r, pix); A = mix(A, a, nw); NT = mix(NT, n, nw); R = mix(R, r, nw); }",
    "      alb = A; nT = normalize(NT); ro = R;",
    // warmte van de föhn
    "      if (uHeat.w > 0.001){ float hd = length(vPos - uOff - uHeat.xyz); float g = exp(-hd * hd / (2.0 * 26.0 * 26.0)) * uHeat.w; em += vec3(1.0, 0.36, 0.1) * g * 0.55; alb *= 1.0 - 0.15 * g; }",
    // een glans langs de schuinte van het logo (aan het eind), of mint (schoon en vetvrij)
    "      if (uSweep.z > 0.001){",
    "        float sp = (m == 0 ? uSweep.x : uSweep.y) - (u + v * " + COT.toFixed(5) + ");",
    "        float band = exp(-sp * sp / (2.0 * 22.0 * 22.0)) * uSweep.z;",
    "        if (uSweep.w < 0.5) { glansBand = band * nw; em += vec3(0.16, 0.155, 0.15) * glansBand * (0.25 + 0.75 * dot(uFN, vec3(0.2126, 0.7152, 0.0722))); }",
    "        else em += vec3(0.16, 0.32, 0.27) * band * wK * (1.0 - nw);",
    "      }",
    // zacht donkerder in de binnenhoeken en tegen het glas
    "      vec3 Pm = vPos - uOff;",
    "      if (m == 0 && f == 1) ao *= 1.0 - 0.35 * exp(-max(Pm.x - SW, 0.0) / 9.0);",
    "      if (m == 1 && f == 1) ao *= 1.0 - 0.35 * exp(-max(Pm.y - PH, 0.0) / 9.0);",
    "      if (f == 1) ao *= 1.0 - 0.32 * exp(-max(Pm.z - GZ1, 0.0) / 4.0);",
    "    }",
    "  } else if (id < 1.5){ alb = srgb(vCol); ro = vPrm.x; me = vPrm.y; }",
    "  else if (id < 2.5){ if (achter){ alb = lijm(s, nT, ro) * 0.85; } else alb = oudeFolie(s, vCol.x, nT, ro, pix); }",
    "  else if (id < 3.5){ alb = lijm(s, nT, ro); }",
    "  else if (id < 4.5){ if (achter){ alb = srgb(vec3(0.95, 0.94, 0.9)); ro = 0.25; } else alb = nieuweFolie(s, nT, ro, pix); }",
    "  else if (id < 5.5){",
    "    float vez = vn(s * 2.2) * 0.5 + vn(s * 0.6) * 0.5; alb = srgb(vCol) * (0.9 + 0.2 * vez); ro = 0.95;",
    "    em += srgb(vCol) * pow(1.0 - max(dot(N, normalize(uEye - vPos)), 0.0), 3.0) * 0.18;",
    "  }",
    "  else if (id < 6.5 || (id > 13.5 && id < 14.5)){",
    "    float rr = length(s); bool nieuw = id > 13.5;",
    "    float ring = smoothstep(0.35, 0.5, abs(fract(rr / (nieuw ? 1.15 : 1.6)) - 0.5));",
    "    alb = nieuw ? mix(srgb(uFN), srgb(uFN * 0.67), ring * 0.55) : mix(srgb(uFO * 0.95), srgb(vec3(0.82, 0.62, 0.25)), ring);",
    "    ro = 0.6;",
    "    if (nieuw && rr < 12.0){ alb = rr < 9.0 ? srgb(vec3(0.27, 0.21, 0.15)) : srgb(vec3(0.78, 0.64, 0.45)); ro = 0.85; }",
    "  }",
    "  else if (id < 7.5){ alb = vec3(0.0); em = vec3(3.2, 1.1, 0.25) * vPrm.w; ro = 1.0; }",
    "  else if (id < 8.5){",
    // zaagsnede
    "    int k = int(vCol.x + 0.5); vec2 ab = s; vec4 L = uCapL[k];",
    "    float sd = sdRR(ab, vec2(PD * 0.5, 35.0), vec2(PD * 0.5, 35.0), RR);",
    "    alb = srgb(vec3(0.93, 0.94, 0.93)); ro = 0.6;",
    "    if (sd > 0.0){",
    "      bool kant = (ab.x < 2.0 && ab.y > -2.0 && ab.y < 72.0) || (ab.y > 68.0 && ab.x > -2.0 && ab.x < RV);",
    "      float tot = L.z > 0.0 ? L.z : L.x + L.y;",
    "      if (!kant || sd > tot || tot < 0.05) discard;",
    "      if (L.z > 0.0){ alb = srgb(uFN); ro = 0.35; }",
    "      else if (sd < L.x){ alb = srgb(vec3(0.80, 0.62, 0.25)); ro = 0.3; }",
    "      else { alb = srgb(uFO * 0.94); ro = 0.8; }",
    "    } else {",
    "      for (int i = 0; i < 5; i++){",
    "        vec4 Kk = KAM[i]; vec2 c = Kk.xy + Kk.zw * 0.5, h = Kk.zw * 0.5;",
    "        if (sdRR(ab, c, h, 1.2) < 0.0){",
    "          if (i == 2){",
    "            float so = sdRR(ab, c, h - 3.5, 1.6), si = sdRR(ab, c, h - 5.6, 1.0);",
    "            if (so < 0.0 && si > 0.0){ alb = srgb(vec3(0.6, 0.63, 0.65)); me = 1.0; ro = 0.4; break; }",
    "            if (si < 0.0){ em = hol(ab, c, h - 5.6, k, vec3(0.5, 0.53, 0.55)); alb = vec3(0.0); ro = 1.0; break; }",
    "          }",
    "          em = hol(ab, c, h, k, vec3(0.9, 0.92, 0.91)); alb = vec3(0.0); ro = 1.0; break;",
    "        }",
    "      }",
    "    }",
    "  }",
    "  else if (id < 9.5){ alb = pvc(s, 0.0, ro); }",
    "  else if (id < 10.5){",
    "    alb = srgb(vCol); me = 0.9; ro = 0.42;",
    "    vec2 g = vec2(fract(s.x / 2.1) - 0.5, (s.y - 3.2) / 2.1); if (length(g) < 0.2) { alb *= 0.45; ro = 0.9; }",
    "  }",
    "  else if (id < 11.5){ alb = srgb(vec3(0.82, 0.9, 0.88)); ro = 0.12; }",
    "  else if (id < 12.5){",
    // glas: weerspiegeling, en een klein beetje grijsgroen
    "    vec3 V = normalize(uEye - vPos); float nv = max(abs(dot(N, V)), 1e-3);",
    "    float F = 0.04 + 0.96 * pow(1.0 - nv, 5.0);",
    "    vec3 envS = filmisch(omgeving(reflect(-V, N), 0.02));",
    "    float sl = (vPos.x - uOff.x) + (vPos.y - uOff.y) * 0.48 + uEye.x * 0.35;",
    "    float streep = smoothstep(0.0, 18.0, mod(sl, 230.0)) * (1.0 - smoothstep(18.0, 70.0, mod(sl, 230.0))) * 0.05 + smoothstep(0.0, 6.0, mod(sl + 90.0, 230.0)) * (1.0 - smoothstep(6.0, 20.0, mod(sl + 90.0, 230.0))) * 0.035;",
    "    float tr = 0.88 - 0.05 * smoothstep(PH + 120.0, PH, vPos.y - uOff.y);",
    "    vec3 c = envS * F + vec3(0.55, 0.64, 0.66) * (1.0 - tr) * (1.0 - F) + vec3(streep);",
    "    float a = clamp(1.0 - (1.0 - F) * tr + streep, 0.0, 1.0);",
    "    uit = vec4(c, a) * vPrm.w;",
    "    return;",
    "  }",
    "  else if (id < 13.5){ alb = srgb(vec3(0.07, 0.075, 0.08)); ro = 0.5; }",
    "  vec3 Np = normalize(Tt * nT.x + Bt * nT.y + N * nT.z);",
    "  if (glansBand > 0.001){ float a = max(ro * ro, 0.003), a2 = a * a, nh = max(dot(Np, N), 0.0), dd = nh * nh * (a2 - 1.0) + 1.0; em += vec3(1.0, 0.985, 0.95) * glansBand * min(a2 / (PI * dd * dd), 60.0) * 0.032 * (0.35 + 0.65 * dot(uFN, vec3(0.2126, 0.7152, 0.0722))); }",
    "  float sh = schaduw(vPos, N);",
    "  vec3 c = belicht(vPos, Np, alb, ro, me, ao, sh) + em;",
    "  uit = vec4(filmisch(c), 1.0) * alpha;",
    "}"
  ].join("\n");

  // de achtergrond: papier (of mint) met een zachte schaduw op de vloer onder het kozijn
  var VS_ACHTER = "#version 300 es\nin vec2 aPos; void main(){ gl_Position = vec4(aPos, 0.0, 1.0); }";
  var FS_ACHTER = [
    "#version 300 es",
    "precision highp float;",
    "uniform mat4 uInvVP; uniform vec3 uEye; uniform vec2 uRes; uniform vec3 uC0; uniform vec3 uC1; uniform vec3 uC2; uniform float uDoorzicht; uniform vec3 uSchDir; uniform float uSchK;",
    // De lucht met de zonnebaan ("25 jaar zon"). uLucht: 0 uit, 1 aan. uLB/uLH/uLG: lucht boven, horizon, grond (sRGB 0..1).
    // uBoog: midden x, y en straal van de zonnebaan in pixels (y omlaag). uZonP: plek op de baan (0 links, 1 rechts),
    // lengte van het spoor, hoe fel, straal van de zon in pixels. uZonKl: kleur van de zon. uStip: de stippellijn van de baan.
    "uniform float uLucht; uniform vec3 uLB; uniform vec3 uLH; uniform vec3 uLG; uniform vec4 uBoog; uniform vec4 uZonP; uniform vec3 uZonKl; uniform float uStip;",
    "uniform vec3 uOff;",
    "out vec4 uit;",
    "float hz(vec2 p){ vec3 p3 = fract(vec3(p.xyx) * 0.1031); p3 += dot(p3, p3.yzx + 33.33); return fract((p3.x + p3.y) * p3.z); }",
    "vec3 lucht(vec2 sc){",
    "  float yy = sc.y / uRes.y;",
    "  vec3 c = mix(uLB, uLH, smoothstep(0.0, 0.66, yy));",
    "  c = mix(c, uLG, smoothstep(0.58, 1.0, yy));",
    "  float PI = 3.14159265, R = uBoog.z;",
    "  vec2 q = sc - uBoog.xy; float r = length(q);",
    "  float boven = smoothstep(4.0, -6.0, q.y);",
    "  float s = 1.0 - atan(-q.y, q.x) / PI;",          // 0 links (opkomst), 1 rechts (ondergang)
    "  float dR = abs(r - R);",
    // de baan: een fijne stippellijn
    "  float stip = smoothstep(0.42, 0.3, abs(fract(s * R * PI / 14.0) - 0.5)) * (1.0 - smoothstep(0.7, 1.7, dR));",
    "  c = mix(c, vec3(1.0), stip * uStip * boven * 0.75);",
    // het spoor van de zon: helder bij de zon, uitlopend naar achteren (zoals een lange sluitertijd)
    "  float a = uZonP.x, L = max(uZonP.y, 1e-4), achter = a - s;",
    "  float spoor = step(0.0, achter) * pow(clamp(1.0 - achter / L, 0.0, 1.0), 1.6);",
    "  float dik = uZonP.w * 0.55;",
    "  float band = exp(-dR * dR / (2.0 * dik * dik));",
    "  c += uZonKl * spoor * band * boven * uZonP.z * 0.9;",
    "  c += uZonKl * spoor * exp(-dR / (dik * 5.0)) * boven * uZonP.z * 0.12;",
    // de zon zelf, met een zachte gloed en een paar stralen
    "  vec2 zp = uBoog.xy + vec2(cos(PI * (1.0 - a)), -sin(PI * (1.0 - a))) * R;",
    "  vec2 dz = sc - zp; float d = length(dz), rz = uZonP.w;",
    "  float kern = 1.0 - smoothstep(rz - 1.2, rz + 1.2, d);",
    "  float gloed = exp(-d / (rz * 2.2)) * 0.55 + exp(-d / (rz * 7.0)) * 0.22;",
    "  float hoek = atan(dz.y, dz.x);",
    "  float str = pow(0.5 + 0.5 * sin(hoek * 9.0 + 0.6), 6.0) * 0.55 + pow(0.5 + 0.5 * sin(hoek * 5.0 + 2.1), 8.0) * 0.45;",
    "  float stralen = str * exp(-d / (rz * 6.5)) * smoothstep(rz * 0.9, rz * 2.0, d) * 0.35;",
    "  c = mix(c, uZonKl, (gloed + stralen) * uZonP.z * 0.9);",
    "  c = mix(c, vec3(1.0, 0.99, 0.95), kern * uZonP.z);",
    "  c += (hz(sc) - 0.5) / 255.0;",                   // tegen banden in de verloop
    "  return c;",
    "}",
    "float sdBox(vec3 p, vec3 c, vec3 h){ vec3 q = abs(p - c) - h; return length(max(q, 0.0)) + min(max(q.x, max(q.y, q.z)), 0.0); }",
    "float wereld(vec3 p){ return min(sdBox(p, vec3(" + (LEN / 2) + ".0, " + (PH / 2) + ".0, " + (PD / 2) + ".0), vec3(" + (LEN / 2) + ".0, " + (PH / 2) + ".0, " + (PD / 2) + ".0)),",
    "  sdBox(p, vec3(" + (SW / 2) + ".0, " + (PH + STI / 2) + ".0, " + (PD / 2) + ".0), vec3(" + (SW / 2) + ".0, " + (STI / 2) + ".0, " + (PD / 2) + ".0))); }",
    "void main(){",
    "  vec2 fc = gl_FragCoord.xy, sc = vec2(fc.x, uRes.y - fc.y);",
    "  float d = length(sc - vec2(0.6, 0.22) * uRes) / (0.95 * max(uRes.x, uRes.y));",
    "  vec3 c = d < 0.55 ? mix(uC0, uC1, d / 0.55) : mix(uC1, uC2, clamp((d - 0.55) / 0.45, 0.0, 1.0));",
    "  if (uLucht > 0.5) c = lucht(sc);",
    "  vec4 nd = vec4(fc / uRes * 2.0 - 1.0, 1.0, 1.0), w = uInvVP * nd; vec3 rd = normalize(w.xyz / w.w - uEye);",
    "  float donker = 0.0;",
    "  if (rd.y < -0.001){",
    "    float t = (-48.0 - uEye.y) / rd.y; vec3 g = uEye + rd * t;",
    "    float res = 1.0, tt = 3.0;",
    "    for (int i = 0; i < 40; i++){ float h = wereld(g + uSchDir * tt - uOff); res = min(res, uSchK * h / tt); tt += clamp(h, 2.0, 30.0); if (res < 0.002 || tt > 900.0) break; }",
    "    res = clamp(res, 0.0, 1.0); res = res * res * (3.0 - 2.0 * res);",
    "    float ao = exp(-max(wereld(g + vec3(0.0, 30.0, 0.0) - uOff), 0.0) / 40.0);",
    "    donker = (1.0 - res) * 0.12 + ao * 0.13;",
    "  }",
    "  if (uDoorzicht > 0.5) uit = vec4(0.0, 0.0, 0.0, clamp(donker, 0.0, 1.0) * 0.8);",
    "  else uit = vec4(c * (1.0 - donker), 1.0);",
    "}"
  ].join("\n");

  /* ======================= De motor ======================= */
  function lin(hex) { var c = rgb(hex); return [c[0] / 255, c[1] / 255, c[2] / 255]; }   // de shader zet sRGB zelf om

  // Een materiaal voor losse dingen: kleur (sRGB), ruwheid, metaal, soort (zie de shader), doorzichtigheid
  function mat(hex, ruw, metaal, soort, a) { return { c: Array.isArray(hex) ? hex : lin(hex), r: ruw == null ? 0.5 : ruw, m: metaal || 0, id: soort || 1, a: a == null ? 1 : a }; }

  /* Bouwer: driehoeken met per punt: plek, normaal, uv (mm), raaklijn, kleur, [ruwheid, metaal, soort, alpha] */
  var STAP = 18;
  function Bouwer() { this.f = new Float32Array(STAP * 30000); this.n = 0; }
  Bouwer.prototype.leeg = function () { this.n = 0; };
  Bouwer.prototype.punt = function (P, N, uv, T, m) {
    if (this.n + STAP > this.f.length) { var g = new Float32Array(this.f.length * 2); g.set(this.f); this.f = g; }
    var f = this.f, i = this.n;
    f[i] = P[0]; f[i + 1] = P[1]; f[i + 2] = P[2]; f[i + 3] = N[0]; f[i + 4] = N[1]; f[i + 5] = N[2];
    f[i + 6] = uv[0]; f[i + 7] = uv[1]; f[i + 8] = T[0]; f[i + 9] = T[1]; f[i + 10] = T[2];
    f[i + 11] = m.c[0]; f[i + 12] = m.c[1]; f[i + 13] = m.c[2]; f[i + 14] = m.r; f[i + 15] = m.m; f[i + 16] = m.id; f[i + 17] = m.a;
    this.n += STAP;
  };
  Bouwer.prototype.drie = function (a, b, c, m) { this.punt(a.P, a.N, a.uv, a.T, m); this.punt(b.P, b.N, b.uv, b.T, m); this.punt(c.P, c.N, c.uv, c.T, m); };
  // een raster van punten [i][j] = {P, N, uv, T}: twee driehoeken per vakje
  Bouwer.prototype.raster = function (R, m) {
    for (var i = 0; i + 1 < R.length; i++) for (var j = 0; j + 1 < R[i].length; j++) {
      var a = R[i][j], b = R[i + 1][j], c = R[i + 1][j + 1], d = R[i][j + 1];
      this.drie(a, b, c, m); this.drie(a, c, d, m);
    }
  };
  function pt(P, N, uv, T) { return { P: P, N: N, uv: uv || [0, 0], T: T || [1, 0, 0] }; }
  // normalen uit het raster zelf (voor doek, tong, flap): kruisproduct van de buren
  function rasterNormalen(R, buiten) {
    for (var i = 0; i < R.length; i++) for (var j = 0; j < R[i].length; j++) {
      var a = R[Math.min(i + 1, R.length - 1)][j].P, b = R[Math.max(i - 1, 0)][j].P, c = R[i][Math.min(j + 1, R[i].length - 1)].P, d = R[i][Math.max(j - 1, 0)].P;
      var n = een(uitw(ver(a, b), ver(c, d)));
      if (buiten && inw(n, buiten) < 0) n = maal(n, -1);
      R[i][j].N = n; R[i][j].T = een(ver(a, b));
    }
    return R;
  }

  /* Vormen ------------------------------------------------------------------- */
  function assen(a) {
    var e1 = een(uitw(a, Math.abs(a[1]) < 0.9 ? [0, 1, 0] : [1, 0, 0])), e2 = uitw(a, e1);
    return [e1, e2];
  }
  // Cilinder van A naar B met straal r, afgeronde randen. o: {kap: false, kapM, bev, seg, hoek (draaiing van de uv)}
  function cil(Bw, A, B, r, m, o) {
    o = o || {};
    var as = ver(B, A), L = lengteV(as); if (L < 1e-4 || r <= 0) return;
    var a = maal(as, 1 / L), e = assen(a), e1 = e[0], e2 = e[1];
    var bev = Math.min(o.bev != null ? o.bev : Math.min(1.4, r * 0.3), L * 0.45, r * 0.9), seg = o.seg || 30, hk = o.hoek || 0;
    function P(rad, z, h) { var c = Math.cos(h), s = Math.sin(h); return som(som(A, maal(a, z)), som(maal(e1, c * rad), maal(e2, s * rad))); }
    function Nn(nr, na, h) { var c = Math.cos(h), s = Math.sin(h); return een(som(maal(a, na), som(maal(e1, c * nr), maal(e2, s * nr)))); }
    // mantel met afgeronde randen
    var prof = [], k;
    for (k = 0; k <= 3; k++) { var q = (1 - k / 3) * Math.PI / 2; prof.push([r - bev + bev * Math.cos(q), bev - bev * Math.sin(q), Math.cos(q), -Math.sin(q)]); }
    for (k = 0; k <= 3; k++) { q = k / 3 * Math.PI / 2; prof.push([r - bev + bev * Math.cos(q), L - bev + bev * Math.sin(q), Math.cos(q), Math.sin(q)]); }
    var R = [];
    for (var i = 0; i <= seg; i++) {
      var h = i / seg * Math.PI * 2, rij = [];
      for (k = 0; k < prof.length; k++) rij.push(pt(P(prof[k][0], prof[k][1], h), Nn(prof[k][2], prof[k][3], h), [(h + hk) * r, prof[k][1]], a));
      R.push(rij);
    }
    Bw.raster(R, m);
    if (o.kap === false) return;
    // de kopse kanten: platte schijven
    [[0, -1], [L, 1]].forEach(function (z) {
      var Rk = [];
      for (var i = 0; i <= seg; i++) {
        var h = i / seg * Math.PI * 2, rij = [];
        for (var j = 0; j <= 4; j++) {
          var rad = (r - bev) * j / 4, c = Math.cos(h), s = Math.sin(h);
          rij.push(pt(P(rad, z[0], h), maal(a, z[1]), [Math.cos(h + hk * z[1]) * rad, Math.sin(h + hk * z[1]) * rad], e1));
        }
        Rk.push(rij);
      }
      Bw.raster(Rk, o.kapM || m);
    });
  }
  // Een blok met afgeronde randen: hoek o, randen X, Y, Z (ongeveer haaks op elkaar)
  function kist(Bw, o, X, Y, Z, m, bev) {
    var lx = lengteV(X), ly = lengteV(Y), lz = lengteV(Z); if (lx < 1e-4 || ly < 1e-4 || lz < 1e-4) return;
    var ex = maal(X, 1 / lx), ey = maal(Y, 1 / ly), ez = maal(Z, 1 / lz);
    var h = [lx / 2, ly / 2, lz / 2];
    bev = Math.min(bev == null ? 1.2 : bev, h[0] * 0.95, h[1] * 0.95, h[2] * 0.95);
    var hi = [h[0] - bev, h[1] - bev, h[2] - bev], mid = som(o, maal(som(som(X, Y), Z), 0.5));
    function ks(a) { var hh = h[a], b = bev; return [-hh, -hh + b * 0.3, -hh + b * 0.7, -hh + b, hh - b, hh - b * 0.7, hh - b * 0.3, hh]; }
    function wereld(q) { return som(mid, som(som(maal(ex, q[0]), maal(ey, q[1])), maal(ez, q[2]))); }
    for (var as = 0; as < 3; as++) for (var tk = -1; tk <= 1; tk += 2) {
      var a1 = (as + 1) % 3, a2 = (as + 2) % 3, c1 = ks(a1), c2 = ks(a2), R = [];
      for (var i = 0; i < c1.length; i++) {
        var rij = [];
        for (var j = 0; j < c2.length; j++) {
          var q = [0, 0, 0]; q[as] = tk * h[as]; q[a1] = c1[i]; q[a2] = c2[j];
          var cq = [klem(q[0], -hi[0], hi[0]), klem(q[1], -hi[1], hi[1]), klem(q[2], -hi[2], hi[2])], d = ver(q, cq), dl = lengteV(d);
          var n = dl > 1e-6 ? maal(d, 1 / dl) : [0, 0, 0]; if (dl <= 1e-6) n[as] = tk;
          var pl = som(cq, maal(n, bev));
          var nw = een(som(som(maal(ex, n[0]), maal(ey, n[1])), maal(ez, n[2])));
          var T = as === 0 ? ey : ex;
          rij.push(pt(wereld(pl), nw, [pl[a1] + h[a1], pl[a2] + h[a2]], T));
        }
        R.push(rij);
      }
      Bw.raster(R, m);
    }
  }
  // Een plat kaartje met ronde hoeken (de rakel): midden c, X = breedte, Y = hoogte (in het vlak), N = dikte
  function kaart(Bw, c, X, Y, N, w, h, dik, r, m) {
    var ex = een(X), ey = een(Y), ez = een(N), seg = 7, rand = [], i, k, hw = w / 2, hh = h / 2;
    r = Math.min(r, hw, hh);
    [[hw - r, hh - r, 0], [-hw + r, hh - r, 90], [-hw + r, -hh + r, 180], [hw - r, -hh + r, 270]].forEach(function (hk) {
      for (k = 0; k <= seg; k++) { var a = (hk[2] + k * 90 / seg) * RAD; rand.push([hk[0] + Math.cos(a) * r, hk[1] + Math.sin(a) * r, Math.cos(a), Math.sin(a)]); }
    });
    rand.push(rand[0]);
    function P(x, y, z) { return som(c, som(som(maal(ex, x), maal(ey, y)), maal(ez, z))); }
    var b = Math.min(0.9, dik * 0.3), z1 = dik / 2, R = [];
    // de rand: een klein facet boven, de zijkant, een klein facet onder
    var lagen = [[-b, z1, 0.7], [0, z1 - b, 0], [0, -z1 + b, 0], [-b, -z1, -0.7]];
    for (i = 0; i < rand.length; i++) {
      var q = rand[i], rij = [];
      lagen.forEach(function (L) {
        var x = q[0] + q[2] * L[0], y = q[1] + q[3] * L[0], nr = L[2] ? 0.7 : 1;
        rij.push(pt(P(x, y, L[1]), een(som(som(maal(ex, q[2] * nr), maal(ey, q[3] * nr)), maal(ez, L[2]))), [x, y], ex));
      });
      R.push(rij);
    }
    Bw.raster(R, m);
    [[z1, 1], [-z1, -1]].forEach(function (zz) {
      var Rk = [];
      for (i = 0; i < rand.length; i++) {
        var q = rand[i], x = q[0] - q[2] * b, y = q[1] - q[3] * b;
        Rk.push([pt(P(0, 0, zz[0]), maal(ez, zz[1]), [0, 0], ex), pt(P(x, y, zz[0]), maal(ez, zz[1]), [x, y], ex)]);
      }
      Bw.raster(Rk, m);
    });
  }
  function bol(Bw, c, r, m, seg) {
    seg = seg || 10; var R = [];
    for (var i = 0; i <= seg * 2; i++) {
      var h = i / (seg * 2) * Math.PI * 2, rij = [];
      for (var j = 0; j <= seg; j++) {
        var v = j / seg * Math.PI, n = [Math.sin(v) * Math.cos(h), Math.cos(v), Math.sin(v) * Math.sin(h)];
        rij.push(pt(som(c, maal(n, r)), n, [h * r, v * r], [-Math.sin(h), 0, Math.cos(h)]));
      }
      R.push(rij);
    }
    Bw.raster(R, m);
  }

  /* Het kozijn zelf: dorpel en stijl als één doorlopend, afgerond profiel ------------------
     Per punt: plek, normaal, [u, v, deel, vlak] en de richting van u.
     vlak: 0 voorkant (met de afgeronde rand), 1 dagkant (tot het glas), 2 de rest (wit, geen folie). */
  function profielLus(breed, hoog, r, splits, indeling) {
    // afgeronde rechthoek [0,breed] x [0,hoog], tegen de klok in, met extra punten op de rechte zijden
    var hoeken = [[breed - r, r, -90], [breed - r, hoog - r, 0], [r, hoog - r, 90], [r, r, 180]], lus = [];
    for (var h = 0; h < 4; h++) {
      var hk = hoeken[h];
      for (var k = 0; k <= 6; k++) { var a = (hk[2] + k * 15) * RAD, n = [Math.cos(a), Math.sin(a)]; lus.push({ p: [hk[0] + n[0] * r, hk[1] + n[1] * r], n: n, hoek: h, k: k }); }
      var nh = hoeken[(h + 1) % 4], a1 = nh[2] * RAD, start = lus[lus.length - 1].p, eind = [nh[0] + Math.cos(a1) * r, nh[1] + Math.sin(a1) * r];
      var ns = [Math.cos((hk[2] + 90) * RAD), Math.sin((hk[2] + 90) * RAD)];
      (splits[h] || []).forEach(function (f) { lus.push({ p: [mix(start[0], eind[0], f), mix(start[1], eind[1], f)], n: ns.slice() }); });
    }
    lus.push({ p: lus[0].p.slice(), n: lus[0].n.slice() });
    var s = 0; lus[0].s = 0;
    for (var i = 1; i < lus.length; i++) { s += Math.hypot(lus[i].p[0] - lus[i - 1].p[0], lus[i].p[1] - lus[i - 1].p[1]); lus[i].s = s; }
    // elk stukje tussen twee punten hoort bij een vlak; waar het vlak wisselt, begint een nieuwe strook
    var stroken = [], cur = null;
    for (i = 0; i + 1 < lus.length; i++) {
      var A = lus[i], B = lus[i + 1], f = indeling([(A.p[0] + B.p[0]) / 2, (A.p[1] + B.p[1]) / 2], [(A.n[0] + B.n[0]) / 2, (A.n[1] + B.n[1]) / 2]);
      if (!cur || cur.f !== f) { cur = { f: f, pts: [A] }; stroken.push(cur); }
      cur.pts.push(B);
    }
    return { lus: lus, stroken: stroken };
  }
  function kozijnMesh() {
    var pos = [], nrm = [], uvw = [], tan = [], idx = [], nV = 0;
    function strook(prof, deel, uVan, uTot, stap, plek, plekN, U, vNul, om) {
      var nu = Math.ceil((uTot - uVan) / stap);
      prof.stroken.forEach(function (st) {
        var basis = nV, w = st.pts.length;
        for (var iu = 0; iu <= nu; iu++) {
          var u = Math.min(uTot, uVan + iu * stap);
          for (var k = 0; k < w; k++) {
            var q = st.pts[k], P = plek(u, q.p), N = plekN(q.n);
            pos.push(P[0], P[1], P[2]); nrm.push(N[0], N[1], N[2]);
            uvw.push(u, q.s - vNul, deel, st.f); tan.push(U[0], U[1], U[2]);
            nV++;
          }
        }
        for (iu = 0; iu < nu; iu++) for (k = 0; k + 1 < w; k++) {
          var a = basis + iu * w + k, b = a + 1, c = a + w, d = c + 1;
          if (om) idx.push(a, b, c, b, d, c); else idx.push(a, c, b, b, c, d);
        }
      });
    }
    // Dorpel: doorsnede in (z, y). Voorkant z = PD, dagkant y = PH van de voorkant tot het glas.
    var fD = (PD - RR - GZ1) / (PD - 2 * RR);
    var prD = profielLus(PD, PH, RR, [[], [fD], [], []], function (m, n) {
      if (n[0] > 0.05) return 0;                         // voorkant met de afgeronde randen
      if (n[1] > 0.7 && m[0] > GZ1) return 1;            // dagkant tot het glas
      return 2;
    });
    var v0D = prD.lus[6].s;                              // v = 0 onderaan de voorkant
    strook(prD, 0, 0, LEN, 0.5, function (u, p) { return [u, p[1], p[0]]; }, function (n) { return [0, n[1], n[0]]; }, [1, 0, 0], v0D, false);
    // Stijl: doorsnede in (x, z). Voorkant z = PD, dagkant x = SW. u = vanaf de bovenkant naar beneden.
    var fS = (GZ1 - RR) / (PD - 2 * RR);
    var prS = profielLus(SW, PD, RR, [[fS], [], [], []], function (m, n) {
      if (n[1] > 0.05) return 0;
      if (n[0] > 0.7 && m[1] > GZ1) return 1;
      return 2;
    });
    var v0S = prS.lus[7 + 1 + 6].s;                      // v = 0 rechts op de voorkant (na de hoek rechtsvoor)
    strook(prS, 1, 0, STI, 0.5, function (u, p) { return [p[0], PH + STI - u, p[1]]; }, function (n) { return [n[0], 0, n[1]]; }, [0, -1, 0], v0S, true);
    return { pos: new Float32Array(pos), nrm: new Float32Array(nrm), uvw: new Float32Array(uvw), tan: new Float32Array(tan), idx: new Uint32Array(idx) };
  }

  /* Vaste dingen rond het kozijn: zaagsneden, glas (afstandhouders, randen), rubbers ---------- */
  function vasteDingen(Bw) {
    var M_KAP = function (k) { return { c: [k, 0, 0], r: 0.6, m: 0, id: 8, a: 1 }; };
    // zaagsnede van de dorpel (x = LEN) en van de stijl (y = PH + STI); iets groter dan het profiel, voor de lagen
    var e = 8;
    function vlak(P0, A, B, k, n) {
      var R = [];
      for (var i = 0; i <= 1; i++) {
        var rij = [];
        for (var j = 0; j <= 1; j++) {
          var a = -e + i * (PD + 2 * e), b = -e + j * (70 + 2 * e);
          rij.push(pt(som(P0, som(maal(A, a), maal(B, b))), n, [a, b], A));
        }
        R.push(rij);
      }
      Bw.raster(R, M_KAP(k));
    }
    vlak([LEN + 0.02, 0, PD], [0, 0, -1], [0, 1, 0], 0, [1, 0, 0]);
    vlak([0, PH + STI + 0.02, PD], [0, 0, -1], [1, 0, 0], 1, [0, 1, 0]);
    // afstandhouders tussen de ruiten (zichtbaar door het glas) en de rubbers tegen het glas
    var alu = mat("#b7bcc0", 0.42, 0.9, 10);
    kist(Bw, [SW, PH - 2, GZ0 + 4.5], [LEN - SW, 0, 0], [0, 9, 0], [0, 0, GZ1 - GZ0 - 9], alu, 0.6);
    kist(Bw, [SW - 2, PH, GZ0 + 4.5], [9, 0, 0], [0, STI, 0], [0, 0, GZ1 - GZ0 - 9], alu, 0.6);
    var rub = mat(K.rubber, 0.55, 0, 13);
    cil(Bw, [SW + 1, PH + 1.7, GZ1 + 1.7], [LEN, PH + 1.7, GZ1 + 1.7], 1.9, rub, { seg: 12, kap: true });
    cil(Bw, [SW + 1.7, PH + 1, GZ1 + 1.7], [SW + 1.7, PH + STI, GZ1 + 1.7], 1.9, rub, { seg: 12, kap: true });
    // de randen van de twee ruiten op de zaagkanten
    var gr = mat("#cfe0dc", 0.15, 0, 11);
    [[GZ0, GZ0 + 4], [GZ1 - 4, GZ1]].forEach(function (z) {
      kist(Bw, [LEN - 0.6, PH, z[0]], [0.6, 0, 0], [0, STI, 0], [0, 0, z[1] - z[0]], gr, 0.2);
      kist(Bw, [SW, PH + STI - 0.6, z[0]], [LEN - SW, 0, 0], [0, 0.6, 0], [0, 0, z[1] - z[0]], gr, 0.2);
    });
  }
  function glasMesh(Bw) {
    var g = mat("#ffffff", 0.02, 0, 12);
    [GZ1, GZ0].forEach(function (z, i) {
      var R = [[pt([SW, PH, z], [0, 0, 1]), pt([SW, PH + STI, z], [0, 0, 1])], [pt([LEN, PH, z], [0, 0, 1]), pt([LEN, PH + STI, z], [0, 0, 1])]];
      Bw.raster(R, i ? mat("#ffffff", 0.02, 0, 12, 0.5) : g);
    });
  }

  /* WebGL opzetten ---------------------------------------------------------------- */
  var GLM = null;
  var ATTR = ["aPos", "aNrm", "aUV", "aTan", "aCol", "aPrm"];
  function maakProgramma(gl, vs, fs) {
    function sh(type, src) {
      var s = gl.createShader(type); gl.shaderSource(s, src); gl.compileShader(s);
      if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) { var log = gl.getShaderInfoLog(s); throw new Error("shader: " + log); }
      return s;
    }
    var p = gl.createProgram(); gl.attachShader(p, sh(gl.VERTEX_SHADER, vs)); gl.attachShader(p, sh(gl.FRAGMENT_SHADER, fs));
    ATTR.forEach(function (n, i) { gl.bindAttribLocation(p, i, n); });
    gl.linkProgram(p);
    if (!gl.getProgramParameter(p, gl.LINK_STATUS)) throw new Error("link: " + gl.getProgramInfoLog(p));
    var u = {}, n = gl.getProgramParameter(p, gl.ACTIVE_UNIFORMS);
    for (var i = 0; i < n; i++) { var info = gl.getActiveUniform(p, i), naam = info.name.replace(/\[0\]$/, ""); u[naam] = gl.getUniformLocation(p, info.name); }
    return { p: p, u: u };
  }
  function motorStart(schaduwMaat) {
    if (GLM) return GLM.ok ? GLM : null;
    GLM = { ok: false };
    if (typeof document === "undefined") return null;
    try {
      var cv = document.createElement("canvas"); cv.width = 16; cv.height = 16;
      var gl = cv.getContext("webgl2", { antialias: true, alpha: true, premultipliedAlpha: true, preserveDrawingBuffer: true, depth: true });
      if (!gl) return null;
      GLM.cv = cv; GLM.gl = gl;
      GLM.pK = maakProgramma(gl, VS_KOZIJN, FS_OPP);
      GLM.pD = maakProgramma(gl, VS_DING, FS_OPP);
      GLM.sK = maakProgramma(gl, VS_KOZIJN, FS_SCHADUW);
      GLM.sD = maakProgramma(gl, VS_DING, FS_SCHADUW);
      GLM.pA = maakProgramma(gl, VS_ACHTER, FS_ACHTER);
      // het kozijn
      var km = kozijnMesh();
      GLM.kVao = gl.createVertexArray(); gl.bindVertexArray(GLM.kVao);
      function attr(prog, naam, data, n) {
        var loc = ATTR.indexOf(naam);
        var b = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, b); gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW);
        gl.enableVertexAttribArray(loc); gl.vertexAttribPointer(loc, n, gl.FLOAT, false, 0, 0);
      }
      attr(GLM.pK.p, "aPos", km.pos, 3); attr(GLM.pK.p, "aNrm", km.nrm, 3); attr(GLM.pK.p, "aUV", km.uvw, 4); attr(GLM.pK.p, "aTan", km.tan, 3);
      var ib = gl.createBuffer(); gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, ib); gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, km.idx, gl.STATIC_DRAW);
      GLM.kN = km.idx.length;
      // vaste dingen en glas
      GLM.vast = maakDingBuffer(gl); var bw = new Bouwer(); vasteDingen(bw); vulDingBuffer(gl, GLM.vast, bw, gl.STATIC_DRAW);
      GLM.glas = maakDingBuffer(gl); bw.leeg(); glasMesh(bw); vulDingBuffer(gl, GLM.glas, bw, gl.STATIC_DRAW);
      GLM.dyn = maakDingBuffer(gl); GLM.dynF = maakDingBuffer(gl);
      GLM.bw = new Bouwer(); GLM.bwF = new Bouwer();
      // achtergrond: één driehoek over het hele beeld
      GLM.aVao = gl.createVertexArray(); gl.bindVertexArray(GLM.aVao);
      var ab = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, ab); gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
      gl.enableVertexAttribArray(0); gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
      gl.bindVertexArray(null);
      // schaduwkaart: diepte + hoe ondoorzichtig
      var SM = schaduwMaat || 2048;
      GLM.sm = SM;
      GLM.shD = gl.createTexture(); gl.bindTexture(gl.TEXTURE_2D, GLM.shD);
      gl.texStorage2D(gl.TEXTURE_2D, 1, gl.DEPTH_COMPONENT24, SM, SM);
      GLM.shA = gl.createTexture(); gl.bindTexture(gl.TEXTURE_2D, GLM.shA);
      gl.texStorage2D(gl.TEXTURE_2D, 1, gl.R8, SM, SM);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      GLM.shFb = gl.createFramebuffer(); gl.bindFramebuffer(gl.FRAMEBUFFER, GLM.shFb);
      gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.TEXTURE_2D, GLM.shD, 0);
      gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, GLM.shA, 0);
      if (gl.checkFramebufferStatus(gl.FRAMEBUFFER) !== gl.FRAMEBUFFER_COMPLETE) throw new Error("schaduw-fb");
      gl.bindFramebuffer(gl.FRAMEBUFFER, null);
      GLM.smpV = gl.createSampler();
      gl.samplerParameteri(GLM.smpV, gl.TEXTURE_MIN_FILTER, gl.LINEAR); gl.samplerParameteri(GLM.smpV, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
      gl.samplerParameteri(GLM.smpV, gl.TEXTURE_COMPARE_MODE, gl.COMPARE_REF_TO_TEXTURE); gl.samplerParameteri(GLM.smpV, gl.TEXTURE_COMPARE_FUNC, gl.LEQUAL);
      gl.samplerParameteri(GLM.smpV, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE); gl.samplerParameteri(GLM.smpV, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      GLM.smpR = gl.createSampler();
      gl.samplerParameteri(GLM.smpR, gl.TEXTURE_MIN_FILTER, gl.NEAREST); gl.samplerParameteri(GLM.smpR, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
      gl.samplerParameteri(GLM.smpR, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE); gl.samplerParameteri(GLM.smpR, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      cv.addEventListener("webglcontextlost", function (e) { e.preventDefault(); GLM.ok = false; GLM.verloren = true; });
      GLM.ok = true;
      return GLM;
    } catch (err) {
      if (window.console) console.error("kozijn3d:", err.message);
      GLM.ok = false; GLM.fout = err.message;
      return null;
    }
  }
  function maakDingBuffer(gl) {
    var vao = gl.createVertexArray(); gl.bindVertexArray(vao);
    var b = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, b);
    var namen = [["aPos", 3, 0], ["aNrm", 3, 3], ["aUV", 2, 6], ["aTan", 3, 8], ["aCol", 3, 11], ["aPrm", 4, 14]];
    namen.forEach(function (a) {
      var loc = ATTR.indexOf(a[0]);
      gl.enableVertexAttribArray(loc); gl.vertexAttribPointer(loc, a[1], gl.FLOAT, false, STAP * 4, a[2] * 4);
    });
    gl.bindVertexArray(null);
    return { vao: vao, b: b, n: 0, cap: 0 };
  }
  function vulDingBuffer(gl, D, bw, gebruik) {
    gl.bindBuffer(gl.ARRAY_BUFFER, D.b);
    if (bw.n > D.cap || gebruik === gl.STATIC_DRAW) { gl.bufferData(gl.ARRAY_BUFFER, bw.f.subarray(0, bw.n), gebruik || gl.DYNAMIC_DRAW); D.cap = bw.n; }
    else gl.bufferSubData(gl.ARRAY_BUFFER, 0, bw.f.subarray(0, bw.n));
    D.n = bw.n / STAP;
  }

  /* Eén beeld renderen ------------------------------------------------------------------
     sc = { cam: (van maakCamera), z: (zonesVoor), heat: [x,y,z,s], sweep: [posD, posS, sterkte, soort],
            kap: [[lijm, oud, nieuw], [..]], dingen: function(B, BF) {...}, achtergrond: "licht"|"mint"|null,
            over: true (de nieuwe laag óp de oude folie), verschuif: [x, y, z] (het hele kozijn verplaatst) }
     sc.folie.jong: de kleur van de oude folie toen hij nieuw was (standaard folie.nieuw); sc.folie.schil: hoeveel
     stukjes er loslaten als hij verweert (standaard 1). */
  var LK = een([-0.42, 0.8, 0.5]);
  // Folie in twee kleuren (sRGB 0..1). Crème is het kozijn van "zo herstellen we"; antraciet (de meest voorkomende
  // foliekleur, met houtnerf) is het kozijn van "25 jaar zon": daarop zie je het verschil tussen nieuw en verweerd het best.
  var FOLIE = {
    creme: { nieuw: [0.928, 0.9, 0.83], oud: [0.905, 0.89, 0.85], nerf: 0.0 },
    antraciet: { nieuw: [0.255, 0.272, 0.286], oud: [0.62, 0.63, 0.635], nerf: 0.065, glans: 0.72 },
    // "25 jaar zon": crème die verweert maar niet verkleurt (Max, 16 november 2026). Oud en nieuw hebben dezelfde
    // kleur; de zon neemt de glans weg en geeft barsten, krijtige randen en schilfers, nauwelijks vuil.
    cremeZon: { nieuw: [0.928, 0.9, 0.83], oud: [0.928, 0.9, 0.83], nerf: 0.04, glans: 0.66, vuil: 0.25 }
  };
  var ACHTERKLEUR = {
    licht: [lin("#ffffff"), lin(K.papier), lin("#edebe6")],
    mint: [lin("#c4e3da"), lin("#a9d2c7"), lin("#94c2b6")]
  };
  function iv2(iv) { return iv ? [Math.max(-1e5, iv[0]), Math.min(1e5, iv[1])] : [1e6, 1e6]; }
  // het getekende beeld (linksonder in het WebGL-canvas) op een gewoon canvas zetten
  function plak(ctx, cv, W, H) { ctx.drawImage(cv, 0, cv.height - H, W, H, 0, 0, W, H); }
  function renderScene(W, H, sc) {
    var G = motorStart(sc.schaduwMaat); if (!G) return null;
    var gl = G.gl, c = sc.cam;
    // Het WebGL-canvas groeit mee met het grootste beeld en wordt niet steeds opnieuw gemaakt
    // (twee animaties op één pagina): er wordt linksonder getekend, plak() haalt dat stuk eruit.
    var cw = Math.max(G.cv.width, W), ch = Math.max(G.cv.height, H);
    if (G.cv.width !== cw || G.cv.height !== ch) { G.cv.width = cw; G.cv.height = ch; }
    // dynamische dingen
    G.bw.leeg(); G.bwF.leeg();
    if (sc.dingen) sc.dingen(G.bw, G.bwF);
    vulDingBuffer(gl, G.dyn, G.bw); vulDingBuffer(gl, G.dynF, G.bwF);
    // zones naar uniforms
    var z = sc.z, za = [], zb = [], zc = [];
    for (var m = 0; m < 2; m++) {
      var pel = iv2(z.pel[m]), krab = iv2(z.krab[m]), nw = iv2(z.nieuw[m]), dk = iv2(z.doek[m]), nat = iv2(z.nat[m]), nb = m === 0 ? iv2(z.nieuwBoven) : [1e6, 1e6];
      za.push(pel[0], pel[1], krab[0], krab[1]); zb.push(nw[0], nw[1], dk[0], dk[1]); zc.push(nat[0], nat[1], nb[0], nb[1]);
    }
    var dg = z.doekG || [null, null];
    var doekG = [dg[0] ? dg[0][0] : 0, dg[0] ? dg[0][1] : 0, dg[1] ? dg[1][0] : 0, dg[1] ? dg[1][1] : 0];
    var los = [z.los || 0, z.los0 || LOS0, 0, 0];
    // lichtmatrix (schaduwkaart). sc.lk: de richting van het licht (in "25 jaar zon" de zon, die beweegt)
    var lk = sc.lk || LK, lu = sc.lucht || null;
    var Lc = [250, 175, 60], Lm = M4.mul(M4.ortho(-470, 470, -470, 470, 500, 2100), M4.kijk(som(Lc, maal(lk, 1300)), Lc, Math.abs(lk[1]) > 0.98 ? [0, 0, 1] : [0, 1, 0]));
    function zetAlg(P, schaduwPas) {
      var u = P.u;
      gl.uniform4fv(u.uZa, za); gl.uniform4fv(u.uZb, zb); gl.uniform4fv(u.uZc, zc); gl.uniform4fv(u.uLos, los);
      gl.uniform1f(u.uOver, sc.over ? 1 : 0); gl.uniform3fv(u.uOff, sc.verschuif || [0, 0, 0]);
      if (schaduwPas) return;
      gl.uniformMatrix4fv(u.uLmat, false, Lm);
      gl.uniform3fv(u.uEye, c.C); gl.uniform3fv(u.uLk, lk);
      gl.uniform1f(u.uLeeftijd, sc.leeftijd == null ? 1 : sc.leeftijd);
      gl.uniform4f(u.uZon, lk[0], lk[1], lk[2], lu ? (lu.spiegel == null ? 0.6 : lu.spiegel) : 0);
      gl.uniform3fv(u.uLuchtB, lu ? lu.boven : [0, 0, 0]); gl.uniform3fv(u.uLuchtH, lu ? lu.horizon : [0, 0, 0]);
      var fo = sc.folie || FOLIE.creme;
      gl.uniform3fv(u.uFN, fo.nieuw); gl.uniform3fv(u.uFO, fo.oud); gl.uniform3fv(u.uFJ, fo.jong || fo.nieuw); gl.uniform1f(u.uSchil, fo.schil || 1); gl.uniform1f(u.uNerf, fo.nerf); gl.uniform1f(u.uGlansF, fo.glans || 1); gl.uniform1f(u.uVuil, fo.vuil == null ? 1 : fo.vuil);
      gl.uniform3fv(u.uKey, sc.key || [4.1, 3.85, 3.5]); gl.uniform3fv(u.uHemel, sc.hemel || [0.4, 0.44, 0.5]); gl.uniform3fv(u.uVloer, sc.vloer || [0.3, 0.29, 0.27]);
      gl.uniform3fv(u.uAchter, (ACHTERKLEUR[sc.achtergrond] || ACHTERKLEUR.licht)[1]);
      gl.uniform1f(u.uBel, sc.belichting || 0.94);
      gl.uniform3f(u.uShInfo, sc.schaduw === false ? 0 : 1, 1 / G.sm, 0.06 * 1600 / (940 / G.sm));
      gl.uniform4fv(u.uHeat, sc.heat || [0, 0, 0, 0]); gl.uniform4fv(u.uDoekG, doekG); gl.uniform4fv(u.uSweep, sc.sweep || [0, 0, 0, 0]);
      var kp = sc.kap || [[0, 0, 0], [0, 0, 0]];
      gl.uniform4fv(u.uCapL, [kp[0][0], kp[0][1], kp[0][2], 0, kp[1][0], kp[1][1], kp[1][2], 0]);
      gl.uniform3fv(u.uCapA, [0, 0, -1, 0, 0, -1]); gl.uniform3fv(u.uCapB, [0, 1, 0, 1, 0, 0]); gl.uniform3fv(u.uCapI, [-1, 0, 0, 0, -1, 0]);
      gl.uniform1i(u.uSh, 0); gl.uniform1i(u.uShRaw, 1); gl.uniform1i(u.uShA, 2);
    }
    gl.disable(gl.BLEND); gl.enable(gl.DEPTH_TEST); gl.depthFunc(gl.LEQUAL); gl.disable(gl.CULL_FACE);
    // 1. schaduwkaart
    if (sc.schaduw !== false) {
      gl.bindFramebuffer(gl.FRAMEBUFFER, G.shFb); gl.viewport(0, 0, G.sm, G.sm);
      gl.clearColor(1, 0, 0, 1); gl.clearDepth(1); gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
      gl.enable(gl.POLYGON_OFFSET_FILL); gl.polygonOffset(1.5, 2.0);
      gl.useProgram(G.sK.p); zetAlg(G.sK, true); gl.uniformMatrix4fv(G.sK.u.uVP, false, Lm); gl.uniform1f(G.sK.u.uSoort, 0);
      gl.bindVertexArray(G.kVao); gl.drawElements(gl.TRIANGLES, G.kN, gl.UNSIGNED_INT, 0);
      gl.useProgram(G.sD.p); zetAlg(G.sD, true); gl.uniformMatrix4fv(G.sD.u.uVP, false, Lm); gl.uniform1f(G.sD.u.uSoort, 1);
      [G.vast, G.dyn, G.dynF].forEach(function (D) { if (D.n) { gl.bindVertexArray(D.vao); gl.drawArrays(gl.TRIANGLES, 0, D.n); } });
      gl.disable(gl.POLYGON_OFFSET_FILL);
      gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    }
    gl.viewport(0, 0, W, H);
    gl.activeTexture(gl.TEXTURE0); gl.bindTexture(gl.TEXTURE_2D, G.shD); gl.bindSampler(0, G.smpV);
    gl.activeTexture(gl.TEXTURE1); gl.bindTexture(gl.TEXTURE_2D, G.shD); gl.bindSampler(1, G.smpR);
    gl.activeTexture(gl.TEXTURE2); gl.bindTexture(gl.TEXTURE_2D, G.shA); gl.bindSampler(2, G.smpR);
    gl.clearColor(0, 0, 0, 0); gl.clearDepth(1); gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    // 2. achtergrond
    var ak = ACHTERKLEUR[sc.achtergrond] || ACHTERKLEUR.licht;
    gl.depthMask(false);
    gl.useProgram(G.pA.p);
    gl.uniformMatrix4fv(G.pA.u.uInvVP, false, M4.inv(c.VP)); gl.uniform3fv(G.pA.u.uEye, c.C); gl.uniform2f(G.pA.u.uRes, W, H);
    gl.uniform3fv(G.pA.u.uC0, ak[0]); gl.uniform3fv(G.pA.u.uC1, ak[1]); gl.uniform3fv(G.pA.u.uC2, ak[2]);
    gl.uniform1f(G.pA.u.uDoorzicht, sc.achtergrond === null ? 1 : 0);
    gl.uniform3fv(G.pA.u.uSchDir, sc.lk ? een([lk[0], Math.max(lk[1], 0.12), lk[2]]) : een([-0.2, 1, 0.28])); gl.uniform1f(G.pA.u.uSchK, sc.schaduwZacht || 3.0);
    gl.uniform1f(G.pA.u.uLucht, lu ? 1 : 0); gl.uniform3fv(G.pA.u.uOff, sc.verschuif || [0, 0, 0]);
    if (lu) {
      gl.uniform3fv(G.pA.u.uLB, lu.achterBoven || lu.boven); gl.uniform3fv(G.pA.u.uLH, lu.achterHorizon || lu.horizon); gl.uniform3fv(G.pA.u.uLG, lu.grond);
      gl.uniform4fv(G.pA.u.uBoog, lu.boog); gl.uniform4fv(G.pA.u.uZonP, lu.zon); gl.uniform3fv(G.pA.u.uZonKl, lu.zonKleur); gl.uniform1f(G.pA.u.uStip, lu.stip || 0);
    }
    if (sc.achtergrond === null) { gl.enable(gl.BLEND); gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA); }
    gl.bindVertexArray(G.aVao); gl.drawArrays(gl.TRIANGLES, 0, 3);
    gl.disable(gl.BLEND); gl.depthMask(true);
    // 3. het kozijn
    gl.useProgram(G.pK.p); zetAlg(G.pK); gl.uniformMatrix4fv(G.pK.u.uVP, false, c.VP); gl.uniform1f(G.pK.u.uSoort, 0);
    gl.enable(gl.CULL_FACE); gl.cullFace(gl.BACK);
    gl.bindVertexArray(G.kVao); gl.drawElements(gl.TRIANGLES, G.kN, gl.UNSIGNED_INT, 0);
    gl.disable(gl.CULL_FACE);
    // 4. vaste en losse dingen (ondoorzichtig)
    gl.useProgram(G.pD.p); zetAlg(G.pD); gl.uniformMatrix4fv(G.pD.u.uVP, false, c.VP); gl.uniform1f(G.pD.u.uSoort, 1);
    [G.vast, G.dyn].forEach(function (D) { if (D.n) { gl.bindVertexArray(D.vao); gl.drawArrays(gl.TRIANGLES, 0, D.n); } });
    // 5. glas
    gl.enable(gl.BLEND); gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA); gl.depthMask(false);
    gl.bindVertexArray(G.glas.vao); gl.drawArrays(gl.TRIANGLES, 0, G.glas.n);
    gl.depthMask(true);
    // 6. dingen die in- of uitfaden: eerst alleen de diepte, dan de kleur (dan schemert een ding niet door zichzelf heen)
    if (G.dynF.n) {
      gl.bindVertexArray(G.dynF.vao);
      gl.disable(gl.BLEND); gl.colorMask(false, false, false, false); gl.drawArrays(gl.TRIANGLES, 0, G.dynF.n);
      gl.colorMask(true, true, true, true); gl.enable(gl.BLEND); gl.depthFunc(gl.EQUAL);
      gl.drawArrays(gl.TRIANGLES, 0, G.dynF.n);
      gl.depthFunc(gl.LEQUAL);
    }
    gl.disable(gl.BLEND);
    gl.bindVertexArray(null);
    return G.cv;
  }

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
  // f: hoe ver ze al loslaten (0 = nog vast, 1 = zoals op de voor-foto)
  function schilfers(B, z, f) {
    f = f == null ? 1 : f;
    if (f <= 0.01) return;
    SCHILFERS.forEach(function (s0) {
      var s = { F: s0.F, u: s0.u, v: s0.v, l: s0.l * (0.55 + 0.45 * f), b: s0.b, krul: s0.krul * f, draai: s0.draai };
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
    ctx.font = "600 " + fs.toFixed(1) + "px " + LETTERS;
    var breed = ctx.measureText("Kunststof profiel").width, onder = x + 30 * px + breed > c.W - 18 * px;
    x = onder ? Math.max(24 * px, c.W * 0.5 - breed * 0.2) : Math.min(x + 30 * px, c.W - breed - 18 * px);
    var y = onder ? yMax + 70 * px : -1e9;
    ctx.save(); ctx.globalAlpha *= a; ctx.textBaseline = "alphabetic";
    ankers.forEach(function (k) {
      var ly = onder ? y : Math.max(y, k[0][1] + 5 * px); y = ly + fs * 2.9;
      lijn2(ctx, [[k[0][0], k[0][1]], [x - 8 * px, ly - fs * 0.36]], kleur(K.inkt, 1, 0.5), 1.2 * px);
      ctx.fillStyle = "#fff"; ctx.beginPath(); ctx.arc(k[0][0], k[0][1], 4.6 * px, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = K.inkt; ctx.beginPath(); ctx.arc(k[0][0], k[0][1], 3.1 * px, 0, Math.PI * 2); ctx.fill();
      ctx.font = "600 " + fs.toFixed(1) + "px " + LETTERS; ctx.fillStyle = K.inkt; ctx.fillText(k[1], x, ly);
      ctx.font = (fs * 0.84).toFixed(1) + "px " + LETTERS; ctx.fillStyle = K.sub; ctx.fillText(k[2], x, ly + fs * 1.2);
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
      ctx.save(); ctx.globalAlpha = a; ctx.font = "600 " + fs.toFixed(1) + "px " + LETTERS;
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
      ctx.font = "600 " + (24 * s).toFixed(1) + "px " + LETTERS;
      var w = ctx.measureText(sp.naam).width + 92 * s, h = 58 * s, y = y0 + k * (h + 12 * s);
      ctx.fillStyle = "rgba(34,38,42,0.08)"; rond(ctx, x0, y + 6 * s, w, h, h / 2); ctx.fill();
      ctx.fillStyle = nu ? K.mintDiep : "#fff"; rond(ctx, x0, y, w, h, h / 2); ctx.fill();
      ctx.fillStyle = nu ? "#fff" : (klaar ? K.mintDiep : "#dbece7"); ctx.beginPath(); ctx.arc(x0 + 30 * s, y + h / 2, 17 * s, 0, Math.PI * 2); ctx.fill();
      if (klaar) { ctx.strokeStyle = "#fff"; ctx.lineWidth = 3.6 * s; ctx.lineCap = "round"; ctx.beginPath(); ctx.moveTo(x0 + 22 * s, y + h / 2); ctx.lineTo(x0 + 28 * s, y + h / 2 + 6 * s); ctx.lineTo(x0 + 38 * s, y + h / 2 - 6 * s); ctx.stroke(); }
      else { ctx.fillStyle = K.mintDiep; ctx.font = "700 " + (20 * s).toFixed(1) + "px " + LETTERS; ctx.textAlign = "center"; ctx.textBaseline = "middle"; ctx.fillText(String(sp.nr), x0 + 30 * s, y + h / 2 + 1); ctx.textAlign = "start"; }
      ctx.fillStyle = nu ? "#fff" : K.inkt; ctx.globalAlpha = a * (nu || klaar ? 1 : 0.62);
      ctx.font = "600 " + (24 * s).toFixed(1) + "px " + LETTERS; ctx.textBaseline = "middle"; ctx.fillText(sp.naam, x0 + 60 * s, y + h / 2 + 1);
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
  // Twee verhalen op één pagina ("zo herstellen we" en "25 jaar zon") gebruiken dezelfde motor met elk een eigen
  // tijdlijn: wie tekent, zet eerst zijn eigen tijdlijn neer.
  var STANDAARD = { T: T, BEW: BEW, CAM: CAM };
  function gebruik(v) { T = v.T; BEW = v.BEW; CAM = v.CAM; }
  function teken(ctx, t, W, H, opties) {
    opties = opties || {};
    gebruik(STANDAARD);
    t = klem(t, 0, DUUR);
    var st = staat(t), c = maakCamera(camVoor(t), W, H), z = zonesVoor(st), boven = [];
    var sc = {
      cam: c, z: z, schaduwMaat: opties.schaduwMaat || 2048,
      achtergrond: opties.achtergrond === false ? null : (opties.variant === "mint" ? "mint" : "licht"),
      kap: [kapLaag(z, 0, LEN), kapLaag(z, 1, 0)]
    };
    // Buiten, net als de hero en de werkwijzefilm: blauwe lucht, de zon linksboven, crème folie die
    // verweert maar niet verkleurt. (opties.buiten = false: de oude lichte studio.)
    if (opties.buiten !== false && opties.achtergrond !== false && opties.variant !== "mint") {
      var LB = zonLicht(0, W, H, 1, { s: 0.3 }); LB.lucht.stip = 0;
      sc.lk = LB.lk; sc.key = LB.key; sc.hemel = LB.hemel; sc.vloer = LB.vloer; sc.lucht = LB.lucht;
      sc.folie = FOLIE.cremeZon; sc.schaduwZacht = 5.0; sc.belichting = 0.92;
    }
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

  /* ======================= 25 jaar zon (de hero op de homepage) =======================
     Hetzelfde kozijn, een ander verhaal. Het kozijn is nieuw: zijdeglans, strak. Dan gaat de
     zon erover, dag na dag, steeds sneller: 25 jaar in een paar seconden. De folie verliest
     eerst zijn glans, verbleekt, wordt krijtig, en pas in de laatste jaren komen de barsten
     en de randen die loslaten. Daarna herstellen we hem met de drie vaste stappen, en schijnt
     de zon weer op een kozijn dat eruitziet als nieuw.

     - De zon loopt over een boog boven het kozijn (de zonnebaan, getekend in de achtergrond)
       en het licht in 3D komt van diezelfde plek: de schaduwen draaien mee, zoals bij een
       zonnewijzer, en de zon spiegelt in de nieuwe folie.
     - Als de jaren snel gaan, trekt de zon een spoor (zoals op een foto met een lange
       sluitertijd) en schommelt het licht op het kozijn steeds minder: dan knippert er niets.
     - De teller (jaren), de ondertitel en de drie knoppen zijn HTML; dat doet de speler.
     Alles hangt weer af van één getal, de tijd: tekenZon(ctx, t, W, H, opties). */
  var ZDUUR = 18.6;
  var ZR = 9.1;               // vanaf hier herstellen we
  var ZT = {
    los: [900, 901],
    pel: [ZR + 0.3, ZR + 1.8], pelS: [ZR + 1.75, ZR + 2.45],
    krabS: [ZR + 2.6, ZR + 3.1], krab: [ZR + 3.05, ZR + 4.05],
    doek: [ZR + 4.2, ZR + 4.85], doekS: [ZR + 4.8, ZR + 5.25],
    vetvrij: [ZR + 5.25, ZR + 5.7],
    nieuw: [ZR + 5.8, ZR + 7.2], nieuwS: [ZR + 7.15, ZR + 7.85],
    glans: [ZR + 7.95, ZR + 9.0]
  };
  // De zon: Y = hoeveel boogjes (jaren) er voorbij zijn. Het eerste jaar rustig, dan steeds sneller,
  // en aan het eind staat hij hoog (fel licht, dan zie je de schade het best).
  var Z_JAAR1 = [0.35, 2.95], Z_SNEL = [2.95, 8.0], Z_EIND = 24.38;
  var ZSTAPPEN = [
    { nr: 1, naam: "Nieuw", van: 0, tot: 2.95 },
    { nr: 2, naam: "25 jaar zon", van: 2.95, tot: ZR },
    { nr: 3, naam: "Hersteld", van: ZR, tot: ZDUUR + 1 }
  ];
  var ZZINNEN = [
    [0.15, 2.85, "Een nieuw kozijn, met nieuwe folie."],
    [3.0, 7.7, "Elk jaar zon: de folie wordt dof, droog en broos."],
    [7.8, ZR + 0.15, "Na 25 jaar is de folie versleten. Het kozijn zelf is nog goed."],
    [ZR + 0.3, ZR + 2.5, "Toplaag eraf, met warmte."],
    [ZR + 2.6, ZR + 5.7, "Lijmresten eraf, alles vetvrij."],
    [ZR + 5.8, ZR + 7.9, "Nieuwe Renolit folie, om de rand gezet."],
    [ZR + 8.0, ZDUUR, "Weer als nieuw. Met tien jaar fabrieksgarantie op de folie."]
  ];
  var ZSTIL = [0.2, 8.6, ZDUUR];   // stilstaand beeld per knop (bij "minder beweging")

  // Camera: [t, doel x, doel y, zoom, draaiing, kanteling, afstand, hoogte van het midden in beeld (0..1)]
  var ZCAM = [
    [0.0, 236, 108, 1.12, 42, 9, 1050, 0.64],
    [1.4, 244, 112, 1.04, 40, 9, 1100, 0.65],
    [2.9, 250, 116, 1.0, 38, 10, 1150, 0.65],
    [5.6, 252, 112, 1.04, 37, 11, 1150, 0.64],
    [7.7, 268, 92, 1.2, 37, 15, 1100, 0.6],
    [8.9, 300, 66, 1.62, 40, 21, 820, 0.55],
    [ZR + 0.5, 280, 84, 1.22, 37, 18, 1020, 0.57],
    [ZR + 2.6, 240, 122, 1.08, 35, 16, 1100, 0.58],
    [ZR + 5.7, 246, 112, 1.1, 35, 16, 1100, 0.58],
    [ZR + 7.9, 240, 116, 1.08, 35, 15, 1100, 0.59],
    [ZR + 8.6, 246, 114, 1.04, 39, 10, 1120, 0.65],
    [ZDUUR, 248, 116, 1.0, 39, 9, 1150, 0.65]
  ];
  var ZON_VERHAAL = { T: ZT, BEW: BEW, CAM: ZCAM };

  function zachtStap(p) { return p * p * p * (p * (p * 6 - 15) + 10); }
  // Aantal jaren voor de zon (doorlopend). Tijdens "snel" loopt het op en af als een vliegwiel.
  function zonJaren(t) {
    if (t <= Z_JAAR1[1]) return mix(0.27, 1, t / Z_JAAR1[1]);
    // Hermite-kromme: begint op het tempo van het eerste jaar (1 boog per 2,6 s), versnelt, en komt rustig
    // tot stilstand met de zon hoog aan de hemel.
    var D = Z_SNEL[1] - Z_SNEL[0], p = fase(t, Z_SNEL[0], D), p2 = p * p, p3 = p2 * p;
    var m0 = D * 0.84 / (Z_JAAR1[1] - Z_JAAR1[0]), m1 = D * 0.22;
    return (2 * p3 - 3 * p2 + 1) * 1 + (p3 - 2 * p2 + p) * m0 + (-2 * p3 + 3 * p2) * Z_EIND + (p3 - p2) * m1;
  }
  function zonSnelheid(t) { return (zonJaren(t + 0.02) - zonJaren(t - 0.02)) / 0.04; }
  // De teller: de jaren die je ziet, 0 tot 25
  // Telt mee met de boogjes van de zon: elk boogje is een jaar, en na het laatste staat er 25.
  function tellerJaren(t) { return t >= Z_SNEL[1] ? 25 : klem(zonJaren(t) * 25 / Z_EIND, 0, 25); }

  // Waar de zon op zijn boog staat (0 links, 1 rechts) en of hij op is
  function zonStand(t) {
    var Y = zonJaren(t), v = zonSnelheid(t);
    if (t >= Z_SNEL[1]) Y = Z_EIND;
    var dag = mix(0.8, 0.94, klem((v - 1) / 4, 0, 1));            // deel van een rondje dat de zon op is
    var f = Y - Math.floor(Y);
    if (Y >= Z_EIND - 1e-6) f = Z_EIND - Math.floor(Z_EIND);
    var op = f < dag, s = op ? f / dag : 1 + (f - dag) / (1 - dag);
    // opkomen en ondergaan: de zon zakt even weg achter de horizon
    var hoogte = op ? Math.sin(Math.PI * s) : 0;
    return { s: s, op: op, hoogte: hoogte, v: v, Y: Y };
  }
  function zonRichting(s, hoogte) {
    var az = mix(-74, 74, klem(s, 0, 1)) * RAD, el = (5 + 57 * hoogte) * RAD;
    return een([Math.sin(az) * Math.cos(el), Math.sin(el), Math.cos(az) * Math.cos(el)]);
  }
  function mix3(a, b, p) { return [mix(a[0], b[0], p), mix(a[1], b[1], p), mix(a[2], b[2], p)]; }
  function hex3(h) { var c = rgb(h); return [c[0] / 255, c[1] / 255, c[2] / 255]; }
  var LUCHT = {
    hoogB: hex3("#86aecd"), hoogH: hex3("#d6e5ee"), hoogG: hex3("#eceae4"),
    laagB: hex3("#a9bdd6"), laagH: hex3("#f3cfab"), laagG: hex3("#ece0d2"),
    nachtB: hex3("#94a3b8"), nachtH: hex3("#c9c8d0"), nachtG: hex3("#dcdbdc"),
    zonHoog: hex3("#fff1cf"), zonLaag: hex3("#ffbf7e")
  };

  // Alles wat het licht betreft op tijdstip t: richting, kleuren, de lucht en de zon in de achtergrond
  // vast: { s } voor een zon die op één plek staat (de werkwijzefilm, het kozijn bij "Waarom herstellen werkt")
  function zonLicht(t, W, H, zichtbaar, vast) {
    var z = vast ? { s: vast.s, op: true, hoogte: Math.sin(Math.PI * vast.s), v: 0, Y: 5 } : zonStand(t);
    // onder de horizon: schemer. Snel: het licht schommelt nauwelijks nog (geen geknipper), de zon trekt een spoor.
    var demp = klem((z.v - 1.1) / 3.2, 0, 1) * 0.85;
    // alleen het eerste jaar een echte schemer; daarna zakt het licht nauwelijks nog (dan lijkt de folie niet van kleur te veranderen)
    var nacht = z.op ? 0 : Math.sin(Math.PI * klem(z.s - 1, 0, 1)) * (1 - demp) * (z.Y < 1.3 ? 0.42 : 0.12);
    var h = mix(z.hoogte, 0.62, demp), sEff = mix(z.s, 0.42, demp * 0.75);
    if (!z.op) { h = mix(0.05, 0.62, demp); sEff = mix(z.s > 1.5 ? 0 : 1, 0.42, demp); }
    var lk = zonRichting(sEff, h);
    var laag = (1 - klem(h * 1.6, 0, 1)) * (z.Y < 1.3 ? 1 : 0.45);
    var key = mix3([5.3, 5.0, 4.6], [4.0, 2.75, 1.8], laag);
    key = mix3(key, [1.5, 1.55, 1.8], nacht);
    var boven = mix3(mix3(LUCHT.hoogB, LUCHT.laagB, laag), LUCHT.nachtB, nacht);
    var horizon = mix3(mix3(LUCHT.hoogH, LUCHT.laagH, laag), LUCHT.nachtH, nacht);
    var grond = mix3(mix3(LUCHT.hoogG, LUCHT.laagG, laag), LUCHT.nachtG, nacht);
    function lin3(c) { return [Math.pow(c[0], 2.2), Math.pow(c[1], 2.2), Math.pow(c[2], 2.2)]; }
    var R = Math.max(W, H) * 0.74, rz = Math.max(W, H) * 0.032;
    var spoor = klem((z.v - 0.9) * 0.13, 0.0, 0.92);
    var fel = (z.op ? klem(Math.sin(Math.PI * klem(z.s, 0, 1)) * 4, 0, 1) : 0);
    fel = mix(fel, 1, demp);
    return {
      lk: lk, key: key,
      hemel: mix3([0.34, 0.39, 0.47], [0.4, 0.36, 0.34], laag * 0.6).map(function (x) { return x * (1 - 0.2 * nacht); }),
      vloer: mix3([0.25, 0.24, 0.22], [0.28, 0.23, 0.2], laag * 0.6).map(function (x) { return x * (1 - 0.2 * nacht); }),
      lucht: {
        boven: lin3(boven), horizon: lin3(horizon), spiegel: 0.7,
        achterBoven: boven, achterHorizon: horizon, grond: grond,
        boog: [W * 0.5, H * 0.86, R, 0],
        zon: [z.op || demp > 0.3 ? klem(z.s, 0, 1) : (z.s > 1.5 ? 0 : 1), spoor, fel * zichtbaar, rz],
        zonKleur: mix3(LUCHT.zonHoog, LUCHT.zonLaag, laag),
        stip: 0.55 * zichtbaar
      },
      nacht: nacht, demp: demp, s: z.s, op: z.op
    };
  }

  function camVoorZon(t) {
    return { tx: kromme(t, ZCAM, 1), ty: kromme(t, ZCAM, 2), zoom: kromme(t, ZCAM, 3), yaw: kromme(t, ZCAM, 4), pitch: kromme(t, ZCAM, 5), D: kromme(t, ZCAM, 6), cyF: kromme(t, ZCAM, 7) };
  }
  // Hoe oud de folie eruitziet (0 nieuw, 1 versleten): volgt de teller, met de schade naar het eind toe
  function leeftijdOp(t) { return Math.pow(tellerJaren(t) / 25, 1.15); }

  // Zonlicht dat op het kozijn valt: dunne warme strepen van de zon naar de folie, met een klein lichtje
  // waar ze landen. Het eerste jaar een paar, als de jaren snel gaan veel: zo zie je de zon erop inwerken.
  function zonlicht(ctx, c, t, L, zicht) {
    if (zicht < 0.05 || t > ZR) return;
    var lu = L.lucht, a0 = lu.zon[0], sterk = lu.zon[2];
    if (sterk < 0.05) return;
    var R = lu.boog[2], zx = lu.boog[0] + Math.cos(Math.PI * (1 - a0)) * R, zy = lu.boog[1] - Math.sin(Math.PI * (1 - a0)) * R;
    var kl0 = lu.zonKleur; lu = { zon: lu.zon, zonKleur: [kl0[0], kl0[1] * 0.86, kl0[2] * 0.55], boog: lu.boog };
    var snel = klem((zonSnelheid(t) - 0.5) / 5, 0, 1), dichtheid = mix(3, 16, snel), duur = 0.62;
    var eind = Math.min(t, Z_SNEL[1] + 0.2), n0 = Math.floor((t - duur) * 40), n1 = Math.floor(eind * 40);
    var kl = lu.zonKleur, rgbS = (kl[0] * 255 | 0) + "," + (kl[1] * 255 | 0) + "," + (kl[2] * 255 | 0);
    ctx.save(); ctx.globalCompositeOperation = "lighter"; ctx.lineCap = "round";
    for (var n = Math.max(0, n0); n <= n1; n++) {
      var r = rng(n * 7919 + 13), tn = n / 40;
      if (r() * 40 > dichtheid) continue;                      // niet elk slot krijgt een straal
      var age = (t - tn) / duur; if (age < 0 || age > 1) continue;
      // waar hij landt: ergens op de voorkant van de dorpel of de stijl
      var opStijl = r() < 0.32, P = opStijl ? FSVOOR.w(r() * STI, 8 + r() * (SW - 16), DO + DL) : FVOOR.w(SW + r() * (LEN - SW - 10), 8 + r() * (PH - 14), DO + DL);
      var p = c.q(P), dx = p[0] - zx, dy = p[1] - zy;
      var kop = E.in_(klem(age / 0.8, 0, 1)), staart = E.in_(klem((age - 0.12) / 0.8, 0, 1));
      var x1 = zx + dx * kop, y1 = zy + dy * kop, x0 = zx + dx * staart, y0 = zy + dy * staart;
      var a = 0.5 * sterk * zicht * (1 - klem((age - 0.8) / 0.2, 0, 1));
      // een zachte gloed en een smalle kern: een straaltje licht, geen kras
      [[c.S * 5, 0.22], [c.S * 1.5, 0.8]].forEach(function (laag) {
        var g = ctx.createLinearGradient(x0, y0, x1, y1);
        g.addColorStop(0, "rgba(" + rgbS + ",0)"); g.addColorStop(1, "rgba(" + rgbS + "," + (a * laag[1]).toFixed(3) + ")");
        ctx.strokeStyle = g; ctx.lineWidth = Math.max(1, laag[0]); ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(x1, y1); ctx.stroke();
      });
      if (age > 0.78) {                                         // het lichtje waar hij landt
        var f = Math.sin(Math.PI * klem((age - 0.78) / 0.22, 0, 1)), rr = c.S * (3 + 5 * f);
        var gl = ctx.createRadialGradient(p[0], p[1], 0, p[0], p[1], rr);
        gl.addColorStop(0, "rgba(" + rgbS + "," + (0.7 * f * sterk * zicht).toFixed(3) + ")"); gl.addColorStop(1, "rgba(" + rgbS + ",0)");
        ctx.fillStyle = gl; ctx.beginPath(); ctx.arc(p[0], p[1], rr, 0, Math.PI * 2); ctx.fill();
      }
    }
    ctx.restore();
  }

  function tekenZon(ctx, t, W, H, opties) {
    opties = opties || {};
    gebruik(ZON_VERHAAL);
    t = klem(t, 0, ZDUUR);
    var st = staat(t), c = maakCamera(camVoorZon(t), W, H), z = zonesVoor(st), boven = [];
    // de zonnebaan is te zien zolang we niet dichtbij zitten
    var zicht = 1 - klem((camVoorZon(t).zoom - 1.14) / 0.2, 0, 1);
    // opties.leeftijd: een vaste leeftijd (voor losse beelden, zoals de voor/na op kozijnwrap.nl)
    var L = zonLicht(t, W, H, zicht), a = opties.leeftijd != null ? opties.leeftijd : leeftijdOp(t);
    var sc = {
      cam: c, z: z, schaduwMaat: opties.schaduwMaat || 2048, achtergrond: "licht",
      lk: L.lk, key: L.key, hemel: L.hemel, vloer: L.vloer, lucht: L.lucht, leeftijd: a, schaduwZacht: 5.0,
      folie: FOLIE[opties.kleur || "cremeZon"],
      belichting: 0.92,
      kap: [kapLaag(z, 0, LEN), kapLaag(z, 1, 0)]
    };
    if (st.vetvrij > 0 && st.vetvrij < 1) {
      var vv = E.zacht(st.vetvrij); sc.sweep = [mix(-80, LEN + 160, vv), mix(-80, STI + 160, vv), Math.sin(Math.PI * st.vetvrij) * 1.1, 1];
    }
    if (st.glans > 0 && st.glans < 1) {
      var gv = E.zacht(st.glans); sc.sweep = [mix(-90, LEN + 200, gv), mix(-90, STI + 200, gv), Math.sin(Math.PI * st.glans) * 0.55, 0];
    }
    sc.dingen = function (B, BF) {
      schilfers(B, z, fase(a, 0.8, 0.2));
      omzetten(B, st);
      gereedschap(B, BF, sc, st, t, boven);
    };
    var cv = renderScene(W, H, sc);
    if (!cv) return false;
    ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0);
    plak(ctx, cv, W, H);
    zonlicht(ctx, c, t, L, zicht);
    boven.forEach(function (f) { f(ctx, c); });
    // klaar: vonkjes op de nieuwe folie, waar de zon in spiegelt
    [[150, 0.6, FVOOR, PH], [360, 0.35, FVOOR, PH], [80, 0.5, FSVOOR, SW]].forEach(function (v, k) {
      var f = fase(t, ZT.glans[0] + 0.35 + k * 0.2, 0.8), zz = Math.sin(Math.PI * f);
      if (zz <= 0.01) return;
      var p = c.q(v[2].w(v[0], v[3] * v[1], DN));
      vonk(ctx, p[0], p[1], zz * 1.7 * c.S * 0.5, zz);
    });
    ctx.restore();
    if (opties.video) zonVideoTekst(ctx, t, W, H);
    return true;
  }

  /* Alleen voor proefbeelden en video: de teller en de ondertitel in beeld (op de site doet de HTML dat) */
  function zonVideoTekst(ctx, t, W, H) {
    var s = Math.min(W, H) / 1000, j = Math.floor(tellerJaren(t) + 1e-6);
    ctx.save();
    ctx.font = "700 " + (64 * s).toFixed(1) + "px " + LETTERS; ctx.fillStyle = K.inkt; ctx.textBaseline = "alphabetic";
    var tekst = t < ZR ? String(j) : "", x = 48 * s, y = 104 * s;
    if (tekst) {
      ctx.fillText(tekst, x, y);
      var bw = ctx.measureText(tekst).width;
      ctx.font = "600 " + (22 * s).toFixed(1) + "px " + LETTERS; ctx.fillStyle = K.sub;
      ctx.fillText(j === 1 ? "jaar" : "jaar", x + bw + 10 * s, y - 4 * s);
    }
    var zin = null; ZZINNEN.forEach(function (r) { if (t >= r[0] && t < r[1] + 0.3) zin = r[2]; });
    if (zin) {
      ctx.font = "600 " + (26 * s).toFixed(1) + "px " + LETTERS;
      var w = ctx.measureText(zin).width + 70 * s, hh = 58 * s, xx = (W - w) / 2, yy = H - hh - 30 * s;
      ctx.fillStyle = "rgba(255,255,255,0.92)"; rond(ctx, xx, yy, w, hh, hh / 2); ctx.fill();
      ctx.fillStyle = K.inkt; ctx.textBaseline = "middle"; ctx.fillText(zin, xx + 35 * s, yy + hh / 2 + 1);
    }
    ctx.restore();
  }

  /* Op de site: <figure class="kozijn-3d k3d-zon" data-kozijn-zon> met een canvas, een poster (de foto van het
     beginbeeld, tot het script tekent), de teller (.kz-jaar), een ondertitel (.k3d-zin), "Opnieuw" en drie
     knoppen [data-stap]: Nieuw, 25 jaar zon, Hersteld. Speelt één keer zodra hij in beeld is en blijft dan op
     het herstelde kozijn staan. Wie "minder beweging" aan heeft, ziet het herstelde kozijn; de knoppen laten
     dan een stilstaand beeld zien. Zonder WebGL2 blijft de poster staan. */
  function zonSpeler(fig) {
    var doek = fig.querySelector("canvas");
    if (!doek || !doek.getContext || fig.iwrapSpeel) return;
    if (!motorStart(1536)) { fig.classList.add("k3d-geen-webgl"); return; }
    var ctx = doek.getContext("2d");
    var zinEl = fig.querySelector(".k3d-zin"), opnieuw = fig.querySelector(".k3d-opnieuw");
    var jaarEl = fig.querySelector(".kz-jaar"), teller = fig.querySelector(".kz-teller");
    var knoppen = Array.prototype.slice.call(fig.querySelectorAll("[data-stap]"));
    var rustig = !!(window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches);
    var t = rustig ? ZDUUR : 0, stilStap = 0, speelt = false, raf = 0, vorig = 0, W = 0, H = 0, gestart = false;
    var duurGem = 8, traag = false, overslaan = false, getekend = 0, jaarNu = -1;

    function maat() {
      var r = doek.getBoundingClientRect();
      if (!r.width || !r.height) return;
      var dpr = Math.min(1.5, window.devicePixelRatio || 1);
      var w = Math.round(r.width * dpr), h = Math.round(r.height * dpr);
      if (w !== W || h !== H) { W = doek.width = w; H = doek.height = h; }
      beeld();
    }
    function beeld() {
      if (!W) return;
      var a = window.performance ? performance.now() : 0;
      if (tekenZon(ctx, t, W, H, { schaduwMaat: 1536 })) {
        if (!getekend++) fig.classList.add("k3d-getekend");
      }
      if (a) duurGem = duurGem * 0.92 + (performance.now() - a) * 0.08;
      stand();
    }
    function stand() {
      var z = "";
      if (rustig) z = stilStap ? ZZINNEN[[0, 2, 6][stilStap - 1]][2] : "";
      else ZZINNEN.forEach(function (r) { if (t >= r[0] && t < r[1] + 0.3) z = r[2]; });
      if (zinEl && zinEl.getAttribute("data-zin") !== z) {
        zinEl.setAttribute("data-zin", z);
        if (z) zinEl.textContent = z;
        zinEl.classList.toggle("is-leeg", !z);
      }
      var j = Math.floor(tellerJaren(t) + 1e-6);
      if (jaarEl && j !== jaarNu) { jaarNu = j; jaarEl.textContent = String(j); }
      if (teller) teller.classList.toggle("is-weg", t >= ZR - 0.1 || (rustig && stilStap !== 2));
      knoppen.forEach(function (k) {
        var i = +k.getAttribute("data-stap"), sp = ZSTAPPEN[i - 1];
        var nu = rustig ? stilStap === i || (!stilStap && i === 3) : (t >= sp.van && t < sp.tot), klaar = !rustig && t >= sp.tot;
        k.classList.toggle("is-nu", nu);
        k.classList.toggle("is-klaar", klaar && !nu);
        if (nu) k.setAttribute("aria-current", "step"); else k.removeAttribute("aria-current");
      });
      if (opnieuw) opnieuw.hidden = rustig || speelt || t < ZDUUR - 0.01;
      fig.classList.toggle("k3d-speelt", speelt);
    }
    function lus(nu) {
      if (!speelt) return;
      raf = requestAnimationFrame(lus);
      if (traag && (overslaan = !overslaan)) return;          // gelijkmatig 30 beelden per seconde
      var dt = (nu - vorig) / 1000; vorig = nu;
      if (dt > 0.25 || dt < 0) dt = 1 / 60;
      t = Math.min(ZDUUR, t + dt);
      beeld();
      if (duurGem > 11) traag = true;
      if (t >= ZDUUR) { speelt = false; cancelAnimationFrame(raf); stand(); }
    }
    function speel(van) {
      gestart = true;
      if (rustig) return;
      t = van || 0; speelt = true;
      cancelAnimationFrame(raf); vorig = performance.now(); raf = requestAnimationFrame(lus);
    }
    function pauze() { speelt = false; cancelAnimationFrame(raf); stand(); }
    function verder() { if (!speelt && gestart && t < ZDUUR) { speelt = true; vorig = performance.now(); raf = requestAnimationFrame(lus); } }

    knoppen.forEach(function (k) {
      k.addEventListener("click", function () {
        var i = +k.getAttribute("data-stap");
        if (rustig) { stilStap = stilStap === i ? 0 : i; t = stilStap ? ZSTIL[i - 1] : ZDUUR; beeld(); return; }
        speel(Math.max(0, ZSTAPPEN[i - 1].van - (i > 1 ? 0.15 : 0)));
      });
    });
    if (opnieuw) opnieuw.addEventListener("click", function () { speel(0); });
    fig.iwrapSpeel = function () { if (rustig) { stilStap = 0; t = ZDUUR; beeld(); } else speel(0); };

    if (window.ResizeObserver) new ResizeObserver(maat).observe(doek); else window.addEventListener("resize", maat);
    maat();
    if (rustig) return;
    if (window.IntersectionObserver) {
      new IntersectionObserver(function (es) {
        es.forEach(function (e) {
          var inBeeld = e.isIntersecting && e.intersectionRatio >= 0.35;
          if (inBeeld && !gestart) speel(0);
          else if (inBeeld) verder();
          else if (speelt) pauze();
        });
      }, { threshold: [0, 0.35, 0.6] }).observe(fig);
    } else speel(0);
  }

  /* ======================= De werkwijzefilm (homepage en /werkwijze) =======================
     Sinds 19 november 2026 draait de film om de aanvraag: dat is wat iwrap.nl van een bezoeker
     vraagt, en de drie herstelstappen stonden al op zeven andere plekken (de review van de drie
     sites, akkoord van Max). Hetzelfde crème kozijn en dezelfde lucht als de rest van de site.
     - Zo begint het (0-2,6): het verweerde kozijn van dichtbij: dezelfde kleur als nieuw, maar dof,
       gebarsten en loslatend. Twee ringen wijzen de schade aan.
     - Foto (2,6-6,2): een telefoon fotografeert het HELE kozijn in de gevel, zoals het formulier vraagt.
     - Aanstrepen (6,2-10): een vinger streept aan wat er moet gebeuren, zoals op het streepscherm van
       het formulier: geel voor het kozijn (de onderdorpel en de linkerstijl), rood voor het draairaam.
       Dan versturen.
     - Vaste prijs (10-13,4): de offerte met dezelfde foto, de werkzaamheden en één totaalprijs.
     - Afspraak (13,4-16): de dag, wie er komt en het mint busje.
     - Het werk (16-19), in één kort shot: de oude folie eraf met warmte, een zachte overgang (daarin
       gaan de lijmresten eraf en wordt alles vetvrij), en de nieuwe folie erop met de rakel.
     - Klaar (19-20,2): glans over de nieuwe folie; daarna de eindkaart (HTML).
     De teksten links staan als HTML in src/film.html; js/film.js speelt de film af en laat ze op de
     tijden in WBLOKKEN zien. tekenWerkwijze(ctx, t, W, H, opties) tekent één beeld. */
  var WDUUR = 22;
  var WBLOKKEN = [0, 2.6, 6.2, 10.0, 13.4, 16.0, 19.0, 20.2];
  var WR = 16.0;
  // De zachte overgang in het werk: [begin, erin, vol, eruit]. Daarbinnen zijn krabben, schoonmaken en
  // ontvetten in een oogwenk klaar, zodat het werk kort blijft en toch klopt.
  var WDIP = [WR + 1.44, 0.2, 0.08, 0.28];
  var WT = {
    los: [900, 901],
    pel: [WR + 0.1, WR + 1.05], pelS: [WR + 1.0, WR + 1.4],
    krabS: [WR + 1.64, WR + 1.655], krab: [WR + 1.655, WR + 1.67],
    doek: [WR + 1.67, WR + 1.685], doekS: [WR + 1.685, WR + 1.7],
    vetvrij: [WR + 1.7, WR + 1.71],
    nieuw: [WR + 2.0, WR + 2.8], nieuwS: [WR + 2.75, WR + 3.1],
    glans: [WR + 3.25, WR + 4.05]
  };
  // De kaarten en de telefoon (2D, over het 3D-beeld)
  var WK = {
    ring: [0.9, 1.2], ringUit: 2.35,
    waasIn: 2.6, waasUit: 15.7,
    telIn: 2.7, telUit: 10.02,
    richt: 3.3, flits: 4.45,
    streepIn: 6.1,
    vinger: [6.3, 9.95],
    geelDorpel: [6.6, 7.35], geelStijl: [7.4, 7.95],
    tikRood: 8.2, rood: [8.45, 9.3],
    tikStuur: 9.5, verstuurd: 9.62,
    offIn: 10.38, offUit: 13.2,
    affIn: 13.4, affUit: 15.65
  };
  // De folie van deze film: crème die verweert maar niet verkleurt (FOLIE.cremeZon), met wat meer stukjes
  // die loslaten, zodat "voor" ook op een telefoon duidelijk anders is dan "na".
  var WFOLIE = { nieuw: FOLIE.cremeZon.nieuw, oud: FOLIE.cremeZon.oud, nerf: FOLIE.cremeZon.nerf, glans: FOLIE.cremeZon.glans, vuil: 0.3, schil: 2.2 };
  // [t, doel x, doel y, zoom, draaiing, kanteling, afstand, hoogte van het midden in beeld]
  var WCAM = [
    [0.0, 336, 60, 1.78, 46, 18, 820, 0.54],
    [0.9, 318, 64, 1.66, 44, 17, 860, 0.55],
    [2.7, 252, 112, 1.02, 38, 11, 1150, 0.62],
    [9.0, 252, 112, 1.04, 36, 11, 1150, 0.62],
    [15.5, 258, 104, 1.08, 35, 12, 1140, 0.61],
    [WR + 0.45, 282, 84, 1.2, 37, 17, 1040, 0.57],
    [WR + 1.6, 262, 100, 1.14, 36, 16, 1080, 0.58],
    [WR + 2.5, 248, 112, 1.1, 35, 16, 1100, 0.58],
    [WR + 3.5, 248, 116, 1.04, 39, 10, 1120, 0.63],
    [WDUUR, 250, 118, 1.0, 39, 9, 1150, 0.64]
  ];
  var WERK_VERHAAL = { T: WT, BEW: BEW, CAM: WCAM };
  // Voor het tekenen van het gereedschap: de krabber en de doek zijn er in de overgang maar een oogwenk,
  // die laten we helemaal weg (anders schemeren ze heel even door de overgang heen).
  var WT_ZICHT = {}, WERK_ZICHT = { T: WT_ZICHT, BEW: BEW, CAM: WCAM };
  for (var wk in WT) WT_ZICHT[wk] = /^(krab|doek)/.test(wk) ? [900, 901] : WT[wk];
  function camVoorWerk(t) {
    return { tx: kromme(t, WCAM, 1), ty: kromme(t, WCAM, 2), zoom: kromme(t, WCAM, 3), yaw: kromme(t, WCAM, 4), pitch: kromme(t, WCAM, 5), D: kromme(t, WCAM, 6), cyF: kromme(t, WCAM, 7) };
  }

  /* 2D-hulpjes voor de kaarten ------------------------------------------------- */
  function schaduwKaart(ctx, x, y, w, h, r, s) {
    ctx.save(); ctx.fillStyle = "rgba(34,38,42,0.12)"; rond(ctx, x, y + 10 * s, w, h, r); ctx.fill();
    ctx.fillStyle = "rgba(34,38,42,0.06)"; rond(ctx, x - 2 * s, y + 4 * s, w + 4 * s, h + 4 * s, r + 2 * s); ctx.fill(); ctx.restore();
  }
  function vinkje(ctx, x, y, r, a) {
    if (a <= 0.01) return;
    ctx.save(); ctx.translate(x, y); ctx.scale(a, a);
    ctx.fillStyle = K.mint; ctx.beginPath(); ctx.arc(0, 0, r, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = K.inkt; ctx.lineWidth = r * 0.2; ctx.lineCap = "round"; ctx.lineJoin = "round";
    ctx.beginPath(); ctx.moveTo(-r * 0.42, 0); ctx.lineTo(-r * 0.12, r * 0.3); ctx.lineTo(r * 0.45, -r * 0.32); ctx.stroke();
    ctx.restore();
  }
  function regel(ctx, x, y, w, s) { ctx.fillStyle = "#e6e3dc"; rond(ctx, x, y, w, 11 * s, 5.5 * s); ctx.fill(); }
  function veer(p) { var c = 1.7; return 1 + (c + 1) * Math.pow(p - 1, 3) + c * Math.pow(p - 1, 2); }
  // Het mint busje van opzij, klein: voor de afspraakkaart
  function busje(ctx, x, y, s) {
    ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
    ctx.fillStyle = "rgba(34,38,42,0.12)"; ctx.beginPath(); ctx.ellipse(60, 2, 62, 5, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = K.mint; ctx.beginPath();
    ctx.moveTo(2, -10); ctx.lineTo(2, -52); ctx.quadraticCurveTo(2, -58, 8, -58); ctx.lineTo(86, -58);
    ctx.quadraticCurveTo(93, -58, 97, -52); ctx.lineTo(112, -34); ctx.quadraticCurveTo(120, -32, 120, -24); ctx.lineTo(120, -12);
    ctx.quadraticCurveTo(120, -8, 114, -8); ctx.lineTo(2, -8); ctx.closePath(); ctx.fill();
    ctx.fillStyle = K.inktZacht || "#3a4047"; ctx.beginPath(); ctx.moveTo(90, -52); ctx.lineTo(94, -52); ctx.lineTo(107, -36); ctx.lineTo(90, -36); ctx.closePath(); ctx.fill();
    ctx.fillStyle = "#ffffff"; ctx.font = "700 15px " + LETTERS; ctx.textBaseline = "middle"; ctx.fillText("iWrap", 22, -33);
    [[26, -8], [94, -8]].forEach(function (w) {
      ctx.fillStyle = K.inkt; ctx.beginPath(); ctx.arc(w[0], w[1], 10, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = "#cfd2d3"; ctx.beginPath(); ctx.arc(w[0], w[1], 4.5, 0, Math.PI * 2); ctx.fill();
    });
    ctx.restore();
  }
  // De monteur als rondje: mint shirt, donkere pet (zoals in de klusfilm)
  function monteur(ctx, x, y, r) {
    ctx.save();
    ctx.fillStyle = "#eef6f3"; ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.clip();
    ctx.fillStyle = K.mint; ctx.beginPath(); ctx.ellipse(x, y + r * 0.95, r * 0.72, r * 0.55, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = "#e9c6a5"; ctx.beginPath(); ctx.arc(x, y - r * 0.12, r * 0.33, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = K.inkt; ctx.beginPath(); ctx.arc(x, y - r * 0.22, r * 0.35, Math.PI, 0); ctx.fill();
    ctx.fillRect(x - r * 0.05, y - r * 0.26, r * 0.5, r * 0.09);
    ctx.restore();
  }
  function kalender(ctx, x, y, w, s, a) {
    var h = w * 0.92, r = 10 * s;
    ctx.fillStyle = "#ffffff"; rond(ctx, x, y, w, h, r); ctx.fill();
    ctx.strokeStyle = "#e3e1db"; ctx.lineWidth = 2 * s; rond(ctx, x, y, w, h, r); ctx.stroke();
    ctx.save(); rond(ctx, x, y, w, h, r); ctx.clip(); ctx.fillStyle = K.mint; ctx.fillRect(x, y, w, h * 0.28); ctx.restore();
    ctx.fillStyle = K.inkt; [0.3, 0.7].forEach(function (f) { rond(ctx, x + w * f - 3 * s, y - 6 * s, 6 * s, 14 * s, 3 * s); ctx.fill(); });
    // een raster van dagen, één dag mint omcirkeld (geen datum: het gaat om "je weet het vooraf")
    for (var i = 0; i < 3; i++) for (var j = 0; j < 4; j++) {
      var cx = x + w * (0.2 + j * 0.2), cy = y + h * (0.47 + i * 0.18);
      ctx.fillStyle = (i === 1 && j === 2) ? K.mintDiep : "#d9d6cf";
      ctx.beginPath(); ctx.arc(cx, cy, (i === 1 && j === 2 ? 5.5 : 3.6) * s, 0, Math.PI * 2); ctx.fill();
    }
    if (a > 0) { ctx.strokeStyle = K.mintDiep; ctx.lineWidth = 2.6 * s; ctx.beginPath(); ctx.arc(x + w * 0.6, y + h * 0.65, 11 * s, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * a); ctx.stroke(); }
  }

  /* De foto voor de aanvraag: het HELE kozijn in de gevel, recht van voren, staand (3:4, zoals een
     telefoonfoto). Een vast raam links en een draairaam rechts, crème met houtnerf, verweerd in
     dezelfde kleur. fotoMaten geeft de maten, zodat de vinger precies over de strepen gaat. */
  function fotoMaten(x, y, w, h) {
    var s = w / 300;
    var kx = x + w * 0.11, ky = y + h * 0.22, kw = w * 0.78, kh = h * 0.52, b = 15 * s, dorpel = 21 * s;
    var gy = ky + b, gh = kh - b - dorpel, gx2 = kx + kw * 0.47 + b * 0.5, gw2 = kw - (gx2 - kx) - b;
    return {
      s: s, kx: kx, ky: ky, kw: kw, kh: kh, b: b, dorpel: dorpel, gy: gy, gh: gh,
      gx1: kx + b, gw1: kw * 0.47 - b * 1.5, gx2: gx2, gw2: gw2,
      // geel: de linkerstijl naar beneden en dan langs de onderdorpel, in één streep
      geel: [[kx + b * 0.5, ky + 8 * s], [kx + b * 0.5, ky + kh - dorpel * 0.5], [kx + kw - 7 * s, ky + kh - dorpel * 0.5]],
      // rood: rondom de vleugel van het draairaam
      rood: (function () {
        var v = [gx2 + 3.5 * s, gy + 3.5 * s, gw2 - 7 * s, gh - 7 * s];
        return [[v[0], v[1] + v[3]], [v[0] + v[2], v[1] + v[3]], [v[0] + v[2], v[1]], [v[0], v[1]], [v[0], v[1] + v[3] + 1]];
      })(),
      dikte: 0.05 * Math.min(w, h)          // zo dik als op het streepscherm van het formulier
    };
  }
  // Een stuk van een gebroken lijn: de punten tot p (0 tot 1) van de hele lengte.
  function deelPad(pts, p) {
    var lens = [], tot = 0, i;
    for (i = 1; i < pts.length; i++) { var d = Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]); lens.push(d); tot += d; }
    var rest = klem(p, 0, 1) * tot, uit = [pts[0]];
    for (i = 0; i < lens.length; i++) {
      if (rest >= lens[i]) { uit.push(pts[i + 1]); rest -= lens[i]; continue; }
      var f = lens[i] ? rest / lens[i] : 0;
      uit.push([mix(pts[i][0], pts[i + 1][0], f), mix(pts[i][1], pts[i + 1][1], f)]);
      break;
    }
    return uit;
  }
  // De stiften van het formulier (js/aanstrepen.js): geel en rood met een donkere rand, half doorzichtig.
  var STIFT = { geel: "#ffd400", rood: "#e5212d", rand: "#1d1d1b", dekking: 0.62 };
  var streepDoek = null;
  function strepen(ctx, m, x, y, w, h, lijnen) {
    if (!lijnen.length || typeof document === "undefined") return;
    var W2 = Math.max(1, Math.ceil(w)), H2 = Math.max(1, Math.ceil(h));
    if (!streepDoek) streepDoek = document.createElement("canvas");
    if (streepDoek.width !== W2 || streepDoek.height !== H2) { streepDoek.width = W2; streepDoek.height = H2; }
    var c = streepDoek.getContext("2d");
    c.clearRect(0, 0, W2, H2); c.lineCap = "round"; c.lineJoin = "round";
    function pad(pts) {
      c.beginPath();
      pts.forEach(function (p, i) { if (i) c.lineTo(p[0] - x, p[1] - y); else c.moveTo(p[0] - x, p[1] - y); });
      if (pts.length === 1) c.lineTo(pts[0][0] - x + 0.1, pts[0][1] - y);
    }
    // eerst alle randen, dan de kleuren (zoals op het formulier)
    c.strokeStyle = STIFT.rand; c.lineWidth = m.dikte * 1.22;
    lijnen.forEach(function (l) { pad(l[1]); c.stroke(); });
    c.lineWidth = m.dikte;
    lijnen.forEach(function (l) { c.strokeStyle = l[0]; pad(l[1]); c.stroke(); });
    ctx.save(); ctx.globalAlpha = STIFT.dekking; ctx.drawImage(streepDoek, x, y, W2, H2); ctx.restore();
  }
  // o.geel en o.rood: hoe ver die streep is (0 tot 1)
  function kozijnFoto(ctx, x, y, w, h, o) {
    o = o || {};
    var m = fotoMaten(x, y, w, h), s = m.s, kx = m.kx, ky = m.ky, kw = m.kw, kh = m.kh;
    ctx.save(); ctx.beginPath(); ctx.rect(x, y, w, h); ctx.clip();
    // gevel van rode baksteen
    ctx.fillStyle = "#a35d47"; ctx.fillRect(x, y, w, h);
    ctx.strokeStyle = "rgba(226,214,196,0.55)"; ctx.lineWidth = 1.1 * s;
    for (var r = 0, yy = y + 6 * s; yy < y + h; yy += 12 * s, r++) {
      ctx.beginPath(); ctx.moveTo(x, yy); ctx.lineTo(x + w, yy); ctx.stroke();
      for (var xx = x + (r % 2 ? 0 : 13 * s); xx < x + w; xx += 26 * s) { ctx.beginPath(); ctx.moveTo(xx, yy - 12 * s); ctx.lineTo(xx, yy); ctx.stroke(); }
    }
    // het kozijn
    ctx.fillStyle = "#6f3c2f"; ctx.fillRect(kx - 7 * s, ky - 7 * s, kw + 14 * s, kh + 10 * s);           // de dagkant
    ctx.fillStyle = "#ebe4d0"; ctx.fillRect(kx, ky, kw, kh);
    function glas(gx, gy2, gw, gh2) {
      var g = ctx.createLinearGradient(0, gy2, 0, gy2 + gh2); g.addColorStop(0, "#b7cdd6"); g.addColorStop(1, "#7f97a1");
      ctx.fillStyle = g; ctx.fillRect(gx, gy2, gw, gh2);
      ctx.fillStyle = "rgba(255,255,255,0.28)"; ctx.beginPath(); ctx.moveTo(gx + gw * 0.18, gy2); ctx.lineTo(gx + gw * 0.42, gy2); ctx.lineTo(gx, gy2 + gh2 * 0.5); ctx.lineTo(gx, gy2 + gh2 * 0.24); ctx.closePath(); ctx.fill();
    }
    glas(m.gx1, m.gy, m.gw1, m.gh);
    ctx.strokeStyle = "#ddd5bf"; ctx.lineWidth = 7 * s; ctx.strokeRect(m.gx2 + 3.5 * s, m.gy + 3.5 * s, m.gw2 - 7 * s, m.gh - 7 * s);   // de vleugel
    glas(m.gx2 + 8 * s, m.gy + 8 * s, m.gw2 - 16 * s, m.gh - 16 * s);
    ctx.fillStyle = "#f4f2ee"; ctx.fillRect(m.gx2 + 3 * s, m.gy + m.gh * 0.45, 4 * s, 16 * s);              // de kruk
    // raamdorpel van steen onder het kozijn
    ctx.fillStyle = "#c2bcb0"; ctx.fillRect(kx - 12 * s, ky + kh + 3 * s, kw + 24 * s, 9 * s);
    ctx.fillStyle = "rgba(0,0,0,0.15)"; ctx.fillRect(kx - 10 * s, ky + kh + 12 * s, kw + 20 * s, 3 * s);
    // verweerd: fijne barstjes en een paar loszittende stukjes, in dezelfde kleur
    ctx.strokeStyle = "rgba(140,128,98,0.55)"; ctx.lineWidth = 0.9 * s;
    [[0.08, 0.93, 0.2, 0.9], [0.3, 0.95, 0.42, 0.92], [0.55, 0.94, 0.66, 0.97], [0.78, 0.92, 0.9, 0.95], [0.02, 0.3, 0.05, 0.42], [0.02, 0.6, 0.04, 0.7]].forEach(function (l) {
      ctx.beginPath(); ctx.moveTo(kx + kw * l[0], ky + kh * l[1]); ctx.lineTo(kx + kw * (l[0] + l[2]) / 2, ky + kh * (l[1] + l[3]) / 2 + 2 * s); ctx.lineTo(kx + kw * l[2], ky + kh * l[3]); ctx.stroke();
    });
    ctx.restore();
    var lijnen = [];
    if (o.geel > 0) lijnen.push([STIFT.geel, deelPad(m.geel, o.geel)]);
    if (o.rood > 0) lijnen.push([STIFT.rood, deelPad(m.rood, o.rood)]);
    strepen(ctx, m, x, y, w, h, lijnen);
    return m;
  }

  /* Kleine onderdelen van het scherm ------------------------------------------------------ */
  function tekstPas(ctx, t, x, y, px, gewicht, kleur, maxW, uitlijn) {
    ctx.font = gewicht + " " + px.toFixed(1) + "px " + LETTERS;
    if (maxW) { var b = ctx.measureText(t).width; if (b > maxW) { px *= maxW / b; ctx.font = gewicht + " " + px.toFixed(1) + "px " + LETTERS; } }
    ctx.textAlign = uitlijn || "left"; ctx.fillStyle = kleur; ctx.fillText(t, x, y); ctx.textAlign = "left";
  }
  // Een knop of label als pil; geeft de breedte terug
  function pil(ctx, t, x, y, h, px, achter, voor, rand, stip) {
    ctx.font = "600 " + px.toFixed(1) + "px " + LETTERS;
    var tw = ctx.measureText(t).width, sp = stip ? h * 0.62 : 0, w = tw + h * 0.9 + sp;
    ctx.fillStyle = achter; rond(ctx, x, y, w, h, h / 2); ctx.fill();
    if (rand) { ctx.strokeStyle = rand; ctx.lineWidth = Math.max(1, h * 0.07); rond(ctx, x, y, w, h, h / 2); ctx.stroke(); }
    if (stip) { ctx.fillStyle = stip; ctx.beginPath(); ctx.arc(x + h * 0.45 + h * 0.16, y + h / 2, h * 0.17, 0, Math.PI * 2); ctx.fill(); }
    ctx.fillStyle = voor; ctx.textBaseline = "middle"; ctx.fillText(t, x + h * 0.45 + sp, y + h / 2 + px * 0.04); ctx.textBaseline = "alphabetic";
    return w;
  }
  // De vinger die aanstreept: de top op (x, y), schuin van rechtsonder. druk 0 (in de lucht) tot 1 (op het scherm).
  function vinger(ctx, x, y, s, druk, a) {
    if (a <= 0.01) return;
    ctx.save(); ctx.globalAlpha = a; ctx.translate(x, y); ctx.rotate(-30 * RAD);
    var w = 46 * s, l = 230 * s, k = 1 - 0.04 * druk, lucht = 1 - druk;
    ctx.scale(k, k);
    ctx.fillStyle = "rgba(20,24,28," + (0.14 + 0.1 * lucht).toFixed(3) + ")";
    rond(ctx, -w / 2 + (5 + 12 * lucht) * s, (5 + 14 * lucht) * s, w, l, w / 2); ctx.fill();
    var g = ctx.createLinearGradient(-w / 2, 0, w / 2, 0);
    g.addColorStop(0, "#d6a585"); g.addColorStop(0.45, "#efc9aa"); g.addColorStop(1, "#cf9a79");
    ctx.fillStyle = g; rond(ctx, -w / 2, 0, w, l, w / 2); ctx.fill();
    ctx.fillStyle = "rgba(255,242,234,0.8)"; rond(ctx, -w * 0.3, 6 * s, w * 0.6, w * 0.66, w * 0.28); ctx.fill();
    ctx.strokeStyle = "rgba(150,96,70,0.35)"; ctx.lineWidth = 1.6 * s;
    ctx.beginPath(); ctx.moveTo(-w * 0.32, w * 1.55); ctx.quadraticCurveTo(0, w * 1.68, w * 0.32, w * 1.55); ctx.stroke();
    ctx.restore();
  }
  // Een tik: een ring die uitdijt
  function tik(ctx, x, y, s, p) {
    if (p <= 0 || p >= 1) return;
    ctx.save(); ctx.globalAlpha = 1 - p;
    ctx.strokeStyle = "#ffffff"; ctx.lineWidth = 5 * s; ctx.beginPath(); ctx.arc(x, y, (14 + 34 * p) * s, 0, Math.PI * 2); ctx.stroke();
    ctx.strokeStyle = "rgba(34,38,42,0.5)"; ctx.lineWidth = 2 * s; ctx.beginPath(); ctx.arc(x, y, (14 + 34 * p) * s + 3.5 * s, 0, Math.PI * 2); ctx.stroke();
    ctx.restore();
  }

  /* De telefoon: foto maken, aanstrepen, versturen ---------------------------------------- */
  function telefoon(ctx, t, W, H, s) {
    var tIn = E.uit(fase(t, WK.telIn, 0.55)), tUit = E.in_(fase(t, WK.telUit, 0.42));
    if (tIn <= 0 || tUit >= 1) return;
    var pw = 362 * s, ph = 744 * s, px = W * 0.5 - pw / 2, py = H * 0.5 - ph / 2 + (1 - tIn) * H * 0.85 + tUit * H * 0.95;
    var sx = px + 13 * s, sy = py + 13 * s, sw = pw - 26 * s, sh = ph - 26 * s, sr = 38 * s;
    ctx.save();
    ctx.translate(px + pw / 2, py + ph / 2); ctx.rotate(((1 - tIn) * 7 - tUit * 5) * RAD); ctx.translate(-(px + pw / 2), -(py + ph / 2));
    schaduwKaart(ctx, px, py, pw, ph, 50 * s, s);
    ctx.fillStyle = K.inkt; rond(ctx, px, py, pw, ph, 50 * s); ctx.fill();
    ctx.save(); rond(ctx, sx, sy, sw, sh, sr); ctx.clip();

    // De indeling verschuift van de camera (foto in het midden, zwart eromheen) naar het streepscherm
    // (wit, de vraag bovenin, de foto eronder, onderin de knop Versturen).
    var st = E.zacht(fase(t, WK.streepIn, 0.45));
    var fwC = sw, fhC = sw * 4 / 3, fxC = sx, fyC = sy + (sh - fhC) * 0.42;
    var fwS = sw - 24 * s, fhS = fwS * 4 / 3, fxS = sx + 12 * s, fyS = sy + 112 * s;
    var fx = mix(fxC, fxS, st), fy = mix(fyC, fyS, st), fw = mix(fwC, fwS, st), fh = mix(fhC, fhS, st);
    ctx.fillStyle = "#0e1012"; ctx.fillRect(sx, sy, sw, sh);
    if (st > 0) { ctx.fillStyle = "rgba(255,255,255," + st.toFixed(3) + ")"; ctx.fillRect(sx, sy, sw, sh); }

    // de foto: eerst live (een beetje wiebelig), na de flits staat hij stil
    var live = t < WK.flits, wb = live ? 1 : 0;
    var dx = wb * Math.sin(t * 2.1) * 3 * s, dy = wb * Math.cos(t * 1.7) * 2.5 * s;
    var pGeel = E.gelijk(fase(t, WK.geelDorpel[0], WK.geelStijl[1] - WK.geelDorpel[0]));
    var pRood = E.gelijk(fase(t, WK.rood[0], WK.rood[1] - WK.rood[0]));
    ctx.save(); rond(ctx, fx, fy, fw, fh, 10 * s * st); ctx.clip();
    var m = kozijnFoto(ctx, fx + dx, fy + dy, fw, fh, { geel: pGeel, rood: pRood });
    ctx.restore();

    // camera: kader om het hele kozijn, een hint, de sluiterknop en de flits
    var cam = 1 - st;
    if (cam > 0.01) {
      ctx.save(); ctx.globalAlpha = cam;
      var richt = E.uit(fase(t, WK.richt, 0.7)), na = fase(t, WK.flits, 0.3);
      var marge = mix(46, 10, richt) * s, kx = m.kx - marge, ky = m.ky - marge, kw = m.kw + marge * 2, kh = m.kh + marge * 2, kl = 26 * s;
      ctx.strokeStyle = "rgba(255,212,0," + (0.75 + 0.25 * Math.sin(Math.PI * richt)).toFixed(2) + ")";
      if (na > 0) ctx.strokeStyle = "rgba(255,255,255," + (0.9 * (1 - na)).toFixed(2) + ")";
      ctx.lineWidth = 4.5 * s; ctx.lineCap = "round";
      ctx.beginPath();
      ctx.moveTo(kx, ky + kl); ctx.lineTo(kx, ky); ctx.lineTo(kx + kl, ky); ctx.moveTo(kx + kw - kl, ky); ctx.lineTo(kx + kw, ky); ctx.lineTo(kx + kw, ky + kl);
      ctx.moveTo(kx + kw, ky + kh - kl); ctx.lineTo(kx + kw, ky + kh); ctx.lineTo(kx + kw - kl, ky + kh); ctx.moveTo(kx + kl, ky + kh); ctx.lineTo(kx, ky + kh); ctx.lineTo(kx, ky + kh - kl);
      ctx.stroke();
      // de hint bovenin
      var hint = fase(t, WK.richt + 0.25, 0.35) * (1 - fase(t, WK.flits + 0.2, 0.3));
      if (hint > 0.01) {
        ctx.save(); ctx.globalAlpha = cam * hint;
        ctx.font = "600 " + (19 * s).toFixed(1) + "px " + LETTERS;
        var ht = "Het hele kozijn in beeld", hw = ctx.measureText(ht).width + 38 * s;
        ctx.fillStyle = "rgba(0,0,0,0.55)"; rond(ctx, sx + sw / 2 - hw / 2, sy + 50 * s, hw, 42 * s, 21 * s); ctx.fill();
        tekstPas(ctx, ht, sx + sw / 2, sy + 78 * s, 19 * s, "600", "#ffffff", 0, "center");
        ctx.restore();
      }
      // onderin: FOTO en de sluiterknop
      var onder = fy + fh, knopY = onder + (sy + sh - onder) * 0.56, druk = Math.sin(Math.PI * fase(t, WK.flits - 0.12, 0.24));
      tekstPas(ctx, "FOTO", sx + sw / 2, onder + 26 * s, 13 * s, "700", "#ffd400", 0, "center");
      ctx.fillStyle = "#ffffff"; ctx.beginPath(); ctx.arc(sx + sw / 2, knopY, (27 - 3 * druk) * s, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = "#ffffff"; ctx.lineWidth = 3.5 * s; ctx.beginPath(); ctx.arc(sx + sw / 2, knopY, 34 * s, 0, Math.PI * 2); ctx.stroke();
      // na de foto: "Het hele kozijn" met een vinkje op de foto, zoals in het formulier
      var heel = E.uit(fase(t, WK.flits + 0.35, 0.4));
      if (heel > 0.01) {
        ctx.save(); ctx.globalAlpha = cam * heel;
        var hy = fy + fh - 50 * s;
        var bw = pil(ctx, "Het hele kozijn", sx + 18 * s + 30 * s, hy, 36 * s, 16 * s, "#ffffff", K.inkt);
        vinkje(ctx, sx + 18 * s + 30 * s - 4 * s, hy + 18 * s, 17 * s, veer(heel));
        void bw;
        ctx.restore();
      }
      var fl = t > WK.flits ? Math.exp(-(t - WK.flits) * 8) : 0;
      if (fl > 0.01) { ctx.fillStyle = "rgba(255,255,255," + fl.toFixed(3) + ")"; ctx.fillRect(sx, sy, sw, sh); }
      ctx.restore();
    }

    // het streepscherm: de vraag, de twee stiften en de knop Versturen
    var rood = t >= WK.tikRood;
    if (st > 0.01) {
      ctx.save(); ctx.globalAlpha = st;
      var kopY = sy + mix(-60, 0, st) * s;
      tekstPas(ctx, "Streep aan wat er moet gebeuren", sx + 18 * s, kopY + 50 * s, 19 * s, "700", K.inkt, sw - 36 * s);
      var cy = kopY + 64 * s, ch = 32 * s;
      var w1 = pil(ctx, "Kozijn", sx + 18 * s, cy, ch, 14.5 * s, rood ? "#f1efea" : "#ffffff", K.inkt, rood ? null : K.inkt, STIFT.geel);
      var c2x = sx + 18 * s + w1 + 10 * s;
      var w2 = pil(ctx, "Draairaam of deur", c2x, cy, ch, 14.5 * s, rood ? "#ffffff" : "#f1efea", K.inkt, rood ? K.inkt : null, STIFT.rood);
      void w2;
      // de knop Versturen
      var by = sy + sh - mix(-20, 74, st) * s, bh = 50 * s, bx = sx + 24 * s, bw2 = sw - 48 * s;
      var stuurDruk = Math.sin(Math.PI * fase(t, WK.tikStuur - 0.1, 0.22));
      ctx.fillStyle = K.mintDiep; rond(ctx, bx + 3 * s * stuurDruk, by + 2 * s * stuurDruk, bw2 - 6 * s * stuurDruk, bh - 4 * s * stuurDruk, bh / 2); ctx.fill();
      tekstPas(ctx, "Versturen", bx + bw2 / 2, by + bh / 2 + 6 * s, 18 * s, "700", "#ffffff", 0, "center");
      ctx.restore();

      // verstuurd: het scherm wordt mint, met een groot vinkje
      var vs = E.uit(fase(t, WK.verstuurd, 0.45));
      if (vs > 0.001) {
        var mx = bx + bw2 / 2, my = by + bh / 2, rr = Math.hypot(sw, sh) * 1.05 * vs;
        ctx.save(); ctx.beginPath(); ctx.arc(mx, my, rr, 0, Math.PI * 2); ctx.clip();
        ctx.fillStyle = K.mintDiep; ctx.fillRect(sx, sy, sw, sh);
        var va = fase(t, WK.verstuurd + 0.18, 0.3), vr = Math.max(0, 54 * s * veer(va)), vx = sx + sw / 2, vy = sy + sh * 0.42;
        ctx.globalAlpha = va;
        if (vr > 0.5) {
          ctx.fillStyle = "#ffffff"; ctx.beginPath(); ctx.arc(vx, vy, vr, 0, Math.PI * 2); ctx.fill();
          ctx.strokeStyle = K.mintDiep; ctx.lineWidth = 10 * s; ctx.lineCap = "round"; ctx.lineJoin = "round";
          ctx.beginPath(); ctx.moveTo(vx - vr * 0.42, vy); ctx.lineTo(vx - vr * 0.12, vy + vr * 0.3); ctx.lineTo(vx + vr * 0.45, vy - vr * 0.32); ctx.stroke();
        }
        tekstPas(ctx, "Verstuurd", sx + sw / 2, sy + sh * 0.42 + 106 * s, 30 * s, "700", "#ffffff", 0, "center");
        tekstPas(ctx, "Je hoort van ons wat het kost", sx + sw / 2, sy + sh * 0.42 + 142 * s, 16 * s, "500", "#dfe9e6", sw - 40 * s, "center");
        ctx.restore();
      }

      // de vinger: van rechtsonder naar de stijl, de streep langs, de rode stift, rond het draairaam, Versturen
      var v = WK.vinger, chip2 = [c2x + 70 * s, cy + ch / 2], stuur = [bx + bw2 * 0.62, by + bh / 2];
      var weg = [sx + sw * 1.15, sy + sh * 1.05];
      var geelKop = deelPad(m.geel, pGeel), roodKop = deelPad(m.rood, pRood);
      var gk = geelKop[geelKop.length - 1], rk = roodKop[roodKop.length - 1];
      var fp, druk2 = 0;
      function naar(a, b, p) { var e = E.zacht(klem(p, 0, 1)); return [mix(a[0], b[0], e), mix(a[1], b[1], e)]; }
      if (t < WK.geelDorpel[0]) fp = naar(weg, m.geel[0], fase(t, v[0], WK.geelDorpel[0] - v[0]));
      else if (t < WK.geelStijl[1]) { fp = gk; druk2 = 1; }
      else if (t < WK.tikRood) { fp = naar(m.geel[m.geel.length - 1], chip2, fase(t, WK.geelStijl[1] + 0.05, WK.tikRood - WK.geelStijl[1] - 0.12)); druk2 = Math.sin(Math.PI * fase(t, WK.tikRood - 0.12, 0.24)); }
      else if (t < WK.rood[0]) { fp = naar(chip2, m.rood[0], fase(t, WK.tikRood + 0.06, WK.rood[0] - WK.tikRood - 0.08)); druk2 = Math.sin(Math.PI * fase(t, WK.tikRood - 0.12, 0.24)); }
      else if (t < WK.rood[1]) { fp = rk; druk2 = 1; }
      else if (t < WK.tikStuur + 0.1) { fp = naar(m.rood[m.rood.length - 1], stuur, fase(t, WK.rood[1] + 0.03, WK.tikStuur - WK.rood[1] - 0.1)); druk2 = Math.sin(Math.PI * fase(t, WK.tikStuur - 0.1, 0.22)); }
      else fp = naar(stuur, weg, fase(t, WK.tikStuur + 0.1, v[1] - WK.tikStuur - 0.1));
      if (t > WK.geelDorpel[0] - 0.08 && t < WK.geelDorpel[0]) druk2 = fase(t, WK.geelDorpel[0] - 0.08, 0.08);
      if (t > WK.rood[0] - 0.08 && t < WK.rood[0]) druk2 = fase(t, WK.rood[0] - 0.08, 0.08);
      tik(ctx, chip2[0], chip2[1], s, fase(t, WK.tikRood, 0.45));
      tik(ctx, stuur[0], stuur[1], s, fase(t, WK.tikStuur, 0.45));
      var va2 = fase(t, v[0], 0.2) * (1 - fase(t, v[1] - 0.2, 0.2));
      vinger(ctx, fp[0], fp[1], s, druk2, va2);
    }
    ctx.restore();
    // de knop opzij en de notch
    ctx.fillStyle = K.inkt; rond(ctx, px + pw / 2 - 44 * s, py + 22 * s, 88 * s, 22 * s, 11 * s); ctx.fill();
    ctx.restore();
  }

  /* De offerte: dezelfde foto met de strepen, de werkzaamheden en één totaalprijs ------------ */
  function offerteKaart(ctx, t, W, H, s) {
    var oIn = E.uit(fase(t, WK.offIn, 0.5)), oUit = E.in_(fase(t, WK.offUit, 0.4));
    if (oIn <= 0 || oUit >= 1) return;
    var ow = 500 * s, oh = 590 * s, ox = W * 0.5 - ow / 2 + (1 - oIn) * W * 0.9 - oUit * W * 0.9, oy = H * 0.5 - oh / 2;
    schaduwKaart(ctx, ox, oy, ow, oh, 28 * s, s);
    ctx.fillStyle = "#ffffff"; rond(ctx, ox, oy, ow, oh, 28 * s); ctx.fill();
    // de foto, zoals de klant hem aanstreepte
    var fw = 156 * s, fh = fw * 4 / 3, fx = ox + 34 * s, fy = oy + 34 * s;
    ctx.save(); rond(ctx, fx, fy, fw, fh, 14 * s); ctx.clip();
    kozijnFoto(ctx, fx, fy, fw, fh, { geel: 1, rood: 1 });
    ctx.restore();
    var tx = fx + fw + 28 * s, tw = ox + ow - 34 * s - tx;
    tekstPas(ctx, "Offerte", tx, oy + 72 * s, 19 * s, "700", K.mintInkt, tw);
    tekstPas(ctx, "Vaste", tx, oy + 118 * s, 34 * s, "700", K.inkt, tw);
    tekstPas(ctx, "totaalprijs", tx, oy + 158 * s, 34 * s, "700", K.inkt, tw);
    tekstPas(ctx, "Op basis van je foto", tx, oy + 196 * s, 16 * s, "500", K.sub, tw);
    // de werkzaamheden, een voor een met een vinkje
    var regels = ["Onderdorpel en stijlen", "Draairaam rondom", "Inclusief voorrijden en materiaal"];
    regels.forEach(function (r, i) {
      var ra = fase(t, WK.offIn + 0.55 + i * 0.28, 0.3), ry = fy + fh + 54 * s + i * 50 * s;
      if (ra <= 0) return;
      ctx.save(); ctx.globalAlpha = ra;
      vinkje(ctx, ox + 50 * s, ry - 7 * s, 15 * s, veer(ra));
      tekstPas(ctx, r, ox + 78 * s, ry, 19 * s, "600", K.inkt, ow - 112 * s);
      ctx.restore();
    });
    // de totaalprijs
    var ta = fase(t, WK.offIn + 1.5, 0.35);
    ctx.fillStyle = "#e3e1db"; ctx.fillRect(ox + 34 * s, oy + oh - 96 * s, ow - 68 * s, 2 * s);
    ctx.save(); ctx.globalAlpha = ta;
    tekstPas(ctx, "Totaal", ox + 34 * s, oy + oh - 42 * s, 26 * s, "700", K.inkt);
    ctx.font = "700 " + (18 * s).toFixed(1) + "px " + LETTERS;
    var pw = ctx.measureText("Vast bedrag").width + 40 * s, ph = 42 * s, ppx = ox + ow - 34 * s - pw, ppy = oy + oh - 70 * s;
    ctx.fillStyle = K.inkt; rond(ctx, ppx, ppy, pw, ph, ph / 2); ctx.fill();
    tekstPas(ctx, "Vast bedrag", ppx + pw / 2, ppy + ph / 2 + 6.5 * s, 18 * s, "700", "#ffffff", 0, "center");
    ctx.restore();
    vinkje(ctx, ox + ow - 34 * s - pw - 34 * s, oy + oh - 49 * s, 20 * s, veer(fase(t, WK.offIn + 1.85, 0.35)) * fase(t, WK.offIn + 1.85, 0.01));
  }

  /* De afspraak: kalender met de dag, de monteur, en het busje dat aan komt rijden ---------- */
  function afspraakKaart(ctx, t, W, H, s) {
    var aIn = E.uit(fase(t, WK.affIn, 0.5)), aUit = E.in_(fase(t, WK.affUit, 0.45));
    if (aIn <= 0 || aUit >= 1) return;
    var aw = 470 * s, ah = 350 * s, ax = W * 0.5 - aw / 2 + (1 - aIn) * W * 0.9 + aUit * W * 0.9, ay = H * 0.5 - ah / 2;
    schaduwKaart(ctx, ax, ay, aw, ah, 26 * s, s);
    ctx.fillStyle = "#ffffff"; rond(ctx, ax, ay, aw, ah, 26 * s); ctx.fill();
    ctx.fillStyle = K.inkt; ctx.font = "700 " + (34 * s).toFixed(1) + "px " + LETTERS; ctx.textBaseline = "alphabetic";
    ctx.fillText("Afspraak", ax + 34 * s, ay + 62 * s);
    vinkje(ctx, ax + aw - 58 * s, ay + 52 * s, 21 * s, veer(fase(t, WK.affIn + 0.85, 0.35)) * fase(t, WK.affIn + 0.85, 0.01));
    kalender(ctx, ax + 34 * s, ay + 96 * s, 126 * s, s, fase(t, WK.affIn + 0.4, 0.4));
    monteur(ctx, ax + 246 * s, ay + 152 * s, 48 * s);
    regel(ctx, ax + 314 * s, ay + 128 * s, 120 * s, s); regel(ctx, ax + 314 * s, ay + 158 * s, 86 * s, s);
    var rit = E.uit(fase(t, WK.affIn + 0.5, 0.9));
    ctx.save(); rond(ctx, ax, ay, aw, ah, 26 * s); ctx.clip();
    ctx.fillStyle = "#f1efea"; ctx.fillRect(ax, ay + ah - 64 * s, aw, 64 * s);
    busje(ctx, ax - 150 * s + rit * (aw * 0.5 + 64 * s), ay + ah - 22 * s, 0.92 * s);
    ctx.restore();
  }

  /* De 2D-laag over het 3D-beeld ---------------------------------------------------------- */
  function werkKaarten(ctx, cv, c, t, W, H) {
    var s = Math.min(W, H) / 1000;
    // ringen om de schade (in het begin)
    var ringA = fase(t, WK.ring[0], 0.3) * (1 - fase(t, WK.ringUit, 0.3));
    if (ringA > 0.01) {
      [[FBOVEN, 408, 9, WK.ring[0]], [FVOOR, 372, PH - 13, WK.ring[1]]].forEach(function (rg) {
        var p = c.q(rg[0].w(rg[1], rg[2], DL + DO)), rr = 48 * s * veer(fase(t, rg[3], 0.45));
        if (rr <= 0) return;
        ctx.save(); ctx.globalAlpha = ringA;
        ctx.lineWidth = 11 * s; ctx.strokeStyle = "#ffffff"; ctx.beginPath(); ctx.arc(p[0], p[1], rr, 0, Math.PI * 2); ctx.stroke();
        ctx.lineWidth = 5.5 * s; ctx.strokeStyle = K.roest || "#a8523a"; ctx.beginPath(); ctx.arc(p[0], p[1], rr, 0, Math.PI * 2); ctx.stroke();
        ctx.restore();
      });
    }
    // waas over het kozijn zolang de telefoon en de kaarten er zijn
    var waas = fase(t, WK.waasIn, 0.4) * (1 - fase(t, WK.waasUit, 0.45));
    if (waas > 0.01) { ctx.fillStyle = "rgba(247,246,243," + (0.62 * waas).toFixed(3) + ")"; ctx.fillRect(0, 0, W, H); }
    telefoon(ctx, t, W, H, s);
    offerteKaart(ctx, t, W, H, s);
    afspraakKaart(ctx, t, W, H, s);
    // de zachte overgang in het werk (zie WDIP)
    var dip = Math.min(fase(t, WDIP[0], WDIP[1]), 1 - fase(t, WDIP[0] + WDIP[1] + WDIP[2], WDIP[3]));
    // nooit helemaal wit: het kozijn blijft er zacht doorheen te zien, als een overgang en niet als een flits
    if (dip > 0.001) { ctx.fillStyle = "rgba(247,246,243," + (0.9 * E.zacht(dip)).toFixed(3) + ")"; ctx.fillRect(0, 0, W, H); }
  }

  function tekenWerkwijze(ctx, t, W, H, opties) {
    opties = opties || {};
    gebruik(WERK_VERHAAL);
    t = klem(t, 0, WDUUR);
    var st = staat(t), c = maakCamera(camVoorWerk(t), W, H), z = zonesVoor(st), boven = [];
    // de zon staat in de ochtend linksboven en schuift rustig een stukje op
    var L = zonLicht(t, W, H, 1, { s: mix(0.27, 0.36, t / WDUUR) });
    L.lucht.stip = 0;                    // geen zonnebaan: hier gaat het niet om de tijd
    var sc = {
      cam: c, z: z, schaduwMaat: opties.schaduwMaat || 2048, achtergrond: "licht",
      lk: L.lk, key: L.key, hemel: L.hemel, vloer: L.vloer, lucht: L.lucht, leeftijd: 1, schaduwZacht: 5.0,
      folie: WFOLIE, belichting: 0.92,
      kap: [kapLaag(z, 0, LEN), kapLaag(z, 1, 0)]
    };
    if (st.vetvrij > 0 && st.vetvrij < 1) {
      var vv = E.zacht(st.vetvrij); sc.sweep = [mix(-80, LEN + 160, vv), mix(-80, STI + 160, vv), Math.sin(Math.PI * st.vetvrij) * 1.1, 1];
    }
    if (st.glans > 0 && st.glans < 1) {
      var gv = E.zacht(st.glans); sc.sweep = [mix(-90, LEN + 200, gv), mix(-90, STI + 200, gv), Math.sin(Math.PI * st.glans) * 0.7, 0];
    }
    sc.dingen = function (B, BF) {
      schilfers(B, z, 1);
      omzetten(B, st);
      gebruik(WERK_ZICHT);
      gereedschap(B, BF, sc, st, t, boven);
      gebruik(WERK_VERHAAL);
    };
    var cv = renderScene(W, H, sc);
    if (!cv) return false;
    ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0);
    plak(ctx, cv, W, H);
    boven.forEach(function (f) { f(ctx, c); });
    [[150, 0.6, FVOOR, PH], [360, 0.35, FVOOR, PH], [80, 0.5, FSVOOR, SW]].forEach(function (v, k) {
      var f = fase(t, WT.glans[0] + 0.35 + k * 0.2, 0.8), zz = Math.sin(Math.PI * f);
      if (zz <= 0.01) return;
      var p = c.q(v[2].w(v[0], v[3] * v[1], DN));
      vonk(ctx, p[0], p[1], zz * 1.7 * c.S * 0.5, zz);
    });
    werkKaarten(ctx, cv, c, t, W, H);
    ctx.restore();
    return true;
  }

  /* Op de site ------------------------------------------------------------------------
     <figure class="kozijn-3d" data-kozijn-3d> met een canvas, een ondertitel (.k3d-zin),
     een knop .k3d-opnieuw en drie knoppen [data-stap]. Speelt één keer zodra hij in beeld
     komt en blijft dan op het eindbeeld staan. Een klik op een stap speelt vanaf die stap.
     Wie "minder beweging" aan heeft, ziet het eindbeeld; een klik op een stap laat dan
     een stilstaand beeld van die stap zien.
     Zonder WebGL2 doet het script niets: dan blijft het startbeeld (de JPG uit de CSS) staan.
     Vloeiend afspelen: het canvas tekent op hooguit 1,5 keer de schermresolutie, en als een
     computer het niet bijhoudt, tekent hij gelijkmatig elk tweede beeld (30 per seconde)
     in plaats van onregelmatig te haperen. */
  function speler(fig) {
    var doek = fig.querySelector("canvas");
    if (!doek || !doek.getContext || fig.iwrapSpeel) return;
    if (!motorStart(1536)) { fig.classList.add("k3d-geen-webgl"); return; }
    var ctx = doek.getContext("2d");
    var zinEl = fig.querySelector(".k3d-zin"), opnieuw = fig.querySelector(".k3d-opnieuw");
    var knoppen = Array.prototype.slice.call(fig.querySelectorAll("[data-stap]"));
    var rustig = !!(window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches);
    var t = rustig ? DUUR : 0, stilStap = 0, speelt = false, raf = 0, vorig = 0, W = 0, H = 0, dpr = 1, css = 0, inBeeld = false, gestart = false;
    var duurGem = 8, traag = false, overslaan = false, getekend = 0;

    function maat() {
      var r = doek.getBoundingClientRect();
      if (!r.width || !r.height) return;
      dpr = Math.min(1.5, window.devicePixelRatio || 1); css = r.width;
      var w = Math.round(r.width * dpr), h = Math.round(r.height * dpr);
      if (w !== W || h !== H) { W = doek.width = w; H = doek.height = h; }
      beeld();
    }
    function beeld() {
      if (!W) return;
      var a = window.performance ? performance.now() : 0;
      if (teken(ctx, t, W, H, { pxPerCss: dpr * klem(css / 540, 0.8, 1), labels: css >= 460, schaduwMaat: 1536 })) {
        if (!getekend++) fig.classList.add("k3d-getekend");
      }
      if (a) duurGem = duurGem * 0.92 + (performance.now() - a) * 0.08;
      stand();
    }
    function stand() {
      var z = "";
      if (rustig) z = stilStap ? ZINNEN[[2, 3, 5][stilStap - 1]][2] : "";
      else ZINNEN.forEach(function (r) { if (t >= r[0] && t < r[1] + 0.3) z = r[2]; });
      if (zinEl && zinEl.getAttribute("data-zin") !== z) {
        zinEl.setAttribute("data-zin", z);
        if (z) zinEl.textContent = z;
        zinEl.classList.toggle("is-leeg", !z);
      }
      knoppen.forEach(function (k) {
        var i = +k.getAttribute("data-stap"), sp = STAPPEN[i - 1];
        var nu = rustig ? stilStap === i : (t >= sp.van && t < sp.tot), klaar = rustig ? !stilStap : t >= sp.tot;
        k.classList.toggle("is-nu", nu);
        k.classList.toggle("is-klaar", klaar && !nu);
        if (nu) k.setAttribute("aria-current", "step"); else k.removeAttribute("aria-current");
      });
      if (opnieuw) opnieuw.hidden = rustig || speelt || t < DUUR - 0.01;
      fig.classList.toggle("k3d-speelt", speelt);
    }
    function lus(nu) {
      if (!speelt) return;
      raf = requestAnimationFrame(lus);
      if (traag && (overslaan = !overslaan)) return;          // gelijkmatig 30 beelden per seconde
      var dt = (nu - vorig) / 1000; vorig = nu;
      if (dt > 0.25 || dt < 0) dt = 1 / 60;                   // na een pauze (ander tabblad) niet vooruit springen
      t = Math.min(DUUR, t + dt);
      beeld();
      if (duurGem > 11) traag = true;
      if (t >= DUUR) { speelt = false; cancelAnimationFrame(raf); stand(); }
    }
    function speel(van) {
      gestart = true;
      if (rustig) return;
      t = van || 0; speelt = true;
      cancelAnimationFrame(raf); vorig = performance.now(); raf = requestAnimationFrame(lus);
    }
    function pauze() { speelt = false; cancelAnimationFrame(raf); stand(); }
    function verder() { if (!speelt && gestart && t < DUUR) { speelt = true; vorig = performance.now(); raf = requestAnimationFrame(lus); } }

    knoppen.forEach(function (k) {
      k.addEventListener("click", function () {
        var i = +k.getAttribute("data-stap");
        if (rustig) { stilStap = stilStap === i ? 0 : i; t = stilStap ? STIL[i - 1] : DUUR; beeld(); return; }
        speel(Math.max(0, STAPPEN[i - 1].van - 0.25));
      });
    });
    if (opnieuw) opnieuw.addEventListener("click", function () { speel(0); });
    fig.iwrapSpeel = function () { if (rustig) { stilStap = 0; t = DUUR; beeld(); } else speel(0); };

    if (window.ResizeObserver) new ResizeObserver(maat).observe(doek); else window.addEventListener("resize", maat);
    maat();
    if (rustig) return;
    if (window.IntersectionObserver) {
      new IntersectionObserver(function (es) {
        es.forEach(function (e) {
          inBeeld = e.isIntersecting && e.intersectionRatio >= 0.35;
          if (inBeeld && !gestart) speel(0);
          else if (inBeeld) verder();
          else if (speelt) { pauze(); }
        });
      }, { threshold: [0, 0.35, 0.6] }).observe(fig);
    } else speel(0);
  }
  function start() {
    Array.prototype.forEach.call(document.querySelectorAll("[data-kozijn-zon]"), zonSpeler);
    Array.prototype.forEach.call(document.querySelectorAll("[data-kozijn-3d]"), speler);
  }
  if (typeof document !== "undefined") {
    if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start); else start();
  }

  window.iwrapKozijnWerkwijze = { teken: tekenWerkwijze, duur: WDUUR, blokken: WBLOKKEN, kan: function () { return !!motorStart(1536); } };
  window.iwrapKozijnZon = { teken: tekenZon, duur: ZDUUR, stappen: ZSTAPPEN, zinnen: ZZINNEN, jaren: tellerJaren };
  window.iwrapKozijn3D = {
    teken: teken, duur: DUUR, stappen: STAPPEN, zinnen: ZINNEN, start: start,
    // de motor en de onderdelen, zodat de korte versie (kozijn-sting.js) hetzelfde kozijn tekent
    motor: {
      render: renderScene, plak: plak, start: motorStart, camera: maakCamera, Bouwer: Bouwer, mat: mat, cil: cil, kist: kist, kaart: kaart, bol: bol, buis: buis,
      Vlak: Vlak, FVOOR: FVOOR, FBOVEN: FBOVEN, FSVOOR: FSVOOR, PAD: PAD, padPunt: padPunt,
      rolOud: rolOud, rolNieuw: rolNieuw, rakel: rakel, krabber: krabber, lijmrug: lijmrug, kruimels: kruimelsBij, fohn: fohn, luchtLijnen: luchtLijnen,
      spuitfles: spuitfles, nevel: nevel, doek: doek, schilfers: schilfers, omzetten: omzetten, kapLaag: kapLaag, kies: kies, vonk: vonk, rond: rond,
      licht: function (W, H, s) { var L = zonLicht(0, W, H, 1, { s: s == null ? 0.3 : s }); L.lucht.stip = 0; return L; }, FOLIE: FOLIE,
      kromme: kromme, klem: klem, mix: mix, fase: fase, E: E, som: som, ver: ver, maal: maal, een: een, inw: inw, uitw: uitw, rng: rng, binnen: binnen,
      maten: { LEN: LEN, PH: PH, PD: PD, SW: SW, STI: STI, GZ0: GZ0, GZ1: GZ1, RV: RV, RR: RR, DL: DL, DO: DO, DN: DN, FLAP: FLAP, MARGE: MARGE, COT: COT, RAD: RAD },
      K: K
    }
  };
})();
