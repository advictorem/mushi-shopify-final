import { getProduct, getProducts, addToCart } from '../adapters/commerce.js';
import { faqs, benefits, merchDetails } from '../data/content.js';
import { icon } from '../data/assets.js';
import { siteConfig } from '../data/site.config.js';
import { productCard } from '../components/product-card.js';
import { purchaseOptionsMarkup, initPurchaseOptions } from '../components/purchase-options.js';
import { galleryMarkup, initGallery } from '../components/product-gallery.js';
import { openCart } from '../components/cart-drawer.js';
import { reviewFlag } from '../components/review-flag.js';
import { quoteCard, testimonialsFor, faqMarkup } from '../sections/home-content.js';
import { picture } from '../data/assets.js';
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

/** Nutrition Facts as a real table, from the product's back-of-pack data. */
const nutritionTable = (n) => `
  <table class="nutrition">
    <caption>Nutrition Facts</caption>
    <tbody>
      <tr><th scope="row">Servings per container</th><td>${esc(n.servingsPerContainer)}</td><td></td></tr>
      <tr><th scope="row">Serving size</th><td>${esc(n.servingSize)}</td><td></td></tr>
      <tr class="nutrition__cal"><th scope="row">Calories</th><td>${esc(n.calories)}</td><td></td></tr>
      <tr class="nutrition__head"><td></td><th scope="col">Amount per serving</th><th scope="col">% Daily Value</th></tr>
      ${n.rows.map((r) => `<tr><th scope="row"${r.indent ? ` class="nutrition__in${r.indent}"` : ''}>${esc(r.label)}</th><td>${esc(r.amount)}</td><td>${r.dv ? esc(r.dv) : ''}</td></tr>`).join('')}
    </tbody>
  </table>`;

/** Description / How to use / What's inside / FAQs, from product data and the approved FAQ copy. */
function accordions(p) {
  const consumable = ['gummies', 'chocolates'].includes(p.category);
  if (p.category === 'merch') {
    return `
    <div class="accordion pdp__accordion" data-accordion>
      ${merchDetails.sections.map((m, i) => section(esc(m.title), `${m.text.map((t) => `<p>${esc(t)}</p>`).join('')}${reviewFlag(merchDetails.review)}`, i === 0)).join('')}
    </div>`;
  }
  const description = [
    p.fullDescription ? `<p>${esc(p.fullDescription)}</p>` : '',
    p.flavorProfile ? `<p><strong>Flavor profile:</strong> ${esc(p.flavorProfile)}</p>` : '',
    p.perfectFor ? `<p><strong>Perfect for:</strong> ${esc(p.perfectFor)} ${reviewFlag('Benefit language copied from the live product page — needs compliance review')}</p>` : '',
    p.details ? `<p>${esc(p.details)}</p>` : '',
  ].join('');
  const pk = p.packaging;
  const inside = pk
    ? `${nutritionTable(pk.nutrition)}<p><strong>Ingredients:</strong> ${esc(pk.ingredients)}</p>`
    : pending('The ingredient list, nutrition facts and allergen information for this chocolate will be added from the approved packaging panel.');
  const use = `${paras(faq('How much should I have?'))}${paras(faq('When should I enjoy it?'))}${pk
    ? `<p><strong>Storage:</strong> ${esc(pk.storage)}</p><p><strong>Warning:</strong> ${esc(pk.warning)}</p>`
    : pending('Storage guidance and warnings will be added from the approved packaging copy.')}`;
  const productFaqs = [faq('Where do you ship?'), faq('Can I subscribe?')].filter(Boolean);
  return `
    <div class="accordion pdp__accordion" data-accordion>
      ${description ? section('Description', description, true) : ''}
      ${consumable ? section('How to use', use) : ''}
      ${consumable ? section('What’s inside', `${inside}<p><a class="link" href="/pages/ingredients.html">See all ingredients</a></p>`) : ''}
      ${section('FAQs', `<div class="pdp__faqs">${faqMarkup(productFaqs)}</div><p><a class="link" href="/pages/faqs.html">Read all FAQs</a></p>`)}
    </div>`;
}

// The six brand icons that apply to every gummy and chocolate (the homepage set, minus the two format-specific ones).
const FACT_ICONS = ['benefit-gluten-free', 'benefit-lab-tested', 'benefit-made-in-usa', 'benefit-non-gmo', 'benefit-no-palm', 'benefit-no-synthetics'];
const factIcons = () => `
  <ul class="pdp__icons" aria-label="Product facts">
    ${benefits.filter((b) => FACT_ICONS.includes(b.icon)).map((b) => `<li title="${esc(b.label)}"><img src="${icon(b.icon).file}" alt="${esc(b.label)}" width="${icon(b.icon).width}" height="${icon(b.icon).height}" loading="lazy" decoding="async"></li>`).join('')}
  </ul>`;

const MIN_RAVES = 3;
/** Stand-in card so the Client Raves layout can be reviewed. Staging only: never shown once review tags are off. */
const ravePlaceholder = (p) => `
      <figure class="quote quote--${p.tone || 'cherry'} quote--placeholder">
        <div class="quote__top"><span class="quote__mark" aria-hidden="true">“</span>${reviewFlag('Placeholder — not a customer review')}</div>
        <blockquote>Placeholder. An approved ${esc(p.title)} review will appear here.</blockquote>
        <figcaption>
          <span class="quote__thumb">${picture(p.images.primary, { alt: '', sizes: '44px' })}</span>
          <span><strong>${esc(p.title)}</strong><small>Customer name</small></span>
        </figcaption>
      </figure>`;

