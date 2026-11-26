/* ---------------------------------------------------------------------------
   De pagina voor de leverancier: /leverancier?nr=<nr>&t=<sleutel>. De link staat
   in de bestelmail. De leverancier ziet wat hij moet maken en waar het heen moet,
   bevestigt de bestelling en geeft later de verzending door. De klant krijgt dan
   vanzelf de mail dat zijn horren onderweg zijn.
   --------------------------------------------------------------------------- */
(function () {
  "use strict";

  var W = window.Winkel, el = W.el;
  var zoek = new URLSearchParams(location.search);
  var nr = zoek.get("nr") || "", sleutel = zoek.get("t") || "";
  var vak = document.getElementById("lev");

  function dag(seconden) {
    return new Date(seconden * 1000).toLocaleDateString("nl-NL", { day: "numeric", month: "long" });
  }

  function melding(tekst) {
    vak.textContent = "";
    vak.appendChild(el("p", "melding", tekst));
  }

  function laad() {
    W.api("GET", "/horren/leverancier/" + encodeURIComponent(nr) + "?t=" + encodeURIComponent(sleutel))
      .then(teken).catch(function (e) { melding(e.message); });
  }

  function doe(actie, extra, knop) {
    if (knop) knop.disabled = true;
    var data = { t: sleutel, actie: actie };
    Object.keys(extra || {}).forEach(function (k) { data[k] = extra[k]; });
    return W.api("POST", "/horren/leverancier/" + encodeURIComponent(nr), data)
      .then(function (b) { teken(b); W.toast("Bijgewerkt, dank je wel"); })
      .catch(function (e) { W.toast(e.message); if (knop) knop.disabled = false; });
  }

  function statusZin(b) {
    if (b.status === "verzonden" || b.status === "afgerond") {
      return "Verzonden" + (b.verzending ? " op " + dag(b.verzending.op) : "") + ". De klant heeft bericht gekregen.";
    }
    if (b.status === "geannuleerd") return "Deze bestelling is geannuleerd. Niet maken.";
    return b.bevestigd ? "In productie, bevestigd op " + dag(b.bevestigd) + "." : "Nieuw: nog niet bevestigd.";
  }

  function teken(b) {
    vak.textContent = "";
    vak.appendChild(el("p", "opschrift", "Bestelling van " + b.winkel));
    vak.appendChild(el("h1", "", "Bestelling " + b.nr));
    vak.appendChild(el("p", "lev-status" + (b.bevestigd || b.status === "verzonden" ? " goed" : ""), statusZin(b)));

    var lijst = el("ol", "lev-regels");
    b.regels.forEach(function (r, i) {
      var li = el("li");
      li.appendChild(el("b", "", r.aantal + "× inklemhor (" + r.uitvoering + ")" + (r.naam ? " · " + r.naam : "")));
      li.appendChild(el("span", "", "B " + r.breedte + " mm × H " + r.hoogte + " mm (dagmaat)"));
      li.appendChild(el("span", "", "RAL " + r.kleur.code + " " + r.kleur.naam + " · " + r.gaas.toLowerCase() +
        (r.middenregel ? " · met middenregel" : "")));
      li.appendChild(el("small", "", "Referentie " + b.nr + "-" + (i + 1)));
      lijst.appendChild(li);
    });
    vak.appendChild(lijst);

    var k = b.klant;
    var adres = el("div", "lev-adres");
    adres.appendChild(el("h2", "", "Rechtstreeks leveren aan"));
    [k.naam, k.straat, k.postcode + " " + k.plaats, "Tel. " + k.telefoon].forEach(function (regel) {
      adres.appendChild(el("p", "", regel));
    });
    if (b.levertijd && b.levertijd.voorjaar) {
      adres.appendChild(el("p", "lev-let", "Leveren vanaf " + W.datum(b.levertijd.van) + ", niet eerder."));
    }
    adres.appendChild(el("p", "lev-let", "Graag neutraal verpakken, zonder prijzen of pakbon met prijzen."));
    vak.appendChild(adres);

    if (b.status === "betaald" || b.status === "besteld") {
      var acties = el("div", "lev-acties");
      if (!b.bevestigd) {
        var ontvangen = el("button", "knop knop-oranje knop-vol", "Ontvangen, gaat in productie");
        ontvangen.type = "button";
        ontvangen.addEventListener("click", function () { doe("bevestigd", {}, ontvangen); });
        acties.appendChild(ontvangen);
      }
      acties.appendChild(el("h2", "", "Verzonden?"));
      var veld = el("div", "veld");
      var label = el("label", "", "Track & trace-link (als je die hebt)");
      label.setAttribute("for", "lev-track");
      var track = el("input");
      track.type = "url"; track.id = "lev-track"; track.placeholder = "https://";
      veld.appendChild(label); veld.appendChild(track);
      acties.appendChild(veld);
      var verzonden = el("button", "knop knop-donker knop-vol", "Verzonden: laat het de klant weten");
      verzonden.type = "button";
      verzonden.addEventListener("click", function () {
        var link = track.value.trim();
        if (link && !/^https?:\/\//.test(link)) { W.toast("Een track & trace-link begint met https://"); return; }
        doe("verzonden", { track: link }, verzonden);
      });
      acties.appendChild(verzonden);
      vak.appendChild(acties);
    } else if (b.verzending && b.verzending.track) {
      var volg = el("p");
      var a = el("a", "", "Track & trace");
      a.href = b.verzending.track; a.target = "_blank"; a.rel = "noopener";
      volg.appendChild(a);
      vak.appendChild(volg);
    }

    var probleem = el("details", "lev-probleem");
    probleem.appendChild(el("summary", "", "Iets niet duidelijk, of gaat er iets mis?"));
    var tekst = el("textarea");
    tekst.rows = 3;
    tekst.setAttribute("aria-label", "Wat is er aan de hand?");
    tekst.placeholder = "Bijvoorbeeld: deze kleur is pas over drie weken leverbaar.";
    var stuur = el("button", "knop knop-rand", "Stuur naar " + b.winkel);
    stuur.type = "button";
    stuur.addEventListener("click", function () { doe("probleem", { opmerking: tekst.value }, stuur); });
    probleem.appendChild(tekst);
    probleem.appendChild(stuur);
    vak.appendChild(probleem);
  }

  if (!nr || !sleutel) melding("Deze link is niet compleet. Gebruik de link uit de bestelmail.");
  else laad();
})();
