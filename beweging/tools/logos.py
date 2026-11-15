"""Logoset voor de website: exacte SVG's uit de PDF-vectoren, PNG's, favicon/app-iconen en een deelafbeelding."""
import sys, os, json, base64, struct, io
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from cdp import Chrome
NS = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
J = json.load(open(os.path.join(NS, 'logos.json')))
OUT = os.path.join(NS, 'web', 'logo')
INK, MINT, WHITE = '#262626', '#A7CEC5', '#FFFFFF'

def svg_from(pdf, recolor=None, title='iWrap'):
    f = J[pdf]; W, H = f['w'], f['h']
    groups = []
    for s in f['shapes']:
        fill = s['fill']
        if recolor: fill = recolor.get(fill, fill)
        if groups and groups[-1][0] == fill: groups[-1][1].append(s['d'])
        else: groups.append([fill, [s['d']]])
    body = '\n'.join('  <path fill="%s" d="%s"/>' % (c, ''.join(ds)) for c, ds in groups)
    return ('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 %s %s" width="%s" height="%s" role="img" aria-label="%s">\n  <title>%s</title>\n%s\n</svg>\n'
            % (fmt(W), fmt(H), fmt(W), fmt(H), title, title, body)), W, H

def fmt(v): return ('%.3f' % v).rstrip('0').rstrip('.')

SETS = [  # bestandsnaam, pdf, kleurwissel, omschrijving
    ('iwrap-logo-liggend', 'Iwrap logo liggend - donker.pdf', None),
    ('iwrap-logo-liggend-licht', 'Iwrap logo liggend - licht.pdf', None),
    ('iwrap-logo-liggend-wit', 'Middel 11.pdf', None),
    ('iwrap-logo-gestapeld', 'Middel 14.pdf', None),
    ('iwrap-logo-gestapeld-licht', 'Middel 13.pdf', None),
    ('iwrap-logo-gestapeld-wit', 'Middel 9.pdf', None),
    ('iwrap-logo-tagline', 'Middel 8.pdf', None),
    ('iwrap-logo-tagline-licht', 'Middel 7.pdf', None),
    ('iwrap-logo-tagline-wit', 'Middel 10.pdf', None),
    ('iwrap-beeldmerk', 'Middel 18.pdf', None),
    ('iwrap-beeldmerk-wit', 'Middel 17.pdf', None),
    ('iwrap-beeldmerk-donker', 'Middel 18.pdf', {MINT: INK}),
]
meta = {}
for name, pdf, rc in SETS:
    s, W, H = svg_from(pdf, rc)
    open(os.path.join(OUT, 'svg', name + '.svg'), 'w').write(s)
    meta[name] = (W, H)

# vierkant app-icoon: wit beeldmerk op mint (en het favicon met afgeronde hoeken)
mk = J['Middel 18.pdf']
mark_paths = ''.join('<path fill="#FFFFFF" d="%s"/>' % s['d'] for s in mk['shapes'])
def icon_svg(size, radius, pad):
    w = size * (1 - 2 * pad); sc = w / mk['w']; h = mk['h'] * sc
    return ('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 %d %d" width="%d" height="%d"><title>iWrap</title>'
            '<rect width="%d" height="%d" rx="%s" fill="%s"/><g transform="translate(%s %s) scale(%s)">%s</g></svg>\n'
            % (size, size, size, size, size, size, fmt(radius), MINT, fmt((size - w) / 2), fmt((size - h) / 2), fmt(sc), mark_paths))
open(os.path.join(OUT, 'favicon', 'favicon.svg'), 'w').write(icon_svg(64, 14, 0.14))
open(os.path.join(OUT, 'svg', 'iwrap-app-icoon.svg'), 'w').write(icon_svg(512, 0, 0.19))

def shot(c, html, w, h, path, transparent=True, fmt_='png', scale=1):
    p = os.path.join(NS, 'out', '_logo.html')
    open(p, 'w').write('<!doctype html><html><head><meta charset="utf-8"><style>html,body{margin:0;background:transparent}svg,img{display:block;width:%dpx;height:%dpx}</style></head><body>%s</body></html>' % (w, h, html))
    c.size(w, h, scale); c.transparent(transparent); c.goto('file://' + p, wait=0.25)
    if fmt_ == 'png':
        c.shot(path)
    else:
        d = c.call('Page.captureScreenshot', {'format': 'jpeg', 'quality': 90})
        open(path, 'wb').write(base64.b64decode(d['data']))

c = Chrome(800, 600)
try:
    # PNG's: logo's op twee breedtes, beeldmerken vierkant-achtig
    for name, (W, H) in meta.items():
        svg = open(os.path.join(OUT, 'svg', name + '.svg')).read()
        for width in ((600, 1200) if 'beeldmerk' not in name else (300, 600)):
            h = round(width * H / W)
            shot(c, svg.replace('<svg ', '<svg style="width:%dpx;height:%dpx" ' % (width, h), 1), width, h, os.path.join(OUT, 'png', '%s-%d.png' % (name, width)))
    # iconen
    app = open(os.path.join(OUT, 'svg', 'iwrap-app-icoon.svg')).read()
    for size, fn in [(180, 'apple-touch-icon.png'), (192, 'icon-192.png'), (512, 'icon-512.png')]:
        shot(c, app.replace('<svg ', '<svg style="width:%dpx;height:%dpx" ' % (size, size), 1), size, size, os.path.join(OUT, 'favicon', fn))
    fav = open(os.path.join(OUT, 'favicon', 'favicon.svg')).read()
    pngs = {}
    for size in (16, 32, 48):
        pth = os.path.join(NS, 'out', '_fav%d.png' % size)
        shot(c, fav.replace('<svg ', '<svg style="width:%dpx;height:%dpx" ' % (size, size), 1), size, size, pth)
        pngs[size] = open(pth, 'rb').read()
    open(os.path.join(OUT, 'favicon', 'favicon-32.png'), 'wb').write(pngs[32])
    # favicon.ico met PNG-inhoud (16, 32 en 48 pixels)
    sizes = (16, 32, 48); off = 6 + 16 * len(sizes); hdr = struct.pack('<HHH', 0, 1, len(sizes)); ent = b''; data = b''
    for s_ in sizes:
        ent += struct.pack('<BBBBHHII', s_, s_, 0, 0, 1, 32, len(pngs[s_]), off + len(data)); data += pngs[s_]
    open(os.path.join(OUT, 'favicon', 'favicon.ico'), 'wb').write(hdr + ent + data)
    # deelafbeelding 1200 x 630: mint vlak met merkpatroon en het logo met tagline
    js = open(os.path.join(NS, 'dist', 'iwrap-motion.js')).read()
    html = ('<div id="s" style="width:1200px;height:630px"></div><script>%s</script><script>'
            'var sc=iWrapMotion.create("eindkaart",{frame:[1200,630],theme:"mint",fit:0.5});document.getElementById("s").appendChild(sc.svg);sc.render(sc.rest);</script>' % js)
    shot(c, html, 1200, 630, os.path.join(OUT, 'deelafbeelding', 'iwrap-deelafbeelding-1200x630.jpg'), transparent=False, fmt_='jpeg')
finally:
    c.close()
json.dump({k: [round(v[0], 3), round(v[1], 3)] for k, v in meta.items()}, open(os.path.join(NS, 'out', 'logo_meta.json'), 'w'))
for root, dirs, files in os.walk(OUT):
    for fn in sorted(files):
        print('%7.1f kB  %s' % (os.path.getsize(os.path.join(root, fn)) / 1024, os.path.relpath(os.path.join(root, fn), OUT)))
