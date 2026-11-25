"""Generate responsive WebP/AVIF images for the site from assets/.

Run from the repo root:  python3 scripts/build_images.py
Outputs go to img/. Every output is kept under ~400KB.
"""
from pathlib import Path
from PIL import Image, ImageOps

ROOT = Path(__file__).resolve().parent.parent
SRC = ROOT / "assets"
OUT = ROOT / "img"
OUT.mkdir(exist_ok=True)
LIMIT = 400 * 1024


def save_variants(im, name, widths, q_webp=78, q_avif=55, avif=True):
    im = im.convert("RGB")
    for w in widths:
        if w > im.width:
            w = im.width
        h = round(im.height * w / im.width)
        r = im.resize((w, h), Image.LANCZOS)
        for fmt, q in (("webp", q_webp), ("avif", q_avif)):
            if fmt == "avif" and not avif:
                continue
            p = OUT / f"{name}-{w}.{fmt}"
            qq = q
            while True:
                r.save(p, fmt.upper(), quality=qq, method=6) if fmt == "webp" else r.save(p, "AVIF", quality=qq, speed=4)
                if p.stat().st_size <= LIMIT or qq <= 35:
                    break
                qq -= 6
            print(f"{p.name:40s} {w}x{h} {p.stat().st_size // 1024}KB q{qq}")


def crop_frac(im, top, bottom):
    return im.crop((0, round(im.height * top), im.width, round(im.height * bottom)))


# Hero: portrait for phones, landscape crop for wide screens
sky = Image.open(SRC / "photos/warehouses-sky-wide.jpg")
save_variants(sky.crop((0, 260, sky.width, sky.height)), "hero-portrait", [640, 960, 1280])
# landscape 16:9 crop keeping horizon + buildings
w = sky.width
h = round(w * 9 / 16)
top = 1180
save_variants(sky.crop((0, top, w, top + h)), "hero-wide", [1280, 1920])

# Gallery photos
for n in ["aerial-angle-1", "aerial-angle-2", "aerial-top-down", "loading-docks-front", "warehouses-sky-wide"]:
    im = Image.open(SRC / f"photos/{n}.jpg")
    save_variants(im, n, [640, 1280, 1920] if im.width > im.height else [640, 1080, 1600])

# Site plan (clean, top-down)
plan = Image.open(SRC / "plan/site-plan-topdown-clean.jpg")
save_variants(plan, "site-plan", [640, 960, 1254], q_webp=80)

# Location map from brochure (trim the cream frame)
loc = Image.open(SRC / "plan/location-map-from-brochure.jpg")
loc = loc.crop((0, 12, loc.width, loc.height - 18))
save_variants(loc, "location-map", [640, 1240], q_webp=80)

# Textures (decorative, low weight)
from PIL import ImageFilter
for n, ws in [("dark-waves", [1600]), ("white-waves", [1600])]:
    save_variants(Image.open(SRC / f"textures/{n}.jpg"), n, ws, q_webp=60, q_avif=40)
# bronze fabric is very grainy: soften it so it compresses well
br = Image.open(SRC / "textures/bronze-fabric.jpg").resize((1200, 800), Image.LANCZOS).filter(ImageFilter.GaussianBlur(2))
save_variants(br, "bronze-fabric", [1200], q_webp=60, q_avif=40)

# AlQemam logo: light strokes on dark -> transparent PNG/WebP in warm grey
al = Image.open(SRC / "brand/alqemam-logo-from-brochure.png").convert("RGB")
g = ImageOps.grayscale(al)
bg = 37
alpha = g.point(lambda v: max(0, min(255, int((v - bg) * 255 / (205 - bg)))))
for name, color in [("alqemam-logo-light", (230, 222, 212)), ("alqemam-logo-dark", (38, 38, 38))]:
    out = Image.new("RGBA", al.size, color + (0,))
    out.putalpha(alpha)
    bbox = alpha.point(lambda v: 255 if v > 20 else 0).getbbox()
    out = out.crop(bbox)
    out.thumbnail((360, 360), Image.LANCZOS)
    out.save(OUT / f"{name}.png", optimize=True)
    out.save(OUT / f"{name}.webp", quality=90, method=6)
    print(name, out.size)

# QR (keep crisp, pure black on white)
qr = Image.open(SRC / "brand/ad-license-qr.png").convert("L")
qr = qr.point(lambda v: 0 if v < 128 else 255).convert("1")
qr.save(OUT / "ad-license-qr.png", optimize=True)
print("qr", qr.size, (OUT / "ad-license-qr.png").stat().st_size // 1024, "KB")
