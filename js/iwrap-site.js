/* ---------------------------------------------------------------------------
   iWrap site: kleine bewegingen die iets uitleggen.

   js/iwrap-site.js: het gedrag op de bestaande pagina's. Eén bestand voor de
   hele site. Elk onderdeel zoekt zijn eigen element op de pagina en doet niets
   als dat er niet is, dus dit bestand kan op elke pagina staan. Laad het als
   laatste: ná js/iwrap-animaties.js (de motor met de logo-animaties en de
   scènes), main.js, film.js en doorsnede.js.

   Spelregels (uit de Motion Kit):
   - alles wat veegt, rolt of glanst volgt de schuinte van het beeldmerk: 64,56°;
   - een stip is een opgerolde baan: folie rolt op en rolt uit;
   - aandrukken, niet stuiteren: kort aanzetten, zacht uitlopen, hooguit een
     paar procent doorveren;
   - elke animatie legt iets uit of helpt de bezoeker verder; pure versiering
     laten we weg;
   - elke animatie speelt één keer; wie "minder beweging" aan heeft, ziet meteen
     het eindbeeld.

   Let op bij bewerken: Nederlandse teksten met een apostrof altijd tussen
   dubbele aanhalingstekens (build.py controleert dat).
   --------------------------------------------------------------------------- */
