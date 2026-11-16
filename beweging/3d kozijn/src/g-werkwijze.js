
  /* ======================= De werkwijzefilm (homepage en /werkwijze) =======================
     Hetzelfde crème kozijn en dezelfde lucht als de hero, maar nu het verhaal van een klus:
     - Zo begint het: het verweerde kozijn in de zon (dezelfde kleur als nieuw, alleen dof,
       gebarsten en loslatend). Twee ringen wijzen de schade aan.
     - Offerte: een telefoon maakt een foto, een mint stift streept aan wat er moet gebeuren
       (zoals op ons aanvraagformulier), en de foto vliegt naar een offerte met een vaste prijs.
     - Afspraak: een kaart met de dag, wie er komt en het mint busje.
     - Verwijderen en reinigen, en aanbrengen: het werk zelf, in 3D.
     - Klaar: glans over de nieuwe folie.
     De teksten links staan als HTML in src/film.html; js/film.js speelt de film af en laat ze
     op de tijden in WBLOKKEN zien. tekenWerkwijze(ctx, t, W, H, opties) tekent één beeld. */
  var WDUUR = 20;
  var WBLOKKEN = [0, 3.2, 6.6, 9.0, 14.0, 17.0, 18.3];
  var WR = 9.2;
  var WT = {
    los: [900, 901],
    pel: [WR + 0.15, WR + 1.55], pelS: [WR + 1.5, WR + 2.1],
    krabS: [WR + 2.25, WR + 2.7], krab: [WR + 2.65, WR + 3.55],
    doek: [WR + 3.65, WR + 4.2], doekS: [WR + 4.15, WR + 4.5],
    vetvrij: [WR + 4.5, WR + 4.85],
    nieuw: [WR + 5.0, WR + 6.4], nieuwS: [WR + 6.35, WR + 7.0],
    glans: [WR + 7.9, WR + 8.9]
  };
  // [t, doel x, doel y, zoom, draaiing, kanteling, afstand, hoogte van het midden in beeld]
  var WCAM = [
    [0.0, 336, 60, 1.78, 46, 18, 820, 0.54],
    [0.9, 318, 64, 1.66, 44, 17, 860, 0.55],
    [2.7, 252, 112, 1.02, 38, 11, 1150, 0.62],
    [6.0, 250, 114, 1.0, 36, 11, 1150, 0.62],
    [8.6, 254, 108, 1.04, 36, 12, 1150, 0.61],
    [WR + 0.4, 282, 84, 1.2, 37, 17, 1040, 0.57],
    [WR + 2.4, 242, 120, 1.08, 35, 16, 1100, 0.58],
    [WR + 4.9, 250, 108, 1.12, 35, 16, 1100, 0.58],
    [WR + 7.0, 240, 114, 1.1, 35, 15, 1100, 0.59],
    [WR + 8.6, 248, 116, 1.04, 39, 10, 1120, 0.63],
    [WDUUR, 250, 118, 1.0, 39, 9, 1150, 0.64]
  ];
  var WERK_VERHAAL = { T: WT, BEW: BEW, CAM: WCAM };
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

  /* De foto voor de offerte: het HELE kozijn in de gevel, recht van voren, zoals we het vragen.
     Daarop streept de klant aan wat er moet gebeuren, net als op het aanvraagformulier: geel voor
     het kozijn (rood is voor een draairaam; dat doen we in dit verhaal niet). Hier: de onderdorpel
     en de linkerstijl, precies de delen die daarna in 3D hersteld worden.
     p = hoe ver de gele stift is (0 nog niets, 1 klaar). */
  function kozijnFoto(ctx, x, y, w, h, p) {
    var s = w / 300;
    ctx.save(); ctx.beginPath(); ctx.rect(x, y, w, h); ctx.clip();
    // gevel van rode baksteen
    ctx.fillStyle = "#a35d47"; ctx.fillRect(x, y, w, h);
    ctx.strokeStyle = "rgba(226,214,196,0.55)"; ctx.lineWidth = 1.1 * s;
    for (var r = 0, yy = y + 6 * s; yy < y + h; yy += 12 * s, r++) {
      ctx.beginPath(); ctx.moveTo(x, yy); ctx.lineTo(x + w, yy); ctx.stroke();
      for (var xx = x + (r % 2 ? 0 : 13 * s); xx < x + w; xx += 26 * s) { ctx.beginPath(); ctx.moveTo(xx, yy - 12 * s); ctx.lineTo(xx, yy); ctx.stroke(); }
    }
    // het kozijn: een vast raam links en een draairaam rechts, crème met houtnerf, verweerd (zelfde kleur)
    var kx = x + w * 0.12, ky = y + h * 0.2, kw = w * 0.76, kh = h * 0.56, b = 15 * s, dorpel = 21 * s;
    ctx.fillStyle = "#6f3c2f"; ctx.fillRect(kx - 7 * s, ky - 7 * s, kw + 14 * s, kh + 10 * s);           // de dagkant
    ctx.fillStyle = "#ebe4d0"; ctx.fillRect(kx, ky, kw, kh);
    var gx1 = kx + b, gw1 = kw * 0.47 - b * 1.5, gx2 = kx + kw * 0.47 + b * 0.5, gw2 = kw - (gx2 - kx) - b, gy = ky + b, gh = kh - b - dorpel;
    function glas(gx, gy2, gw, gh2) {
      var g = ctx.createLinearGradient(0, gy2, 0, gy2 + gh2); g.addColorStop(0, "#b7cdd6"); g.addColorStop(1, "#7f97a1");
      ctx.fillStyle = g; ctx.fillRect(gx, gy2, gw, gh2);
      ctx.fillStyle = "rgba(255,255,255,0.28)"; ctx.beginPath(); ctx.moveTo(gx + gw * 0.18, gy2); ctx.lineTo(gx + gw * 0.42, gy2); ctx.lineTo(gx, gy2 + gh2 * 0.5); ctx.lineTo(gx, gy2 + gh2 * 0.24); ctx.closePath(); ctx.fill();
    }
    glas(gx1, gy, gw1, gh);
    ctx.strokeStyle = "#ddd5bf"; ctx.lineWidth = 7 * s; ctx.strokeRect(gx2 + 3.5 * s, gy + 3.5 * s, gw2 - 7 * s, gh - 7 * s);   // de vleugel van het draairaam
    glas(gx2 + 8 * s, gy + 8 * s, gw2 - 16 * s, gh - 16 * s);
    ctx.fillStyle = "#f4f2ee"; ctx.fillRect(gx2 + 3 * s, gy + gh * 0.45, 4 * s, 16 * s);                  // de kruk
    // raamdorpel van steen onder het kozijn
    ctx.fillStyle = "#c2bcb0"; ctx.fillRect(kx - 12 * s, ky + kh + 3 * s, kw + 24 * s, 9 * s);
    ctx.fillStyle = "rgba(0,0,0,0.15)"; ctx.fillRect(kx - 10 * s, ky + kh + 12 * s, kw + 20 * s, 3 * s);
    // verweerd: fijne barstjes en een paar loszittende stukjes, in dezelfde kleur
    ctx.strokeStyle = "rgba(140,128,98,0.55)"; ctx.lineWidth = 0.9 * s;
    [[0.08, 0.93, 0.2, 0.9], [0.3, 0.95, 0.42, 0.92], [0.55, 0.94, 0.66, 0.97], [0.78, 0.92, 0.9, 0.95], [0.02, 0.3, 0.05, 0.42], [0.02, 0.6, 0.04, 0.7]].forEach(function (l) {
      ctx.beginPath(); ctx.moveTo(kx + kw * l[0], ky + kh * l[1]); ctx.lineTo(kx + kw * (l[0] + l[2]) / 2, ky + kh * (l[1] + l[3]) / 2 + 2 * s); ctx.lineTo(kx + kw * l[2], ky + kh * l[3]); ctx.stroke();
    });
    // de gele stift: eerst de onderdorpel van links naar rechts, dan de linkerstijl omhoog
    if (p > 0) {
      var pad = [[kx + 4 * s, ky + kh - dorpel * 0.5], [kx + kw - 4 * s, ky + kh - dorpel * 0.5], [kx + kw - 4 * s, ky + kh - dorpel * 0.5]];
      var stijl = [[kx + b * 0.5, ky + kh - dorpel * 0.5], [kx + b * 0.5, ky + 4 * s]];
      ctx.strokeStyle = "rgba(247,206,40,0.82)"; ctx.lineCap = "round"; ctx.lineJoin = "round";
      ctx.lineWidth = dorpel * 0.95;
      var d1 = klem(p / 0.62, 0, 1);
      ctx.beginPath(); ctx.moveTo(pad[0][0], pad[0][1] + Math.sin(0) * s); ctx.lineTo(mix(pad[0][0], pad[1][0], d1), pad[0][1] + 1.5 * s * Math.sin(d1 * 6)); ctx.stroke();
      var d2 = klem((p - 0.62) / 0.38, 0, 1);
      if (d2 > 0) { ctx.lineWidth = b * 1.05; ctx.beginPath(); ctx.moveTo(stijl[0][0], stijl[0][1]); ctx.lineTo(stijl[0][0] + 1.2 * s * Math.sin(d2 * 5), mix(stijl[0][1], stijl[1][1], d2)); ctx.stroke(); }
    }
    ctx.restore();
  }

  /* De 2D-laag over het 3D-beeld: ringen, telefoon, offerte, afspraak ------------------- */
  function werkKaarten(ctx, cv, c, t, W, H) {
    var s = Math.min(W, H) / 1000;
    // ringen om de schade (in het begin)
    var ringA = fase(t, 0.9, 0.3) * (1 - fase(t, 2.7, 0.3));
    if (ringA > 0.01) {
      [[FBOVEN, 408, 9, 0.9], [FVOOR, 372, PH - 13, 1.2]].forEach(function (rg) {
        var p = c.q(rg[0].w(rg[1], rg[2], DL + DO)), rr = 48 * s * veer(fase(t, rg[3], 0.45));
        if (rr <= 0) return;
        ctx.save(); ctx.globalAlpha = ringA;
        ctx.lineWidth = 11 * s; ctx.strokeStyle = "#ffffff"; ctx.beginPath(); ctx.arc(p[0], p[1], rr, 0, Math.PI * 2); ctx.stroke();
        ctx.lineWidth = 5.5 * s; ctx.strokeStyle = K.roest || "#a8523a"; ctx.beginPath(); ctx.arc(p[0], p[1], rr, 0, Math.PI * 2); ctx.stroke();
        ctx.restore();
      });
    }
    // waas over het kozijn zolang de kaarten er zijn
    var waas = fase(t, 3.25, 0.4) * (1 - fase(t, 8.55, 0.45));
    if (waas > 0.01) { ctx.fillStyle = "rgba(247,246,243," + (0.58 * waas).toFixed(3) + ")"; ctx.fillRect(0, 0, W, H); }

    // de telefoon: komt van onderen, maakt een foto, de stift streept de dorpel aan
    var tIn = E.uit(fase(t, 3.3, 0.5)), tUit = E.in_(fase(t, 5.1, 0.42));
    var pw = 300 * s, ph = 600 * s, px = W * 0.62 - pw / 2, py = H * 0.5 - ph / 2 + (1 - tIn) * H * 0.8 + tUit * H * 0.9;
    var schermX = px + 14 * s, schermY = py + 14 * s, schermW = pw - 28 * s, schermH = ph - 28 * s;
    if (tIn > 0 && tUit < 1) {
      ctx.save();
      ctx.translate(px + pw / 2, py + ph / 2); ctx.rotate((-3 + (1 - tIn) * 8) * RAD); ctx.translate(-(px + pw / 2), -(py + ph / 2));
      schaduwKaart(ctx, px, py, pw, ph, 46 * s, s);
      ctx.fillStyle = K.inkt; rond(ctx, px, py, pw, ph, 46 * s); ctx.fill();
      ctx.save(); rond(ctx, schermX, schermY, schermW, schermH, 34 * s); ctx.clip();
      // op het scherm: het hele kozijn, en dan streept de gele stift aan wat er moet gebeuren
      kozijnFoto(ctx, schermX, schermY, schermW, schermH, E.zacht(fase(t, 4.3, 0.75)));
      // scherpstellen en de flits
      var richt = fase(t, 3.75, 0.35), fl = t > 4.1 ? Math.exp(-(t - 4.1) * 9) : 0;
      ctx.strokeStyle = "rgba(255,255,255," + (0.6 + 0.4 * Math.sin(Math.PI * richt)).toFixed(2) + ")"; ctx.lineWidth = 4 * s; ctx.lineCap = "round";
      var kw = schermW * (0.66 - 0.06 * E.uit(richt)), kh = kw * 0.8, kx = schermX + schermW / 2 - kw / 2, ky = schermY + schermH * 0.52 - kh / 2, kl = 22 * s;
      ctx.beginPath();
      ctx.moveTo(kx, ky + kl); ctx.lineTo(kx, ky); ctx.lineTo(kx + kl, ky); ctx.moveTo(kx + kw - kl, ky); ctx.lineTo(kx + kw, ky); ctx.lineTo(kx + kw, ky + kl);
      ctx.moveTo(kx + kw, ky + kh - kl); ctx.lineTo(kx + kw, ky + kh); ctx.lineTo(kx + kw - kl, ky + kh); ctx.moveTo(kx + kl, ky + kh); ctx.lineTo(kx, ky + kh); ctx.lineTo(kx, ky + kh - kl);
      ctx.stroke();
      if (fl > 0.01) { ctx.fillStyle = "rgba(255,255,255," + fl.toFixed(3) + ")"; ctx.fillRect(schermX, schermY, schermW, schermH); }
      ctx.restore();
      // sluiterknop en notch
      ctx.strokeStyle = "#ffffff"; ctx.lineWidth = 4 * s; ctx.fillStyle = "rgba(255,255,255,0.3)";
      ctx.beginPath(); ctx.arc(px + pw / 2, py + ph - 70 * s, 26 * s, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
      ctx.fillStyle = K.inkt; rond(ctx, px + pw / 2 - 40 * s, py + 24 * s, 80 * s, 18 * s, 9 * s); ctx.fill();
      ctx.restore();
    }

    // de offerte: schuift van links in, de foto vliegt erheen, en de vaste prijs krijgt een vinkje
    var oIn = E.uit(fase(t, 5.32, 0.45)), oUit = E.in_(fase(t, 6.55, 0.4));
    var ow = 420 * s, oh = 470 * s, ox = W * 0.5 - ow / 2 - (1 - oIn) * W * 0.9 - oUit * W * 0.9, oy = H * 0.5 - oh / 2;
    if (oIn > 0 && oUit < 1) {
      schaduwKaart(ctx, ox, oy, ow, oh, 26 * s, s);
      ctx.fillStyle = "#ffffff"; rond(ctx, ox, oy, ow, oh, 26 * s); ctx.fill();
      ctx.fillStyle = K.inkt; ctx.font = "700 " + (34 * s).toFixed(1) + "px " + LETTERS; ctx.textBaseline = "alphabetic";
      ctx.fillText("Offerte", ox + 34 * s, oy + 64 * s);
      // de foto met de streep
      var fw = 150 * s, fh = 150 * s * 572 / 272 * 0.5, fx = ox + 34 * s, fy = oy + 92 * s, vl = E.zacht(fase(t, 5.3, 0.45));
      ctx.save(); ctx.globalAlpha = fase(t, 5.35, 0.2);
      ctx.save(); rond(ctx, fx, fy, fw, fh, 12 * s); ctx.clip();
      kozijnFoto(ctx, fx, fy, fw, fh, 1);
      ctx.restore(); ctx.restore();
      [[0, 0.95], [1, 0.75], [2, 0.86]].forEach(function (r) { var ra = fase(t, 5.35 + r[0] * 0.07, 0.2); ctx.globalAlpha = ra; regel(ctx, fx + fw + 22 * s, fy + 12 * s + r[0] * 30 * s, (ow - fw - 90 * s) * r[1], s); });
      [[0, 0.88], [1, 0.7], [2, 0.8]].forEach(function (r) { var ra = fase(t, 5.5 + r[0] * 0.07, 0.2); ctx.globalAlpha = ra; regel(ctx, fx, fy + fh + 34 * s + r[0] * 30 * s, (ow - 68 * s) * r[1], s); });
      ctx.globalAlpha = 1;
      ctx.fillStyle = "#e3e1db"; ctx.fillRect(ox + 34 * s, oy + oh - 104 * s, ow - 68 * s, 2 * s);
      ctx.fillStyle = K.inkt; ctx.font = "700 " + (28 * s).toFixed(1) + "px " + LETTERS;
      ctx.fillText("Vaste prijs", ox + 34 * s, oy + oh - 48 * s);
      vinkje(ctx, ox + ow - 64 * s, oy + oh - 58 * s, 24 * s, veer(fase(t, 5.85, 0.35)) * (fase(t, 5.85, 0.01)));
      void vl;
    }

    // de afspraak: kalender met de dag, de monteur, en het busje dat aan komt rijden
    var aIn = E.uit(fase(t, 6.75, 0.5)), aUit = E.in_(fase(t, 8.5, 0.45));
    var aw = 440 * s, ah = 330 * s, ax = W * 0.5 - aw / 2 + (1 - aIn) * W * 0.9 + aUit * W * 0.9, ay = H * 0.5 - ah / 2;
    if (aIn > 0 && aUit < 1) {
      schaduwKaart(ctx, ax, ay, aw, ah, 26 * s, s);
      ctx.fillStyle = "#ffffff"; rond(ctx, ax, ay, aw, ah, 26 * s); ctx.fill();
      ctx.fillStyle = K.inkt; ctx.font = "700 " + (32 * s).toFixed(1) + "px " + LETTERS; ctx.textBaseline = "alphabetic";
      ctx.fillText("Afspraak", ax + 34 * s, ay + 60 * s);
      vinkje(ctx, ax + aw - 56 * s, ay + 50 * s, 20 * s, veer(fase(t, 7.6, 0.35)) * fase(t, 7.6, 0.01));
      kalender(ctx, ax + 34 * s, ay + 92 * s, 120 * s, s, fase(t, 7.15, 0.4));
      monteur(ctx, ax + 230 * s, ay + 146 * s, 46 * s);
      regel(ctx, ax + 296 * s, ay + 122 * s, 110 * s, s); regel(ctx, ax + 296 * s, ay + 152 * s, 80 * s, s);
      // het busje rijdt onderin de kaart naar zijn plek
      var rit = E.uit(fase(t, 7.25, 0.9));
      ctx.save(); rond(ctx, ax, ay, aw, ah, 26 * s); ctx.clip();
      ctx.fillStyle = "#f1efea"; ctx.fillRect(ax, ay + ah - 62 * s, aw, 62 * s);
      busje(ctx, ax - 150 * s + rit * (aw * 0.5 + 60 * s), ay + ah - 22 * s, 0.9 * s);
      ctx.restore();
    }
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
      folie: FOLIE.cremeZon, belichting: 0.92,
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
      gereedschap(B, BF, sc, st, t, boven);
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
