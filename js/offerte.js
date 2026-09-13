/* ---------------------------------------------------------------------------
   De offerte-aanvraag.

   Uitgangspunt: elke vraag hier is een vraag die anders per mail gesteld moet
   worden. Wie dit formulier invult, stuurt een aanvraag waar meteen een
   offerte van gemaakt kan worden -- zonder eerst drie keer heen en weer te
   mailen over aantallen, bereikbaarheid en kleur.

   Zonder JavaScript valt de pagina terug op een gewoon formulier (.geen-js).
   --------------------------------------------------------------------------- */
(function () {
  'use strict';

  var form = document.getElementById('offerteformulier');
  if (!form) return;

  /* Waar de aanvraag heen gaat. Zolang hier de plaatshouder staat, valt het
     formulier terug op een e-mail met dezelfde samenvatting erin -- de site
     werkt dus ook voordat de koppeling geregeld is. Zie README. */
  var ACCESS_KEY = 'VERVANG_MET_JE_WEB3FORMS_KEY';
  var ENDPOINT = 'https://api.web3forms.com/submit';
  var MAILBOX = form.dataset.mailbox || 'info@iwrap.nl';
  var OPSLAG = 'iwrap-offerte-concept';

  var panelen = Array.prototype.slice.call(form.querySelectorAll('.stap-paneel'));
  var balk = form.querySelector('.voortgang-balk i');
  var teller = form.querySelector('.voortgang-nu');
  var titelNu = form.querySelector('.voortgang-titel');
  var melding = form.querySelector('.stap-nav .melding');
  var terug = form.querySelector('.stap-nav .terug');
  var verder = form.querySelector('.stap-nav .verder');
  var versturen = form.querySelector('.stap-nav .versturen');
  var nu = 0;
  var bestanden = [];

  /* Prijsindicatie --------------------------------------------------------
     De bedragen zijn dezelfde als op kozijnwrap.nl en in de offertes. Wijzig
     ze hier én daar, anders lezen klanten twee verschillende verhalen. */
  var PRIJS = {
    klein: {
      bedrag: 'Meestal rond de €500',
      uitleg: 'Een paar dorpels is precies het soort klus waar we in één dagdeel klaar mee zijn. Kleine opdrachten zijn welkom — daar doen we niet moeilijk over.'
    },
    middel: {
      bedrag: 'Doorgaans tussen de €500 en €3.000',
      uitleg: 'Waar je precies uitkomt hangt af van het aantal kozijnen, de afmetingen en hoeveel er per kozijn hersteld moet worden.'
    },
    groot: {
      bedrag: 'Hiervoor komen we langs voor een opname',
      uitleg: 'Bij meer dan tien kozijnen loopt een inschatting op afstand te ver uiteen om er een eerlijk bedrag aan te hangen. We meten het op locatie in en sturen daarna een vaste prijs.'
    }
  };

  function bedrag() {
    var omvang = waarde('omvang');
    var delen = waarden('onderdelen');
    if (!omvang) return null;
    if (omvang === 'meer-dan-10') return PRIJS.groot;
    var alleenDorpels = delen.length === 1 && delen[0] === 'onderdorpels';
    if (alleenDorpels && (omvang === '1' || omvang === '2-4')) return PRIJS.klein;
    return PRIJS.middel;
  }

  function prijsNoten() {
    var noten = [];
    if (waarden('onderdelen').indexOf('draaiende-delen') > -1) {
      noten.push('Voor de draaiende delen komen we ook binnen: die moeten open om de folie netjes om de rand te kunnen zetten.');
    }
    var b = waarde('bereikbaar');
    if (b === 'hoger' || b === 'gemengd') {
      noten.push('Boven de eerste verdieping komt er een ladder, steiger of hoogwerker bij. Dat zetten we apart in de offerte, zodat je ziet wat het kost.');
    }
    return noten;
  }

  function toonPrijs() {
    var blok = form.querySelector('.prijsblok');
    if (!blok) return;
    var p = bedrag();
    if (!p) { blok.hidden = true; return; }
    blok.hidden = false;
    blok.querySelector('.bedrag').textContent = p.bedrag;
    blok.querySelector('.prijs-uitleg').textContent = p.uitleg;
    var noten = prijsNoten();
    var notenEl = blok.querySelector('.waarschuwing');
    notenEl.innerHTML = noten.map(function (n) { return '<p>' + n + '</p>'; }).join('');
    notenEl.hidden = noten.length === 0;
  }

  /* Uitlezen --------------------------------------------------------------- */

  function waarde(naam) {
    var el = form.querySelector('[name="' + naam + '"]:checked') ||
             form.querySelector('input[name="' + naam + '"]:not([type=radio]):not([type=checkbox]), textarea[name="' + naam + '"], select[name="' + naam + '"]');
    return el ? el.value.trim() : '';
  }
  function waarden(naam) {
    return Array.prototype.map.call(
      form.querySelectorAll('[name="' + naam + '"]:checked'),
      function (el) { return el.value; }
    );
  }
  function labels(naam) {
    return Array.prototype.map.call(
      form.querySelectorAll('[name="' + naam + '"]:checked'),
      function (el) {
        var t = el.parentNode.querySelector('.titel');
        return t ? t.textContent.trim() : el.value;
      }
    );
  }

  /* Stappen ---------------------------------------------------------------- */

  function toon(i, verschuif) {
    nu = Math.max(0, Math.min(panelen.length - 1, i));
    panelen.forEach(function (p, k) { p.hidden = k !== nu; });
    var pct = ((nu + 1) / panelen.length) * 100;
    if (balk) balk.style.width = pct + '%';
    if (teller) teller.textContent = String(nu + 1);
    if (titelNu) titelNu.textContent = panelen[nu].dataset.titel || '';
    if (terug) terug.hidden = nu === 0;
    var laatste = nu === panelen.length - 1;
    if (verder) verder.hidden = laatste;
    if (versturen) versturen.hidden = !laatste;
    if (melding) melding.textContent = '';
    if (laatste) vulSamenvatting();
    toonPrijs();
    // Focus naar de kop van de nieuwe stap, anders weten schermlezers niet
    // dat er iets veranderd is.
    var kop = panelen[nu].querySelector('h2');
    if (kop) { kop.setAttribute('tabindex', '-1'); kop.focus({ preventScroll: true }); }
    if (verschuif) {
      var top = form.getBoundingClientRect().top + window.scrollY - 90;
      window.scrollTo({ top: top, behavior: 'smooth' });
    }
    bewaar();
  }

  function geldig() {
    var paneel = panelen[nu];
    var eis = paneel.dataset.verplicht;
    if (eis) {
      var namen = eis.split(',');
      for (var i = 0; i < namen.length; i++) {
        var naam = namen[i].trim();
        var gekozen = form.querySelectorAll('[name="' + naam + '"]:checked').length;
        if (!gekozen) {
          zeg(paneel.dataset.melding || 'Kies hierboven een antwoord om verder te gaan.');
          return false;
        }
      }
    }
    var velden = paneel.querySelectorAll('input[required],textarea[required],select[required]');
    for (var j = 0; j < velden.length; j++) {
      if (!velden[j].checkValidity()) {
        velden[j].reportValidity();
        return false;
      }
    }
    return true;
  }

  function zeg(tekst) {
    if (melding) melding.textContent = tekst;
  }

  if (verder) verder.addEventListener('click', function () { if (geldig()) toon(nu + 1, true); });
  if (terug) terug.addEventListener('click', function () { toon(nu - 1, true); });

  function bijwerken(e) {
    if (!e.target.name) return;
    zeg('');
    toonPrijs();
    // Op de laatste stap staat de samenvatting in beeld; die moet meelopen met
    // wat er nog wordt ingevuld, anders klopt hij niet met wat er verstuurd wordt.
    if (nu === panelen.length - 1) vulSamenvatting();
    bewaar();
  }
  form.addEventListener('change', bijwerken);
  form.addEventListener('input', bijwerken);

  // Enter in een tekstveld gaat naar de volgende stap in plaats van te versturen.
  form.addEventListener('keydown', function (e) {
    if (e.key === 'Enter' && e.target.tagName === 'INPUT' && e.target.type !== 'file') {
      e.preventDefault();
      if (nu < panelen.length - 1 && geldig()) toon(nu + 1, true);
    }
  });

  /* Foto's ----------------------------------------------------------------- */

  var zone = form.querySelector('.dropzone');
  var invoer = form.querySelector('input[type=file]');
  var lijst = form.querySelector('.bestandenlijst');
  var MAX = 6, MAXBYTES = 5 * 1024 * 1024;

  function tekenBestanden() {
    if (!lijst) return;
    lijst.innerHTML = '';
    bestanden.forEach(function (f, i) {
      var li = document.createElement('li');
      var img = document.createElement('img');
      img.className = 'mini';
      img.alt = '';
      img.src = URL.createObjectURL(f);
      img.onload = function () { URL.revokeObjectURL(img.src); };
      var naam = document.createElement('span');
      naam.textContent = f.name + ' (' + Math.round(f.size / 1024) + ' kB)';
      var weg = document.createElement('button');
      weg.type = 'button';
      weg.className = 'weg';
      weg.innerHTML = '&times;';
      weg.setAttribute('aria-label', 'Verwijder ' + f.name);
      weg.addEventListener('click', function () { bestanden.splice(i, 1); tekenBestanden(); });
      li.append(img, naam, weg);
      lijst.append(li);
    });
  }

  function voegToe(fileList) {
    Array.prototype.forEach.call(fileList, function (f) {
      if (bestanden.length >= MAX) return;
      if (!/^image\//.test(f.type)) return;
      if (f.size > MAXBYTES) { zeg(f.name + ' is groter dan 5 MB en is overgeslagen.'); return; }
      bestanden.push(f);
    });
    tekenBestanden();
  }

  if (zone && invoer) {
    zone.addEventListener('click', function () { invoer.click(); });
    zone.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); invoer.click(); }
    });
    invoer.addEventListener('change', function () { voegToe(invoer.files); invoer.value = ''; });
    ['dragenter', 'dragover'].forEach(function (t) {
      zone.addEventListener(t, function (e) { e.preventDefault(); zone.classList.add('over'); });
    });
    ['dragleave', 'drop'].forEach(function (t) {
      zone.addEventListener(t, function (e) { e.preventDefault(); zone.classList.remove('over'); });
    });
    zone.addEventListener('drop', function (e) { voegToe(e.dataTransfer.files); });
  }

  /* Samenvatting ----------------------------------------------------------- */

  var VELDEN = [
    ['Wat je ziet', function () { return labels('klachten').join(', '); }, 0],
    ['Te herstellen', function () { return labels('onderdelen').join(', '); }, 1],
    ['Omvang', function () { return labels('omvang').join(', '); }, 2],
    ['Bereikbaarheid', function () { return labels('bereikbaar').join(', '); }, 3],
    ['Kleur', function () { return labels('kleur').join(', '); }, 4],
    ['Adres', function () {
      var p = waarde('postcode'), h = waarde('huisnummer'), pl = waarde('plaats');
      return [p, h, pl].filter(Boolean).join(' ');
    }, 5],
    ['Wanneer', function () { return labels('wanneer').join(', '); }, 5],
    ["Foto's", function () { return bestanden.length ? bestanden.length + ' meegestuurd' : 'geen'; }, 5],
    ['Toelichting', function () { return waarde('toelichting'); }, 5]
  ];

  function vulSamenvatting() {
    var dl = form.querySelector('.samenvatting dl');
    if (!dl) return;
    dl.innerHTML = '';
    VELDEN.forEach(function (v) {
      var tekst = v[1]();
      if (!tekst) return;
      var dt = document.createElement('dt');
      dt.textContent = v[0];
      var dd = document.createElement('dd');
      dd.textContent = tekst;
      var knop = document.createElement('button');
      knop.type = 'button';
      knop.className = 'wijzig';
      knop.textContent = 'wijzig';
      knop.addEventListener('click', function () { toon(v[2], true); });
      dd.append(knop);
      dl.append(dt, dd);
    });
    var p = bedrag();
    if (p) {
      var dt2 = document.createElement('dt');
      dt2.textContent = 'Indicatie';
      var dd2 = document.createElement('dd');
      dd2.textContent = p.bedrag;
      dl.append(dt2, dd2);
    }
  }

  function samenvattingTekst() {
    var regels = ['AANVRAAG VIA IWRAP.NL', ''];
    regels.push('Naam:      ' + waarde('naam'));
    regels.push('E-mail:    ' + waarde('email'));
    regels.push('Telefoon:  ' + waarde('telefoon'));
    regels.push('');
    VELDEN.forEach(function (v) {
      var t = v[1]();
      if (t) regels.push((v[0] + ':').padEnd(11) + t);
    });
    var p = bedrag();
    if (p) { regels.push('', 'Indicatie: ' + p.bedrag); }
    prijsNoten().forEach(function (n) { regels.push('Let op:    ' + n); });
    return regels.join('\n');
  }

  /* Bewaren ---------------------------------------------------------------- */

  function bewaar() {
    try {
      var d = { stap: nu, velden: {} };
      form.querySelectorAll('input,textarea,select').forEach(function (el) {
        if (!el.name || el.type === 'file') return;
        if (el.type === 'radio' || el.type === 'checkbox') {
          if (el.checked) (d.velden[el.name] = d.velden[el.name] || []).push(el.value);
        } else if (el.value) {
          d.velden[el.name] = el.value;
        }
      });
      localStorage.setItem(OPSLAG, JSON.stringify(d));
    } catch (e) { /* privémodus: dan bewaren we gewoon niets */ }
  }

  function herstel() {
    try {
      var d = JSON.parse(localStorage.getItem(OPSLAG) || 'null');
      if (!d) return 0;
      Object.keys(d.velden).forEach(function (naam) {
        var v = d.velden[naam];
        if (Array.isArray(v)) {
          v.forEach(function (x) {
            var el = form.querySelector('[name="' + naam + '"][value="' + CSS.escape(x) + '"]');
            if (el) el.checked = true;
          });
        } else {
          var el2 = form.querySelector('[name="' + naam + '"]');
          if (el2) el2.value = v;
        }
      });
      return d.stap || 0;
    } catch (e) { return 0; }
  }

  function wisOpslag() {
    try { localStorage.removeItem(OPSLAG); } catch (e) {}
  }

  /* Versturen -------------------------------------------------------------- */

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    if (!geldig()) return;

    var tekst = samenvattingTekst();

    if (ACCESS_KEY === 'VERVANG_MET_JE_WEB3FORMS_KEY') {
      // Nog geen koppeling: dan doen we het via de mailclient van de bezoeker.
      var onderwerp = 'Offerteaanvraag ' + (waarde('naam') || '') + ' — ' +
                      (waarde('postcode') || '');
      window.location.href = 'mailto:' + MAILBOX +
        '?subject=' + encodeURIComponent(onderwerp) +
        '&body=' + encodeURIComponent(tekst + "\n\n(Stuur je foto's als bijlage mee.)");
      bedanktScherm(true);
      return;
    }

    var data = new FormData();
    data.append('access_key', ACCESS_KEY);
    data.append('subject', 'Offerteaanvraag ' + waarde('naam') + ' — ' + waarde('postcode'));
    data.append('from_name', waarde('naam'));
    data.append('replyto', waarde('email'));
    data.append('samenvatting', tekst);
    // Losse velden erbij, zodat een CRM of Make.com-scenario ze kan uitlezen
    // zonder de tekst te hoeven ontleden.
    data.append('gegevens_json', JSON.stringify(gegevens()));
    bestanden.forEach(function (f, i) { data.append('foto_' + (i + 1), f, f.name); });

    versturen.disabled = true;
    versturen.textContent = 'Bezig met versturen…';

    fetch(ENDPOINT, { method: 'POST', body: data })
      .then(function (r) { return r.json(); })
      .then(function (r) {
        if (r.success) { bedanktScherm(false); }
        else { throw new Error(r.message || 'onbekend'); }
      })
      .catch(function () {
        versturen.disabled = false;
        versturen.textContent = 'Aanvraag versturen';
        zeg('Het versturen lukte niet. Mail je aanvraag naar ' + MAILBOX +
            ' of bel ons — dan pakken we het zo op.');
      });
  });

  function gegevens() {
    var d = {};
    ['naam', 'email', 'telefoon', 'postcode', 'huisnummer', 'plaats', 'toelichting']
      .forEach(function (n) { d[n] = waarde(n); });
    ['klachten', 'onderdelen', 'omvang', 'bereikbaar', 'kleur', 'wanneer']
      .forEach(function (n) { d[n] = waarden(n); });
    var p = bedrag();
    d.indicatie = p ? p.bedrag : '';
    d.aantal_fotos = bestanden.length;
    d.bron = document.referrer || '';
    return d;
  }

  function bedanktScherm(viaMail) {
    wisOpslag();
    var kaart = form.closest('.offerte-kaart');
    var naam = waarde('naam').split(' ')[0];
    kaart.innerHTML =
      '<div class="bedankt">' +
      '<div class="vink" aria-hidden="true"></div>' +
      '<h2>Bedankt' + (naam ? ', ' + naam : '') + '</h2>' +
      (viaMail
        ? '<p>Je mailprogramma is geopend met de aanvraag erin. Controleer hem even, ' +
          "voeg je foto's toe als bijlage en verstuur hem — dan komt hij bij ons binnen.</p>"
        : '<p>Je aanvraag is binnen. We kijken hem na en sturen je binnen één werkdag ' +
          "een reactie. Zijn er dingen die we op de foto's niet goed kunnen zien, dan " +
          'bellen we je even.</p>') +
      '<div class="knoprij"><a class="knop knop-tweede" href="/resultaten">Bekijk ons werk</a>' +
      '<a class="knop knop-tweede" href="/veelgestelde-vragen">Veelgestelde vragen</a></div>' +
      '</div>';
    kaart.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }

  /* Opstarten -------------------------------------------------------------- */

  // Vanaf de homepage kan er al een klacht meegegeven zijn (?klacht=verkleurd).
  var vraag = new URLSearchParams(window.location.search).get('klacht');
  if (vraag) {
    var vooraf = form.querySelector('[name="klachten"][value="' + CSS.escape(vraag) + '"]');
    if (vooraf) vooraf.checked = true;
  }

  var startStap = vraag ? 0 : herstel();
  toon(startStap, false);

  // Wie halverwege weggeklikt was, komt terug op de stap waar hij gebleven is.
  // Dan moet het formulier ook in beeld staan -- de browser zet je anders terug
  // op de scrollpositie van vorige keer, wat onderaan de pagina kan zijn.
  if (startStap > 0) {
    if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
    window.scrollTo({
      top: form.getBoundingClientRect().top + window.scrollY - 90,
      behavior: 'auto'
    });
    var terugmelding = document.createElement('p');
    terugmelding.className = 'hervat';
    terugmelding.innerHTML = 'We hebben je eerdere antwoorden bewaard. ' +
      '<button type="button">Opnieuw beginnen</button>';
    terugmelding.querySelector('button').addEventListener('click', function () {
      wisOpslag();
      window.location.href = window.location.pathname;
    });
    form.querySelector('.voortgang').append(terugmelding);
  }
})();
