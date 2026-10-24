/* Gedeeld gedrag: menu, voor/na-schuif en het rustig in beeld schuiven van
   secties. Alles is optioneel -- zonder JavaScript werkt elke pagina gewoon,
   alleen staat de voor/na-schuif dan halverwege vast. */
(function () {
  'use strict';
  document.documentElement.classList.add('js');

  /* Printknop (het tekenblad) */
  document.querySelectorAll('[data-print]').forEach(function (k) {
    k.addEventListener('click', function () { window.print(); });
  });

  /* Menu op mobiel ------------------------------------------------------- */
  var knop = document.querySelector('.nav-toggle');
  var menu = document.getElementById('hoofdmenu');
  if (knop && menu) {
    knop.addEventListener('click', function () {
      var open = knop.getAttribute('aria-expanded') === 'true';
      knop.setAttribute('aria-expanded', String(!open));
      menu.classList.toggle('open', !open);
    });
    menu.addEventListener('click', function (e) {
      if (e.target.tagName === 'A') {
        knop.setAttribute('aria-expanded', 'false');
        menu.classList.remove('open');
      }
    });
  }

  /* Voor/na-schuif ------------------------------------------------------- */
  document.querySelectorAll('.vergelijk').forEach(function (blok) {
    var schuif = blok.querySelector('input[type=range]');
    var slepen = false;

    function zet(pct) {
      pct = Math.max(0, Math.min(100, pct));
      blok.style.setProperty('--pos', pct + '%');
      if (schuif && Number(schuif.value) !== Math.round(pct)) schuif.value = Math.round(pct);
    }
    function uitGebeurtenis(e) {
      var r = blok.getBoundingClientRect();
      var x = (e.touches ? e.touches[0].clientX : e.clientX) - r.left;
      zet((x / r.width) * 100);
    }

    if (schuif) {
      zet(Number(schuif.value));
      schuif.addEventListener('input', function () { zet(Number(schuif.value)); });
    }

    blok.addEventListener('pointerdown', function (e) {
      // Laat de onzichtbare range zijn eigen toetsenbordrol houden.
      if (e.target === schuif) return;
      slepen = true;
      blok.setPointerCapture(e.pointerId);
      uitGebeurtenis(e);
    });
    blok.addEventListener('pointermove', function (e) { if (slepen) uitGebeurtenis(e); });
    ['pointerup', 'pointercancel'].forEach(function (t) {
      blok.addEventListener(t, function () { slepen = false; });
    });
  });

  /* Video's ------------------------------------------------------------- */
  /* Spelen vanzelf (zonder geluid) zodra ze goed in beeld zijn, pauzeren als je
     wegscrolt en blijven aan het eind op het laatste beeld staan. Wie minder
     beweging wil, krijgt alleen de afspeelknop. */
  var weinigBeweging = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  document.querySelectorAll('[data-video]').forEach(function (blok) {
    var video = blok.querySelector('video');
    var speelknop = blok.querySelector('.speelknop');
    var zelfGepauzeerd = false;
    var LABELS = { pauze: 'Video pauzeren', speel: 'Video afspelen', opnieuw: 'Video opnieuw afspelen' };

    function speel() {
      var belofte = video.play();
      if (belofte && belofte.catch) belofte.catch(function () {});
    }
    function werkKnop() {
      var stand = !video.paused ? 'pauze' : video.ended ? 'opnieuw' : 'speel';
      speelknop.setAttribute('data-stand', stand);
      speelknop.setAttribute('aria-label', LABELS[stand]);
    }
    function wissel() {
      if (video.paused) { zelfGepauzeerd = false; speel(); }
      else { zelfGepauzeerd = true; video.pause(); }
    }
    ['play', 'pause', 'ended'].forEach(function (e) { video.addEventListener(e, werkKnop); });
    speelknop.addEventListener('click', wissel);
    video.addEventListener('click', wissel);
    werkKnop();

    if (weinigBeweging || !('IntersectionObserver' in window)) return;
    new IntersectionObserver(function (rijen) {
      rijen.forEach(function (rij) {
        if (rij.isIntersecting && video.paused && !video.ended && !zelfGepauzeerd) speel();
        else if (!rij.isIntersecting && !video.paused) video.pause();
      });
    }, { threshold: 0.55 }).observe(blok);
  });

  /* Zachte intro --------------------------------------------------------- */
  var doelen = document.querySelectorAll('.verschijn');
  if (!doelen.length) return;
  if (!('IntersectionObserver' in window) ||
      window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    doelen.forEach(function (el) { el.classList.add('zichtbaar'); });
    return;
  }
  var kijker = new IntersectionObserver(function (rijen) {
    rijen.forEach(function (rij) {
      if (rij.isIntersecting) {
        rij.target.classList.add('zichtbaar');
        kijker.unobserve(rij.target);
      }
    });
  }, { rootMargin: '0px 0px -60px 0px', threshold: 0.08 });
  doelen.forEach(function (el) { kijker.observe(el); });
})();
