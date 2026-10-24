/* ---------------------------------------------------------------------------
   De doorsnede (src/doorsnede.html): speelt de drie standen één keer af als
   hij in beeld komt, en blijft dan op de nieuwe folie staan. Een klik op een
   stap zet hem daar neer. Wie "minder beweging" aan heeft, ziet meteen het
   eindbeeld en kan zelf door de stappen klikken.

   Let op bij bewerken: Nederlandse teksten met een apostrof altijd tussen
   dubbele aanhalingstekens. build.py controleert dat.
   --------------------------------------------------------------------------- */
(function () {
  "use strict";

  var PER_STAP = 2600;  // ms; gelijk aan de animatie van het balkje in doorsnede.css

  document.querySelectorAll("[data-doorsnede]").forEach(function (fig) {
    var knoppen = fig.querySelectorAll("[data-naar]");
    var weinigBeweging = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    var klok = null;

    function zet(n) {
      fig.dataset.stand = String(n);
      knoppen.forEach(function (k) {
        if (+k.dataset.naar === n) k.setAttribute("aria-current", "step");
        else k.removeAttribute("aria-current");
      });
    }
    function stop() {
      clearTimeout(klok);
      klok = null;
      fig.classList.remove("ds-speelt");
    }
    function speel() {
      stop();
      fig.classList.add("ds-speelt");
      zet(1);
      klok = setTimeout(function () {
        zet(2);
        klok = setTimeout(function () { zet(3); stop(); }, PER_STAP);
      }, PER_STAP);
    }

    knoppen.forEach(function (k) {
      k.addEventListener("click", function () { stop(); zet(+k.dataset.naar); });
    });
    var opnieuw = fig.querySelector(".ds-opnieuw");
    if (opnieuw) opnieuw.addEventListener("click", speel);

    zet(3);
    if (weinigBeweging || !("IntersectionObserver" in window)) return;

    // Klaarzetten op stand 1, zonder dat je hem eerst ziet terugspoelen.
    fig.classList.add("ds-direct");
    zet(1);
    fig.getBoundingClientRect();
    fig.classList.remove("ds-direct");

    var kijker = new IntersectionObserver(function (rijen) {
      if (!rijen[0].isIntersecting) return;
      kijker.disconnect();
      klok = setTimeout(speel, 350);
    }, { threshold: 0.55 });
    kijker.observe(fig);
  });
})();
