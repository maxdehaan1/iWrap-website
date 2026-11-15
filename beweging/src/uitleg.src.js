
  /* ====================================================================== UITLEG
   * Een pagina-animatie als losse video, in dezelfde stijl als de klusfilm (voor social en
   * eigen video's). Alleen voor het renderen: zit in dist/iwrap-video.js, niet in het
   * websitebestand.
   *
   * Liggend 1920 x 1080: de titel links met het beeld rechts ernaast (zoals de opening van de
   * klusfilm), dan schuift het beeld groot naar het midden en speelt het af, met dezelfde
   * ondertitel-pil als de klusfilm. Een rakel veegt naar dezelfde eindkaart.
   * Staand 1080 x 1920: zoals de staande klusfilm: logo boven, het beeld als kaart in het midden,
   * titel en ondertitels groot eronder, iwrap.nl onderaan en de eindkaart over het hele beeld.
   *
   *   iWrapMotion.create('uitleg', { scene: 'kozijncheck', boven: 'IWRAP  ·  KOZIJNCHECK',
   *     titel: ['Gratis', 'kozijncheck'], onder: 'Bij elke klus, zonder meerprijs.',
   *     captions: [{ t0: 0.8, t1: 5.0, text: '...' }] })        // t0/t1 gerekend vanaf de start van de scène
   * ====================================================================== */
  function Eindkaart(st, parent, Wd, Hd, vert) {
    var g = G(parent), th = theme({ theme: 'mint' }), L = GEO.lockups.tagline;
    Rc(g, vert ? 0 : -400, vert ? 0 : -400, vert ? Wd : 2720, vert ? Hd : 1880, 0, K.mint);
    var mid = st.id + 'ek' + (++uid), rg = el('radialGradient', { id: mid + 'g', gradientUnits: 'userSpaceOnUse', cx: f(Wd / 2), cy: f(Hd / 2), r: f(vert ? Hd * 0.62 : 1180) }, st.defs);
    el('stop', { offset: 0, 'stop-color': '#000' }, rg); el('stop', { offset: vert ? 0.42 : 0.4, 'stop-color': '#000' }, rg); el('stop', { offset: 1, 'stop-color': '#fff' }, rg);
    var msk = el('mask', { id: mid, maskUnits: 'userSpaceOnUse', x: 0, y: 0, width: f(Wd), height: f(Hd) }, st.defs);
    Rc(msk, 0, 0, Wd, Hd, 0, 'url(#' + mid + 'g)');
    var pat = new Pattern(G(g, { mask: 'url(#' + mid + ')' }), Wd, Hd, th.pat, { patScale: 1.25, patLoop: 16, seed: 11 });
    var ls = vert ? 760 / L.w : 0.86, lx = Wd / 2 - L.w * ls / 2, ly = vert ? Hd / 2 - L.h * ls / 2 - 60 : 470 - L.h * ls / 2;
    var logo = uitrolInto(st, G(g, { transform: 'translate(' + f(lx) + ' ' + f(ly) + ') scale(' + f(ls) + ')' }), L, 'tagline', th, { outro: false, hold: 0, shift: true });
    var url = Tx(g, 'iwrap.nl', Wd / 2, vert ? Hd / 2 + 300 : 792, vert ? 50 : 46, 600, '#FFFFFF', 'middle', '0.06em');
    var t0 = vert ? 0.35 : 0.75;
    this.g = g; this.rest = t0 + logo.rest;
    this.render = function (te) {
      pat.render(te); logo.render(te - t0);
      var u = seg(te, t0 + logo.rest - 0.9, 0.5);
      op(url, u); sa(url, 'transform', vert ? null : 'translate(0 ' + f(18 * (1 - seg(te, t0 + logo.rest - 0.9, 0.7, E.out))) + ')');
    };
  }

  SC.uitleg = function (o) {
    var W = o.frame ? o.frame[0] : 1920, H = o.frame ? o.frame[1] : 1080, vert = H > W * 1.2, k;
    var st = Stage({ frame: [W, H], label: o.label || ('iWrap: ' + o.titel.join(' ')) }, W, H, theme({ theme: 'light' }));
    var io = { ui: false, captions: false };
    for (k in (o.sceneOpts || {})) io[k] = o.sceneOpts[k];
    var inner = SC[o.scene](io), isvg = inner.svg;
    isvg.removeAttribute('style'); isvg.setAttribute('width', 1200); isvg.setAttribute('height', 900);
    var T = { titel: o.titelDuur || 3.4 };
    var intro = inner.endless ? (inner.introDur || 0) : 0;
    var eind = o.sceneEind != null ? o.sceneEind : (inner.endless ? intro + inner.loopDur - 0.05 : inner.rest);
    T.mv = T.titel + 0.1; T.scene = T.titel + 0.9; T.end = T.scene + (eind - intro) + (o.naloop != null ? o.naloop : 1.0);
    // tijd binnen de scène: het begin (bij een lus: de opbouw) speelt al onder de titel, daarna één keer tot 'eind'
    function ti(t) { return t < T.scene ? Math.min(Math.max(0, t - 0.3), intro) : Math.min(intro + (t - T.scene), eind); }
    var caps = (o.captions || []).map(function (c) { return { t0: T.scene + c.t0, t1: T.scene + c.t1, text: c.text }; });
    var n = o.titel.length, render, end;

    if (!vert) {
      var sc = Math.min(W / 1920, H / 1080);
      var root = G(st.svg, { transform: 'translate(' + f((W - 1920 * sc) / 2) + ' ' + f((H - 1080 * sc) / 2) + ') scale(' + f(sc) + ')' });
      Rc(root, -400, -400, 2720, 1880, 0, K.paper);
      // het beeld: eerst rechts naast de titel, daarna groot in het midden
      var box = G(root), clipG = G(box), sclip = new SlantClip(st, clipG);
      clipG.appendChild(isvg);
      var A = { x: 960, y: 207, s: 0.74 }, B = { x: 340, y: 14, s: 1240 / 1200 };
      // titel, zoals de opening van de klusfilm
      var title = G(root), y0 = 372 + (3 - n) * 50, maxc = 0;
      o.titel.forEach(function (r) { maxc = Math.max(maxc, r.length); });
      var size = Math.min(88, Math.floor(760 / (maxc * 0.6)));
      var tl = [Tx(title, o.boven, 150, y0, 21, 600, K.mintInk, 'start', '0.24em')];
      o.titel.forEach(function (r, i) { tl.push(Tx(title, r, 146, y0 + 104 + i * 100, size, 700, K.ink)); });
      if (o.onder) tl.push(Tx(title, o.onder, 150, y0 + 104 + (n - 1) * 100 + 76, 34, 500, K.sub));
      end = new Eindkaart(st, root, 1920, 1080, false);
      var endClip = new SlantClip(st, end.g), rakel = new Rakel(root), cap = new Captions(root, caps);
      render = function (t) {
        var i, a, out;
        for (i = 0; i < tl.length; i++) {
          a = seg(t, 0.25 + i * 0.11, 0.7, E.out); out = seg(t, T.titel - 0.1 + i * 0.04, 0.45, E.in);
          op(tl[i], Math.min(seg(t, 0.25 + i * 0.11, 0.35), 1 - out));
          sa(tl[i], 'transform', 'translate(' + f(-70 * out) + ' ' + f(26 * (1 - a)) + ')');
        }
        var wq = seg(t, 0.3, 1.0, E.inOut);
        if (wq >= 1) sclip.off(); else sclip.set(lerp(-900 * COT - 60, 1260, wq), -1);
        var m = seg(t, T.mv, 0.9, E.inOut);
        sa(box, 'transform', 'translate(' + f(lerp(A.x, B.x, m)) + ' ' + f(lerp(A.y, B.y, m)) + ') scale(' + f(lerp(A.s, B.s, m)) + ')');
        inner.render(ti(t));
        var te = t - T.end, p = 0;
        show(end.g, te >= 0);
        if (te >= 0) {
          end.render(te);
          var w = seg(te, 0, 0.85, E.inOut);
          if (w < 1) { endClip.set(rakel.x(w), -1); p = w; } else endClip.off();
        }
        rakel.draw(p);
        cap.render(t);
      };
    } else {
      var fsc = W / 1080, fg = G(st.svg, { transform: 'scale(' + f(fsc) + ')' }), VH = H / fsc;
      Rc(fg, 0, 0, 1080, VH, 0, '#FFFFFF');
      var bx = 36, bw = 1008, bh = 756, by = Math.round(VH * 0.5 - 470);
      Rc(fg, bx, by + 16, bw, bh, 32, '#22262A', { opacity: 0.1 });
      var cpv = el('clipPath', { id: st.id + 'vb' }, st.defs);
      Rc(cpv, bx, by, bw, bh, 32);
      var card = G(G(fg, { 'clip-path': 'url(#' + st.id + 'vb)' }), { transform: 'translate(' + bx + ' ' + by + ') scale(' + f(bw / 1200) + ')' });
      Rc(card, 0, 0, 1200, 900, 0, K.paper);
      var cardIn = G(card); cardIn.appendChild(isvg);
      var L0 = GEO.lockups.horizontal, ls0 = 500 / L0.w;
      var logo = uitrolInto(st, G(fg, { transform: 'translate(' + f(540 - L0.w * ls0 / 2) + ' ' + f(by - 250) + ') scale(' + f(ls0) + ')' }), L0, 'horizontal', theme({ theme: 'light' }), { outro: false, hold: 0, shift: false, sheen: false });
      var url = Tx(fg, 'iwrap.nl', 540, VH - 150, 40, 600, K.mintInk, 'middle', '0.06em');
      // titel groot onder het beeld, daarna de ondertitels op dezelfde plek
      var ty = by + bh + 130, tvl = [Tx(fg, o.boven, 540, ty, 26, 600, K.mintInk, 'middle', '0.2em')], maxv = 0;
      o.titel.forEach(function (r) { maxv = Math.max(maxv, r.length); });
      var vs = Math.min(76, Math.floor(980 / (maxv * 0.6)));
      o.titel.forEach(function (r, i) { tvl.push(Tx(fg, r, 540, ty + 96 + i * (vs + 12), vs, 700, K.ink, 'middle')); });
      if (o.onder) tvl.push(Tx(fg, o.onder, 540, ty + 96 + (n - 1) * (vs + 12) + 70, 38, 500, K.sub, 'middle'));
      var capV = new CaptionsV(fg, caps, by + bh + 170);
      end = new Eindkaart(st, fg, 1080, VH, true);
      render = function (t) {
        var i, a, out;
        logo.render(t - 0.2);
        op(url, seg(t, 1.2, 0.5));
        op(cardIn, seg(t, 0.15, 0.5));
        for (i = 0; i < tvl.length; i++) {
          a = seg(t, 0.3 + i * 0.1, 0.6, E.out); out = seg(t, T.titel - 0.15 + i * 0.04, 0.4, E.in);
          op(tvl[i], Math.min(seg(t, 0.3 + i * 0.1, 0.3), 1 - out));
          sa(tvl[i], 'transform', 'translate(0 ' + f(26 * (1 - a) - 20 * out) + ')');
        }
        inner.render(ti(t));
        capV.render(t);
        var te = t - T.end - 0.45, eo = seg(te, 0, 0.55, E.inOut);
        op(end.g, eo);
        if (eo > 0) end.render(te);
      };
    }
    var duration = T.end + 0.5 + end.rest + 2.6;
    return { svg: st.svg, duration: duration, rest: duration, render: render, T: T };
  };
