/* ---------------------------------------------------------------------------
   De bestelpagina: één hor, vier keuzes. Uitvoering (Basis of Luxe), kleur,
   maat en aantal. De prijs staat er direct bij; "In winkelmand" zet hem in de
   zijlade, en daar kun je verder met het volgende raam.

   Voorkeuzes via de link: /bestellen?uitvoering=luxe&kleur=7021. Zo komt een
   klant vanuit het opleverrapport van iWrap binnen met de kleur van zijn folie.

   Teksten met een apostrof altijd tussen dubbele aanhalingstekens.
   --------------------------------------------------------------------------- */
(function () {
  "use strict";

  var W = window.Winkel, H = W.H, el = W.el;
  var $ = function (s) { return document.querySelector(s); };
  var galerij = $("#galerij");

  var keuze = { uitvoering: "basis", kleur: "7016", folie: "", aantal: 1 };

  // Voorkeuzes uit de link
  var q = new URLSearchParams(location.search);
  if (q.get("uitvoering") === "luxe") keuze.uitvoering = "luxe";
  var linkKleur = W.geldigeRal(q.get("kleur"));
  if (linkKleur) {
    keuze.kleur = linkKleur;
    if (!W.kleurInfo(linkKleur).standaard) keuze.uitvoering = "luxe";
    var f = H.folies.filter(function (x) { return x.ral === linkKleur; })[0];
    if (f && !W.kleurInfo(linkKleur).standaard) keuze.folie = f.naam;
  }

  // --- Uitvoering ---------------------------------------------------------

  document.querySelectorAll(".uitvoering").forEach(function (b) {
    b.addEventListener("click", function () { zetUitvoering(b.dataset.uitvoering); });
  });

  function zetUitvoering(u) {
    keuze.uitvoering = u;
    document.querySelectorAll(".uitvoering").forEach(function (b) {
      var aan = b.dataset.uitvoering === u;
      b.classList.toggle("aan", aan);
      b.setAttribute("aria-checked", aan ? "true" : "false");
    });
    var p = H.producten[u];
    $("#titel").textContent = p.naam;
    $("#badge").textContent = u === "luxe" ? "Luxe" : "Basis";
    galerij.classList.toggle("luxe", u === "luxe");
    galerij.querySelectorAll(".hor-svg, .raam-svg").forEach(function (s) { s.classList.toggle("luxe", u === "luxe"); });
    // Terug naar Basis met een kleur die de Basis niet heeft? Dan de dichtstbijzijnde standaardkleur.
    if (u === "basis" && !W.kleurInfo(keuze.kleur).standaard) {
      keuze.kleur = "7016"; keuze.folie = "";
      W.toast("De Basis is er in vier kleuren. We hebben antraciet gekozen.");
    }
    tekenKleuren();
  }

  // --- Kleur --------------------------------------------------------------

  var kleurDoos = $("#kleurkeuze");
  H.kleuren.standaard.forEach(function (k) {
    var b = el("button", "kleurbol");
    b.type = "button";
    b.dataset.code = k.code;
    b.style.setProperty("--kleur", k.hex);
    b.setAttribute("role", "radio");
    b.setAttribute("aria-label", k.naam + ", RAL " + k.code);
    b.title = k.naam;
    b.addEventListener("click", function () { keuze.kleur = k.code; keuze.folie = ""; $("#ral").value = ""; $("#folie").value = ""; tekenKleuren(); });
    kleurDoos.appendChild(b);
  });
  var ander = el("button", "kleurbol ander");
  ander.type = "button";
  ander.setAttribute("aria-label", "Een andere kleur");
  ander.title = "Een andere kleur (Luxe)";
  ander.addEventListener("click", function () {
    if (keuze.uitvoering !== "luxe") { zetUitvoering("luxe"); W.toast("Elke kleur kan met de Luxe."); }
    $("#kleur-extra").hidden = false;
    tekenKleuren(true);
    $("#folie").focus();
  });
  kleurDoos.appendChild(ander);

  var folieSelect = $("#folie");
  H.folies.forEach(function (f, i) {
    var o = el("option", "", f.naam + (f.soort === "houtnerf" ? " (houtnerf)" : "") + "  →  RAL " + f.ral);
    o.value = String(i);
    folieSelect.appendChild(o);
  });
  folieSelect.addEventListener("change", function () {
    var fo = H.folies[parseInt(folieSelect.value, 10)];
    if (!fo) return;
    keuze.kleur = fo.ral; keuze.folie = fo.naam; $("#ral").value = "";
    if (!W.kleurInfo(fo.ral).standaard && keuze.uitvoering !== "luxe") zetUitvoering("luxe");
    tekenKleuren(true);
  });
  $("#ral").addEventListener("input", function (e) {
    var code = W.geldigeRal(e.target.value);
    e.target.classList.toggle("fout", e.target.value.replace(/\D/g, "").length >= 4 && !code);
    if (code) { keuze.kleur = code; keuze.folie = ""; folieSelect.value = ""; tekenKleuren(true); }
  });

  function tekenKleuren(extraOpen) {
    var k = W.kleurInfo(keuze.kleur);
    var eigen = !k.standaard || !!keuze.folie;
    kleurDoos.querySelectorAll(".kleurbol").forEach(function (b) {
      var aan = b.classList.contains("ander") ? eigen : (b.dataset.code === keuze.kleur && !keuze.folie);
      b.classList.toggle("aan", aan);
      b.setAttribute("aria-checked", aan ? "true" : "false");
    });
    ander.style.background = eigen ? k.hex : "";
    if (keuze.uitvoering !== "luxe") $("#kleur-extra").hidden = true;
    else if (extraOpen || eigen) $("#kleur-extra").hidden = false;
    $("#kleur-naam").textContent = k.naam + (k.standaard ? "" : " (RAL " + k.code + ")");
    var hulp = "";
    if (keuze.folie) {
      var fo = H.folies.filter(function (x) { return x.naam === keuze.folie; })[0];
      hulp = (fo && fo.gecontroleerd ? "Past bij " : "Onze suggestie bij ") + keuze.folie.toLowerCase() + ": RAL " + k.code + ". ";
    }
    if (!k.standaard) hulp += "Een eigen kleur duurt ongeveer " + H.kleuren.ral_extra_werkdagen + " werkdagen langer.";
    else if (keuze.uitvoering === "basis") hulp = hulp || "Een andere kleur? Die kan met de Luxe.";
    $("#kleur-hulp").textContent = hulp;
    galerij.querySelectorAll(".hor-svg, .raam-svg").forEach(function (s) {
      s.style.setProperty("--kleur", k.hex);
      s.style.setProperty("--kozijn", k.hex);
    });
    var lt = W.levertijd(!k.standaard, false);
    $("#levertijd-kort").textContent = "In huis rond " + W.datum(lt.tot);
    werkPrijsBij();
  }

  // --- Galerij ------------------------------------------------------------

  galerij.querySelectorAll("[data-toon]").forEach(function (b) {
    b.addEventListener("click", function () {
      galerij.querySelectorAll("[data-toon]").forEach(function (x) { x.classList.toggle("aan", x === b); });
      galerij.querySelectorAll("[data-beeld]").forEach(function (x) { x.hidden = x.dataset.beeld !== b.dataset.toon; });
    });
  });

  // --- Maat en aantal -----------------------------------------------------

  ["breedte", "hoogte"].forEach(function (v) {
    var input = $("#" + v);
    input.addEventListener("input", function () { input.value = input.value.replace(/\D/g, "").slice(0, 4); werkPrijsBij(); });
    input.addEventListener("blur", function () { werkPrijsBij(true); });
  });
  function zetAantal(n) {
    keuze.aantal = Math.max(1, Math.min(H.max_aantal_per_regel, n));
    $("#aantal").textContent = keuze.aantal;
    werkPrijsBij();
  }
  $("#minder").addEventListener("click", function () { zetAantal(keuze.aantal - 1); });
  $("#meer").addEventListener("click", function () { zetAantal(keuze.aantal + 1); });
  $("#naam-toggle").addEventListener("click", function () {
    $("#naam-veld").hidden = false; $("#naam-toggle").hidden = true; $("#naam").focus();
  });

  function regel() {
    return { uitvoering: keuze.uitvoering, breedte: $("#breedte").value, hoogte: $("#hoogte").value,
             kleur: keuze.kleur, aantal: keuze.aantal, naam: $("#naam").value.trim() };
  }

  function maatFouten(streng) {
    var fouten = { breedte: "", hoogte: "" }, g = H.maatgrenzen;
    ["breedte", "hoogte"].forEach(function (v) {
      var w = parseInt($("#" + v).value, 10);
      if (!w) return;
      if (w > g[v].max) fouten[v] = "Maximaal " + g[v].max + " mm.";
      else if (w < g[v].min && (streng || String(w).length >= 3)) {
        fouten[v] = w < 100 ? "Dat lijkt in centimeters. Bedoel je " + (w * 10) + " mm?" : "Minimaal " + g[v].min + " mm.";
      }
    });
    return fouten;
  }

  function werkPrijsBij(streng) {
    var fouten = maatFouten(streng);
    ["breedte", "hoogte"].forEach(function (v) {
      var f = $("#" + v + "-fout");
      f.textContent = fouten[v]; f.hidden = !fouten[v];
      $("#" + v).classList.toggle("fout", !!fouten[v]);
    });
    var r = W.prijsRegel(regel());
    var uit = $("#prijs");
    uit.textContent = "";
    var knop = $("#in-mand");
    $("#vanaf").textContent = "Vanaf " + W.euro(W.vanaf(keuze.uitvoering));
    if (r.onvolledig || r.fouten.length) {
      uit.appendChild(el("span", "melding", r.onvolledig ? "Vul de maat in, dan zie je je prijs" : r.fouten[0]));
      knop.disabled = true;
      return;
    }
    var b = el("div", "bedrag", W.euro(r.bedrag));
    uit.appendChild(b);
    if (r.aantal > 1) uit.appendChild(el("div", "melding", r.aantal + " × " + W.euro(r.stukprijs)));
    knop.disabled = false;
  }

  // --- In de winkelmand ---------------------------------------------------

  $("#koop").addEventListener("submit", function (e) {
    e.preventDefault();
    var r = regel();
    var p = W.prijsRegel(r);
    if (p.onvolledig || p.fouten.length) { werkPrijsBij(true); return; }
    r.breedte = p.breedte; r.hoogte = p.hoogte;
    W.voegToe(r);
    $("#breedte").value = ""; $("#hoogte").value = ""; $("#naam").value = "";
    zetAantal(1);
    W.openMand();
  });

  document.addEventListener("nog-een-raam", function () {
    $("#breedte").scrollIntoView({ behavior: "smooth", block: "center" });
    setTimeout(function () { $("#breedte").focus(); }, 350);
  });

  // --- Meethulp -----------------------------------------------------------

  var lade = $("#meethulp"), laag = $("#meethulp-laag");
  $("#meethulp-knop").addEventListener("click", function () { W.openLade(lade, laag); });
  $("#meethulp-sluit").addEventListener("click", W.sluitLade);
  laag.addEventListener("click", W.sluitLade);

  zetUitvoering(keuze.uitvoering);
  tekenKleuren(!!linkKleur);
})();
