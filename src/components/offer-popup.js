import { siteConfig } from '../data/site.config.js';
import { store, qs } from '../utils/dom.js';
import { picture } from '../data/assets.js';
import { openModal } from './modal.js';
import { whenAgeConfirmed } from './age-gate.js';
import { bindPreviewForm } from './inquiry-forms.js';
import { reviewFlag } from './review-flag.js';

const KEY = 'mushi.offer.dismissed.v1';
const DAY = 86400000;

// Both variants live here. Layout follows the age gate (split panel); the
// Figma frames for A and B could not be read, so copy and art are provisional.
const VARIANTS = {
  a: {
    label: 'Offer: 10% off your first order',
    title: 'Join the feel-good club',
    body: 'First dibs on new flavors, rituals worth stealing, and 10% off your first order.',
    image: 'category-gummies',
    tone: 'mint',
    form: true,
  },
  b: {
    label: 'Offer: bundle and save',
    title: 'Can’t get enough?',
    body: 'Save up to 50% on Mushi bundles. The more you buy, the more you save.',
    image: 'bundle-group',
    tone: 'peach',
    cta: { label: 'Build your bundle', href: '/pages/bundles.html' },
  },
};

function activeVariant() {
  const q = new URLSearchParams(location.search).get('offer');
  const v = (q || siteConfig.offerPopup.active || 'disabled').toLowerCase();
  return { key: VARIANTS[v] ? v : null, forced: Boolean(q) };
}

export function initOfferPopup() {
  const { key, forced } = activeVariant();
  if (!key) return;
  const dismissed = store.get(KEY, 0);
  if (!forced && Date.now() - dismissed < siteConfig.offerPopup.rememberDays * DAY) return;
  // The timer starts only after the age gate is passed, so the popup can
  // never sit on top of it.
  whenAgeConfirmed(() => setTimeout(() => show(key), siteConfig.offerPopup.delayMs));
}

function show(key) {
  if (document.querySelector('.modal')) return setTimeout(() => show(key), 4000); // wait for other dialogs
  const v = VARIANTS[key];
  openModal({
    label: v.label,
    variant: `split modal--offer modal--${v.tone}`,
    html: `
      <div class="offer">
        <div class="offer__content">
          <p class="offer__variant">Offer ${key.toUpperCase()} ${reviewFlag('Popup design and copy are provisional — the Figma frame could not be read')}</p>
          <h2 class="offer__title">${v.title}</h2>
          <p class="offer__body">${v.body}</p>
          ${v.form ? `
            <form class="offer__form" data-preview-form="offer" novalidate>
              <div class="field">
                <label for="offer-email">Email address</label>
                <input id="offer-email" name="email" type="email" autocomplete="email" required>
              </div>
              <button class="btn btn--dark btn--block" type="submit">Get 10% off</button>
              <p class="form__status" role="status"></p>
            </form>` : `<a class="btn btn--dark" href="${v.cta.href}">${v.cta.label}</a>`}
          <button class="link offer__skip" type="button" data-close>No thanks</button>
        </div>
        <div class="offer__media">${picture(v.image, { alt: '', sizes: '(min-width: 800px) 420px, 80vw' })}</div>
      </div>`,
    onOpen(root) {
      bindPreviewForm(qs('form', root), { success: 'You’re on the list.' });
    },
    onClose() {
      store.set(KEY, Date.now());
    },
  });
}
