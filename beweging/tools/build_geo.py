"""Turn the extracted logo vectors into an animation-friendly geometry description (geo.json)."""
import json, math, sys
J = json.load(open(sys.argv[1]))

def r3(v): return round(v, 3)
def fmt(v):
    s = ('%.3f' % v).rstrip('0').rstrip('.')
    return '0' if s in ('-0', '') else s

def cubic_pts(p0, p1, p2, p3, n=24):
    out = []
    for i in range(1, n + 1):
        t = i / n; mt = 1 - t
        out.append((mt**3*p0[0] + 3*mt*mt*t*p1[0] + 3*mt*t*t*p2[0] + t**3*p3[0],
                    mt**3*p0[1] + 3*mt*mt*t*p1[1] + 3*mt*t*t*p2[1] + t**3*p3[1]))
    return out

def true_bbox(subpaths):
    xs, ys = [], []
    for sub in subpaths:
        cur = None
        for seg in sub:
            if seg[0] == 'M' or seg[0] == 'L':
                cur = seg[1]; xs.append(cur[0]); ys.append(cur[1])
            elif seg[0] == 'C':
                for p in cubic_pts(cur, seg[1], seg[2], seg[3]):
                    xs.append(p[0]); ys.append(p[1])
                cur = seg[3]
    return [min(xs), min(ys), max(xs), max(ys)]

def sub_d(sub, dx=0, dy=0):
    out = []
    for seg in sub:
        if seg[0] == 'Z': out.append('Z')
        else: out.append(seg[0] + ' '.join(fmt(p[0] + dx) + ' ' + fmt(p[1] + dy) for p in seg[1:]))
    if out[-1] != 'Z': out.append('Z')
    return ''.join(out)

geo = {}
mk = J['Middel 18.pdf']
order = sorted(range(3), key=lambda i: mk['shapes'][i]['bbox'][0])  # short, long1, long2 by x
pills = []
for i in order:
    raw = mk['shapes'][i]['raw'][0]
    # M A0 | C A1 | L A2 | C A3 | L A4 | C A5 | L A6 | C A7 | Z
    assert ''.join(s[0] for s in raw) == 'MCLCLCLCZ'
    A0 = raw[0][1]; c01 = raw[1][1:3]; A1 = raw[1][3]; A2 = raw[2][1]; c23 = raw[3][1:3]; A3 = raw[3][3]
    A4 = raw[4][1]; c45 = raw[5][1:3]; A5 = raw[5][3]; A6 = raw[6][1]; c67 = raw[7][1:3]; A7 = raw[7][3]
    S = (A0[0] - A7[0], A0[1] - A7[1])
    bot = [A0, c01[0], c01[1], A1, A2, c23[0], c23[1], A3]
    top = [A4, c45[0], c45[1], A5, A6, c67[0], c67[1], A7]
    # cap centre when collapsed onto the top
    pts = [A4, A5, A6, A7] + [(p[0] - S[0], p[1] - S[1]) for p in (A0, A1, A2, A3)]
    tc = (sum(p[0] for p in pts) / 8, sum(p[1] for p in pts) / 8)
    pills.append({'bot': [[r3(p[0]), r3(p[1])] for p in bot], 'top': [[r3(p[0]), r3(p[1])] for p in top],
                  'S': [round(S[0], 4), round(S[1], 4)], 'tc': [r3(tc[0]), r3(tc[1])],
                  'len': r3(math.hypot(*S)), 'ang': round(math.degrees(math.atan2(S[1], S[0])), 4)})
dots = []
for i in (3, 4):
    bb = true_bbox(mk['shapes'][i]['raw'])
    dots.append({'cx': r3((bb[0] + bb[2]) / 2), 'cy': r3((bb[1] + bb[3]) / 2), 'r': r3((bb[2] - bb[0]) / 2)})
dots.sort(key=lambda d: d['cx'])
geo['mark'] = {'w': mk['w'], 'h': mk['h'], 'pills': pills, 'dots': dots}

