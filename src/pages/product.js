import { getProduct, getProducts, addToCart, catalogMeta } from '../adapters/commerce.js';
import { faqs } from '../data/content.js';
import { productCard } from '../components/product-card.js';
import { purchaseOptionsMarkup, initPurchaseOptions } from '../components/purchase-options.js';
import { galleryMarkup, initGallery } from '../components/product-gallery.js';
import { openCart } from '../components/cart-drawer.js';
import { reviewFlag } from '../components/review-flag.js';
import { quoteCard, testimonialsFor, faqMarkup } from '../sections/home-content.js';
import { esc, icons, money, qs } from '../utils/dom.js';

// /products/<handle> (Vercel rewrite) or /pages/product.html?handle=<handle>
const currentHandle = () => new URLSearchParams(location.search).get('handle') || location.pathname.match(/\/products\/([^/]+)/)?.[1];
const faq = (q) => faqs.find((f) => f.q === q);
const paras = (f) => `${f.a.map((t) => `<p>${esc(t)}</p>`).join('')}${reviewFlag(f.review)}`;
const pending = (what) => `<p class="accordion__pending">${esc(what)}</p>${reviewFlag('Content pending: not shown as live guidance')}`;

const section = (title, body, open = false) => `
  <details class="accordion__item"${open ? ' open' : ''}>
    <summary><span>${title}</span>${icons.plus}</summary>
    <div class="accordion__body"><div class="accordion__inner">${body}</div></div>
  </details>`;

/** Description / How to use / What's inside / FAQs, from product data and the approved FAQ copy. */
function accordions(p) {
  const consumable = ['gummies', 'chocolates'].includes(p.category);
  const description = [
    p.fullDescription ? `<p>${esc(p.fullDescription)}</p>` : '',
    p.flavorProfile ? `<p><strong>Flavor profile:</strong> ${esc(p.flavorProfile)}</p>` : '',
    p.perfectFor ? `<p><strong>Perfect for:</strong> ${esc(p.perfectFor)} ${reviewFlag('Benefit language copied from the live product page — needs compliance review')}</p>` : '',
    p.details ? `<p>${esc(p.details)}</p>` : '',
  ].join('');
  const inside = p.category === 'gummies'
    ? `${paras(faq('What’s inside?'))}${pending('Nutrition facts, serving size and allergen information will be added from the approved packaging panel.')}`
    : pending('The ingredient list, nutrition facts and allergen information for this chocolate will be added from the approved packaging panel.');
  const productFaqs = [faq('Where do you ship?'), faq('Can I subscribe?')].filter(Boolean);
  return `
    <div class="accordion pdp__accordion" data-accordion>
      ${description ? section('Description', description, true) : ''}
      ${consumable ? section('How to use', `${paras(faq('How much should I have?'))}${paras(faq('When should I enjoy it?'))}${pending('Storage guidance will be added from the approved packaging copy.')}`) : ''}
      ${consumable ? section('What’s inside', `${inside}<p><a class="link" href="/pages/ingredients.html">See all ingredients</a></p>`) : ''}
      ${section('FAQs', `<div class="pdp__faqs">${faqMarkup(productFaqs)}</div><p><a class="link" href="/pages/faqs.html">Read all FAQs</a></p>`)}
    </div>`;
}

