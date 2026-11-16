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
