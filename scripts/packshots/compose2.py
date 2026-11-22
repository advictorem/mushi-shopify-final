"""Pack-shot composites from the genuine pack PNGs and box photos.

Artwork pixels are placed as-is (scaled/rotated only). Everything else is generated:
a seamless studio sweep, soft floor contact shadows, a soft cast shadow to the left
(light from the upper right), and occlusion shadows that each front item throws onto
the items behind it.

usage: compose2.py OUT_DIR [name ...]
"""
import sys, os, json
import numpy as np, cv2
from PIL import Image

N = 2048
SRC = os.environ.get('PACKSHOT_SRC', 'design-source/packshots/src')


def rgb(h):
    h = h.lstrip('#'); return np.array([int(h[i:i + 2], 16) for i in (0, 2, 4)], np.float32)


def sweep(wall, floor, horizon):
    y = np.linspace(0, 1, N)[:, None]
    b = np.clip((y - (horizon - 0.10)) / 0.20, 0, 1); b = b * b * (3 - 2 * b)
    img = rgb(wall)[None, None] * (1 - b[..., None]) + rgb(floor)[None, None] * b[..., None]
    img = np.broadcast_to(img, (N, N, 3)).copy()
    # gentle light falloff: brighter upper right, a touch darker lower left
    yy, xx = np.mgrid[0:N, 0:N] / N
    img *= (0.965 + 0.05 * (xx * 0.6 + (1 - yy) * 0.4))[..., None]
    return np.clip(img, 0, 255)


def load(name):
    im = Image.open(f'{SRC}/{name}').convert('RGBA')
    return im.crop(im.split()[-1].point(lambda v: 255 if v > 8 else 0).getbbox())


# ---------- chocolate box lying flat: rectified spine (front) + cover (top, foreshortened)
CHOC_QUADS = dict(spine=[(423, 260), (603, 252), (605, 1808), (458, 1750)],
                  cover=[(603, 252), (1645, 242), (1613, 1529), (605, 1808)])


def rectify(name, quad, w, h):
    a = np.asarray(Image.open(f'{SRC}/{name}').convert('RGBA'))
    M = cv2.getPerspectiveTransform(np.float32(quad), np.float32([(0, 0), (w, 0), (w, h), (0, h)]))
    return cv2.warpPerspective(a, M, (w, h), flags=cv2.INTER_LANCZOS4, borderMode=cv2.BORDER_REPLICATE)


def lying_box(name, top_frac=0.075):
    """A chocolate box lying flat, seen from just above: the spine faces camera, a sliver of cover on top."""
    L, T = 1540, 168
    spine = rectify(name, CHOC_QUADS['spine'], T, L)          # tall strip, text reads downward
    spine = np.rot90(spine, 1).copy()                          # -> horizontal, reads left to right
    cover = rectify(name, CHOC_QUADS['cover'], L, L)
    # the spine in the render faces away from the light; lift it to sit with the cover's exposure
    s_med = np.median(spine[..., :3].reshape(-1, 3), 0); c_med = np.median(cover[..., :3].reshape(-1, 3), 0)
    lift = np.clip((c_med.mean() * 0.86) / max(s_med.mean(), 1), 1.0, 1.5)
    spine[..., :3] = np.clip(spine[..., :3].astype(np.float32) * lift, 0, 255).astype(np.uint8)
    th = max(8, round(L * top_frac))
    top = cv2.resize(cover, (L, th), interpolation=cv2.INTER_AREA)
    top[..., :3] = np.clip(top[..., :3].astype(np.float32) * 1.03, 0, 255).astype(np.uint8)
    out = np.zeros((th + spine.shape[0], L, 4), np.uint8)
    out[:th] = top; out[th:] = spine; out[..., 3] = 255
    # soft edge so it doesn't look cut out
    al = np.zeros(out.shape[:2], np.uint8); al[1:-1, 1:-1] = 255
    out[..., 3] = cv2.GaussianBlur(al, (0, 0), 0.8)
    return Image.fromarray(out)


# ---------- shadows
def blur(m, s):
    return cv2.GaussianBlur(m, (0, 0), s) if s > 0 else m


def multiply(img, mask, tint, strength):
    """Darken img towards tint under mask (0..1)."""
    t = (tint / 255.0)[None, None]
    f = 1 - strength * mask[..., None] * (1 - t)
    return img * f


