"""Build one pouch silhouette from the Cherry render and cut all three gummy renders with it."""
import sys, numpy as np
from PIL import Image, ImageFilter
from scipy import ndimage as ndi
a = np.load('/tmp/CHERRY1.png.npy')
H, W = a.shape
m = a > 60
L = np.full(H, -1); R = np.full(H, -1)
for y in range(H):
    xs = np.where(m[y, :1180])[0]          # left half only: no gummies there
    if len(xs): L[y] = xs.min()
top = int(np.where(L >= 0)[0].min())
# centre line from rows where both edges are clean
cs = []
for y in range(top + 60, 1500, 10):
    xs = np.where(m[y])[0]
    if len(xs): cs.append((xs.min() + xs.max()) / 2)
cx = float(np.median(cs))
# bottom profile from the left half, mirrored
bottom = {}
for x in range(int(L[L >= 0].min()), int(cx) + 1):
    ys = np.where(m[:1990, x])[0]
    if len(ys): bottom[x] = ys.max()
S = np.zeros((H, W), bool)
for y in range(top, H):
    if L[y] < 0: continue
    if y < 1450:
        xs = np.where(m[y])[0]; r = xs.max()
        r = min(r, int(round(2 * cx - L[y])) + 6)
    else:
        r = int(round(2 * cx - L[y]))
    S[y, L[y]:r + 1] = True
# Bottom edge: the pouch meets the floor along a dark contact line. Find it per
# column in the clear stretch, fit a smooth curve, and extend it under the gummies.
ref = np.asarray(Image.open('src/CHERRY1.png').convert('L')).astype(np.float32)
ref = ndi.gaussian_filter(ref, 1.5)
gy = np.diff(ref, axis=0)
xs_e, ys_e = [], []
for x in range(600, 1150, 4):
    band = gy[1800:1960, x]
    ys_e.append(1800 + int(np.argmin(band))); xs_e.append(x)
xs_e, ys_e = np.array(xs_e), np.array(ys_e)
keep = np.abs(ys_e - np.median(ys_e)) < 25
coef = np.polyfit(xs_e[keep], ys_e[keep], 2)
print('bottom edge fit', [int(np.polyval(coef, x)) for x in (600, 900, 1200, 1500)])
for x in range(W):
    S[int(np.polyval(coef, x)):, x] = False
S = ndi.binary_opening(S, iterations=2)
np.save('/tmp/pouch_S.npy', S)
print('top', top, 'cx', round(cx, 1), 'bottom', max(bottom.values()), 'area', int(S.sum()))
out = sys.argv[1]
for name in ['CHERRY1', 'APPLE1', 'PEACH1']:
    im = Image.open(f'src/{name}.png').convert('RGB')
    from rembg import remove, new_session
    g = np.asarray(remove(im, session=new_session('isnet-general-use'), only_mask=True)) > 128
    G = np.zeros_like(g); G[1500:, 1150:] = g[1500:, 1150:]          # the two gummies
    G = ndi.binary_opening(G, iterations=2)
    M = ndi.binary_erosion(S | G, iterations=1)
    alpha = Image.fromarray((M * 255).astype('uint8')).filter(ImageFilter.GaussianBlur(1.0))
    rgba = im.copy(); rgba.putalpha(alpha)
    bb = alpha.point(lambda v: 255 if v > 8 else 0).getbbox()
    rgba.crop(bb).save(f'{out}/{name.lower()}.png')
    p = Image.new('RGBA', rgba.size, (255, 0, 255, 255)); p.alpha_composite(rgba)
    p.crop(bb).convert('RGB').reduce(4).save(f'/tmp/dbg/{name.lower()}.jpg', quality=80)
    print(name, bb)
