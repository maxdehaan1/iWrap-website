/* ---------------------------------------------------------------------------
   Aanstrepen: de klant streept met zijn vinger op de foto aan wat er moet
   gebeuren.

   Twee stiften, zodat Max meteen ziet wat vast zit en wat opengaat:
     geel  het kozijn (de vaste delen: dorpels, stijlen)
     rood  een draairaam of deur (wat opengaat)
   Bovenin het scherm kiest de klant welke stift hij pakt; de gekozen stift is
   duidelijk gemarkeerd, en de uitleg zegt in één zin welke kleur wat is.

   Dat gebeurt op een eigen scherm dat de hele telefoon vult, niet in het
   formulier zelf. Op een foto in het formulier botst tekenen met scrollen:
   wie de pagina wil verschuiven, zet dan per ongeluk een streep. Op een eigen
   scherm is er maar één ding te doen, en is de foto zo groot mogelijk.

   Een streep is { k: "kozijn" | "draai", p: [[x, y], ...] }, met x en y als
   verhouding (0 tot 1) van de foto. Daardoor maakt het niet uit hoe groot de
   foto later getekend wordt: in het formulier, in het overzicht of op ware
   grootte voor de mail aan Max. Oude strepen (een kale lijst punten, van voor
   er twee kleuren waren) lezen we als geel.

   window.IwrapAanstrepen.open(blob, strepen) geeft een belofte terug met
   { strepen: [...], heel: false } -- of heel: true als de klant aangeeft dat
   het hele kozijn moet. samenstellen(blob, strepen) maakt de foto mét strepen
   en een kleine legenda als jpeg, voor de mail. kleuren(strepen) zegt welke
   stiften er gebruikt zijn.
   --------------------------------------------------------------------------- */
