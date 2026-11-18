import { categories } from '../data/content.js';
import { picture } from '../data/assets.js';
import { qs, qsa, icons } from '../utils/dom.js';
import { reviewFlag } from '../components/review-flag.js';

/**
 * Category showcase: one category at a time, oversized label behind the
 * product PNG, background colours cross-fading between slides.
 * Arrows, pagination, swipe and ←/→ keys all drive the same `go()`.
 */
export function initCategoryShowcase() {
  const host = qs('[data-category-showcase]');
  if (!host) return;
  host.innerHTML = `
    <div class="showcase__bgs" aria-hidden="true">${categories.map((c) => `<div class="showcase__bg" style="--bg:${c.bg}"></div>`).join('')}</div>
    <div class="showcase__stage" role="group" aria-roledescription="carousel" aria-label="Shop by category" tabindex="0">
      ${categories.map((c, i) => `
        <a class="showcase__slide" href="/pages/shop.html?category=${c.handle}" style="--label:${c.label}" role="group" aria-roledescription="slide" aria-label="${c.title}, ${i + 1} of ${categories.length}">
          <span class="showcase__label" aria-hidden="true">${c.labelText || c.title}</span>
          ${picture(c.image, { alt: c.alt, sizes: '(min-width: 1100px) 900px, 90vw', cls: 'showcase__img', eager: i === 0 })}
          <span class="showcase__cta">Shop ${c.title.toLowerCase()} ${reviewFlag(c.review)}</span>
        </a>`).join('')}
    </div>
    <button class="showcase__arrow showcase__arrow--prev" type="button" aria-label="Previous category">${icons.arrow}</button>
    <button class="showcase__arrow showcase__arrow--next" type="button" aria-label="Next category">${icons.arrow}</button>
    <div class="showcase__dots">${categories.map((c) => `<button type="button" class="carousel__dot" aria-label="Show ${c.title}"></button>`).join('')}</div>
    <p class="sr-only" aria-live="polite" data-showcase-status></p>`;

  const slides = qsa('.showcase__slide', host);
  const bgs = qsa('.showcase__bg', host);
  const dots = qsa('.carousel__dot', host);
  const stage = qs('.showcase__stage', host);
  const status = qs('[data-showcase-status]', host);
  let index = 0;

  function go(next, announce = true) {
    index = (next + slides.length) % slides.length;
    slides.forEach((s, i) => {
      const on = i === index;
      s.classList.toggle('is-active', on);
      s.toggleAttribute('inert', !on);
    });
    bgs.forEach((b, i) => b.classList.toggle('is-active', i === index));
    dots.forEach((d, i) => d.setAttribute('aria-current', String(i === index)));
    if (announce) status.textContent = `${categories[index].title}, ${index + 1} of ${slides.length}`;
  }

  qs('.showcase__arrow--prev', host).addEventListener('click', () => go(index - 1));
  qs('.showcase__arrow--next', host).addEventListener('click', () => go(index + 1));
  dots.forEach((d, i) => d.addEventListener('click', () => go(i)));
  host.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft') go(index - 1);
    if (e.key === 'ArrowRight') go(index + 1);
  });

  // Swipe: a horizontal drag of 48px+ changes slide and cancels the click.
  let startX = null;
  let swiped = false;
  stage.addEventListener('pointerdown', (e) => {
    startX = e.clientX;
    swiped = false;
  });
  stage.addEventListener('pointerup', (e) => {
    if (startX === null) return;
    const dx = e.clientX - startX;
    startX = null;
    if (Math.abs(dx) < 48) return;
    swiped = true;
    go(index + (dx < 0 ? 1 : -1));
  });
  stage.addEventListener('pointercancel', () => (startX = null));
  stage.addEventListener('click', (e) => {
    if (swiped) e.preventDefault();
    swiped = false;
  }, true);
  stage.addEventListener('dragstart', (e) => e.preventDefault());

  go(0, false);
}
