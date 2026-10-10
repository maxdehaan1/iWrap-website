/* ---------------------------------------------------------------------------
   De film in het werkwijzeblok op de homepage: vijftien seconden van verweerd
   kozijn tot oplevering.

   Alles wat je ziet hangt af van één getal, de tijd. teken(t) zet elk onderdeel
   op de plek waar het op seconde t hoort. Daardoor speelt dezelfde code de film
   live af op de site én neemt video/opname.mjs er beeldje voor beeldje een MP4
   van op. Pas je hier iets aan, draai dan ook de opname opnieuw.

   De teksten staan niet hier maar in src/film.html, als blokken in
   .film-tekst. Ze verschijnen in die volgorde, op de tijden in BLOKKEN. Dat
   bestand staat via {{film}} op de homepage en op /werkwijze.

   Let op bij bewerken: Nederlandse teksten met een apostrof altijd tussen
   dubbele aanhalingstekens. build.py controleert dat.
   --------------------------------------------------------------------------- */
(function () {
  "use strict";

  var film = document.querySelector("[data-film]");
  if (!film) return;
  var svg = film.querySelector(".film-svg");
  var NS = "http://www.w3.org/2000/svg";

  /* Draaiboek ------------------------------------------------------------- */

  var DUUR = 15;
  // Wanneer elk tekstblok in beeld komt. Het laatste (de eindkaart) blijft staan.
  var BLOKKEN = [0, 2.4, 4.8, 6.95, 9.05, 11.25, 12.45];

  // Het kozijn, in wereldcoördinaten. Het werk zie je op de onderdorpel; de
  // andere delen krijgen aan het eind één voor één hun nieuwe folie, elk in
  // zijn eigen richting (x of y) en vanaf zijn eigen begintijd.
  var DELEN = [
    { d: [320, 222, 22, 186], as: "y", start: 11.35 },             // linkerstijl
    { d: [320, 200, 260, 22], as: "x", start: 11.42 },             // bovendorpel
    { d: [441, 222, 18, 186], as: "y", start: 11.52 },             // tussenstijl
    { d: [459, 222, 99, 186], as: "y", start: 11.62, raam: true }, // draairaam
    { d: [558, 222, 22, 186], as: "y", start: 11.74 }              // rechterstijl
  ];
  var VERNIEUW = 0.5;  // seconden per deel
  var RAAM = "M459 222h99v186h-99z M471 234v162h75v-162z";  // draairaam, als ring
  var DORPEL = [320, 408, 260, 32];

  // Camerastanden: midden van het beeld in de wereld, en hoe ver ingezoomd.
  var HEEL = { x: 450, y: 330, s: 2.25 };   // het hele kozijn
  var DETAIL = { x: 450, y: 425, s: 3.2 };  // de onderdorpel
  var GEVEL = { x: 450, y: 400, s: 1 };     // het huis met het busje

  // Het kozijn is crème (RAL 9001), het draairaam dennengroen (RAL 6009). De
  // nieuwe folie heeft dezelfde kleur als de oude: het wordt niet anders, het
  // wordt weer strak.
  var CREME = { nieuw: "#f2ecda", licht: "#fffcf3", donker: "#d6cbb0", oud: "#d5cbb1", vlek: "#b8ab8c", barst: "#8f8366" };
  var GROEN = { nieuw: "#2e4434", licht: "#4f6855", oud: "#65715f", barst: "#b4bcae" };

  var KLEUR = {
    kaal: "#e2e4e3",       // het kunststof profiel onder de folie
    lijm: "#c9a03c",
    inkt: "#22262a",
    inktZacht: "#3a4047",
    mint: "#a3cdc2",
    mintDiep: "#2f5a50",
    roest: "#a8523a",
    handschoen: "#5d666e",
    papier: "#f7f6f3",
    warm: "#f2b66b"
  };

  /* Hulpjes --------------------------------------------------------------- */

  function klem(x, a, b) { return Math.max(a, Math.min(b, x)); }
  // Hoe ver we zijn tussen twee tijdstippen: 0 ervoor, 1 erna.
  function fase(t, van, tot) { return klem((t - van) / (tot - van), 0, 1); }
  function zacht(p) { return p < 0.5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2; }
  function uit(p) { return 1 - Math.pow(1 - p, 3); }
  function erin(p) { return p * p * p; }
  function veer(p) { var c = 1.7; return 1 + (c + 1) * Math.pow(p - 1, 3) + c * Math.pow(p - 1, 2); }
  function mix(a, b, p) { return a + (b - a) * p; }
  // 0 -> 1 -> 0: voor iets dat even oplicht.
  function boog(p) { return Math.sin(Math.PI * klem(p, 0, 1)); }

  function maak(tag, attr, ouder) {
    var e = document.createElementNS(NS, tag);
    for (var k in attr) e.setAttribute(k, attr[k]);
    if (ouder) ouder.appendChild(e);
    return e;
  }
  function zet(e, attr) { for (var k in attr) e.setAttribute(k, attr[k]); }
  function rechthoek(d, attr, ouder) {
    var a = { x: d[0], y: d[1], width: d[2], height: d[3] };
    for (var k in attr) a[k] = attr[k];
    return maak("rect", a, ouder);
  }
  function verplaats(e, x, y, schaal, draai) {
    e.setAttribute("transform", "translate(" + x.toFixed(2) + " " + y.toFixed(2) + ")" +
      (draai ? " rotate(" + draai.toFixed(2) + ")" : "") +
      (schaal != null && schaal !== 1 ? " scale(" + schaal.toFixed(4) + ")" : ""));
  }
  function barsten(d, kleur, ouder) {
    return maak("path", { d: d, stroke: kleur, "stroke-width": 0.9, fill: "none", "stroke-linecap": "round", "stroke-linejoin": "round" }, ouder);
  }

  /* Definities ------------------------------------------------------------ */

  var defs = maak("defs", {}, svg);
  // Rode baksteen in halfsteens verband, met een beetje kleurverschil per steen.
  var steen = maak("pattern", { id: "film-steen", width: 48, height: 24, patternUnits: "userSpaceOnUse" }, defs);
  maak("rect", { width: 48, height: 24, fill: "#cbbcab" }, steen);
  [[1.2, 1.2, "#9a5a45"], [25.2, 1.2, "#8f5241"], [-10.8, 13.2, "#a0614b"], [13.2, 13.2, "#94563f"], [37.2, 13.2, "#a0614b"]].forEach(function (b) {
    maak("rect", { x: b[0], y: b[1], width: 22.6, height: 10.6, fill: b[2] }, steen);
  });
  // Verweerde crème: vlekkerig en vergeeld.
  var vlek = maak("pattern", { id: "film-vlek", width: 26, height: 20, patternUnits: "userSpaceOnUse" }, defs);
  [[6, 5, 5, 3], [18, 13, 6, 3.5], [11, 17, 3, 2], [22, 3, 2.5, 1.6]].forEach(function (e) {
    maak("ellipse", { cx: e[0], cy: e[1], rx: e[2], ry: e[3], fill: CREME.vlek, opacity: 0.3 }, vlek);
  });
  maak("circle", { cx: 3, cy: 12, r: 0.5, fill: CREME.barst, opacity: 0.6 }, vlek);
  maak("circle", { cx: 16, cy: 6, r: 0.4, fill: CREME.barst, opacity: 0.6 }, vlek);
  // Verweerd groen: verkrijt.
  var kalk = maak("pattern", { id: "film-kalk", width: 7, height: 6, patternUnits: "userSpaceOnUse" }, defs);
  maak("circle", { cx: 1.6, cy: 1.8, r: 0.6, fill: "#c3cbbd", opacity: 0.55 }, kalk);
  maak("circle", { cx: 5.1, cy: 4.6, r: 0.45, fill: "#c3cbbd", opacity: 0.55 }, kalk);
  // Glas: iets donkerder naar onderen, zoals een raam met een kamer erachter.
  var glas = maak("linearGradient", { id: "film-glas", x1: 0, y1: 0, x2: 0, y2: 1 }, defs);
  maak("stop", { offset: 0, "stop-color": "#aec4ca" }, glas);
  maak("stop", { offset: 1, "stop-color": "#7d959e" }, glas);
  maak("filter", { id: "film-schaduw", x: "-20%", y: "-20%", width: "140%", height: "150%" }, defs)
    .appendChild(maak("feDropShadow", { dx: 0, dy: 12, stdDeviation: 14, "flood-color": KLEUR.inkt, "flood-opacity": 0.22 }));

  function knip(id) { return maak("clipPath", { id: id }, defs); }
  var knipOud = rechthoek(DORPEL, {}, knip("film-knip-oud"));
  var knipNieuw = rechthoek([DORPEL[0], DORPEL[1], 0, DORPEL[3]], {}, knip("film-knip-nieuw"));
  DELEN.forEach(function (deel, i) { deel.knip = rechthoek(deel.d, {}, knip("film-knip-deel-" + i)); });
  var knipKozijn = knip("film-knip-kozijn");
  DELEN.forEach(function (deel) { if (!deel.raam) rechthoek(deel.d, {}, knipKozijn); });
  maak("path", { d: RAAM, "clip-rule": "evenodd" }, knipKozijn);
  rechthoek([10, 10, 170, 360], { rx: 20 }, knip("film-knip-scherm"));
  rechthoek([4, 4, 102, 74], { rx: 4 }, knip("film-knip-foto"));

  /* De wereld: huis, kozijn, straat en busje ------------------------------ */

  var camera = maak("g", {}, svg);
  var wereld = maak("g", { id: "film-wereld" }, camera);

  maak("rect", { x: -60, y: -60, width: 1020, height: 920, fill: "#e6efeb" }, wereld);
  // De buren, zodat het uitgezoomde beeld een straat is en geen los huisje.
  [[-60, 170], [790, 170]].forEach(function (b) {
    maak("rect", { x: b[0], y: b[1] - 18, width: 170, height: 18, fill: "#4a5158" }, wereld);
    maak("rect", { x: b[0], y: b[1], width: 170, height: 490, fill: "url(#film-steen)" }, wereld);
    maak("rect", { x: b[0], y: b[1], width: 170, height: 490, fill: "#000", opacity: 0.1 }, wereld);
    maak("rect", { x: b[0] + 30, y: b[1] + 120, width: 110, height: 130, fill: "url(#film-glas)", stroke: "#efe9da", "stroke-width": 10 }, wereld);
  });

  maak("polygon", { points: "96,120 804,120 450,-150", fill: KLEUR.inktZacht }, wereld);
  maak("rect", { x: 130, y: 120, width: 640, height: 535, fill: "url(#film-steen)" }, wereld);
  maak("rect", { x: 90, y: 108, width: 720, height: 14, rx: 3, fill: "#2c3136" }, wereld);

  // De voordeur: crème kozijn, groene deur, allebei verweerd -- en dat blijven
  // ze ook, de film gaat over het raam.
  maak("rect", { x: 662, y: 386, width: 104, height: 269, fill: "#6f3c2f" }, wereld);
  maak("rect", { x: 668, y: 392, width: 92, height: 263, fill: CREME.oud }, wereld);
  maak("rect", { x: 681, y: 406, width: 66, height: 249, fill: GROEN.oud }, wereld);
  maak("rect", { x: 681, y: 406, width: 66, height: 249, fill: "url(#film-kalk)" }, wereld);
  maak("rect", { x: 692, y: 420, width: 44, height: 96, fill: "url(#film-glas)" }, wereld);
  maak("rect", { x: 737, y: 548, width: 5, height: 24, rx: 2, fill: "#d9dad6" }, wereld);

  // Rollaag boven het raam, dagkant en raamdorpel.
  var rollaag = "";
  for (var x = 304; x <= 596; x += 7.3) rollaag += "M" + x.toFixed(1) + " 170v22";
  maak("rect", { x: 304, y: 170, width: 292, height: 22, fill: "#8a4c3b" }, wereld);
  maak("path", { d: rollaag, stroke: "#cbbcab", "stroke-width": 1.2 }, wereld);
  maak("rect", { x: 312, y: 192, width: 276, height: 250, fill: "#6f3c2f" }, wereld);
  maak("rect", { x: 304, y: 440, width: 292, height: 20, fill: "#bcb5a8" }, wereld);
  maak("rect", { x: 304, y: 440, width: 292, height: 4, fill: "#d3cdc2" }, wereld);
  maak("rect", { x: 308, y: 460, width: 284, height: 6, fill: "#000", opacity: 0.14 }, wereld);

  // Glas, met een paar spiegelingen.
  maak("rect", { x: 342, y: 222, width: 99, height: 186, fill: "url(#film-glas)" }, wereld);
  maak("rect", { x: 471, y: 234, width: 75, height: 162, fill: "url(#film-glas)" }, wereld);
  maak("path", { d: "M352 222h34l-44 70v-38z M400 222h14l-72 116v-22z M480 234h28l-37 58v-40z", fill: "#fff", opacity: 0.32 }, wereld);

  // Het kozijn in nieuwe staat. Daaroverheen ligt per deel de oude, verweerde
  // folie, die aan het eind wordt weggehaald (deel.knip).
  var vers = maak("g", {}, wereld);
  DELEN.forEach(function (deel) { if (!deel.raam) rechthoek(deel.d, { fill: CREME.nieuw }, vers); });
  maak("path", { d: RAAM, fill: GROEN.nieuw, "fill-rule": "evenodd" }, vers);
  maak("path", { d: "M321 201.2h258 M321.2 222v186 M442.2 222v186 M559.2 222v186", stroke: CREME.licht, "stroke-width": 1.6 }, vers);
  maak("path", { d: "M341 222v186 M458 222v186 M579 200v208", stroke: CREME.donker, "stroke-width": 1.4 }, vers);
  maak("path", { d: "M460 223.2h97 M460.2 223v184 M472 395.2h73", stroke: GROEN.licht, "stroke-width": 1.4 }, vers);

  var SCHADE = [
    "M326 258l4 8-2 7 4 9 M330 300l5 5 M327 336l4 6-1 7",
    "M350 207l8 4 6-2 9 5 M500 213l7-3 6 4 8-1 M418 206l6 5 7-2",
    "M445 318l5 6-2 8 M446 250l4 7",
    "M462 260l5 6-2 7 M520 226l6 4 7-2 M549 330l4 7-2 6 M490 400l7-3 6 4",
    "M565 296l5 7-3 6 4 7 M566 240l5 6"
  ];
  DELEN.forEach(function (deel, i) {
    var g = maak("g", { "clip-path": "url(#film-knip-deel-" + i + ")" }, wereld);
    if (deel.raam) {
      maak("path", { d: RAAM, fill: GROEN.oud, "fill-rule": "evenodd" }, g);
      maak("path", { d: RAAM, fill: "url(#film-kalk)", "fill-rule": "evenodd" }, g);
      barsten(SCHADE[i], GROEN.barst, g);
    } else {
      rechthoek(deel.d, { fill: CREME.oud }, g);
      rechthoek(deel.d, { fill: "url(#film-vlek)" }, g);
      barsten(SCHADE[i], CREME.barst, g);
    }
    if (i === 0) {
      // Een hoekje folie dat loskomt, met de gele lijmlaag eronder.
      maak("path", { d: "M342 380v28h-20z", fill: KLEUR.lijm }, g);
      maak("path", { d: "M342 380q12 5 17 19l-17 9z", fill: "#efe7d2", stroke: "#a3946f", "stroke-width": 0.6, "stroke-linejoin": "round" }, g);
    }
  });

  // Kruk en scharnieren van het draairaam, en de rubbers rond het glas.
  maak("path", { d: "M342.7 222.7h97.6v184.6h-97.6z M471.7 234.7h73.6v160.6h-73.6z", fill: "none", stroke: "#2a2e31", "stroke-width": 1.4 }, wereld);
  maak("rect", { x: 461.5, y: 300, width: 7, height: 22, rx: 2, fill: "#ebeae6", stroke: "#a9aba8", "stroke-width": 0.5 }, wereld);
  maak("rect", { x: 463, y: 318, width: 4, height: 20, rx: 2, fill: "#ebeae6", stroke: "#a9aba8", "stroke-width": 0.5 }, wereld);
  maak("path", { d: "M556 238v14 M556 378v14", stroke: "#cfd1cf", "stroke-width": 5, "stroke-linecap": "round" }, wereld);

  // De onderdorpel in drie lagen: kaal profiel, nieuwe folie, oude folie.
  rechthoek(DORPEL, { fill: KLEUR.kaal }, wereld);
  maak("rect", { x: 320, y: 436, width: 260, height: 4, fill: "#cdd0cf" }, wereld);
  var nieuw = maak("g", { "clip-path": "url(#film-knip-nieuw)" }, wereld);
  rechthoek(DORPEL, { fill: CREME.nieuw }, nieuw);
  maak("path", { d: "M320 409.4h260", stroke: CREME.licht, "stroke-width": 1.8 }, nieuw);
  maak("rect", { x: 320, y: 436, width: 260, height: 4, fill: CREME.donker }, nieuw);
  var oudDorpel = maak("g", { "clip-path": "url(#film-knip-oud)" }, wereld);
  rechthoek(DORPEL, { fill: CREME.oud }, oudDorpel);
  rechthoek(DORPEL, { fill: "url(#film-vlek)" }, oudDorpel);
  maak("path", { d: "M380 440l3-7 6-2 5 3 7-1 4 4 2 3z", fill: KLEUR.lijm }, oudDorpel);
  barsten("M352 415l5 4 6-1 5 5 7 0 M372 431l6-4 5 2 8-5 M404 413l4 5 7 1 3 6 M468 420l7 3 5-3 6 4 9-1 " +
    "M512 433l5-5 6 1 4-6 M540 414l6 6 8-2 M430 426l6 2 4 5", CREME.barst, oudDorpel);
  // De randen waar de oude folie loskomt en de nieuwe ophoudt.
  var randOud = maak("path", { stroke: "#a3946f", "stroke-width": 1.3 }, wereld);
  var randNieuw = maak("path", { stroke: CREME.donker, "stroke-width": 1.3 }, wereld);

  // Glansstreepjes die over elk deel trekken als het zijn nieuwe folie krijgt.
  var glansKozijn = maak("g", { "clip-path": "url(#film-knip-kozijn)" }, wereld);
  DELEN.forEach(function (deel) { deel.glans = maak("rect", { fill: "#fff", opacity: 0 }, glansKozijn); });

  // Stoep en straat.
  maak("rect", { x: -60, y: 655, width: 1020, height: 40, fill: "#d9d4c9" }, wereld);
  maak("path", { d: "M30 655v40M150 655v40M270 655v40M390 655v40M510 655v40M630 655v40M750 655v40M870 655v40", stroke: "#cdc7ba", "stroke-width": 1.5 }, wereld);
  maak("rect", { x: -60, y: 693, width: 1020, height: 7, fill: "#c2bcb0" }, wereld);
  maak("rect", { x: -60, y: 700, width: 1020, height: 160, fill: "#cdd0d1" }, wereld);

  // Het busje. Eigen assenstelsel: de wielen staan op y = 0.
  var busje = maak("g", {}, wereld);
  maak("ellipse", { cx: 170, cy: 2, rx: 175, ry: 8, fill: "#000", opacity: 0.12 }, busje);
  var bak = maak("g", {}, busje);
  maak("path", {
    d: "M10 -24 L10 -150 Q10 -165 25 -165 L245 -165 Q262 -165 272 -150 L312 -100 Q330 -96 330 -78 L330 -38 Q330 -24 316 -24 Z",
    fill: "#fff", stroke: "#cfccc4", "stroke-width": 1.5
  }, bak);
  maak("path", { d: "M258 -150 L268 -150 L305 -104 L258 -104 Z", fill: KLEUR.inktZacht }, bak);
  maak("path", { d: "M266 -146 L276 -146 L286 -132 L270 -132 Z", fill: "#fff", opacity: 0.35 }, bak);
  maak("path", { d: "M250 -150 V-30 M250 -86 h-10", stroke: "#d9d6cf", "stroke-width": 2, "stroke-linecap": "round" }, bak);
  maak("rect", { x: 10, y: -68, width: 320, height: 12, fill: KLEUR.mint }, bak);
  maak("image", { href: "/images/logo/iwrap-logo-donker-88.png", x: 40, y: -132, width: 172, height: 36 }, bak);
  maak("rect", { x: 300, y: -36, width: 34, height: 11, rx: 4, fill: "#cfccc4" }, bak);
  maak("rect", { x: 4, y: -36, width: 16, height: 11, rx: 4, fill: "#cfccc4" }, bak);
  maak("rect", { x: 321, y: -86, width: 9, height: 11, rx: 2, fill: "#f2dc8c" }, bak);
  maak("path", { d: "M46 -24 A32 32 0 0 1 110 -24 Z M230 -24 A32 32 0 0 1 294 -24 Z", fill: KLEUR.inktZacht }, bak);
  var wielen = [78, 262].map(function (x) {
    var w = maak("g", {}, busje);
    maak("circle", { r: 25, fill: KLEUR.inkt }, w);
    maak("circle", { r: 12, fill: "#cfd2d3" }, w);
    maak("path", { d: "M0 -11V11M-11 0H11", stroke: "#9aa0a5", "stroke-width": 3 }, w);
    return { el: w, x: x };
  });

  /* Alles wat vóór de camera hangt --------------------------------------- */

  var waas = maak("rect", { x: 0, y: 0, width: 900, height: 800, fill: KLEUR.papier, opacity: 0 }, svg);

  // Ringen om de schade in het eerste beeld: het loskomende hoekje, de lijm op
  // de onderdorpel en de barstjes bovenin.
  var ringen = [[336, 395], [392, 434], [507, 212]].map(function (plek) {
    var g = maak("g", { fill: "none" }, svg);
    var wit = maak("circle", { stroke: "#fff", "stroke-width": 7 }, g);
    var rood = maak("circle", { stroke: KLEUR.roest, "stroke-width": 3.5 }, g);
    return { el: g, x: plek[0], y: plek[1], cirkels: [wit, rood] };
  });

  // De offerte.
  var kaart = maak("g", { filter: "url(#film-schaduw)" }, svg);
  maak("rect", { width: 300, height: 340, rx: 18, fill: "#fff" }, kaart);
  maak("text", { x: 26, y: 50, fill: KLEUR.inkt, "font-family": "Montserrat, sans-serif", "font-weight": 700, "font-size": 26 }, kaart)
    .textContent = "Offerte";
  maak("rect", { x: 26, y: 72, width: 110, height: 82, rx: 8, fill: "#eef1f0" }, kaart);
  var regels = [[150, 84, 120], [150, 104, 92], [150, 124, 108], [26, 182, 230], [26, 204, 186], [26, 226, 206]].map(function (r) {
    return maak("rect", { x: r[0], y: r[1], width: r[2], height: 10, rx: 5, fill: "#e3e1db" }, kaart);
  });
  maak("path", { d: "M26 254h248", stroke: "#e3e1db", "stroke-width": 2 }, kaart);
  maak("text", { x: 26, y: 298, fill: KLEUR.inkt, "font-family": "Montserrat, sans-serif", "font-weight": 700, "font-size": 23 }, kaart)
    .textContent = "Vaste prijs";
  var vinkje = maak("g", {}, kaart);
  maak("circle", { r: 19, fill: KLEUR.mint }, vinkje);
  maak("path", { d: "M-8 0l5 5 10-11", stroke: KLEUR.inkt, "stroke-width": 3.4, fill: "none", "stroke-linecap": "round", "stroke-linejoin": "round" }, vinkje);

  // De foto die van de telefoon naar de offerte vliegt.
  var foto = maak("g", {}, svg);
  maak("rect", { width: 110, height: 82, rx: 7, fill: "#fff", stroke: "#e3e1db" }, foto);
  var fotoBeeld = maak("g", { "clip-path": "url(#film-knip-foto)" }, foto);
  maak("use", { href: "#film-wereld", transform: "translate(55 41) scale(.3) translate(-450 -330)" }, fotoBeeld);

  // De telefoon, met op het scherm het echte kozijn.
  var telefoon = maak("g", {}, svg);
  maak("rect", { width: 190, height: 380, rx: 30, fill: KLEUR.inkt }, telefoon);
  var scherm = maak("g", { "clip-path": "url(#film-knip-scherm)" }, telefoon);
  maak("rect", { x: 10, y: 10, width: 170, height: 360, fill: "#e6efeb" }, scherm);
  maak("use", { href: "#film-wereld", transform: "translate(95 190) scale(.62) translate(-450 -330)" }, scherm);
  var kader = maak("path", {
    d: "M28 120v-16h16 M146 104h16v16 M162 262v16h-16 M44 278h-16v-16",
    stroke: "#fff", "stroke-width": 3, fill: "none", "stroke-linecap": "round"
  }, scherm);
  maak("circle", { cx: 95, cy: 334, r: 17, fill: "#fff", "fill-opacity": 0.3, stroke: "#fff", "stroke-width": 3 }, scherm);
  var flits = maak("rect", { x: 10, y: 10, width: 170, height: 360, fill: "#fff", opacity: 0 }, scherm);
  maak("rect", { x: 70, y: 18, width: 50, height: 10, rx: 5, fill: KLEUR.inkt }, telefoon);

  // Het warmtepistool. De mond zit op (0,0) en wijst naar links.
  var fohn = maak("g", {}, svg);
  var lucht = maak("g", { fill: "none", stroke: KLEUR.warm, "stroke-width": 4, "stroke-linecap": "round", "stroke-dasharray": "14 12" }, fohn);
  var golven = ["M-6 -6 q-20 10 -40 0 t-40 0", "M-6 0 q-22 12 -44 0 t-46 0", "M-6 6 q-20 10 -40 0 t-40 0"].map(function (d) {
    return maak("path", { d: d }, lucht);
  });
  var pistool = maak("g", {}, fohn);
  maak("path", { d: "M126 138 L186 138 L270 900 L150 900 Z", fill: KLEUR.inktZacht }, pistool);
  maak("path", { d: "M170 138 L186 138 L270 900 L246 900 Z", fill: "#4b535b" }, pistool);
  maak("rect", { x: 0, y: -10, width: 60, height: 20, rx: 3, fill: "#a7adb2" }, pistool);
  maak("rect", { x: 0, y: -11, width: 7, height: 22, rx: 2, fill: "#7c8288" }, pistool);
  maak("rect", { x: 50, y: -13, width: 14, height: 26, rx: 3, fill: "#8a9096" }, pistool);
  maak("path", { d: "M132 22 L170 22 L180 130 Q181 140 170 140 L146 140 Q136 140 135 130 Z", fill: KLEUR.inkt }, pistool);
  maak("rect", { x: 60, y: -30, width: 150, height: 60, rx: 24, fill: KLEUR.mintDiep }, pistool);
  maak("path", { d: "M182 -12v24 M192 -12v24", stroke: "#24473f", "stroke-width": 3, "stroke-linecap": "round" }, pistool);
  maak("rect", { x: 118, y: 46, width: 74, height: 78, rx: 28, fill: KLEUR.handschoen }, pistool);
  maak("path", { d: "M122 68h20 M122 86h20 M122 104h20", stroke: "#4b535a", "stroke-width": 3, "stroke-linecap": "round" }, pistool);
  maak("ellipse", { cx: 152, cy: 46, rx: 24, ry: 12, fill: "#68717a" }, pistool);
  maak("rect", { x: 124, y: 116, width: 64, height: 26, rx: 8, fill: KLEUR.mint }, pistool);

  // De oude folie die zich oprolt, en de rol nieuwe folie.
  function rol(kleur, rand, spiraal) {
    var g = maak("g", {}, svg);
    var schijf = maak("circle", { r: 20, fill: kleur, stroke: rand, "stroke-width": 1.5 }, g);
    var draai = maak("g", {}, g);
    var arc = maak("path", { fill: "none", stroke: spiraal, "stroke-width": 2, "stroke-linecap": "round" }, draai);
    return { el: g, schijf: schijf, draai: draai, arc: arc };
  }
  var krul = rol("#d3c5a1", "#a3946f", "#a3946f");
  var nieuweRol = rol(CREME.nieuw, "#c9bd9f", "#cfc3a6");
  maak("circle", { r: 7, fill: "#b9a27a" }, nieuweRol.el);  // kartonnen kern

  // De rakel. De vilten kant zit op x = 0 en drukt de folie aan; de arm komt
  // van rechtsonder, net als bij het warmtepistool.
  var rakel = maak("g", {}, svg);
  maak("path", { d: "M64 -27 L900 -46 L900 62 L64 27 Z", fill: KLEUR.inktZacht }, rakel);
  maak("path", { d: "M64 -27 L900 -46 L900 -22 L64 -13 Z", fill: "#4b535b" }, rakel);
  maak("rect", { x: 0, y: -48, width: 54, height: 96, rx: 9, fill: KLEUR.mint, stroke: KLEUR.mintDiep, "stroke-width": 1.5 }, rakel);
  maak("rect", { x: -4, y: -48, width: 11, height: 96, rx: 3, fill: "#4b535a" }, rakel);
  maak("rect", { x: 24, y: -35, width: 50, height: 70, rx: 23, fill: KLEUR.handschoen }, rakel);
  maak("path", { d: "M30 -17h18 M30 0h18 M30 17h18", stroke: "#4b535a", "stroke-width": 3, "stroke-linecap": "round" }, rakel);
  maak("rect", { x: 64, y: -29, width: 24, height: 58, rx: 8, fill: KLEUR.mint }, rakel);

  // Sterretjes bij de oplevering: op het kozijn en op het draairaam.
  var sterren = [[572, 206, 12.25], [552, 228, 12.45]].map(function (st) {
    var e = maak("path", { d: "M0 -16 L4 -4 L16 0 L4 4 L0 16 L-4 4 L-16 0 L-4 -4 Z", fill: "#fff" }, svg);
    return { el: e, x: st[0], y: st[1], t: st[2] };
  });

  /* De HTML-kant: teksten, labels, knop, voortgang ------------------------ */

  var blokken = Array.prototype.slice.call(film.querySelectorAll(".film-tekst > *"));
  var slotDelen = Array.prototype.slice.call(film.querySelectorAll(".film-slot > *"));
  var merk = film.querySelector(".film-merk");
  var labelVoor = film.querySelector(".film-voor");
  var labelNa = film.querySelector(".film-na");
  var balk = film.querySelector(".film-voortgang span");
  var knop = film.querySelector(".film-knop");

  function zichtbaar(el, o, y) {
    if (!el) return;
    el.style.opacity = o.toFixed(3);
    el.style.transform = y ? "translateY(" + y.toFixed(3) + "em)" : "";
    el.style.visibility = o > 0.001 ? "visible" : "hidden";
  }

  /* Tekenen op tijdstip t ------------------------------------------------- */

  function cameraOp(t) {
    var a, b, p;
    if (t < 4.8) { a = { x: HEEL.x, y: HEEL.y, s: 2.16 }; b = HEEL; p = fase(t, 0, 4.8); }
    else if (t < 6.25) { a = HEEL; b = GEVEL; p = zacht(fase(t, 4.8, 5.4)); }
    else if (t < 11.25) { a = GEVEL; b = DETAIL; p = zacht(fase(t, 6.25, 6.95)); }
    else { a = DETAIL; b = { x: HEEL.x, y: HEEL.y, s: 2.3 }; p = zacht(fase(t, 11.25, 11.95)); }
    if (t >= 11.95) { a = { x: HEEL.x, y: HEEL.y, s: 2.3 }; b = { x: HEEL.x, y: HEEL.y, s: 2.36 }; p = fase(t, 11.95, DUUR); }
    // Op een logaritmische schaal zoomen: anders voelt uitzoomen als vallen.
    var s = Math.exp(mix(Math.log(a.s), Math.log(b.s), p));
    // Het midden zo meenemen dat het punt in beeld tijdens het zoomen stil lijkt te staan.
    var q = a.s === b.s ? p : (1 / a.s - 1 / s) / (1 / a.s - 1 / b.s);
    return { x: mix(a.x, b.x, q), y: mix(a.y, b.y, q), s: s };
  }

  function teken(t) {
    t = klem(t, 0, DUUR);
    var cam = cameraOp(t);
    camera.setAttribute("transform",
      "translate(450 400) scale(" + cam.s.toFixed(4) + ") translate(" + (-cam.x).toFixed(2) + " " + (-cam.y).toFixed(2) + ")");
    function sx(x) { return 450 + (x - cam.x) * cam.s; }
    function sy(y) { return 400 + (y - cam.y) * cam.s; }

    // Busje: rijdt voor, remt, veert na.
    var rit = uit(fase(t, 4.95, 5.95));
    var bx = mix(-420, 105, rit);
    var na = Math.max(0, t - 5.95);
    var duik = t > 5.95 ? 2.4 * Math.sin(na * 16) * Math.exp(-na * 7) : 0;
    var hobbel = (1 - fase(t, 5.6, 5.95)) * Math.sin(t * 38) * 1.2;
    verplaats(busje, bx, 776);
    bak.setAttribute("transform", "translate(0 " + hobbel.toFixed(2) + ") rotate(" + duik.toFixed(2) + " 170 0)");
    wielen.forEach(function (w) {
      verplaats(w.el, w.x, -22, 1, ((bx + 420) / 25) * 57.3);
    });

    // Schade aanwijzen.
    ringen.forEach(function (r, i) {
      var s0 = 0.45 + i * 0.3;
      var straal = 17 * cam.s * veer(fase(t, s0, s0 + 0.4));
      r.cirkels.forEach(function (c) { zet(c, { cx: sx(r.x), cy: sy(r.y), r: Math.max(0, straal) }); });
      r.el.setAttribute("opacity", (t < s0 ? 0 : 1 - fase(t, 2.05, 2.35)).toFixed(3));
    });

    // De oude folie gaat eraf en de nieuwe erop. Half gelijkmatig, half
    // zacht: dan zie je het werk echt over de dorpel gaan.
    function gang(x) { return (x + zacht(x)) / 2; }
    var p = mix(318, 600, gang(fase(t, 7.35, 8.85)));
    var q = mix(300, 600, gang(fase(t, 9.2, 10.75)));
    zet(knipOud, { x: Math.min(p, 580), width: Math.max(0, 580 - p) });
    zet(knipNieuw, { width: klem(q - 320, 0, 260) });
    zet(randOud, { d: "M" + p.toFixed(2) + " 408v32", opacity: p > 320 && p < 580 ? 1 : 0 });
    zet(randNieuw, { d: "M" + q.toFixed(2) + " 408v32", opacity: q > 320 && q < 580 ? 1 : 0 });

    // Daarna de rest van het kozijn en het draairaam, deel voor deel.
    DELEN.forEach(function (deel) {
      var r = zacht(fase(t, deel.start, deel.start + VERNIEUW)), d = deel.d;
      if (deel.as === "x") {
        zet(deel.knip, { x: d[0] + r * d[2], width: (1 - r) * d[2] });
        zet(deel.glans, { x: d[0] + r * d[2] - 4, y: d[1], width: 8, height: d[3] });
      } else {
        zet(deel.knip, { y: d[1] + r * d[3], height: (1 - r) * d[3] });
        zet(deel.glans, { x: d[0], y: d[1] + r * d[3] - 4, width: d[2], height: 8 });
      }
      deel.glans.setAttribute("opacity", (0.85 * boog(r)).toFixed(3));
    });

    var midden = sy(DORPEL[1] + DORPEL[3] / 2);
    var boven = sy(DORPEL[1]);

    // Krul van oude folie.
    var rk = mix(18, 38, fase(p, 320, 580));
    zet(krul.schijf, { r: rk });
    zet(krul.arc, { d: "M0 " + (-rk * 0.62) + " A" + rk * 0.62 + " " + rk * 0.62 + " 0 1 1 " + (-rk * 0.55) + " " + (rk * 0.25) +
      " M0 " + (-rk * 0.3) + " A" + rk * 0.3 + " " + rk * 0.3 + " 0 1 0 " + (rk * 0.28) + " " + (rk * 0.1) });
    verplaats(krul.el, sx(p), midden - 2);
    zet(krul.draai, { transform: "rotate(" + (p * 9).toFixed(1) + ")" });
    krul.el.setAttribute("opacity", t > 7.3 ? (1 - fase(t, 8.7, 8.9)).toFixed(3) : 0);

    // Warmtepistool, iets vóór de krul uit.
    var fin = uit(fase(t, 6.95, 7.35)), fuit = erin(fase(t, 8.8, 9.15));
    var fx = Math.min(sx(p) + rk + 30, 830) + (1 - fin) * 320 + fuit * 360;
    var fy = boven - 34 + (1 - fin) * 300 + fuit * 300;
    verplaats(fohn, fx, fy, 1, -35 + Math.sin(t * 9) * 1.5);
    fohn.setAttribute("opacity", t > 6.9 && t < 9.25 ? 1 : 0);
    golven.forEach(function (g, i) {
      g.setAttribute("stroke-dashoffset", (t * 140 + i * 9).toFixed(1));
    });
    lucht.setAttribute("opacity", (0.85 * fase(t, 7.2, 7.4) * (1 - fase(t, 8.75, 8.9))).toFixed(3));

    // Rol nieuwe folie, met de rakel erachteraan.
    var rn = mix(38, 22, fase(q, 320, 580));
    zet(nieuweRol.schijf, { r: rn });
    zet(nieuweRol.arc, { d: "M0 " + (-rn * 0.7) + " A" + rn * 0.7 + " " + rn * 0.7 + " 0 0 1 " + (rn * 0.66) + " " + (rn * 0.2) });
    verplaats(nieuweRol.el, sx(q), midden - 2);
    zet(nieuweRol.draai, { transform: "rotate(" + (q * 7).toFixed(1) + ")" });
    nieuweRol.el.setAttribute("opacity", t > 9.15 ? (1 - fase(t, 10.6, 10.8)).toFixed(3) : 0);

    var rin = uit(fase(t, 9.45, 9.8)), ruit = erin(fase(t, 10.8, 11.15));
    var rx = Math.max(Math.min(sx(q) - rn - 64, 790), 40);
    verplaats(rakel, rx + (1 - rin) * 300 + ruit * 320, midden + (1 - rin) * 260 + ruit * 260, 1,
      30 + Math.sin(t * 15) * 3);
    rakel.setAttribute("opacity", t > 9.4 && t < 11.2 ? 1 : 0);

    // Foto maken en de offerte.
    var tIn = uit(fase(t, 2.4, 2.85)), tUit = erin(fase(t, 4.4, 4.8));
    verplaats(telefoon, 572, 318 + (1 - tIn) * 520 + tUit * 560, 1, -4 + (1 - tIn) * 8);
    telefoon.setAttribute("opacity", t > 2.35 && t < 4.85 ? 1 : 0);
    var richt = fase(t, 2.8, 3.15);
    zet(kader, { opacity: 0.5 + 0.5 * boog(richt * 2), transform: "translate(95 190) scale(" + (1.12 - 0.12 * uit(richt)) + ") translate(-95 -190)" });
    flits.setAttribute("opacity", (t > 3.15 ? Math.exp(-(t - 3.15) * 10) : 0).toFixed(3));
    waas.setAttribute("opacity", (0.5 * fase(t, 2.45, 2.8) * (1 - fase(t, 4.4, 4.8))).toFixed(3));

    var kIn = uit(fase(t, 3.25, 3.65)), kUit = erin(fase(t, 4.45, 4.85));
    var kx = mix(-360, 104, kIn) - kUit * 480, ky = 150;
    verplaats(kaart, kx, ky);
    kaart.setAttribute("opacity", t > 3.2 && t < 4.9 ? 1 : 0);
    regels.forEach(function (r, i) {
      r.setAttribute("opacity", fase(t, 3.75 + i * 0.05, 3.9 + i * 0.05).toFixed(3));
    });
    var v = fase(t, 4.05, 4.35);
    verplaats(vinkje, 262, 290, v > 0 ? veer(v) : 0);

    // Het fotootje vliegt in een boogje van het scherm naar de offerte.
    var vl = zacht(fase(t, 3.35, 3.85));
    var vanX = 572 + 95 - 55, vanY = 318 + 190 - 41, naarX = kx + 26, naarY = ky + 72;
    verplaats(foto, mix(vanX, naarX, vl), mix(vanY, naarY, vl) - 90 * boog(vl), mix(1.35, 1, vl));
    foto.setAttribute("opacity", t > 3.3 && t < 4.9 ? 1 : 0);

    sterren.forEach(function (st) {
      var sp = fase(t, st.t, st.t + 0.6);
      verplaats(st.el, sx(st.x), sy(st.y), 1.3 * boog(sp), sp * 90);
      st.el.setAttribute("opacity", boog(sp).toFixed(3));
    });

    // Labels, en het logo dat alleen in de opname staat.
    zichtbaar(merk, 1 - fase(t, 12.2, 12.45));
    zichtbaar(labelVoor, 1 - fase(t, 4.55, 4.8));
    zichtbaar(labelNa, uit(fase(t, 11.95, 12.3)));

    // Teksten: elk blok komt omhoog in beeld en gaat weg als het volgende komt.
    // Het eerste staat er meteen, zodat het beginbeeld ook een goede poster is.
    blokken.forEach(function (b, i) {
      var start = BLOKKEN[i], eind = BLOKKEN[i + 1];
      var erinP = i === 0 ? 1 : uit(fase(t, start, start + 0.4));
      var eruit = eind == null ? 0 : fase(t, eind - 0.22, eind);
      var o = Math.min(erinP, 1 - eruit);
      zichtbaar(b, o, (1 - erinP) * 0.6 - eruit * 0.3);
    });
    slotDelen.forEach(function (d, i) {
      var s = BLOKKEN[BLOKKEN.length - 1] + 0.12 + i * 0.13;
      var pd = uit(fase(t, s, s + 0.4));
      zichtbaar(d, pd, (1 - pd) * 0.5);
    });

    if (balk) balk.style.transform = "scaleX(" + (t / DUUR).toFixed(4) + ")";
  }

  /* Afspelen ------------------------------------------------------------- */

  var tijd = 0, loopt = false, vorige = 0, frame = 0, zelfGestopt = false;

  function stap(nu) {
    // Nooit meer dan een tiende seconde per beeld: na een verborgen tabblad
    // springt de film anders in één keer naar het eind.
    tijd += Math.min(nu - vorige, 100) / 1000;
    vorige = nu;
    teken(tijd);
    if (tijd >= DUUR) { loopt = false; werkKnop(); return; }
    frame = requestAnimationFrame(stap);
  }
  function speel() {
    if (tijd >= DUUR) tijd = 0;
    loopt = true;
    vorige = performance.now();
    frame = requestAnimationFrame(stap);
    werkKnop();
  }
  function stop() {
    loopt = false;
    cancelAnimationFrame(frame);
    werkKnop();
  }
  function werkKnop() {
    if (!knop) return;
    var stand = loopt ? "pauze" : tijd >= DUUR ? "opnieuw" : "speel";
    knop.setAttribute("data-stand", stand);
    knop.setAttribute("aria-label", { pauze: "Film pauzeren", speel: "Film afspelen", opnieuw: "Film opnieuw afspelen" }[stand]);
  }

  if (knop) knop.addEventListener("click", function () {
    zelfGestopt = loopt;
    if (loopt) stop(); else speel();
  });

  // Voor de opname: video/opname.mjs zet zelf elk beeldje neer.
  window.iwrapFilm = { duur: DUUR, teken: function (t) { stop(); tijd = t; teken(t); } };

  // De opname begint niet vanzelf te lopen: die zet elk beeldje zelf neer.
  if (/[?&]opname\b/.test(location.search)) { teken(0); return; }

  var rustig = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (rustig || !("IntersectionObserver" in window)) {
    // Geen beweging gewenst: laat het eindbeeld zien, met een knop om toch te kijken.
    tijd = DUUR;
    teken(DUUR);
    werkKnop();
    return;
  }

  teken(0);
  werkKnop();
  // Speelt vanzelf af zodra hij goed in beeld is, en pauzeert als je wegscrolt.
  new IntersectionObserver(function (rijen) {
    rijen.forEach(function (rij) {
      if (rij.isIntersecting && !loopt && !zelfGestopt && tijd < DUUR) speel();
      else if (!rij.isIntersecting && loopt) stop();
    });
  }, { threshold: 0.55 }).observe(film);
})();
