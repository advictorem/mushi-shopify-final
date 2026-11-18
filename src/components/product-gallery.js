import { picture } from '../data/assets.js';
import { esc, icons, qs, qsa } from '../utils/dom.js';
import { openModal } from './modal.js';

/**
 * Product gallery: crossfading stage, previous/next, thumbnails, arrow keys,
 * swipe, and a click-to-enlarge lightbox. Images come from `images`
 * ([{ key, alt }], keys from the asset manifest), never from the markup.
 */
export function galleryMarkup(images) {
  const many = images.length > 1;
  return `
    <div class="gallery" data-gallery>
      <div class="gallery__stage" tabindex="0" role="group" aria-roledescription="carousel" aria-label="Product images. Use the arrow keys to change image.">
        ${images.map((g, i) => `<button type="button" class="gallery__slide${i === 0 ? ' is-active' : ''}" data-slide="${i}" aria-label="Enlarge image ${i + 1} of ${images.length}: ${esc(g.alt)}"${i === 0 ? '' : ' tabindex="-1"'}>${picture(g.key, { alt: g.alt, sizes: '(min-width: 900px) 50vw, 100vw', eager: i === 0 })}</button>`).join('')}
        ${many ? `
        <button type="button" class="gallery__nav gallery__nav--prev" data-go="-1" aria-label="Previous image">${icons.chevron}</button>
        <button type="button" class="gallery__nav gallery__nav--next" data-go="1" aria-label="Next image">${icons.chevron}</button>
        <p class="gallery__count" aria-live="polite"><span data-count>1</span> / ${images.length}</p>` : ''}
      </div>
      ${many ? `
      <div class="gallery__thumbs" role="group" aria-label="Choose an image">
        ${images.map((g, i) => `<button type="button" class="gallery__thumb" data-thumb="${i}" aria-label="Show image ${i + 1} of ${images.length}" aria-pressed="${i === 0}">${picture(g.key, { alt: '', sizes: '80px' })}</button>`).join('')}
      </div>` : ''}
    </div>`;
}

export function initGallery(root, images) {
  const el = qs('[data-gallery]', root);
  if (!el) return;
  const stage = qs('.gallery__stage', el);
  const slides = qsa('.gallery__slide', el);
  const thumbs = qsa('.gallery__thumb', el);
  let index = 0;

  function show(i) {
    index = (i + slides.length) % slides.length;
    slides.forEach((s, n) => {
      s.classList.toggle('is-active', n === index);
      s.tabIndex = n === index ? 0 : -1;
    });
    thumbs.forEach((t, n) => t.setAttribute('aria-pressed', String(n === index)));
    const count = qs('[data-count]', el);
    if (count) count.textContent = index + 1;
  }

  el.addEventListener('click', (e) => {
    const go = e.target.closest('[data-go]');
    const thumb = e.target.closest('[data-thumb]');
    if (go) show(index + Number(go.dataset.go));
    else if (thumb) show(Number(thumb.dataset.thumb));
    else if (e.target.closest('.gallery__slide') && !swiped) zoom();
  });
  stage.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowRight') show(index + 1);
    else if (e.key === 'ArrowLeft') show(index - 1);
  });

  // Swipe (touch and pen). A swipe must not also count as a tap on the slide.
  let startX = null;
  let swiped = false;
  stage.addEventListener('pointerdown', (e) => {
    startX = e.pointerType === 'mouse' ? null : e.clientX;
    swiped = false;
  });
  stage.addEventListener('pointerup', (e) => {
    if (startX === null) return;
    const dx = e.clientX - startX;
    startX = null;
    if (Math.abs(dx) < 40 || slides.length < 2) return;
    swiped = true;
    show(index + (dx < 0 ? 1 : -1));
  });

  function zoom() {
    const g = images[index];
    openModal({ label: g.alt, variant: 'center', html: `<div class="gallery__zoom">${picture(g.key, { alt: g.alt, sizes: '100vw', eager: true })}</div>` });
  }
}
