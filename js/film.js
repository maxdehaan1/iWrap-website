/* ---------------------------------------------------------------------------
   De werkwijzefilm (homepage en /werkwijze): 22 seconden, van verweerd kozijn
   via de aanvraag (foto, aanstrepen, vaste prijs, afspraak) tot oplevering, in
   3D, met hetzelfde crème kozijn en dezelfde lucht als de rest van de site.

   Het beeld tekent js/kozijn-3d.js (window.iwrapKozijnWerkwijze, de bron staat in
   beweging/3d kozijn/src/g-werkwijze.js). Dit script speelt het af en laat de
   teksten links meelopen: de blokken in .film-tekst (src/film.html) komen in die
   volgorde, op de tijden uit kozijn-3d.js (blokken). Laad kozijn-3d.js daarom
   vóór dit script.

   Alles hangt af van één getal, de tijd: teken(t). Daardoor speelt dezelfde code
   de film live af op de site én neemt video/opname.mjs er beeld voor beeld een
   MP4 van op (window.iwrapFilm.teken). Zonder WebGL staat er een foto van het
   herstelde kozijn met de eindkaart ernaast.
   --------------------------------------------------------------------------- */
(function () {
  "use strict";

  var film = document.querySelector("[data-film]");
  if (!film) return;
  var W3 = window.iwrapKozijnWerkwijze;
  var doek = film.querySelector(".film-doek");
  var DUUR = W3 ? W3.duur : 22;
  var BLOKKEN = W3 ? W3.blokken : [0, 2.6, 6.2, 10.0, 13.4, 16.0, 19.0, 20.2];
  // Het laatste blok is de eindkaart, het blok ervoor "Klaar".
  var SLOT = BLOKKEN[BLOKKEN.length - 1], KLAAR = BLOKKEN[BLOKKEN.length - 2];
  var kan = !!(W3 && doek && doek.getContext && W3.kan());
  var ctx = kan ? doek.getContext("2d") : null;
  if (!kan) film.classList.add("film-geen-webgl");

  var blokken = Array.prototype.slice.call(film.querySelectorAll(".film-tekst > *"));
  var slotDelen = Array.prototype.slice.call(film.querySelectorAll(".film-slot > *"));
  var merk = film.querySelector(".film-merk");
  var labelVoor = film.querySelector(".film-voor");
  var labelNa = film.querySelector(".film-na");
  var balk = film.querySelector(".film-voortgang span");
  var knop = film.querySelector(".film-knop");

  function klem(x, a, b) { return Math.max(a, Math.min(b, x)); }
  function fase(t, van, duur) { return klem((t - van) / duur, 0, 1); }
  function uit(p) { return 1 - Math.pow(1 - p, 3); }
  function zichtbaar(el, o, y) {
    if (!el) return;
    el.style.opacity = o.toFixed(3);
    el.style.transform = y ? "translateY(" + y.toFixed(3) + "em)" : "";
    el.style.visibility = o > 0.001 ? "visible" : "hidden";
  }

  /* Het canvas: op hooguit 1,5 keer de schermresolutie. Haalt een toestel het niet,
     dan tekenen we gelijkmatig elk tweede beeld (30 per seconde) in plaats van te haperen. */
  var W = 0, H = 0, getekend = false, duurGem = 8, traag = false, overslaan = false;
  function maat() {
    if (!kan) return;
    var r = doek.getBoundingClientRect();
    if (!r.width || !r.height) return;
    var dpr = Math.min(1.5, window.devicePixelRatio || 1);
    var w = Math.round(r.width * dpr), h = Math.round(r.height * dpr);
    if (w !== W || h !== H) { W = doek.width = w; H = doek.height = h; }
  }

  function teken(t) {
    t = klem(t, 0, DUUR);
    if (kan && W) {
      var a = window.performance ? performance.now() : 0;
      if (W3.teken(ctx, t, W, H, { schaduwMaat: 1536 }) && !getekend) { getekend = true; film.classList.add("film-getekend"); }
      if (a) duurGem = duurGem * 0.92 + (performance.now() - a) * 0.08;
    }
    // Labels, en het logo dat alleen in de opname staat.
    zichtbaar(merk, 1 - fase(t, SLOT - 0.1, 0.25));
    zichtbaar(labelVoor, 1 - fase(t, BLOKKEN[1] - 0.3, 0.3));
    zichtbaar(labelNa, uit(fase(t, KLAAR + 0.2, 0.35)));
    // Teksten: elk blok komt omhoog in beeld en gaat weg als het volgende komt.
    // Het eerste staat er meteen, zodat het beginbeeld ook een goede poster is.
    blokken.forEach(function (b, i) {
      var start = BLOKKEN[i], eind = BLOKKEN[i + 1];
      var erinP = i === 0 ? 1 : uit(fase(t, start, 0.4));
      var eruit = eind == null ? 0 : fase(t, eind - 0.22, 0.22);
      zichtbaar(b, Math.min(erinP, 1 - eruit), (1 - erinP) * 0.6 - eruit * 0.3);
    });
    slotDelen.forEach(function (d, i) {
      var pd = uit(fase(t, SLOT + 0.12 + i * 0.13, 0.4));
      zichtbaar(d, pd, (1 - pd) * 0.5);
    });
    if (balk) balk.style.transform = "scaleX(" + (t / DUUR).toFixed(4) + ")";
    // Voor de stappen onder de film (js/iwrap-site.js, onderdeel 3).
    film.dispatchEvent(new CustomEvent("filmtijd", { detail: t }));
  }

  /* Afspelen ------------------------------------------------------------- */
  var tijd = 0, loopt = false, vorige = 0, frame = 0, zelfGestopt = false;

  function stap(nu) {
    frame = requestAnimationFrame(stap);
    if (traag && (overslaan = !overslaan)) return;
    // Nooit meer dan een tiende seconde per beeld: na een verborgen tabblad
    // springt de film anders in één keer naar het eind.
    tijd += Math.min(nu - vorige, 100) / 1000;
    vorige = nu;
    teken(tijd);
    if (duurGem > 11) traag = true;
    if (tijd >= DUUR) { loopt = false; cancelAnimationFrame(frame); werkKnop(); }
  }
  function speel() {
    if (tijd >= DUUR) tijd = 0;
    loopt = true;
    vorige = performance.now();
    cancelAnimationFrame(frame);
    frame = requestAnimationFrame(stap);
    werkKnop();
  }
  function stop() {
    loopt = false;
    cancelAnimationFrame(frame);
    werkKnop();
  }
  function werkKnop() {
    if (!knop) return;
    var stand = loopt ? "pauze" : tijd >= DUUR ? "opnieuw" : "speel";
    knop.setAttribute("data-stand", stand);
    knop.setAttribute("aria-label", { pauze: "Film pauzeren", speel: "Film afspelen", opnieuw: "Film opnieuw afspelen" }[stand]);
  }

  if (knop) knop.addEventListener("click", function () {
    zelfGestopt = loopt;
    if (loopt) stop(); else speel();
  });

  // Voor de opname (video/opname.mjs) en de stappen onder de film.
  window.iwrapFilm = {
    duur: DUUR,
    teken: function (t) { stop(); maat(); tijd = t; teken(t); },
    speelVanaf: function (t) { stop(); tijd = klem(t, 0, DUUR); zelfGestopt = false; teken(tijd); speel(); }
  };

  if (kan) {
    if (window.ResizeObserver) new ResizeObserver(function () { maat(); teken(tijd); }).observe(doek);
    else window.addEventListener("resize", function () { maat(); teken(tijd); });
  }
  maat();

  // De opname begint niet vanzelf te lopen: die zet elk beeldje zelf neer.
  if (/[?&]opname\b/.test(location.search)) { teken(0); return; }

  var rustig = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (!kan || rustig || !("IntersectionObserver" in window)) {
    // Geen beweging gewenst (of geen WebGL): het herstelde kozijn en de eindkaart.
    tijd = DUUR;
    teken(DUUR);
    werkKnop();
    if (!kan && knop) knop.hidden = true;
    return;
  }

  teken(0);
  werkKnop();
  // Speelt vanzelf af zodra hij goed in beeld is, en pauzeert als je wegscrolt.
  new IntersectionObserver(function (rijen) {
    rijen.forEach(function (rij) {
      if (rij.isIntersecting && !loopt && !zelfGestopt && tijd < DUUR) speel();
      else if (!rij.isIntersecting && loopt) stop();
    });
  }, { threshold: 0.55 }).observe(film);
})();
