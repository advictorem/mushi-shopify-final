import sys, numpy as np
from PIL import Image, ImageFilter
from scipy import ndimage as ndi
from rembg import remove, new_session
src, out = sys.argv[1], sys.argv[2]
im = Image.open(src).convert('RGB')
a = np.asarray(remove(im, session=new_session('isnet-general-use'), only_mask=True))
m = a > 128
lab, n = ndi.label(m); sizes = ndi.sum(m, lab, range(1, n + 1)); m = lab == 1 + int(np.argmax(sizes))
m = ndi.binary_fill_holes(m); m = ndi.binary_erosion(m, iterations=2)
al = Image.fromarray((m * 255).astype('uint8')).filter(ImageFilter.GaussianBlur(1.0))
u = im.copy(); u.putalpha(al); bb = al.point(lambda v: 255 if v > 8 else 0).getbbox(); u = u.crop(bb); u.save(out)
p = Image.new('RGBA', u.size, (255, 0, 255, 255)); p.alpha_composite(u); p.convert('RGB').reduce(3).save('/tmp/dbg/box.jpg', quality=85)
print(out, u.size)