/** Product detail template: one template for every product, driven by the product data. */
export function render(main) {
  const p = getProduct(currentHandle());
  if (!p) {
    main.innerHTML = `<section class="page__section"><h1 class="page__title">We couldn’t find that product</h1><p><a class="btn btn--dark" href="/pages/shop.html">Shop all</a></p></section>`;
    return;
  }
  document.title = `${p.title} — MUSHI`;
  const consumable = ['gummies', 'chocolates'].includes(p.category);
  const images = p.images.gallery.map((key, i) => ({ key, alt: i === 0 ? `${p.title}${consumable ? ' packaging' : ''}` : `${p.title}, ${p.category === 'gummies' ? 'back of the pack with nutrition facts and ingredients' : p.category === 'chocolates' ? 'box open showing the chocolate' : 'second view'}` }));
  const raves = consumable ? testimonialsFor(p.handle) : [];
  const fillers = consumable && siteConfig.showReviewFlags ? Math.max(0, MIN_RAVES - raves.length) : 0;
  const more = getProducts(p.category).filter((r) => r.handle !== p.handle);
  const buyable = p.price != null && p.available;

  // Gummies and chocolates fade from their pack colour; merch sits on white.
  main.classList.add('page--product', consumable ? 'page--tinted' : 'page--white');
  if (p.theme) main.style.setProperty('--theme', p.theme);

  main.innerHTML = `
    <section class="pdp${consumable ? '' : ' pdp--merch'}" data-pdp>
      <div class="pdp__gallery">
        ${images.length ? galleryMarkup(images, '(min-width: 900px) 60vw, 100vw') : `<div class="card__art card__art--type pdp__type"><span>${esc(p.title.replace('Exclusive MUSHI ', ''))}</span></div><p class="pdp__missing">${reviewFlag('No approved product image in Mushi Exports')}</p>`}
      </div>
      <div class="pdp__info" data-pdp-info>
        <div class="pdp__card">
          <button class="pdp__share" type="button" data-share aria-label="Share ${esc(p.title)}">${icons.share}</button>
          <h1 class="pdp__title">${esc(p.title)}</h1>
          <p class="pdp__format">${esc(p.formatLabel)}</p>
          ${p.shortDescription ? `<p class="pdp__short">${esc(p.shortDescription)}</p>` : ''}
          ${consumable ? factIcons() : ''}
          ${purchaseOptionsMarkup(p)}
          <p class="pdp__share-note" role="status" data-share-note hidden></p>
        </div>
        ${accordions(p)}
      </div>
    </section>
    ${raves.length + fillers ? `
      <section class="raves" id="raves" aria-labelledby="raves-title">
        <h2 class="section-title" id="raves-title">Client raves</h2>
        <div class="raves__row" tabindex="0" role="group" aria-label="${esc(p.title)} reviews">${raves.map((t) => quoteCard(t)).join('')}${ravePlaceholder(p).repeat(fillers)}</div>
      </section>` : ''}
    ${more.length ? `
      <section class="page__section page__section--wide more-flavors" aria-labelledby="more-title">
        <h2 class="section-title" id="more-title">${consumable ? 'More flavors' : `More ${esc(p.category)}`}</h2>
        <div class="grid-products${more.length === 2 ? ' grid-products--two' : ''}">${more.map(productCard).join('')}</div>
      </section>` : ''}
    ${buyable ? `
      <div class="pdp-bar" data-pdp-bar hidden>
        <p><strong>${esc(p.title)}</strong><span data-bar-note></span></p>
        <button class="btn btn--dark" type="button" data-bar-add>Add <span data-bar-price></span></button>
      </div>` : ''}`;

  initGallery(main, images);
  initShare(main, p);
  stickInfo(qs('[data-pdp-info]', main));

  const bar = qs('[data-pdp-bar]', main);
  const po = initPurchaseOptions(main, p, {
    onChange(s) {
      if (!bar) return;
      qs('[data-bar-price]', bar).textContent = `— ${money(s.total, p.currency)}`;
      qs('[data-bar-note]', bar).textContent = s.type === 'subscription' ? `Subscribe and Save · ${s.frequency.label}` : `Qty ${s.quantity}`;
    },
    onAdd(s) {
      addToCart(s.handle, s.quantity, { plan: s.frequency?.id ?? null });
      openCart();
    },
  });
  if (!bar) return;
  qs('[data-bar-add]', bar).addEventListener('click', po.add);
  // Phone-only bar: appears once the main button has scrolled out of view above.
  new IntersectionObserver(([e]) => {
    bar.hidden = e.isIntersecting || e.boundingClientRect.top > 0;
  }).observe(qs('.po__add', main));
}

/** Share button: the device share sheet where there is one, otherwise copy the link. */
function initShare(main, p) {
  const note = qs('[data-share-note]', main);
  qs('[data-share]', main).addEventListener('click', async () => {
    const data = { title: `${p.title} — MUSHI`, url: location.href };
    try {
      if (navigator.share) return await navigator.share(data);
      await navigator.clipboard.writeText(data.url);
      note.textContent = 'Link copied.';
    } catch (err) {
      if (err?.name === 'AbortError') return; // share sheet closed
      note.textContent = `Copy this link: ${data.url}`;
    }
    note.hidden = false;
  });
}

/**
 * Keeps the information column in view while the gallery scrolls. When the
 * column is taller than the screen (an accordion is open) it sticks by its
 * bottom edge instead, so no control is ever stuck out of reach.
 */
function stickInfo(info) {
  const set = () => {
    const header = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--header-h')) * parseFloat(getComputedStyle(document.documentElement).fontSize) || 80;
    const top = header + 16;
    const room = window.innerHeight - top - 16;
    info.style.setProperty('--stick', `${info.offsetHeight <= room ? top : window.innerHeight - info.offsetHeight - 16}px`);
  };
  new ResizeObserver(set).observe(info);
  window.addEventListener('resize', set, { passive: true });
}