(function () {
  "use strict";

  var RUSTIG = !!(window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches);
  var NS = "http://www.w3.org/2000/svg";
  var HOEK = 64.56 * Math.PI / 180, COT = Math.cos(HOEK) / Math.sin(HOEK);

  /* Hulpjes --------------------------------------------------------------- */

  function $$(s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); }
  function klem(x, a, b) { return Math.max(a, Math.min(b, x)); }
  function mix(a, b, p) { return a + (b - a) * p; }
  // Hoe ver we zijn: 0 voor 'van', 1 na 'van + duur'.
  function fase(t, van, duur) { return klem((t - van) / duur, 0, 1); }
  function r2(n) { return Math.round(n * 100) / 100; }
  var E = {
    uit: function (p) { return 1 - Math.pow(1 - p, 3); },
    zacht: function (p) { return p < 0.5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2; },
    // aandrukken: komt iets voorbij 1 (hooguit 3%) en zakt terug
    druk: function (p) { var c = 0.9, u = p - 1; return 1 + (c + 1) * u * u * u + c * u * u; }
  };
  function maak(tag, attr, ouder) {
    var e = document.createElementNS(NS, tag);
    for (var k in attr) if (attr[k] != null) e.setAttribute(k, attr[k]);
    if (ouder) ouder.appendChild(e);
    return e;
  }
  // Speelt een tijdlijn van 'duur' seconden af; geeft een stopfunctie terug.
  function speel(duur, teken, klaar) {
    var t0 = null, frame = 0, uit = false;
    function stap(nu) {
      if (uit) return;
      if (t0 === null) t0 = nu;
      var t = (nu - t0) / 1000;
      teken(Math.min(t, duur));
      if (t < duur) frame = requestAnimationFrame(stap);
      else if (klaar) klaar();
    }
    frame = requestAnimationFrame(stap);
    return function () { uit = true; cancelAnimationFrame(frame); };
  }
  // Zoals main.js: wat bij het laden al in beeld staat, speelt meteen; wat nog
  // onder de rand zit, wordt klaargezet en speelt zodra het goed in beeld komt.
  function bijBeeld(el, klaarzetten, afspelen, drempel) {
    if (RUSTIG || !el) return;
    if (!("IntersectionObserver" in window)) { afspelen(); return; }
    if (el.getBoundingClientRect().top < window.innerHeight * 0.85) { setTimeout(afspelen, 300); return; }
    klaarzetten();
    var klaar = false;
    function start() {
      if (klaar) return;
      klaar = true;
      kijker.disconnect();
      window.removeEventListener("scroll", voorbij);
      afspelen();
    }
    // Wie in één keer voorbij springt (een link naar verderop), ziet hem nooit in
    // beeld komen; dan toch afspelen, zodat er niet ergens een 0 blijft staan.
    function voorbij() { if (el.getBoundingClientRect().bottom < 0) start(); }
    var kijker = new IntersectionObserver(function (rijen) {
      rijen.forEach(function (r) { if (r.isIntersecting) start(); });
    }, { threshold: drempel || 0.45 });
    kijker.observe(el);
    window.addEventListener("scroll", voorbij, { passive: true });
  }
  /* 1. Het logo in de menubalk: geen script nodig. Het logo staat als SVG in de
     pagina (build.py) en rolt uit met CSS ("De uitrol van het logo" in style.css). */

  /* 2. Hint op de voor/na-schuif ------------------------------------------- */
  /* De eerste schuif die goed in beeld komt, gaat één keer zelf heen en weer:
     even naar voor, even naar na, terug naar waar hij stond. Eén keer per
     pagina, en niet als iemand al aan een schuif heeft gezeten. Er wordt niets
     in de browser bewaard (zie /privacy). */
  (function () {
    var schuiven = $$(".vergelijk");
    if (!schuiven.length || RUSTIG || !("IntersectionObserver" in window)) return;
    var aangeraakt = false;
    schuiven.forEach(function (s) {
      ["pointerdown", "keydown", "touchstart"].forEach(function (n) {
        s.addEventListener(n, function () { aangeraakt = true; }, { passive: true });
      });
    });
    var kijker = new IntersectionObserver(function (rijen) {
      rijen.forEach(function (r) {
        if (!r.isIntersecting || aangeraakt) return;
        kijker.disconnect();
        setTimeout(function () { hint(r.target); }, 500);
      });
    }, { threshold: 0.6 });
    schuiven.forEach(function (s) { kijker.observe(s); });

    function hint(blok) {
      var schuif = blok.querySelector("input[type=range]");
      if (aangeraakt || !schuif) return;
      var start = Number(schuif.value) || 50, stop = null;
      blok.classList.add("vergelijk-hint");
      stop = speel(2.5, function (t) {
        if (aangeraakt) { if (stop) stop(); blok.classList.remove("vergelijk-hint"); return; }
        var p;
        if (t < 0.75) p = mix(start, 24, E.zacht(t / 0.75));
        else if (t < 1.75) p = mix(24, 76, E.zacht(t - 0.75));
        else p = mix(76, start, E.zacht(fase(t, 1.75, 0.75)));
        blok.style.setProperty("--pos", p.toFixed(2) + "%");
      }, function () {
        blok.classList.remove("vergelijk-hint");
        // main.js de stand laten overnemen
        schuif.value = String(start);
        schuif.dispatchEvent(new Event("input"));
      });
    }
  })();

  /* 3. De film en de stappen eronder (homepage) ---------------------------- */
  /* De stap die de film op dat moment laat zien, licht op; een klik op een stap
     laat de film daar verder spelen. Werkt met film.js, dat elk beeld een
     "filmtijd"-gebeurtenis geeft en window.iwrapFilm.speelVanaf(t) kent.
     Welk stuk film bij welke kaart hoort: data-film-van en data-film-tot op de
     kaart (in seconden). Zonder die attributen hoort kaart 1 bij "Stap 1" in de
     film, kaart 2 bij "Stap 2", enzovoort. */
  (function () {
    var film = document.querySelector("[data-film]");
    if (!film) return;
    var rij = film.nextElementSibling;
    while (rij && !rij.classList.contains("stappen")) rij = rij.nextElementSibling;
    if (!rij || !window.iwrapFilm || !window.iwrapFilm.speelVanaf) return;
    var HOOFDSTUKKEN = [[2.4, 4.8], [4.8, 6.95], [6.95, 9.05], [9.05, 11.25]];
    var kaarten = $$(".stap", rij).map(function (k, i) {
      var van = parseFloat(k.getAttribute("data-film-van")), tot = parseFloat(k.getAttribute("data-film-tot"));
      if (isNaN(van) || isNaN(tot)) {
        if (!HOOFDSTUKKEN[i]) return null;
        van = HOOFDSTUKKEN[i][0]; tot = HOOFDSTUKKEN[i][1];
      }
      var kop = k.querySelector("h3");
      k.classList.add("stap-film");
      k.setAttribute("role", "button");
      k.tabIndex = 0;
      k.setAttribute("aria-label", "Bekijk in de film: " + (kop ? kop.textContent.trim() : "stap " + (i + 1)));
      var balk = document.createElement("span");
      balk.className = "stap-voortgang";
      balk.setAttribute("aria-hidden", "true");
      k.appendChild(balk);
      function kies(e) {
        if (e.type === "keydown" && e.key !== "Enter" && e.key !== " ") return;
        e.preventDefault();
        var r = film.getBoundingClientRect();
        if (r.top < 0 || r.bottom > window.innerHeight) film.scrollIntoView({ behavior: RUSTIG ? "auto" : "smooth", block: "center" });
        window.iwrapFilm.speelVanaf(van);
      }
      k.addEventListener("click", kies);
      k.addEventListener("keydown", kies);
      return { el: k, van: van, tot: tot, balk: balk };
    }).filter(Boolean);
    rij.classList.add("stappen-film");
    film.addEventListener("filmtijd", function (e) {
      var t = e.detail;
      kaarten.forEach(function (k) {
        var nu = t >= k.van && t < k.tot, klaar = t >= k.tot;
        k.el.classList.toggle("nu", nu);
        k.el.classList.toggle("gezien", klaar);
        k.balk.style.transform = "scaleX(" + (nu ? fase(t, k.van, k.tot - k.van) : klaar ? 1 : 0).toFixed(3) + ")";
      });
    });
  })();

  /* 4. Offerte: de lader tijdens het versturen, en het bedankt-moment --------- */
  /* offerte.js hoeft hiervoor niet te veranderen. Zodra de verzendstand met de
     voortgangsbalk verschijnt, draait de lader uit de Motion Kit ernaast. Zodra
     het bedankt-blok er staat, wordt het vinkje een klein moment: de banen uit
     het logo rollen uit, de cirkel wordt aangedrukt en het vinkje tekent zich. */
  (function () {
    var kaart = document.querySelector(".offerte-kaart");
    if (!kaart) return;
    var stand = kaart.querySelector(".verzendstand"), lader = null, vak = null;
    function weg() {
      if (lader) { lader.destroy(); lader = null; }
      if (vak && vak.parentNode) vak.parentNode.removeChild(vak);
      vak = null;
      if (stand) stand.classList.remove("met-lader");
    }
    if (stand && window.iWrapMotion) {
      var werkLader = function () {
        var balk = stand.querySelector(".verzend-balk");
        var aan = !stand.hidden && balk && !balk.hidden;
        if (aan && !lader) {
          vak = document.createElement("span");
          vak.className = "verzend-lader";
          vak.setAttribute("aria-hidden", "true");
          var binnen = document.createElement("span");
          vak.appendChild(binnen);
          stand.insertBefore(vak, stand.firstChild);
          stand.classList.add("met-lader");
          lader = window.iWrapMotion.mount(binnen, "loader", { theme: "light", pad: 4, label: "" });
        } else if (!aan && lader) weg();
      };
      new MutationObserver(werkLader).observe(stand, { attributes: true, subtree: true, attributeFilter: ["hidden"] });
    }
    new MutationObserver(function () {
      var vink = kaart.querySelector(".bedankt .vink:not(.vink-anim)");
      if (!vink) return;
      weg();
      bedankt(vink);
    }).observe(kaart, { childList: true });

    function bedankt(vink) {
      vink.classList.add("vink-anim");
      var svg = maak("svg", { viewBox: "0 0 140 120", "aria-hidden": "true", focusable: "false" }, vink);
      var banen = [16, 42, 68].map(function (x) {
        return maak("line", { x1: x, y1: 14, x2: r2(x + 90 * COT), y2: 104, pathLength: 1, "class": "bd-baan" }, svg);
      });
      var cirkel = maak("g", { "class": "bd-cirkel", transform: "translate(70 60)" }, svg);
      maak("circle", { r: 31 }, cirkel);
      var haak = maak("path", { d: "M56 61l9 9 19-20", pathLength: 1, "class": "bd-haak" }, svg);
      if (RUSTIG) return;
      var tekst = $$(".bedankt h2, .bedankt p, .bedankt .knoprij", kaart);
      function stand(t) {
        banen.forEach(function (b, i) { b.style.strokeDashoffset = String(r2(1 - E.uit(fase(t, i * 0.1, 0.6)))); });
        cirkel.setAttribute("transform", "translate(70 60) scale(" + r2(Math.max(0.001, E.druk(fase(t, 0.2, 0.45)))) + ")");
        haak.style.strokeDashoffset = String(r2(1 - E.uit(fase(t, 0.55, 0.4))));
        tekst.forEach(function (x, i) { x.style.opacity = String(r2(fase(t, 0.65 + i * 0.08, 0.45))); });
      }
      stand(0);
      speel(1.5, stand, function () { tekst.forEach(function (x) { x.style.opacity = ""; }); });
    }
  })();

  /* 5. Klachten: een ring om de schade (homepage) ---------------------------- */
  /* Wijs een klachtkaart aan (of tab ernaartoe) en er verschijnt een ring om de
     plek op de foto waar de schade zit: dezelfde ring als in de werkwijzefilm,
     wit met terracotta. Zo zie je meteen wat er met "verweerd" of "lijmlaag"
     bedoeld wordt. Op een telefoon, waar je niet kunt aanwijzen, verschijnt de
     ring één keer zodra de kaart goed in beeld is.
     Waar de schade zit staat hieronder per klacht: x en y als deel van de foto,
     r als deel van de breedte. Een nieuwe foto? Zet dan data-ring="x y r" op de
     kaart, bijvoorbeeld data-ring="0.5 0.4 0.1". */
  (function () {
    var kaarten = $$(".klachten .klacht");
    if (!kaarten.length) return;
    var PLEK = {
      "verweerd": [0.33, 0.29, 0.15], "laat-los": [0.52, 0.47, 0.1], "blaasjes": [0.63, 0.38, 0.13],
      "lijmlaag": [0.46, 0.62, 0.15], "spanningsplooien": [0.56, 0.56, 0.11], "scheuren": [0.4, 0.61, 0.12]
    };
    var kanWijzen = !!(window.matchMedia && window.matchMedia("(hover: hover)").matches);
    kaarten.forEach(function (k) {
      var beeld = k.querySelector(".beeld"), img = beeld && beeld.querySelector("img");
      if (!img) return;
      var eigen = (k.getAttribute("data-ring") || "").split(/[\s,]+/).map(Number).filter(function (n) { return !isNaN(n); });
      var m = /klacht=([a-z-]+)/.exec(k.getAttribute("href") || "");
      var plek = eigen.length === 3 ? eigen : (m && PLEK[m[1]]);
      if (!plek) return;
      var svg = maak("svg", { "class": "klacht-ring", "aria-hidden": "true", focusable: "false" });
      var wit = maak("circle", { fill: "none", stroke: "#fff", "stroke-width": 7 }, svg);
      var rood = maak("circle", { fill: "none", stroke: "#a8523a", "stroke-width": 3.5 }, svg);
      beeld.appendChild(svg);
      var stop = null, r0 = 0;
      // zoom: de foto vergroot bij aanwijzen 5% vanuit het midden (home.css), de ring gaat mee
      function meet(zoom) {
        var W = beeld.clientWidth, H = beeld.clientHeight;
        var nw = img.naturalWidth || W, nh = img.naturalHeight || H;
        var s = Math.max(W / nw, H / nh), ox = (W - nw * s) / 2, oy = (H - nh * s) / 2;
        var cx = W / 2 + (ox + plek[0] * nw * s - W / 2) * zoom, cy = H / 2 + (oy + plek[1] * nh * s - H / 2) * zoom;
        r0 = plek[2] * nw * s * zoom;
        svg.setAttribute("viewBox", "0 0 " + W + " " + H);
        [wit, rood].forEach(function (c) { c.setAttribute("cx", r2(cx)); c.setAttribute("cy", r2(cy)); });
      }
      function straal(r) { var v = r2(Math.max(0, r)); wit.setAttribute("r", v); rood.setAttribute("r", v); }
      function toon(zoom) {
        meet(zoom);
        if (stop) stop();
        svg.classList.add("aan");
        if (RUSTIG) { straal(r0); return; }
        stop = speel(0.45, function (t) { straal(r0 * E.druk(fase(t, 0, 0.45))); });
      }
      function verberg() { if (stop) stop(); svg.classList.remove("aan"); }
      straal(0);
      k.iwrapSpeel = function () { toon(1); };
      if (kanWijzen) {
        k.addEventListener("pointerenter", function () { toon(1.05); });
        k.addEventListener("pointerleave", verberg);
        k.addEventListener("focus", function () { toon(1); });
        k.addEventListener("blur", verberg);
      } else bijBeeld(k, function () {}, function () { toon(1); }, 0.7);
    });
  })();

  /* 6. Dakkapel: zo komen we erbij (/dakkapel-kozijnen) --------------------- */
  /* De tekening onder "Hoe we erbij komen" speelt na wat het lijstje eronder
     zegt, in de volgorde waarin het echt gaat: de ladder gaat tegen de goot (2),
     de monteur klimt naar boven en haakt in aan de valbeveiliging (1), een paar
     pannen gaan tijdelijk opzij (3), en het kozijn van de dakkapel krijgt zijn
     nieuwe folie. Het nummer en de regel in het lijstje lichten op terwijl het
     gebeurt. Het boeideel bovenop blijft zoals het is: dat doen we niet.
     Werkt met de tekening uit fragmenten/dakkapel-tekening.html (dezelfde
     tekening, met namen op de onderdelen). Het eindbeeld is de tekening zoals
     hij nu is. */
  (function () {
    var fig = document.querySelector("figure[data-dakkapel]");
    var svg = fig && fig.querySelector("svg");
    if (!svg) return;
    function een(s) { return svg.querySelector(s); }
    var ladder = een(".dk-ladder"), monteur = een(".dk-monteur"), lijn = een(".dk-lijn"), anker = een(".dk-anker");
    var gat = een(".dk-gat"), stapel = een(".dk-stapel"), kozijn = een(".dk-kozijn");
    if (!ladder || !monteur || !lijn || !gat || !stapel || !kozijn) return;
    var pannen = $$("path", stapel);
    var nummers = $$(".dk-nummer", svg).map(function (g) {
      return { stap: Number(g.getAttribute("data-stap")), c: g.querySelector("circle"), t: g.querySelector("text") };
    });
    var lijst = fig.nextElementSibling && fig.nextElementSibling.matches("ul") ? $$(":scope > li", fig.nextElementSibling) : [];
    var KOT = Math.cos(HOEK) / Math.sin(HOEK);

    // de pannen vliegen vóór de dakkapel langs naar het stapeltje
    svg.insertBefore(stapel, ladder);
    // dekking: zolang de pannen er nog liggen, is het gat dicht (in hetzelfde pannenpatroon)
    var dekking = [0, 1, 2].map(function (i) {
      var r = maak("rect", { x: r2(288 + i * 29.33), y: 326, width: 29.4, height: 20, fill: "url(#dk-pannen)" });
      gat.parentNode.insertBefore(r, gat.nextSibling);
      return r;
    });
    var DOEL = [[172, 327], [176, 315], [170, 303]];
    // het oude kozijn: verweerd en dof, tot de nieuwe folie eroverheen gaat
    var defs = svg.querySelector("defs") || svg.insertBefore(maak("defs", {}), svg.firstChild);
    var knip = maak("clipPath", { id: "dk-oud-knip" }, defs), knipVorm = maak("polygon", { points: "0,0" }, knip);
    var oud = maak("g", { "clip-path": "url(#dk-oud-knip)" });
    kozijn.parentNode.insertBefore(oud, kozijn.nextSibling);
    maak("rect", { x: 256, y: 160, width: 288, height: 138, rx: 2, fill: "#6e706d" }, oud);
    [[300, 290, 34, 6], [410, 166, 40, 5], [500, 292, 30, 5], [262, 230, 5, 30], [538, 200, 5, 26]].forEach(function (v) {
      maak("ellipse", { cx: v[0], cy: v[1], rx: v[2], ry: v[3], fill: "#8c8d88", opacity: 0.7 }, oud);
    });
    var glans = maak("line", { stroke: "#fff", "stroke-width": 10, "stroke-linecap": "round", opacity: 0 });
    oud.parentNode.insertBefore(glans, oud.nextSibling);
    // inhaken: een ring die vanaf het ankerpunt uitdijt
    var puls = maak("circle", { cx: 560, cy: 82, r: 13, fill: "none", stroke: "#e8833a", "stroke-width": 3, opacity: 0 });
    anker.parentNode.insertBefore(puls, anker.nextSibling);
    var L = lijn.getTotalLength ? lijn.getTotalLength() : 200;
    lijn.style.strokeDasharray = r2(L) + " " + r2(L);

    var DUUR = 8.8;
    // wanneer welk nummer (en welke regel) oplicht: in de volgorde waarin het gebeurt
    var ACTIEF = { 2: [0.3, 2.9], 1: [2.9, 4.4], 3: [4.3, 6.6] };
    function teken(t) {
      var e = E.uit(fase(t, 0.3, 1.2));
      ladder.setAttribute("transform", "translate(" + r2(-8.2 * (1 - e)) + " " + r2(150 * (1 - e)) + ")");
      // monteur: de ladder op, dan het dak op
      var klim = E.zacht(fase(t, 1.4, 1.0)), over = E.uit(fase(t, 2.4, 0.6));
      var my = mix(150, 20, klim) - 6 * Math.abs(Math.sin(klim * Math.PI * 3)) * (klim < 1 ? 1 : 0);
      monteur.setAttribute("transform", "translate(" + r2(mix(88, 0, over)) + " " + r2(mix(my, 0, over)) + ")");
      monteur.setAttribute("opacity", r2(fase(t, 1.4, 0.2)));
      // inhaken aan de valbeveiliging
      lijn.style.strokeDashoffset = r2(L * (1 - E.zacht(fase(t, 3.0, 0.8))));
      var p = fase(t, 2.95, 0.6);
      puls.setAttribute("r", r2(13 + 22 * p)); puls.setAttribute("opacity", r2(p > 0 && p < 1 ? 1 - p : 0));
      // pannen opzij
      pannen.forEach(function (pan, i) {
        var s = 4.4 + i * 0.45, q = E.zacht(fase(t, s, 0.8));
        var dx = 302.7 + i * 29.33 - DOEL[i][0], dy = 336 - DOEL[i][1];
        pan.setAttribute("transform", "translate(" + r2(dx * (1 - q)) + " " + r2(dy * (1 - q) - 26 * Math.sin(Math.PI * q)) + ")");
        pan.setAttribute("opacity", t >= s ? 1 : 0);
        dekking[i].setAttribute("opacity", t >= s ? 0 : 1);
      });
      // het kozijn: een schuine baan nieuwe folie, onder de hoek van het logo
      var w = E.zacht(fase(t, 6.8, 1.5)), xe = mix(256 - 158 * KOT - 24, 568, w);
      knipVorm.setAttribute("points", r2(xe) + ",140 " + r2(xe + 180 * KOT) + ",320 620,320 620,140");
      var aan = w > 0 && w < 1;
      glans.setAttribute("x1", r2(xe + 20 * KOT)); glans.setAttribute("y1", 162);
      glans.setAttribute("x2", r2(xe + 158 * KOT)); glans.setAttribute("y2", 296);
      glans.setAttribute("opacity", aan ? 0.55 : 0);
      oud.setAttribute("opacity", w >= 1 ? 0 : 1);
      // nummers en het lijstje
      nummers.forEach(function (n) {
        var a = ACTIEF[n.stap], nu = !!a && t >= a[0] && t < a[1];
        n.c.setAttribute("fill", nu ? "#a3cdc2" : "#22262a");
        n.t.setAttribute("fill", nu ? "#22262a" : "#fff");
        if (lijst[n.stap - 1]) lijst[n.stap - 1].classList.toggle("dk-nu", nu);
      });
    }
    var stop = null;
    function speelAf() { if (stop) stop(); stop = speel(DUUR, teken); }
    fig.iwrapSpeel = speelAf;
    teken(DUUR);
    bijBeeld(fig, function () { teken(0); }, speelAf, 0.5);
  })();

  /* 7. De klusfilm: na afloop een vervolgstap (/over-iwrap) ----------------- */
  /* Als de klusfilm is afgelopen, schuift onderin het beeld een balk omhoog met
     de vervolgstap: "Benieuwd wat het bij jou kost?" en de knop naar de offerte.
     Het logo en iwrap.nl van de eindkaart blijven vrij. Speelt de film opnieuw,
     dan verdwijnt de balk. Werkt vanzelf op elke video met "klusfilm" in de
     bestandsnaam binnen een [data-video]-blok. */
  (function () {
    $$("[data-video] video").forEach(function (video) {
      if (!/klusfilm/.test(video.getAttribute("src") || "")) return;
      var vak = video.parentNode;
      var balk = document.createElement("div");
      balk.className = "klusfilm-vervolg";
      balk.innerHTML = "<p>Benieuwd wat het bij jou kost? <span>Stuur een foto, je krijgt een vaste prijs.</span></p>" +
        "<a class=\"knop knop-primair\" href=\"/offerte\">Offerte aanvragen</a>";
      balk.hidden = true;
      vak.appendChild(balk);
      video.addEventListener("ended", function () {
        balk.hidden = false;
        requestAnimationFrame(function () { balk.classList.add("aan"); });
      });
      video.addEventListener("play", function () { balk.classList.remove("aan"); balk.hidden = true; });
    });
  })();

  /* 8. Tekenblad: het voorbeeld tekent zichzelf (/tekenblad) ---------------- */
  /* Op het scherm tekent het voorbeeld zich eerst na, in de volgorde waarin je
     het zelf doet: het kozijn, het nummer, de onderdorpel, de arcering (streep
     voor streep), het pijltje van het draairaam en de maten. Zo zie je wat
     "arceren" is. Op papier verandert er niets: bij het printen staat het
     voorbeeld er gewoon helemaal. */
  (function () {
    var svg = document.querySelector(".blad-voorbeeld svg");
    if (!svg) return;
    var paden = $$("path", svg), teksten = $$("text", svg);
    if (paden.length < 4 || teksten.length < 3) return;
    // losse lijnen van maken, zodat ze één voor één getekend kunnen worden
    function splits(pad) {
      var delen = (pad.getAttribute("d") || "").match(/M[^M]+/g) || [];
      var los = delen.map(function (d) {
        var n = pad.cloneNode(false);
        n.setAttribute("d", d.trim());
        pad.parentNode.insertBefore(n, pad);
        return n;
      });
      pad.parentNode.removeChild(pad);
      return los;
    }
    var kozijn = splits(paden[0]), pijl = paden[1], arcering = splits(paden[2]), dorpel = paden[3];
    var nummer = teksten[2], maat1 = teksten[0], maat2 = teksten[1];
    var lijnen = kozijn.concat([dorpel]).concat(arcering).map(function (n) {
      var L = n.getTotalLength ? n.getTotalLength() : 100;
      n.style.strokeDasharray = r2(L) + " " + r2(L);
      return { n: n, L: L };
    });
    var pijlL = pijl.getTotalLength ? pijl.getTotalLength() : 100;
    // tekst "schrijft" van links naar rechts: een knipvlak dat breder wordt
    var defs = svg.querySelector("defs") || svg.insertBefore(maak("defs", {}), svg.firstChild);
    var schrift = [nummer, maat1, maat2].map(function (tx, i) {
      var b = tx.getBBox ? tx.getBBox() : { x: 0, y: 0, width: 200, height: 20 };
      var k = maak("clipPath", { id: "blad-schrift-" + i, clipPathUnits: "userSpaceOnUse" }, defs);
      var r = maak("rect", { x: r2(b.x - 2), y: r2(b.y - 4), width: 0, height: r2(b.height + 8) }, k);
      tx.setAttribute("clip-path", "url(#blad-schrift-" + i + ")");
      return { r: r, w: b.width + 4 };
    });
    var DUUR = 6.6;
    function lijn(i, t0, d, t) { var l = lijnen[i]; l.n.style.strokeDashoffset = r2(l.L * (1 - E.zacht(fase(t, t0, d)))); }
    function teken(t) {
      lijn(0, 0.2, 1.3, t);                                   // het kozijn
      lijn(1, 1.5, 0.35, t);                                  // de tussenstijl
      schrift[0].r.setAttribute("width", r2(schrift[0].w * fase(t, 1.95, 0.3)));   // het nummer
      lijn(2, 2.35, 0.4, t);                                  // de onderdorpel
      for (var i = 3; i < lijnen.length; i++) lijn(i, 2.85 + (i - 3) * 0.1, 0.12, t);   // de arcering
      var pq = fase(t, 4.5, 0.6), stuk = pq * pijlL, d = [], s = 0;
      while (s + 8 <= stuk) { d.push(4, 4); s += 8; }
      if (stuk > s) d.push(Math.min(4, stuk - s), 4 - Math.min(4, stuk - s));
      pijl.setAttribute("stroke-dasharray", pq >= 1 ? "4 4" : (d.length ? d.join(" ") + " " : "0 ") + r2(pijlL + 8));
      schrift[1].r.setAttribute("width", r2(schrift[1].w * fase(t, 5.2, 0.7)));    // onderdorpel 160
      schrift[2].r.setAttribute("width", r2(schrift[2].w * fase(t, 5.95, 0.4)));   // 130
    }
    var stop = null;
    function speelAf() { if (stop) stop(); stop = speel(DUUR, teken); }
    svg.iwrapSpeel = speelAf;
    teken(DUUR);
    window.addEventListener("beforeprint", function () { if (stop) stop(); teken(DUUR); });
    bijBeeld(svg, function () { teken(0); }, speelAf, 0.6);
  })();

  /* 9. Contact: vandaag in het rooster (/contact) --------------------------- */
  /* In de tabel "Wanneer je ons bereikt" krijgt de rij van vandaag een label
     "Vandaag", met een mint streep die erin schuift: dan weet je meteen of we
     nu op kantoor zitten of op locatie werken. In het weekend staat er onder de
     tabel dat een aanvraag gewoon aankomt en dat we hem maandag oppakken. De dag
     komt uit de Nederlandse tijd, waar de bezoeker ook zit. */
  (function () {
    var tabel = null;
    $$(".tabel-wrap table").forEach(function (t) {
      var th = t.querySelector("thead th");
      if (!tabel && th && th.textContent.trim() === "Dag") tabel = t;
    });
    if (!tabel) return;
    var rijen = $$("tbody tr", tabel);
    if (rijen.length < 3) return;
    var wrap = tabel.closest(".tabel-wrap") || tabel;
    var weekend = document.createElement("p");
    weekend.className = "vandaag-weekend";
    weekend.textContent = "Het is weekend. Een aanvraag via het formulier komt gewoon aan; maandag pakken we hem op.";
    weekend.hidden = true;
    wrap.parentNode.insertBefore(weekend, wrap.nextSibling);
    var chip = document.createElement("span");
    chip.className = "vandaag-chip";
    chip.textContent = "Vandaag";
    function dagNu() {
      var d = tabel.getAttribute("data-dag");                       // alleen om te testen: data-dag="0".."6" (0 = zondag)
      if (d != null && d !== "") return Number(d);
      try {
        var s = new Intl.DateTimeFormat("en-US", { timeZone: "Europe/Amsterdam", weekday: "short" }).format(new Date());
        return ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].indexOf(s);
      } catch (e) { return new Date().getDay(); }
    }
    function zet() {
      var dag = dagNu(), rij = dag === 1 ? rijen[0] : (dag >= 2 && dag <= 4 ? rijen[1] : (dag === 5 ? rijen[2] : null));
      rijen.forEach(function (r) { r.classList.remove("vandaag", "vandaag-aan"); });
      if (chip.parentNode) chip.parentNode.removeChild(chip);
      weekend.hidden = !!rij;
      if (!rij) return;
      rij.classList.add("vandaag");
      var cel = rij.querySelector("td");
      if (cel) cel.appendChild(chip);
      if (RUSTIG) rij.classList.add("vandaag-aan");
      else requestAnimationFrame(function () { requestAnimationFrame(function () { rij.classList.add("vandaag-aan"); }); });
    }
    tabel.iwrapSpeel = zet;
    if (RUSTIG) { zet(); return; }
    bijBeeld(tabel, function () {}, zet, 0.6);
  })();

  /* 10. Kozijnmerken: de folie past op elk kunststof profiel ----------------- */
  /* Drie kunststof profielen, getekend zoals de doorsnede op de site (dezelfde
     vorm, kleuren en kamers), elk met een andere diepte en indeling. De nieuwe
     folie rolt bij alle drie op dezelfde manier om de buitenkant: een rol die
     uitrolt tot een baan, net als in de doorsnede. Daarnaast een profiel met
     een aluminium schil: daar rolt de folie wel uit, maar hij hecht niet en
     rolt weer op. Onder elk profiel het vinkje of het kruisje uit de lijstjes
     van de site. Precies wat de pagina zegt: het merk maakt niet uit, een
     aluminium schil wel.
     Werkt met fragmenten/kozijnmerken-profiel.html. Namen onder de drie
     profielen kunnen met data-namen="Softline 70|Softline 76|Softline 82";
     zonder namen staat er "Kunststof". */
  (function () {
    $$("[data-profiel]").forEach(function (fig) {
      var namen = (fig.getAttribute("data-namen") || "").split("|").filter(Boolean);
      var raster = document.createElement("div");
      raster.className = "profiel-raster";
      fig.insertBefore(raster, fig.firstChild);
      // de onderdorpel uit de doorsnede: buitenkant, kamers, en de baan folie langs de buitenkant
      var KAMERS = [
        [[166, 216, 66, 108], [246, 200, 70, 124], [342, 124, 18, 34], [332, 184, 74, 140], [420, 184, 66, 140]],
        [[166, 216, 52, 108], [230, 206, 54, 118], [296, 196, 26, 128], [342, 124, 18, 34], [334, 184, 50, 140], [394, 184, 46, 140], [450, 184, 38, 140]],
        [[166, 216, 66, 50], [166, 278, 66, 46], [246, 200, 70, 60], [246, 272, 70, 52], [342, 124, 18, 34], [332, 184, 74, 140], [420, 184, 66, 66], [420, 262, 66, 62]],
        [[172, 222, 60, 96], [250, 206, 66, 112], [344, 128, 14, 28], [334, 190, 72, 128], [420, 190, 60, 128]]
      ];
      var DIEPTE = [0.85, 0.93, 1, 0.93];
      var items = KAMERS.map(function (kamers, i) {
        var alu = i === 3, sx = DIEPTE[i];
        function X(x) { return r2(150 + (x - 150) * sx); }
        var vorm = "M" + X(150) + " 340V200L" + X(330) + " 176V112H" + X(372) + "V170H" + X(500) + "V340Z";
        var baanD = "M" + X(174) + " 340H" + X(150) + "V200L" + X(330) + " 176V112H" + X(372);
        var cel = document.createElement("div");
        cel.className = "profiel-cel" + (alu ? " alu" : "");
        var svg = maak("svg", { viewBox: "112 88 " + r2(X(500) - 112 + 32) + " 278", "aria-hidden": "true", focusable: "false" });
        cel.appendChild(svg);
        // lagen van buiten naar binnen, achter het profiel getekend (zoals in de doorsnede)
        var folie = maak("path", { d: baanD, fill: "none", stroke: "#33383d", "stroke-width": alu ? 32 : 16, "stroke-linejoin": "round", pathLength: 100, "stroke-dasharray": "100 100", "stroke-dashoffset": 100 }, svg);
        if (alu) {
          maak("path", { d: baanD + "V170H" + X(500) + "V340Z", fill: "none", stroke: "#c3c9cc", "stroke-width": 16, "stroke-linejoin": "miter" }, svg);
          maak("path", { d: baanD, fill: "none", stroke: "#e9edee", "stroke-width": 2, transform: "translate(-6 -2)" }, svg);
        }
        maak("path", { d: vorm, fill: "#eef0ef", stroke: "#b5bbb9", "stroke-width": 2.6, "stroke-linejoin": alu ? "miter" : "round" }, svg);
        kamers.forEach(function (k) { maak("rect", { x: X(k[0]), y: k[1], width: r2(k[2] * sx), height: k[3], rx: 6, fill: "#fafbfa", stroke: "#cdd2d0", "stroke-width": 2 }, svg); });
        var rol = maak("g", { opacity: 0 }, svg);
        var rolA = maak("circle", { r: 10, fill: "#33383d", stroke: "#1f2326", "stroke-width": 2.6 }, rol);
        var rolB = maak("circle", { r: 5, fill: "none", stroke: "#5a6168", "stroke-width": 2 }, rol);
        maak("circle", { r: 2, fill: "#5a6168" }, rol);
        var oordeel = document.createElement("p");
        oordeel.className = "profiel-oordeel";
        var icoon = document.createElement("i");
        icoon.className = alu ? "niet" : "wel";
        icoon.setAttribute("aria-hidden", "true");
        var naam = document.createElement("span");
        naam.textContent = alu ? "Aluminium schil" : (namen[i] || "Kunststof");
        oordeel.appendChild(icoon);
        oordeel.appendChild(naam);
        cel.appendChild(oordeel);
        raster.appendChild(cel);
        var L = folie.getTotalLength ? folie.getTotalLength() : 600;
        return { cel: cel, folie: folie, rol: rol, rolA: rolA, rolB: rolB, L: L, alu: alu, start: alu ? 3.0 : 0.6 + i * 0.7 };
      });
      var DUUR = 5.9;
      function teken(t) {
        items.forEach(function (it, i) {
          var a = E.uit(fase(t, 0.05 + i * 0.1, 0.5));
          it.cel.style.opacity = a >= 1 ? "" : String(r2(a));
          it.cel.style.transform = a >= 1 ? "" : "translateY(" + r2(12 * (1 - a)) + "px)";
          var q = E.zacht(fase(t, it.start, 1.0)), los = it.alu ? E.zacht(fase(t, it.start + 1.3, 0.9)) : 0;
          var zicht = q * (1 - los);
          it.folie.setAttribute("stroke-dashoffset", r2(100 * (1 - zicht)));
          it.folie.setAttribute("opacity", it.alu && los > 0 ? r2(1 - 0.35 * los) : 1);
          var bezig = (q > 0 && q < 1) || (los > 0 && los < 1);
          if (bezig && it.folie.getPointAtLength) {
            var pt = it.folie.getPointAtLength(Math.max(0.01, it.L * zicht)), r = it.alu && los > 0 ? 6 + 9 * los : 15 - 9 * q;
            it.rol.setAttribute("transform", "translate(" + r2(pt.x) + " " + r2(pt.y) + ")");
            it.rolA.setAttribute("r", r2(r)); it.rolB.setAttribute("r", r2(r * 0.55));
          }
          it.rol.setAttribute("opacity", bezig ? 1 : 0);
          it.cel.classList.toggle("klaar", t >= it.start + (it.alu ? 2.3 : 1.0));
        });
      }
      var stop = null;
      function speelAf() { if (stop) stop(); stop = speel(DUUR, teken); }
      fig.iwrapSpeel = speelAf;
      teken(DUUR);
      bijBeeld(fig, function () { teken(0); }, speelAf, 0.5);
    });
  })();
})();
