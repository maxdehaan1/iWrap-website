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
  var stapbalk = form.querySelector('.stapbalk');
  var melding = form.querySelector('.stap-nav .melding');
  var terug = form.querySelector('.stap-nav .terug');
  var verder = form.querySelector('.stap-nav .verder');
  var versturen = form.querySelector('.stap-nav .versturen');
  var nu = 0;
  var bereikt = 0;   // verste stap die de bezoeker heeft gezien
  var bestanden = [];

  /* Werklijst --------------------------------------------------------------
     De kern van het formulier. Elke regel is een soort werk: "2x kozijn,
     onderdorpel en rechter stijl". Wie alles apart wil opsommen maakt regels
     van 1; wie vier identieke kozijnen heeft, doet dat in één regel. Dat levert
     dezelfde opsomming op met een fractie van het klikwerk. */

  var MAX_PER_REGEL = 4;
  var MAXBYTES = 5 * 1024 * 1024;

  var SOORTEN = {
    kozijn: ['kozijn', 'kozijnen'],
    draairaam: ['draairaam', 'draairamen'],
    deur: ['deur', 'deuren'],
    schuifpui: ['schuifpui', 'schuifpuien'],
    dakkapelkozijn: ['dakkapelkozijn', 'dakkapelkozijnen']
  };
  var DELEN = {
    onderdorpel: 'onderdorpel',
    bovendorpel: 'bovendorpel',
    tussendorpel: 'tussendorpel',
    tussendorpels: 'meerdere tussendorpels',
    'linker-stijl': 'linker stijl',
    'rechter-stijl': 'rechter stijl',
    tussenstijl: 'tussenstijl',
    tussenstijlen: 'meerdere tussenstijlen',
    anders: 'iets anders'
  };

  // Let op de naam: 'lijst' is verderop al in gebruik voor de fotolijst, en met
  // var is dat dezelfde variabele in de hele functie. Vandaar 'werklijst'.
  var werklijst = form.querySelector('.werklijst');
  var sjabloon = document.getElementById('werkregel-sjabloon');
  var totaalregel = form.querySelector('.werklijst-totaal');

  function regels() {
    return Array.prototype.slice.call(werklijst.querySelectorAll('.werkregel'));
  }

  function leesRegel(regel) {
    var omvang = regel.querySelector('[data-veld=omvang]:checked');
    var delen = Array.prototype.slice
      .call(regel.querySelectorAll('[data-deel]:checked'))
      .map(function (v) { return v.dataset.deel; });
    var n = parseInt(regel.querySelector('[data-veld=aantal]').value, 10);
    return {
      fotos: regel.fotos || [],
      soort: (regel.querySelector('[data-veld=soort]:checked') || {}).value || '',
      aantal: isNaN(n) || n < 1 ? 1 : n,
      omvang: omvang ? omvang.value : '',
      plek: regel.querySelector('[data-veld=plek]').value.trim(),
      delen: delen
    };
  }

  // Een regel telt pas mee als duidelijk is wát er moet gebeuren: compleet, of
  // bepaalde delen met minstens één deel aangevinkt.
  function regelCompleet(r) {
    if (!r.soort) return false;
    return r.omvang === 'compleet' || (r.omvang === 'delen' && r.delen.length > 0);
  }

  function leesWerklijst() {
    return regels().map(leesRegel).filter(regelCompleet);
  }

  function regelInTekst(r) {
    // Met het maalteken ervoor hoort het enkelvoud: "4x kozijn", niet "4x kozijnen".
    var soort = (SOORTEN[r.soort] || ['element'])[0];
    var wat = r.omvang === 'compleet'
      ? 'compleet rondom'
      : r.delen.map(function (d) { return DELEN[d]; }).join(' + ');
    return r.aantal + '\u00d7 ' + soort + ' \u2014 ' + wat +
           (r.plek ? ' (' + r.plek + ')' : '') +
           (r.fotos.length ? '  [' + r.fotos.length + ' foto' +
            (r.fotos.length === 1 ? '' : "'s") + ']' : '');
  }

  function totaalElementen() {
    return leesWerklijst().reduce(function (som, r) { return som + r.aantal; }, 0);
  }

  function tekenTotaal() {
    if (!totaalregel) return;
    var n = totaalElementen();
    var aantalRegels = leesWerklijst().length;
    totaalregel.textContent = n
      ? 'Samen ' + n + (n === 1 ? ' element' : ' elementen') +
        (aantalRegels > 1 ? ', in ' + aantalRegels + ' blokken' : '')
      : '';
    totaalregel.hidden = !n;
  }

  function nummerRegels() {
    var alle = regels();
    alle.forEach(function (regel, i) {
      regel.querySelector('.regel-nr').textContent = String(i + 1);
      // De eerste regel mag niet weg: dan staat de stap helemaal leeg.
      regel.querySelector('.regel-weg').hidden = alle.length < 2;
    });
  }

  function voegRegelToe(gegevens) {
    var regel = sjabloon.content.firstElementChild.cloneNode(true);

    var aantalVeld = regel.querySelector('[data-veld=aantal]');
    function pas(richting) {
      var n = parseInt(aantalVeld.value, 10);
      if (isNaN(n)) n = 1;
      aantalVeld.value = Math.max(1, Math.min(99, n + richting));
      aantalVeld.dispatchEvent(new Event('change', { bubbles: true }));
    }
    regel.querySelector('.teller-min').addEventListener('click', function () { pas(-1); });
    regel.querySelector('.teller-plus').addEventListener('click', function () { pas(1); });

    // De deelvakjes verschijnen pas als iemand 'bepaalde delen' kiest. Gaat het
    // om complete kozijnen, dan is die hele lijst niet nodig.
    var delenblok = regel.querySelector('.regel-delen');
    function tekenDelen() {
      var gekozen = regel.querySelector('[data-veld=omvang]:checked');
      var toon = gekozen && gekozen.value === 'delen';
      delenblok.hidden = !toon;
      if (!toon) {
        Array.prototype.forEach.call(regel.querySelectorAll('[data-deel]'),
          function (v) { v.checked = false; });
      }
    }
    Array.prototype.forEach.call(regel.querySelectorAll('[data-veld=omvang]'),
      function (v) { v.addEventListener('change', tekenDelen); });

    // Radio's binnen één regel moeten een eigen groep vormen, anders zetten de
    // regels elkaar uit. De naam wordt hier gezet omdat hij uniek moet zijn.
    var sleutel = Math.random().toString(36).slice(2, 9);
    Array.prototype.forEach.call(regel.querySelectorAll('[data-veld=omvang]'),
      function (v) { v.name = 'omvang_' + sleutel; });
    Array.prototype.forEach.call(regel.querySelectorAll('[data-veld=soort]'),
      function (v) { v.name = 'soort_' + sleutel; });

    // Foto's die bij deze regel horen. Zo weet Max meteen welke foto bij welk
    // stuk werk hoort, in plaats van een stapel losse plaatjes bij de aanvraag.
    regel.fotos = [];
    var fotoInvoer = regel.querySelector('.regel-fotos input[type=file]');
    var fotolijst = regel.querySelector('.regel-fotolijst');

    function tekenRegelFotos() {
      fotolijst.innerHTML = '';
      regel.fotos.forEach(function (f, i) {
        var li = document.createElement('li');
        var mini = document.createElement('img');
        mini.alt = '';
        mini.src = URL.createObjectURL(f);
        mini.onload = function () { URL.revokeObjectURL(mini.src); };
        var weg = document.createElement('button');
        weg.type = 'button';
        weg.innerHTML = '&times;';
        weg.setAttribute('aria-label', 'Foto verwijderen');
        weg.addEventListener('click', function () {
          regel.fotos.splice(i, 1);
          tekenRegelFotos();
        });
        li.append(mini, weg);
        fotolijst.append(li);
      });
      fotolijst.hidden = !regel.fotos.length;
    }
    regel.tekenFotos = tekenRegelFotos;

    fotoInvoer.addEventListener('change', function () {
      Array.prototype.forEach.call(fotoInvoer.files, function (f) {
        if (regel.fotos.length >= MAX_PER_REGEL) return;
        if (!/^image\//.test(f.type)) return;
        if (f.size > MAXBYTES) { zeg(f.name + ' is groter dan 5 MB en is overgeslagen.'); return; }
        regel.fotos.push(f);
      });
      fotoInvoer.value = '';
      tekenRegelFotos();
      if (regel.tekenSamenvatting) regel.tekenSamenvatting();
    });

    regel.querySelector('.regel-weg').addEventListener('click', function () {
      regel.remove();
      nummerRegels();
      tekenTotaal();
      bewaar();
    });

    // De kop van het blok leest mee met wat er ingevuld is, zodat je bij drie
    // blokken in een oogopslag ziet welk blok welk werk beschrijft.
    var samenvatting = regel.querySelector('.regel-samenvatting');
    function tekenSamenvatting() {
      var r = leesRegel(regel);
      samenvatting.textContent = regelCompleet(r)
        ? regelInTekst(r)
        : 'Nog in te vullen';
      samenvatting.dataset.leeg = regelCompleet(r) ? 'nee' : 'ja';
    }
    regel.tekenSamenvatting = tekenSamenvatting;
    regel.addEventListener('change', tekenSamenvatting);
    regel.addEventListener('input', tekenSamenvatting);

    if (gegevens) {
      if (gegevens.soort) {
        var soortKeuze = regel.querySelector('[data-veld=soort][value="' + gegevens.soort + '"]');
        if (soortKeuze) soortKeuze.checked = true;
      }
      aantalVeld.value = gegevens.aantal || 1;
      regel.querySelector('[data-veld=plek]').value = gegevens.plek || '';
      if (gegevens.omvang) {
        var keuze = regel.querySelector('[data-veld=omvang][value="' + gegevens.omvang + '"]');
        if (keuze) keuze.checked = true;
      }
      (gegevens.delen || []).forEach(function (d) {
        var v = regel.querySelector('[data-deel="' + d + '"]');
        if (v) v.checked = true;
      });
    }

    werklijst.appendChild(regel);
    tekenDelen();
    regel.tekenFotos();
    tekenSamenvatting();
    nummerRegels();
    return regel;
  }

  form.querySelector('.regel-toevoegen').addEventListener('click', function () {
    var regel = voegRegelToe();
    regel.querySelector('[data-veld=soort]').focus();
    tekenTotaal();
    bewaar();
  });

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

  /* Stappenbalk ------------------------------------------------------------
     Uit de panelen opgebouwd, zodat een stap erbij of eraf hier niets kost.
     Je kunt terugklikken naar elke stap die je al gezien hebt; vooruit gaat via
     de knop, want daar hoort de controle bij. */

  function bouwStapbalk() {
    if (!stapbalk) return;
    var lijst = document.createElement('ol');
    panelen.forEach(function (paneel, i) {
      var li = document.createElement('li');
      var knop = document.createElement('button');
      knop.type = 'button';
      knop.className = 'stapknop';
      knop.innerHTML =
        '<span class="nr" aria-hidden="true">' + (i + 1) + '</span>' +
        '<span class="lab">' + (paneel.dataset.titel || 'Stap ' + (i + 1)) + '</span>';
      knop.addEventListener('click', function () { spring(i); });
      li.appendChild(knop);
      lijst.appendChild(li);
    });
    stapbalk.appendChild(lijst);
  }

  function tekenStapbalk() {
    if (!stapbalk) return;
    var knoppen = stapbalk.querySelectorAll('.stapknop');
    Array.prototype.forEach.call(knoppen, function (knop, i) {
      // Drie standen: waar je bent, wat al ingevuld is, en wat nog moet. Alle
      // drie blijven klikbaar -- vooruit springen controleert onderweg zelf.
      // 'klaar' alleen voor stappen waar je langs bent geweest én die kloppen.
      // Anders krijgt Kleur meteen een vinkje, omdat 'dezelfde kleur' al
      // voorgeselecteerd staat -- en dan lijkt een stap af die je nooit zag.
      var staat = i === nu ? 'nu'
                : (i <= bereikt && geldig(i)) ? 'klaar'
                : 'open';
      knop.dataset.staat = staat;
      knop.disabled = false;
      if (i === nu) knop.setAttribute('aria-current', 'step');
      else knop.removeAttribute('aria-current');
      knop.setAttribute('aria-label',
        'Ga naar stap ' + (i + 1) + ' van ' + panelen.length + ': ' +
        (panelen[i].dataset.titel || '') +
        (staat === 'nu' ? ', hier ben je nu' :
         staat === 'klaar' ? ', ingevuld' : ', nog in te vullen'));
    });
    stapbalk.style.setProperty('--stappen', String(panelen.length));
    stapbalk.style.setProperty('--vordering-f', String(nu / (panelen.length - 1)));
    var teller = form.querySelector('.stap-teller');
    if (teller) teller.textContent = 'Stap ' + (nu + 1) + ' van ' + panelen.length;
  }

  /* Stappen ---------------------------------------------------------------- */

  function toon(i, verschuif) {
    nu = Math.max(0, Math.min(panelen.length - 1, i));
    if (nu > bereikt) bereikt = nu;
    panelen.forEach(function (p, k) { p.hidden = k !== nu; });
    tekenStapbalk();
    if (terug) terug.classList.toggle('onzichtbaar', nu === 0);
    var laatste = nu === panelen.length - 1;
    if (verder) verder.hidden = laatste;
    if (versturen) versturen.hidden = !laatste;
    if (melding) melding.textContent = '';
    if (laatste) vulSamenvatting();
    tekenVervolgvelden();
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

  function geldig(index) {
    var paneel = panelen[index === undefined ? nu : index];
    var eis = paneel.dataset.verplicht;
    if (eis) {
      var namen = eis.split(',');
      for (var i = 0; i < namen.length; i++) {
        var naam = namen[i].trim();
        var gekozen = naam === 'werklijst'
          ? leesWerklijst().length
          : form.querySelectorAll('[name="' + naam + '"]:checked').length;
        if (!gekozen) {
          zeg(paneel.dataset.melding || 'Kies hierboven een antwoord om verder te gaan.');
          return false;
        }
      }
    }
    // Kiest iemand een andere kleur, dan willen we ook weten welke.
    if (paneel.querySelector('[name="kleur"]') &&
        waarde('kleur') === 'anders' && !waarde('kleur_anders')) {
      zeg('Zet er even bij welke kleur je in gedachten hebt.');
      form.querySelector('[name="kleur_anders"]').focus();
      return false;
    }
    var velden = paneel.querySelectorAll('input[required],textarea[required],select[required]');
    for (var j = 0; j < velden.length; j++) {
      if (!velden[j].checkValidity()) {
        // reportValidity werkt alleen op wat in beeld staat
        if (!paneel.hidden) velden[j].reportValidity();
        return false;
      }
    }
    return true;
  }

  /* Springen naar een stap ------------------------------------------------
     Terug mag altijd. Vooruit loopt elke tussenliggende stap na en gaat zo ver
     als mag: is er iets niet ingevuld, dan landt de bezoeker op die stap met de
     bijbehorende melding in plaats van op een foutloze blokkade. */

  function spring(doel) {
    if (doel <= nu) { toon(doel, true); return; }
    for (var i = nu; i < doel; i++) {
      if (!geldig(i)) {
        // toon() wist de melding, dus die zetten we er daarna pas op: anders
        // land je op een eerdere stap zonder te zien waarom je daar bent.
        if (i !== nu) toon(i, true);
        zeg(panelen[i].dataset.melding || 'Vul deze stap eerst in om verder te kunnen.');
        return;
      }
    }
    toon(doel, true);
  }

  function zeg(tekst) {
    if (melding) melding.textContent = tekst;
  }

  if (verder) verder.addEventListener('click', function () { if (geldig()) toon(nu + 1, true); });
  if (terug) terug.addEventListener('click', function () { toon(nu - 1, true); });

  /* Vervolgvelden ----------------------------------------------------------
     Velden die pas verschijnen zodra een bepaalde keuze gemaakt is, zodat het
     formulier niet voller oogt dan het is. */

  function tekenVervolgvelden() {
    Array.prototype.forEach.call(form.querySelectorAll('.vervolgveld'), function (veld) {
      var deel = (veld.dataset.toonBij || '').split('=');
      veld.hidden = waarde(deel[0]) !== deel[1];
    });
  }

  function bijwerken(e) {
    // Velden binnen een werkblok hebben geen name-attribuut (ze worden per blok
    // uitgelezen), dus die moeten hier expliciet doorgelaten worden.
    if (!e.target.name && !e.target.closest('.werkregel')) return;
    zeg('');
    // Op de laatste stap staat de samenvatting in beeld; die moet meelopen met
    // wat er nog wordt ingevuld, anders klopt hij niet met wat er verstuurd wordt.
    if (nu === panelen.length - 1) vulSamenvatting();
    tekenVervolgvelden();
    tekenTotaal();
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
  var MAX = 8;

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

  // Enkelvoud en meervoud, zodat er in de mail geen '1 deuren' staat.
  var VELDEN = [
    ['Het werk', function () {
      return leesWerklijst().map(regelInTekst).join('\n');
    }, 0],
    ['Waar', function () { return labels('bereikbaar').join(', '); }, 1],
    ['Kleur', function () {
      return waarde('kleur') === 'anders'
        ? 'Andere kleur: ' + (waarde('kleur_anders') || 'nog te bepalen')
        : 'Dezelfde kleur houden';
    }, 2],
    ['Adres', function () {
      var p = waarde('postcode'), h = waarde('huisnummer'), pl = waarde('plaats');
      return [p, h, pl].filter(Boolean).join(' ');
    }, 3],
    ["Foto's", function () {
      var bijRegels = leesWerklijst().reduce(function (n, r) { return n + r.fotos.length; }, 0);
      var delen = [];
      if (bijRegels) delen.push(bijRegels + ' bij de werkregels');
      if (bestanden.length) delen.push(bestanden.length + ' overzichtsfoto' +
        (bestanden.length === 1 ? '' : "'s"));
      return delen.join(', ') || 'geen';
    }, 3],
    ['Toelichting', function () { return waarde('toelichting'); }, 3],
    ['Via de site', function () { return vanaf; }, null]
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
      if (v[2] !== null) {
        var knop = document.createElement('button');
        knop.type = 'button';
        knop.className = 'wijzig';
        knop.textContent = 'wijzig';
        knop.addEventListener('click', function () { toon(v[2], true); });
        dd.append(knop);
      }
      dl.append(dt, dd);
    });
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
    return regels.join('\n');
  }

  /* Bewaren ---------------------------------------------------------------- */

  function bewaar() {
    try {
      var d = { stap: nu, bereikt: bereikt, velden: {},
                werk: leesWerklijst().map(function (r) {
                  return { soort: r.soort, aantal: r.aantal, omvang: r.omvang,
                           plek: r.plek, delen: r.delen };
                }) };
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
      (d.werk || []).forEach(function (r) { voegRegelToe(r); });
      bereikt = d.bereikt || d.stap || 0;
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
    bestanden.forEach(function (f, i) {
      data.append('overzichtsfoto_' + (i + 1), f, 'overzicht-' + (i + 1) + '-' + f.name);
    });
    // Foto's per werkregel krijgen het regelnummer in hun bestandsnaam, zodat in
    // de mailbox meteen te zien is bij welk stuk werk ze horen.
    leesWerklijst().forEach(function (r, ri) {
      r.fotos.forEach(function (f, fi) {
        data.append('foto_regel' + (ri + 1) + '_' + (fi + 1), f,
                    'regel-' + (ri + 1) + '-' + r.soort + '-' + (fi + 1) + '.jpg');
      });
    });

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
    ['bereikbaar', 'kleur'].forEach(function (n) { d[n] = waarden(n); });
    d.werklijst = leesWerklijst().map(function (r) {
      return { soort: r.soort, aantal: r.aantal, omvang: r.omvang,
               plek: r.plek, delen: r.delen, aantal_fotos: r.fotos.length };
    });
    d.totaal_elementen = totaalElementen();
    d.kleur_anders = waarde('kleur_anders');
    d.via_de_site = vanaf;
    d.aantal_overzichtsfotos = bestanden.length;
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
        : "<p>Je aanvraag is binnen. We kijken je foto's na en laten je weten wat " +
          'het gaat kosten. Zijn er dingen die we niet goed kunnen zien, dan bellen we ' +
          'je even.</p>') +
      '<div class="knoprij"><a class="knop knop-tweede" href="/voorbeelden">Bekijk ons werk</a>' +
      '<a class="knop knop-tweede" href="/veelgestelde-vragen">Veelgestelde vragen</a></div>' +
      '</div>';
    kaart.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }

  /* Opstarten -------------------------------------------------------------- */

  /* Opstarten -------------------------------------------------------------- */

  // Klikt iemand op de homepage op een klacht, dan onthouden we dat stilletjes.
  // Voor de prijs maakt het niet uit -- de werkzaamheden zijn hetzelfde, wat er
  // ook mis is -- maar het is voor ons wel prettig om te weten waarmee iemand
  // binnenkomt. We laten de bezoeker er dus geen stap voor invullen.
  var KLACHTEN = {
    verweerd: 'verweerd of gebarsten',
    'laat-los': 'folie laat los',
    blaasjes: 'blaasjes of scheuren',
    lijmlaag: 'gele lijmlaag zichtbaar',
    spanningsplooien: 'plooien of kreukels',
    scheuren: 'krassen of stootschade'
  };
  var vanaf = KLACHTEN[new URLSearchParams(window.location.search).get('klacht')] || '';

  bouwStapbalk();

  var startStap = herstel();
  if (!regels().length) voegRegelToe();   // altijd één regel om mee te beginnen
  tekenTotaal();
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
    stapbalk.appendChild(terugmelding);
  }
})();
