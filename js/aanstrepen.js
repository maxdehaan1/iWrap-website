/* ---------------------------------------------------------------------------
   Aanstrepen: de klant streept met zijn vinger op de foto aan wat er moet
   gebeuren.

   Dat gebeurt op een eigen scherm dat de hele telefoon vult, niet in het
   formulier zelf. Op een foto in het formulier botst tekenen met scrollen:
   wie de pagina wil verschuiven, zet dan per ongeluk een streep. Op een eigen
   scherm is er maar één ding te doen, en is de foto zo groot mogelijk.

   De strepen worden bewaard als lijnen in verhoudingen (0 tot 1) van de foto.
   Daardoor maakt het niet uit hoe groot de foto later getekend wordt: in het
   formulier, in het overzicht of op ware grootte voor de mail aan Max.

   window.IwrapAanstrepen.open(blob, strepen) geeft een belofte terug met
   { strepen: [...], heel: false } -- of heel: true als de klant aangeeft dat
   het hele kozijn moet. samenstellen(blob, strepen) maakt de foto mét strepen
   als jpeg, voor de mail.
   --------------------------------------------------------------------------- */
window.IwrapAanstrepen = (function () {
  "use strict";

  // Geel als een markeerstift, met een donkere rand. Terracotta (de kleur van
  // "voor" op de rest van de site) viel weg tegen baksteen, en daar zitten de
  // meeste kozijnen in. Geel met een rand valt op baksteen, wit, crème en
  // antraciet allemaal op.
  var KLEUR = "#ffd400";
  var RAND = "#1d1d1b";
  var DEKKING = 0.62;      // half doorzichtig: de foto blijft zichtbaar
  var DIKTE = 0.05;        // van de korte zijde van de foto

  var scherm, podium, fotoDoek, streepDoek, ongedaanKnop, wisKnop;
  var beeld = null, strepen = [], huidig = null, klaar = null, vorigeFocus = null;

  function tekenStrepen(ctx, breedte, hoogte, lijst) {
    ctx.clearRect(0, 0, breedte, hoogte);
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    var dikte = DIKTE * Math.min(breedte, hoogte);
    // Eerst alle randen, dan al het geel: zo loopt een rand nooit dwars over
    // een streep die eroverheen gaat.
    [[RAND, dikte * 1.22], [KLEUR, dikte]].forEach(function (laag) {
      ctx.strokeStyle = laag[0];
      ctx.lineWidth = laag[1];
      lijst.forEach(function (lijn) {
        ctx.beginPath();
        lijn.forEach(function (p, i) {
          if (i) ctx.lineTo(p[0] * breedte, p[1] * hoogte);
          else ctx.moveTo(p[0] * breedte, p[1] * hoogte);
        });
        // Eén tik is ook een streep: een stip.
        if (lijn.length === 1) ctx.lineTo(lijn[0][0] * breedte + 0.1, lijn[0][1] * hoogte);
        ctx.stroke();
      });
    });
  }

  function bouw() {
    scherm = document.createElement("div");
    scherm.className = "streepscherm";
    scherm.hidden = true;
    scherm.setAttribute("role", "dialog");
    scherm.setAttribute("aria-modal", "true");
    scherm.setAttribute("aria-labelledby", "streep-titel");
    scherm.innerHTML =
      '<div class="streep-kop">' +
      '<p class="streep-titel" id="streep-titel">Streep aan wat er moet gebeuren</p>' +
      '<p class="streep-uitleg">Trek met je vinger een streep over de delen die hersteld moeten ' +
      "worden. Dikke strepen zijn prima.</p>" +
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
    streepDoek.style.opacity = String(DEKKING);

    scherm.addEventListener("click", function (e) {
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
        var knoppen = scherm.querySelectorAll("button");
        var eerste = knoppen[0], laatste = knoppen[knoppen.length - 1];
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
      huidig = [punt(e)];
      strepen.push(huidig);
      herteken();
    });
    streepDoek.addEventListener("pointermove", function (e) {
      if (!huidig) return;
      // Met de tussenliggende punten wordt een snelle streep ook vloeiend.
      var reeks = e.getCoalescedEvents ? e.getCoalescedEvents() : [e];
      (reeks.length ? reeks : [e]).forEach(function (x) { huidig.push(punt(x)); });
      herteken();
    });
    ["pointerup", "pointercancel"].forEach(function (naam) {
      streepDoek.addEventListener(naam, function () { huidig = null; });
    });
    window.addEventListener("resize", function () { if (!scherm.hidden) maatvoering(); });
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
    var uitkomst = { strepen: heel ? [] : strepen.filter(function (l) { return l.length; }), heel: heel };
    var terug = klaar;
    klaar = null;
    if (terug) terug(uitkomst);
  }

  function open(blob, bestaand) {
    if (!scherm) bouw();
    vorigeFocus = document.activeElement;
    return window.IwrapFotos.laadBeeld(blob).then(function (b) {
      beeld = b;
      strepen = (bestaand || []).map(function (l) { return l.slice(); });
      scherm.hidden = false;
      document.documentElement.classList.add("streep-open");
      maatvoering();
      scherm.querySelector('[data-doe="klaar"]').focus();
      return new Promise(function (ok) { klaar = ok; });
    });
  }

  // De foto met de strepen erop, als jpeg. maxZijde voor een kleinere versie
  // (het voorbeeld in het formulier); zonder maxZijde op ware grootte.
  function samenstellen(blob, lijst, maxZijde) {
    return window.IwrapFotos.laadBeeld(blob).then(function (b) {
      var schaal = maxZijde ? Math.min(1, maxZijde / Math.max(b.width, b.height)) : 1;
      var w = Math.round(b.width * schaal), h = Math.round(b.height * schaal);
      var doek = document.createElement("canvas");
      doek.width = w; doek.height = h;
      var ctx = doek.getContext("2d");
      ctx.drawImage(b, 0, 0, w, h);
      var laag = document.createElement("canvas");
      laag.width = w; laag.height = h;
      tekenStrepen(laag.getContext("2d"), w, h, lijst);
      ctx.globalAlpha = DEKKING;
      ctx.drawImage(laag, 0, 0);
      return new Promise(function (ok, fout) {
        doek.toBlob(function (x) { if (x) ok(x); else fout(new Error("mislukt")); }, "image/jpeg", 0.85);
      });
    });
  }

  return { open: open, samenstellen: samenstellen };
})();
