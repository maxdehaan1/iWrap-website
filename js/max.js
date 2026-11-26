/* ---------------------------------------------------------------------------
   Max-modus (/max): de aanvragen van de site en de horrenwinkel.

   Twee tabs:
     Aanvragen        wat er via iwrap.nl/offerte binnenkwam, met de foto's
     kozijnhorren.nl  horren opmeten bij een klant, en de horrenbestellingen
   (Tot 26 november 2026 stond hier ook een kozijncheck met opleverrapport. Max wil op een
   klus geen stoplichtformulier invullen en de klant krijgt geen rapport: die is eruit.)

   Opbouw: kleine helper h() maakt elementen (nooit innerHTML met klantgegevens),
   elk scherm is een functie die #app vult, de route staat in de hash:
     #aanvragen   (of leeg)        #aanvraag/<id>    een aanvraag
     #bestellingen                 #bestelling/<nr>  een bestelling

   Let op bij bewerken: teksten met een apostrof tussen dubbele aanhalingstekens,
   en geen geneste `template strings` -- build.py controleert de strings.
   --------------------------------------------------------------------------- */
(function () {
  "use strict";

  const APP = document.getElementById("app");
  const TOKEN_SLEUTEL = "iwrap-max-token";
  let token = lees(TOKEN_SLEUTEL) || "";
  let status = null;       // /api/max/status: instellingen, folies, horren

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

  function euro(n) { return "€ " + Number(n).toLocaleString("nl-NL", { minimumFractionDigits: n % 1 ? 2 : 0, maximumFractionDigits: 2 }); }
  function datumKort(ts) {
    const d = typeof ts === "number" ? new Date(ts * 1000) : new Date(ts + "T12:00:00");
    return d.toLocaleDateString("nl-NL", { day: "numeric", month: "short" });
  }

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
      route();
    }).catch(function (e) {
      if (e.message !== "Log opnieuw in.") {
        leeg(APP).append(h("div.max-kaart", null, h("h2", null, "Geen verbinding"),
          h("p", null, e.message), h("button.knop.knop-primair", { type: "button", onclick: start }, "Opnieuw proberen")));
      }
    });
  }

  function route() {
    const hash = location.hash.replace(/^#/, "");
    const delen = hash.split("/");
    window.scrollTo(0, 0);
    if (delen[0] === "bestelling" && delen[1]) return toonBestelling(delen[1]);
    if (delen[0] === "aanvraag" && delen[1]) return toonAanvraag(delen[1]);
    if (delen[0] === "bestellingen") return toonOverzicht("bestellingen");
    return toonOverzicht("aanvragen");
  }

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
      h("p", null, "De aanvragen van de site, en de horren van kozijnhorren.nl."),
      h("label", { for: "ww" }, "Wachtwoord"), veld, fout,
      h("button.knop.knop-primair", { type: "submit" }, "Inloggen"));
    leeg(APP).append(form);
    veld.focus();
  }

  // --- Overzicht ----------------------------------------------------------

  function toonOverzicht(tab) {
    const inhoud = h("div.max-lijst", null, h("p.max-laden", null, "Laden…"));
    voegToe(leeg(APP), [
      h("div.max-tabs", { role: "tablist" },
        h("a" + (tab === "aanvragen" ? ".actief" : ""), { href: "#aanvragen", role: "tab" }, "Aanvragen"),
        h("a" + (tab === "bestellingen" ? ".actief" : ""), { href: "#bestellingen", role: "tab" }, "kozijnhorren.nl")),
      statusBalk(),
      tab === "bestellingen" ? horrenOpmeten() : null,
      inhoud,
      h("p.max-voet", null, h("button.linkknop", { type: "button", onclick: uitloggen }, "Uitloggen"))]);

    if (tab === "aanvragen") {
      api("GET", "/max/aanvragen").then(function (j) {
        leeg(inhoud);
        if (!j.aanvragen.length) inhoud.append(h("p.max-leeg", null, "Nog geen aanvragen via de site. Ze staan ook altijd in je mail."));
        j.aanvragen.forEach(function (a) {
          inhoud.append(h("a.max-regel", { href: "#aanvraag/" + a.id },
            h("span.max-regel-titel", null, a.naam + " · " + a.plaats),
            h("span.max-regel-sub", null, a.wat + " · " + a.manier.toLowerCase() + " · " + datumKort(a.gemaakt))));
        });
      }).catch(function (e) { leeg(inhoud).append(h("p.max-fout", null, e.message)); });
    } else {
      api("GET", "/max/bestellingen").then(function (j) {
        leeg(inhoud);
        if (!j.bestellingen.length) inhoud.append(h("p.max-leeg", null, "Nog geen bestellingen."));
        // Via welke partnercode, over de betaalde bestellingen: voor de commissie.
        const perCode = {};
        j.bestellingen.forEach(function (b) {
          if (!b.partner || ["betaald", "besteld", "verzonden", "afgerond"].indexOf(b.status) < 0) return;
          const c = perCode[b.partner.code] || (perCode[b.partner.code] = { naam: b.partner.naam, aantal: 0, bedrag: 0 });
          c.aantal += 1;
          c.bedrag += b.totaal;
        });
        const codes = Object.keys(perCode).sort();
        if (codes.length) {
          inhoud.append(h("section.max-kaart", null, h("h2", null, "Via een partnercode"),
            codes.map(function (code) {
              const c = perCode[code];
              return h("p", null, h("b", null, code), " (" + c.naam + "): " + c.aantal + (c.aantal === 1 ? " bestelling, " : " bestellingen, ") +
                euro(c.bedrag) + " betaald");
            })));
        }
        j.bestellingen.forEach(function (b) {
          inhoud.append(h("a.max-regel", { href: "#bestelling/" + b.nr },
            h("span.max-regel-titel", null, b.nr + " · " + (b.naam || "")),
            h("span.max-regel-sub", null, (b.plaats || "") + " · " + b.horren + (b.horren === 1 ? " hor" : " horren") + " · " + euro(b.totaal) +
              (b.partner ? " · code " + b.partner.code : "") + " · " + datumKort(b.gemaakt)),
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
    if (s.omgeving === "vercel" && s.mail === "uitbak") waarschuwingen.push("Mail is niet gekoppeld: klanten krijgen geen mail. Zet de Microsoft-koppeling (MS_TENANT_ID, MS_CLIENT_ID, MS_CLIENT_SECRET) in Vercel.");
    if (s.betalen === "testkassa" && s.omgeving === "vercel") waarschuwingen.push("Betalen is niet gekoppeld (MOLLIE_API_KEY).");
    if (s.voorbeeldprijzen) waarschuwingen.push("De horrenprijzen zijn nog voorbeeldprijzen.");
    if (s.omgeving === "vercel" && s.reviews !== "google") waarschuwingen.push("De Google-reviews lopen niet live mee: zet GOOGLE_PLACES_API_KEY in Vercel. Tot die tijd staat de stand van de laatste build op de sites.");
    const regels = [
      ["Opslag", s.opslag === "redis" ? "Upstash Redis" : "bestanden (" + s.omgeving + ")"],
      ["Betalen", { "mollie-live": "Mollie (live)", "mollie-test": "Mollie (testmodus)", testkassa: "testkassa" }[s.betalen]],
      ["Mail", { microsoft: "via Microsoft 365 (info@iwrap.nl)", uitbak: "niet gekoppeld (uitbak)" }[s.mail]],
      ["Leverancier", s.leverancier + (s.leverancier_automatisch ? " (automatisch)" : " (na jouw akkoord)")],
      ["Horrenwinkel", (s.winkel_live ? "open, " : "alleen voor jou, ") + s.shop_url.replace(/^https?:\/\//, "") + " · jouw code " + s.eigen_code],
      ["Reviews", s.reviews === "google" ? "live van Google" : "vast (reviews.json)"],
    ];
    return h("details.max-status" + (waarschuwingen.length ? ".let" : ""), null,
      h("summary", null, waarschuwingen.length ? "Let op: " + waarschuwingen.length + (waarschuwingen.length === 1 ? " punt" : " punten") : "Alles gekoppeld"),
      waarschuwingen.length ? h("ul", null, waarschuwingen.map(function (w) { return h("li", null, w); })) : null,
      h("dl", null, regels.map(function (r) { return [h("dt", null, r[0]), h("dd", null, r[1])]; })));
  }

  // --- Horren opmeten bij een klant ---------------------------------------

  // De winkel op deze telefoon, met jouw code en eventueel de kleur van de folie. Met
  // "eigen=1" weet de winkel dat het jouw telefoon is: in de winkelmand stuur je de horren
  // dan naar de klant, die op zijn eigen telefoon afrekent.
  function horrenLink(ral) {
    const p = new URLSearchParams();
    if (ral) p.set("kleur", ral);
    p.set("code", status.eigen_code || "MAX");
    p.set("eigen", "1");
    return status.shop_url + "/bestellen?" + p.toString();
  }

  function horrenOpmeten() {
    const knop = h("a.knop.knop-primair.breed", { href: horrenLink(""), target: "_blank", rel: "noopener" }, "Nieuwe horren opmeten");
    const keuze = h("select", { id: "ho-folie", onchange: function (e) { knop.href = horrenLink(e.target.value); } },
      h("option", { value: "" }, "Kleur kies ik in de winkel"),
      (status.folies || []).map(function (f) { return h("option", { value: f.ral }, f.naam + " → RAL " + f.ral + (f.gecontroleerd ? "" : " (?)")); }));
    return h("section.max-kaart", null,
      h("h2", null, "Horren opmeten bij een klant"),
      h("p.uitleg", null, "Opent de winkel met jouw code. In de winkelmand stuur je de horren naar de klant, die zelf afrekent."),
      h("div.veld.max-veld", null, h("label", { for: "ho-folie" }, "Folie van de klus (optioneel)"), keuze),
      knop);
  }

  // --- Een bestelling -----------------------------------------------------

  // --- Een aanvraag -------------------------------------------------------

  function toonAanvraag(id) {
    leeg(APP).append(h("p.max-laden", null, "Aanvraag laden…"));
    api("GET", "/max/aanvragen/" + id).then(bouwAanvraag).catch(function (e) {
      leeg(APP).append(h("div.max-kaart", null, h("p.max-fout", null, e.message), h("a.knop.knop-tweede", { href: "#aanvragen" }, "Terug")));
    });
  }

  // De foto's staan achter de inlog, dus ophalen met het token en tonen als blob.
  function aanvraagFoto(id, naam) {
    const img = h("img", { alt: naam, loading: "lazy" });
    const knop = h("button.aanvraag-foto", { type: "button", "aria-label": "Foto " + naam + " groot bekijken" }, img, h("span", null, naam));
    fetch("/api/max/aanvragen/" + id + "/fotos/" + naam, { headers: { Authorization: "Bearer " + token } })
      .then(function (r) { if (!r.ok) throw new Error(); return r.blob(); })
      .then(function (b) {
        const url = URL.createObjectURL(b);
        img.src = url;
        knop.addEventListener("click", function () { window.open(url, "_blank"); });
      })
      .catch(function () { knop.classList.add("weg"); knop.lastChild.textContent = naam + " (niet meer op de server)"; });
    return knop;
  }

  function bouwAanvraag(a) {
    const g = a.gegevens;
    const kaart = "https://www.google.com/maps/search/?api=1&query=" + encodeURIComponent(a.adres);
    leeg(APP).append(
      h("div.max-balk", null, h("a.terug", { href: "#aanvragen" }, "‹ Aanvragen")),
      h("section.max-kaart", null,
        h("h2", null, g.naam + " · " + g.plaats),
        h("p.uitleg", null, "Binnengekomen " + datumKort(a.gemaakt) + " · " + a.manier.toLowerCase()),
        h("dl.aanvraag-gegevens", null,
          h("dt", null, "Telefoon"), h("dd", null, h("a", { href: "tel:" + g.telefoon.replace(/[^\d+]/g, "") }, g.telefoon)),
          h("dt", null, "E-mail"), h("dd", null, h("a", { href: "mailto:" + g.email }, g.email)),
          h("dt", null, "Adres"), h("dd", null, a.adres, " · ", h("a", { href: kaart, target: "_blank", rel: "noopener" }, "kaart")),
          h("dt", null, "Kleur"), h("dd", null, a.kleur),
          (a.details || []).map(function (d) { return [h("dt", null, d[0]), h("dd", null, d[1])]; }),
          a.via ? [h("dt", null, "Herkomst"), h("dd", null, a.via)] : null,
          a.toelichting ? [h("dt", null, "Opmerking"), h("dd", null, a.toelichting)] : null)),
      // Spreiden: append() maakt van een lijst anders de tekst "[object HTMLElement]".
      ...a.overzicht.map(function (blok) {
        return h("section.max-kaart", null,
          h("h2", null, blok.titel),
          blok.regels.map(function (r) { return h("p.aanvraag-regel", null, r); }),
          h("div.aanvraag-fotos", null, blok.fotos.map(function (n) { return aanvraagFoto(a.id, n); })));
      }));
  }

  function toonBestelling(nr) {
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
          (b.levertijd && b.levertijd.voorjaar ? " (voorjaarslevering)" : "") +
          (b.partner ? " · via code " + b.partner.code + " (" + b.partner.naam + "), " + euro(b.korting || 0) + " korting" : "")),
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
        b.leverancier && b.leverancier.bevestigd
          ? h("p.uitleg", null, "Bevestigd door de leverancier op " + datumKort(b.leverancier.bevestigd) + ".")
          : (b.status === "besteld" ? h("p.uitleg", null, "De leverancier heeft nog niet bevestigd.") : null),
        b._leverancierlink ? h("p", null, h("a", { href: b._leverancierlink, target: "_blank", rel: "noopener" },
          "De pagina van de leverancier"), " (daar zet hij de bestelling op in productie en verzonden)") : null,
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
