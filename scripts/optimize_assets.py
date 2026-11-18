#!/usr/bin/env python3
"""Generate web-delivery derivatives from design-source/exports.

Originals stay untouched in design-source/exports. Derivatives are written to
public/assets. Re-run after adding or replacing an export:

    python3 scripts/optimize_assets.py

Requires Pillow (with WebP + AVIF support) and ffmpeg on PATH for the video.
"""
import json
import os
import subprocess
import sys
from PIL import Image

Image.MAX_IMAGE_PIXELS = None
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC = os.path.join(ROOT, "design-source", "exports")
REF = os.path.join(ROOT, "design-source", "reference")
OUT = os.path.join(ROOT, "public", "assets")

# key -> (source file, [widths], section/usage)
RASTER = {
    "product-cherry-pack": ("CHERRY1.jpg", [480, 900], "Gummies carousel / Cherry primary"),
    "product-cherry-hover": ("CHERRY2.jpg", [480, 900], "Gummies carousel / Cherry hover"),
    "product-apple-pack": ("APPLE1.jpg", [480, 900], "Gummies carousel / Green Apple primary"),
    "product-apple-hover": ("APPLE2.jpg", [480, 900], "Gummies carousel / Green Apple hover"),
    "product-peach-pack": ("PEACH1.jpg", [480, 900], "Gummies carousel / Peach Bliss primary"),
    "product-peach-hover": ("PEACH2.jpg", [480, 900], "Gummies carousel / Peach Bliss hover"),
    "product-choco-dark-pack": ("choco-dark1.jpg", [480, 900], "Chocolates carousel / Dark Chocolate primary"),
    "product-choco-dark-hover": ("choco-dark2.jpg", [480, 900], "Chocolates carousel / Dark Chocolate hover"),
    "product-choco-milk-pack": ("choco-milk1.jpg", [480, 900], "Chocolates carousel / Milk Chocolate primary"),
    "product-choco-milk-hover": ("choco-milk2.jpg", [480, 900], "Chocolates carousel / Milk Chocolate hover"),
    "product-choco-berry-pack": ("choco-berry1.jpg", [480, 900], "Chocolates carousel / Midnight Berry primary"),
    "product-choco-berry-hover": ("choco-berry2.jpg", [480, 900], "Chocolates carousel / Midnight Berry hover"),
    "product-hoodie-pack": ("PRODUCTHoodie.jpg", [480, 678], "Shop / Find Your Peace Hoodie primary"),
    "product-hoodie-hover": ("PRODUCTHoodieHOVER.jpg", [480, 676], "Shop / Find Your Peace Hoodie hover"),
    "product-tee-pack": ("PRODUCTT-Shirt.jpg", [480, 678], "Shop / Mushi World Premium Tee primary"),
    "product-tee-hover": ("PRODUCTT-ShirtHOVER.jpg", [480, 676], "Shop / Mushi World Premium Tee hover"),
    "product-pants-pack": ("PRODUCTPants.jpg", [480, 678], "Shop / Distressed Baggy Sweatpants primary"),
    "product-pants-hover": ("PRODUCTPantsHOVER.jpg", [480, 676], "Shop / Distressed Baggy Sweatpants hover"),
    "product-longsleeve-pack": ("PRODUCTShirt.jpg", [480, 678], "Shop / What War Long Sleeve T-Shirt primary"),
    "product-longsleeve-hover": ("PRODUCTShirt-1.jpg", [480, 676], "Shop / What War Long Sleeve T-Shirt hover"),
    "product-beachball-pack": ("PRODUCTBeach-Ball.jpg", [480, 678], "Shop / Beach Ball primary"),
    "product-beachball-hover": ("PRODUCTBeach-BallHOVER.jpg", [480, 676], "Shop / Beach Ball hover"),
    "product-floaty-pack": ("PRODUCTFloatie.jpg", [480, 678], "Shop / Floaty primary"),
    "product-floaty-hover": ("PRODUCTFloatieHOVER.jpg", [480, 676], "Shop / Floaty hover"),
    "product-fan-pack": ("PRODUCTFan.jpg", [480, 678], "Shop / Fan primary"),
    "product-fan-hover": ("PRODUCTFanHOVER.jpg", [480, 676], "Shop / Fan hover"),
    "ingredients-mushroom-blend": ("mushroom-blend.jpg", [640, 1000], "Ingredients / Organic mushroom blend"),
    "ingredients-lab": ("lab-technician.jpg", [640, 1270], "Ingredients / Science is still exploring"),
    "hero-shop-merch": ("JSS_0212.jpg", [1000, 1900], "Merch collection hero"),
    "contact-beach": ("sunset-beach.png", [1250, 2500], "Contact page bottom background"),
    "about-palms": ("palm-trees.png", [1400, 2600], "About / sky and palm backdrop"),
    "about-crowd": ("club.jpg", [514], "About / inline image after LIFE"),
    "about-chocolate": ("mushi-choco-milk-2.png", [640, 1070], "About / inline image before FLAVORS"),
    "about-cherry": ("cherry-2.png", [358], "About / inline image after FLAVORS"),
    "about-picnic": ("picnic.png", [646], "About / inline image after EVERYDAY"),
    "about-peach-pack": ("mushi-peach-product.png", [378], "About / Peach Bliss pack in WE ARE MUSHI"),
    "hero-shop-all": ("Mushi-SHOP-HeroALL.jpg", [1280, 2576], "Shop All hero"),
    "hero-shop-gummies": ("Mushi-SHOP-HeroGUMMIES.jpg", [1280, 2576], "Gummies collection hero"),
    "category-gummies": ("gummies.png", [720, 1400], "Category showcase / Gummies"),
    "category-chocolates": ("chocolates.png", [720, 1400], "Category showcase / Chocolates"),
    "category-merch": ("HOODIE.png", [640, 1200], "Category showcase / Merch"),
    "lifestyle-alive": ("mushi-alive.png", [640, 1100], "Lifestyle accordion / Alive"),
    "lifestyle-focus": ("focus.png", [640, 1100], "Lifestyle accordion / Focus"),
    "lifestyle-present": ("present.png", [640, 1100], "Lifestyle accordion / Present"),
    "lifestyle-creative": ("mushi-creative.png", [640, 1100], "Lifestyle accordion / Creative"),
    "lifestyle-connected": ("mushi-connected.png", [640, 1100], "Lifestyle accordion / Connected"),
    "story-intention": ("intention-photo.png", [800, 1500], "Our Story image"),
    "bundle-group": ("mushi-bundle.png", [900, 1800], "Bundle promotion artwork"),
    "compare-mushi": ("mushi-compare.png", [423], "Why Mushi / Mushi column"),
    "compare-alternatives": ("alternatives.png", [436], "Why Mushi / alternatives column"),
    "wholesale-display": ("wholesale-bulk-packaging-mix.png", [760, 1505], "Wholesale section artwork"),
    "newsletter-bg": ("newsletter-bg.png", [1100, 2000], "Newsletter background"),
}

