"""Maakt van een map met beelden een video.

Beelden heten f<frame>_<sample>.png (bijvoorbeeld f00012_03.png). Heeft een frame meerdere samples,
dan worden die gemiddeld: dat geeft de bewegingsonscherpte.

Twee routes, met hetzelfde resultaat:
- Op een Mac: de eigen encoder tools/encode (gemaakt met Swift uit encode.swift; wordt zo nodig eerst gebouwd).
- Elders (Linux, de cloud) of als IWRAP_ENCODER=ffmpeg: met ffmpeg (apt install ffmpeg / brew install ffmpeg).
"""
import os, re, shutil, subprocess, platform

HIER = os.path.dirname(os.path.abspath(__file__))
ENC = os.path.join(HIER, "encode")

def _swift_encoder():
    if os.environ.get("IWRAP_ENCODER") == "ffmpeg":
        return None
    if os.path.exists(ENC):
        return ENC
    if platform.system() == "Darwin" and shutil.which("swiftc"):
        subprocess.run(["swiftc", "-O", "-swift-version", "5", os.path.join(HIER, "encode.swift"), "-o", ENC], check=True)
        return ENC
    return None

def maak_video(beelden, uit, fps=30, codec="h264", bitrate=None, alpha=None, gif=None):
    """beelden: de map met f<frame>_<sample>.png; uit: het videobestand; codec: h264, prores4444, hevcalpha of gif."""
    enc = _swift_encoder()
    if enc:
        cmd = [enc, beelden, uit, "--fps", str(fps), "--codec", codec]
        if bitrate: cmd += ["--bitrate", str(bitrate)]
        if alpha: cmd += ["--alpha", alpha]
        for k, v in (gif or {}).items(): cmd += ["--" + k, str(v)]
        r = subprocess.run(cmd, capture_output=True, text=True)
        if r.returncode != 0:
            raise RuntimeError("encode: " + r.stderr)
        return r.stdout.strip()
    ff = shutil.which("ffmpeg")
    if not ff:
        raise RuntimeError("Geen video-encoder gevonden. Installeer ffmpeg (Linux: apt install ffmpeg, Mac: brew install ffmpeg), "
                           "of werk op een Mac met de Xcode-commandoregeltools (swiftc).")
    frames = {}
    for n in os.listdir(beelden):
        m = re.match(r"f(\d+)_(\d+)\.png$", n)
        if m: frames.setdefault(int(m.group(1)), {})[int(m.group(2))] = n
    if not frames:
        raise RuntimeError("geen beelden in " + beelden)
    N = max(max(s) + 1 for s in frames.values())
    rij = os.path.join(beelden, "_rij")
    shutil.rmtree(rij, ignore_errors=True); os.makedirs(rij)
    i = 0
    for f in sorted(frames):          # elk frame krijgt precies N samples (een stilstaand beeld wordt herhaald)
        s = frames[f]
        for j in range(N):
            bron, doel = os.path.join(beelden, s.get(j) or s[min(s)]), os.path.join(rij, "s%07d.png" % i)
            try: os.link(bron, doel)
            except OSError: shutil.copyfile(bron, doel)
            i += 1
    filters = []
    if N > 1:
        filters += ["tmix=frames=%d" % N, "select='eq(mod(n\\,%d)\\,%d)'" % (N, N - 1), "setpts=N/(%d*TB)" % fps]
    cmd = [ff, "-y", "-loglevel", "error", "-framerate", str(fps * N), "-i", os.path.join(rij, "s%07d.png")]
    if codec == "gif":
        filters.append("split[a][b];[a]palettegen[p];[b][p]paletteuse")
        cmd += ["-filter_complex", ",".join(filters)] if N > 1 else ["-filter_complex", filters[-1]]
    else:
        if filters: cmd += ["-vf", ",".join(filters)]
        if codec == "h264":
            cmd += ["-c:v", "libx264", "-pix_fmt", "yuv420p", "-preset", "slow", "-movflags", "+faststart"]
            cmd += ["-b:v", str(bitrate)] if bitrate else ["-crf", "18"]
        else:                          # prores4444 en hevcalpha: ProRes 4444 met doorzichtigheid
            cmd += ["-c:v", "prores_ks", "-profile:v", "4444", "-pix_fmt", "yuva444p10le"]
    cmd += ["-r", str(fps), uit]
    subprocess.run(cmd, check=True)
    shutil.rmtree(rij, ignore_errors=True)
    return "%s  (ffmpeg, %d frames)" % (os.path.basename(uit), len(frames))
