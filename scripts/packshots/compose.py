"""MUSHI multi-pack studio compositor.

Builds a seamless studio sweep, then places genuine MUSHI pouch cut-outs back to
front with consistent key light from the front-right: a soft shadow cast left
onto the wall and onto any pouch behind, a floor shadow and a contact line for
the front row. No packaging pixels are generated; every pouch is the original render.

usage: compose.py OUT_DIR [name ...]
"""
import sys, os, json
import numpy as np
from PIL import Image, ImageFilter, ImageChops

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))
PACK = os.path.join(ROOT, 'design-source', 'packshots')
CUT = os.path.join(PACK, 'cutouts')
SRC = os.path.join(ROOT, 'design-source', 'exports')
N = 2400                                  # master canvas
ANCHOR = (1077.5, 1872.0)                 # pouch centre-bottom in the 2160 render frame
POUCH_H = 1607.0                          # pouch height in the render frame


def hex2rgb(h):
    h = h.lstrip('#'); return np.array([int(h[i:i + 2], 16) for i in (0, 2, 4)], np.float32)


def backdrop(p):
    y = np.linspace(0, 1, N)[:, None]; x = np.linspace(0, 1, N)[None, :]
    wall_t, wall_b, floor_b, floor_f = (hex2rgb(p[k]) for k in ('wall_top', 'wall_low', 'floor', 'floor_front'))
    hy = p['horizon']
    t = np.clip(y / hy, 0, 1)[..., None]
    wall = wall_t * (1 - t) + wall_b * t
    f = np.clip((y - hy) / (1 - hy), 0, 1)[..., None]
    floor = floor_b * (1 - f) + floor_f * f
    blend = np.clip((y - (hy - 0.035)) / 0.07, 0, 1)[..., None]
    blend = blend * blend * (3 - 2 * blend)             # smooth sweep, no horizon line
    img = wall * (1 - blend) + floor * blend
    img = np.broadcast_to(img, (N, N, 3)).copy()
    # key light pool from the upper right, gentle falloff to the corners
    d = np.sqrt((x - 0.62) ** 2 * 1.0 + (y - 0.30) ** 2 * 1.3)
    img *= (1.06 - 0.16 * np.clip(d, 0, 1) ** 1.6)[..., None]
    return img


S_MASK = None
AUDIT = []
GUMMY_VARIANTS = {          # only the pair as photographed fully covers the corner it hides
    'A': dict(flip=False, angle=0, scale=1.0, dx=0),
}
_cache = {}
def unit(name, tag):
    """tag 'open' = pouch only (its corner must be hidden); 'A'/'B'/'C' = pouch + real gummies."""
    global S_MASK
    key = (name, tag)
    if key in _cache:
        return _cache[key]
    if S_MASK is None:
        S_MASK = np.load(os.path.join(PACK, 'masks', 'pouch-outline.npz'))['S']
    full = Image.open(f'{CUT}/{name}-full.png').convert('RGBA')
    fa = np.asarray(full).copy()
    pouch = fa.copy(); pouch[..., 3] = np.where(S_MASK, fa[..., 3], 0)
    im = Image.fromarray(pouch)
    if tag != 'open':
        v = GUMMY_VARIANTS[tag]
        Gt = np.load(os.path.join(PACK, 'masks', f'gummies-{name}.npz'))['G']
        g = fa.copy(); g[..., 3] = np.where(Gt, fa[..., 3], 0)
        gimg = Image.fromarray(g)
        bb = gimg.getbbox(); px, py = (bb[0] + bb[2]) / 2, bb[3]
        if v['flip']:
            gimg = gimg.transpose(Image.FLIP_LEFT_RIGHT); cx = 2160 - px
        else:
            cx = px
        ang = np.deg2rad(v['angle']); ca, sa = np.cos(ang) / v['scale'], np.sin(ang) / v['scale']
        tx, ty = px + v['dx'], py
        m = (ca, sa, cx - ca * tx - sa * ty, -sa, ca, py + sa * tx - ca * ty)
        gimg = gimg.transform(gimg.size, Image.AFFINE, m, Image.BICUBIC)
        im = im.copy(); im.alpha_composite(gimg)
    src = np.asarray(Image.open(f'{SRC}/{name.upper()}.png').convert('RGB')).astype(np.float32)
    amb = np.median(src[30:260, 30:260].reshape(-1, 3), 0)    # the render's own backdrop
    _cache[key] = (im, amb)
    return _cache[key]