def footprint(alpha_full, base_y, depth):
    """Contact shadow band under an item: its bottom silhouette squashed onto the floor."""
    cols = alpha_full[max(base_y - 30, 0):base_y + 2].max(0) > 0.5
    m = np.zeros_like(alpha_full)
    if cols.any():
        xs = np.where(cols)[0]
        cv2.ellipse(m, (int((xs[0] + xs[-1]) / 2), int(base_y)), (int((xs[-1] - xs[0]) / 2 * 1.02), int(depth)), 0, 0, 360, 1.0, -1)
    return m


def contact(alpha, depth):
    """Per column: a gradient starting at the item's lowest opaque pixel, fading over `depth` px."""
    on = alpha > 0.5
    has = on.any(0)
    yb = np.where(has, N - 1 - np.argmax(on[::-1], 0), -10**6).astype(np.float32)
    y = np.arange(N, dtype=np.float32)[:, None]
    m = np.clip(1 - (y - yb[None]) / depth, 0, 1) * (y >= yb[None] - 3)
    return m.astype(np.float32)


class Scene:
    def __init__(self, wall, floor, horizon, shadow):
        self.img = sweep(wall, floor, horizon)
        self.occ = np.zeros((N, N), np.float32)      # coverage of items already placed
        self.tint = rgb(shadow)
        self.rec = []

    def add(self, item, cx, base, height, rot=0.0, floor=True, name=None, shadow=1.0):
        im = load(item) if isinstance(item, str) else item
        s = height * N / im.height
        im = im.resize((round(im.width * s), round(im.height * s)), Image.LANCZOS)
        if rot:
            im = im.rotate(rot, resample=Image.BICUBIC, expand=True)
        x = round(cx * N - im.width / 2); y = round(base * N - im.height)
        a = np.zeros((N, N), np.float32)
        x0, y0 = max(x, 0), max(y, 0); x1, y1 = min(x + im.width, N), min(y + im.height, N)
        arr = np.asarray(im).astype(np.float32)
        a[y0:y1, x0:x1] = arr[y0 - y:y1 - y, x0 - x:x1 - x, 3] / 255
        w = im.width
        T = self.tint
        # 1. floor cast shadow: silhouette laid back onto the floor, leaning left (light upper right)
        if floor:
            b = float(base * N)
            M = np.float32([[1, 0.55, -0.55 * b], [0, 0.20, 0.80 * b]])
            proj = cv2.warpAffine(a, M, (N, N), flags=cv2.INTER_LINEAR)
            self.img = multiply(self.img, blur(proj, 0.035 * w), T, 0.38 * shadow)
        # 2. soft shadow thrown back-left onto the wall and anything behind
        sh = np.roll(np.roll(a, -int(0.06 * w), 1), -int(0.015 * w), 0)
        self.img = multiply(self.img, blur(sh, 0.07 * w), T, 0.30 * shadow)
        # 3. occlusion onto items already placed: tighter and darker, only on those items
        occ = blur(np.roll(np.roll(a, -int(0.025 * w), 1), -int(0.008 * w), 0), 0.04 * w) * self.occ
        self.img = multiply(self.img, np.clip(occ * 1.25, 0, 1), T, 0.60 * shadow)
        # 4. contact shadow hugging the real bottom edge
        if floor:
            self.img = multiply(self.img, blur(contact(a, 0.045 * w), 0.025 * w), T, 0.55 * shadow)
            self.img = multiply(self.img, blur(contact(a, 0.012 * w), 0.006 * w), T, 0.75 * shadow)
        # 5. the artwork itself, untouched
        rgbv = np.zeros((N, N, 3), np.float32); rgbv[y0:y1, x0:x1] = arr[y0 - y:y1 - y, x0 - x:x1 - x, :3]
        self.img = self.img * (1 - a[..., None]) + rgbv * a[..., None]
        self.occ = np.maximum(self.occ, a)
        self.rec.append(dict(item=name or item, x=x, y=y, w=im.width, h=im.height, scale=s, rot=rot))

    def save(self, path):
        Image.fromarray(np.clip(self.img, 0, 255).astype(np.uint8)).save(path, quality=93)


