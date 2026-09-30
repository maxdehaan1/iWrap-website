/* ---------------------------------------------------------------------------
   Gedeeld door elke pagina van kozijnhorren.nl: de aankondigingsbalk, het menu,
   de winkelmand (een zijlade, bewaard in de browser), de prijsberekening, het
   doorsturen van een bestelling als link, en het adres van de API.

   De prijsregels zijn dezelfde als in backend/horren.py. Wijzig je daar iets aan
   de manier van rekenen, doe het hier dan ook. De tabellen zelf komen uit
   js/catalogus.js, die build.py uit backend/data/horren.json maakt.

   Teksten met een apostrof altijd tussen dubbele aanhalingstekens.
   --------------------------------------------------------------------------- */
(function () {
  "use strict";

  var H = window.HORREN;
  var lokaal = /^(localhost|127\.0\.0\.1)$/.test(location.hostname);
  // Op een Vercel-testadres (kozijnhorren-git-<branch>-....vercel.app) praat de winkel met
  // het testadres van dezelfde branch van iwrap.nl; anders met de echte API.
  var preview = /^kozijnhorren-git-.+\.vercel\.app$/.test(location.hostname);
  var API = lokaal ? "http://" + location.hostname + ":8010/api"
    : preview ? "https://" + location.hostname.replace(/^kozijnhorren-/, "iwrap-website-") + "/api"
    : H.api;
  var MANDJE = "kozijnhorren-mand";
  var $ = function (s, ouder) { return (ouder || document).querySelector(s); };

  function el(tag, klasse, tekst) {
    var e = document.createElement(tag);
    if (klasse) e.className = klasse;
    if (tekst != null) e.textContent = tekst;
    return e;
  }

  function euro(n) {
    return "€ " + Number(n).toLocaleString("nl-NL", { minimumFractionDigits: n % 1 ? 2 : 0, maximumFractionDigits: 2 });
  }

  // --- Kleur en prijs -----------------------------------------------------

  function geldigeRal(code) {
    code = String(code || "").replace(/\D/g, "");
    if (code.length !== 4) return null;
    var reeks = { 1: [0, 37], 2: [0, 17], 3: [0, 33], 4: [1, 12], 5: [0, 26], 6: [0, 39], 7: [0, 48], 8: [0, 29], 9: [1, 23] }[code[0]];
    var n = parseInt(code.slice(1), 10);
    return reeks && n >= reeks[0] && n <= reeks[1] ? code : null;
  }

  function kleurInfo(code) {
    var std = H.kleuren.standaard.filter(function (k) { return k.code === code; })[0];
    if (std) return { code: code, naam: std.naam, hex: std.hex, standaard: true };
    var r = H.ral[code];
    return { code: code, naam: r ? r[0] : "RAL " + code, hex: r ? r[1] : "#b9b5ad", standaard: false };
  }

  function vanaf(uitvoering) {
    return Math.min.apply(null, [].concat.apply([], H.producten[uitvoering].prijstabel.prijzen));
  }

  /* Eén regel doorrekenen. Terug: {onvolledig}, {fouten: [...]} of de regel met prijs. */
  function prijsRegel(r) {
    var p = H.producten[r.uitvoering] || H.producten.basis;
    var g = H.maatgrenzen;
    var b = parseInt(r.breedte, 10), h = parseInt(r.hoogte, 10);
    if (!b || !h) return { fouten: [], onvolledig: true };
    var fouten = [];
    if (b < g.breedte.min) fouten.push("De breedte is kleiner dan " + g.breedte.min + " mm. Zo klein maken we de hor niet.");
    if (b > g.breedte.max) fouten.push("De breedte is groter dan " + g.breedte.max + " mm. Zo breed kan deze hor niet.");
    if (h < g.hoogte.min) fouten.push("De hoogte is kleiner dan " + g.hoogte.min + " mm. Zo klein maken we de hor niet.");
    if (h > g.hoogte.max) fouten.push("De hoogte is groter dan " + g.hoogte.max + " mm. Zo hoog kan deze hor niet.");
    if (!fouten.length && b * h / 1e6 > g.max_oppervlak_m2) fouten.push("Deze hor wordt te groot om stevig te blijven staan. Stuur ons een foto, dan kijken we mee.");
    var code = geldigeRal(r.kleur);
    var kleur = code ? kleurInfo(code) : null;
    if (!kleur) fouten.push("Deze RAL-kleur kennen we niet.");
    else if (p.kleuren === "standaard" && !kleur.standaard) fouten.push("De Basis is er in wit, crèmewit, antraciet en zwart. Kies de Luxe voor een andere kleur.");
    if (fouten.length) return { fouten: fouten };
    var t = p.prijstabel;
    var bi = t.breedtes.findIndex(function (x) { return b <= x; });
    var hi = t.hoogtes.findIndex(function (x) { return h <= x; });
    var aantal = Math.max(1, Math.min(H.max_aantal_per_regel, parseInt(r.aantal, 10) || 1));
    var stuk = t.prijzen[bi][hi];
    return { fouten: [], uitvoering: r.uitvoering, productnaam: p.naam, gaas: p.gaas, breedte: b, hoogte: h,
             kleur: kleur, aantal: aantal, stukprijs: stuk, bedrag: stuk * aantal, middenregel: h >= g.middenregel_vanaf_hoogte };
  }

  // --- Levertijd ----------------------------------------------------------

  function werkdagenErbij(d, n) {
    d = new Date(d);
    while (n > 0) { d.setDate(d.getDate() + 1); if (d.getDay() !== 0 && d.getDay() !== 6) n--; }
    return d;
  }
  function voorjaarMogelijk() { return H.levering.wintermaanden.indexOf(new Date().getMonth() + 1) >= 0; }
  function levertijd(metRal, voorjaar) {
    var lev = H.levering, van = lev.werkdagen[0], tot = lev.werkdagen[1], nu = new Date();
    if (voorjaar && voorjaarMogelijk()) {
      var md = lev.voorjaar_vanaf.split("-");
      var d = new Date(nu.getFullYear(), parseInt(md[0], 10) - 1, parseInt(md[1], 10));
      if (d <= nu) d.setFullYear(d.getFullYear() + 1);
      return { van: d, tot: werkdagenErbij(d, 5), voorjaar: true };
    }
    if (metRal) { van += H.kleuren.ral_extra_werkdagen; tot += H.kleuren.ral_extra_werkdagen; }
    if (lev.hoogseizoen_maanden.indexOf(nu.getMonth() + 1) >= 0) { van += lev.hoogseizoen_extra_werkdagen; tot += lev.hoogseizoen_extra_werkdagen; }
    return { van: werkdagenErbij(nu, van), tot: werkdagenErbij(nu, tot), voorjaar: false };
  }
  function datum(d) {
    if (typeof d === "string") d = new Date(d + "T12:00:00");
    return d.toLocaleDateString("nl-NL", { day: "numeric", month: "long" });
  }
  function levertijdZin(lt) {
    return lt.voorjaar ? "Levering begin maart." : "Verwacht tussen " + datum(lt.van) + " en " + datum(lt.tot) + ".";
  }

  // --- Winkelmand ---------------------------------------------------------

  function leesMand() {
    try { var m = JSON.parse(localStorage.getItem(MANDJE)); return m && m.regels ? m : { regels: [] }; }
    catch (e) { return { regels: [] }; }
  }
  function schrijfMand(m) {
    try { localStorage.setItem(MANDJE, JSON.stringify(m)); } catch (e) {}
    tekenMand();
  }
  function leegMand() { try { localStorage.removeItem(MANDJE); } catch (e) {} tekenMand(); }

  function voegToe(regel) {
    var m = leesMand();
    // Precies dezelfde hor nog een keer? Dan het aantal ophogen in plaats van een tweede regel.
    var zelfde = m.regels.filter(function (x) {
      return x.uitvoering === regel.uitvoering && +x.breedte === +regel.breedte && +x.hoogte === +regel.hoogte &&
        x.kleur === regel.kleur && (x.naam || "") === (regel.naam || "");
    })[0];
    if (zelfde) zelfde.aantal = Math.min(H.max_aantal_per_regel, (+zelfde.aantal || 1) + (+regel.aantal || 1));
    else m.regels.push(regel);
    schrijfMand(m);
  }

  function miniHor(r) {
    var d = el("span", "mini-hor" + (r.uitvoering === "luxe" ? " luxe" : ""));
    var i = el("i");
    i.style.setProperty("--kleur", r.kleur.hex);
    d.appendChild(i);
    return d;
  }

  function tekenMand() {
    var m = leesMand();
    var aantal = 0, totaal = 0, metRal = false;
    var lijst = $(".mand-lijst");
    if (lijst) lijst.textContent = "";
    m.regels.forEach(function (regel, i) {
      var r = prijsRegel(regel);
      if (r.onvolledig || r.fouten.length) return;
      aantal += r.aantal; totaal += r.bedrag;
      if (!r.kleur.standaard) metRal = true;
      if (!lijst) return;
      var li = el("li");
      li.appendChild(miniHor(r));
      var t = el("div");
      t.appendChild(el("b", "", r.productnaam));
      t.appendChild(el("small", "", r.breedte + " × " + r.hoogte + " mm · " + r.kleur.naam + (regel.naam ? " · " + regel.naam : "")));
      li.appendChild(t);
      li.appendChild(el("span", "regelprijs", euro(r.bedrag)));
      var acties = el("div", "regelacties");
      var st = el("div", "stapper");
      var min = el("button", "", "−"); min.type = "button"; min.setAttribute("aria-label", "Minder");
      var out = el("output", "", String(r.aantal));
      var plus = el("button", "", "+"); plus.type = "button"; plus.setAttribute("aria-label", "Meer");
      min.addEventListener("click", function () { var mm = leesMand(); if ((+mm.regels[i].aantal || 1) <= 1) mm.regels.splice(i, 1); else mm.regels[i].aantal = (+mm.regels[i].aantal || 1) - 1; schrijfMand(mm); });
      plus.addEventListener("click", function () { var mm = leesMand(); mm.regels[i].aantal = Math.min(H.max_aantal_per_regel, (+mm.regels[i].aantal || 1) + 1); schrijfMand(mm); });
      st.appendChild(min); st.appendChild(out); st.appendChild(plus);
      var weg = el("button", "linkje", "Verwijderen"); weg.type = "button";
      weg.addEventListener("click", function () { var mm = leesMand(); mm.regels.splice(i, 1); schrijfMand(mm); });
      acties.appendChild(st); acties.appendChild(weg);
      li.appendChild(acties);
      lijst.appendChild(li);
    });
    document.querySelectorAll(".mand-teller").forEach(function (e) { e.hidden = !aantal; e.textContent = aantal; });
    var leeg = $(".mand-leeg"), voet = $(".mand-voet");
    if (leeg) leeg.hidden = aantal > 0;
    if (voet) voet.hidden = !aantal;
    if (aantal) {
      $(".mand-bedrag").textContent = euro(totaal);
      $(".mand-levertijd").textContent = levertijdZin(levertijd(metRal, false));
      var link = deelLink(m);
      $(".deel-whatsapp").href = "https://wa.me/?text=" + encodeURIComponent("Je horren van " + H.winkel.naam + ", klaar om af te rekenen: " + link);
      $(".deel-kopieer").dataset.link = link;
    }
    document.dispatchEvent(new CustomEvent("mand-gewijzigd", { detail: { aantal: aantal, totaal: totaal } }));
  }

  // --- Zijlades (winkelmand, meethulp) ------------------------------------

  var open = null;
  function openLade(lade, laag) {
    sluitLade();
    open = { lade: lade, laag: laag, terug: document.activeElement };
    laag.hidden = false;
    void laag.offsetWidth; // eerst tekenen, dan pas de overgang starten
    laag.classList.add("open");
    lade.classList.add("open");
    lade.setAttribute("aria-hidden", "false");
    document.body.classList.add("lade-open");
    var eerste = lade.querySelector("button, a, input");
    if (eerste) eerste.focus();
  }
  function sluitLade() {
    if (!open) return;
    var o = open;
    open = null;
    o.lade.classList.remove("open"); o.laag.classList.remove("open");
    o.lade.setAttribute("aria-hidden", "true");
    document.body.classList.remove("lade-open");
    setTimeout(function () { o.laag.hidden = true; }, 260);
    if (o.terug && o.terug.focus) o.terug.focus();
  }
  document.addEventListener("keydown", function (e) { if (e.key === "Escape") sluitLade(); });

  function openMand() { tekenMand(); openLade($("#mand"), $(".mand-laag")); }

  var mandKnop = $(".mand-knop");
  if (mandKnop) mandKnop.addEventListener("click", openMand);
  var sluit = $(".mand-sluit");
  if (sluit) sluit.addEventListener("click", sluitLade);
  var laag = $(".mand-laag");
  if (laag) laag.addEventListener("click", sluitLade);
  var nog = $(".mand-nog");
  if (nog) nog.addEventListener("click", function (e) {
    if (location.pathname.replace(/\/$/, "") === "/bestellen") { e.preventDefault(); sluitLade(); document.dispatchEvent(new Event("nog-een-raam")); }
  });
  var kopieer = $(".deel-kopieer");
  if (kopieer) kopieer.addEventListener("click", function () {
    var link = kopieer.dataset.link;
    (navigator.clipboard ? navigator.clipboard.writeText(link) : Promise.reject()).then(function () { toast("Link gekopieerd"); }, function () { prompt("Kopieer de link:", link); });
  });

  // --- Een bestelling als link doorsturen ---------------------------------
  // Voor als Max bij de klant meet en de klant later zelf afrekent, of andersom.
  // De hele winkelmand zit in de link; er wordt niets op een server bewaard.

  function naarB64(tekst) {
    return btoa(unescape(encodeURIComponent(tekst))).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
  }
  function vanB64(tekst) {
    tekst = tekst.replace(/-/g, "+").replace(/_/g, "/");
    while (tekst.length % 4) tekst += "=";
    return decodeURIComponent(escape(atob(tekst)));
  }
  function deelLink(m) {
    var kort = m.regels.map(function (r) { return [r.uitvoering === "luxe" ? 1 : 0, +r.breedte, +r.hoogte, r.kleur, +r.aantal || 1, r.naam || ""]; });
    return location.origin + "/bestellen#bestelling=" + naarB64(JSON.stringify(kort));
  }
  function leesDeelLink() {
    var m = location.hash.match(/bestelling=([\w-]+)/);
    if (!m) return;
    var regels;
    try {
      regels = JSON.parse(vanB64(m[1])).map(function (x) {
        return { uitvoering: x[0] ? "luxe" : "basis", breedte: x[1], hoogte: x[2], kleur: String(x[3]), aantal: x[4], naam: String(x[5] || "").slice(0, 60) };
      }).filter(function (r) { var p = prijsRegel(r); return !p.onvolledig && !p.fouten.length; });
    } catch (e) { regels = []; }
    history.replaceState(null, "", location.pathname + location.search);
    if (!regels.length) { toast("Deze link klopt niet (meer)."); return; }
    var huidig = leesMand();
    if (huidig.regels.length && !confirm("Je winkelmand vervangen door de horren uit deze link?")) return;
    schrijfMand({ regels: regels });
    openMand();
  }

  // --- Overig -------------------------------------------------------------

  var toastTimer;
  function toast(tekst) {
    var t = $(".toast");
    if (!t) return;
    t.textContent = tekst; t.hidden = false;
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { t.hidden = true; }, 2600);
  }

  function api(methode, pad, data) {
    var opties = { method: methode, headers: {} };
    if (data !== undefined) { opties.headers["Content-Type"] = "application/json"; opties.body = JSON.stringify(data); }
    return fetch(API + pad, opties).then(function (r) {
      return r.json().catch(function () { return {}; }).then(function (j) {
        if (!r.ok) { var f = new Error(j.fout || "Er ging iets mis. Probeer het opnieuw."); f.data = j; throw f; }
        return j;
      });
    }, function () { throw new Error("Geen verbinding met de winkel. Controleer je internet en probeer het opnieuw."); });
  }

  window.Winkel = {
    H: H, api: api, euro: euro, prijsRegel: prijsRegel, kleurInfo: kleurInfo, geldigeRal: geldigeRal, vanaf: vanaf,
    levertijd: levertijd, levertijdZin: levertijdZin, datum: datum, voorjaarMogelijk: voorjaarMogelijk,
    leesMand: leesMand, schrijfMand: schrijfMand, leegMand: leegMand, voegToe: voegToe, openMand: openMand,
    openLade: openLade, sluitLade: sluitLade, miniHor: miniHor, toast: toast, el: el,
    whatsapp: function (tekst) { return "https://wa.me/" + H.winkel.whatsapp + (tekst ? "?text=" + encodeURIComponent(tekst) : ""); }
  };

  // Aankondigingsbalk: elke paar seconden de volgende, of met de pijltjes.
  var meldingen = document.querySelectorAll(".aankondiging li"), nr = 0, draai;
  function toon(i) {
    if (!meldingen.length) return;
    meldingen[nr].classList.remove("aan");
    nr = (i + meldingen.length) % meldingen.length;
    meldingen[nr].classList.add("aan");
  }
  function start() { clearInterval(draai); draai = setInterval(function () { toon(nr + 1); }, 4500); }
  var vorige = $(".ak-vorige"), volgende = $(".ak-volgende");
  if (vorige) vorige.addEventListener("click", function () { toon(nr - 1); start(); });
  if (volgende) volgende.addEventListener("click", function () { toon(nr + 1); start(); });
  if (!window.matchMedia("(prefers-reduced-motion: reduce)").matches) start();

  // Menu op de telefoon
  var knop = $(".menu-knop"), menu = $("#menu");
  if (knop && menu) knop.addEventListener("click", function () {
    var isOpen = menu.classList.toggle("open");
    knop.setAttribute("aria-expanded", isOpen ? "true" : "false");
  });

  // De verschil-demo op de homepage: zelfde kozijn, oude witte hor of een hor in kleur.
  var demo = $(".verschil");
  if (demo) {
    var raam = $(".raam-svg", demo), modus = "kleur", kleur = "#383e42";
    var uitleg = $(".demo-uitleg", demo);
    function teken() {
      raam.style.setProperty("--kozijn", kleur);
      raam.style.setProperty("--kleur", modus === "oud" ? "#ecebe4" : kleur);
      demo.querySelectorAll(".schakelaar button").forEach(function (b) { b.classList.toggle("aan", b.dataset.modus === modus); });
      demo.querySelectorAll(".kleurknoppen button").forEach(function (b) { b.classList.toggle("aan", b.dataset.kleur === kleur); });
      if (uitleg) uitleg.textContent = modus === "oud" ? "Zo ziet het er vaak uit: een kozijn in een nieuwe kleur, en nog de oude witte hor." : "Hor en kozijn in dezelfde kleur. De hor valt weg in het kozijn.";
    }
    demo.addEventListener("click", function (e) {
      var b = e.target.closest("button");
      if (!b) return;
      if (b.dataset.modus) modus = b.dataset.modus;
      if (b.dataset.kleur) kleur = b.dataset.kleur;
      teken();
    });
    teken();
  }

  tekenMand();
  leesDeelLink();
  window.addEventListener("hashchange", leesDeelLink);
})();
