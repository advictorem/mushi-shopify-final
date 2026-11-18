import { getProduct, getProducts, catalogMeta } from '../adapters/commerce.js';
import { picture } from '../data/assets.js';
import { productCard, priceMarkup, stepper } from '../components/product-card.js';
import { reviewFlag } from '../components/review-flag.js';
import { esc, icons, qsa } from '../utils/dom.js';

/** Product detail template, driven entirely by the product data (?handle=). */
export function render(main) {
  const p = getProduct(new URLSearchParams(location.search).get('handle'));
  if (!p) {
    main.innerHTML = `<section class="page__section"><h1 class="page__title">We couldn’t find that product</h1><p><a class="btn btn--dark" href="/pages/shop.html">Shop all</a></p></section>`;
    return;
  }
  document.title = `${p.title} — MUSHI`;
  const gallery = p.images.gallery;
  const related = getProducts(p.category).filter((r) => r.handle !== p.handle).slice(0, 3);
  main.innerHTML = `
    <section class="pdp" data-product="${p.handle}">
      <div class="pdp__gallery">
        ${gallery.length ? `
          <div class="pdp__stage">${gallery.map((g, i) => `<div class="pdp__image${i === 0 ? ' is-active' : ''}" data-image="${i}">${picture(g, { alt: i === 0 ? `${p.title} packaging` : `${p.title} flavor close-up`, sizes: '(min-width: 900px) 46vw, 92vw', eager: i === 0 })}</div>`).join('')}</div>
          <div class="pdp__thumbs" role="group" aria-label="Product images">
            ${gallery.map((g, i) => `<button type="button" class="pdp__thumb" data-thumb="${i}" aria-label="Show image ${i + 1} of ${gallery.length}" aria-pressed="${i === 0}">${picture(g, { alt: '', sizes: '80px' })}</button>`).join('')}
          </div>` : `<div class="pdp__stage"><div class="card__art card__art--type pdp__type"><span>${esc(p.title.replace('Exclusive MUSHI ', ''))}</span></div></div><p class="pdp__missing">${reviewFlag('No approved product image in Mushi Exports')}</p>`}
      </div>
      <div class="pdp__info">
        <nav aria-label="Breadcrumb" class="pdp__crumbs"><a class="link" href="/pages/shop.html">Shop</a> / <a class="link" href="/pages/shop.html?category=${p.category}">${esc(p.category)}</a></nav>
        ${p.badges.map((b) => `<span class="badge badge--inline">${esc(b)}</span>`).join('')}
        <h1 class="pdp__title">${esc(p.title)}</h1>
        <p class="card__format">${esc(p.formatLabel)}</p>
        ${priceMarkup(p)}
        ${p.shortDescription ? `<p class="pdp__short">${esc(p.shortDescription)}</p>` : ''}
        ${p.attributes.length ? `<ul class="pdp__attrs">${p.attributes.map((a) => `<li>${esc(a)}</li>`).join('')}</ul>` : ''}
        ${p.price == null ? `<p class="page__preview">${esc(p.pending || 'Coming soon.')}</p>` : `
        <div class="pdp__buy">
          ${stepper(p.title)}
          <button class="btn btn--dark" type="button" data-add>Add to cart ${icons.bagPlus}</button>
        </div>`}
        <div class="pdp__details">
          ${p.fullDescription ? `<h2>Description</h2><p>${esc(p.fullDescription)}</p>` : ''}
          ${p.flavorProfile ? `<h2>Flavor profile</h2><p>${esc(p.flavorProfile)}</p>` : ''}
          ${p.perfectFor ? `<h2>Perfect for ${reviewFlag('Benefit language copied from the live product page — needs compliance review')}</h2><p>${esc(p.perfectFor)}</p>` : ''}
          ${p.details ? `<h2>Details</h2><p>${esc(p.details)}</p>` : ''}
        </div>
        ${p.liveUrl ? `<p class="pdp__source">Price and copy verified against <a class="link" href="${p.liveUrl}" target="_blank" rel="noopener">the live product page</a> on ${catalogMeta.verifiedAt}.</p>` : ''}
      </div>
    </section>
    ${related.length ? `
      <section class="page__section page__section--wide" aria-labelledby="related-title">
        <h2 class="section-title" id="related-title">More ${esc(p.category)}</h2>
        <div class="grid-products">${related.map(productCard).join('')}</div>
      </section>` : ''}`;

  const images = qsa('.pdp__image', main);
  const thumbs = qsa('.pdp__thumb', main);
  thumbs.forEach((t) => t.addEventListener('click', () => {
    images.forEach((im) => im.classList.toggle('is-active', im.dataset.image === t.dataset.thumb));
    thumbs.forEach((o) => o.setAttribute('aria-pressed', String(o === t)));
  }));
}
