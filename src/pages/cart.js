import { getCart, onCartChange } from '../adapters/commerce.js';
import { cartMarkup, bindCart } from '../components/cart-drawer.js';
import { pageHeader } from './_shared.js';

/** Full-page cart; same markup and behaviour as the drawer. */
export function render(main) {
  main.innerHTML = `${pageHeader('Your cart', '', 'Cart')}<section class="page__section"><div class="cart cart--page" data-cart-content aria-live="polite"></div></section>`;
  const content = main.querySelector('[data-cart-content]');
  const paint = (cart) => (content.innerHTML = cartMarkup(cart));
  paint(getCart());
  bindCart(content);
  onCartChange(paint);
}
