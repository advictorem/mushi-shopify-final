import { getProducts, getCategories } from '../adapters/commerce.js';
import { picture, icon } from '../data/assets.js';
import { productCard } from '../components/product-card.js';
import { renderComparison } from '../sections/home-content.js';
import { newsletterMarkup } from '../sections/newsletter.js';
import { esc, icons, qs, qsa } from '../utils/dom.js';

// Per-collection presentation. Products always come from the data layer.
const COLLECTIONS = {
  all: { hero: 'hero-shop-all', alt: 'MUSHI gummy pouches and chocolate boxes lined up on a stone ledge' },
  gummies: { hero: 'hero-shop-gummies', alt: 'Cherry, Green Apple and Peach Bliss gummy pouches on a stone ledge' },
};

// Copy from the approved Gummies collection comp.
const GUMMY_BENEFITS = [
  { icon: 'ingredient-cane', title: 'Organic cane sugar & tapioca syrup', text: 'A premium sweetener base that delivers just the right touch of flavor without overdoing it.' },
  { icon: 'ingredient-berry', title: 'Real elderberry juice for color, not artificial', text: 'Color from fruit, not artificial dyes because better ingredients make a better experience.' },
  { icon: 'ingredient-plant', title: 'Plant-based, clean & premium', text: 'Made with pectin, natural flavor, and thoughtfully chosen ingredients nothing fake, nothing synthetic.' },
];

const SORTS = {
  featured: null,
  'price-asc': (a, b) => (a.price ?? Infinity) - (b.price ?? Infinity),
  'price-desc': (a, b) => (b.price ?? -1) - (a.price ?? -1),
  name: (a, b) => a.title.localeCompare(b.title),
};
const SORT_LABELS = { featured: 'Featured', 'price-asc': 'Price, low to high', 'price-desc': 'Price, high to low', name: 'Name, A–Z' };
const sorted = (list, key) => (SORTS[key] ? [...list].sort(SORTS[key]) : list);

const hero = (cfg, title, crumb, showTitle) => `
  <header class="shop-hero">
    <div class="shop-hero__media" aria-hidden="true"><div class="shop-hero__img" data-parallax="0.42">${picture(cfg.hero, { alt: '', sizes: '100vw', eager: true })}</div></div>
    <div class="shop-hero__fade" aria-hidden="true"></div>
    <div class="shop-hero__inner">
      <nav class="shop-hero__crumbs" aria-label="Breadcrumb">
        <a href="/">Home</a> <span aria-hidden="true">/</span> <a href="/pages/shop.html">Shop</a> <span aria-hidden="true">/</span> <span aria-current="page">${esc(crumb)}</span>
      </nav>
      <h1 class="shop-hero__title${showTitle ? '' : ' sr-only'}">${esc(title)}</h1>
    </div>
  </header>`;

const toolbar = (categories, active) => `
  <div class="shop-bar">
    <details class="shop-bar__filters">
      <summary class="btn btn--outline">${icons.filter} Filters</summary>
      <ul class="shop-bar__menu">
        <li><a href="/pages/shop.html" ${active ? '' : 'aria-current="page"'}>All</a></li>
        ${categories.map((c) => `<li><a href="/pages/shop.html?category=${c.handle}" ${active?.handle === c.handle ? 'aria-current="page"' : ''}>${c.title}</a></li>`).join('')}
      </ul>
    </details>
    <details class="shop-bar__filters shop-bar__sort">
      <summary class="btn btn--outline">${icons.sort} Sort by</summary>
      <ul class="shop-bar__menu">
        ${Object.entries(SORT_LABELS).map(([k, l]) => `<li><button type="button" data-sort="${k}" aria-pressed="${k === 'featured'}">${l}</button></li>`).join('')}
      </ul>
    </details>
  </div>`;

const section = (c, withBar = '') => `
  <section class="shop-section shop-section--${c.handle}" aria-labelledby="shop-${c.handle}">
    ${withBar}
    <h2 class="display-label" id="shop-${c.handle}">${c.title}</h2>
    <div class="shop-grid" data-grid="${c.handle}"></div>
  </section>`;

/** Collection template: Shop All (sectioned) and single collections via ?category= */
export function render(main) {
  const categories = getCategories();
  const active = categories.find((c) => c.handle === new URLSearchParams(location.search).get('category')) || null;
  const cfg = { ...COLLECTIONS.all, ...(active ? COLLECTIONS[active.handle] || {} : {}) };
  const shown = active ? [active] : categories;
  document.title = `${active ? active.title : 'Shop all'} — MUSHI`;

  const bar = toolbar(categories, active);
  const isGummies = active?.handle === 'gummies';
  main.innerHTML = `
    ${hero(cfg, active ? active.title : 'Shop all', active ? active.title : 'All', Boolean(active))}
    ${isGummies ? `
      <section class="shop-intro" aria-labelledby="shop-intro-title">
        <h2 class="shop-intro__title" id="shop-intro-title">No fake stuff. Just <em class="marker">feel-good</em> stuff.</h2>
        <ul class="benefit-boxes">
          ${GUMMY_BENEFITS.map((b) => { const a = icon(b.icon); return `
            <li class="benefit-box" data-reveal>
              <img src="${a.file}" alt="" width="${a.width}" height="${a.height}" loading="lazy">
              <h3>${esc(b.title)}</h3>
              <p>${esc(b.text)}</p>
            </li>`; }).join('')}
        </ul>
        ${bar}
        <div class="shop-grid" data-grid="gummies"></div>
      </section>
      <section class="shop-compare" aria-labelledby="compare-title">
        <div class="compare">
          <h2 class="display-label display-label--compare" id="compare-title">Why Mushi?</h2>
          <table class="compare__table" data-comparison></table>
          <p class="compare__flag" data-comparison-flag></p>
        </div>
      </section>` : shown.map((c, i) => section(c, i === 0 ? bar : '')).join('')}
    ${newsletterMarkup()}`;

  const paint = (sort = 'featured') =>
    qsa('[data-grid]', main).forEach((g) => (g.innerHTML = sorted(getProducts(g.dataset.grid), sort).map(productCard).join('')));
  paint();
  const sortButtons = qsa('[data-sort]', main);
  sortButtons.forEach((b) => b.addEventListener('click', () => {
    paint(b.dataset.sort);
    sortButtons.forEach((o) => o.setAttribute('aria-pressed', String(o === b)));
    b.closest('details').removeAttribute('open');
  }));
  // Close either menu on Escape or an outside click.
  qsa('.shop-bar__filters', main).forEach((menu) => {
    document.addEventListener('click', (e) => !menu.contains(e.target) && menu.removeAttribute('open'));
    menu.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        menu.removeAttribute('open');
        qs('summary', menu).focus();
      }
    });
  });
  if (isGummies) renderComparison();
}