/** Product detail template: one template for every product, driven by the product data. */
export function render(main) {
  const p = getProduct(currentHandle());
  if (!p) {
    main.innerHTML = `<section class="page__section"><h1 class="page__title">We couldn’t find that product</h1><p><a class="btn btn--dark" href="/pages/shop.html">Shop all</a></p></section>`;
    return;
  }
  document.title = `${p.title} — MUSHI`;
  const images = p.images.gallery.map((key, i) => ({ key, alt: i === 0 ? `${p.title} packaging` : `${p.title} flavor close-up` }));
  const raves = testimonialsFor(p.handle);
  const more = getProducts(p.category).filter((r) => r.handle !== p.handle);
  const buyable = p.price != null && p.available;
  const categoryLabel = ['gummies', 'chocolates'].includes(p.category) ? `Mushi ${p.category}` : p.category;

  main.innerHTML = `
    <section class="pdp pdp--${p.handle}" data-pdp>
      <div class="pdp__gallery">
        ${images.length ? galleryMarkup(images) : `<div class="gallery__stage"><div class="card__art card__art--type pdp__type"><span>${esc(p.title.replace('Exclusive MUSHI ', ''))}</span></div></div><p class="pdp__missing">${reviewFlag('No approved product image in Mushi Exports')}</p>`}
      </div>
      <div class="pdp__info">
        <nav aria-label="Breadcrumb" class="pdp__crumbs"><a class="link" href="/pages/shop.html">Shop</a> / <a class="link" href="/pages/shop.html?category=${p.category}">${esc(p.category)}</a></nav>
        <p class="pdp__category">${esc(categoryLabel)}</p>
        <h1 class="pdp__title">${esc(p.title)}</h1>
        <p class="pdp__format">${esc(p.formatLabel)}${raves.length ? ` <a class="link" href="#raves">${raves.length} client rave${raves.length > 1 ? 's' : ''}</a>` : ''}</p>
        ${p.shortDescription ? `<p class="pdp__short">${esc(p.shortDescription)}</p>` : ''}
        ${p.flavorProfile ? `<p class="pdp__flavor"><span>Flavor</span> ${esc(p.flavorProfile)}</p>` : ''}
        ${buyable ? purchaseOptionsMarkup(p) : `<p class="price price--pending">Price coming soon</p><p class="page__preview">${esc(p.pending || 'Coming soon.')}</p>`}
        ${p.attributes.length ? `<ul class="pdp__attrs" aria-label="Product facts">${p.attributes.map((a) => `<li>${esc(a)}</li>`).join('')}</ul>` : ''}
        ${accordions(p)}
        ${p.liveUrl ? `<p class="pdp__source">Price and copy verified against <a class="link" href="${p.liveUrl}" target="_blank" rel="noopener">the live product page</a> on ${catalogMeta.verifiedAt}.</p>` : ''}
      </div>
    </section>
    ${raves.length ? `
      <section class="raves" id="raves" aria-labelledby="raves-title">
        <h2 class="section-title" id="raves-title">Client raves</h2>
        <div class="raves__row" tabindex="0" role="group" aria-label="${esc(p.title)} reviews">${raves.map((t) => quoteCard(t)).join('')}</div>
      </section>` : (['gummies', 'chocolates'].includes(p.category) ? `<p class="raves__none">${reviewFlag(`Client Raves hidden: no approved ${p.title} review yet`)}</p>` : '')}
    ${more.length ? `
      <section class="page__section page__section--wide more-flavors" aria-labelledby="more-title">
        <h2 class="section-title" id="more-title">${['gummies', 'chocolates'].includes(p.category) ? 'More flavors' : `More ${esc(p.category)}`}</h2>
        <div class="grid-products${more.length === 2 ? ' grid-products--two' : ''}">${more.map(productCard).join('')}</div>
      </section>` : ''}
    ${buyable ? `
      <div class="pdp-bar" data-pdp-bar hidden>
        <p><strong>${esc(p.title)}</strong><span data-bar-note></span></p>
        <button class="btn btn--dark" type="button" data-bar-add>Add <span data-bar-price></span></button>
      </div>` : ''}`;

  initGallery(main, images);
  if (!buyable) return;

  const bar = qs('[data-pdp-bar]', main);
  const po = initPurchaseOptions(main, p, {
    onChange(s) {
      qs('[data-bar-price]', bar).textContent = `— ${money(s.total, p.currency)}`;
      qs('[data-bar-note]', bar).textContent = s.type === 'subscription' ? `Subscribe and Save · ${s.frequency.label}` : `Qty ${s.quantity}`;
    },
    onAdd(s) {
      addToCart(s.handle, s.quantity, { plan: s.frequency?.id ?? null });
      openCart();
    },
  });
  qs('[data-bar-add]', bar).addEventListener('click', po.add);
  // Phone-only bar: appears once the main button has scrolled out of view above.
  new IntersectionObserver(([e]) => {
    bar.hidden = e.isIntersecting || e.boundingClientRect.top > 0;
  }).observe(qs('.po__add', main));
}
