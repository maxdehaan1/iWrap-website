import sys, os, json, time
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from cdp import Chrome
SP = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
url, out, width = sys.argv[1], sys.argv[2], int(sys.argv[3])
dark = len(sys.argv) > 4 and sys.argv[4] == 'dark'
wait = float(sys.argv[5]) if len(sys.argv) > 5 else 0.7
c = Chrome(width, 900)
try:
    if dark: c.call('Emulation.setEmulatedMedia', {'features': [{'name': 'prefers-color-scheme', 'value': 'dark'}]})
    c.goto(url, wait=1.2)
    h = c.js('Math.ceil(document.documentElement.scrollHeight)')
    c.size(width, int(h))
    c.goto(url, wait=wait)
    print('height', h, 'fonts', c.js('Array.from(document.fonts).filter(f=>f.status=="loaded").map(f=>f.family+" "+f.weight).join(", ")'))
    print('overflowX', c.js('document.documentElement.scrollWidth > document.documentElement.clientWidth'))
    errs = [m for m in c.console() if 'EXC' in m or 'rror' in m]
    print('console:', errs[:5])
    c.shot(out)
finally:
    c.close()
