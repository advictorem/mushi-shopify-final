import { getCart, onCartChange, updateQuantity, removeFromCart, beginCheckout } from '../adapters/commerce.js';
import { picture } from '../data/assets.js';
import { esc, money, qs } from '../utils/dom.js';
import { openModal } from './modal.js';
import { productUrl, stepper } from './product-card.js';

let active = null;

/** Cart contents markup — used by the drawer and by /pages/cart.html. */
export function cartMarkup(cart) {
  if (!cart.lines.length) {
    return `
      <div class="cart__empty">
        <p>Your cart is empty.</p>
        <a class="btn btn--dark" href="/pages/shop.html">Shop all</a>
      </div>`;
  }
  return `
    <ul class="cart__lines">
      ${cart.lines.map(({ product: p, quantity, lineTotal }) => `
        <li class="cart__line" data-cart-line="${p.handle}">
          <a class="cart__thumb" href="${productUrl(p)}" tabindex="-1" aria-hidden="true">
            ${p.images.primary ? picture(p.images.primary, { alt: '', sizes: '88px' }) : `<span class="cart__thumb-type">${esc(p.title.replace('Exclusive MUSHI ', ''))}</span>`}
          </a>
          <div class="cart__info">
            <a class="cart__name" href="${productUrl(p)}">${esc(p.title)}</a>
            <p class="cart__format">${esc(p.formatLabel)}</p>
            <p class="cart__each">${money(p.price)} each</p>
            <div class="cart__controls">
              ${stepper(p.title, quantity)}
              <button class="link" type="button" data-remove aria-label="Remove ${esc(p.title)} from cart">Remove</button>
            </div>
          </div>
          <p class="cart__total" aria-label="Line total">${money(lineTotal)}</p>
        </li>`).join('')}
    </ul>
    <div class="cart__summary">
      <p class="cart__subtotal"><span>Subtotal</span><strong>${money(cart.subtotal)}</strong></p>
      <p class="cart__note">Shipping and taxes are calculated at checkout.</p>
      <button class="btn btn--dark btn--block" type="button" data-checkout>Checkout</button>
      <p class="cart__checkout-note" role="status" hidden></p>
    </div>`;
}

/** Wire quantity, remove and checkout inside a cart container. */
export function bindCart(container) {
  container.addEventListener('click', (e) => {
    const line = e.target.closest('[data-cart-line]');
    if (line && e.target.closest('.stepper__btn')) {
      const input = qs('.stepper__value', line);
      updateQuantity(line.dataset.cartLine, (Number.parseInt(input.value, 10) || 1) + Number(e.target.closest('.stepper__btn').dataset.step));
    } else if (line && e.target.closest('[data-remove]')) {
      removeFromCart(line.dataset.cartLine);
    } else if (e.target.closest('[data-checkout]')) {
      const note = qs('.cart__checkout-note', container);
      note.textContent = beginCheckout().message;
      note.hidden = false;
    }
  });
  container.addEventListener('change', (e) => {
    const line = e.target.closest('[data-cart-line]');
    if (line && e.target.matches('.stepper__value')) updateQuantity(line.dataset.cartLine, Number.parseInt(e.target.value, 10) || 1);
  });
}

export function openCart() {
  if (active) return;
  let off;
  active = openModal({
    label: 'Cart',
    variant: 'drawer',
    html: `<div class="cart"><h2 class="cart__heading">Your cart <span data-cart-heading-count></span></h2><div class="cart__content" data-cart-content aria-live="polite"></div></div>`,
    onOpen(root) {
      const content = qs('[data-cart-content]', root);
      const paint = (cart) => {
        // Keep focus on the same control after a re-render.
        const focused = document.activeElement?.closest?.('[data-cart-line]')?.dataset.cartLine;
        const cls = document.activeElement?.className;
        content.innerHTML = cartMarkup(cart);
        qs('[data-cart-heading-count]', root).textContent = cart.itemCount ? `(${cart.itemCount})` : '';
        if (focused) {
          const line = content.querySelector(`[data-cart-line="${focused}"]`);
          (line?.querySelector(`.${String(cls).split(' ')[0]}[data-step="${document.activeElement?.dataset?.step}"]`) || line?.querySelector('.stepper__value') || qs('.modal__close', root))?.focus();
        }
      };
      paint(getCart());
      bindCart(content);
      off = onCartChange(paint);
    },
    onClose() {
      off?.();
      active = null;
    },
  });
}
