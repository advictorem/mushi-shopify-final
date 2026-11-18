import { searchProducts, getProducts } from '../adapters/commerce.js';
import { picture } from '../data/assets.js';
import { esc, money, qs } from '../utils/dom.js';
import { openModal } from './modal.js';
import { productUrl } from './product-card.js';

const row = (p) => `
  <li>
    <a class="search__result" href="${productUrl(p)}">
      <span class="search__thumb">${p.images.primary ? picture(p.images.primary, { alt: '', sizes: '64px' }) : ''}</span>
      <span class="search__name">${esc(p.title)}<small>${esc(p.formatLabel)}</small></span>
      <span class="search__price">${money(p.price)}</span>
    </a>
  </li>`;

/** Search overlay over the local, verified product data. */
export function openSearch() {
  openModal({
    label: 'Search products',
    variant: 'top',
    html: `
      <form class="search" role="search" data-search>
        <label class="search__label" for="search-input">Search products</label>
        <input id="search-input" class="search__input" type="search" autocomplete="off" placeholder="Try “cherry” or “chocolate”" autofocus>
        <p class="search__status" role="status" aria-live="polite"></p>
        <ul class="search__results"></ul>
      </form>`,
    onOpen(root) {
      const input = qs('.search__input', root);
      const list = qs('.search__results', root);
      const status = qs('.search__status', root);
      const paint = () => {
        const q = input.value.trim();
        const results = q ? searchProducts(q) : getProducts().slice(0, 6);
        list.innerHTML = results.map(row).join('');
        status.textContent = !q ? 'Popular right now' : results.length ? `${results.length} ${results.length === 1 ? 'result' : 'results'} for “${q}”` : `Nothing matches “${q}”. Try a flavor, or browse the shop.`;
      };
      input.addEventListener('input', paint);
      qs('[data-search]', root).addEventListener('submit', (e) => {
        e.preventDefault();
        qs('.search__result', root)?.click();
      });
      paint();
    },
  });
}
