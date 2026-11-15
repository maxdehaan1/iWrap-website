/* ---------------------------------------------------------------------------
   De doorsnede (src/doorsnede.html), versie 2: de drie stappen van onze vaste
   werkwijze, echt in beweging.

   Eerst het verweerde kozijn, met de zon erbij. Dan:
   1. Toplaag eraf: de oude folie rolt op tot een rol (in ons logo is een stip
      een opgerolde baan), met de warmte erbij. De oude lijm blijft nog zitten.
   2. Reinigen en vetvrij: de krabber (een trekkrabber zoals de Bahco 665) haalt
      de lijmresten weg, dan maakt een doek alles schoon en vetvrij; het schone
      profiel glanst even mint.
   3. Nieuwe folie erop: de nieuwe folie rolt uit en de rakel (een kaartje met
      een viltrand) drukt hem aan.

   Speelt één keer af als hij in beeld komt en blijft dan op de nieuwe folie
   staan. Een klik op een stap speelt die stap. Wie "minder beweging" aan heeft,
   ziet meteen het eindbeeld en springt met de knoppen naar het eind van een stap.

   Alles hangt af van één getal, de tijd: teken(t) zet elk onderdeel op zijn
   plek. De opmaak (src/doorsnede.html) en de kleuren (doorsnede.css) blijven
   zoals ze waren; dit script tekent alleen de rol, de krabber, de doek en de rakel erbij.

   Let op bij bewerken: Nederlandse teksten met een apostrof altijd tussen
   dubbele aanhalingstekens. build.py controleert dat.
   --------------------------------------------------------------------------- */
