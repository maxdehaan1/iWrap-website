import sys, os, json
SP = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
geo = open(os.path.join(SP, 'geo.json')).read()
src = open(os.path.join(SP, 'src', 'iwrap-motion.src.js')).read()
assert '__GEO__' in src
js = src.replace('__GEO__', geo, 1)
os.makedirs(os.path.join(SP, 'dist'), exist_ok=True)
open(os.path.join(SP, 'dist', 'iwrap-motion.js'), 'w').write(js)
print('iwrap-motion.js', len(js), 'bytes')
film_path = os.path.join(SP, 'src', 'film.src.js')
filmjs = js
if os.path.exists(film_path):
    parts = [open(film_path).read()]
    for extra in ('film2.src.js', 'pages.src.js'):
        ep = os.path.join(SP, 'src', extra)
        if os.path.exists(ep): parts.append(open(ep).read())
    film = '\n'.join(parts).replace('__NLDATA__', open(os.path.join(SP, 'nl.json')).read())
    marker = "  /* ================================================================ speler */"
    assert marker in js
    filmjs = js.replace(marker, film + "\n" + marker, 1)
open(os.path.join(SP, 'dist', 'iwrap-film.js'), 'w').write(filmjs)
print('iwrap-film.js', len(filmjs), 'bytes')
# iwrap-video.js: alleen om video's te renderen (iwrap-film.js + de uitleg-video's); niet voor de website
videojs = filmjs
uitleg_path = os.path.join(SP, 'src', 'uitleg.src.js')
if os.path.exists(uitleg_path):
    marker = "  /* ================================================================ speler */"
    videojs = filmjs.replace(marker, open(uitleg_path).read() + "\n" + marker, 1)
open(os.path.join(SP, 'dist', 'iwrap-video.js'), 'w').write(videojs)
print('iwrap-video.js', len(videojs), 'bytes')

strip = """<!doctype html><html><head><meta charset="utf-8"><style>
html,body{margin:0;background:#8a8f8e;font:11px/1 -apple-system,Helvetica,sans-serif}
#grid{display:grid;gap:6px;padding:6px}
.wrapc{display:flex;flex-direction:column}
.cell{position:relative;overflow:hidden}
.lab{background:#333;color:#fff;padding:2px 4px;font-size:10px}
</style><link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Montserrat:wght@500;600;700&display=block"></head><body><div id="grid"></div><script src="../3d%20kozijn/kozijn3d.js"></script><script src="../3d%20kozijn/kozijn-klus.js"></script><script src="iwrap-video.js"></script><script>
(async function () {
try { await Promise.all([document.fonts.load("500 30px Montserrat"), document.fonts.load("600 30px Montserrat"), document.fonts.load("700 30px Montserrat")]); } catch (e) {}
var q = new URLSearchParams(location.search);
var name = q.get('scene'), opts = JSON.parse(q.get('opts') || '{}');
var n = +(q.get('n') || 12), cols = +(q.get('cols') || 4), cw = +(q.get('cw') || 360);
var bg = q.get('cellbg') || '#ffffff';
var grid = document.getElementById('grid');
grid.style.gridTemplateColumns = 'repeat(' + cols + ',' + cw + 'px)';
var probe = iWrapMotion.create(name, opts);
var t0 = q.get('t0') != null ? +q.get('t0') : 0, t1 = q.get('t1') != null ? +q.get('t1') : probe.duration;
var times = q.get('times') ? q.get('times').split(',').map(Number) : null;
if (times) n = times.length;
window.INFO = {duration: probe.duration, rest: probe.rest, T: probe.T || null, cut: probe.cut || null};
for (var i = 0; i < n; i++) {
  var t = times ? times[i] : (n === 1 ? t0 : t0 + (t1 - t0) * i / (n - 1));
  var cell = document.createElement('div'); cell.className = 'cell'; cell.style.background = bg; cell.style.width = cw + 'px';
  var sc = iWrapMotion.create(name, opts);
  var vb = sc.svg.viewBox.baseVal;
  cell.style.height = Math.round(cw * vb.height / vb.width) + 'px';
  sc.svg.style.height = '100%';
  var lab = document.createElement('div'); lab.className = 'lab'; lab.textContent = t.toFixed(2) + 's';
  var wc = document.createElement('div'); wc.className = 'wrapc'; wc.appendChild(cell); wc.appendChild(lab);
  cell.appendChild(sc.svg); grid.appendChild(wc);
  sc.render(t);
}
window.SIZE = [grid.offsetWidth, grid.offsetHeight];
window.DONE = true;
})();
</script></body></html>"""
open(os.path.join(SP, 'dist', 'strip.html'), 'w').write(strip)

