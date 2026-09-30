/* ---------------------------------------------------------------------------
   Het opleverrapport op /r/<id>. De pagina is een lege huls; alles komt uit
   /api/rapporten/<id>. Staat Max ingelogd op dit apparaat, dan zie je ook een
   concept (met een balk erboven), zodat hij kan kijken voordat de klant het ziet.

   Let op bij bewerken: Nederlandse teksten met een apostrof altijd tussen
   dubbele aanhalingstekens. build.py controleert dat.
   --------------------------------------------------------------------------- */
(function () {
  "use strict";

  var pagina = document.querySelector(".rapport-pagina");
  var pad = location.pathname.match(/^\/r\/([a-z0-9]+)/);
  var rid = pad ? pad[1] : new URLSearchParams(location.search).get("id");
  var token = "";
  try { token = localStorage.getItem("iwrap-max-token") || ""; } catch (e) {}

  function $(sel) { return document.querySelector(sel); }
  function veld(naam, tekst) {
    document.querySelectorAll('[data-veld="' + naam + '"]').forEach(function (el) { el.textContent = tekst; });
  }
  function euro(n) {
    return "€ " + (Math.round(n) === n ? n.toLocaleString("nl-NL") : n.toLocaleString("nl-NL", { minimumFractionDigits: 2, maximumFractionDigits: 2 }));
  }
  function datum(iso, metJaar) {
    if (!iso) return "";
    var d = new Date(iso.length === 10 ? iso + "T12:00:00" : iso);
    if (isNaN(d)) return iso;
    return d.toLocaleDateString("nl-NL", metJaar === false ? { day: "numeric", month: "long" } : { day: "numeric", month: "long", year: "numeric" });
  }
  function jarenLater(iso, jaren) {
    var d = new Date(iso + "T12:00:00");
    d.setFullYear(d.getFullYear() + jaren);
    return d.toISOString().slice(0, 10);
  }
  function el(tag, klasse, tekst) {
    var e = document.createElement(tag);
    if (klasse) e.className = klasse;
    if (tekst != null) e.textContent = tekst;
    return e;
  }
  function stip(stand) {
    var s = el("span", "stip stip-" + stand);
    s.setAttribute("aria-hidden", "true");
    return s;
  }

  var STANDNAAM = { groen: "In orde", oranje: "In de gaten houden", rood: "Advies" };

  function fout() {
    $("#rapport-laden").hidden = true;
    $("#rapport-fout").hidden = false;
  }

  if (!rid) { fout(); return; }

  fetch("/api/rapporten/" + encodeURIComponent(rid), { headers: token ? { Authorization: "Bearer " + token } : {} })
    .then(function (r) { if (!r.ok) throw new Error(r.status); return r.json(); })
    .then(toon)
    .catch(fout);

  function toon(r) {
    document.title = "Opleverrapport " + (r.klant.straat || r.klant.naam || "") + " | iWrap";
    $("#concept-balk").hidden = r.status === "klaar";

    var adres = [r.klant.straat, r.klant.plaats].filter(Boolean).join(", ");
    veld("adres", adres || r.klant.naam || "Je opleverrapport");
    veld("naam", adres ? r.klant.naam : "");
    var o = r.oplevering || {};
    veld("datum-zin", o.datum ? (adres && r.klant.naam ? " · " : "") + "opgeleverd op " + datum(o.datum) : "");
    veld("datum", datum(o.datum));

    if (o.werk) veld("werk", o.werk); else $(".werk-tekst").hidden = true;
    if (o.folie) veld("folie", o.folie + (o.folie_ral ? " (past bij RAL " + o.folie_ral + ")" : ""));
    else $("#rij-folie").hidden = true;

    var jf = parseInt(pagina.dataset.folieJaren, 10), jm = parseInt(pagina.dataset.montageJaren, 10);
    if (o.datum) {
      veld("garantie-folie", jf + " jaar, tot " + datum(jarenLater(o.datum, jf)));
      veld("garantie-montage", jm + " jaar, tot " + datum(jarenLater(o.datum, jm)));
    } else {
      veld("garantie-folie", jf + " jaar fabrieksgarantie");
      veld("garantie-montage", jm + " jaar");
    }

    toonCheck(r);
    toonHorren(r);

    var wa = pagina.dataset.whatsapp;
    $("#vraag-knop").href = "https://wa.me/" + wa + "?text=" +
      encodeURIComponent("Hoi Max, ik heb een vraag over mijn rapport: " + location.href);

    $("#bewaar-pdf").addEventListener("click", function () { window.print(); });
    $("#rapport-laden").hidden = true;
    $("#rapport").hidden = false;
  }

  function toonCheck(r) {
    var s = r.samenvatting;
    var kleur = s.rood ? "rood" : s.oranje ? "oranje" : "groen";
    var zin = $('[data-veld="samenvatting"]');
    zin.textContent = "";
    if (!s.beoordeeld) { $("#blok-check").hidden = true; return; }
    zin.appendChild(stip(kleur));
    zin.appendChild(document.createTextNode(s.zin));
    veld("disclaimer", r.disclaimer);

    var lijst = $("#checklijst");
    var wa = pagina.dataset.whatsapp;
    r.check.forEach(function (c) {
      var li = el("li", "stand-" + c.stand);
      li.appendChild(stip(c.stand));
      var kop = el("div", "check-kop");
      kop.appendChild(el("b", "", c.naam));
      kop.appendChild(el("span", "check-label", c.label));
      kop.appendChild(el("span", "check-stand", STANDNAAM[c.stand] || ""));
      li.appendChild(kop);
      if (c.stand === "oranje" || c.stand === "rood") {
        var uitleg = el("div", "check-uitleg");
        uitleg.appendChild(el("p", "", c.advies));
        if (c.notitie) {
          var n = el("p", "check-notitie");
          n.appendChild(el("b", "", "Max: "));
          n.appendChild(document.createTextNode(c.notitie));
          uitleg.appendChild(n);
        }
        if (c.fotos && c.fotos.length) {
          var fotos = el("div", "check-fotos");
          c.fotos.forEach(function (url) {
            var a = el("a");
            a.href = url; a.target = "_blank"; a.rel = "noopener";
            var img = el("img");
            img.src = url; img.alt = "Foto bij " + c.naam.toLowerCase(); img.loading = "lazy";
            a.appendChild(img);
            fotos.appendChild(a);
          });
          uitleg.appendChild(fotos);
        }
        var acties = el("p", "check-actie");
        if (c.sleutel === "horren" && r.horren_advies) {
          var naar = el("a", "", "Nieuwe horren in de kleur van je kozijn");
          naar.href = "#blok-horren";
          acties.appendChild(naar);
        } else {
          var vraag = el("a", "", "Vraag Max hierover");
          vraag.href = "https://wa.me/" + wa + "?text=" + encodeURIComponent(
            "Hoi Max, over mijn rapport (" + location.href + "): " + c.naam.toLowerCase() + ". ");
          vraag.target = "_blank"; vraag.rel = "noopener";
          acties.appendChild(vraag);
        }
        uitleg.appendChild(acties);
        li.appendChild(uitleg);
      }
      lijst.appendChild(li);
    });
  }

  /* Staan de horren op oranje of rood, dan een tip met een link naar
     kozijnhorren.nl, met de horkleur die bij de folie hoort al gekozen. */
  function toonHorren(r) {
    var a = r.horren_advies;
    if (!a) return;
    $("#blok-horren").hidden = false;
    veld("winkel-domein", a.domein);
    veld("kleur-zin", a.kleur ? "in dezelfde kleur als je folie" : "in de kleur van je kozijn");
    if (a.kleur) {
      $("#kleurtip").hidden = false;
      $("#kleurtip-staal").style.background = a.kleur.hex || "#ccc";
      veld("kleurtip", "Bij je folie hoort " + a.kleur.naam + " (RAL " + a.kleur.code + "). Die staat al voor je klaar.");
    }
    $("#bestel-knop").href = a.url;
  }
})();