(function () {
  "use strict";

  var NS = "http://www.w3.org/2000/svg";
  var RUSTIG = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  // Wanneer elke stap begint en eindigt (seconden). Daarvoor: het verweerde kozijn.
  var STAPPEN = [[1.4, 4.6], [4.6, 7.6], [7.6, 11.6]];
  var EIND = 11.6;
  var DIK = 11;  // het zichtbare deel van de foliestreep in doorsnede.css (.ds-v2 .ds-folie: 22 / 2)

  function klem(x, a, b) { return Math.max(a, Math.min(b, x)); }
  function fase(t, van, duur) { return klem((t - van) / duur, 0, 1); }
  function zacht(p) { return p < 0.5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2; }
  function uit(p) { return 1 - Math.pow(1 - p, 3); }
  function r2(n) { return Math.round(n * 100) / 100; }
  function maak(tag, attr, ouder, voor) {
    var e = document.createElementNS(NS, tag);
    for (var k in attr) e.setAttribute(k, attr[k]);
    if (ouder) ouder.insertBefore(e, voor || null);
    return e;
  }

  document.querySelectorAll("[data-doorsnede]").forEach(function (fig) {
    var knoppen = fig.querySelectorAll("[data-naar]");
    var oud = fig.querySelectorAll(".ds-folie-oud");
    var flap = fig.querySelector(".ds-flap");
    var nieuw = fig.querySelector(".ds-folie-nieuw");
    var lijm = fig.querySelector(".ds-lijm");
    var profiel = fig.querySelector(".ds-profiel");
    var barstPad = fig.querySelector(".ds-barst");
    if (!lijm || !nieuw || !profiel || oud.length !== 2) return;
    var wereld = profiel.parentNode;

    fig.classList.add("ds-v2");
    fig.removeAttribute("data-stand");

    /* Maten. De oude folie zijn twee stukken met een gat waar hij is
       losgescheurd; de lijm is één doorlopend pad van dezelfde vorm. */
    var L = lijm.getTotalLength();
    var LA = oud[0].getTotalLength(), LB = oud[1].getTotalLength(), B0 = L - LB;
    function punt(s) { var q = lijm.getPointAtLength(klem(s, 0, L)); return [q.x, q.y]; }
    function richting(s) {
      var a = punt(s - 1), b = punt(s + 1), dx = b[0] - a[0], dy = b[1] - a[1], d = Math.sqrt(dx * dx + dy * dy) || 1;
      return [dx / d, dy / d];
    }
    // Naar buiten, weg van het profiel.
    function normaal(s) { var r = richting(s); return [r[1], -r[0]]; }

    /* De barstjes los, zodat elk barstje verdwijnt als de folie er voorbij is. */
    var barsten = [];
    if (barstPad) {
      (barstPad.getAttribute("d").match(/M[^M]+/g) || []).forEach(function (d) {
        var m = /M\s*([\d.]+)[ ,]([\d.]+)/.exec(d), best = 0, afstand = 1e9;
        for (var s = 0; s <= L; s += 2) {
          var p = punt(s), dd = (p[0] - m[1]) * (p[0] - m[1]) + (p[1] - m[2]) * (p[1] - m[2]);
          if (dd < afstand) { afstand = dd; best = s; }
        }
        barsten.push({ s: best, el: maak("path", { d: d, "class": "ds-barst" }, wereld, barstPad) });
      });
      barstPad.style.display = "none";
    }

    /* Wat dit script erbij tekent. Glans en schoon-glans liggen achter het
       profiel (net als de folie), de rest erboven. */
    var schoon = maak("path", { d: lijm.getAttribute("d"), "class": "ds-schoon" }, wereld, profiel);
    var glans = maak("path", { d: lijm.getAttribute("d"), "class": "ds-glans" }, wereld, profiel);
    var boven = maak("g", { "class": "ds-actie" }, wereld);
    function rol(klasse) {
      var g = maak("g", { "class": "ds-rol " + klasse }, boven);
      var a = maak("circle", { r: 4 }, g), b = maak("circle", { r: 2, "class": "ds-rol-ring" }, g);
      maak("circle", { r: 1.6, "class": "ds-rol-kern" }, g);
      return function (x, y, r, o) {
        g.style.display = o > 0.01 ? "" : "none";
        if (o <= 0.01) return;
        g.setAttribute("transform", "translate(" + r2(x) + " " + r2(y) + ")");
        g.style.opacity = r2(o);
        a.setAttribute("r", r2(r));
        b.setAttribute("r", r2(r * 0.58));
      };
    }
    var rolOud = rol("ds-rol-oud"), rolNieuw = rol("ds-rol-nieuw");
    var warmte = maak("g", { "class": "ds-warmte" }, boven);
    var golven = [0, 1, 2].map(function () { return maak("path", { d: "M0 0q-5 -6 0 -12t0 -12" }, warmte); });
    var doek = maak("g", { "class": "ds-doek" }, boven);
    maak("path", { d: "M-26 -22Q0 -31 24 -21Q32 0 22 23Q-1 31 -24 21Q-32 0 -26 -22Z" }, doek);
    maak("path", { d: "M-11 -15Q4 -4 -5 13M5 -16Q17 -2 10 15", "class": "ds-doek-streep" }, doek);
    // De krabber van opzij: het blad op (0, 0), de houder schuin omhoog naar voren, de zwarte knop
    // erboven en het oranje handvat met de zwarte grip in de rijrichting (je trekt hem naar je toe).
    var krabber = maak("g", { "class": "ds-krabber" }, boven);
    maak("path", { d: "M0 0L17 -14", fill: "none", stroke: "#9aa1a6", "stroke-width": 5, "stroke-linecap": "round" }, krabber);
    maak("path", { d: "M0 0L4 -3.4", fill: "none", stroke: "#3f4448", "stroke-width": 5.6, "stroke-linecap": "round" }, krabber);
    maak("path", { d: "M16 -13L34 -22", fill: "none", stroke: "#b9bec1", "stroke-width": 6, "stroke-linecap": "round" }, krabber);
    maak("path", { d: "M17 -14L14 -27", fill: "none", stroke: "#b9bec1", "stroke-width": 3, "stroke-linecap": "round" }, krabber);
    maak("circle", { cx: 13, cy: -33, r: 7.5, fill: "#1b1c1e" }, krabber);
    maak("path", { d: "M32 -21L92 -44", fill: "none", stroke: "#d9600f", "stroke-width": 9.5, "stroke-linecap": "round" }, krabber);
    maak("path", { d: "M46 -26.5L86 -42", fill: "none", stroke: "#26282a", "stroke-width": 10.5, "stroke-linecap": "round" }, krabber);
    var vonken = [0.2, 0.5, 0.8].map(function () {
      return maak("path", { d: "M0 -9Q1 -1 9 0Q1 1 0 9Q-1 1 -9 0Q-1 -1 0 -9Z", "class": "ds-vonk" }, boven);
    });
    var rakelRand = maak("line", { "class": "ds-rakel-rand" }, boven);
    var rakel = maak("line", { "class": "ds-rakel" }, boven);

    function strook(el, van, tot, lengte) {
      // Laat van een pad alleen het stuk [van, tot] zien.
      van = klem(van, 0, lengte); tot = klem(tot, 0, lengte);
      if (tot - van < 0.5) { el.style.strokeDasharray = "0 " + r2(lengte + 20); el.style.strokeDashoffset = "0"; return; }
      el.style.strokeDasharray = r2(tot - van) + " " + r2(lengte + 20);
      el.style.strokeDashoffset = String(r2(-van));
    }
    function zetFase(f, stap) {
      if (fig.getAttribute("data-fase") === f) return;
      fig.setAttribute("data-fase", f);
      // het balkje onder de actieve stap loopt even lang als die stap
      if (stap) fig.style.setProperty("--ds-duur", (STAPPEN[stap - 1][1] - STAPPEN[stap - 1][0]) + "s");
      knoppen.forEach(function (k) {
        if (+k.getAttribute("data-naar") === stap) k.setAttribute("aria-current", "step");
        else k.removeAttribute("aria-current");
      });
    }

    /* Tekenen op tijdstip t --------------------------------------------- */
    function teken(t) {
      var s1 = STAPPEN[0][0], s2 = STAPPEN[1][0], s3 = STAPPEN[2][0];
      if (t < s1) zetFase("begin", 0);
      else if (t < s2) zetFase("eraf", 1);
      else if (t < s3) zetFase("reinigen", 2);
      else zetFase(t >= EIND ? "klaar" : "erop", 3);

      // 1. Toplaag eraf: de voorkant van het afpellen loopt van het begin van
      //    het pad (de onderkant) naar het eind (bij het glas).
      var p = zacht(fase(t, s1 + 0.2, 2.7)), S = L * p;
      strook(oud[0], S, LA, LA);
      strook(oud[1], S - B0, LB, LB);
      if (flap) flap.style.opacity = r2(1 - fase(t, s1, 0.3));
      barsten.forEach(function (b) { b.el.style.opacity = b.s > S + 2 ? "1" : "0"; });
      if (t >= s1 && t < s2 && p > 0) {
        var r = Math.sqrt(16 + S * DIK / Math.PI * 0.5), P = punt(S), n = normaal(S), weg = fase(t, s2 - 0.45, 0.4);
        var cx = P[0] + n[0] * (r + 4) + weg * n[0] * 30, cy = P[1] + n[1] * (r + 4) - weg * 40;
        rolOud(cx, cy, r, 1 - weg);
        warmte.style.display = p < 1 ? "" : "none";
        if (p < 1) {
          warmte.setAttribute("transform", "translate(" + r2(cx + n[0] * (r + 12)) + " " + r2(cy + n[1] * (r + 12) - 6) + ")");
          golven.forEach(function (g, i) {
            g.setAttribute("transform", "translate(" + (i - 1) * 11 + " " + r2(-((t * 16 + i * 5) % 9)) + ")");
            g.style.opacity = r2(0.35 + 0.35 * Math.sin(t * 7 + i * 2));
          });
        }
      } else { rolOud(0, 0, 1, 0); warmte.style.display = "none"; }

      // 2. Reinigen en vetvrij: de krabber haalt de lijm weg, dan maakt de doek alles
      //    schoon en vetvrij (het schone profiel glanst mint achter de doek aan), en
      //    drie vonkjes geven aan dat het klaar is.
      var c = zacht(fase(t, s2 + 0.15, 1.35)), C = L * c, q = zacht(fase(t, s3 + 0.2, 2.8)), Q = L * q;
      if (t < s3) strook(lijm, C, L, L);
      else strook(lijm, 0, Q, L);           // 3. de nieuwe folie brengt zijn eigen lijmlaag mee
      var kz = Math.min(fase(t, s2, 0.2), 1 - fase(t, s2 + 1.5, 0.2));
      krabber.style.display = kz > 0.01 ? "" : "none";
      if (kz > 0.01) {
        var Pk = punt(C), nk = normaal(C), rk = richting(C), hk = Math.atan2(rk[1], rk[0]) * 180 / Math.PI;
        krabber.setAttribute("transform", "translate(" + r2(Pk[0] + nk[0] * 2) + " " + r2(Pk[1] + nk[1] * 2) + ") rotate(" + r2(hk) + ") scale(" + r2(kz) + ")");
      }
      var d2 = zacht(fase(t, s2 + 1.45, 1.15)), D = L * d2;
      var dz = Math.min(fase(t, s2 + 1.35, 0.2), 1 - fase(t, s2 + 2.55, 0.2));
      doek.style.display = dz > 0.01 ? "" : "none";
      if (dz > 0.01) {
        var Pc = punt(D), nc = normaal(D), rc = richting(D), w = Math.sin(t * 18) * 4;
        doek.setAttribute("transform", "translate(" + r2(Pc[0] + nc[0] * 30 + rc[0] * w) + " " + r2(Pc[1] + nc[1] * 30 + rc[1] * w) + ") scale(" + r2(dz) + ")");
      }
      if (d2 > 0 && d2 < 1) { schoon.style.opacity = "1"; strook(schoon, D - 70, D, L); }
      else schoon.style.opacity = "0";
      vonken.forEach(function (v, i) {
        var a = fase(t, s2 + 2.5 + i * 0.15, 0.45), z = Math.sin(Math.PI * a);
        v.style.display = z > 0.01 ? "" : "none";
        if (z > 0.01) {
          var pv = punt(L * [0.2, 0.5, 0.8][i]), nv = normaal(L * [0.2, 0.5, 0.8][i]);
          v.setAttribute("transform", "translate(" + r2(pv[0] + nv[0] * 22) + " " + r2(pv[1] + nv[1] * 22) + ") scale(" + r2(z) + ")");
        }
      });

      // 3. Nieuwe folie erop: hij rolt uit, de rakel drukt hem aan.
      nieuw.style.strokeDashoffset = String(r2(100 - 100 * q));
      if (t >= s3 && q < 1) {
        var r3 = Math.sqrt(16 + (L - Q) * DIK / Math.PI * 0.5), P3 = punt(Q), n3 = normaal(Q);
        rolNieuw(P3[0] + n3[0] * (r3 + 2), P3[1] + n3[1] * (r3 + 2), r3, fase(t, s3, 0.3));
        if (q > 0.01) {
          var sr = Math.max(0, Q - r3 - 12), Pr = punt(sr), nr = normaal(sr), tr = richting(sr);
          var ax = Pr[0] + nr[0] * (DIK + 1), ay = Pr[1] + nr[1] * (DIK + 1);
          var dx = nr[0] * 0.85 - tr[0] * 0.53, dy = nr[1] * 0.85 - tr[1] * 0.53;
          // de rakel van opzij: de zwarte viltrand op de folie, daarboven het blauwe kaartje
          [[rakelRand, 0, 13], [rakel, 11, 52]].forEach(function (d) {
            var lijn = d[0];
            lijn.style.display = "";
            lijn.setAttribute("x1", r2(ax + dx * d[1])); lijn.setAttribute("y1", r2(ay + dy * d[1]));
            lijn.setAttribute("x2", r2(ax + dx * d[2])); lijn.setAttribute("y2", r2(ay + dy * d[2]));
          });
        } else { rakel.style.display = "none"; rakelRand.style.display = "none"; }
      } else { rolNieuw(0, 0, 1, 0); rakel.style.display = "none"; rakelRand.style.display = "none"; }
      var gp = fase(t, s3 + 3.0, 0.9);
      if (gp > 0 && gp < 1) { glans.style.opacity = "1"; strook(glans, L * zacht(gp) - 40, L * zacht(gp), L); }
      else glans.style.opacity = "0";
    }

    /* Afspelen ------------------------------------------------------------ */
    var tijd = EIND, tot = EIND, loopt = false, vorige = 0, frame = 0;
    function stap(nu) {
      tijd += Math.min(nu - vorige, 100) / 1000;
      vorige = nu;
      if (tijd >= tot) { tijd = tot; loopt = false; fig.classList.remove("ds-speelt"); }
      teken(tijd);
      if (loopt) frame = requestAnimationFrame(stap);
    }
    function speel(van, eind) {
      cancelAnimationFrame(frame);
      tijd = van; tot = eind;
      fig.classList.add("ds-speelt");
      teken(tijd);
      loopt = true;
      vorige = performance.now();
      frame = requestAnimationFrame(stap);
    }

    knoppen.forEach(function (k) {
      k.addEventListener("click", function () {
        var st = STAPPEN[+k.getAttribute("data-naar") - 1];
        if (!st) return;
        if (RUSTIG) { cancelAnimationFrame(frame); loopt = false; tijd = st[1] - 0.001; teken(tijd); return; }
        speel(st[0], st[1] - 0.001);
      });
    });
    var opnieuw = fig.querySelector(".ds-opnieuw");
    if (opnieuw) opnieuw.addEventListener("click", function () { speel(0, EIND); });

    teken(EIND);
    if (RUSTIG || !("IntersectionObserver" in window)) return;

    // Klaarzetten op het verweerde kozijn, en spelen zodra hij goed in beeld is.
    teken(0);
    var kijker = new IntersectionObserver(function (rijen) {
      if (!rijen[0].isIntersecting) return;
      kijker.disconnect();
      setTimeout(function () { speel(0, EIND); }, 350);
    }, { threshold: 0.55 });
    kijker.observe(fig);
  });
})();