# wordmark (horizontal lock-up coordinates)
hz = J['Iwrap logo liggend - donker.pdf']
names = ['i', 'W', 'r', 'a', 'p']
parts = []
for name, s in zip(names, hz['shapes'][5:10]):
    raw = s['raw']
    if name == 'i':
        subs = sorted(raw, key=lambda sp: true_bbox([sp])[1])  # dot first (higher up)
        for nm, sp in zip(['i-dot', 'i-stem'], subs):
            parts.append({'id': nm, 'd': sub_d(sp), 'bbox': [r3(v) for v in true_bbox([sp])]})
    else:
        parts.append({'id': name, 'd': ''.join(sub_d(sp) for sp in raw), 'bbox': [r3(v) for v in true_bbox(raw)]})
wb = [min(p['bbox'][0] for p in parts), min(p['bbox'][1] for p in parts), max(p['bbox'][2] for p in parts), max(p['bbox'][3] for p in parts)]
geo['word'] = {'parts': parts, 'bbox': [r3(v) for v in wb], 'baseline': r3(true_bbox(hz['shapes'][6]['raw'])[3])}

# tagline (stacked + tagline lock-up coordinates)
tg = J['Middel 8.pdf']
chars = 'SPECIALISTINKOZIJNFOLIE'
tparts = []
for ch, s in zip(chars, tg['shapes'][10:33]):
    bb = true_bbox(s['raw'])
    tparts.append({'ch': ch, 'd': ''.join(sub_d(sp) for sp in s['raw']), 'bbox': [r3(v) for v in bb]})
tb = [min(p['bbox'][0] for p in tparts), min(p['bbox'][1] for p in tparts), max(p['bbox'][2] for p in tparts), max(p['bbox'][3] for p in tparts)]
geo['tag'] = {'parts': tparts, 'bbox': [r3(v) for v in tb], 'words': [10, 2, 11]}

def first_pt(shape): return shape['raw'][0][0][1]
def lock(name, has_tag=False):
    f = J[name]
    # mark offset: compare dot L centre
    dl = None
    for s in f['shapes'][:5]:
        if len(s['raw'][0]) == 5:  # circle M C C C C
            bb = true_bbox(s['raw'])
            c = ((bb[0] + bb[2]) / 2, (bb[1] + bb[3]) / 2)
            if dl is None or c[0] < dl[0]: dl = c
    mx, my = dl[0] - dots[0]['cx'], dl[1] - dots[0]['cy']
    out = {'w': f['w'], 'h': f['h'], 'mark': [r3(mx), r3(my)]}
    if len(f['shapes']) >= 10:
        a = first_pt(f['shapes'][6]); b = first_pt(hz['shapes'][6])   # W
        out['word'] = [r3(a[0] - b[0]), r3(a[1] - b[1])]
    if has_tag:
        a = first_pt(f['shapes'][10]); b = first_pt(tg['shapes'][10])
        out['tag'] = [r3(a[0] - b[0]), r3(a[1] - b[1])]
    return out

geo['lockups'] = {
    'mark': {'w': mk['w'], 'h': mk['h'], 'mark': [0, 0]},
    'horizontal': lock('Iwrap logo liggend - donker.pdf'),
    'stacked': lock('Middel 14.pdf'),
    'tagline': lock('Middel 8.pdf', True),
}
ic = J['Middel 12.pdf']
geo['icon'] = {'w': ic['w'], 'h': ic['h']}
geo['colors'] = {'mint': '#A7CEC5', 'ink': '#262626', 'gray': '#676A6B', 'white': '#FFFFFF'}
json.dump(geo, open(sys.argv[2], 'w'), separators=(',', ':'))
print(json.dumps({k: geo[k] for k in ('lockups', 'icon')}, indent=1))
print('pills:')
for p in pills: print('  S', p['S'], 'len', p['len'], 'ang', p['ang'], 'tc', p['tc'])
print('dots:', dots)
print('word bbox', geo['word']['bbox'], 'baseline', geo['word']['baseline'])
for p in parts: print('  ', p['id'], p['bbox'])
print('tag bbox', geo['tag']['bbox'])
print('geo.json bytes:', len(json.dumps(geo, separators=(',', ':'))))
