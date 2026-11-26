/* ---------------------------------------------------------------------------
   Afrekenen. Haalt de prijs op bij de kassa (niet uit de browser), vraagt het
   bezorgadres en twee vinkjes, maakt de bestelling aan en stuurt door naar
   Mollie voor iDEAL.

   Komt de klant via de link van een vakman (/afrekenen?klaar=<code>), dan staan
   de horren en zijn gegevens al klaar en hoeft hij niet aan te vinken dat hij
   zelf gemeten heeft: dat deed de vakman.
   --------------------------------------------------------------------------- */
(function () {
  "use strict";

  var W = window.Winkel, el = W.el;
  var $ = function (s) { return document.querySelector(s); };
  var KLANT = "kozijnhorren-klant";
  var klaarCode = new URLSearchParams(location.search).get("klaar");

  var mand = klaarCode ? { regels: [] } : W.leesMand();
  if (!klaarCode && !mand.regels.length) { location.replace("/bestellen"); return; }

  // Ingevulde gegevens bewaren voor als de betaling mislukt en je terugkomt.
  var velden = ["naam", "straat", "postcode", "plaats", "email", "telefoon"];
  function bewaarKlant() {
    var k = {};
    velden.forEach(function (v) { k[v] = $("#" + v).value.trim(); });
    try { sessionStorage.setItem(KLANT, JSON.stringify(k)); } catch (e) {}
    return k;
  }
  try {
    var eerder = JSON.parse(sessionStorage.getItem(KLANT)) || {};
    velden.forEach(function (v) { if (eerder[v]) $("#" + v).value = eerder[v]; });
  } catch (e) {}
  velden.forEach(function (v) { $("#" + v).addEventListener("input", bewaarKlant); });

  if (W.voorjaarMogelijk()) $("#lever-keuze").hidden = false;
  document.querySelectorAll('input[name="voorjaar"]').forEach(function (r) { r.addEventListener("change", laadPrijs); });

  function voorjaar() {
    var r = document.querySelector('input[name="voorjaar"]:checked');
    return !$("#lever-keuze").hidden && !!r && r.value === "ja";
  }

  function laadPrijs() {
    W.api("POST", "/horren/prijs", { regels: mand.regels, voorjaar: voorjaar() }).then(function (p) {
      $("#laden").hidden = true;
      if (p.fouten && p.fouten.length) { toonFouten(p.fouten); return; }
      toonOverzicht(p);
      $("#betaal").disabled = false;
      $("#betaal").textContent = "Betalen met iDEAL · " + W.euro(p.totaal);
    }).catch(function (e) { $("#laden").hidden = true; toonFouten([e.message]); });
  }

  function toonOverzicht(p) {
    var lijst = $("#overzicht");
    lijst.textContent = "";
    p.regels.forEach(function (r) {
      var li = el("li");
      li.appendChild(W.miniHor(r));
      var t = el("div");
      t.appendChild(el("b", "", (r.aantal > 1 ? r.aantal + "× " : "") + r.productnaam));
      t.appendChild(el("small", "", r.breedte + " × " + r.hoogte + " mm · " + r.kleur.naam + (r.naam ? " · " + r.naam : "")));
      li.appendChild(t);
      li.appendChild(el("span", "regelprijs", W.euro(r.bedrag)));
      lijst.appendChild(li);
    });
    $("#totaal-blok").hidden = false;
    $("#verzend").textContent = p.verzendkosten ? W.euro(p.verzendkosten) : "Gratis";
    $("#btw").textContent = W.euro(p.btw);
    $("#totaal").textContent = W.euro(p.totaal);
    var lt = p.levertijd;
    $("#levertijd").textContent = lt.voorjaar ? "Levering begin maart." : "Verwacht tussen " + W.datum(lt.van) + " en " + W.datum(lt.tot) + ".";
    var snel = W.levertijd(p.regels.some(function (r) { return !r.kleur.standaard; }), false);
    $("#lever-snel").textContent = "Verwacht tussen " + W.datum(snel.van) + " en " + W.datum(snel.tot) + ".";
  }

  function toonFouten(lijst) {
    var ul = $("#fouten");
    ul.textContent = "";
    lijst.forEach(function (f) { ul.appendChild(el("li", "", f)); });
    ul.hidden = !lijst.length;
    if (lijst.length) ul.scrollIntoView({ behavior: "smooth", block: "center" });
  }

  // De link van de vakman werkt niet (meer): niets te betalen, wel een uitweg.
  function klaarStop(tekst) {
    $("#laden").hidden = true;
    $("#klaar-stop-tekst").textContent = tekst;
    $("#klaar-stop").hidden = false;
    document.querySelectorAll("#afrekenen > :not(#kop):not(#klaar-stop):not(#terug)").forEach(function (e) { e.hidden = true; });
    $("#terug").hidden = true;
    $(".samenvatting").hidden = true;
  }

  function laadKlaargezet() {
    W.api("GET", "/horren/klaargezet/" + encodeURIComponent(klaarCode)).then(function (k) {
      if (k.status === "betaald") {
        $("#kop").textContent = "Al besteld";
        klaarStop("Deze horren zijn al besteld en betaald. Je krijgt een mail zodra ze onderweg zijn.");
        return;
      }
      if (k.status !== "open") {
        $("#kop").textContent = "Deze link is verlopen";
        klaarStop("Deze link werkt niet meer. Stuur ons een berichtje, dan zetten we je horren opnieuw klaar.");
        return;
      }
      mand = { regels: k.regels };
      velden.forEach(function (v) { if (k.klant[v] && !$("#" + v).value) $("#" + v).value = k.klant[v]; });
      $("#kop").textContent = "Je horren bestellen";
      $("#terug").hidden = true;
      $("#klaar-door").textContent = k.vakman;
      $("#klaar-banner").hidden = false;
      $("#gemeten-regel").hidden = true;
      $("#gemeten-door").textContent = "Opgemeten door " + k.vakman + ". Past een hor toch niet, dan maken we een nieuwe.";
      $("#gemeten-door").hidden = false;
      laadPrijs();
    }).catch(function (e) {
      $("#kop").textContent = "Deze link werkt niet";
      klaarStop(e.message + " Stuur ons een berichtje, dan zetten we je horren opnieuw klaar.");
    });
  }

  $("#afrekenen").addEventListener("submit", function (e) {
    e.preventDefault();
    var knop = $("#betaal");
    var tekst = knop.textContent;
    knop.disabled = true;
    knop.textContent = "Even geduld…";
    toonFouten([]);
    var bestelling = {
      regels: mand.regels,
      klant: bewaarKlant(),
      voorjaar: voorjaar(),
      akkoord: { gemeten: klaarCode ? true : $("#gemeten").checked, voorwaarden: $("#voorwaarden").checked },
      website: $("#website").value
    };
    if (klaarCode) bestelling.klaar = klaarCode;
    W.api("POST", "/horren/bestellingen", bestelling).then(function (b) {
      try { localStorage.setItem("kozijnhorren-laatste", JSON.stringify({ nr: b.nr, t: b.token })); } catch (err) {}
      location.href = b.betaal_url;
    }).catch(function (err) {
      toonFouten(err.data && err.data.fouten ? err.data.fouten : [err.message]);
      knop.disabled = false;
      knop.textContent = tekst;
    });
  });

  if (klaarCode) laadKlaargezet(); else laadPrijs();
})();
