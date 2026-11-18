import logoSvg from '../assets/svg/logo.svg?raw';
import { primaryNav } from '../data/navigation.js';
import { siteConfig } from '../data/site.config.js';
import { getCart, onCartChange } from '../adapters/commerce.js';
import { el, qs, qsa, icons, esc } from '../utils/dom.js';
import { icon } from '../data/assets.js';
import { openModal } from './modal.js';
import { openCart } from './cart-drawer.js';
import { openSearch } from './search-overlay.js';
import { openAccount } from './inquiry-forms.js';

export const logoMarkup = (cls = '') => logoSvg.replace('<svg ', `<svg class="logo ${cls}" role="img" aria-label="MUSHI Infused Delights" `).replace(/ (width|height)="[^"]*"/g, '');

/** Wordmark without the "Infused Delights" line (viewBox cropped to the letters). */
export const wordmarkMarkup = (cls = '') => logoMarkup(cls).replace(/viewBox="[^"]*"/, 'viewBox="0 0 158 38"').replace('aria-label="MUSHI Infused Delights"', 'aria-label="MUSHI"');

function announcement() {
  const truck = icon('shipping-truck');
  const item = `<span class="announce__item"><img src="${truck.file}" width="29" height="14" alt="">${esc(siteConfig.announcement.text)}</span>`;
  return `
    <div class="announce" role="region" aria-label="Announcement">
      <p class="sr-only">${esc(siteConfig.announcement.text)}</p>
      <div class="marquee" data-marquee data-speed="38" aria-hidden="true"><div class="marquee__track">${item.repeat(4)}</div></div>
    </div>`;
}

function dropdown(group, i) {
  return `
    <li class="nav__group">
      <button class="nav__trigger" type="button" aria-expanded="false" aria-controls="nav-menu-${i}">${group.label}${icons.chevron}</button>
      <ul class="nav__menu" id="nav-menu-${i}">
        ${group.items.map((it) => `<li><a href="${it.href}">${it.label}</a></li>`).join('')}
      </ul>
    </li>`;
}

export function mountHeader() {
  const host = qs('#site-header');
  if (!host) return;
  host.innerHTML = `
    ${announcement()}
    <header class="header">
      <div class="header__inner">
        <button class="header__icon header__menu" type="button" aria-label="Open menu">${icons.menu}</button>
        <nav class="nav" aria-label="Primary"><ul class="nav__list">${primaryNav.map(dropdown).join('')}</ul></nav>
        <a class="header__logo" href="/" aria-label="MUSHI home">${logoMarkup()}</a>
        <div class="header__actions">
          <button class="header__icon" type="button" data-open="search" aria-label="Search">${icons.search}</button>
          <button class="header__icon header__account" type="button" data-open="account" aria-label="Account">${icons.account}</button>
          <button class="header__icon header__cart" type="button" data-open="cart">
            ${icons.bag}<span class="header__cart-label">Cart</span><span class="header__count" data-cart-count hidden></span>
          </button>
        </div>
      </div>
    </header>`;

  // Dropdowns: hover opens on fine pointers, click/Enter toggles everywhere,
  // Escape closes and returns focus, focus leaving the group closes it.
  const groups = qsa('.nav__group', host);
  const setOpen = (g, open) => {
    g.classList.toggle('is-open', open);
    qs('.nav__trigger', g).setAttribute('aria-expanded', String(open));
  };
  const hoverable = window.matchMedia('(hover: hover)').matches;
  groups.forEach((g) => {
    const trigger = qs('.nav__trigger', g);
    trigger.addEventListener('click', () => {
      const open = !g.classList.contains('is-open');
      groups.forEach((o) => setOpen(o, false));
      setOpen(g, open);
    });
    if (hoverable) {
      g.addEventListener('mouseenter', () => setOpen(g, true));
      g.addEventListener('mouseleave', () => setOpen(g, false));
    }
    g.addEventListener('focusout', (e) => {
      if (!g.contains(e.relatedTarget)) setOpen(g, false);
    });
    g.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && g.classList.contains('is-open')) {
        setOpen(g, false);
        trigger.focus();
      }
      if (e.key === 'ArrowDown' && document.activeElement === trigger) {
        e.preventDefault();
        setOpen(g, true);
        qs('.nav__menu a', g).focus();
      }
    });
  });
  document.addEventListener('click', (e) => {
    if (!e.target.closest('.nav__group')) groups.forEach((g) => setOpen(g, false));
  });

  host.addEventListener('click', (e) => {
    const t = e.target.closest('[data-open]');
    if (!t) return;
    ({ search: openSearch, account: openAccount, cart: openCart })[t.dataset.open]?.();
  });
  qs('.header__menu', host).addEventListener('click', openMobileMenu);

  // Solid background once the page has scrolled past the top of the hero.
  const header = qs('.header', host);
  const sentinel = el('<div class="header-sentinel" aria-hidden="true"></div>');
  host.before(sentinel);
  new IntersectionObserver(([e]) => header.classList.toggle('is-stuck', !e.isIntersecting), { rootMargin: '80px 0px 0px 0px' }).observe(sentinel);

  const paint = (cart) => {
    qsa('[data-cart-count]').forEach((n) => {
      n.textContent = cart.itemCount;
      n.hidden = cart.itemCount === 0;
    });
    const btn = qs('.header__cart', host);
    btn.setAttribute('aria-label', cart.itemCount ? `Cart, ${cart.itemCount} ${cart.itemCount === 1 ? 'item' : 'items'}` : 'Cart, empty');
  };
  paint(getCart());
  onCartChange(paint);
}

function openMobileMenu() {
  const m = openModal({
    label: 'Menu',
    variant: 'drawer modal--left',
    html: `
      <nav class="mobile-nav" aria-label="Mobile">
        ${primaryNav.map((g) => `
          <section>
            <h2 class="mobile-nav__title">${g.label}</h2>
            <ul>${g.items.map((it) => `<li><a href="${it.href}">${it.label}</a></li>`).join('')}</ul>
          </section>`).join('')}
        <div class="mobile-nav__foot">
          <button type="button" class="btn btn--outline" data-mobile="search">${icons.search} Search</button>
          <button type="button" class="btn btn--outline" data-mobile="account">${icons.account} Account</button>
        </div>
      </nav>`,
    onOpen(root) {
      root.addEventListener('click', (e) => {
        const b = e.target.closest('[data-mobile]');
        if (!b) return;
        m.close();
        setTimeout(b.dataset.mobile === 'search' ? openSearch : openAccount, 60);
      });
    },
  });
}
