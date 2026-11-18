import { picture } from '../data/assets.js';
import { addToCart } from '../adapters/commerce.js';
import { esc, icons, money } from '../utils/dom.js';
import { openCart } from './cart-drawer.js';

export const productUrl = (p) => `/pages/product.html?handle=${encodeURIComponent(p.handle)}`;

/** Quantity stepper markup, shared by cards, the product page and the cart. */
export const stepper = (label, value = 1, attrs = '') => `
  <div class="stepper" ${attrs}>
    <button type="button" class="stepper__btn" data-step="-1" aria-label="Decrease quantity for ${esc(label)}">−</button>
    <input class="stepper__value" type="text" inputmode="numeric" value="${value}" aria-label="Quantity for ${esc(label)}">
    <button type="button" class="stepper__btn" data-step="1" aria-label="Increase quantity for ${esc(label)}">+</button>
  </div>`;

export const priceMarkup = (p) => `
  <p class="price">
    <span class="sr-only">Price</span><span class="price__now">${money(p.price, p.currency)}</span>
    ${p.compareAtPrice ? `<span class="sr-only">Was</span><s class="price__was">${money(p.compareAtPrice, p.currency)}</s>` : ''}
  </p>`;

export function productMedia(p, sizes) {
  if (!p.images.primary) return `<div class="card__art card__art--type" aria-hidden="true"><span>${esc(p.title.replace('Exclusive MUSHI ', ''))}</span></div>`;
  return `
    ${picture(p.images.primary, { alt: `${p.title} packaging`, sizes, cls: 'card__img' })}
    ${p.images.hover ? picture(p.images.hover, { alt: '', sizes, cls: 'card__img card__img--hover' }) : ''}`;
}

/** Product card. All text and prices come from the product object. */
export function productCard(p) {
  const sizes = '(min-width: 1000px) 380px, (min-width: 600px) 45vw, 80vw';
  return `
    <article class="card" data-product="${p.handle}">
      <a class="card__media" href="${productUrl(p)}" tabindex="-1" aria-hidden="true">
        ${productMedia(p, sizes)}
        ${p.badges.map((b) => `<span class="badge">${esc(b)}</span>`).join('')}
      </a>
      <div class="card__body">
        <h3 class="card__title"><a href="${productUrl(p)}">${esc(p.title)}</a></h3>
        <p class="card__format">${esc(p.formatLabel)}</p>
        ${priceMarkup(p)}
        <div class="card__buy">
          <button class="btn btn--dark card__add" type="button" data-add>Add to cart ${icons.bagPlus}</button>
          ${stepper(p.title)}
        </div>
      </div>
    </article>`;
}

const clamp = (n) => Math.max(1, Math.min(99, Number.parseInt(n, 10) || 1));

/** One delegated listener handles every stepper and Add to cart button. */
export function bindCommerceControls(root = document) {
  if (root.__commerceBound) return;
  root.__commerceBound = true;
  root.addEventListener('click', (e) => {
    const step = e.target.closest('.stepper__btn');
    if (step && !step.closest('[data-cart-line]')) {
      const input = step.parentElement.querySelector('.stepper__value');
      input.value = clamp(clamp(input.value) + Number(step.dataset.step));
      return;
    }
    const add = e.target.closest('[data-add]');
    if (add) {
      const host = add.closest('[data-product]');
      const input = host.querySelector('.stepper__value');
      addToCart(host.dataset.product, clamp(input?.value ?? 1));
      if (input) input.value = 1;
      openCart();
    }
  });
  root.addEventListener('change', (e) => {
    if (e.target.matches('.stepper__value') && !e.target.closest('[data-cart-line]')) e.target.value = clamp(e.target.value);
  });
}