# ---------- layouts
BG = {
    'cherry': ('#F3B9B2', '#EAA79F', '#A8524A'),
    'apple': ('#D9E8C2', '#CADDAE', '#5E7A3C'),
    'peach': ('#FBD3B8', '#F3C2A2', '#A8603A'),
    'mixed': ('#FAE3CC', '#F1D0B4', '#9A6A48'),
    'milk': ('#F1DCCD', '#E7CDBA', '#8A5C44'),
    'dark': ('#E3CDBF', '#D6BCAA', '#6B4434'),
    'berry': ('#CFE4DE', '#BFD8D0', '#4C6E66'),
}


def five(flavors, bg):
    """UNREAL structure: two behind and higher, three in front, centre closest."""
    S = Scene(*BG[bg][:2], 0.78, BG[bg][2])
    f = flavors
    S.add(f'{f[0]}-pack.png', 0.372, 0.600, 0.445, floor=False)
    S.add(f'{f[1]}-pack.png', 0.628, 0.606, 0.445, floor=False)
    S.add(f'{f[2]}-pack.png', 0.262, 0.872, 0.455)
    S.add(f'{f[3]}-pack.png', 0.738, 0.876, 0.455)
    S.add(f'{f[4]}-pack.png', 0.500, 0.892, 0.470)
    return S


def ten_box(flavor):
    """The real 10-pack box with one pouch standing in front of its right side."""
    S = Scene(*BG[flavor][:2], 0.74, BG[flavor][2])
    box = f'{flavor}-10box-cut.png' if flavor != 'peach' else 'peach-10box-matched.png'
    if flavor == 'peach':
        S.add(box, 0.590, 0.800, 0.470)
        S.add('peach-pack.png', 0.290, 0.885, 0.470)
    elif flavor == 'apple':
        S.add(box, 0.425, 0.790, 0.470)
        S.add('apple-pack.png', 0.735, 0.885, 0.455)
    else:
        S.add(box, 0.420, 0.800, 0.480)
        S.add(f'{flavor}-pack.png', 0.715, 0.885, 0.470)
    return S


def choc_stack(flavor, count):
    """Boxes lying flat in a loose stack (same box size as the one standing), one box standing in front."""
    S = Scene(*BG[flavor][:2], 0.76, BG[flavor][2])
    slab = lying_box(f'{flavor}-pack.png')
    n = count - 1
    Hb = 0.50 if n > 5 else 0.56                 # standing box height, fraction of frame
    s_box = Hb * N / 1595                        # standing box px scale (render bbox height 1595)
    k = 1042 * s_box / 1540 * 1.00               # lying box: cover width matches, a touch further back
    slab_h = slab.height * k / N
    step = 168 * k / N
    rng = np.random.default_rng(11 + count)
    offs = rng.uniform(-0.022, 0.022, n); offs[0] = 0
    base = 0.745 if n > 5 else 0.765; cx = 0.36 if n > 5 else 0.34
    for i in range(n):
        S.add(slab, cx + offs[i], base - i * step, slab_h, floor=(i == 0), name=f'{flavor}-lying-{i}', shadow=0.9)
    S.add(f'{flavor}-pack.png', 0.66, 0.865 if n > 5 else 0.88, Hb)
    return S


JOBS = {
    'cherry-5pack': lambda: five(['cherry'] * 5, 'cherry'),
    'apple-5pack': lambda: five(['apple'] * 5, 'apple'),
    'peach-5pack': lambda: five(['peach'] * 5, 'peach'),
    'gummies-custom-5pack': lambda: five(['apple', 'cherry', 'cherry', 'apple', 'peach'], 'mixed'),
    'cherry-10pack': lambda: ten_box('cherry'),
    'peach-10pack': lambda: ten_box('peach'),
    'apple-10pack': lambda: ten_box('apple'),
    'milk-5pack': lambda: choc_stack('milk', 5),
    'milk-10pack': lambda: choc_stack('milk', 10),
    'dark-5pack': lambda: choc_stack('dark', 5),
    'dark-10pack': lambda: choc_stack('dark', 10),
    'berry-5pack': lambda: choc_stack('berry', 5),
    'berry-10pack': lambda: choc_stack('berry', 10),
}

if __name__ == '__main__':
    out = sys.argv[1]; os.makedirs(out, exist_ok=True)
    names = sys.argv[2:] or list(JOBS)
    rec = {}
    for n in names:
        S = JOBS[n](); S.save(f'{out}/{n}.jpg'); rec[n] = S.rec; print(n)
    json.dump(rec, open(f'{out}/placements-{"-".join(names) if len(names) < 3 else "all"}.json', 'w'), indent=1)