def place(canvas, item, p, front):
    name, tag, cx, base, h, z, shade = item[:7]
    rot = item[7] if len(item) > 7 else 0.0
    im, amb = unit(name, tag)
    if rot:
        im = im.rotate(rot, resample=Image.BICUBIC, center=ANCHOR)
    s = (h * N) / POUCH_H
    w2, h2 = int(round(im.width * s)), int(round(im.height * s))
    sprite = im.resize((w2, h2), Image.LANCZOS)
    ox = int(round(cx * N - ANCHOR[0] * s)); oy = int(round(base * N - ANCHOR[1] * s))
    rgb = np.asarray(sprite.convert('RGB')).astype(np.float32)
    a = np.asarray(sprite.split()[-1]).astype(np.float32) / 255
    # neutralise the render's original backdrop cast toward this scene's ambient
    tgt = hex2rgb(p['wall_low'])
    rgb *= ((tgt / amb) ** 0.30)[None, None, :]
    rgb *= shade
    def blit_shadow(mask, dx, dy, blur, strength):
        layer = Image.new('L', (N, N), 0)
        layer.paste(Image.fromarray((mask * 255).astype('uint8')), (ox + dx, oy + dy))
        sh = np.asarray(layer.filter(ImageFilter.GaussianBlur(blur))).astype(np.float32) / 255
        canvas[:] *= (1 - strength * sh)[..., None]
    hpx = h * N
    # 1. soft shadow cast to the left onto the wall and onto anything behind
    blit_shadow(a, int(-0.11 * hpx), int(-0.02 * hpx), 0.05 * hpx, p['wall_shadow'] * (1.0 if front else 0.9))
    # 2. a tighter occlusion shadow close to the edge
    blit_shadow(a, int(-0.022 * hpx), int(0.004 * hpx), 0.012 * hpx, 0.22)
    if front:
        # 3. floor shadow: the silhouette laid back along the floor, to the left
        flat = Image.fromarray((a * 255).astype('uint8')).resize((w2, max(4, int(h2 * 0.16))), Image.LANCZOS)
        flat = flat.transform(flat.size, Image.AFFINE, (1, 0.9, 0, 0, 1, 0), Image.BICUBIC)
        fl = Image.new('L', (N, N), 0)
        fy = int(base * N) - flat.height + int(0.01 * hpx)
        fl.paste(flat, (ox - int(0.06 * hpx), fy))
        sh = np.asarray(fl.filter(ImageFilter.GaussianBlur(0.03 * hpx))).astype(np.float32) / 255
        canvas[:] *= (1 - p['floor_shadow'] * sh)[..., None]
        # 4. contact line along every bottom edge (pouch and gummies)
        down = np.zeros_like(a); k = max(2, int(0.006 * hpx)); down[k:] = a[:-k]
        line = np.clip(down - a, 0, 1)
        layer = Image.new('L', (N, N), 0); layer.paste(Image.fromarray((line * 255).astype('uint8')), (ox, oy))
        sh = np.asarray(layer.filter(ImageFilter.GaussianBlur(0.006 * hpx))).astype(np.float32) / 255
        canvas[:] *= (1 - 0.75 * np.clip(sh * 2.2, 0, 1))[..., None]
    # audit masks: whole unit, and (for pouch-only units) the open corner that must stay hidden
    full_a = np.zeros((N, N), np.float32); hole_m = np.zeros((N, N), bool)
    x0, y0 = max(ox, 0), max(oy, 0); x1, y1 = min(ox + w2, N), min(oy + h2, N)
    full_a[y0:y1, x0:x1] = a[y0 - oy:y1 - oy, x0 - ox:x1 - ox]
    if tag == 'open':
        G0 = np.load(os.path.join(PACK, 'masks', f'gummies-{name}.npz'))['G'] & S_MASK
        hm = Image.fromarray((G0 * 255).astype('uint8'))
        if rot:
            hm = hm.rotate(rot, resample=Image.BILINEAR, center=ANCHOR)
        hm = np.asarray(hm.resize((im.width and int(round(2160 * s)), int(round(2160 * s))), Image.BILINEAR)) > 128
        hy, hx = np.nonzero(hm); hy = hy + oy; hx = hx + ox
        ok = (hy >= 0) & (hy < N) & (hx >= 0) & (hx < N)
        hole_m[hy[ok], hx[ok]] = True
    AUDIT.append(dict(name=name, tag=tag, alpha=full_a, hole=hole_m))
    # composite the pouch
    sub_a = a[y0 - oy:y1 - oy, x0 - ox:x1 - ox, None]
    canvas[y0:y1, x0:x1] = canvas[y0:y1, x0:x1] * (1 - sub_a) + rgb[y0 - oy:y1 - oy, x0 - ox:x1 - ox] * sub_a


def grain(img, sigma=2.2, seed=7):
    rng = np.random.default_rng(seed)
    n = rng.normal(0, sigma, (N, N, 1)).astype(np.float32)
    return img + n


def render(spec, out_dir):
    p = spec['palette']
    canvas = backdrop(p)
    items = sorted(spec['items'], key=lambda it: it[5])
    for it in items:
        place(canvas, it, p, front=it[1] != 'open')
    # audit: how much of each pouch shows, and whether any open corner is exposed
    report = []
    for i, it in enumerate(AUDIT):
        cover = np.zeros((N, N), np.float32)
        for later in AUDIT[i + 1:]:
            cover = np.maximum(cover, later['alpha'])
        vis = (it['alpha'] * (1 - cover)).sum() / max(it['alpha'].sum(), 1)
        exposed = int(((cover < 0.5) & it['hole']).sum())
        report.append((it['name'], it['tag'], round(float(vis), 2), exposed))
    spec['audit'] = report
    AUDIT.clear()
    img = np.clip(grain(canvas), 0, 255).astype('uint8')
    out = Image.fromarray(img)
    os.makedirs(out_dir, exist_ok=True)
    path = os.path.join(out_dir, spec['file'] + '.png')
    out.save(path, optimize=True)
    return path, len(spec['items'])


