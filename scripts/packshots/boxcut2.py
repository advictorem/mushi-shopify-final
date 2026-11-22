"""Cut a box off a white sweep: distance-from-background mask -> largest blob -> convex hull.
usage: boxcut2.py SRC OUT [thresh]"""
import sys, numpy as np, cv2
from PIL import Image, ImageFilter
src, out = sys.argv[1], sys.argv[2]; th = float(sys.argv[3]) if len(sys.argv) > 3 else 14
im = np.asarray(Image.open(src).convert('RGB')).astype(np.float32)
# background estimate: heavy blur of the image with the centre filled by border statistics
bg = cv2.GaussianBlur(im, (0, 0), 120)
h, w = im.shape[:2]
border = np.concatenate([im[:40].reshape(-1, 3), im[-40:].reshape(-1, 3), im[:, :40].reshape(-1, 3), im[:, -40:].reshape(-1, 3)])
ref = np.median(border, 0)
d = np.abs(im - ref).max(-1)
sat = im.max(-1) - im.min(-1)
m = ((d > th) | (sat > 18)).astype(np.uint8)
m = cv2.morphologyEx(m, cv2.MORPH_CLOSE, np.ones((25, 25), np.uint8))
n, lab, st, _ = cv2.connectedComponentsWithStats(m)
k = 1 + int(np.argmax(st[1:, cv2.CC_STAT_AREA])); m = (lab == k).astype(np.uint8)
cnts, _ = cv2.findContours(m, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_NONE)
hull = cv2.convexHull(max(cnts, key=cv2.contourArea))
mask = np.zeros_like(m); cv2.fillPoly(mask, [hull], 255)
mask = cv2.erode(mask, np.ones((5, 5), np.uint8))
al = Image.fromarray(mask).filter(ImageFilter.GaussianBlur(1.2))
u = Image.open(src).convert('RGB'); u.putalpha(al); u = u.crop(al.point(lambda v: 255 if v > 8 else 0).getbbox()); u.save(out)
print(out, u.size)
