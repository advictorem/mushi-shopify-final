import { getProducts } from '../adapters/commerce.js';
import { productCard } from '../components/product-card.js';
import { qsa } from '../utils/dom.js';

/** Fill every [data-product-carousel="<category>"] from the product data. */
export function initProductCarousels() {
  qsa('[data-product-carousel]').forEach((host) => {
    const products = getProducts(host.dataset.productCarousel);
    host.querySelector('[data-carousel-track]').innerHTML = products.map((p) => `<div class="carousel__slide">${productCard(p)}</div>`).join('');
  });
}
