/* ---------------------------------------------------------------------------
   /bestelling?nr=...&t=...  Hier komt de klant terug na het betalen, en hier
   leidt de link in elke mail naartoe. Staat de betaling nog open, dan vragen
   we een halve minuut lang elke paar seconden opnieuw: iDEAL is meestal
   binnen een paar tellen rond.
   --------------------------------------------------------------------------- */
(function () {
  "use strict";

  var W = window.Winkel, el = W.el;
  var $ = function (s) { return document.querySelector(s); };
  var q = new URLSearchParams(location.search);
  var nr = q.get("nr"), t = q.get("t");
  var pogingen = 0;

  if (!nr || !t) {
    try { var l = JSON.parse(localStorage.getItem("kozijnhorren-laatste")); if (l) { nr = l.nr; t = l.t; } } catch (e) {}
  }
  if (!nr || !t) { toon({ status: "onbekend" }); return; }
  haal();

  function haal() {
    W.api("GET", "/horren/bestellingen/" + encodeURIComponent(nr) + "?t=" + encodeURIComponent(t)).then(function (b) {
      toon(b);
      if (b.status === "open" && pogingen++ < 12) setTimeout(haal, 3000);
    }).catch(function () { toon({ status: "onbekend" }); });
  }

  var STAPPEN = [["betaald", "Betaald"], ["besteld", "In productie bij de maker"], ["verzonden", "Onderweg naar je toe"], ["afgerond", "Geleverd"]];

  function toon(b) {
    var doos = $("#status");
    doos.textContent = "";
    var icoon, titel, tekst;
    if (b.status === "open") {
      icoon = ["wacht", "…"]; titel = "We wachten op je betaling";
      tekst = "Dit duurt meestal maar een paar seconden. Heb je de betaling afgebroken? Dan kun je het opnieuw proberen.";
    } else if (b.status === "mislukt" || b.status === "geannuleerd") {
      icoon = ["mis", "×"]; titel = b.status === "mislukt" ? "De betaling is niet gelukt" : "Deze bestelling is geannuleerd";
      tekst = b.status === "mislukt" ? "Er is niets afgeschreven. Je winkelmand staat nog klaar, dus je kunt het gewoon opnieuw proberen." : "Heb je hier vragen over? Neem dan even contact met ons op.";
    } else if (b.status === "onbekend") {
      icoon = ["mis", "?"]; titel = "We kunnen deze bestelling niet vinden";
      tekst = "Gebruik de link uit je bevestigingsmail, of neem contact met ons op.";
    } else {
      icoon = ["goed", "✓"]; titel = b.status === "betaald" ? "Bedankt, je bestelling is binnen" : "Je bestelling " + b.nr;
      tekst = "Je krijgt een bevestiging per mail. " + (b.levertijd ? (b.levertijd.voorjaar ? "Je horren komen begin maart." : "We verwachten je horren tussen " + W.datum(b.levertijd.van) + " en " + W.datum(b.levertijd.tot) + ".") : "");
      opruimen(b);
    }
    doos.appendChild(el("div", "status-icoon " + icoon[0], icoon[1]));
    doos.appendChild(el("h1", "", titel));
    doos.appendChild(el("p", "lead", tekst));
    if (b.nr) doos.appendChild(el("p", "melding", "Bestelnummer " + b.nr));

    if (b.status === "open" || b.status === "mislukt") {
      var terug = el("a", "knop knop-koraal", "Opnieuw proberen");
      terug.href = "/afrekenen";
      doos.appendChild(terug);
    }

    if (["betaald", "besteld", "verzonden", "afgerond"].indexOf(b.status) >= 0) {
      var index = STAPPEN.map(function (s) { return s[0]; }).indexOf(b.status);
      var ol = el("ol", "tijdlijn");
      STAPPEN.forEach(function (s, i) { ol.appendChild(el("li", i <= index ? "klaar" : i === index + 1 ? "nu" : "", s[1])); });
      doos.appendChild(ol);
      var rij = el("div", "knoprij");
      rij.style.justifyContent = "center";
      rij.style.marginTop = "24px";
      if (b.verzending && b.verzending.track) {
        var a = el("a", "knop knop-merk", "Volg je pakket");
        a.href = b.verzending.track; a.target = "_blank"; a.rel = "noopener";
        rij.appendChild(a);
      }
      var plaats = el("a", "knop knop-rand", "Zo plaats je de hor");
      plaats.href = "/meetinstructie#plaatsen";
      rij.appendChild(plaats);
      doos.appendChild(rij);
    }

    if (b.regels) {
      $("#details").hidden = false;
      var lijst = $("#bestellijst");
      lijst.textContent = "";
      b.regels.forEach(function (r) {
        var li = el("li");
        li.appendChild(W.miniHor(r));
        var tt = el("div");
        tt.appendChild(el("b", "", (r.aantal > 1 ? r.aantal + "× " : "") + r.productnaam));
        tt.appendChild(el("small", "", r.breedte + " × " + r.hoogte + " mm · " + r.kleur.naam + (r.naam ? " · " + r.naam : "")));
        li.appendChild(tt);
        li.appendChild(el("span", "regelprijs", W.euro(r.bedrag)));
        lijst.appendChild(li);
      });
      $("#totaal").textContent = W.euro(b.totaal);
      var k = b.klant || {};
      $("#adres").textContent = "Bezorgadres: " + [k.naam, k.straat, (k.postcode || "") + " " + (k.plaats || "")].join(", ") + ".";
    }
  }

  function opruimen(b) {
    // Afgerekend: de winkelmand leegmaken zodat hij niet blijft hangen.
    try {
      var l = JSON.parse(localStorage.getItem("kozijnhorren-laatste")) || {};
      if (l.nr === b.nr) { W.leegMand(); sessionStorage.removeItem("kozijnhorren-klant"); }
    } catch (e) {}
  }
})();
