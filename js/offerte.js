/* ---------------------------------------------------------------------------
   De offerteaanvraag.

   De klant kiest zelf hoe hij laat zien wat er moet gebeuren:

     streep  per kozijn een foto, en daarop met de vinger aangestreept wat er
             moet gebeuren (js/aanstrepen.js) -- of "het hele kozijn"
     maten   per kozijn een foto, en de delen met hun lengte: "onderdorpel
             1,60", "stijl 2 x 1,30" -- of breedte x hoogte bij een heel kozijn
     papier  een foto van een eigen tekening, plus van elk kozijn een foto

   Bij alle drie hoort een foto van het hele kozijn: daaraan ziet Max het
   profiel, de kleur en of herstel kan.

   Foto's worden op de telefoon verkleind en in de browser bewaard
   (js/fotos.js); er gaat niets naar de server tot de klant op "Aanvraag
   versturen" drukt. Dan in drie stappen: de antwoorden, elke foto apart, en
   "versturen" -- zie backend/aanvragen.py. Max krijgt één mail met alle
   foto's als bijlage, de klant een bevestiging.

   Valkuil bij het bewerken: Nederlandse teksten met een apostrof altijd
   tussen dubbele aanhalingstekens ("foto's"). build.py controleert dat.
   --------------------------------------------------------------------------- */
