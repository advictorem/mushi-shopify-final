import numpy as np
from PIL import Image
from scipy import ndimage as ndi
from rembg import remove, new_session
sess = new_session('isnet-general-use')
for name in ['CHERRY1', 'APPLE1', 'PEACH1']:
    im = Image.open(f'/home/claude/packshots/src/{name}.png').convert('RGB')
    g = np.asarray(remove(im, session=sess, only_mask=True)) > 128
    G = np.zeros_like(g); G[1745:, 1150:] = g[1745:, 1150:]
    G = ndi.binary_opening(G, iterations=2)
    np.save(f'/tmp/G_{name.lower()}.npy', G); print(name, int(G.sum()))
