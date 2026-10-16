#!/usr/bin/env python3
"""Gera ícones do Android (launcher, adaptativo) e splash a partir do traçado de public/favicon.svg.
Uso: python3 tools/scripts/make_icons.py  (requer Pillow). Substitui os PNGs do template do Capacitor."""
from PIL import Image, ImageDraw
import glob

BG = (15, 23, 34, 255)
FG = (105, 240, 174, 255)
PTS = [(8, 34), (20, 34), (25, 22), (33, 46), (39, 30), (43, 34), (56, 34)]


def ecg(draw, box, width):
    x0, y0, s = box
    p = [(x0 + x * s / 64, y0 + y * s / 64) for x, y in PTS]
    draw.line(p, fill=FG, width=width, joint="curve")
    r = width / 2
    for x, y in (p[0], p[-1]):
        draw.ellipse([x - r, y - r, x + r, y + r], fill=FG)


def icon(n, rounded):
    S = n * 4
    im = Image.new("RGBA", (S, S), (0, 0, 0, 0))
    d = ImageDraw.Draw(im)
    if rounded:
        d.ellipse([0, 0, S - 1, S - 1], fill=BG)
    else:
        d.rounded_rectangle([0, 0, S - 1, S - 1], radius=int(S * 0.18), fill=BG)
    ecg(d, (S * 0.08, S * 0.04, S * 0.84), int(S * 0.07))
    return im.resize((n, n), Image.LANCZOS)


def foreground(n):
    S = n * 4
    im = Image.new("RGBA", (S, S), (0, 0, 0, 0))
    ecg(ImageDraw.Draw(im), (S * 0.21, S * 0.19, S * 0.58), int(S * 0.05))  # zona segura 66/108
    return im.resize((n, n), Image.LANCZOS)


RES = "android/app/src/main/res"
for k, f in {"mdpi": 1, "hdpi": 1.5, "xhdpi": 2, "xxhdpi": 3, "xxxhdpi": 4}.items():
    icon(int(48 * f), False).save(f"{RES}/mipmap-{k}/ic_launcher.png")
    icon(int(48 * f), True).save(f"{RES}/mipmap-{k}/ic_launcher_round.png")
    foreground(int(108 * f)).save(f"{RES}/mipmap-{k}/ic_launcher_foreground.png")
for p in glob.glob(f"{RES}/drawable*/splash.png"):
    w, h = Image.open(p).size
    im = Image.new("RGBA", (w, h), BG)
    s = min(w, h) * 0.35
    ecg(ImageDraw.Draw(im), ((w - s) / 2, (h - s) / 2, s), max(2, int(s * 0.07)))
    im.convert("RGB").save(p)
