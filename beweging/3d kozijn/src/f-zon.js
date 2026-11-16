
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
