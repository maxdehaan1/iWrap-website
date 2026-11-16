
  /* ======================= De motor ======================= */
  function lin(hex) { var c = rgb(hex); return [c[0] / 255, c[1] / 255, c[2] / 255]; }   // de shader zet sRGB zelf om

  // Een materiaal voor losse dingen: kleur (sRGB), ruwheid, metaal, soort (zie de shader), doorzichtigheid
  function mat(hex, ruw, metaal, soort, a) { return { c: Array.isArray(hex) ? hex : lin(hex), r: ruw == null ? 0.5 : ruw, m: metaal || 0, id: soort || 1, a: a == null ? 1 : a }; }

  /* Bouwer: driehoeken met per punt: plek, normaal, uv (mm), raaklijn, kleur, [ruwheid, metaal, soort, alpha] */
  var STAP = 18;
  function Bouwer() { this.f = new Float32Array(STAP * 30000); this.n = 0; }
  Bouwer.prototype.leeg = function () { this.n = 0; };
  Bouwer.prototype.punt = function (P, N, uv, T, m) {
    if (this.n + STAP > this.f.length) { var g = new Float32Array(this.f.length * 2); g.set(this.f); this.f = g; }
    var f = this.f, i = this.n;
    f[i] = P[0]; f[i + 1] = P[1]; f[i + 2] = P[2]; f[i + 3] = N[0]; f[i + 4] = N[1]; f[i + 5] = N[2];
    f[i + 6] = uv[0]; f[i + 7] = uv[1]; f[i + 8] = T[0]; f[i + 9] = T[1]; f[i + 10] = T[2];
    f[i + 11] = m.c[0]; f[i + 12] = m.c[1]; f[i + 13] = m.c[2]; f[i + 14] = m.r; f[i + 15] = m.m; f[i + 16] = m.id; f[i + 17] = m.a;
    this.n += STAP;
  };
  Bouwer.prototype.drie = function (a, b, c, m) { this.punt(a.P, a.N, a.uv, a.T, m); this.punt(b.P, b.N, b.uv, b.T, m); this.punt(c.P, c.N, c.uv, c.T, m); };
  // een raster van punten [i][j] = {P, N, uv, T}: twee driehoeken per vakje
  Bouwer.prototype.raster = function (R, m) {
    for (var i = 0; i + 1 < R.length; i++) for (var j = 0; j + 1 < R[i].length; j++) {
      var a = R[i][j], b = R[i + 1][j], c = R[i + 1][j + 1], d = R[i][j + 1];
      this.drie(a, b, c, m); this.drie(a, c, d, m);
    }
  };
  function pt(P, N, uv, T) { return { P: P, N: N, uv: uv || [0, 0], T: T || [1, 0, 0] }; }
  // normalen uit het raster zelf (voor doek, tong, flap): kruisproduct van de buren
  function rasterNormalen(R, buiten) {
    for (var i = 0; i < R.length; i++) for (var j = 0; j < R[i].length; j++) {
      var a = R[Math.min(i + 1, R.length - 1)][j].P, b = R[Math.max(i - 1, 0)][j].P, c = R[i][Math.min(j + 1, R[i].length - 1)].P, d = R[i][Math.max(j - 1, 0)].P;
      var n = een(uitw(ver(a, b), ver(c, d)));
      if (buiten && inw(n, buiten) < 0) n = maal(n, -1);
      R[i][j].N = n; R[i][j].T = een(ver(a, b));
    }
    return R;
  }

  /* Vormen ------------------------------------------------------------------- */
  function assen(a) {
    var e1 = een(uitw(a, Math.abs(a[1]) < 0.9 ? [0, 1, 0] : [1, 0, 0])), e2 = uitw(a, e1);
    return [e1, e2];
  }
  // Cilinder van A naar B met straal r, afgeronde randen. o: {kap: false, kapM, bev, seg, hoek (draaiing van de uv)}
  function cil(Bw, A, B, r, m, o) {
    o = o || {};
    var as = ver(B, A), L = lengteV(as); if (L < 1e-4 || r <= 0) return;
    var a = maal(as, 1 / L), e = assen(a), e1 = e[0], e2 = e[1];
    var bev = Math.min(o.bev != null ? o.bev : Math.min(1.4, r * 0.3), L * 0.45, r * 0.9), seg = o.seg || 30, hk = o.hoek || 0;
    function P(rad, z, h) { var c = Math.cos(h), s = Math.sin(h); return som(som(A, maal(a, z)), som(maal(e1, c * rad), maal(e2, s * rad))); }
    function Nn(nr, na, h) { var c = Math.cos(h), s = Math.sin(h); return een(som(maal(a, na), som(maal(e1, c * nr), maal(e2, s * nr)))); }
    // mantel met afgeronde randen
    var prof = [], k;
    for (k = 0; k <= 3; k++) { var q = (1 - k / 3) * Math.PI / 2; prof.push([r - bev + bev * Math.cos(q), bev - bev * Math.sin(q), Math.cos(q), -Math.sin(q)]); }
    for (k = 0; k <= 3; k++) { q = k / 3 * Math.PI / 2; prof.push([r - bev + bev * Math.cos(q), L - bev + bev * Math.sin(q), Math.cos(q), Math.sin(q)]); }
    var R = [];
    for (var i = 0; i <= seg; i++) {
      var h = i / seg * Math.PI * 2, rij = [];
      for (k = 0; k < prof.length; k++) rij.push(pt(P(prof[k][0], prof[k][1], h), Nn(prof[k][2], prof[k][3], h), [(h + hk) * r, prof[k][1]], a));
      R.push(rij);
    }
    Bw.raster(R, m);
    if (o.kap === false) return;
    // de kopse kanten: platte schijven
    [[0, -1], [L, 1]].forEach(function (z) {
      var Rk = [];
      for (var i = 0; i <= seg; i++) {
        var h = i / seg * Math.PI * 2, rij = [];
        for (var j = 0; j <= 4; j++) {
          var rad = (r - bev) * j / 4, c = Math.cos(h), s = Math.sin(h);
          rij.push(pt(P(rad, z[0], h), maal(a, z[1]), [Math.cos(h + hk * z[1]) * rad, Math.sin(h + hk * z[1]) * rad], e1));
        }
        Rk.push(rij);
      }
      Bw.raster(Rk, o.kapM || m);
    });
  }
  // Een blok met afgeronde randen: hoek o, randen X, Y, Z (ongeveer haaks op elkaar)
  function kist(Bw, o, X, Y, Z, m, bev) {
    var lx = lengteV(X), ly = lengteV(Y), lz = lengteV(Z); if (lx < 1e-4 || ly < 1e-4 || lz < 1e-4) return;
    var ex = maal(X, 1 / lx), ey = maal(Y, 1 / ly), ez = maal(Z, 1 / lz);
    var h = [lx / 2, ly / 2, lz / 2];
    bev = Math.min(bev == null ? 1.2 : bev, h[0] * 0.95, h[1] * 0.95, h[2] * 0.95);
    var hi = [h[0] - bev, h[1] - bev, h[2] - bev], mid = som(o, maal(som(som(X, Y), Z), 0.5));
    function ks(a) { var hh = h[a], b = bev; return [-hh, -hh + b * 0.3, -hh + b * 0.7, -hh + b, hh - b, hh - b * 0.7, hh - b * 0.3, hh]; }
    function wereld(q) { return som(mid, som(som(maal(ex, q[0]), maal(ey, q[1])), maal(ez, q[2]))); }
    for (var as = 0; as < 3; as++) for (var tk = -1; tk <= 1; tk += 2) {
      var a1 = (as + 1) % 3, a2 = (as + 2) % 3, c1 = ks(a1), c2 = ks(a2), R = [];
      for (var i = 0; i < c1.length; i++) {
        var rij = [];
        for (var j = 0; j < c2.length; j++) {
          var q = [0, 0, 0]; q[as] = tk * h[as]; q[a1] = c1[i]; q[a2] = c2[j];
          var cq = [klem(q[0], -hi[0], hi[0]), klem(q[1], -hi[1], hi[1]), klem(q[2], -hi[2], hi[2])], d = ver(q, cq), dl = lengteV(d);
          var n = dl > 1e-6 ? maal(d, 1 / dl) : [0, 0, 0]; if (dl <= 1e-6) n[as] = tk;
          var pl = som(cq, maal(n, bev));
          var nw = een(som(som(maal(ex, n[0]), maal(ey, n[1])), maal(ez, n[2])));
          var T = as === 0 ? ey : ex;
          rij.push(pt(wereld(pl), nw, [pl[a1] + h[a1], pl[a2] + h[a2]], T));
        }
        R.push(rij);
      }
      Bw.raster(R, m);
    }
  }
  // Een plat kaartje met ronde hoeken (de rakel): midden c, X = breedte, Y = hoogte (in het vlak), N = dikte
  function kaart(Bw, c, X, Y, N, w, h, dik, r, m) {
    var ex = een(X), ey = een(Y), ez = een(N), seg = 7, rand = [], i, k, hw = w / 2, hh = h / 2;
    r = Math.min(r, hw, hh);
    [[hw - r, hh - r, 0], [-hw + r, hh - r, 90], [-hw + r, -hh + r, 180], [hw - r, -hh + r, 270]].forEach(function (hk) {
      for (k = 0; k <= seg; k++) { var a = (hk[2] + k * 90 / seg) * RAD; rand.push([hk[0] + Math.cos(a) * r, hk[1] + Math.sin(a) * r, Math.cos(a), Math.sin(a)]); }
    });
    rand.push(rand[0]);
    function P(x, y, z) { return som(c, som(som(maal(ex, x), maal(ey, y)), maal(ez, z))); }
    var b = Math.min(0.9, dik * 0.3), z1 = dik / 2, R = [];
    // de rand: een klein facet boven, de zijkant, een klein facet onder
    var lagen = [[-b, z1, 0.7], [0, z1 - b, 0], [0, -z1 + b, 0], [-b, -z1, -0.7]];
    for (i = 0; i < rand.length; i++) {
      var q = rand[i], rij = [];
      lagen.forEach(function (L) {
        var x = q[0] + q[2] * L[0], y = q[1] + q[3] * L[0], nr = L[2] ? 0.7 : 1;
        rij.push(pt(P(x, y, L[1]), een(som(som(maal(ex, q[2] * nr), maal(ey, q[3] * nr)), maal(ez, L[2]))), [x, y], ex));
      });
      R.push(rij);
    }
    Bw.raster(R, m);
    [[z1, 1], [-z1, -1]].forEach(function (zz) {
      var Rk = [];
      for (i = 0; i < rand.length; i++) {
        var q = rand[i], x = q[0] - q[2] * b, y = q[1] - q[3] * b;
        Rk.push([pt(P(0, 0, zz[0]), maal(ez, zz[1]), [0, 0], ex), pt(P(x, y, zz[0]), maal(ez, zz[1]), [x, y], ex)]);
      }
      Bw.raster(Rk, m);
    });
  }
  function bol(Bw, c, r, m, seg) {
    seg = seg || 10; var R = [];
    for (var i = 0; i <= seg * 2; i++) {
      var h = i / (seg * 2) * Math.PI * 2, rij = [];
      for (var j = 0; j <= seg; j++) {
        var v = j / seg * Math.PI, n = [Math.sin(v) * Math.cos(h), Math.cos(v), Math.sin(v) * Math.sin(h)];
        rij.push(pt(som(c, maal(n, r)), n, [h * r, v * r], [-Math.sin(h), 0, Math.cos(h)]));
      }
      R.push(rij);
    }
    Bw.raster(R, m);
  }

  /* Het kozijn zelf: dorpel en stijl als één doorlopend, afgerond profiel ------------------
     Per punt: plek, normaal, [u, v, deel, vlak] en de richting van u.
     vlak: 0 voorkant (met de afgeronde rand), 1 dagkant (tot het glas), 2 de rest (wit, geen folie). */
  function profielLus(breed, hoog, r, splits, indeling) {
    // afgeronde rechthoek [0,breed] x [0,hoog], tegen de klok in, met extra punten op de rechte zijden
    var hoeken = [[breed - r, r, -90], [breed - r, hoog - r, 0], [r, hoog - r, 90], [r, r, 180]], lus = [];
    for (var h = 0; h < 4; h++) {
      var hk = hoeken[h];
      for (var k = 0; k <= 6; k++) { var a = (hk[2] + k * 15) * RAD, n = [Math.cos(a), Math.sin(a)]; lus.push({ p: [hk[0] + n[0] * r, hk[1] + n[1] * r], n: n, hoek: h, k: k }); }
      var nh = hoeken[(h + 1) % 4], a1 = nh[2] * RAD, start = lus[lus.length - 1].p, eind = [nh[0] + Math.cos(a1) * r, nh[1] + Math.sin(a1) * r];
      var ns = [Math.cos((hk[2] + 90) * RAD), Math.sin((hk[2] + 90) * RAD)];
      (splits[h] || []).forEach(function (f) { lus.push({ p: [mix(start[0], eind[0], f), mix(start[1], eind[1], f)], n: ns.slice() }); });
    }
    lus.push({ p: lus[0].p.slice(), n: lus[0].n.slice() });
    var s = 0; lus[0].s = 0;
    for (var i = 1; i < lus.length; i++) { s += Math.hypot(lus[i].p[0] - lus[i - 1].p[0], lus[i].p[1] - lus[i - 1].p[1]); lus[i].s = s; }
    // elk stukje tussen twee punten hoort bij een vlak; waar het vlak wisselt, begint een nieuwe strook
    var stroken = [], cur = null;
    for (i = 0; i + 1 < lus.length; i++) {
      var A = lus[i], B = lus[i + 1], f = indeling([(A.p[0] + B.p[0]) / 2, (A.p[1] + B.p[1]) / 2], [(A.n[0] + B.n[0]) / 2, (A.n[1] + B.n[1]) / 2]);
      if (!cur || cur.f !== f) { cur = { f: f, pts: [A] }; stroken.push(cur); }
      cur.pts.push(B);
    }
    return { lus: lus, stroken: stroken };
  }
  function kozijnMesh() {
    var pos = [], nrm = [], uvw = [], tan = [], idx = [], nV = 0;
    function strook(prof, deel, uVan, uTot, stap, plek, plekN, U, vNul, om) {
      var nu = Math.ceil((uTot - uVan) / stap);
      prof.stroken.forEach(function (st) {
        var basis = nV, w = st.pts.length;
        for (var iu = 0; iu <= nu; iu++) {
          var u = Math.min(uTot, uVan + iu * stap);
          for (var k = 0; k < w; k++) {
            var q = st.pts[k], P = plek(u, q.p), N = plekN(q.n);
            pos.push(P[0], P[1], P[2]); nrm.push(N[0], N[1], N[2]);
            uvw.push(u, q.s - vNul, deel, st.f); tan.push(U[0], U[1], U[2]);
            nV++;
          }
        }
        for (iu = 0; iu < nu; iu++) for (k = 0; k + 1 < w; k++) {
          var a = basis + iu * w + k, b = a + 1, c = a + w, d = c + 1;
          if (om) idx.push(a, b, c, b, d, c); else idx.push(a, c, b, b, c, d);
        }
      });
    }
    // Dorpel: doorsnede in (z, y). Voorkant z = PD, dagkant y = PH van de voorkant tot het glas.
    var fD = (PD - RR - GZ1) / (PD - 2 * RR);
    var prD = profielLus(PD, PH, RR, [[], [fD], [], []], function (m, n) {
      if (n[0] > 0.05) return 0;                         // voorkant met de afgeronde randen
      if (n[1] > 0.7 && m[0] > GZ1) return 1;            // dagkant tot het glas
      return 2;
    });
    var v0D = prD.lus[6].s;                              // v = 0 onderaan de voorkant
    strook(prD, 0, 0, LEN, 0.5, function (u, p) { return [u, p[1], p[0]]; }, function (n) { return [0, n[1], n[0]]; }, [1, 0, 0], v0D, false);
    // Stijl: doorsnede in (x, z). Voorkant z = PD, dagkant x = SW. u = vanaf de bovenkant naar beneden.
    var fS = (GZ1 - RR) / (PD - 2 * RR);
    var prS = profielLus(SW, PD, RR, [[fS], [], [], []], function (m, n) {
      if (n[1] > 0.05) return 0;
      if (n[0] > 0.7 && m[1] > GZ1) return 1;
      return 2;
    });
    var v0S = prS.lus[7 + 1 + 6].s;                      // v = 0 rechts op de voorkant (na de hoek rechtsvoor)
    strook(prS, 1, 0, STI, 0.5, function (u, p) { return [p[0], PH + STI - u, p[1]]; }, function (n) { return [n[0], 0, n[1]]; }, [0, -1, 0], v0S, true);
    return { pos: new Float32Array(pos), nrm: new Float32Array(nrm), uvw: new Float32Array(uvw), tan: new Float32Array(tan), idx: new Uint32Array(idx) };
  }

  /* Vaste dingen rond het kozijn: zaagsneden, glas (afstandhouders, randen), rubbers ---------- */
  function vasteDingen(Bw) {
    var M_KAP = function (k) { return { c: [k, 0, 0], r: 0.6, m: 0, id: 8, a: 1 }; };
    // zaagsnede van de dorpel (x = LEN) en van de stijl (y = PH + STI); iets groter dan het profiel, voor de lagen
    var e = 8;
    function vlak(P0, A, B, k, n) {
      var R = [];
      for (var i = 0; i <= 1; i++) {
        var rij = [];
        for (var j = 0; j <= 1; j++) {
          var a = -e + i * (PD + 2 * e), b = -e + j * (70 + 2 * e);
          rij.push(pt(som(P0, som(maal(A, a), maal(B, b))), n, [a, b], A));
        }
        R.push(rij);
      }
      Bw.raster(R, M_KAP(k));
    }
    vlak([LEN + 0.02, 0, PD], [0, 0, -1], [0, 1, 0], 0, [1, 0, 0]);
    vlak([0, PH + STI + 0.02, PD], [0, 0, -1], [1, 0, 0], 1, [0, 1, 0]);
    // afstandhouders tussen de ruiten (zichtbaar door het glas) en de rubbers tegen het glas
    var alu = mat("#b7bcc0", 0.42, 0.9, 10);
    kist(Bw, [SW, PH - 2, GZ0 + 4.5], [LEN - SW, 0, 0], [0, 9, 0], [0, 0, GZ1 - GZ0 - 9], alu, 0.6);
    kist(Bw, [SW - 2, PH, GZ0 + 4.5], [9, 0, 0], [0, STI, 0], [0, 0, GZ1 - GZ0 - 9], alu, 0.6);
    var rub = mat(K.rubber, 0.55, 0, 13);
    cil(Bw, [SW + 1, PH + 1.7, GZ1 + 1.7], [LEN, PH + 1.7, GZ1 + 1.7], 1.9, rub, { seg: 12, kap: true });
    cil(Bw, [SW + 1.7, PH + 1, GZ1 + 1.7], [SW + 1.7, PH + STI, GZ1 + 1.7], 1.9, rub, { seg: 12, kap: true });
    // de randen van de twee ruiten op de zaagkanten
    var gr = mat("#cfe0dc", 0.15, 0, 11);
    [[GZ0, GZ0 + 4], [GZ1 - 4, GZ1]].forEach(function (z) {
      kist(Bw, [LEN - 0.6, PH, z[0]], [0.6, 0, 0], [0, STI, 0], [0, 0, z[1] - z[0]], gr, 0.2);
      kist(Bw, [SW, PH + STI - 0.6, z[0]], [LEN - SW, 0, 0], [0, 0.6, 0], [0, 0, z[1] - z[0]], gr, 0.2);
    });
  }
  function glasMesh(Bw) {
    var g = mat("#ffffff", 0.02, 0, 12);
    [GZ1, GZ0].forEach(function (z, i) {
      var R = [[pt([SW, PH, z], [0, 0, 1]), pt([SW, PH + STI, z], [0, 0, 1])], [pt([LEN, PH, z], [0, 0, 1]), pt([LEN, PH + STI, z], [0, 0, 1])]];
      Bw.raster(R, i ? mat("#ffffff", 0.02, 0, 12, 0.5) : g);
    });
  }

  /* WebGL opzetten ---------------------------------------------------------------- */
  var GLM = null;
  var ATTR = ["aPos", "aNrm", "aUV", "aTan", "aCol", "aPrm"];
  function maakProgramma(gl, vs, fs) {
    function sh(type, src) {
      var s = gl.createShader(type); gl.shaderSource(s, src); gl.compileShader(s);
      if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) { var log = gl.getShaderInfoLog(s); throw new Error("shader: " + log); }
      return s;
    }
    var p = gl.createProgram(); gl.attachShader(p, sh(gl.VERTEX_SHADER, vs)); gl.attachShader(p, sh(gl.FRAGMENT_SHADER, fs));
    ATTR.forEach(function (n, i) { gl.bindAttribLocation(p, i, n); });
    gl.linkProgram(p);
    if (!gl.getProgramParameter(p, gl.LINK_STATUS)) throw new Error("link: " + gl.getProgramInfoLog(p));
    var u = {}, n = gl.getProgramParameter(p, gl.ACTIVE_UNIFORMS);
    for (var i = 0; i < n; i++) { var info = gl.getActiveUniform(p, i), naam = info.name.replace(/\[0\]$/, ""); u[naam] = gl.getUniformLocation(p, info.name); }
    return { p: p, u: u };
  }
  function motorStart(schaduwMaat) {
    if (GLM) return GLM.ok ? GLM : null;
    GLM = { ok: false };
    if (typeof document === "undefined") return null;
    try {
      var cv = document.createElement("canvas"); cv.width = 16; cv.height = 16;
      var gl = cv.getContext("webgl2", { antialias: true, alpha: true, premultipliedAlpha: true, preserveDrawingBuffer: true, depth: true });
      if (!gl) return null;
      GLM.cv = cv; GLM.gl = gl;
      GLM.pK = maakProgramma(gl, VS_KOZIJN, FS_OPP);
      GLM.pD = maakProgramma(gl, VS_DING, FS_OPP);
      GLM.sK = maakProgramma(gl, VS_KOZIJN, FS_SCHADUW);
      GLM.sD = maakProgramma(gl, VS_DING, FS_SCHADUW);
      GLM.pA = maakProgramma(gl, VS_ACHTER, FS_ACHTER);
      // het kozijn
      var km = kozijnMesh();
      GLM.kVao = gl.createVertexArray(); gl.bindVertexArray(GLM.kVao);
      function attr(prog, naam, data, n) {
        var loc = ATTR.indexOf(naam);
        var b = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, b); gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW);
        gl.enableVertexAttribArray(loc); gl.vertexAttribPointer(loc, n, gl.FLOAT, false, 0, 0);
      }
      attr(GLM.pK.p, "aPos", km.pos, 3); attr(GLM.pK.p, "aNrm", km.nrm, 3); attr(GLM.pK.p, "aUV", km.uvw, 4); attr(GLM.pK.p, "aTan", km.tan, 3);
      var ib = gl.createBuffer(); gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, ib); gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, km.idx, gl.STATIC_DRAW);
      GLM.kN = km.idx.length;
      // vaste dingen en glas
      GLM.vast = maakDingBuffer(gl); var bw = new Bouwer(); vasteDingen(bw); vulDingBuffer(gl, GLM.vast, bw, gl.STATIC_DRAW);
      GLM.glas = maakDingBuffer(gl); bw.leeg(); glasMesh(bw); vulDingBuffer(gl, GLM.glas, bw, gl.STATIC_DRAW);
      GLM.dyn = maakDingBuffer(gl); GLM.dynF = maakDingBuffer(gl);
      GLM.bw = new Bouwer(); GLM.bwF = new Bouwer();
      // achtergrond: één driehoek over het hele beeld
      GLM.aVao = gl.createVertexArray(); gl.bindVertexArray(GLM.aVao);
      var ab = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, ab); gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
      gl.enableVertexAttribArray(0); gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
      gl.bindVertexArray(null);
      // schaduwkaart: diepte + hoe ondoorzichtig
      var SM = schaduwMaat || 2048;
      GLM.sm = SM;
      GLM.shD = gl.createTexture(); gl.bindTexture(gl.TEXTURE_2D, GLM.shD);
      gl.texStorage2D(gl.TEXTURE_2D, 1, gl.DEPTH_COMPONENT24, SM, SM);
      GLM.shA = gl.createTexture(); gl.bindTexture(gl.TEXTURE_2D, GLM.shA);
      gl.texStorage2D(gl.TEXTURE_2D, 1, gl.R8, SM, SM);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      GLM.shFb = gl.createFramebuffer(); gl.bindFramebuffer(gl.FRAMEBUFFER, GLM.shFb);
      gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.TEXTURE_2D, GLM.shD, 0);
      gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, GLM.shA, 0);
      if (gl.checkFramebufferStatus(gl.FRAMEBUFFER) !== gl.FRAMEBUFFER_COMPLETE) throw new Error("schaduw-fb");
      gl.bindFramebuffer(gl.FRAMEBUFFER, null);
      GLM.smpV = gl.createSampler();
      gl.samplerParameteri(GLM.smpV, gl.TEXTURE_MIN_FILTER, gl.LINEAR); gl.samplerParameteri(GLM.smpV, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
      gl.samplerParameteri(GLM.smpV, gl.TEXTURE_COMPARE_MODE, gl.COMPARE_REF_TO_TEXTURE); gl.samplerParameteri(GLM.smpV, gl.TEXTURE_COMPARE_FUNC, gl.LEQUAL);
      gl.samplerParameteri(GLM.smpV, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE); gl.samplerParameteri(GLM.smpV, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      GLM.smpR = gl.createSampler();
      gl.samplerParameteri(GLM.smpR, gl.TEXTURE_MIN_FILTER, gl.NEAREST); gl.samplerParameteri(GLM.smpR, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
      gl.samplerParameteri(GLM.smpR, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE); gl.samplerParameteri(GLM.smpR, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      cv.addEventListener("webglcontextlost", function (e) { e.preventDefault(); GLM.ok = false; GLM.verloren = true; });
      GLM.ok = true;
      return GLM;
    } catch (err) {
      if (window.console) console.error("kozijn3d:", err.message);
      GLM.ok = false; GLM.fout = err.message;
      return null;
    }
  }
  function maakDingBuffer(gl) {
    var vao = gl.createVertexArray(); gl.bindVertexArray(vao);
    var b = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, b);
    var namen = [["aPos", 3, 0], ["aNrm", 3, 3], ["aUV", 2, 6], ["aTan", 3, 8], ["aCol", 3, 11], ["aPrm", 4, 14]];
    namen.forEach(function (a) {
      var loc = ATTR.indexOf(a[0]);
      gl.enableVertexAttribArray(loc); gl.vertexAttribPointer(loc, a[1], gl.FLOAT, false, STAP * 4, a[2] * 4);
    });
    gl.bindVertexArray(null);
    return { vao: vao, b: b, n: 0, cap: 0 };
  }
  function vulDingBuffer(gl, D, bw, gebruik) {
    gl.bindBuffer(gl.ARRAY_BUFFER, D.b);
    if (bw.n > D.cap || gebruik === gl.STATIC_DRAW) { gl.bufferData(gl.ARRAY_BUFFER, bw.f.subarray(0, bw.n), gebruik || gl.DYNAMIC_DRAW); D.cap = bw.n; }
    else gl.bufferSubData(gl.ARRAY_BUFFER, 0, bw.f.subarray(0, bw.n));
    D.n = bw.n / STAP;
  }

  /* Eén beeld renderen ------------------------------------------------------------------
     sc = { cam: (van maakCamera), z: (zonesVoor), heat: [x,y,z,s], sweep: [posD, posS, sterkte, soort],
            kap: [[lijm, oud, nieuw], [..]], dingen: function(B, BF) {...}, achtergrond: "licht"|"mint"|null } */
  var LK = een([-0.42, 0.8, 0.5]);
  // Folie in twee kleuren (sRGB 0..1). Crème is het kozijn van "zo herstellen we"; antraciet (de meest voorkomende
  // foliekleur, met houtnerf) is het kozijn van "25 jaar zon": daarop zie je het verschil tussen nieuw en verweerd het best.
  var FOLIE = {
    creme: { nieuw: [0.928, 0.9, 0.83], oud: [0.905, 0.89, 0.85], nerf: 0.0 },
    antraciet: { nieuw: [0.255, 0.272, 0.286], oud: [0.62, 0.63, 0.635], nerf: 0.065, glans: 0.72 },
    // "25 jaar zon": crème die verweert maar niet verkleurt (Max, 16 november 2026). Oud en nieuw hebben dezelfde
    // kleur; de zon neemt de glans weg en geeft barsten, krijtige randen en schilfers, nauwelijks vuil.
    cremeZon: { nieuw: [0.928, 0.9, 0.83], oud: [0.928, 0.9, 0.83], nerf: 0.04, glans: 0.66, vuil: 0.25 }
  };
  var ACHTERKLEUR = {
    licht: [lin("#ffffff"), lin(K.papier), lin("#edebe6")],
    mint: [lin("#c4e3da"), lin("#a9d2c7"), lin("#94c2b6")]
  };
  function iv2(iv) { return iv ? [Math.max(-1e5, iv[0]), Math.min(1e5, iv[1])] : [1e6, 1e6]; }
  // het getekende beeld (linksonder in het WebGL-canvas) op een gewoon canvas zetten
  function plak(ctx, cv, W, H) { ctx.drawImage(cv, 0, cv.height - H, W, H, 0, 0, W, H); }
  function renderScene(W, H, sc) {
    var G = motorStart(sc.schaduwMaat); if (!G) return null;
    var gl = G.gl, c = sc.cam;
    // Het WebGL-canvas groeit mee met het grootste beeld en wordt niet steeds opnieuw gemaakt
    // (twee animaties op één pagina): er wordt linksonder getekend, plak() haalt dat stuk eruit.
    var cw = Math.max(G.cv.width, W), ch = Math.max(G.cv.height, H);
    if (G.cv.width !== cw || G.cv.height !== ch) { G.cv.width = cw; G.cv.height = ch; }
    // dynamische dingen
    G.bw.leeg(); G.bwF.leeg();
    if (sc.dingen) sc.dingen(G.bw, G.bwF);
    vulDingBuffer(gl, G.dyn, G.bw); vulDingBuffer(gl, G.dynF, G.bwF);
    // zones naar uniforms
    var z = sc.z, za = [], zb = [], zc = [];
    for (var m = 0; m < 2; m++) {
      var pel = iv2(z.pel[m]), krab = iv2(z.krab[m]), nw = iv2(z.nieuw[m]), dk = iv2(z.doek[m]), nat = iv2(z.nat[m]), nb = m === 0 ? iv2(z.nieuwBoven) : [1e6, 1e6];
      za.push(pel[0], pel[1], krab[0], krab[1]); zb.push(nw[0], nw[1], dk[0], dk[1]); zc.push(nat[0], nat[1], nb[0], nb[1]);
    }
    var dg = z.doekG || [null, null];
    var doekG = [dg[0] ? dg[0][0] : 0, dg[0] ? dg[0][1] : 0, dg[1] ? dg[1][0] : 0, dg[1] ? dg[1][1] : 0];
    var los = [z.los || 0, z.los0 || LOS0, 0, 0];
    // lichtmatrix (schaduwkaart). sc.lk: de richting van het licht (in "25 jaar zon" de zon, die beweegt)
    var lk = sc.lk || LK, lu = sc.lucht || null;
    var Lc = [250, 175, 60], Lm = M4.mul(M4.ortho(-470, 470, -470, 470, 500, 2100), M4.kijk(som(Lc, maal(lk, 1300)), Lc, Math.abs(lk[1]) > 0.98 ? [0, 0, 1] : [0, 1, 0]));
    function zetAlg(P, schaduwPas) {
      var u = P.u;
      gl.uniform4fv(u.uZa, za); gl.uniform4fv(u.uZb, zb); gl.uniform4fv(u.uZc, zc); gl.uniform4fv(u.uLos, los);
      if (schaduwPas) return;
      gl.uniformMatrix4fv(u.uLmat, false, Lm);
      gl.uniform3fv(u.uEye, c.C); gl.uniform3fv(u.uLk, lk);
      gl.uniform1f(u.uLeeftijd, sc.leeftijd == null ? 1 : sc.leeftijd);
      gl.uniform4f(u.uZon, lk[0], lk[1], lk[2], lu ? (lu.spiegel == null ? 0.6 : lu.spiegel) : 0);
      gl.uniform3fv(u.uLuchtB, lu ? lu.boven : [0, 0, 0]); gl.uniform3fv(u.uLuchtH, lu ? lu.horizon : [0, 0, 0]);
      var fo = sc.folie || FOLIE.creme;
      gl.uniform3fv(u.uFN, fo.nieuw); gl.uniform3fv(u.uFO, fo.oud); gl.uniform1f(u.uNerf, fo.nerf); gl.uniform1f(u.uGlansF, fo.glans || 1); gl.uniform1f(u.uVuil, fo.vuil == null ? 1 : fo.vuil);
      gl.uniform3fv(u.uKey, sc.key || [4.1, 3.85, 3.5]); gl.uniform3fv(u.uHemel, sc.hemel || [0.4, 0.44, 0.5]); gl.uniform3fv(u.uVloer, sc.vloer || [0.3, 0.29, 0.27]);
      gl.uniform3fv(u.uAchter, (ACHTERKLEUR[sc.achtergrond] || ACHTERKLEUR.licht)[1]);
      gl.uniform1f(u.uBel, sc.belichting || 0.94);
      gl.uniform3f(u.uShInfo, sc.schaduw === false ? 0 : 1, 1 / G.sm, 0.06 * 1600 / (940 / G.sm));
      gl.uniform4fv(u.uHeat, sc.heat || [0, 0, 0, 0]); gl.uniform4fv(u.uDoekG, doekG); gl.uniform4fv(u.uSweep, sc.sweep || [0, 0, 0, 0]);
      var kp = sc.kap || [[0, 0, 0], [0, 0, 0]];
      gl.uniform4fv(u.uCapL, [kp[0][0], kp[0][1], kp[0][2], 0, kp[1][0], kp[1][1], kp[1][2], 0]);
      gl.uniform3fv(u.uCapA, [0, 0, -1, 0, 0, -1]); gl.uniform3fv(u.uCapB, [0, 1, 0, 1, 0, 0]); gl.uniform3fv(u.uCapI, [-1, 0, 0, 0, -1, 0]);
      gl.uniform1i(u.uSh, 0); gl.uniform1i(u.uShRaw, 1); gl.uniform1i(u.uShA, 2);
    }
    gl.disable(gl.BLEND); gl.enable(gl.DEPTH_TEST); gl.depthFunc(gl.LEQUAL); gl.disable(gl.CULL_FACE);
    // 1. schaduwkaart
    if (sc.schaduw !== false) {
      gl.bindFramebuffer(gl.FRAMEBUFFER, G.shFb); gl.viewport(0, 0, G.sm, G.sm);
      gl.clearColor(1, 0, 0, 1); gl.clearDepth(1); gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
      gl.enable(gl.POLYGON_OFFSET_FILL); gl.polygonOffset(1.5, 2.0);
      gl.useProgram(G.sK.p); zetAlg(G.sK, true); gl.uniformMatrix4fv(G.sK.u.uVP, false, Lm); gl.uniform1f(G.sK.u.uSoort, 0);
      gl.bindVertexArray(G.kVao); gl.drawElements(gl.TRIANGLES, G.kN, gl.UNSIGNED_INT, 0);
      gl.useProgram(G.sD.p); zetAlg(G.sD, true); gl.uniformMatrix4fv(G.sD.u.uVP, false, Lm); gl.uniform1f(G.sD.u.uSoort, 1);
      [G.vast, G.dyn, G.dynF].forEach(function (D) { if (D.n) { gl.bindVertexArray(D.vao); gl.drawArrays(gl.TRIANGLES, 0, D.n); } });
      gl.disable(gl.POLYGON_OFFSET_FILL);
      gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    }
    gl.viewport(0, 0, W, H);
    gl.activeTexture(gl.TEXTURE0); gl.bindTexture(gl.TEXTURE_2D, G.shD); gl.bindSampler(0, G.smpV);
    gl.activeTexture(gl.TEXTURE1); gl.bindTexture(gl.TEXTURE_2D, G.shD); gl.bindSampler(1, G.smpR);
    gl.activeTexture(gl.TEXTURE2); gl.bindTexture(gl.TEXTURE_2D, G.shA); gl.bindSampler(2, G.smpR);
    gl.clearColor(0, 0, 0, 0); gl.clearDepth(1); gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    // 2. achtergrond
    var ak = ACHTERKLEUR[sc.achtergrond] || ACHTERKLEUR.licht;
    gl.depthMask(false);
    gl.useProgram(G.pA.p);
    gl.uniformMatrix4fv(G.pA.u.uInvVP, false, M4.inv(c.VP)); gl.uniform3fv(G.pA.u.uEye, c.C); gl.uniform2f(G.pA.u.uRes, W, H);
    gl.uniform3fv(G.pA.u.uC0, ak[0]); gl.uniform3fv(G.pA.u.uC1, ak[1]); gl.uniform3fv(G.pA.u.uC2, ak[2]);
    gl.uniform1f(G.pA.u.uDoorzicht, sc.achtergrond === null ? 1 : 0);
    gl.uniform3fv(G.pA.u.uSchDir, sc.lk ? een([lk[0], Math.max(lk[1], 0.12), lk[2]]) : een([-0.2, 1, 0.28])); gl.uniform1f(G.pA.u.uSchK, sc.schaduwZacht || 3.0);
    gl.uniform1f(G.pA.u.uLucht, lu ? 1 : 0);
    if (lu) {
      gl.uniform3fv(G.pA.u.uLB, lu.achterBoven || lu.boven); gl.uniform3fv(G.pA.u.uLH, lu.achterHorizon || lu.horizon); gl.uniform3fv(G.pA.u.uLG, lu.grond);
      gl.uniform4fv(G.pA.u.uBoog, lu.boog); gl.uniform4fv(G.pA.u.uZonP, lu.zon); gl.uniform3fv(G.pA.u.uZonKl, lu.zonKleur); gl.uniform1f(G.pA.u.uStip, lu.stip || 0);
    }
    if (sc.achtergrond === null) { gl.enable(gl.BLEND); gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA); }
    gl.bindVertexArray(G.aVao); gl.drawArrays(gl.TRIANGLES, 0, 3);
    gl.disable(gl.BLEND); gl.depthMask(true);
    // 3. het kozijn
    gl.useProgram(G.pK.p); zetAlg(G.pK); gl.uniformMatrix4fv(G.pK.u.uVP, false, c.VP); gl.uniform1f(G.pK.u.uSoort, 0);
    gl.enable(gl.CULL_FACE); gl.cullFace(gl.BACK);
    gl.bindVertexArray(G.kVao); gl.drawElements(gl.TRIANGLES, G.kN, gl.UNSIGNED_INT, 0);
    gl.disable(gl.CULL_FACE);
    // 4. vaste en losse dingen (ondoorzichtig)
    gl.useProgram(G.pD.p); zetAlg(G.pD); gl.uniformMatrix4fv(G.pD.u.uVP, false, c.VP); gl.uniform1f(G.pD.u.uSoort, 1);
    [G.vast, G.dyn].forEach(function (D) { if (D.n) { gl.bindVertexArray(D.vao); gl.drawArrays(gl.TRIANGLES, 0, D.n); } });
    // 5. glas
    gl.enable(gl.BLEND); gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA); gl.depthMask(false);
    gl.bindVertexArray(G.glas.vao); gl.drawArrays(gl.TRIANGLES, 0, G.glas.n);
    gl.depthMask(true);
    // 6. dingen die in- of uitfaden: eerst alleen de diepte, dan de kleur (dan schemert een ding niet door zichzelf heen)
    if (G.dynF.n) {
      gl.bindVertexArray(G.dynF.vao);
      gl.disable(gl.BLEND); gl.colorMask(false, false, false, false); gl.drawArrays(gl.TRIANGLES, 0, G.dynF.n);
      gl.colorMask(true, true, true, true); gl.enable(gl.BLEND); gl.depthFunc(gl.EQUAL);
      gl.drawArrays(gl.TRIANGLES, 0, G.dynF.n);
      gl.depthFunc(gl.LEQUAL);
    }
    gl.disable(gl.BLEND);
    gl.bindVertexArray(null);
    return G.cv;
  }
