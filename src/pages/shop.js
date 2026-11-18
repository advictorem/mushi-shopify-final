import { getProducts, getCategories } from '../adapters/commerce.js';
import { productCard } from '../components/product-card.js';
import { pageHeader } from './_shared.js';

/** Collection template: All / Gummies / Chocolates / Merch via ?category= */
export function render(main) {
  const categories = getCategories();
  const param = new URLSearchParams(location.search).get('category');
  const active = categories.find((c) => c.handle === param) || null;
  const products = getProducts(active?.handle);
  document.title = `${active ? active.title : 'Shop all'} — MUSHI`;
  main.innerHTML = `
    ${pageHeader(active ? active.title : 'Shop all', '', active ? active.title : 'Shop')}
    <section class="page__section page__section--wide" aria-label="Products">
      <nav class="filters" aria-label="Categories">
        <a class="btn ${active ? 'btn--outline' : 'btn--dark'}" href="/pages/shop.html" ${active ? '' : 'aria-current="page"'}>All</a>
        ${categories.map((c) => `<a class="btn ${active?.handle === c.handle ? 'btn--dark' : 'btn--outline'}" href="/pages/shop.html?category=${c.handle}" ${active?.handle === c.handle ? 'aria-current="page"' : ''}>${c.title}</a>`).join('')}
      </nav>
      <p class="filters__count">${products.length} ${products.length === 1 ? 'product' : 'products'}</p>
      <div class="grid-products">${products.map(productCard).join('')}</div>
    </section>`;
}
