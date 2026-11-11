/* Gedeeld gedrag: menu, voor/na-schuif, openklappende vragen, foto's die zacht
   binnenkomen en het rustig in beeld schuiven van secties. Alles is optioneel -- zonder JavaScript werkt elke pagina gewoon,
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
    // De donkere laag achter het open menu. Een tik erop sluit het menu, en je
    // klikt dan niet per ongeluk iets aan dat eronder zat.
    var laag = document.createElement('div');
    laag.className = 'menu-laag';
    document.body.appendChild(laag);
    new MutationObserver(function () {
      laag.classList.toggle('open', menu.classList.contains('open'));
    }).observe(menu, { attributes: true, attributeFilter: ['class'] });
    function sluitMenu() {
      knop.setAttribute('aria-expanded', 'false');
      menu.classList.remove('open');
    }
    laag.addEventListener('click', sluitMenu);
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && menu.classList.contains('open')) { sluitMenu(); knop.focus(); }
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

  /* Wintermelding --------------------------------------------------------- */
  /* Van half november tot en met februari plannen we veel minder; dan zegt de
     offertepagina dat er gerust al aangevraagd kan worden voor het voorjaar. */
  var nu = new Date();
  var maand = nu.getMonth() + 1;
  if ((maand === 11 && nu.getDate() >= 15) || maand === 12 || maand <= 2) {
    document.querySelectorAll('[data-winter]').forEach(function (el) { el.hidden = false; });
  }

  /* Reviews -------------------------------------------------------------- */
  /* De pagina komt met de stand van de laatste build. Hier halen we de live
     stand op (/api/reviews, die hem van Google heeft) en zetten die in elk
     [data-rv]-veld. Heeft Google nieuwere reviews, dan komen die vooraan in de
     rij. Lukt het ophalen niet, dan blijft gewoon staan wat er stond. */
  var rvVelden = document.querySelectorAll('[data-rv]');
  var rvRijen = document.querySelectorAll('[data-rv-rij]');
  var rvBijwerkers = [];
  var MAANDEN = ['januari', 'februari', 'maart', 'april', 'mei', 'juni', 'juli',
    'augustus', 'september', 'oktober', 'november', 'december'];

  rvRijen.forEach(function (rij, i) {
    var pijlen = rij.parentNode.querySelector('.rv-pijlen');
    if (!pijlen) return;
    var knoppen = pijlen.querySelectorAll('[data-rv-pijl]');
    function stap() {
      var kaart = rij.querySelector('.review');
      return kaart ? kaart.getBoundingClientRect().width + (parseFloat(getComputedStyle(rij).columnGap) || 0) : 300;
    }
    function werkBij() {
      var rest = rij.scrollWidth - rij.clientWidth;
      pijlen.hidden = rest < 4;
      knoppen[0].disabled = rij.scrollLeft < 4;
      knoppen[1].disabled = rij.scrollLeft > rest - 4;
    }
    knoppen.forEach(function (k) {
      k.addEventListener('click', function () {
        rij.scrollBy({ left: Number(k.getAttribute('data-rv-pijl')) * stap(), behavior: weinigBeweging ? 'auto' : 'smooth' });
      });
    });
    rij.addEventListener('scroll', werkBij, { passive: true });
    window.addEventListener('resize', werkBij);
    rvBijwerkers[i] = werkBij;
    werkBij();
  });

  function maak(tag, klasse, tekst) {
    var e = document.createElement(tag);
    if (klasse) e.className = klasse;
    if (tekst != null) e.textContent = tekst;
    return e;
  }
  function rvWanneer(r) {
    if (r.wanneer) return r.wanneer;
    if (r.datum) return MAANDEN[Number(r.datum.slice(5, 7)) - 1] + ' ' + r.datum.slice(0, 4);
    return '';
  }
  /* Precies dezelfde kaart als render_review() in build.py. */
  function rvKaart(r, d) {
    var n = Math.max(1, Math.min(5, r.sterren || 5));
    var kaart = maak('article', r.tekst.length < 90 ? 'review kort' : 'review');
    var kop = maak('div', 'review-kop');
    var sterren = maak('span', 'sterren', '★★★★★'.slice(0, n) + '☆☆☆☆☆'.slice(0, 5 - n));
    sterren.setAttribute('role', 'img');
    sterren.setAttribute('aria-label', n + ' van de 5 sterren');
    kop.appendChild(sterren);
    kop.appendChild(maak('span', 'review-bron', 'Google'));
    var wie = maak('div', 'wie');
    var avatar = maak('span', 'avatar', r.naam.charAt(0).toUpperCase());
    avatar.setAttribute('aria-hidden', 'true');
    var naam = maak('div');
    naam.appendChild(maak('b', null, r.naam));
    if (rvWanneer(r)) naam.appendChild(maak('small', null, rvWanneer(r)));
    wie.appendChild(avatar);
    wie.appendChild(naam);
    var link = maak('a', 'review-link', 'Lees op Google');
    link.href = /^https:\/\//.test(r.url || '') ? r.url : d.url;
    link.target = '_blank';
    link.rel = 'noopener';
    var pijl = maak('span', null, ' ↗');
    pijl.setAttribute('aria-hidden', 'true');
    link.appendChild(pijl);
    link.appendChild(maak('span', 'sr-only', ': de review van ' + r.naam));
    [kop, maak('p', null, r.tekst), wie, link].forEach(function (x) { kaart.appendChild(x); });
    return kaart;
  }
  function rvToepassen(d) {
    rvVelden.forEach(function (veld) {
      var w = veld.getAttribute('data-rv') === 'score' ? d.score_tekst : String(d.aantal);
      if (w && veld.textContent !== w) veld.textContent = w;
    });
    if (d.bron !== 'google' || !d.reviews || !d.reviews.length) return;
    var nieuw = d.reviews.map(function (r) { return r.naam; }).join('|');
    rvRijen.forEach(function (rij, i) {
      var nu = Array.prototype.map.call(rij.querySelectorAll('.wie b'), function (b) { return b.textContent; }).join('|');
      if (nu === nieuw) return;
      rij.textContent = '';
      d.reviews.forEach(function (r) { rij.appendChild(rvKaart(r, d)); });
      rij.scrollLeft = 0;
      if (rvBijwerkers[i]) rvBijwerkers[i]();
    });
  }
  if ((rvVelden.length || rvRijen.length) && window.fetch) {
    var rvBewaard = null;
    try { rvBewaard = JSON.parse(sessionStorage.getItem('iwrap-reviews')); } catch (e) { rvBewaard = null; }
    if (rvBewaard && rvBewaard.d && Date.now() - rvBewaard.t < 30 * 60 * 1000) {
      rvToepassen(rvBewaard.d);
    } else {
      fetch('/api/reviews').then(function (r) { return r.ok ? r.json() : null; }).then(function (d) {
        if (!d || !d.aantal) return;
        try { sessionStorage.setItem('iwrap-reviews', JSON.stringify({ t: Date.now(), d: d })); } catch (e) { /* privévenster */ }
        rvToepassen(d);
      }).catch(function () {});
    }
  }

  /* Vragen die openklappen ------------------------------------------------ */
  /* Het antwoord klapt vloeiend open en dicht, in dezelfde tijd waarin het
     plusje draait. Zonder deze code werkt het gewoon, alleen meteen. */
  document.querySelectorAll('.faq details').forEach(function (vraag) {
    var kop = vraag.querySelector('summary');
    var antwoord = vraag.querySelector('.antwoord');
    if (!kop || !antwoord || weinigBeweging || !antwoord.animate) return;
    var bezig = null;
    kop.addEventListener('click', function (e) {
      e.preventDefault();
      // Een dichte vraag geeft in sommige browsers toch zijn volle hoogte door;
      // dicht is dus altijd 0.
      var van = vraag.open ? antwoord.getBoundingClientRect().height : 0;
      if (bezig) { bezig.cancel(); bezig = null; }
      var open = !vraag.open || vraag.classList.contains('sluit');
      vraag.classList.remove('sluit');
      vraag.open = true;
      var naar = open ? antwoord.scrollHeight : 0;
      var ruimte = getComputedStyle(antwoord).paddingBottom;   // de witruimte onder het antwoord
      if (!open) vraag.classList.add('sluit');
      antwoord.style.overflow = 'hidden';
      bezig = antwoord.animate(
        [{ height: van + 'px', paddingBottom: van ? ruimte : '0px', opacity: van ? 1 : 0 },
         { height: naar + 'px', paddingBottom: open ? ruimte : '0px', opacity: open ? 1 : 0 }],
        { duration: open ? 320 : 240, easing: 'cubic-bezier(.22,.7,.25,1)', fill: 'forwards' });
      var deze = bezig;
      deze.onfinish = function () {
        // Eerst de eindstand vastzetten, dan pas de animatie weghalen: zo is er
        // geen beeldje waarin het antwoord nog even helemaal te zien is.
        if (!open) { vraag.open = false; vraag.classList.remove('sluit'); }
        antwoord.style.overflow = '';
        deze.cancel();
        if (bezig === deze) bezig = null;
      };
    });
  });

  /* Foto's die later laden ------------------------------------------------- */
  /* Zacht in beeld zodra ze binnen zijn (style.css, .beeld-fade). */
  document.querySelectorAll('main img[loading=lazy]').forEach(function (img) {
    function klaar() { img.classList.add('geladen'); }
    if (img.complete && img.naturalWidth) klaar();
    else {
      img.addEventListener('load', klaar, { once: true });
      img.addEventListener('error', klaar, { once: true });
    }
  });
  document.documentElement.classList.add('beeld-fade');

  /* Rustig in beeld schuiven ----------------------------------------------- */
  /* Alleen wat bij het laden nog onder de rand zit: wat je meteen ziet, staat er
     gewoon. Een rij kaarten komt kaart voor kaart binnen; een groot blok (zoals
     het donkere afsluitblok) blijft staan en alleen de inhoud schuift erin. */
  if (weinigBeweging || !('IntersectionObserver' in window)) return;
  var doelen = [];
  document.querySelectorAll('.verschijn').forEach(function (el) {
    var kinderen = [].slice.call(el.children);
    var rij = /grid|flex/.test(getComputedStyle(el).display) || el.classList.contains('faq');
    if (rij && kinderen.length >= 2) doelen.push.apply(doelen, kinderen);
    else doelen.push(el);
  });
  if (!doelen.length) return;
  var rand = window.innerHeight * 0.92;
  var kijker = new IntersectionObserver(function (rijen) {
    var n = 0;
    rijen.forEach(function (r) {
      if (!r.isIntersecting) return;
      var el = r.target;
      kijker.unobserve(el);
      el.style.setProperty('--vertraging', Math.min(n++, 5) * 70 + 'ms');
      el.classList.add('verschijnt');
      el.classList.remove('wacht');
      // Daarna weer de gewone overgangen (zoals het optillen bij aanwijzen).
      setTimeout(function () {
        el.classList.remove('verschijnt');
        el.style.removeProperty('--vertraging');
      }, 1100);
    });
  }, { rootMargin: '0px 0px -8% 0px' });
  doelen.forEach(function (el) {
    if (el.getBoundingClientRect().top < rand) return;
    el.classList.add('wacht');
    kijker.observe(el);
  });
})();