# Exports with large transparent margins; trimmed to the artwork's bounding box.
TRIM = {"category-gummies", "category-chocolates", "category-merch", "wholesale-display"}

# Exported at partial opacity. Flattened onto the page colour behind them so
# nothing shows through: key -> (export opacity, backing RGB).
FLATTEN = {"compare-alternatives": (0.5, (248, 252, 249))}

# Benefit icons have their label baked into the export. MCT.png is the
# "Made in USA" artwork despite its filename.
ICONS = {
    "benefit-belgian": ("BELGIUM.png", "Brand benefits / 100% Belgium"),
    "benefit-gluten-free": ("GLUTEN FREE.png", "Brand benefits / Gluten-Free"),
    "benefit-lab-tested": ("LAB TESTED.png", "Brand benefits / Lab Tested"),
    "benefit-made-in-usa": ("MCT.png", "Brand benefits / Made in USA (file is named MCT.png)"),
    "benefit-non-gmo": ("NON GMO.png", "Brand benefits / Non-GMO"),
    "benefit-no-palm": ("PALM.png", "Brand benefits / No Palm Oils"),
    "benefit-no-synthetics": ("SYNTHETICS.png", "Brand benefits / No Synthetics"),
    "benefit-vegan": ("VEGAN.png", "Brand benefits / Vegan Gummies"),
    "compare-natural": ("natural.png", "Why Mushi row icon / Natural formula"),
    "compare-non-addictive": ("non-addictive.png", "Why Mushi row icon / Non-addictive"),
    "compare-synthetic": ("synthetic.png", "Why Mushi row icon / Synthetic chemicals"),
    "compare-sugar": ("sugar.png", "Why Mushi row icon / Sugar"),
    "compare-ingredient": ("ingredient.png", "Why Mushi row icon / Ingredient source"),
    "compare-aftereffect": ("aftereffect.png", "Why Mushi row icon / After effects"),
    "compare-dosing": ("dosing.png", "Why Mushi row icon / Dosing"),
    "compare-readiness": ("readiness.png", "Why Mushi row icon / Readiness"),
    "shipping-truck": ("shipping-truck.png", "Announcement marquee icon"),
    "ingredient-plant": ("plant-icon.png", "Ingredients page icon"),
    "ingredient-berry": ("berry-icon.png", "Ingredients page icon"),
    "ingredient-belgian": ("belgium-chocolate-icon.png", "Ingredients benefit / 100% Belgium chocolate"),
    "ingredient-real-berry": ("real-berry-icon.png", "Ingredients benefit / Real berry filling"),
    "ingredient-no-palm": ("nopalm-icon.png", "Ingredients benefit / No palm oil"),
    "ingredient-cane": ("cane-icon.png", "Ingredients page icon"),
}