frame = """<!doctype html><html><head><meta charset="utf-8"><style>
html,body{margin:0;width:100%;height:100%;overflow:hidden;background:transparent}
#s{position:absolute;inset:0}
#s svg{width:100%;height:100%;display:block}
</style><link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Montserrat:wght@500;600;700&display=block"></head><body><div id="s"></div><script src="../3d%20kozijn/kozijn3d.js"></script><script src="../3d%20kozijn/kozijn-klus.js"></script><script src="iwrap-video.js"></script><script>
window.FONTS = Promise.all([document.fonts.load("500 30px Montserrat"), document.fonts.load("600 30px Montserrat"), document.fonts.load("700 30px Montserrat")]).then(function () { return 1; }, function () { return 0; });
var q = new URLSearchParams(location.search);
var sc = iWrapMotion.create(q.get('scene'), JSON.parse(q.get('opts') || '{}'));
document.getElementById('s').appendChild(sc.svg);
sc.svg.style.height = '100%';
window.INFO = {duration: sc.duration, rest: sc.rest, endless: !!sc.endless, loopDur: sc.loopDur || 0, introDur: sc.introDur || 0, cut: sc.cut || null};
window.seek = function (t) { sc.render(t); return new Promise(function (r) { requestAnimationFrame(function () { requestAnimationFrame(function () { r(t); }); }); }); };
sc.render(0);
</script></body></html>"""
open(os.path.join(SP, 'dist', 'frame.html'), 'w').write(frame)

# ---- showcase (artifact body + standalone local file) ----
tpl_path = os.path.join(SP, 'src', 'showcase.tpl.html')
if os.path.exists(tpl_path):
    tpl = open(tpl_path).read()
    rows_path = os.path.join(SP, 'src', 'file_rows.html')
    rows = open(rows_path).read() if os.path.exists(rows_path) else '<tr><td>—</td><td>De video\'s worden nog gerenderd.</td><td></td></tr>'
    nvid_path = os.path.join(SP, 'src', 'nvideo.txt')
    nvid = open(nvid_path).read().strip() if os.path.exists(nvid_path) else '…'
    fd_path = os.path.join(SP, 'src', 'filmdur.txt')
    film_dur = open(fd_path).read().strip() if os.path.exists(fd_path) else '54'
    k3 = os.path.join(SP, '3d kozijn')
    k3js = ''.join(open(os.path.join(k3, n), encoding='utf-8').read() + '\n' for n in ('kozijn3d.js', 'kozijn-sting.js', 'kozijn-klus.js') if os.path.exists(os.path.join(k3, n))) if os.path.exists(k3) else ''
    tpl = tpl.replace('/*__KOZIJN3D__*/', k3js.replace('</script', '<\\/script'))
    page = tpl.replace('/*__ENGINE__*/', filmjs.replace('</script', '<\\/script')).replace('__FILM_DUR__', film_dur).replace('__FILE_ROWS__', rows).replace('__N_VIDEO__', nvid)
    os.makedirs(os.path.join(SP, 'artifact'), exist_ok=True)
    open(os.path.join(SP, 'artifact', 'iwrap-motion-kit.html'), 'w').write(page)
    local = '<!doctype html>\n<html lang="nl">\n<head>\n<meta charset="utf-8">\n<meta name="viewport" content="width=device-width, initial-scale=1">\n<style>html{color-scheme:light}body{margin:0}</style>\n' + page.replace('<meta name="claude:viewport-fit-sides" content="cover">\n', '') 
    # move title/link/style into head: simple approach — close head after the first </style> of the template
    idx = local.index('</style>', local.index('/* Opzet')) + len('</style>')
    local = local[:idx] + '\n</head>\n<body>\n' + local[idx:] + '\n</body>\n</html>\n'
    open(os.path.join(SP, 'dist', 'showcase.html'), 'w').write(local)
    print('showcase', len(page), 'bytes')
print('ok')
