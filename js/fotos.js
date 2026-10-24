/* ---------------------------------------------------------------------------
   Foto's voor de offerteaanvraag.

   1. Verkleinen, op de telefoon zelf. Een telefoonfoto is 3 tot 12 MB; na
      verkleinen tot 1600 pixels is hij rond de 300 kB. Dat verstuurt ook op
      een matige verbinding, en het is meer dan genoeg om een kozijn op te
      beoordelen. De foto wordt meteen rechtop gezet (een staande foto blijft
      staand).
   2. Bewaren in de browser (IndexedDB), zodat ze er na herladen of later
      terugkomen nog zijn. Er gaat niets naar de server tot de klant op
      "Aanvraag versturen" drukt.

   Gebruikt door js/offerte.js en js/aanstrepen.js, via window.IwrapFotos.
   --------------------------------------------------------------------------- */
window.IwrapFotos = (function () {
  "use strict";

  var MAX_ZIJDE = 1600;
  var KWALITEIT = 0.82;
  var MAX_BYTES = 900 * 1024;   // de server neemt tot 1,5 MB aan

  function laadImg(bron) {
    return new Promise(function (ok, fout) {
      var url = URL.createObjectURL(bron);
      var img = new Image();
      img.onload = function () { URL.revokeObjectURL(url); ok(img); };
      img.onerror = function () { URL.revokeObjectURL(url); fout(new Error("onleesbaar")); };
      img.src = url;
    });
  }

  // createImageBitmap zet de foto rechtop volgens de EXIF-gegevens. Waar dat
  // niet kan, doet een gewone <img> het (moderne browsers doen dat ook goed).
  function laadBeeld(bron) {
    if (window.createImageBitmap) {
      return createImageBitmap(bron, { imageOrientation: "from-image" })
        .catch(function () { return laadImg(bron); });
    }
    return laadImg(bron);
  }

  function naarJpeg(beeld, maxZijde, kwaliteit) {
    var schaal = Math.min(1, maxZijde / Math.max(beeld.width, beeld.height));
    var c = document.createElement("canvas");
    c.width = Math.round(beeld.width * schaal);
    c.height = Math.round(beeld.height * schaal);
    var ctx = c.getContext("2d");
    ctx.fillStyle = "#fff";   // een png met doorzichtige stukken wordt anders zwart
    ctx.fillRect(0, 0, c.width, c.height);
    ctx.drawImage(beeld, 0, 0, c.width, c.height);
    return new Promise(function (ok, fout) {
      c.toBlob(function (blob) {
        if (blob) ok(blob); else fout(new Error("mislukt"));
      }, "image/jpeg", kwaliteit);
    });
  }

  function verklein(bestand) {
    return laadBeeld(bestand).then(function (beeld) {
      return naarJpeg(beeld, MAX_ZIJDE, KWALITEIT).then(function (blob) {
        return blob.size <= MAX_BYTES ? blob : naarJpeg(beeld, 1280, 0.72);
      });
    });
  }

  /* Bewaren in de browser ------------------------------------------------ */

  var db = null;

  function open() {
    if (!db) {
      db = new Promise(function (ok, fout) {
        try {
          var r = indexedDB.open("iwrap-offerte", 1);
          r.onupgradeneeded = function () { r.result.createObjectStore("fotos"); };
          r.onsuccess = function () { ok(r.result); };
          r.onerror = function () { fout(r.error); };
        } catch (e) { fout(e); }
      });
    }
    return db;
  }

  function actie(modus, doe) {
    return open().then(function (d) {
      return new Promise(function (ok, fout) {
        var tx = d.transaction("fotos", modus);
        var verzoek = doe(tx.objectStore("fotos"));
        tx.oncomplete = function () { ok(verzoek ? verzoek.result : undefined); };
        tx.onerror = function () { fout(tx.error); };
      });
    });
  }

  // Lukt bewaren niet (privévenster), dan werkt alles gewoon door; alleen
  // overleven de foto's dan geen herladen.
  return {
    laadBeeld: laadBeeld,
    verklein: verklein,
    bewaar: function (sleutel, blob) {
      return actie("readwrite", function (s) { return s.put(blob, sleutel); }).catch(function () {});
    },
    haal: function (sleutel) {
      return actie("readonly", function (s) { return s.get(sleutel); }).catch(function () { return null; });
    },
    wis: function (sleutel) {
      return actie("readwrite", function (s) { return s.delete(sleutel); }).catch(function () {});
    },
    wisAlles: function () {
      return actie("readwrite", function (s) { return s.clear(); }).catch(function () {});
    }
  };
})();
