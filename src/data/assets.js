// Asset manifest. `assets.generated.json` is written by scripts/optimize_assets.py
// and maps every export in design-source/exports to its optimized derivatives.
import manifest from './assets.generated.json';

export const assets = manifest;

/** Assets the design needs that were not in Mushi Exports.zip. */
export const missingAssets = [
  { need: 'Instagram / UGC photos ×5', standIn: 'placeholder/ugc-1…5.webp' },
  { need: 'Coaching video (instagram.com/p/DeLHTLFAf90) as an .mp4 for inline playback', standIn: 'Instagram embed, cropped to the media' },
  { need: 'Age gate lifestyle image', standIn: 'placeholder/age-gate.webp (cropped from the screenshot)' },
  { need: 'Offer popup A and B artwork + final copy', standIn: 'built from the age gate layout; Figma frames could not be read' },
  { need: 'Merch product images (Floaty, Beach Ball, Fan)', standIn: 'typographic tile' },
  { need: 'Testimonial product thumbnails', standIn: 'product pack shots' },
];

/** Unresolved export-to-design matches. */
export const assetNotes = [
  'MCT.png is the “Made in USA” icon, not an MCT oil icon. Used as Made in USA.',
  'Benefit icons have their labels baked into the PNG, so labels are not live text (alt text carries them).',
  'HOODIE.png is used for the Merch category slide, but no hoodie is listed in the live catalog.',
  'plant-icon.png, berry-icon.png and cane-icon.png are not on the homepage; they are used on the Ingredients page.',
  'X1 images are pack shots (primary), X2 images are the ingredient close-ups (hover), per the PDF note “these are the hover images”.',
];

const img = (key) => manifest.images[key];

/**
 * <picture> markup with AVIF + WebP sources for a manifest key.
 * @param {string} key
 * @param {{alt?: string, sizes?: string, cls?: string, eager?: boolean, style?: string}} [o]
 */
export function picture(key, o = {}) {
  const a = img(key);
  if (!a) return '';
  const set = (fmt) => a.variants.filter((v) => v[fmt]).map((v) => `${v[fmt]} ${v.width}w`).join(', ');
  const last = a.variants[a.variants.length - 1];
  const sizes = o.sizes || '100vw';
  const avif = set('avif');
  return `<picture>${avif ? `<source type="image/avif" srcset="${avif}" sizes="${sizes}">` : ''}<source type="image/webp" srcset="${set('webp')}" sizes="${sizes}"><img src="${last.webp}" alt="${o.alt ?? ''}" width="${a.width}" height="${a.height}" ${o.eager ? 'fetchpriority="high"' : 'loading="lazy"'} decoding="async"${o.cls ? ` class="${o.cls}"` : ''}${o.style ? ` style="${o.style}"` : ''}></picture>`;
}

export const icon = (key) => manifest.icons[key];
