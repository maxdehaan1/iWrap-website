/* ---------------------------------------------------------------------------
   Max-modus (/max): het invulscherm voor op locatie.

   Per klus: de klant, wat er gedaan is, de kozijncheck (zes onderdelen, één
   tik per onderdeel), en de ramen voor de horren. Alles slaat vanzelf op, ook
   als er even geen bereik is: dan bewaart de telefoon het en gaat het later
   alsnog naar de server. Daarnaast een lijst met horrenbestellingen.

   Opbouw: kleine helper h() maakt elementen (nooit innerHTML met klantgegevens),
   elk scherm is een functie die #app vult, de route staat in de hash:
     #            klussen          #klus/<id>        een klus
     #bestellingen                 #bestelling/<nr>  een bestelling

   Let op bij bewerken: teksten met een apostrof tussen dubbele aanhalingstekens,
   en geen geneste `template strings` -- build.py controleert de strings.
   --------------------------------------------------------------------------- */
(function () {
  "use strict";

  const APP = document.getElementById("app");
  const TOKEN_SLEUTEL = "iwrap-max-token";
  let token = lees(TOKEN_SLEUTEL) || "";
  let status = null;       // /api/max/status: instellingen, kozijncheck, horren
  let klus = null;         // de klus die open staat
  let opslaanTimer = null;
  let bezigMetOpslaan = false;
  let nogEensOpslaan = false;

  // --- Kleine hulpjes -----------------------------------------------------

  function lees(k) { try { return localStorage.getItem(k); } catch (e) { return null; } }
  function schrijf(k, v) { try { if (v == null) localStorage.removeItem(k); else localStorage.setItem(k, v); } catch (e) {} }

  function h(tag, attrs) {
    const delen = tag.split(".");
    const e = document.createElement(delen[0] || "div");
    if (delen.length > 1) e.className = delen.slice(1).join(" ");
    if (attrs) {
      Object.keys(attrs).forEach(function (k) {
        const v = attrs[k];
        if (v == null || v === false) return;
        if (k.slice(0, 2) === "on") e.addEventListener(k.slice(2), v);
        else if (k === "class") e.className = (e.className + " " + v).trim();
        else if (k === "style") e.style.cssText = v;
        else if (k === "value" || k === "checked" || k === "hidden" || k === "disabled" || k === "textContent") e[k] = v;
        else e.setAttribute(k, v === true ? "" : v);
      });
    }
    for (let i = 2; i < arguments.length; i++) voegToe(e, arguments[i]);
    return e;
  }
  function voegToe(e, kind) {
    if (kind == null || kind === false) return;
    if (Array.isArray(kind)) { kind.forEach(function (k) { voegToe(e, k); }); return; }
    e.append(kind.nodeType ? kind : document.createTextNode(String(kind)));
  }
  function leeg(e) { while (e.firstChild) e.removeChild(e.firstChild); return e; }

  function euro(n) { return "€ " + Number(n).toLocaleString("nl-NL", { maximumFractionDigits: 2 }); }
  function datumKort(ts) {
    const d = typeof ts === "number" ? new Date(ts * 1000) : new Date(ts + "T12:00:00");
    return d.toLocaleDateString("nl-NL", { day: "numeric", month: "short" });
  }
  function vandaag() { return new Date().toISOString().slice(0, 10); }
  function nieuweId() { return Math.random().toString(36).slice(2, 8); }

  function melding(tekst, soort) {
    const m = h("div.max-toast" + (soort ? "." + soort : ""), { role: "status" }, tekst);
    document.body.append(m);
    setTimeout(function () { m.classList.add("weg"); }, 2600);
    setTimeout(function () { m.remove(); }, 3200);
  }

  function api(methode, pad, data) {
    const opties = { method: methode, headers: { Authorization: "Bearer " + token } };
    if (data !== undefined) {
      opties.headers["Content-Type"] = "application/json";
      opties.body = JSON.stringify(data);
    }
    return fetch("/api" + pad, opties).then(function (r) {
      return r.json().catch(function () { return {}; }).then(function (j) {
        if (r.status === 401 && pad !== "/max/login") { uitloggen(); throw new Error("Log opnieuw in."); }
        if (!r.ok) { const f = new Error(j.fout || "Er ging iets mis."); f.status = r.status; f.data = j; throw f; }
        return j;
      });
    });
  }

  function uitloggen() {
    token = "";
    schrijf(TOKEN_SLEUTEL, null);
    toonLogin();
  }

  // --- Start --------------------------------------------------------------

  function start() {
    if (!token) { toonLogin(); return; }
    api("GET", "/max/status").then(function (s) {
      status = s;
      window.addEventListener("hashchange", route);
      window.addEventListener("online", function () { if (klus && klus._vuil) opslaan(); });
      route();
    }).catch(function (e) {
      if (e.message !== "Log opnieuw in.") {
        leeg(APP).append(h("div.max-kaart", null, h("h2", null, "Geen verbinding"),
          h("p", null, e.message), h("button.knop.knop-primair", { type: "button", onclick: start }, "Opnieuw proberen")));
      }
    });
  }

  function route() {
    bewaarVoorVertrek();
    const hash = location.hash.replace(/^#/, "");
    const delen = hash.split("/");
    window.scrollTo(0, 0);
    if (delen[0] === "klus" && delen[1]) return toonKlus(delen[1]);
    if (delen[0] === "bestelling" && delen[1]) return toonBestelling(delen[1]);
    if (delen[0] === "bestellingen") return toonOverzicht("bestellingen");
    return toonOverzicht("klussen");
  }

  function bewaarVoorVertrek() {
    if (klus && klus._vuil) { clearTimeout(opslaanTimer); opslaan(); }
  }
  window.addEventListener("beforeunload", function (e) {
    if (klus && klus._vuil) { bewaarLokaal(); e.preventDefault(); e.returnValue = ""; }
  });

  // --- Inloggen -----------------------------------------------------------

  function toonLogin() {
    const veld = h("input", { type: "password", id: "ww", autocomplete: "current-password", required: true });
    const fout = h("p.max-fout", { hidden: true });
    const form = h("form.max-kaart.max-login", {
      onsubmit: function (e) {
        e.preventDefault();
        fout.hidden = true;
        api("POST", "/max/login", { wachtwoord: veld.value }).then(function (j) {
          token = j.token;
          schrijf(TOKEN_SLEUTEL, token);
          start();
        }).catch(function (err) { fout.textContent = err.message; fout.hidden = false; });
      }
    },
      h("h1", null, "Max-modus"),
      h("p", null, "Kozijncheck, opleverrapport en de bestellingen van kozijnhorren.nl."),
      h("label", { for: "ww" }, "Wachtwoord"), veld, fout,
      h("button.knop.knop-primair", { type: "submit" }, "Inloggen"));
    leeg(APP).append(form);
    veld.focus();
  }

  // --- Overzicht ----------------------------------------------------------

  function toonOverzicht(tab) {
    klus = null;
    const inhoud = h("div.max-lijst", null, h("p.max-laden", null, "Laden…"));
    voegToe(leeg(APP), [
      h("div.max-tabs", { role: "tablist" },
        h("a" + (tab === "klussen" ? ".actief" : ""), { href: "#", role: "tab" }, "Klussen"),
        h("a" + (tab === "bestellingen" ? ".actief" : ""), { href: "#bestellingen", role: "tab" }, "Kozijnhorren")),
      statusBalk(),
      tab === "klussen" ? h("button.knop.knop-primair.max-nieuw", { type: "button", onclick: nieuweKlus }, "+ Nieuwe klus") : null,
      inhoud,
      h("p.max-voet", null, h("button.linkknop", { type: "button", onclick: uitloggen }, "Uitloggen"))]);

    if (tab === "klussen") {
      api("GET", "/max/rapporten").then(function (j) {
        leeg(inhoud);
        if (!j.rapporten.length) inhoud.append(h("p.max-leeg", null, "Nog geen klussen. Begin met ‘Nieuwe klus’ zodra je op locatie bent."));
        j.rapporten.forEach(function (r) {
          const chips = [];
          chips.push(h("span.chip." + (r.status === "klaar" ? "chip-groen" : "chip-grijs"), null, r.status === "klaar" ? "Rapport klaar" : "Concept"));
          if (r.rood) chips.push(h("span.chip.chip-rood", null, r.rood + " rood"));
          if (r.oranje) chips.push(h("span.chip.chip-oranje", null, r.oranje + " oranje"));
          inhoud.append(h("a.max-regel", { href: "#klus/" + r.id },
            h("span.max-regel-titel", null, r.naam || "Naamloze klus"),
            h("span.max-regel-sub", null, [r.straat, r.plaats].filter(Boolean).join(", ") || "Geen adres", " · ", r.datum ? datumKort(r.datum) : ""),
            h("span.max-chips", null, chips)));
        });
      }).catch(function (e) { leeg(inhoud).append(h("p.max-fout", null, e.message)); });
    } else {
      api("GET", "/max/bestellingen").then(function (j) {
        leeg(inhoud);
        if (!j.bestellingen.length) inhoud.append(h("p.max-leeg", null, "Nog geen bestellingen."));
        j.bestellingen.forEach(function (b) {
          inhoud.append(h("a.max-regel", { href: "#bestelling/" + b.nr },
            h("span.max-regel-titel", null, b.nr + " · " + (b.naam || "")),
            h("span.max-regel-sub", null, (b.plaats || "") + " · " + b.horren + (b.horren === 1 ? " hor" : " horren") + " · " + euro(b.totaal) + " · " + datumKort(b.gemaakt)),
            h("span.max-chips", null, statusChip(b.status))));
        });
      }).catch(function (e) { leeg(inhoud).append(h("p.max-fout", null, e.message)); });
    }
  }

  const STATUSNAAM = { open: "Wacht op betaling", betaald: "Betaald, nog doorsturen", besteld: "Bij leverancier",
    verzonden: "Verzonden", afgerond: "Afgerond", mislukt: "Niet betaald", geannuleerd: "Geannuleerd" };
  const STATUSKLEUR = { open: "grijs", betaald: "oranje", besteld: "groen", verzonden: "groen", afgerond: "grijs", mislukt: "grijs", geannuleerd: "grijs" };
  function statusChip(s) { return h("span.chip.chip-" + (STATUSKLEUR[s] || "grijs"), null, STATUSNAAM[s] || s); }

  function statusBalk() {
    const s = status;
    const waarschuwingen = [];
    if (s.omgeving === "vercel" && s.opslag !== "redis") waarschuwingen.push("Opslag is niet gekoppeld: wat je invult is over een paar minuten weg. Koppel Upstash Redis in Vercel.");
    if (s.omgeving === "vercel" && s.mail === "uitbak") waarschuwingen.push("Mail is niet gekoppeld: klanten krijgen geen mail. Zet MAIL_WEBHOOK_URL in Vercel.");
    if (s.betalen === "testkassa" && s.omgeving === "vercel") waarschuwingen.push("Betalen is niet gekoppeld (MOLLIE_API_KEY).");
    if (s.voorbeeldprijzen) waarschuwingen.push("De horrenprijzen zijn nog voorbeeldprijzen.");
    const regels = [
      ["Opslag", s.opslag === "redis" ? "Upstash Redis" : "bestanden (" + s.omgeving + ")"],
      ["Betalen", { "mollie-live": "Mollie (live)", "mollie-test": "Mollie (testmodus)", testkassa: "testkassa" }[s.betalen]],
      ["Mail", { make: "via Make / Outlook", resend: "via Resend", uitbak: "niet gekoppeld (uitbak)" }[s.mail]],
      ["Leverancier", s.leverancier + (s.leverancier_automatisch ? " (automatisch)" : " (na jouw akkoord)")],
    ];
    return h("details.max-status" + (waarschuwingen.length ? ".let" : ""), null,
      h("summary", null, waarschuwingen.length ? "Let op: " + waarschuwingen.length + (waarschuwingen.length === 1 ? " punt" : " punten") : "Alles gekoppeld"),
      waarschuwingen.length ? h("ul", null, waarschuwingen.map(function (w) { return h("li", null, w); })) : null,
      h("dl", null, regels.map(function (r) { return [h("dt", null, r[0]), h("dd", null, r[1])]; })));
  }

  function nieuweKlus() {
    api("POST", "/max/rapporten", {}).then(function (r) { location.hash = "klus/" + r.id; })
      .catch(function (e) { melding(e.message, "fout"); });
  }

  // --- Een klus -----------------------------------------------------------

  function lokaalSleutel(id) { return "iwrap-klus-" + id; }
  function bewaarLokaal() { if (klus) schrijf(lokaalSleutel(klus.id), JSON.stringify(klus)); }

  function toonKlus(id) {
    leeg(APP).append(h("p.max-laden", null, "Klus laden…"));
    api("GET", "/max/rapporten/" + id).then(function (r) {
      const lokaal = lees(lokaalSleutel(id));
      if (lokaal) {
        try {
          const l = JSON.parse(lokaal);
          // Staat er op dit toestel iets wat nog niet op de server kwam? Dan wint dat.
          if (l._vuil && l._versie === r.versie) { r = l; }
          else schrijf(lokaalSleutel(id), null);
        } catch (e) { schrijf(lokaalSleutel(id), null); }
      }
      klus = r;
      if (klus._versie == null) klus._versie = r.versie || 0;
      bouwKlus();
      if (klus._vuil) opslaan();
    }).catch(function (e) {
      const lokaal = lees(lokaalSleutel(id));
      if (lokaal) {
        klus = JSON.parse(lokaal);
        bouwKlus();
        zetOpslagStatus("offline");
        return;
      }
      leeg(APP).append(h("div.max-kaart", null, h("p.max-fout", null, e.message), h("a.knop.knop-tweede", { href: "#" }, "Terug")));
    });
  }

  function gewijzigd() {
    klus._vuil = true;
    bewaarLokaal();
    zetOpslagStatus("wacht");
    clearTimeout(opslaanTimer);
    opslaanTimer = setTimeout(opslaan, 1200);
    werkAfrondingBij();
  }

  function opslaan() {
    if (!klus) return Promise.resolve();
    if (bezigMetOpslaan) { nogEensOpslaan = true; return Promise.resolve(); }
    bezigMetOpslaan = true;
    zetOpslagStatus("bezig");
    const verstuur = Object.assign({}, klus);
    delete verstuur._link; delete verstuur._samenvatting; delete verstuur._vuil;
    return api("PUT", "/max/rapporten/" + klus.id, verstuur).then(function (r) {
      klus._versie = r.versie;
      klus.versie = r.versie;
      klus.bijgewerkt = r.bijgewerkt;
      klus.status = r.status;
      klus._link = r._link;
      klus._samenvatting = r._samenvatting;
      klus._vuil = false;
      schrijf(lokaalSleutel(klus.id), null);
      zetOpslagStatus("klaar");
      werkAfrondingBij();
    }).catch(function (e) {
      if (e.status === 409) {
        if (confirm("Deze klus is intussen op een ander apparaat gewijzigd. Wil je jouw versie bewaren? (Annuleren laadt de andere versie.)")) {
          klus._versie = e.data.server.versie;
          nogEensOpslaan = true;
        } else {
          schrijf(lokaalSleutel(klus.id), null);
          klus = null;
          route();
        }
        return;
      }
      zetOpslagStatus("offline");
      setTimeout(function () { if (klus && klus._vuil) opslaan(); }, 15000);
    }).then(function () {
      bezigMetOpslaan = false;
      if (nogEensOpslaan) { nogEensOpslaan = false; opslaan(); }
    });
  }

  function zetOpslagStatus(s) {
    const el = document.getElementById("opslagstatus");
    if (!el) return;
    el.className = "opslagstatus " + s;
    el.textContent = { wacht: "Wijziging…", bezig: "Opslaan…", klaar: "Opgeslagen", offline: "Geen bereik: bewaard op dit toestel" }[s];
  }

  function invoer(label, pad, opties) {
    opties = opties || {};
    const id = "v-" + pad.join("-");
    const huidig = pad.reduce(function (o, k) { return o ? o[k] : ""; }, klus);
    const veld = h(opties.meerregelig ? "textarea" : "input", {
      id: id, type: opties.type || "text", value: huidig == null ? "" : huidig,
      autocomplete: opties.autocomplete || "off", inputmode: opties.inputmode, rows: opties.meerregelig ? 3 : null,
      placeholder: opties.placeholder, enterkeyhint: "next",
      oninput: function (e) {
        const doel = pad.slice(0, -1).reduce(function (o, k) { return o[k]; }, klus);
        doel[pad[pad.length - 1]] = e.target.value;
        gewijzigd();
        if (opties.bijWijzigen) opties.bijWijzigen(e.target.value);
      }
    });
    return h("div.veld" + (opties.breed ? ".breed" : ""), null, h("label", { for: id }, label), veld);
  }

  function bouwKlus() {
    const k = klus;
    k.klant = k.klant || {};
    k.oplevering = k.oplevering || {};
    k.check = k.check || {};

    leeg(APP).append(
      h("div.max-balk", null,
        h("a.terug", { href: "#", "aria-label": "Terug naar de klussen" }, "‹ Klussen"),
        h("span.opslagstatus.klaar", { id: "opslagstatus" }, "Opgeslagen")),

      h("section.max-kaart", null,
        h("h2", null, "Klant"),
        h("div.velden", null,
          invoer("Naam", ["klant", "naam"], { breed: true, autocomplete: "name" }),
          invoer("Straat en huisnummer", ["klant", "straat"], { breed: true }),
          invoer("Postcode", ["klant", "postcode"], {}),
          invoer("Plaats", ["klant", "plaats"], {}),
          invoer("Telefoon", ["klant", "telefoon"], { type: "tel", inputmode: "tel", breed: true, autocomplete: "tel" }),
          invoer("E-mail", ["klant", "email"], { type: "email", inputmode: "email", breed: true, autocomplete: "email" }))),

      h("section.max-kaart", null,
        h("h2", null, "Oplevering"),
        h("div.velden", null,
          invoer("Datum", ["oplevering", "datum"], { type: "date", breed: true }),
          folieKeuze(),
          invoer("Wat hebben we gedaan?", ["oplevering", "werk"], { meerregelig: true, breed: true,
            placeholder: "Bijv. 4 kozijnen voorgevel, onderdorpels achterzijde" }))),

      h("section.max-kaart", { id: "kaart-check" },
        h("div.kaart-kop", null, h("h2", null, "Kozijncheck"),
          h("button.knop-klein", { type: "button", onclick: allesGroen }, "Rest op groen")),
        h("p.uitleg", null, "Eén tik per onderdeel. Alleen bij oranje en rood een foto en een korte notitie."),
        h("div", { id: "checklijst" })),

      h("section.max-kaart", null,
        h("h2", null, "Interne notitie"),
        h("p.uitleg", null, "Alleen voor jou; de klant ziet dit niet."),
        h("div.velden", null, invoer("Notitie", ["notitie_intern"], { meerregelig: true, breed: true }))),

      h("section.max-kaart.afronden", { id: "afronden" }),

      h("p.max-voet", null, h("button.linkknop.gevaar", { type: "button", onclick: verwijderKlus }, "Klus verwijderen")));

    bouwCheck();
    werkAfrondingBij();
  }

  function folieKeuze() {
    const folies = status.folies;
    const k = klus.oplevering;
    const bekend = folies.some(function (f) { return f.naam === k.folie; });
    const anders = h("div.veld.breed", { hidden: bekend || !k.folie },
      h("label", { for: "v-folie-anders" }, "Welke folie?"),
      h("input", { id: "v-folie-anders", value: bekend ? "" : (k.folie || ""), oninput: function (e) { k.folie = e.target.value; gewijzigd(); } }));
    const select = h("select", { id: "v-folie", onchange: function (e) {
      const v = e.target.value;
      if (v === "__anders") { anders.hidden = false; k.folie = ""; k.folie_ral = ""; }
      else {
        anders.hidden = true;
        // De RAL-kleur bij de folie gaat mee in de link naar kozijnhorren.nl.
        const f = folies.find(function (x) { return x.naam === v; });
        k.folie = v; k.folie_ral = f ? f.ral : "";
      }
      gewijzigd();
    } },
      h("option", { value: "" }, "Kies de folie…"),
      folies.map(function (f) { return h("option", { value: f.naam }, f.naam + " → RAL " + f.ral + (f.gecontroleerd ? "" : " (?)")); }),
      h("option", { value: "__anders" }, "Andere folie…"));
    select.value = bekend ? k.folie : (k.folie ? "__anders" : "");
    return [h("div.veld.breed", null, h("label", { for: "v-folie" }, "Folie"), select), anders];
  }

  // --- Kozijncheck --------------------------------------------------------

  function bouwCheck() {
    const lijst = leeg(document.getElementById("checklijst"));
    status.kozijncheck.onderdelen.forEach(function (d) {
      const c = klus.check[d.sleutel] = klus.check[d.sleutel] || { stand: null, notitie: "", fotos: [] };
      const standen = d.optioneel ? ["groen", "oranje", "rood", "nvt"] : ["groen", "oranje", "rood"];
      const detail = h("div.check-detail", { hidden: !(c.stand === "oranje" || c.stand === "rood") });
      const rij = h("div.check-rij" + (c.stand ? ".stand-" + c.stand : ""), null,
        h("div.check-naam", null, h("b", null, d.naam), h("small", null, d.kijkt)),
        h("div.stoplicht", { role: "radiogroup", "aria-label": d.naam },
          standen.map(function (s) {
            return h("button.sl.sl-" + s + (c.stand === s ? ".aan" : ""), {
              type: "button", role: "radio", "aria-checked": c.stand === s ? "true" : "false",
              title: s === "nvt" ? "Niet van toepassing" : d[s],
              onclick: function () {
                c.stand = c.stand === s ? null : s;
                gewijzigd();
                bouwCheck();
                if (d.sleutel === "horren" && (c.stand === "oranje" || c.stand === "rood")) {
                  melding("Het rapport verwijst de klant naar kozijnhorren.nl" + (klus.oplevering.folie_ral ? ", in de kleur van de folie." : "."));
                }
              }
            }, s === "nvt" ? "n.v.t." : s[0].toUpperCase() + s.slice(1));
          })),
        detail);
      if (c.stand === "oranje" || c.stand === "rood") {
        detail.append(
          h("p.check-hint", null, d[c.stand]),
          h("textarea", { rows: 2, placeholder: "Korte notitie (optioneel), bijv. waar precies", value: c.notitie || "",
            "aria-label": "Notitie bij " + d.naam, oninput: function (e) { c.notitie = e.target.value; gewijzigd(); } }),
          fotoStrook(c.fotos, function () { gewijzigd(); bouwCheck(); }));
      }
      lijst.append(rij);
    });
  }

  function allesGroen() {
    status.kozijncheck.onderdelen.forEach(function (d) {
      const c = klus.check[d.sleutel];
      if (!c.stand) c.stand = d.optioneel ? "nvt" : "groen";
    });
    gewijzigd();
    bouwCheck();
  }

  // --- Foto's -------------------------------------------------------------

  function fotoStrook(lijst, naWijziging, maximaal) {
    maximaal = maximaal || 4;
    const strook = h("div.foto-strook");
    lijst.forEach(function (fid, i) {
      strook.append(h("div.foto-duim", null,
        h("img", { src: "/api/fotos/" + fid, alt: "" }),
        h("button", { type: "button", "aria-label": "Foto weghalen", onclick: function () { lijst.splice(i, 1); naWijziging(); } }, "×")));
    });
    if (lijst.length < maximaal) {
      const input = h("input", { type: "file", accept: "image/*", capture: "environment", hidden: true,
        onchange: function (e) {
          const bestand = e.target.files[0];
          if (!bestand) return;
          knop.textContent = "Uploaden…";
          knop.disabled = true;
          verkleinFoto(bestand).then(function (data) { return api("POST", "/max/fotos", { data: data }); })
            .then(function (j) { lijst.push(j.id); naWijziging(); })
            .catch(function (err) { melding("Foto niet opgeslagen: " + err.message, "fout"); knop.textContent = "+ Foto"; knop.disabled = false; });
        } });
      const knop = h("button.foto-knop", { type: "button", onclick: function () { input.click(); } }, "+ Foto");
      strook.append(knop, input);
    }
    return strook;
  }

  function verkleinFoto(bestand) {
    return new Promise(function (klaar, mis) {
      const lezer = new FileReader();
      lezer.onerror = function () { mis(new Error("Kan de foto niet lezen.")); };
      lezer.onload = function () {
        const img = new Image();
        img.onerror = function () { mis(new Error("Dit bestand is geen foto.")); };
        img.onload = function () {
          const max = 1400;
          const schaal = Math.min(1, max / Math.max(img.width, img.height));
          const c = document.createElement("canvas");
          c.width = Math.round(img.width * schaal);
          c.height = Math.round(img.height * schaal);
          c.getContext("2d").drawImage(img, 0, 0, c.width, c.height);
          klaar(c.toDataURL("image/jpeg", 0.72));
        };
        img.src = lezer.result;
      };
      lezer.readAsDataURL(bestand);
    });
  }

  // --- Afronden en delen --------------------------------------------------

  function telefoonVoorWhatsapp(tel) {
    let t = String(tel || "").replace(/\D/g, "");
    if (t.indexOf("00") === 0) t = t.slice(2);
    else if (t.indexOf("0") === 0) t = "31" + t.slice(1);
    return t.length >= 10 ? t : "";
  }

  function werkAfrondingBij() {
    const doos = document.getElementById("afronden");
    if (!doos || !klus) return;
    leeg(doos);
    const k = klus;
    const beoordeeld = status.kozijncheck.onderdelen.filter(function (d) { return k.check[d.sleutel] && k.check[d.sleutel].stand; }).length;
    const horren = (k.check.horren || {}).stand;
    const punten = [
      [!!k.klant.naam, "Naam van de klant"],
      [!!(k.klant.email || k.klant.telefoon), "E-mail of telefoon, om het rapport te sturen"],
      [!!k.oplevering.folie, "Folie gekozen (voor de garantie, en de horkleur op kozijnhorren.nl)"],
      [beoordeeld === status.kozijncheck.onderdelen.length, "Kozijncheck: " + beoordeeld + " van " + status.kozijncheck.onderdelen.length + " ingevuld"],
    ];
    doos.append(h("h2", null, "Afronden"),
      h("ul.afvinklijst", null, punten.map(function (p) { return h("li" + (p[0] ? ".ok" : ""), null, p[1]); })));

    if (k.status !== "klaar") {
      doos.append(h("button.knop.knop-primair.breed", { type: "button", onclick: function () {
        k.status = "klaar";
        gewijzigd();
        clearTimeout(opslaanTimer);
        opslaan().then(function () { melding("Rapport staat klaar"); });
      } }, "Rapport klaarzetten"),
      h("p.uitleg", null, "Pas daarna kan de klant het openen. Je kunt het daarna nog aanpassen."),
      h("p", null, h("a", { href: "/r/" + k.id, target: "_blank", rel: "noopener" }, "Bekijk eerst als concept")));
      return;
    }

    const link = k._link || (location.origin + "/r/" + k.id);
    const qr = h("div.qr", { id: "qr" });
    tekenQr(qr, link);
    const tel = telefoonVoorWhatsapp(k.klant.telefoon);
    const voornaam = (k.klant.naam || "").split(" ")[0];
    const waTekst = "Hoi " + voornaam + ", hierbij je opleverrapport van iWrap, met de kozijncheck" +
      (horren === "oranje" || horren === "rood" ? " en een tip voor nieuwe horren in de kleur van je kozijn" : "") +
      ": " + link + "\n\nGroet, Max";
    doos.append(
      h("p.klaar-melding", null, "Het rapport staat klaar. Laat de klant scannen, of stuur de link."),
      qr,
      h("p.link", null, h("a", { href: link, target: "_blank", rel: "noopener" }, link.replace(/^https?:\/\//, ""))),
      h("div.deelknoppen", null,
        h("button.knop.knop-primair", { type: "button", onclick: function () { qrGroot(link); } }, "Laat de klant scannen"),
        h("a.knop.knop-tweede", { href: "https://wa.me/" + tel + "?text=" + encodeURIComponent(waTekst), target: "_blank", rel: "noopener" },
          tel ? "WhatsApp naar klant" : "WhatsApp (kies zelf)"),
        h("button.knop.knop-tweede", { type: "button", disabled: !k.klant.email, onclick: function (e) {
          const knop = e.currentTarget;
          knop.disabled = true;
          (k._vuil ? opslaan() : Promise.resolve()).then(function () { return api("POST", "/max/rapporten/" + k.id + "/mail", {}); })
            .then(function () { melding("Mail verstuurd naar " + k.klant.email); knop.textContent = "Opnieuw mailen"; })
            .catch(function (err) { melding(err.message, "fout"); })
            .then(function () { knop.disabled = false; });
        } }, k.gedeeld && k.gedeeld.mail ? "Opnieuw mailen" : "Mail naar klant"),
        h("button.knop.knop-tweede", { type: "button", onclick: function () {
          (navigator.clipboard ? navigator.clipboard.writeText(link) : Promise.reject()).then(function () { melding("Link gekopieerd"); }, function () { prompt("Kopieer de link:", link); });
        } }, "Kopieer link")),
      h("p.uitleg", null, h("button.linkknop", { type: "button", onclick: function () { k.status = "concept"; gewijzigd(); } }, "Terug naar concept"),
        " (de klant kan het dan niet meer openen)"));
  }

  function tekenQr(doos, tekst) {
    if (typeof qrcode !== "function") { doos.textContent = "QR-code kon niet laden."; return; }
    const q = qrcode(0, "M");
    q.addData(tekst);
    q.make();
    doos.innerHTML = q.createSvgTag({ cellSize: 6, margin: 2, scalable: true });
    const svg = doos.querySelector("svg");
    if (svg) svg.setAttribute("aria-label", "QR-code naar het rapport");
  }

  function qrGroot(link) {
    const laag = h("div.qr-laag", { role: "dialog", "aria-label": "QR-code voor de klant", onclick: function () { laag.remove(); } },
      h("div.qr-groot", null,
        h("p", null, "Richt je camera hierop"),
        h("div.qr", { id: "qr-groot" }),
        h("small", null, "Tik ergens om te sluiten")));
    document.body.append(laag);
    tekenQr(document.getElementById("qr-groot"), link);
  }

  function verwijderKlus() {
    if (!confirm("Deze klus met rapport en foto's definitief verwijderen?")) return;
    api("DELETE", "/max/rapporten/" + klus.id).then(function () {
      schrijf(lokaalSleutel(klus.id), null);
      klus = null;
      location.hash = "";
    }).catch(function (e) { melding(e.message, "fout"); });
  }

  // --- Een bestelling -----------------------------------------------------

  function toonBestelling(nr) {
    klus = null;
    leeg(APP).append(h("p.max-laden", null, "Bestelling laden…"));
    api("GET", "/max/bestellingen/" + nr).then(bouwBestelling).catch(function (e) {
      leeg(APP).append(h("div.max-kaart", null, h("p.max-fout", null, e.message), h("a.knop.knop-tweede", { href: "#bestellingen" }, "Terug")));
    });
  }

  function actie(nr, wat, extra) {
    return api("POST", "/max/bestellingen/" + nr + "/actie", Object.assign({ actie: wat }, extra || {}))
      .then(function (b) { bouwBestelling(b); melding("Bijgewerkt"); })
      .catch(function (e) { melding(e.message, "fout"); });
  }

  function bouwBestelling(b) {
    const k = b.klant;
    const knoppen = [];
    if (b.status === "betaald") {
      knoppen.push(h("button.knop.knop-primair", { type: "button", onclick: function () {
        if (confirm("De bestelling mailen naar " + status.leverancier + "?")) actie(b.nr, "naar_leverancier"); } }, "Naar leverancier"));
      knoppen.push(h("button.knop.knop-tweede", { type: "button", onclick: function () { actie(b.nr, "handmatig_besteld"); } }, "Ik heb zelf besteld (portaal)"));
    }
    if (b.status === "besteld" || b.status === "betaald") {
      const track = h("input", { type: "url", placeholder: "Track & trace-link (optioneel)", "aria-label": "Track & trace-link" });
      knoppen.push(h("div.verzend-rij", null, track,
        h("button.knop.knop-tweede", { type: "button", onclick: function () {
          if (confirm("Op verzonden zetten? De klant krijgt dan een mail.")) actie(b.nr, "verzonden", { track: track.value }); } }, "Op verzonden")));
    }
    if (["open", "betaald", "besteld"].indexOf(b.status) >= 0) {
      knoppen.push(h("button.linkknop.gevaar", { type: "button", onclick: function () {
        const reden = prompt("Waarom annuleren? (Geld terugstorten doe je in het Mollie-dashboard.)");
        if (reden !== null) actie(b.nr, "annuleren", { reden: reden }); } }, "Annuleren"));
    }
    const levTekst = h("textarea.leverancier-tekst", { rows: 9, readonly: true, value: b._leverancier_tekst });
    const notitie = h("textarea", { rows: 2, value: b.notitie || "", placeholder: "Interne notitie" });

    leeg(APP).append(
      h("div.max-balk", null, h("a.terug", { href: "#bestellingen" }, "‹ Bestellingen"), statusChip(b.status)),
      h("section.max-kaart", null,
        h("h2", null, b.nr + " · " + euro(b.totaal)),
        h("p.uitleg", null, "Besteld " + datumKort(b.gemaakt) + (b.levertijd ? " · verwacht " + datumKort(b.levertijd.van) + "–" + datumKort(b.levertijd.tot) : "") +
          (b.levertijd && b.levertijd.voorjaar ? " (voorjaarslevering)" : "")),
        h("ul.bestelregels", null, b.regels.map(function (r) {
          return h("li", null, h("span.kleurstaal", { style: "background:" + (r.kleur.hex || "#ccc") }),
            h("span", null, h("b", null, r.aantal + "× " + r.productnaam + (r.naam ? " · " + r.naam : "")), h("br"),
              r.breedte + " × " + r.hoogte + " mm · RAL " + r.kleur.code + " " + r.kleur.naam + " · " + r.gaas.toLowerCase() +
              (r.middenregel ? " · middenregel" : "")),
            h("span.prijs", null, euro(r.bedrag)));
        })),
        knoppen.length ? h("div.bestel-acties", null, knoppen) : null),
      h("section.max-kaart", null,
        h("h2", null, "Klant"),
        h("p", null, k.naam, h("br"), k.straat, h("br"), k.postcode + " " + k.plaats),
        h("p", null, h("a", { href: "tel:" + k.telefoon }, k.telefoon), h("br"), h("a", { href: "mailto:" + k.email }, k.email)),
        h("p", null, h("a", { href: b._statuslink, target: "_blank", rel: "noopener" }, "Statuspagina van de klant"))),
      h("section.max-kaart", null,
        h("h2", null, "Voor de leverancier"),
        h("p.uitleg", null, "Zo gaat hij de deur uit. Bestel je via een portaal, kopieer het dan hieruit."),
        levTekst,
        h("button.knop.knop-tweede", { type: "button", onclick: function () {
          levTekst.select();
          (navigator.clipboard ? navigator.clipboard.writeText(b._leverancier_tekst) : Promise.reject()).then(function () { melding("Gekopieerd"); }, function () { document.execCommand("copy"); });
        } }, "Kopieer")),
      h("section.max-kaart", null,
        h("h2", null, "Notitie en historie"),
        notitie,
        h("button.knop-klein", { type: "button", onclick: function () { actie(b.nr, "notitie", { notitie: notitie.value }); } }, "Notitie bewaren"),
        h("ul.historie", null, (b.historie || []).slice().reverse().map(function (x) {
          return h("li", null, h("time", null, new Date(x.tijd * 1000).toLocaleString("nl-NL", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })), " ", x.wat);
        }))));
  }

  start();
})();
