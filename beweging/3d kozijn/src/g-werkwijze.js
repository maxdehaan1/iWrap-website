
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