(function () {
  "use strict";

  var form = document.getElementById("offerteformulier");
  if (!form || !window.IwrapFotos || !window.IwrapAanstrepen) return;

  var Fotos = window.IwrapFotos;
  var Strepen = window.IwrapAanstrepen;
  var API = form.dataset.api || "/api";
  var MAILBOX = form.dataset.mailbox || "info@iwrap.nl";
  var OPSLAG = "iwrap-offerte-2";
  var MAX_KOZIJNEN = 20;

  // De vorige versie van het formulier bewaarde iets anders; dat ruimen we op.
  try { localStorage.removeItem("iwrap-offerte-concept"); } catch (e) { /* privémodus */ }

  var WAAR = { "begane-grond": "Begane grond", verdieping: "Verdieping", dakkapel: "Dakkapel" };
  var SNELKNOPPEN = ["Onderdorpel", "Stijl", "Bovendorpel", "Tussenstijl", "Tussendorpel",
                     "Onderdorpel draairaam", "Iets anders"];

  var KOPPEN = {
    streep: ["Foto's maken en aanstrepen",
             "Maak van elk kozijn een foto, met het hele kozijn erop. Daarna streep je met je " +
             "vinger aan wat er moet gebeuren. Begin met kozijn 1; meer kozijnen voeg je eronder toe."],
    maten: ["Foto's maken en de maten erbij",
            "Maak van elk kozijn een foto, met het hele kozijn erop. Daarna tik je aan welke " +
            "delen hersteld moeten worden en typ je hoe lang ze zijn."],
    papier: ["Je tekening en je foto's",
             "Teken je kozijnen op papier en maak er een foto van. Doe er van elk kozijn ook een " +
             "foto bij, met het hele kozijn erop."]
  };

  /* Toestand ---------------------------------------------------------------
     Alles wat de klant invult over zijn kozijnen staat in 'staat'; de rest
     (kleur, gegevens) in gewone formuliervelden. De foto's zelf staan als
     Blob in 'blobs', onder een sleutel die ook in IndexedDB gebruikt wordt. */

  var staat = { manier: "", kozijnen: [], papier: { tekening: [], kozijnfoto: [] }, verzending: null };
  var blobs = {};
  var urls = {};
  var voorbeelden = {};   // kozijn-id -> object-URL van de foto met strepen

  function sleutel(soort) {
    return soort + "-" + Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
  }

  function nieuwKozijn() {
    return { id: sleutel("k"), foto: "", dichtbij: "", strepen: [], werk: "delen", regels: [],
             breedte: "", hoogte: "", waar: "", plek: "", aantal: 1 };
  }

  /* Lengtes ----------------------------------------------------------------
     Precies zoals de server ze leest (backend/aanvragen.py, cm()): 160,
     "1,60" en "1.6" zijn allemaal 160 cm. Tot en met 10 is het in meters. */

  function cm(waarde) {
    var m = String(waarde || "").match(/\d+(?:[.,]\d+)?/);
    if (!m) return 0;
    var getal = parseFloat(m[0].replace(",", "."));
    if (!(getal > 0)) return 0;
    return Math.round(getal <= 10 ? getal * 100 : getal);
  }

  function meter(centimeters) {
    return (centimeters / 100).toFixed(2).replace(".", ",") + " m";
  }

  function geldigeRegels(k) {
    return k.regels.filter(function (r) {
      var c = cm(r.lengte);
      return r.deel.trim() && c >= 5 && c <= 1500;
    });
  }

  /* Foto's ----------------------------------------------------------------- */

  function fotoUrl(s) {
    if (!s || !blobs[s]) return "";
    if (!urls[s]) urls[s] = URL.createObjectURL(blobs[s]);
    return urls[s];
  }

  function voegFotoToe(bestand) {
    return Fotos.verklein(bestand).then(function (blob) {
      var s = sleutel("f");
      blobs[s] = blob;
      Fotos.bewaar(s, blob);
      return s;
    });
  }

  function laatFotoLos(s) {
    if (!s) return;
    if (urls[s]) URL.revokeObjectURL(urls[s]);
    delete urls[s];
    delete blobs[s];
    Fotos.wis(s);
  }

  var FOTOFOUT = "Deze foto kunnen we niet openen. Kies een andere, of maak er een nieuwe.";

  function maakVoorbeeld(k) {
    if (voorbeelden[k.id]) { URL.revokeObjectURL(voorbeelden[k.id]); delete voorbeelden[k.id]; }
    if (!k.strepen.length || !blobs[k.foto]) return Promise.resolve();
    return Strepen.samenstellen(blobs[k.foto], k.strepen, 900).then(function (b) {
      voorbeelden[k.id] = URL.createObjectURL(b);
    }).catch(function () {});
  }

  /* Kozijnkaarten ---------------------------------------------------------- */

  var kozijnenLijst = form.querySelector(".kozijnen");
  var sjabloon = document.getElementById("kozijn-sjabloon");

  function kaartVan(k) {
    return kozijnenLijst.querySelector('[data-id="' + k.id + '"]');
  }

  function voorDezeManier(el) {
    return el.dataset.voor.split(" ").indexOf(staat.manier) > -1;
  }

  function bouwKaarten() {
    kozijnenLijst.innerHTML = "";
    if (staat.manier === "papier") return;
    staat.kozijnen.forEach(function (k) { kozijnenLijst.appendChild(maakKaart(k)); });
    nummerKaarten();
  }

  function nummerKaarten() {
    var kaarten = kozijnenLijst.querySelectorAll(".kozijn");
    Array.prototype.forEach.call(kaarten, function (kaart, i) {
      kaart.querySelector(".kozijn-nr").textContent = String(i + 1);
      kaart.querySelector(".kozijn-weg").hidden = kaarten.length < 2;
    });
    form.querySelector(".kozijn-erbij").hidden = kaarten.length >= MAX_KOZIJNEN;
  }

  function maakKaart(k) {
    var kaart = sjabloon.content.firstElementChild.cloneNode(true);
    kaart.dataset.id = k.id;

    // Alleen de vragen van de gekozen manier. Vraag 2 bestaat twee keer in
    // het sjabloon; de andere gaat eruit, anders zijn er twee radiogroepen
    // met dezelfde naam.
    Array.prototype.forEach.call(kaart.querySelectorAll(".kozijn-vraag[data-voor]"), function (el) {
      if (!voorDezeManier(el)) el.remove();
    });
    Array.prototype.forEach.call(kaart.querySelectorAll("[data-voor]"), function (el) {
      el.hidden = !voorDezeManier(el);
    });

    // Elke kaart een eigen naam voor zijn keuzerondjes.
    Array.prototype.forEach.call(kaart.querySelectorAll("input[type=radio][data-veld]"), function (r) {
      r.name = r.dataset.veld + "-" + k.id;
      r.checked = String(k[r.dataset.veld]) === r.value;
      r.addEventListener("change", function () {
        k[r.dataset.veld] = r.value;
        tekenKaart(k);
        bewaar();
      });
    });

    var plek = kaart.querySelector('[data-veld="plek"]');
    plek.value = k.plek;
    plek.addEventListener("input", function () { k.plek = plek.value; bewaar(); });

    ["breedte", "hoogte"].forEach(function (veld) {
      var invoer = kaart.querySelector('[data-veld="' + veld + '"]');
      if (!invoer) return;
      invoer.value = k[veld];
      invoer.addEventListener("input", function () { k[veld] = invoer.value; tekenKaart(k); bewaar(); });
    });

    kaart.querySelector(".teller-min").addEventListener("click", function () {
      k.aantal = Math.max(1, k.aantal - 1); tekenKaart(k); bewaar();
    });
    kaart.querySelector(".teller-plus").addEventListener("click", function () {
      k.aantal = Math.min(20, k.aantal + 1); tekenKaart(k); bewaar();
    });

    // Foto's
    function kies(invoer, veld) {
      invoer.addEventListener("change", function () {
        var bestand = invoer.files && invoer.files[0];
        invoer.value = "";
        if (bestand) kiesFoto(k, bestand, veld);
      });
    }
    kies(kaart.querySelector(".foto-invoer"), "foto");
    kies(kaart.querySelector(".foto-vervang input"), "foto");
    kies(kaart.querySelector(".dichtbij-kiezen input"), "dichtbij");
    kaart.querySelector(".dichtbij-weg").addEventListener("click", function () {
      laatFotoLos(k.dichtbij); k.dichtbij = ""; tekenKaart(k); bewaar();
    });
    kaart.querySelector(".foto-strepen").addEventListener("click", function () { openStrepen(k); });
    kaart.querySelector(".foto-raam").addEventListener("click", function () {
      if (staat.manier === "streep" && k.werk === "delen") openStrepen(k);
    });

    kaart.querySelector(".kozijn-weg").addEventListener("click", function () {
      var nr = staat.kozijnen.indexOf(k) + 1;
      if ((k.foto || k.regels.length) &&
          !window.confirm("Kozijn " + nr + " weghalen? Wat je erbij hebt ingevuld gaat ook weg.")) return;
      laatFotoLos(k.foto);
      laatFotoLos(k.dichtbij);
      staat.kozijnen.splice(staat.kozijnen.indexOf(k), 1);
      kaart.remove();
      nummerKaarten();
      bewaar();
    });

    var matenBlok = kaart.querySelector(".maten-blok");
    if (matenBlok) bouwMaten(matenBlok, k);

    tekenKaart(k, kaart);
    return kaart;
  }

  function kiesFoto(k, bestand, veld) {
    var kaart = kaartVan(k);
    var bezig = kaart && kaart.querySelector(".foto-bezig");
    if (bezig && veld === "foto") bezig.hidden = false;
    voegFotoToe(bestand).then(function (s) {
      laatFotoLos(k[veld]);
      k[veld] = s;
      if (veld === "foto") { k.strepen = []; return maakVoorbeeld(k); }
    }).then(function () {
      if (bezig) bezig.hidden = true;
      tekenKaart(k);
      bewaar();
      // Wie aanstreept, krijgt na de foto meteen het aanstreepscherm: dat is
      // de logische volgende stap, en dan hoeft niemand de knop te zoeken.
      if (veld === "foto" && staat.manier === "streep" && k.werk === "delen") openStrepen(k);
    }).catch(function () {
      if (bezig) bezig.hidden = true;
      toonKaartMelding(k, [FOTOFOUT]);
    });
  }

  function openStrepen(k) {
    if (!blobs[k.foto]) return;
    Strepen.open(blobs[k.foto], k.strepen).then(function (uit) {
      if (uit.heel) {
        k.werk = "heel";
      } else {
        k.strepen = uit.strepen;
      }
      return maakVoorbeeld(k);
    }).then(function () {
      var kaart = kaartVan(k);
      if (kaart) {
        Array.prototype.forEach.call(kaart.querySelectorAll('[data-veld="werk"]'), function (r) {
          r.checked = r.value === k.werk;
        });
      }
      tekenKaart(k);
      bewaar();
    });
  }

  /* Maten ------------------------------------------------------------------
     Een deel aantikken zet een regel klaar met de naam al ingevuld; de klant
     typt alleen nog de lengte. Bij "Iets anders" typt hij ook de naam. */

  function bouwMaten(blok, k) {
    blok.innerHTML =
      '<div class="maten-uitleg">' +
      '<svg width="74" height="54" viewBox="0 0 74 54" aria-hidden="true"><rect x="8" y="4" width="46" height="36" fill="#fff" stroke="#3f7468" stroke-width="2"/>' +
      '<rect x="13" y="9" width="16" height="26" fill="#d6e7ee"/><rect x="33" y="9" width="16" height="26" fill="#d6e7ee"/>' +
      '<path d="M8 47h46M8 44v6M54 44v6M62 4v36M59 4h6M59 40h6" stroke="#a8523a" stroke-width="1.6"/></svg>' +
      "<p>Tik op een deel en typ hoe lang het is. Meet aan de buitenkant, van hoek tot hoek. " +
      "<b>160</b> of <b>1,60</b> is allebei goed.</p></div>" +
      '<div class="snelknoppen" role="group" aria-label="Een deel toevoegen"></div>' +
      '<div class="maatregels"></div>';
    var knoppen = blok.querySelector(".snelknoppen");
    SNELKNOPPEN.forEach(function (naam) {
      var knop = document.createElement("button");
      knop.type = "button";
      knop.className = "snelknop";
      knop.textContent = "+ " + naam;
      knop.addEventListener("click", function () {
        k.regels.push({ deel: naam === "Iets anders" ? "" : naam, lengte: "", aantal: 1 });
        tekenRegels(blok, k);
        var rijen = blok.querySelectorAll(".maatregel");
        var laatste = rijen[rijen.length - 1];
        (naam === "Iets anders" ? laatste.querySelector(".mr-deel") : laatste.querySelector(".mr-lengte input")).focus();
        tekenKaart(k);
        bewaar();
      });
      knoppen.appendChild(knop);
    });
    tekenRegels(blok, k);
  }

  function tekenRegels(blok, k) {
    var lijst = blok.querySelector(".maatregels");
    lijst.innerHTML = "";
    if (!k.regels.length) {
      lijst.innerHTML = '<p class="maten-leeg">Nog geen delen. Tik hierboven op een deel om te beginnen.</p>';
      return;
    }
    k.regels.forEach(function (r, i) {
      var rij = document.createElement("div");
      rij.className = "maatregel";
      rij.innerHTML =
        '<input class="mr-deel" type="text" maxlength="40" placeholder="Welk deel?" aria-label="Welk deel">' +
        '<label class="mr-aantal"><span class="sr-only">Aantal</span><input type="number" min="1" max="20" inputmode="numeric"></label>' +
        '<span class="mr-keer" aria-hidden="true">&times;</span>' +
        '<label class="mr-lengte"><span class="sr-only">Lengte</span><input type="text" inputmode="decimal" placeholder="lengte"></label>' +
        '<span class="mr-uit" aria-live="polite"></span>' +
        '<button type="button" class="mr-weg" aria-label="Deze regel weghalen">&times;</button>';
      var deel = rij.querySelector(".mr-deel");
      var aantal = rij.querySelector(".mr-aantal input");
      var lengte = rij.querySelector(".mr-lengte input");
      var uit = rij.querySelector(".mr-uit");
      deel.value = r.deel;
      aantal.value = r.aantal;
      lengte.value = r.lengte;
      function toonUitkomst() {
        var c = cm(r.lengte);
        uit.textContent = !r.lengte ? "" : (c >= 5 && c <= 1500 ? meter(c) : "?");
        uit.classList.toggle("fout", !!r.lengte && !(c >= 5 && c <= 1500));
      }
      deel.addEventListener("input", function () { r.deel = deel.value; tekenKaart(k); bewaar(); });
      aantal.addEventListener("input", function () {
        var n = parseInt(aantal.value, 10);
        r.aantal = isNaN(n) ? 1 : Math.max(1, Math.min(20, n));
        bewaar();
      });
      lengte.addEventListener("input", function () { r.lengte = lengte.value; toonUitkomst(); tekenKaart(k); bewaar(); });
      rij.querySelector(".mr-weg").addEventListener("click", function () {
        k.regels.splice(i, 1);
        tekenRegels(blok, k);
        tekenKaart(k);
        bewaar();
      });
      toonUitkomst();
      lijst.appendChild(rij);
    });
  }

  /* Wat er aan een kozijn nog ontbreekt ------------------------------------ */

  function ontbreekt(k) {
    var uit = [];
    if (!k.foto || !blobs[k.foto]) uit.push("Voeg een foto toe met het hele kozijn erop.");
    if (staat.manier === "streep" && k.werk === "delen" && !k.strepen.length) {
      uit.push(k.foto ? "Streep op de foto aan wat er moet gebeuren, of kies 'Het hele kozijn'."
                      : "Streep daarna op de foto aan wat er moet gebeuren, of kies 'Het hele kozijn'.");
    }
    if (staat.manier === "maten") {
      if (k.werk === "heel" && !(cm(k.breedte) >= 20 && cm(k.hoogte) >= 20)) {
        uit.push("Vul de breedte en de hoogte van het kozijn in.");
      }
      if (k.werk === "delen") {
        if (!geldigeRegels(k).length) uit.push("Tik een deel aan en typ de lengte erbij.");
        k.regels.forEach(function (r) {
          var c = cm(r.lengte);
          if (r.deel.trim() && !(c >= 5 && c <= 1500)) uit.push("Vul bij '" + r.deel.trim() + "' de lengte in.");
          if (!r.deel.trim() && r.lengte) uit.push("Zet bij de lengte " + r.lengte + " welk deel het is.");
        });
      }
    }
    if (staat.manier === "streep") {
      k.regels.forEach(function (r) {
        if (r.deel.trim() && r.lengte && !(cm(r.lengte) >= 5)) uit.push("Bij '" + r.deel.trim() + "' staat geen goede lengte.");
      });
    }
    if (!k.waar) uit.push("Kies waar dit kozijn zit.");
    return uit;
  }

  function toonKaartMelding(k, lijst) {
    var kaart = kaartVan(k);
    if (!kaart) return;
    var vak = kaart.querySelector(".kozijn-melding");
    vak.hidden = !lijst.length;
    vak.innerHTML = lijst.length
      ? "<p>Nog niet compleet:</p><ul>" + lijst.map(function (t) {
          return "<li>" + t.replace(/</g, "&lt;") + "</li>";
        }).join("") + "</ul>"
      : "";
  }

  /* Een kaart bijwerken naar de toestand ----------------------------------- */

  function tekenKaart(k, kaart) {
    kaart = kaart || kaartVan(k);
    if (!kaart) return;
    var heeftFoto = !!(k.foto && blobs[k.foto]);
    var strepen = staat.manier === "streep";

    kaart.querySelector(".foto-kiezen").hidden = heeftFoto;
    kaart.querySelector(".foto-toon").hidden = !heeftFoto;
    if (heeftFoto) {
      var beeld = kaart.querySelector(".foto-beeld");
      var bron = strepen && k.werk === "delen" && voorbeelden[k.id] ? voorbeelden[k.id] : fotoUrl(k.foto);
      if (beeld.getAttribute("src") !== bron) beeld.src = bron;
      beeld.alt = "Foto van kozijn " + (staat.kozijnen.indexOf(k) + 1);
    }
    kaart.querySelector(".foto-raam").classList.toggle("tikbaar", strepen && k.werk === "delen");
    kaart.querySelector(".foto-heel").hidden = k.werk !== "heel";
    kaart.querySelector(".foto-raam").classList.toggle("heel", k.werk === "heel");
    var strepKnop = kaart.querySelector(".foto-strepen");
    strepKnop.hidden = !(strepen && k.werk === "delen");
    strepKnop.textContent = k.strepen.length ? "Aanstreping aanpassen" : "Aanstrepen";

    var heeftDichtbij = !!(k.dichtbij && blobs[k.dichtbij]);
    kaart.querySelector(".dichtbij-kiezen").hidden = heeftDichtbij || !heeftFoto;
    kaart.querySelector(".dichtbij-toon").hidden = !heeftDichtbij;
    if (heeftDichtbij) kaart.querySelector(".dichtbij-toon img").src = fotoUrl(k.dichtbij);

    var stand = kaart.querySelector(".streep-stand");
    if (stand) {
      stand.className = "streep-stand";
      if (k.werk === "heel") {
        stand.textContent = "Het hele kozijn: dan hoef je niets aan te strepen.";
        stand.classList.add("goed");
      } else if (!heeftFoto) {
        stand.textContent = "Voeg eerst bij 1 een foto toe. Daarna streep je erop aan wat er moet gebeuren.";
      } else if (k.strepen.length) {
        stand.textContent = "Aangestreept. Aanpassen kan met de knop onder de foto.";
        stand.classList.add("goed");
      } else {
        stand.textContent = "Tik onder de foto op Aanstrepen, en streep aan wat er moet gebeuren.";
        stand.classList.add("open");
      }
    }

    var matenBlok = kaart.querySelector('.kozijn-vraag[data-voor="maten"] .maten-blok');
    var heleMaten = kaart.querySelector(".hele-maten");
    if (matenBlok) matenBlok.hidden = k.werk === "heel";
    if (heleMaten) {
      heleMaten.hidden = k.werk !== "heel";
      ["breedte", "hoogte"].forEach(function (veld) {
        var invoer = heleMaten.querySelector('[data-veld="' + veld + '"]');
        var c = cm(k[veld]);
        invoer.nextElementSibling.textContent = k[veld] ? (c >= 20 ? meter(c) : "?") : "";
      });
    }

    kaart.querySelector(".teller-uit").textContent = k.aantal + "×";

    var mist = ontbreekt(k);
    var status = kaart.querySelector(".kozijn-status");
    status.textContent = mist.length ? "" : "Compleet";
    status.classList.toggle("compleet", !mist.length);
    kaart.classList.toggle("is-compleet", !mist.length);
    // Na een poging om verder te gaan blijft de melding meelopen met wat er
    // nog ontbreekt, tot alles er is.
    if (kaart.classList.contains("gecontroleerd")) toonKaartMelding(k, mist);
    // Is alles nu compleet, dan hoort de melding onderin ook weg.
    if (!mist.length && /^Kozijn \d+ is nog niet compleet/.test(melding.textContent) &&
        staat.kozijnen.every(function (x) { return !ontbreekt(x).length; })) zeg("");
  }

  form.querySelector(".kozijn-erbij").addEventListener("click", function () {
    var k = nieuwKozijn();
    // Het nieuwe kozijn zit meestal op dezelfde hoogte als het vorige.
    var vorige = staat.kozijnen[staat.kozijnen.length - 1];
    if (vorige) k.waar = vorige.waar;
    staat.kozijnen.push(k);
    var kaart = maakKaart(k);
    kozijnenLijst.appendChild(kaart);
    nummerKaarten();
    kaart.scrollIntoView({ behavior: "smooth", block: "start" });
    kaart.querySelector(".foto-invoer").focus({ preventScroll: true });
    bewaar();
  });

  /* Op papier -------------------------------------------------------------- */

  function tekenFotorij(rij) {
    var rol = rij.dataset.rol;
    var lijst = staat.papier[rol];
    var max = parseInt(rij.dataset.max, 10) || 10;
    rij.innerHTML = "";
    lijst.forEach(function (s, i) {
      var tegel = document.createElement("figure");
      tegel.className = "fototegel";
      tegel.innerHTML = '<img alt=""><figcaption></figcaption>' +
        '<button type="button" class="tegel-weg" aria-label="Foto weghalen">&times;</button>';
      tegel.querySelector("img").src = fotoUrl(s);
      tegel.querySelector("img").alt = rij.dataset.label + " " + (i + 1);
      tegel.querySelector("figcaption").textContent = rij.dataset.label + " " + (i + 1);
      tegel.querySelector(".tegel-weg").addEventListener("click", function () {
        laatFotoLos(s);
        lijst.splice(i, 1);
        tekenFotorij(rij);
        bewaar();
      });
      rij.appendChild(tegel);
    });
    if (lijst.length < max) {
      var erbij = document.createElement("label");
      erbij.className = "fototegel-erbij";
      erbij.innerHTML = '<input type="file" accept="image/*" multiple>' +
        '<span><b aria-hidden="true">+</b> ' + (lijst.length ? "Nog een foto" : rij.dataset.leeg) + "</span>";
      var invoer = erbij.querySelector("input");
      invoer.addEventListener("change", function () {
        var bestanden = Array.prototype.slice.call(invoer.files || [], 0, max - lijst.length);
        invoer.value = "";
        erbij.classList.add("bezig");
        // Eén voor één, zodat de volgorde gelijk blijft aan de keuze.
        bestanden.reduce(function (keten, bestand) {
          return keten.then(function () {
            return voegFotoToe(bestand).then(function (s) { lijst.push(s); }, function () { zeg(FOTOFOUT); });
          });
        }, Promise.resolve()).then(function () { tekenFotorij(rij); bewaar(); });
      });
      rij.appendChild(erbij);
    }
  }

  function tekenPapier() {
    Array.prototype.forEach.call(form.querySelectorAll(".fotorij"), tekenFotorij);
  }

  /* De gekozen manier ------------------------------------------------------ */

  function tekenManier() {
    var paneel = form.querySelector('[data-stap="kozijnen"]');
    Array.prototype.forEach.call(paneel.querySelectorAll(":scope > [data-voor]"), function (el) {
      el.hidden = !voorDezeManier(el);
    });
    var kop = KOPPEN[staat.manier] || ["Je kozijnen", ""];
    paneel.querySelector(".kozijnen-kop").textContent = kop[0];
    paneel.querySelector(".kozijnen-uitleg").textContent = kop[1];
    if (staat.manier !== "papier" && staat.manier && !staat.kozijnen.length) {
      staat.kozijnen.push(nieuwKozijn());
    }
    bouwKaarten();
    tekenPapier();
  }

  Array.prototype.forEach.call(form.querySelectorAll('[name="manier"]'), function (r) {
    r.addEventListener("change", function () {
      staat.manier = r.value;
      tekenManier();
      zeg("");
      bewaar();
    });
  });

  form.querySelector(".naar-manier").addEventListener("click", function () { toon(0, true); });

  /* Uitlezen --------------------------------------------------------------- */

  function waarde(naam) {
    var el = form.querySelector('[name="' + naam + '"]:checked') ||
             form.querySelector('input[name="' + naam + '"]:not([type=radio]):not([type=checkbox]), textarea[name="' + naam + '"]');
    return el ? el.value.trim() : "";
  }

  function netjesPostcode(p) {
    var schoon = p.replace(/\s+/g, "").toUpperCase();
    return /^\d{4}[A-Z]{2}$/.test(schoon) ? schoon.slice(0, 4) + " " + schoon.slice(4) : p;
  }
  form.querySelector("#postcode").addEventListener("blur", function () {
    this.value = netjesPostcode(this.value.trim());
  });

  function waarden(naam) {
    return Array.prototype.map.call(form.querySelectorAll('[name="' + naam + '"]:checked'),
      function (el) { return el.value; });
  }

  /* Stappen ---------------------------------------------------------------- */

  var panelen = Array.prototype.slice.call(form.querySelectorAll(".stap-paneel"));
  var stapbalk = form.querySelector(".stapbalk");
  var melding = form.querySelector(".stap-nav .melding");
  var terug = form.querySelector(".stap-nav .terug");
  var verder = form.querySelector(".stap-nav .verder");
  var versturen = form.querySelector(".stap-nav .versturen");
  var nu = 0;
  var bereikt = 0;

  function zeg(tekst) { if (melding) melding.textContent = tekst; }

  function bouwStapbalk() {
    var lijst = document.createElement("ol");
    panelen.forEach(function (paneel, i) {
      var li = document.createElement("li");
      var knop = document.createElement("button");
      knop.type = "button";
      knop.className = "stapknop";
      knop.innerHTML = '<span class="nr" aria-hidden="true">' + (i + 1) + "</span>" +
                       '<span class="lab">' + paneel.dataset.titel + "</span>";
      knop.addEventListener("click", function () { spring(i); });
      li.appendChild(knop);
      lijst.appendChild(li);
    });
    stapbalk.appendChild(lijst);
  }

  function tekenStapbalk() {
    Array.prototype.forEach.call(stapbalk.querySelectorAll(".stapknop"), function (knop, i) {
      // 'klaar' alleen voor stappen waar je al langs bent geweest en die kloppen.
      var stand = i === nu ? "nu" : (i <= bereikt && geldig(i, true)) ? "klaar" : "open";
      knop.dataset.staat = stand;
      if (i === nu) knop.setAttribute("aria-current", "step"); else knop.removeAttribute("aria-current");
      knop.setAttribute("aria-label", "Stap " + (i + 1) + " van " + panelen.length + ": " +
        panelen[i].dataset.titel + (stand === "nu" ? ", hier ben je nu" : stand === "klaar" ? ", ingevuld" : ""));
    });
    stapbalk.style.setProperty("--stappen", String(panelen.length));
    stapbalk.style.setProperty("--vordering-f", String(nu / (panelen.length - 1)));
    var teller = form.querySelector(".stap-teller");
    if (teller) teller.textContent = "Stap " + (nu + 1) + " van " + panelen.length;
  }

  function toon(i, verschuif) {
    nu = Math.max(0, Math.min(panelen.length - 1, i));
    if (nu > bereikt) bereikt = nu;
    panelen.forEach(function (p, k) { p.hidden = k !== nu; });
    var laatste = nu === panelen.length - 1;
    terug.classList.toggle("onzichtbaar", nu === 0);
    verder.hidden = laatste;
    versturen.hidden = !laatste;
    zeg("");
    if (laatste) tekenOverzicht();
    tekenVervolgvelden();
    tekenStapbalk();
    if (verschuif) {
      var kop = panelen[nu].querySelector("h2");
      if (kop) { kop.setAttribute("tabindex", "-1"); kop.focus({ preventScroll: true }); }
      window.scrollTo({ top: form.getBoundingClientRect().top + window.scrollY - 90, behavior: "smooth" });
    }
    bewaar();
  }

  // stil: alleen kijken, geen meldingen (voor de stappenbalk).
  function geldig(index, stil) {
    var paneel = panelen[index];
    var stap = paneel.dataset.stap;
    if (stap === "manier") {
      if (staat.manier) return true;
      if (!stil) zeg(paneel.dataset.melding);
      return false;
    }
    if (stap === "kozijnen") return kozijnenGeldig(stil);
    if (paneel.querySelector('[name="kleur"]') && waarde("kleur") === "anders" && !waarde("kleur_anders")) {
      if (!stil) { zeg("Zet er even bij welke kleur je in gedachten hebt."); form.querySelector("#kleur_anders").focus(); }
      return false;
    }
    var velden = paneel.querySelectorAll("input[required], textarea[required]");
    for (var j = 0; j < velden.length; j++) {
      if (!velden[j].checkValidity()) {
        if (!stil && !paneel.hidden) velden[j].reportValidity();
        return false;
      }
    }
    return true;
  }

  function kozijnenGeldig(stil) {
    if (!staat.manier) return false;
    if (staat.manier === "papier") {
      var mist = !staat.papier.tekening.length ? "Voeg een foto van je tekening toe."
               : !staat.papier.kozijnfoto.length ? "Voeg van elk kozijn een foto toe, met het hele kozijn erop."
               : !waarden("papier_waar").length ? "Geef aan waar de kozijnen zitten."
               : "";
      if (mist && !stil) zeg(mist);
      return !mist;
    }
    if (!staat.kozijnen.length) return false;
    var eersteFout = -1;
    staat.kozijnen.forEach(function (k, i) {
      var lijst = ontbreekt(k);
      if (lijst.length && eersteFout < 0) eersteFout = i;
      if (!stil) {
        var kaart = kaartVan(k);
        if (kaart) kaart.classList.add("gecontroleerd");
        toonKaartMelding(k, lijst);
      }
    });
    if (eersteFout > -1 && !stil) {
      zeg("Kozijn " + (eersteFout + 1) + " is nog niet compleet. Bij de kaart staat wat er nog mist.");
      var kaart = kaartVan(staat.kozijnen[eersteFout]);
      if (kaart && !panelen[1].hidden) kaart.scrollIntoView({ behavior: "smooth", block: "start" });
    }
    return eersteFout < 0;
  }

  // Terug mag altijd. Vooruit loopt elke stap ertussen na en stopt bij de
  // eerste die nog niet klopt, met de melding erbij.
  function spring(doel) {
    if (doel <= nu) { toon(doel, true); return; }
    for (var i = nu; i < doel; i++) {
      if (!geldig(i, true)) {
        if (i !== nu) toon(i, true);
        geldig(i, false);
        return;
      }
    }
    toon(doel, true);
  }

  verder.addEventListener("click", function () { if (geldig(nu, false)) toon(nu + 1, true); });
  terug.addEventListener("click", function () { toon(nu - 1, true); });

  function tekenVervolgvelden() {
    Array.prototype.forEach.call(form.querySelectorAll(".vervolgveld"), function (veld) {
      var deel = (veld.dataset.toonBij || "").split("=");
      veld.hidden = waarde(deel[0]) !== deel[1];
    });
  }

  form.addEventListener("change", function (e) {
    if (!e.target.name) return;
    tekenVervolgvelden();
    if (nu === panelen.length - 1) tekenOverzicht();
    bewaar();
  });
  form.addEventListener("input", function (e) { if (e.target.name) bewaar(); });

  // Enter in een tekstveld verstuurt niet; in de gegevens gaat het naar de volgende stap.
  form.addEventListener("keydown", function (e) {
    if (e.key !== "Enter" || e.target.tagName !== "INPUT" || e.target.type === "file") return;
    e.preventDefault();
    if (e.target.name && nu < panelen.length - 1 && geldig(nu, false)) toon(nu + 1, true);
  });

  /* Overzicht -------------------------------------------------------------- */

  function kozijnKop(k, nr) {
    var delen = ["Kozijn " + nr];
    if (k.waar) delen.push(WAAR[k.waar]);
    if (k.plek.trim()) delen.push(k.plek.trim());
    if (k.aantal > 1) delen.push(k.aantal + "× hetzelfde");
    return delen.join(" · ");
  }

  function werkRegels(k) {
    var uit = [];
    if (k.werk === "heel") {
      var b = cm(k.breedte), h = cm(k.hoogte);
      uit.push("Het hele kozijn" + (staat.manier === "maten" && b && h ? ", " + b + " × " + h + " cm" : ""));
    } else if (staat.manier === "streep") {
      uit.push(k.strepen.length ? "Wat je op de foto hebt aangestreept" : "Nog niets aangestreept");
    }
    if (k.werk === "delen" || staat.manier === "streep") {
      geldigeRegels(k).forEach(function (r) {
        uit.push(r.deel.trim() + ": " + (r.aantal > 1 ? r.aantal + " × " : "") + meter(cm(r.lengte)));
      });
    }
    if (k.dichtbij) uit.push("Met een foto van dichtbij");
    return uit;
  }

  function maak(tag, klasse, tekst) {
    var el = document.createElement(tag);
    if (klasse) el.className = klasse;
    if (tekst !== undefined) el.textContent = tekst;
    return el;
  }

  function overzichtBlok(titel, stap) {
    var blok = maak("div", "ov-blok");
    var kop = maak("div", "ov-kop");
    kop.appendChild(maak("h3", "", titel));
    var wijzig = maak("button", "wijzig", "Wijzig");
    wijzig.type = "button";
    wijzig.addEventListener("click", function () { toon(stap, true); });
    kop.appendChild(wijzig);
    blok.appendChild(kop);
    return blok;
  }

  function tekenOverzicht() {
    var vak = form.querySelector(".overzicht");
    vak.innerHTML = "";

    var werk = overzichtBlok("Wat er moet gebeuren", 1);
    if (staat.manier === "papier") {
      var rij = maak("div", "ov-papier");
      staat.papier.tekening.concat(staat.papier.kozijnfoto).forEach(function (s) {
        var img = maak("img");
        img.src = fotoUrl(s);
        img.alt = "";
        rij.appendChild(img);
      });
      werk.appendChild(rij);
      werk.appendChild(maak("p", "", staat.papier.tekening.length + " foto van je tekening, " +
        staat.papier.kozijnfoto.length + " foto" + (staat.papier.kozijnfoto.length === 1 ? "" : "'s") +
        " van je kozijnen. Waar: " + waarden("papier_waar").map(function (w) { return WAAR[w].toLowerCase(); }).join(", ") + "."));
    } else {
      staat.kozijnen.forEach(function (k, i) {
        var regel = maak("div", "ov-kozijn");
        var img = maak("img");
        img.src = staat.manier === "streep" && k.werk === "delen" && voorbeelden[k.id] ? voorbeelden[k.id] : fotoUrl(k.foto);
        img.alt = "";
        regel.appendChild(img);
        var tekst = maak("div");
        tekst.appendChild(maak("p", "ov-titel", kozijnKop(k, i + 1)));
        werkRegels(k).forEach(function (r) { tekst.appendChild(maak("p", "", r)); });
        regel.appendChild(tekst);
        werk.appendChild(regel);
      });
    }
    vak.appendChild(werk);

    var kleur = overzichtBlok("Kleur", 2);
    kleur.appendChild(maak("p", "", waarde("kleur") === "anders"
      ? "Een andere kleur: " + waarde("kleur_anders") : "Dezelfde kleur houden"));
    vak.appendChild(kleur);

    var wie = overzichtBlok("Je gegevens", 3);
    [waarde("naam"), waarde("straat") + " " + waarde("huisnummer") + ", " + netjesPostcode(waarde("postcode")) + " " + waarde("plaats"),
     waarde("telefoon"), waarde("email")].forEach(function (t) { wie.appendChild(maak("p", "", t)); });
    if (waarde("toelichting")) wie.appendChild(maak("p", "ov-opmerking", waarde("toelichting")));
    vak.appendChild(wie);
  }

  /* Versturen --------------------------------------------------------------
     1. de antwoorden naar de server, die zegt welke foto's hij verwacht
     2. elke foto apart (opnieuw proberen bij een haperende verbinding)
     3. versturen: de server stuurt de mail aan Max en de bevestiging
     Lukt iets niet, dan blijft alles staan en kan de klant het opnieuw
     proberen; wat al binnen is, wordt niet nog eens gestuurd. */

  var stand = form.querySelector(".verzendstand");
  var bezig = false;

  function toonStand(tekst, deel) {
    stand.hidden = false;
    stand.querySelector(".verzend-fout").hidden = true;
    stand.querySelector(".verzend-tekst").textContent = tekst;
    stand.querySelector(".verzend-balk").hidden = false;
    stand.querySelector(".verzend-balk span").style.width = Math.round(Math.max(0.04, deel) * 100) + "%";
  }

  function toonFout(tekst) {
    stand.hidden = false;
    stand.querySelector(".verzend-tekst").textContent = "";
    stand.querySelector(".verzend-balk").hidden = true;
    stand.querySelector(".verzend-fout").hidden = false;
    stand.querySelector(".verzend-fout-tekst").textContent = tekst;
    stand.querySelector(".verzend-mail").href = "mailto:" + MAILBOX +
      "?subject=" + encodeURIComponent("Offerteaanvraag " + waarde("naam")) +
      "&body=" + encodeURIComponent(samenvattingTekst() + "\n\n(Stuur je foto's als bijlage mee.)");
  }

  function samenvattingTekst() {
    var regels = ["Naam: " + waarde("naam"), "Adres: " + waarde("straat") + " " + waarde("huisnummer") +
                  ", " + waarde("postcode") + " " + waarde("plaats"), "Telefoon: " + waarde("telefoon"), ""];
    if (staat.manier === "papier") {
      regels.push("Ik stuur een foto van mijn tekening en van mijn kozijnen mee.");
    } else {
      staat.kozijnen.forEach(function (k, i) {
        regels.push(kozijnKop(k, i + 1) + ": " + werkRegels(k).join("; "));
      });
    }
    regels.push("", "Kleur: " + (waarde("kleur") === "anders" ? waarde("kleur_anders") : "dezelfde houden"));
    if (waarde("toelichting")) regels.push("Opmerking: " + waarde("toelichting"));
    return regels.join("\n");
  }

  function maakPayload() {
    var p = {
      manier: staat.manier,
      kleur: waarde("kleur"),
      kleur_anders: waarde("kleur_anders"),
      via: vanaf,
      website: waarde("website"),
      gegevens: {
        naam: waarde("naam"), email: waarde("email"), telefoon: waarde("telefoon"),
        postcode: waarde("postcode"), straat: waarde("straat"), huisnummer: waarde("huisnummer"), plaats: waarde("plaats"),
        toelichting: waarde("toelichting")
      }
    };
    if (staat.manier === "papier") {
      p.papier = { tekeningen: staat.papier.tekening.length, fotos: staat.papier.kozijnfoto.length,
                   waar: waarden("papier_waar") };
    } else {
      p.kozijnen = staat.kozijnen.map(function (k) {
        var heel = k.werk === "heel";
        return {
          waar: k.waar, plek: k.plek.trim(), aantal: k.aantal, heel: heel, dichtbij: !!k.dichtbij,
          aangestreept: staat.manier === "streep" && !heel && k.strepen.length > 0,
          regels: (!heel || staat.manier === "streep") ? geldigeRegels(k).map(function (r) {
            return { deel: r.deel.trim(), lengte: r.lengte, aantal: r.aantal };
          }) : [],
          breedte: heel ? k.breedte : "", hoogte: heel ? k.hoogte : ""
        };
      });
    }
    return p;
  }

  // Bij elke bestandsnaam die de server verwacht, de juiste foto.
  function fotoBron(naam) {
    var m = naam.match(/^tekening-(\d+)\.jpg$/);
    if (m) return Promise.resolve(blobs[staat.papier.tekening[m[1] - 1]]);
    m = naam.match(/^kozijn-(\d+)-(foto|dichtbij|aangestreept)\.jpg$/);
    if (!m) return Promise.resolve(null);
    if (staat.manier === "papier") return Promise.resolve(blobs[staat.papier.kozijnfoto[m[1] - 1]]);
    var k = staat.kozijnen[m[1] - 1];
    if (!k) return Promise.resolve(null);
    if (m[2] === "foto") return Promise.resolve(blobs[k.foto]);
    if (m[2] === "dichtbij") return Promise.resolve(blobs[k.dichtbij]);
    return blobs[k.foto] ? Strepen.samenstellen(blobs[k.foto], k.strepen) : Promise.resolve(null);
  }

  function Fout(tekst, extra) {
    this.message = tekst;
    this.extra = extra || {};
  }

  function vraag(methode, pad, lijf, soort) {
    return fetch(API + pad, {
      method: methode,
      headers: { "Content-Type": soort || "application/json" },
      body: lijf
    }).catch(function () {
      throw new Fout("We krijgen geen verbinding. Kijk of je internet het doet en probeer het nog eens.",
                     { netwerk: true });
    }).then(function (r) {
      return r.json().catch(function () { return {}; }).then(function (d) {
        if (r.ok) return d;
        throw new Fout(d.fout || "Het versturen lukt nu niet. Probeer het later nog eens, of mail ons.",
                       { status: r.status, ontbreekt: d.ontbreekt });
      });
    });
  }

  function wacht(ms) { return new Promise(function (ok) { setTimeout(ok, ms); }); }

  function stuurFoto(v, naam, poging) {
    return fotoBron(naam).then(function (blob) {
      if (!blob) throw new Fout("Een foto is weggeraakt. Ga terug naar Kozijnen en voeg hem opnieuw toe.");
      return vraag("PUT", "/aanvragen/" + v.id + "/fotos/" + naam + "?t=" + encodeURIComponent(v.token),
                   blob, "image/jpeg");
    }).catch(function (e) {
      if (e.extra && e.extra.netwerk && poging < 3) {
        return wacht(1500 * poging).then(function () { return stuurFoto(v, naam, poging + 1); });
      }
      throw e;
    });
  }

  function verstuur(v, herkansing) {
    var todo = v.namen.filter(function (n) { return v.gedaan.indexOf(n) < 0; });
    return todo.reduce(function (keten, naam) {
      return keten.then(function () {
        toonStand("Foto " + (v.gedaan.length + 1) + " van " + v.namen.length + " wordt verstuurd…",
                  0.05 + 0.85 * v.gedaan.length / v.namen.length);
        return stuurFoto(v, naam, 1).then(function () { v.gedaan.push(naam); bewaarNu(); });
      });
    }, Promise.resolve()).then(function () {
      toonStand("Bijna klaar: je aanvraag gaat naar iWrap…", 0.95);
      return vraag("POST", "/aanvragen/" + v.id + "/versturen?t=" + encodeURIComponent(v.token), "{}");
    }).catch(function (e) {
      // De server mist een foto (bijvoorbeeld na een herstart): die nog een keer.
      if (e.extra && e.extra.ontbreekt && !herkansing) {
        v.gedaan = v.gedaan.filter(function (n) { return e.extra.ontbreekt.indexOf(n) < 0; });
        return verstuur(v, true);
      }
      throw e;
    });
  }

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    if (bezig) return;
    for (var i = 0; i < panelen.length - 1; i++) {
      if (!geldig(i, true)) { spring(i + 1); return; }
    }
    bezig = true;
    versturen.disabled = true;
    terug.disabled = true;
    toonStand("Je aanvraag wordt klaargezet…", 0.03);

    var payload = maakPayload();
    var vingerafdruk = JSON.stringify(payload);
    var begin = staat.verzending && staat.verzending.vingerafdruk === vingerafdruk
      ? Promise.resolve(staat.verzending)
      : vraag("POST", "/aanvragen", vingerafdruk).then(function (d) {
          staat.verzending = { id: d.id, token: d.token, namen: d.fotos, gedaan: [], vingerafdruk: vingerafdruk };
          bewaarNu();
          return staat.verzending;
        });

    begin.then(function (v) { return verstuur(v, false); }).then(function (d) {
      bedankt(d);
    }).catch(function (fout) {
      bezig = false;
      versturen.disabled = false;
      terug.disabled = false;
      // Een verlopen aanvraag (na twee dagen) begint gewoon opnieuw.
      if (fout.extra && fout.extra.status === 404) staat.verzending = null;
      toonFout(fout.message || "Het versturen lukte niet.");
    });
  });

  stand.querySelector(".verzend-opnieuw").addEventListener("click", function () {
    form.requestSubmit ? form.requestSubmit(versturen) : versturen.click();
  });

  function bedankt(d) {
    wisAlles();
    var kaart = form.closest(".offerte-kaart");
    var naam = waarde("naam").split(" ")[0];
    var email = waarde("email");
    kaart.innerHTML =
      '<div class="bedankt">' +
      '<div class="vink" aria-hidden="true"></div>' +
      "<h2>Bedankt" + (naam ? ", " + naam.replace(/</g, "") : "") + "</h2>" +
      "<p>Je aanvraag is binnen, met al je foto's. We bekijken ze en sturen je een offerte met " +
      "een vaste totaalprijs. Kunnen we iets niet goed zien, dan bellen of mailen we je even.</p>" +
      (d && d.bevestiging ? '<p class="bedankt-mail">Je krijgt ook een bevestiging per mail op <b></b>.</p>' : "") +
      '<div class="knoprij"><a class="knop knop-tweede" href="/voorbeelden">Bekijk ons werk</a>' +
      '<a class="knop knop-tweede" href="/veelgestelde-vragen">Veelgestelde vragen</a></div>' +
      "</div>";
    var mail = kaart.querySelector(".bedankt-mail b");
    if (mail) mail.textContent = email;
    kaart.scrollIntoView({ behavior: "smooth", block: "center" });
  }

  /* Bewaren ----------------------------------------------------------------
     De antwoorden in localStorage, de foto's in IndexedDB. Wie halverwege
     wegklikt, gaat later verder waar hij was. */

  var bewaarKlok = null;

  function bewaar() {
    clearTimeout(bewaarKlok);
    bewaarKlok = setTimeout(bewaarNu, 250);
  }

  function bewaarNu() {
    try {
      var velden = {};
      Array.prototype.forEach.call(form.querySelectorAll("input[name], textarea[name]"), function (el) {
        if (el.type === "file" || el.name === "website" || el.name === "manier") return;
        if (el.type === "radio" || el.type === "checkbox") {
          if (el.checked) (velden[el.name] = velden[el.name] || []).push(el.value);
        } else if (el.value) {
          velden[el.name] = el.value;
        }
      });
      localStorage.setItem(OPSLAG, JSON.stringify({ stap: nu, bereikt: bereikt, staat: staat, velden: velden }));
    } catch (e) { /* privémodus: dan bewaren we niets */ }
  }

  function wisAlles() {
    try { localStorage.removeItem(OPSLAG); } catch (e) { /* niets */ }
    Fotos.wisAlles();
  }

  function herstel() {
    var d;
    try { d = JSON.parse(localStorage.getItem(OPSLAG) || "null"); } catch (e) { d = null; }
    if (!d || !d.staat) return Promise.resolve(null);
    var s = d.staat;
    staat.manier = s.manier || "";
    staat.kozijnen = (s.kozijnen || []).map(function (k) { return Object.assign(nieuwKozijn(), k); });
    staat.papier = { tekening: (s.papier && s.papier.tekening) || [], kozijnfoto: (s.papier && s.papier.kozijnfoto) || [] };
    staat.verzending = s.verzending || null;
    Object.keys(d.velden || {}).forEach(function (naam) {
      var v = d.velden[naam];
      if (Array.isArray(v)) {
        v.forEach(function (x) {
          var el = form.querySelector('[name="' + naam + '"][value="' + CSS.escape(x) + '"]');
          if (el) el.checked = true;
        });
      } else {
        var el = form.querySelector('[name="' + naam + '"]');
        if (el) el.value = v;
      }
    });
    // De foto's terughalen. Is er een weg (privévenster, opgeruimde browser),
    // dan staat bij dat kozijn gewoon weer "Maak of kies een foto".
    var sleutels = [];
    staat.kozijnen.forEach(function (k) { if (k.foto) sleutels.push(k.foto); if (k.dichtbij) sleutels.push(k.dichtbij); });
    sleutels = sleutels.concat(staat.papier.tekening, staat.papier.kozijnfoto);
    return Promise.all(sleutels.map(function (x) {
      return Fotos.haal(x).then(function (blob) { if (blob) blobs[x] = blob; });
    })).then(function () {
      staat.papier.tekening = staat.papier.tekening.filter(function (x) { return blobs[x]; });
      staat.papier.kozijnfoto = staat.papier.kozijnfoto.filter(function (x) { return blobs[x]; });
      return Promise.all(staat.kozijnen.map(maakVoorbeeld));
    }).then(function () {
      bereikt = d.bereikt || 0;
      return d.stap || 0;
    });
  }

  /* Opstarten -------------------------------------------------------------- */

  // Klikt iemand op de homepage op een klacht, dan onthouden we dat stilletjes.
  var KLACHTEN = {
    verweerd: "verweerd of gebarsten",
    "laat-los": "folie laat los",
    blaasjes: "blaasjes of scheuren",
    lijmlaag: "gele lijmlaag zichtbaar",
    spanningsplooien: "plooien of kreukels",
    scheuren: "krassen of stootschade"
  };
  var vanaf = KLACHTEN[new URLSearchParams(window.location.search).get("klacht")] || "";

  bouwStapbalk();
  toon(0, false);

  herstel().then(function (stap) {
    var gekozen = form.querySelector('[name="manier"][value="' + staat.manier + '"]');
    if (gekozen) gekozen.checked = true;
    tekenManier();
    if (stap === null) return;
    toon(stap, false);
    if (stap > 0) {
      if ("scrollRestoration" in history) history.scrollRestoration = "manual";
      window.scrollTo({ top: form.getBoundingClientRect().top + window.scrollY - 90, behavior: "auto" });
      var terugmelding = document.createElement("p");
      terugmelding.className = "hervat";
      terugmelding.innerHTML = "We hebben je eerdere antwoorden en foto's bewaard. " +
        '<button type="button">Opnieuw beginnen</button>';
      terugmelding.querySelector("button").addEventListener("click", function () {
        if (!window.confirm("Alles wissen en opnieuw beginnen?")) return;
        wisAlles();
        window.location.href = window.location.pathname;
      });
      stapbalk.appendChild(terugmelding);
    }
  });
})();
