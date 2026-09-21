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

  /* Prijsindicatie --------------------------------------------------------
     De bedragen zijn dezelfde als op kozijnwrap.nl en in de offertes. Wijzig
     ze hier én daar, anders lezen klanten twee verschillende verhalen. */
  var PRIJS = {
    klein: {
      bedrag: 'Meestal rond de €500',
      uitleg: 'Een paar dorpels is precies het soort klus waar we in één dagdeel klaar mee zijn. Kleine opdrachten zijn welkom — daar doen we niet moeilijk over.'
    },
    middel: {
      bedrag: 'Hier maken we een prijs van op basis van je foto\u0027s',
      uitleg: 'Bij meerdere kozijnen loopt het te ver uiteen om er nu een bedrag aan te hangen: afmetingen, aantal en hoeveel er per kozijn moet gebeuren schelen zomaar een factor drie. Met je foto\u0027s erbij geven we je een vaste totaalprijs.'
    },
    groot: {
      bedrag: 'Hiervoor komen we langs voor een opname',
      uitleg: 'Bij meer dan tien kozijnen loopt een inschatting op afstand te ver uiteen om er een eerlijk bedrag aan te hangen. We meten het op locatie in en sturen daarna een vaste prijs.'
    }
  };

  var TELVELDEN = ['aantal_kozijnen', 'aantal_draairamen',
                   'aantal_deuren', 'aantal_schuifpuien'];

  function aantal(naam) {
    var el = form.querySelector('[name="' + naam + '"]');
    if (!el) return 0;
    var rij = el.closest('.teller');
    if (rij && rij.hidden) return 0;
    var n = parseInt(el.value, 10);
    return isNaN(n) || n < 0 ? 0 : n;
  }

  function totaalAantal() {
    return TELVELDEN.reduce(function (som, n) { return som + aantal(n); }, 0);
  }

  function bedrag() {
    var totaal = totaalAantal();
    if (!totaal) return null;
    // Een schuifpui is fors groter dan een kozijn en telt daarom dubbel mee.
    var gewicht = totaal + aantal('aantal_schuifpuien');
    if (gewicht > 10) return PRIJS.groot;
    if (waarde('omvangsoort') === 'delen' && gewicht <= 4) return PRIJS.klein;
    return PRIJS.middel;
  }

  function prijsNoten() {
    var noten = [];
    if (waarden('onderdelen').indexOf('draaiende-delen') > -1 ||
        aantal('aantal_draairamen') || aantal('aantal_deuren')) {
      noten.push('Voor de draaiende delen komen we ook binnen: die moeten open om de folie netjes om de rand te kunnen zetten.');
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
      knop.addEventListener('click', function () {
        if (i <= bereikt) toon(i, true);
        else zeg('Vul eerst de stappen hiervoor in.');
      });
      li.appendChild(knop);
      lijst.appendChild(li);
    });
    stapbalk.appendChild(lijst);
  }

  function tekenStapbalk() {
    if (!stapbalk) return;
    var knoppen = stapbalk.querySelectorAll('.stapknop');
    Array.prototype.forEach.call(knoppen, function (knop, i) {
      // Vier standen: waar je bent, wat je af hebt, wat je al gezien hebt maar
      // verderop ligt (ook klikbaar), en wat nog niet aan de beurt is.
      var staat = i === nu ? 'nu'
                : i < nu ? 'klaar'
                : i <= bereikt ? 'bezocht'
                : 'later';
      knop.dataset.staat = staat;
      knop.disabled = i > bereikt;
      if (i === nu) knop.setAttribute('aria-current', 'step');
      else knop.removeAttribute('aria-current');
      knop.setAttribute('aria-label',
        'Stap ' + (i + 1) + ' van ' + panelen.length + ': ' +
        (panelen[i].dataset.titel || '') +
        (staat === 'nu' ? ', hier ben je nu' :
         staat === 'later' ? ', nog niet beschikbaar' : ', ingevuld'));
    });
    stapbalk.style.setProperty('--stappen', String(panelen.length));
    stapbalk.style.setProperty('--vordering-f', String(nu / (panelen.length - 1)));
  }

  /* Stappen ---------------------------------------------------------------- */

  function toon(i, verschuif) {
    nu = Math.max(0, Math.min(panelen.length - 1, i));
    if (nu > bereikt) bereikt = nu;
    panelen.forEach(function (p, k) { p.hidden = k !== nu; });
    tekenStapbalk();
    if (terug) terug.hidden = nu === 0;
    var laatste = nu === panelen.length - 1;
    if (verder) verder.hidden = laatste;
    if (versturen) versturen.hidden = !laatste;
    if (melding) melding.textContent = '';
    if (laatste) vulSamenvatting();
    toonPrijs();
    tekenVervolgvelden();
    tekenTellers();
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
        var gekozen = naam === 'aantallen'
          ? totaalAantal()
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

  /* Tellers ----------------------------------------------------------------
     Plus- en minknoppen naast een gewoon getalveld: sneller aan te tikken op een
     telefoon, en wie liever typt kan dat gewoon doen. */

  Array.prototype.forEach.call(form.querySelectorAll('.teller'), function (teller) {
    var invoer = teller.querySelector('input');
    function pas(richting) {
      var n = parseInt(invoer.value, 10);
      if (isNaN(n)) n = 0;
      invoer.value = Math.max(0, Math.min(99, n + richting));
      invoer.dispatchEvent(new Event('change', { bubbles: true }));
    }
    teller.querySelector('.teller-min').addEventListener('click', function () { pas(-1); });
    teller.querySelector('.teller-plus').addEventListener('click', function () { pas(1); });
  });

  function tekenTellers() {
    var gekozen = waarden('onderdelen');
    Array.prototype.forEach.call(form.querySelectorAll('.teller'), function (teller) {
      // Alleen de soorten tonen die bij stap 1 zijn aangevinkt. Anders kun je
      // 'alleen kozijnen' kiezen en daarna toch deuren tellen, en dan spreekt
      // de aanvraag zichzelf tegen.
      var hoort = !teller.dataset.bij || gekozen.indexOf(teller.dataset.bij) > -1;
      teller.hidden = !hoort;
      var invoer = teller.querySelector('input');
      if (!hoort && invoer.value !== '0') invoer.value = '0';
      teller.dataset.gevuld = parseInt(invoer.value, 10) > 0 ? 'ja' : 'nee';
    });
  }

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
    if (!e.target.name) return;
    zeg('');
    toonPrijs();
    // Op de laatste stap staat de samenvatting in beeld; die moet meelopen met
    // wat er nog wordt ingevuld, anders klopt hij niet met wat er verstuurd wordt.
    if (nu === panelen.length - 1) vulSamenvatting();
    tekenVervolgvelden();
    tekenTellers();
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

  // Enkelvoud en meervoud, zodat er in de mail geen '1 deuren' staat.
  var TELNAMEN = {
    aantal_kozijnen: ['kozijn', 'kozijnen'],
    aantal_draairamen: ['draairaam', 'draairamen'],
    aantal_deuren: ['deur', 'deuren'],
    aantal_schuifpuien: ['schuifpui', 'schuifpuien']
  };

  var VELDEN = [
    ['Werk', function () {
      var soort = labels('omvangsoort').join('');
      var welke = waarde('welke_delen');
      return soort + (welke ? ' (' + welke + ')' : '');
    }, 0],
    ['Onderdelen', function () { return labels('onderdelen').join(', '); }, 0],
    ['Aantallen', function () {
      return TELVELDEN.filter(function (n) { return aantal(n); })
        .map(function (n) {
          var k = aantal(n);
          return k + ' ' + TELNAMEN[n][k === 1 ? 0 : 1];
        }).join(', ');
    }, 1],
    ['Waar', function () { return labels('bereikbaar').join(', '); }, 2],
    ['Kleur', function () {
      return waarde('kleur') === 'anders'
        ? 'Andere kleur: ' + (waarde('kleur_anders') || 'nog te bepalen')
        : 'Dezelfde kleur houden';
    }, 3],
    ['Adres', function () {
      var p = waarde('postcode'), h = waarde('huisnummer'), pl = waarde('plaats');
      return [p, h, pl].filter(Boolean).join(' ');
    }, 5],
    ['Wanneer', function () { return labels('wanneer').join(', '); }, 5],
    ["Foto's", function () { return bestanden.length ? bestanden.length + ' meegestuurd' : 'geen'; }, 5],
    ['Toelichting', function () { return waarde('toelichting'); }, 4],
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
      var d = { stap: nu, bereikt: bereikt, velden: {} };
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
    ['onderdelen', 'omvangsoort', 'bereikbaar', 'kleur', 'wanneer']
      .forEach(function (n) { d[n] = waarden(n); });
    TELVELDEN.forEach(function (n) { d[n] = aantal(n); });
    d.welke_delen = waarde('welke_delen');
    d.kleur_anders = waarde('kleur_anders');
    d.via_de_site = vanaf;
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