window.IwrapAanstrepen = (function () {
  "use strict";

  // Geel en rood als markeerstiften, met een donkere rand. Terracotta (de kleur
  // van "voor" op de rest van de site) viel weg tegen baksteen; met een rand
  // eromheen vallen geel en rood op baksteen, wit, crème en antraciet op.
  var STIFTEN = {
    kozijn: { kleur: "#ffd400", naam: "Kozijn", legenda: "kozijn" },
    draai: { kleur: "#e5212d", naam: "Draairaam of deur", legenda: "draairaam of deur" }
  };
  var RAND = "#1d1d1b";
  var DEKKING = 0.62;      // half doorzichtig: de foto blijft zichtbaar
  var DIKTE = 0.05;        // van de korte zijde van de foto

  var scherm, podium, fotoDoek, streepDoek, ongedaanKnop, wisKnop, penKnoppen;
  var beeld = null, strepen = [], huidig = null, klaar = null, vorigeFocus = null, pen = "kozijn";

  function normaal(lijst) {
    return (lijst || []).map(function (s) {
      return Array.isArray(s) ? { k: "kozijn", p: s.slice() } : { k: STIFTEN[s.k] ? s.k : "kozijn", p: s.p.slice() };
    }).filter(function (s) { return s.p.length; });
  }

  function kleuren(lijst) {
    var gebruikt = {};
    normaal(lijst).forEach(function (s) { gebruikt[s.k] = true; });
    return Object.keys(STIFTEN).filter(function (k) { return gebruikt[k]; });
  }

  function lijnPad(ctx, s, breedte, hoogte) {
    ctx.beginPath();
    s.p.forEach(function (p, i) {
      if (i) ctx.lineTo(p[0] * breedte, p[1] * hoogte);
      else ctx.moveTo(p[0] * breedte, p[1] * hoogte);
    });
    // Eén tik is ook een streep: een stip.
    if (s.p.length === 1) ctx.lineTo(s.p[0][0] * breedte + 0.1, s.p[0][1] * hoogte);
  }

  function tekenStrepen(ctx, breedte, hoogte, lijst) {
    ctx.clearRect(0, 0, breedte, hoogte);
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    var dikte = DIKTE * Math.min(breedte, hoogte);
    // Eerst alle randen, dan de kleuren: zo loopt een rand nooit dwars over
    // een streep die eroverheen gaat.
    ctx.strokeStyle = RAND;
    ctx.lineWidth = dikte * 1.22;
    lijst.forEach(function (s) { lijnPad(ctx, s, breedte, hoogte); ctx.stroke(); });
    ctx.lineWidth = dikte;
    lijst.forEach(function (s) {
      ctx.strokeStyle = STIFTEN[s.k].kleur;
      lijnPad(ctx, s, breedte, hoogte);
      ctx.stroke();
    });
  }

  function bouw() {
    scherm = document.createElement("div");
    scherm.className = "streepscherm";
    scherm.hidden = true;
    scherm.setAttribute("role", "dialog");
    scherm.setAttribute("aria-modal", "true");
    scherm.setAttribute("aria-labelledby", "streep-titel");
    var knoppen = Object.keys(STIFTEN).map(function (k) {
      return '<button type="button" class="streep-pen" data-pen="' + k + '" aria-pressed="false">' +
        '<span class="streep-stip" style="background:' + STIFTEN[k].kleur + '"></span>' + STIFTEN[k].naam + "</button>";
    }).join("");
    scherm.innerHTML =
      '<div class="streep-kop">' +
      '<p class="streep-titel" id="streep-titel">Streep aan wat er moet gebeuren</p>' +
      '<p class="streep-uitleg"><b class="geel">Geel</b> voor het kozijn, <b class="rood">rood</b> voor een ' +
      "draairaam of deur. Kies je stift en trek met je vinger een streep over wat hersteld moet worden.</p>" +
      '<div class="streep-pennen" role="group" aria-label="Welke stift">' + knoppen + "</div>" +
      "</div>" +
      '<div class="streep-podium"><canvas class="streep-foto"></canvas><canvas class="streep-laag"></canvas></div>' +
      '<div class="streep-onder">' +
      '<div class="streep-knoppen">' +
      '<button type="button" class="knop knop-tweede" data-doe="ongedaan">Ongedaan maken</button>' +
      '<button type="button" class="knop knop-tweede" data-doe="wis">Alles wissen</button>' +
      '<button type="button" class="knop knop-licht" data-doe="klaar">Klaar</button>' +
      "</div>" +
      '<button type="button" class="streep-heel" data-doe="heel">Moet het hele kozijn? Tik dan hier, ' +
      "dan hoef je niets aan te strepen.</button>" +
      "</div>";
    document.body.appendChild(scherm);

    podium = scherm.querySelector(".streep-podium");
    fotoDoek = scherm.querySelector(".streep-foto");
    streepDoek = scherm.querySelector(".streep-laag");
    ongedaanKnop = scherm.querySelector('[data-doe="ongedaan"]');
    wisKnop = scherm.querySelector('[data-doe="wis"]');
    penKnoppen = scherm.querySelectorAll(".streep-pen");
    streepDoek.style.opacity = String(DEKKING);

    scherm.addEventListener("click", function (e) {
      var penKnop = e.target.closest(".streep-pen");
      if (penKnop) { kiesPen(penKnop.dataset.pen); return; }
      var knop = e.target.closest("[data-doe]");
      if (!knop) return;
      var doe = knop.dataset.doe;
      if (doe === "ongedaan") { strepen.pop(); herteken(); }
      if (doe === "wis") { strepen = []; herteken(); }
      if (doe === "klaar") sluit(false);
      if (doe === "heel") sluit(true);
    });
    scherm.addEventListener("keydown", function (e) {
      if (e.key === "Escape") { e.preventDefault(); sluit(false); }
      // De focus blijft binnen het scherm zolang het open is.
      if (e.key === "Tab") {
        var alle = scherm.querySelectorAll("button:not([disabled])");
        var eerste = alle[0], laatste = alle[alle.length - 1];
        if (e.shiftKey && document.activeElement === eerste) { e.preventDefault(); laatste.focus(); }
        else if (!e.shiftKey && document.activeElement === laatste) { e.preventDefault(); eerste.focus(); }
      }
    });

    function punt(e) {
      var r = streepDoek.getBoundingClientRect();
      return [Math.max(0, Math.min(1, (e.clientX - r.left) / r.width)),
              Math.max(0, Math.min(1, (e.clientY - r.top) / r.height))];
    }
    streepDoek.addEventListener("pointerdown", function (e) {
      e.preventDefault();
      streepDoek.setPointerCapture(e.pointerId);
      huidig = { k: pen, p: [punt(e)] };
      strepen.push(huidig);
      herteken();
    });
    streepDoek.addEventListener("pointermove", function (e) {
      if (!huidig) return;
      // Met de tussenliggende punten wordt een snelle streep ook vloeiend.
      var reeks = e.getCoalescedEvents ? e.getCoalescedEvents() : [e];
      (reeks.length ? reeks : [e]).forEach(function (x) { huidig.p.push(punt(x)); });
      herteken();
    });
    ["pointerup", "pointercancel"].forEach(function (naam) {
      streepDoek.addEventListener(naam, function () { huidig = null; });
    });
    window.addEventListener("resize", function () { if (!scherm.hidden) maatvoering(); });
  }

  function kiesPen(k) {
    pen = STIFTEN[k] ? k : "kozijn";
    Array.prototype.forEach.call(penKnoppen, function (b) {
      b.setAttribute("aria-pressed", String(b.dataset.pen === pen));
    });
    scherm.dataset.stift = pen;   // niet data-pen: dat kenmerk is van de knoppen
  }

  // De foto zo groot mogelijk in het podium, met de juiste verhouding.
  function maatvoering() {
    var vrij = podium.getBoundingClientRect();
    var schaal = Math.min(vrij.width / beeld.width, vrij.height / beeld.height);
    var b = Math.max(1, Math.floor(beeld.width * schaal));
    var h = Math.max(1, Math.floor(beeld.height * schaal));
    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    [fotoDoek, streepDoek].forEach(function (doek) {
      doek.style.width = b + "px";
      doek.style.height = h + "px";
      doek.width = Math.round(b * dpr);
      doek.height = Math.round(h * dpr);
    });
    fotoDoek.getContext("2d").drawImage(beeld, 0, 0, fotoDoek.width, fotoDoek.height);
    herteken();
  }

  function herteken() {
    tekenStrepen(streepDoek.getContext("2d"), streepDoek.width, streepDoek.height, strepen);
    ongedaanKnop.disabled = !strepen.length;
    wisKnop.disabled = !strepen.length;
  }

  function sluit(heel) {
    scherm.hidden = true;
    document.documentElement.classList.remove("streep-open");
    if (vorigeFocus && vorigeFocus.focus) vorigeFocus.focus();
    var uitkomst = { strepen: heel ? [] : normaal(strepen), heel: heel };
    var terug = klaar;
    klaar = null;
    if (terug) terug(uitkomst);
  }

  function open(blob, bestaand) {
    if (!scherm) bouw();
    vorigeFocus = document.activeElement;
    return window.IwrapFotos.laadBeeld(blob).then(function (b) {
      beeld = b;
      strepen = normaal(bestaand);
      kiesPen("kozijn");
      scherm.hidden = false;
      document.documentElement.classList.add("streep-open");
      maatvoering();
      scherm.querySelector('[data-doe="klaar"]').focus();
      return new Promise(function (ok) { klaar = ok; });
    });
  }

  // Rechtsonder een kleine legenda met de kleuren die gebruikt zijn, zodat de
  // foto ook los (in de mail, in een map) te begrijpen is.
  function tekenLegenda(ctx, w, h, gebruikt) {
    if (!gebruikt.length) return;
    var maat = Math.max(13, Math.round(Math.min(w, h) * 0.032));
    ctx.font = "600 " + maat + "px -apple-system, 'Segoe UI', Arial, sans-serif";
    var regels = gebruikt.map(function (k) { return { k: k, tekst: STIFTEN[k].legenda }; });
    var breedste = Math.max.apply(null, regels.map(function (r) { return ctx.measureText(r.tekst).width; }));
    var vak = maat * 1.1, rand = maat * 0.7, regel = maat * 1.55;
    var bw = rand * 2 + vak + maat * 0.6 + breedste, bh = rand * 2 + regel * regels.length - (regel - vak);
    var x = w - bw - maat, y = h - bh - maat;
    ctx.globalAlpha = 0.9;
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(x, y, bw, bh);
    ctx.globalAlpha = 1;
    regels.forEach(function (r, i) {
      var ry = y + rand + i * regel;
      ctx.fillStyle = RAND;
      ctx.fillRect(x + rand - 1, ry - 1, vak + 2, vak + 2);
      ctx.fillStyle = STIFTEN[r.k].kleur;
      ctx.fillRect(x + rand, ry, vak, vak);
      ctx.fillStyle = "#1d1d1b";
      ctx.textBaseline = "middle";
      ctx.fillText(r.tekst, x + rand + vak + maat * 0.6, ry + vak / 2);
    });
  }

  // De foto met de strepen erop, als jpeg. maxZijde voor een kleinere versie
  // (het voorbeeld in het formulier, zonder legenda); zonder maxZijde op ware
  // grootte, met legenda, voor de mail.
  function samenstellen(blob, lijst, maxZijde) {
    var schoon = normaal(lijst);
    return window.IwrapFotos.laadBeeld(blob).then(function (b) {
      var schaal = maxZijde ? Math.min(1, maxZijde / Math.max(b.width, b.height)) : 1;
      var w = Math.round(b.width * schaal), h = Math.round(b.height * schaal);
      var doek = document.createElement("canvas");
      doek.width = w; doek.height = h;
      var ctx = doek.getContext("2d");
      ctx.drawImage(b, 0, 0, w, h);
      var laag = document.createElement("canvas");
      laag.width = w; laag.height = h;
      tekenStrepen(laag.getContext("2d"), w, h, schoon);
      ctx.globalAlpha = DEKKING;
      ctx.drawImage(laag, 0, 0);
      ctx.globalAlpha = 1;
      if (!maxZijde) tekenLegenda(ctx, w, h, kleuren(schoon));
      return new Promise(function (ok, fout) {
        doek.toBlob(function (x) { if (x) ok(x); else fout(new Error("mislukt")); }, "image/jpeg", 0.85);
      });
    });
  }

  return { open: open, samenstellen: samenstellen, kleuren: kleuren, STIFTEN: STIFTEN };
})();