PALETTES = {
    'cherry': dict(wall_top='#F3B2AC', wall_low='#E9938D', floor='#DB7F79', floor_front='#E89A93',
                   horizon=0.79, wall_shadow=0.36, floor_shadow=0.36),
    'apple': dict(wall_top='#DCEBC8', wall_low='#C6DDAA', floor='#B4CF95', floor_front='#C8DDAE',
                  horizon=0.78, wall_shadow=0.26, floor_shadow=0.30),
    'peach': dict(wall_top='#FAD3B3', wall_low='#F3B98C', floor='#E8A577', floor_front='#F2BC92',
                  horizon=0.78, wall_shadow=0.28, floor_shadow=0.32),
    'mixed_gummies': dict(wall_top='#FCE9D6', wall_low='#F7D5B8', floor='#EDBF9B', floor_front='#F5D3B6',
                          horizon=0.79, wall_shadow=0.30, floor_shadow=0.32),
}


def five(flavours, palette, file):
    """2 back (pouch only, bases hidden) + 3 front (pouch with its real gummies, as photographed)."""
    b1, b2, f1, f2, f3 = flavours
    return dict(file=file, palette=PALETTES[palette], items=[
        # name, unit, x, base, height, z, shade, rotation
        (b1, 'open', 0.380, 0.585, 0.400, 1, 0.92, 1.2),
        (b2, 'open', 0.620, 0.598, 0.400, 2, 0.92, -1.0),
        (f1, 'A', 0.268, 0.845, 0.412, 3, 0.985, 1.6),     # set back a little; its gummies tuck behind the centre
        (f3, 'A', 0.742, 0.858, 0.420, 4, 1.0, -1.3),
        (f2, 'A', 0.500, 0.885, 0.440, 5, 1.0, 0.0),       # centre anchor, closest to camera
    ])


def ten(flavours, palette, file):
    """3 back + 4 middle (pouch only) + 3 front (with real gummies): every pouch sits in a gap."""
    fl = list(flavours)
    back = [(0.300, 0.535, 0.292, 1, 1.4), (0.700, 0.545, 0.292, 2, -1.2), (0.500, 0.525, 0.296, 3, 0.0)]
    mid = [(0.190, 0.705, 0.312, 4, 1.8, 'open'), (0.810, 0.712, 0.312, 5, -1.6, 'A'),
           (0.400, 0.695, 0.318, 6, 0.6, 'open'), (0.600, 0.700, 0.318, 7, -0.6, 'open')]
    front = [(0.315, 0.872, 0.334, 8, 1.2), (0.690, 0.880, 0.338, 9, -1.0), (0.500, 0.900, 0.350, 10, 0.0)]
    items = []
    for x, b, h, z, r in back: items.append((fl.pop(0), 'open', x, b, h, z, 0.90, r))
    for x, b, h, z, r, u in mid: items.append((fl.pop(0), u, x, b, h, z, 0.95, r))
    for x, b, h, z, r in front: items.append((fl.pop(0), 'A', x, b, h, z, 1.0, r))
    pal = dict(PALETTES[palette]); pal['horizon'] = 0.70          # middle row stands on the floor
    return dict(file=file, palette=pal, items=items)


SPECS = {
    'mushi-cherry-5pack-hero': five(['cherry1'] * 5, 'cherry', 'mushi-cherry-5pack-hero'),
    'mushi-cherry-10pack-hero': ten(['cherry1'] * 10, 'cherry', 'mushi-cherry-10pack-hero'),
    # Cherry x2, Green Apple x2, Peach Bliss x1: apples ride the back row
    'mushi-gummies-custom-5pack': five(['apple1', 'apple1', 'cherry1', 'peach1', 'cherry1'], 'mixed_gummies',
                                       'mushi-gummies-custom-5pack'),
}

if __name__ == '__main__':
    out = sys.argv[1]
    names = sys.argv[2:] or list(SPECS)
    manifest = {}
    for n in names:
        path, count = render(SPECS[n], out)
        aud = SPECS[n]['audit']
        manifest[n] = dict(file=os.path.basename(path), packages=count,
                           flavours={f: sum(1 for i in SPECS[n]['items'] if i[0] == f) for f in sorted({i[0] for i in SPECS[n]['items']})},
                           min_visible_share=min(a[2] for a in aud), exposed_corner_px=sum(a[3] for a in aud))
        print(n, '->', count, 'packages | visible share per pouch', [a[2] for a in aud], '| exposed corner px', sum(a[3] for a in aud))
    json.dump(manifest, open(os.path.join(out, 'manifest.json'), 'w'), indent=2)
