/* Gedeeld gedrag: menu, voor/na-schuif en het rustig in beeld schuiven van
   secties. Alles is optioneel -- zonder JavaScript werkt elke pagina gewoon,
   alleen staat de voor/na-schuif dan halverwege vast. */
(function () {
  'use strict';
  document.documentElement.classList.add('js');

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
