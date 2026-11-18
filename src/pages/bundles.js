import { getProducts, addToCart } from '../adapters/commerce.js';
import { picture } from '../data/assets.js';
import { stepper } from '../components/product-card.js';
import { openCart } from '../components/cart-drawer.js';
import { esc, money, qs, qsa } from '../utils/dom.js';
import { pageHeader, previewBanner } from './_shared.js';

/**
 * Bundle builder prototype. It shows the interaction only: no bundle pricing
 * rules exist yet, so the summary is priced at list price and no saving is shown.
 */
export function render(main) {
  const products = getProducts().filter((p) => p.category !== 'merch');
  main.innerHTML = `
    ${pageHeader('Build your bundle', 'Pick your flavors. The more you buy, the more you save.', 'Bundle')}
    <section class="page__section page__section--wide bundler">
      <div>
        ${previewBanner('Prototype: bundle discount tiers are not confirmed, so totals below are at list price and no saving is shown.')}
        <ul class="bundler__list">
          ${products.map((p) => `
            <li class="bundler__item" data-bundle="${p.handle}">
              <span class="bundler__thumb">${picture(p.images.primary, { alt: '', sizes: '96px' })}</span>
              <span class="bundler__name"><strong>${esc(p.title)}</strong><small>${esc(p.formatLabel)}</small><span>${money(p.price)}</span></span>
              ${stepper(p.title, 0)}
            </li>`).join('')}
        </ul>
      </div>
      <aside class="bundler__summary" aria-live="polite">
        <h2>Your bundle</h2>
        <p class="bundler__count" data-bundle-count>Nothing added yet.</p>
        <p class="cart__subtotal"><span>List price</span><strong data-bundle-total>${money(0)}</strong></p>
        <button class="btn btn--dark btn--block" type="button" data-bundle-add disabled>Add bundle to cart</button>
      </aside>
    </section>`;

  const items = qsa('[data-bundle]', main);
  const read = () => items.map((li) => ({ handle: li.dataset.bundle, qty: Math.max(0, Math.min(20, Number.parseInt(qs('.stepper__value', li).value, 10) || 0)) }));
  const paint = () => {
    const picks = read().filter((x) => x.qty > 0);
    const count = picks.reduce((n, x) => n + x.qty, 0);
    const total = picks.reduce((n, x) => n + x.qty * products.find((p) => p.handle === x.handle).price, 0);
    qs('[data-bundle-count]', main).textContent = count ? `${count} ${count === 1 ? 'item' : 'items'} selected.` : 'Nothing added yet.';
    qs('[data-bundle-total]', main).textContent = money(total);
    qs('[data-bundle-add]', main).disabled = count === 0;
  };
  // Capture phase: this page's steppers start at 0, unlike product steppers.
  main.addEventListener('click', (e) => {
    const b = e.target.closest('.bundler .stepper__btn');
    if (!b) return;
    e.stopPropagation();
    const input = b.parentElement.querySelector('.stepper__value');
    input.value = Math.max(0, Math.min(20, (Number.parseInt(input.value, 10) || 0) + Number(b.dataset.step)));
    paint();
  }, true);
  main.addEventListener('change', (e) => {
    if (!e.target.matches('.bundler .stepper__value')) return;
    e.stopPropagation();
    e.target.value = Math.max(0, Math.min(20, Number.parseInt(e.target.value, 10) || 0));
    paint();
  }, true);
  qs('[data-bundle-add]', main).addEventListener('click', () => {
    read().filter((x) => x.qty > 0).forEach((x) => addToCart(x.handle, x.qty));
    items.forEach((li) => (qs('.stepper__value', li).value = 0));
    paint();
    openCart();
  });
}