SVGS = {
    "logo": ("Mushi-Top-Logo(Black).svg", "Header and footer logo (inlined, recoloured with currentColor)"),
    "badge": ("MUSHI-badge.svg", "Hero rotating badge (inlined; outer ring rotates)"),
}

# Temporary stand-ins cropped from the design raster / screenshot because no
# export was supplied. Box is (left, top, right, bottom) as a fraction of the
# reference image. Replace with real exports and delete these entries.
PLACEHOLDERS = {
    "ugc-1": ("homepage-design-raster.png", (0.012, 0.7645, 0.150, 0.7895), "Instagram polaroid 1"),
    "ugc-2": ("homepage-design-raster.png", (0.200, 0.7620, 0.352, 0.7860), "Instagram polaroid 2"),
    "ugc-3": ("homepage-design-raster.png", (0.425, 0.7625, 0.570, 0.7880), "Instagram polaroid 3"),
    "ugc-4": ("homepage-design-raster.png", (0.645, 0.7665, 0.795, 0.7900), "Instagram polaroid 4"),
    "ugc-5": ("homepage-design-raster.png", (0.855, 0.7610, 0.995, 0.7865), "Instagram polaroid 5"),
    "age-gate": ("age-gate-screenshot.png", (0.4995, 0.1210, 0.8360, 0.8715), "Age gate lifestyle image"),
}


def save_all(im, base, quality=78):
    has_alpha = im.mode in ("RGBA", "LA")
    out = {}
    im.save(base + ".webp", "WEBP", quality=quality, method=6)
    out["webp"] = os.path.relpath(base + ".webp", os.path.join(ROOT, "public"))
    try:
        im.save(base + ".avif", "AVIF", quality=58 if not has_alpha else 62, speed=5)
        out["avif"] = os.path.relpath(base + ".avif", os.path.join(ROOT, "public"))
    except Exception as exc:  # AVIF encoder missing
        print("  avif skipped:", exc, file=sys.stderr)
    return out


