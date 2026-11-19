import { picture } from '../data/assets.js';
import { esc, qs, qsa } from '../utils/dom.js';
import { openModal } from './modal.js';

/**
 * Product gallery. Desktop: the images stack in the left column and scroll
 * past while the product information stays in view. Phone: the same images
 * become a swipeable row with a counter. Any image opens larger on click.
 * Images come from `images` ([{ key, alt }], keys from the asset manifest).
 */
export function galleryMarkup(images, sizes = '(min-width: 900px) 40vw, 100vw') {
  return `
    <div class="gallery" data-gallery>
      <ul class="gallery__list" aria-label="Product images">
        ${images.map((g, i) => `<li><button type="button" class="gallery__item" data-slide="${i}" aria-label="Enlarge image ${i + 1} of ${images.length}: ${esc(g.alt)}">${picture(g.key, { alt: g.alt, sizes, eager: i === 0 })}</button></li>`).join('')}
      </ul>
      ${images.length > 1 ? `<p class="gallery__count" aria-hidden="true"><span data-count>1</span> / ${images.length}</p>` : ''}
    </div>`;
}

export function initGallery(root, images) {
  const el = qs('[data-gallery]', root);
  if (!el) return;
  const list = qs('.gallery__list', el);
  const count = qs('[data-count]', el);
  el.addEventListener('click', (e) => {
    const item = e.target.closest('.gallery__item');
    if (!item) return;
    const g = images[Number(item.dataset.slide)];
    openModal({ label: g.alt, variant: 'center', html: `<div class="gallery__zoom">${picture(g.key, { alt: g.alt, sizes: '100vw', eager: true })}</div>` });
  });
  // Phone row: keep the counter in step with the swipe position.
  if (count) {
    let ticking = false;
    list.addEventListener('scroll', () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        ticking = false;
        count.textContent = Math.min(qsa('li', list).length, Math.round(list.scrollLeft / list.clientWidth) + 1);
      });
    }, { passive: true });
  }
}
