
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
      kromme: kromme, klem: klem, mix: mix, fase: fase, E: E, som: som, ver: ver, maal: maal, een: een, inw: inw, uitw: uitw, rng: rng, binnen: binnen,
      maten: { LEN: LEN, PH: PH, PD: PD, SW: SW, STI: STI, GZ0: GZ0, GZ1: GZ1, RV: RV, RR: RR, DL: DL, DO: DO, DN: DN, FLAP: FLAP, MARGE: MARGE, COT: COT, RAD: RAD },
      K: K
    }
  };
})();
