"""Render a film strip (contact sheet) of a scene:  strip.py out.png scene '{"opts":..}' n cols cw [t0 t1] [cellbg]"""
import sys, os, json, time, urllib.parse
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from cdp import Chrome
SP = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
def strip(c, out, scene, opts, n=12, cols=4, cw=360, t0=None, t1=None, cellbg='#ffffff', times=None):
    q = {'scene': scene, 'opts': json.dumps(opts), 'n': n, 'cols': cols, 'cw': cw, 'cellbg': cellbg}
    if t0 is not None: q['t0'] = t0
    if t1 is not None: q['t1'] = t1
    if times: q['times'] = ','.join(str(t) for t in times)
    url = 'file://' + os.path.join(SP, 'dist', 'strip.html') + '?' + urllib.parse.urlencode(q)
    c.size(cols * cw + 6 * (cols + 1), 400)
    c.goto(url, wait=0.15)
    for _ in range(80):
        if c.js('window.DONE === true', False): break
        errs = [m for m in c.console() if m.startswith('EXC')]
        if errs: break
        time.sleep(0.1)
    errs = [m for m in c.console() if m.startswith('EXC')]
    if errs: print('\n'.join(e[:900] for e in errs)); return None
    w, h = c.js('SIZE')
    c.size(int(w), int(h))
    c.js('new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(()=>r(1))))')
    c.shot(out)
    info = c.js('INFO')
    return info
if __name__ == '__main__':
    jobs = json.loads(sys.argv[1])
    c = Chrome(1200, 800)
    try:
        for j in jobs:
            info = strip(c, **j)
            print(os.path.basename(j['out']), json.dumps(info))
    finally:
        c.close()
