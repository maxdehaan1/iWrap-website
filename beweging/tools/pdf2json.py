"""Minimal PDF vector extractor (Illustrator-exported, outlined logos) -> JSON with SVG path data (y-down)."""
import sys, re, zlib, json, os

def get_page_content(data):
    chunks = []
    for m in re.finditer(rb'stream\r?\n', data):
        s = m.end()
        e = data.find(b'endstream', s)
        dstart = data.rfind(b'obj', 0, m.start())
        hdr = data[dstart:m.start()]
        raw = data[s:e]
        if b'/Subtype/XML' in hdr or b'/N 3' in hdr or b'/I ' in hdr:
            continue
        if b'FlateDecode' in hdr:
            try:
                dec = zlib.decompressobj().decompress(raw)
            except Exception:
                continue
        else:
            dec = raw
        chunks.append(dec)
    return b'\n'.join(chunks).decode('latin1')

def mat_mul(a, b):
    # a applied first then b? PDF: cm concatenates: CTM' = M x CTM  (row vectors)
    a0,a1,a2,a3,a4,a5 = a
    b0,b1,b2,b3,b4,b5 = b
    return (a0*b0 + a1*b2, a0*b1 + a1*b3,
            a2*b0 + a3*b2, a2*b1 + a3*b3,
            a4*b0 + a5*b2 + b4, a4*b1 + a5*b3 + b5)

def apply(m, x, y):
    return (m[0]*x + m[2]*y + m[4], m[1]*x + m[3]*y + m[5])

def parse(path):
    data = open(path, 'rb').read()
    box = re.search(rb'/MediaBox\s*\[([^\]]*)\]', data).group(1).split()
    W, H = float(box[2]), float(box[3])
    content = get_page_content(data)
    toks = re.findall(r'/[^\s/\[\]<>()]+|[-+]?\d*\.?\d+(?:[eE][-+]?\d+)?|[A-Za-z\*\'"]+', content)
    stack = []
    ctm = (1,0,0,1,0,0)
    gstack = []
    color = (0,0,0)
    cur = []       # list of subpaths; each subpath list of segments in device coords (y-down)
    sub = None
    start = None
    last = None
    shapes = []
    def P(x, y):
        X, Y = apply(ctm, x, y)
        return (X, H - Y)
    for t in toks:
        if re.match(r'^[-+]?\d*\.?\d+(?:[eE][-+]?\d+)?$', t):
            stack.append(float(t)); continue
        if t.startswith('/'):
            stack.append(t); continue
        op = t
        if op == 'q':
            gstack.append((ctm, color))
        elif op == 'Q':
            ctm, color = gstack.pop()
        elif op == 'cm':
            m = tuple(stack[-6:]); ctm = mat_mul(m, ctm)
        elif op == 'm':
            x, y = stack[-2:]
            sub = [('M', P(x, y))]; cur.append(sub); start = (x, y); last = (x, y)
        elif op == 'l':
            x, y = stack[-2:]
            sub.append(('L', P(x, y))); last = (x, y)
        elif op == 'c':
            x1,y1,x2,y2,x3,y3 = stack[-6:]
            sub.append(('C', P(x1,y1), P(x2,y2), P(x3,y3))); last = (x3, y3)
        elif op == 'v':
            x2,y2,x3,y3 = stack[-4:]
            sub.append(('C', P(*last), P(x2,y2), P(x3,y3))); last = (x3, y3)
        elif op == 'y':
            x1,y1,x3,y3 = stack[-4:]
            sub.append(('C', P(x1,y1), P(x3,y3), P(x3,y3))); last = (x3, y3)
        elif op == 'h':
            if sub is not None:
                sub.append(('Z',)); last = start
        elif op == 're':
            x, y, w, h = stack[-4:]
            sub = [('M', P(x, y)), ('L', P(x+w, y)), ('L', P(x+w, y+h)), ('L', P(x, y+h)), ('Z',)]
            cur.append(sub); start = (x, y); last = (x, y)
        elif op in ('f', 'F', 'f*', 'B', 'b'):
            if cur:
                shapes.append({'color': color, 'subpaths': cur})
            cur = []; sub = None
        elif op in ('n', 'S', 's'):
            cur = []; sub = None
        elif op in ('scn', 'sc', 'rg'):
            nums = [v for v in stack[-3:] if isinstance(v, float)]
            if len(nums) == 3:
                color = tuple(nums)
        elif op == 'g':
            color = (stack[-1],)*3
        elif op == 'k':
            c, m_, y_, k = stack[-4:]
            color = ((1-c)*(1-k), (1-m_)*(1-k), (1-y_)*(1-k))
        # W, cs, gs etc: ignore
        stack = []
    return W, H, shapes

def fmt(v):
    s = ('%.3f' % v).rstrip('0').rstrip('.')
    return '0' if s in ('-0', '') else s

def sub_d(sub):
    out = []
    for seg in sub:
        if seg[0] == 'Z': out.append('Z')
        else:
            out.append(seg[0] + ' '.join(fmt(p[0]) + ' ' + fmt(p[1]) for p in seg[1:]))
    if out and out[-1] != 'Z': out.append('Z')
    return ''.join(out)

def bbox(subpaths):
    xs, ys = [], []
    for sub in subpaths:
        for seg in sub:
            for p in seg[1:]:
                xs.append(p[0]); ys.append(p[1])
    return [min(xs), min(ys), max(xs), max(ys)]

def hexc(c):
    return '#%02X%02X%02X' % tuple(int(round(v*255)) for v in c)

if __name__ == '__main__':
    indir, outpath = sys.argv[1], sys.argv[2]
    res = {}
    for fn in sorted(os.listdir(indir)):
        if not fn.lower().endswith('.pdf'): continue
        W, H, shapes = parse(os.path.join(indir, fn))
        items = []
        for s in shapes:
            items.append({'fill': hexc(s['color']), 'rgb': s['color'], 'bbox': [round(v, 3) for v in bbox(s['subpaths'])],
                          'd': ''.join(sub_d(x) for x in s['subpaths']),
                          'subs': [sub_d(x) for x in s['subpaths']],
                          'raw': s['subpaths']})
        res[fn] = {'w': W, 'h': H, 'shapes': items}
        cols = {}
        for it in items: cols[it['fill']] = cols.get(it['fill'], 0) + 1
        print(f"{fn:42s} {W:9.3f} x {H:8.3f}  shapes={len(items):3d}  colors={cols}")
    json.dump(res, open(outpath, 'w'))