def main():
    manifest = {"images": {}, "icons": {}, "svg": {}, "placeholders": {}, "video": {}}
    for sub in ("img", "icons", "svg", "video", "placeholder"):
        os.makedirs(os.path.join(OUT, sub), exist_ok=True)

    for key, (fname, widths, usage) in RASTER.items():
        im = Image.open(os.path.join(SRC, fname))
        im = im.convert("RGBA" if im.mode in ("RGBA", "LA", "P") else "RGB")
        if key in FLATTEN:
            opacity, backing = FLATTEN[key]
            r, g, b, a = im.split()
            solid = Image.merge("RGB", (r, g, b))
            faded = Image.blend(Image.new("RGB", im.size, backing), solid, opacity)
            alpha = a.point(lambda v: min(255, round(v / opacity)))
            im = Image.merge("RGBA", (*faded.split(), alpha))
        if key in TRIM:  # drop fully transparent padding so layout can size by the artwork
            im = im.crop(im.getbbox())
        entry = {"original": fname, "usage": usage, "trimmed": key in TRIM, "width": im.width, "height": im.height,
                 "aspectRatio": round(im.width / im.height, 4), "variants": []}
        for w in widths:
            w = min(w, im.width)  # never upscale
            h = round(im.height * w / im.width)
            r = im.resize((w, h), Image.LANCZOS) if w != im.width else im
            files = save_all(r, os.path.join(OUT, "img", f"{key}-{w}"))
            entry["variants"].append({"width": w, **{k: "/" + v for k, v in files.items()}})
        manifest["images"][key] = entry
        print("img", key)

    for key, (fname, usage) in ICONS.items():
        im = Image.open(os.path.join(SRC, fname)).convert("RGBA")
        dest = os.path.join(OUT, "icons", key + ".png")
        im.save(dest, "PNG", optimize=True)
        manifest["icons"][key] = {"original": fname, "usage": usage, "file": f"/assets/icons/{key}.png",
                                  "width": im.width, "height": im.height}

    for key, (fname, usage) in SVGS.items():
        with open(os.path.join(SRC, fname), encoding="utf8") as fh:
            data = fh.read()
        with open(os.path.join(OUT, "svg", key + ".svg"), "w", encoding="utf8") as fh:
            fh.write(data)
        manifest["svg"][key] = {"original": fname, "usage": usage, "file": f"/assets/svg/{key}.svg"}

    for key, (ref, box, usage) in PLACEHOLDERS.items():
        im = Image.open(os.path.join(REF, ref)).convert("RGB")
        l, t, r, b = box
        crop = im.crop((round(l * im.width), round(t * im.height), round(r * im.width), round(b * im.height)))
        dest = os.path.join(OUT, "placeholder", key + ".webp")
        crop.save(dest, "WEBP", quality=86, method=6)
        manifest["placeholders"][key] = {"usage": usage, "file": f"/assets/placeholder/{key}.webp",
                                         "width": crop.width, "height": crop.height,
                                         "missing": True, "source": f"cropped from design-source/reference/{ref}"}

    video = os.path.join(SRC, "mushi-hero-video-gummie.mp4")
    if os.path.exists(video):
        vdir = os.path.join(OUT, "video")
        jobs = [
            (["-vf", "scale=1920:-2", "-c:v", "libx264", "-crf", "24", "-preset", "slow", "-pix_fmt", "yuv420p",
              "-movflags", "+faststart", "-an"], "hero-1080.mp4"),
            (["-vf", "scale=960:-2", "-c:v", "libx264", "-crf", "26", "-preset", "slow", "-pix_fmt", "yuv420p",
              "-movflags", "+faststart", "-an"], "hero-540.mp4"),
        ]
        for args, name in jobs:
            subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-i", video, *args, os.path.join(vdir, name)], check=True)
        # First frame = poster while loading; last frame = resting state / reduced-motion fallback.
        subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-i", video, "-frames:v", "1", "-q:v", "3",
                        os.path.join(vdir, "_first.png")], check=True)
        subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-sseof", "-0.2", "-i", video, "-frames:v", "1",
                        "-update", "1", os.path.join(vdir, "_last.png")], check=True)
        for tmp, name in (("_first.png", "hero-poster"), ("_last.png", "hero-end")):
            im = Image.open(os.path.join(vdir, tmp)).convert("RGB")
            im.save(os.path.join(vdir, name + ".webp"), "WEBP", quality=74, method=6)
            small = im.resize((960, round(im.height * 960 / im.width)), Image.LANCZOS)
            small.save(os.path.join(vdir, name + "-960.webp"), "WEBP", quality=72, method=6)
            os.remove(os.path.join(vdir, tmp))
        manifest["video"]["hero"] = {
            "original": "mushi-hero-video-gummie.mp4 (HEVC 1920x1080, 9.04s)",
            "usage": "Hero background video",
            "sources": ["/assets/video/hero-1080.mp4", "/assets/video/hero-540.mp4"],
            "poster": "/assets/video/hero-poster.webp", "endFrame": "/assets/video/hero-end.webp",
        }
        # About page: the same footage cropped to the mouth for the inline frame after TASTES.
        crop = "crop=960:800:384:205,scale=600:500"
        subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-i", video, "-vf", crop, "-c:v", "libx264", "-crf", "27",
                        "-preset", "slow", "-pix_fmt", "yuv420p", "-movflags", "+faststart", "-an",
                        os.path.join(vdir, "about-mouth.mp4")], check=True)
        subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-sseof", "-0.2", "-i", video, "-vf", crop, "-frames:v", "1",
                        "-update", "1", os.path.join(vdir, "_m.png")], check=True)
        Image.open(os.path.join(vdir, "_m.png")).convert("RGB").save(os.path.join(vdir, "about-mouth-poster.webp"), "WEBP", quality=76, method=6)
        os.remove(os.path.join(vdir, "_m.png"))
        manifest["video"]["about-mouth"] = {
            "original": "mushi-hero-video-gummie.mp4 (cropped to the mouth, 600x500)",
            "usage": "About / inline video after TASTES",
            "sources": ["/assets/video/about-mouth.mp4"], "poster": "/assets/video/about-mouth-poster.webp",
        }

    ferris = os.path.join(SRC, "ferris-wheel-video.mp4")
    if os.path.exists(ferris):
        # About page inline frame after MOMENTS INTO: cropped to the wheel, small, silent.
        vdir = os.path.join(OUT, "video")
        crop = "crop=1500:904:0:88,scale=498:300,fps=24"
        subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-t", "8", "-i", ferris, "-vf", crop, "-c:v", "libx264", "-crf", "31",
                        "-preset", "slow", "-pix_fmt", "yuv420p", "-movflags", "+faststart", "-an",
                        os.path.join(vdir, "about-ferris.mp4")], check=True)
        subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-ss", "2", "-i", ferris, "-vf", crop, "-frames:v", "1",
                        "-update", "1", os.path.join(vdir, "_f.png")], check=True)
        Image.open(os.path.join(vdir, "_f.png")).convert("RGB").save(os.path.join(vdir, "about-ferris-poster.webp"), "WEBP", quality=76, method=6)
        os.remove(os.path.join(vdir, "_f.png"))
        manifest["video"]["about-ferris"] = {
            "original": "ferris-wheel-video.mp4 (H.264 1920x1080, 15.2s, 34.8 MB; first 8s, 498x300, no audio)",
            "usage": "About / inline video after MOMENTS INTO",
            "sources": ["/assets/video/about-ferris.mp4"], "poster": "/assets/video/about-ferris-poster.webp",
        }

    coach = os.path.join(SRC, "mushi-coaching-video-justin.mp4")
    if os.path.exists(coach):
        vdir = os.path.join(OUT, "video")
        subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-i", coach, "-c", "copy", "-movflags", "+faststart",  # already web-ready H.264/AAC
                        os.path.join(vdir, "coaching.mp4")], check=True)
        subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-ss", "0.5", "-i", coach, "-frames:v", "1", "-update", "1",
                        os.path.join(vdir, "_c.png")], check=True)
        im = Image.open(os.path.join(vdir, "_c.png")).convert("RGB")
        im.save(os.path.join(vdir, "coaching-poster.webp"), "WEBP", quality=76, method=6)
        os.remove(os.path.join(vdir, "_c.png"))
        manifest["video"]["coaching"] = {
            "original": "mushi-coaching-video-justin.mp4 (H.264 720x1280, 33.6s, with audio)",
            "usage": "Coaching section video (9:16)",
            "sources": ["/assets/video/coaching.mp4"], "poster": "/assets/video/coaching-poster.webp",
        }

    with open(os.path.join(ROOT, "src", "data", "assets.generated.json"), "w", encoding="utf8") as fh:
        json.dump(manifest, fh, indent=2)
    print("manifest written")


if __name__ == "__main__":
    main()
