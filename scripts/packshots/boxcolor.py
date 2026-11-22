"""Match a cut box's cardboard colour (chromaticity) to the same box in a reference photo.
The dominant colour (histogram mode) of each is taken as plain cardboard."""
import sys, numpy as np
from PIL import Image

def mode(rgb):
    q = (rgb // 6).astype(np.int32); key = q[:, 0] * 10000 + q[:, 1] * 100 + q[:, 2]
    vals, cnt = np.unique(key, return_counts=True); k = vals[np.argmax(cnt)]
    sel = rgb[key == k]; return sel.mean(0)

def match(cut, ref_photo, ref_box, out, full=False):
    c = Image.open(cut).convert('RGBA'); a = np.asarray(c).astype(np.float32)
    m = a[..., 3] > 250; src = mode(a[..., :3][m])
    r = np.asarray(Image.open(ref_photo).convert('RGB').crop(ref_box)).astype(np.float32).reshape(-1, 3)
    r = r[(r.max(1) - r.min(1)) > 12]  # drop white backdrop
    ref = mode(r)
    # keep cut's luminance, take ref's chromaticity
    gain = ref / src if full else (ref / ref.mean()) / (src / src.mean())
    a[..., :3] = np.clip(a[..., :3] * gain, 0, 255)
    Image.fromarray(a.astype(np.uint8)).save(out)
    print(out, 'src', src.round(1), 'ref', ref.round(1), 'gain', gain.round(3))

if __name__ == '__main__':
    match(sys.argv[1], sys.argv[2], tuple(map(int, sys.argv[3].split(','))), sys.argv[4], len(sys.argv) > 5)
