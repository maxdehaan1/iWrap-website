"""Render scenes to video:  render.py '<json list of jobs>'
job = {scene, opts, w, h, out, codec, fps=30, samples=8, shutter=0.5, t0=0, t1=None(duration), bitrate, alpha, gifdelay, keep}"""
import sys, os, json, time, shutil, subprocess, urllib.parse, base64
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from cdp import Chrome
from video_maken import maak_video          # Mac: eigen encoder; elders: ffmpeg
SP = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
ENC = os.path.join(SP, 'tools', 'encode')
DIST = os.environ.get('IWRAP_DIST', 'dist')

def render(c, job):
    w, h = job['w'], job['h']; fps = job.get('fps', 30); N = max(1, job.get('samples', 8)); shutter = job.get('shutter', 0.5)
    opts = dict(job.get('opts', {})); opts.setdefault('frame', [w, h])
    url = 'file://' + os.path.join(SP, DIST, 'frame.html') + '?' + urllib.parse.urlencode({'scene': job['scene'], 'opts': json.dumps(opts)})
    c.size(w, h); c.transparent(True)
    c.goto(url, wait=0.2)
    errs = [m for m in c.console() if m.startswith('EXC')]
    if errs: raise RuntimeError('\n'.join(errs))
    c.js('window.FONTS')
    info = c.js('INFO')
    t0 = job.get('t0', 0.0); t1 = job.get('t1') or info['duration']
    nf = int(round((t1 - t0) * fps))
    tmp = os.path.join(SP, 'frames', os.path.splitext(os.path.basename(job['out']))[0])
    shutil.rmtree(tmp, ignore_errors=True); os.makedirs(tmp)
    def shot(t):
        c.js('seek(%.6f)' % t)
        return c.shot()
    tstart = time.time(); caps = 0; static = 0
    off = 0
    if job.get('prepend_t') is not None:      # e.g. GIF: first frame = finished logo (for mail clients that show only frame 1)
        open(os.path.join(tmp, 'f%05d_00.png' % 0), 'wb').write(shot(job['prepend_t'])); off = 1
    for i0 in range(nf):
        i = i0 + off
        tf = t0 + i0 / fps
        if N == 1:
            open(os.path.join(tmp, 'f%05d_00.png' % i), 'wb').write(shot(tf)); caps += 1
            continue
        ts = [tf + (j / (N - 1) - 0.5) * shutter / fps for j in range(N)]
        a = shot(ts[0]); b = shot(ts[-1]); caps += 2
        open(os.path.join(tmp, 'f%05d_00.png' % i), 'wb').write(a)
        if a == b:
            static += 1
            continue
        open(os.path.join(tmp, 'f%05d_%02d.png' % (i, N - 1)), 'wb').write(b)
        for j in range(1, N - 1):
            open(os.path.join(tmp, 'f%05d_%02d.png' % (i, j)), 'wb').write(shot(ts[j])); caps += 1
    for i in range(0):
        tf = t0 + i / fps
        if N == 1:
            open(os.path.join(tmp, 'f%05d_00.png' % i), 'wb').write(shot(tf)); caps += 1
            continue
        ts = [tf + (j / (N - 1) - 0.5) * shutter / fps for j in range(N)]
        a = shot(ts[0]); b = shot(ts[-1]); caps += 2
        open(os.path.join(tmp, 'f%05d_00.png' % i), 'wb').write(a)
        if a == b:
            static += 1
            continue
        open(os.path.join(tmp, 'f%05d_%02d.png' % (i, N - 1)), 'wb').write(b)
        for j in range(1, N - 1):
            open(os.path.join(tmp, 'f%05d_%02d.png' % (i, j)), 'wb').write(shot(ts[j])); caps += 1
    tcap = time.time() - tstart
    os.makedirs(os.path.dirname(job['out']), exist_ok=True)
    gif = {k: job[k] for k in ('gifdelay', 'giffirst', 'giflast') if job.get(k)}
    uitkomst = maak_video(tmp, job['out'], fps=fps, codec=job['codec'], bitrate=job.get('bitrate'), alpha=job.get('alpha'), gif=gif)
    if not job.get('keep'): shutil.rmtree(tmp, ignore_errors=True)
    print('%-44s %4d frames (%d static) %5d captures in %5.1fs | %s' % (os.path.basename(job['out']), nf, static, caps, tcap, uitkomst.split('  ', 1)[-1]), flush=True)

def still(c, job):
    """job = {scene, opts, w, h, t, out (png) and/or svg, scale}"""
    w, h = job['w'], job['h']
    opts = dict(job.get('opts', {})); opts.setdefault('frame', [w, h])
    url = 'file://' + os.path.join(SP, DIST, 'frame.html') + '?' + urllib.parse.urlencode({'scene': job['scene'], 'opts': json.dumps(opts)})
    c.size(w, h, job.get('scale', 1)); c.transparent(True)
    c.goto(url, wait=0.2)
    c.js('seek(%.6f)' % job.get('t', 0))
    for k in ('out', 'svg'):
        if job.get(k): os.makedirs(os.path.dirname(job[k]), exist_ok=True)
    if job.get('out'): c.shot(job['out'])
    if job.get('svg'):
        txt = c.js("(function(){var s=document.querySelector('#s svg').cloneNode(true);s.removeAttribute('style');s.setAttribute('width','%d');s.setAttribute('height','%d');return new XMLSerializer().serializeToString(s);})()" % (w, h))
        open(job['svg'], 'w').write('<?xml version="1.0" encoding="UTF-8"?>\n' + txt + '\n')
    c.size(w, h, 1)
    print('still %s' % os.path.basename(job.get('out') or job.get('svg')), flush=True)

if __name__ == '__main__':
    jobs = json.loads(open(sys.argv[1]).read()) if os.path.exists(sys.argv[1]) else json.loads(sys.argv[1])
    c = Chrome(1920, 1080)
    try:
        for job in jobs:
            try:
                if job.get('still'): still(c, job)
                else: render(c, job)
            except Exception as e:
                print('FAILED', job.get('out'), str(e)[:600], flush=True)
    finally:
        c.close()
