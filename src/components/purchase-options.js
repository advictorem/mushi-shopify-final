import { getPurchaseOptions } from '../adapters/commerce.js';
import { esc, icons, money, qs, qsa } from '../utils/dom.js';
import { reviewFlag } from './review-flag.js';
import { stepper } from './product-card.js';

/**
 * Purchase options for a product page: one-time purchase or Subscribe & Save
 * with a delivery schedule, quantity, and an Add to cart button that shows the
 * line total. Prices are calculated from the product's base price by the
 * commerce adapter (getPurchaseOptions); nothing is hard-coded here.
 *
 * Products that cannot be subscribed to get the same block without the selector.
 *
 * Shopify phase: the radio value maps to "no selling plan" / "selling plan",
 * and the schedule <select> value maps to a selling plan ID
 * (frequency.sellingPlanId in src/data/subscription.config.js).
 */
export function purchaseOptionsMarkup(p) {
  const { subscription: sub } = getPurchaseOptions(p);
  const id = `po-${p.handle}`;
  return `
    <form class="po" data-purchase-options novalidate>
      ${sizesMarkup(p)}
      ${sub ? `
      <fieldset class="po__set">
        <legend class="po__legend">Purchase options ${sub.demo ? reviewFlag('Subscription preview: discount, schedules and terms need final sign-off; nothing is billed') : ''}</legend>
        <label class="po__card">
          <input type="radio" name="purchase" value="one-time" checked>
          <span class="po__radio" aria-hidden="true"></span>
          <span class="po__name">One-time purchase</span>
          <span class="po__price">${money(p.price, p.currency)}</span>
        </label>
        <label class="po__card">
          <input type="radio" name="purchase" value="subscription">
          <span class="po__radio" aria-hidden="true"></span>
          <span class="po__name">${esc(sub.label)} <span class="po__save">Save ${sub.discountType === 'percentage' ? `${sub.discountValue}%` : money(sub.discountValue, p.currency)}</span></span>
          <span class="po__price"><span class="sr-only">Was</span><s>${money(p.price, p.currency)}</s> <span class="sr-only">Now</span>${money(sub.price, p.currency)}</span>
        </label>
        <div class="po__freq" data-frequency inert>
          <div class="po__freq-inner">
            <label class="po__legend" for="${id}-freq">Deliver every</label>
            <div class="select">
              <select id="${id}-freq" name="frequency">
                ${sub.frequencies.map((f) => `<option value="${f.id}"${f.id === sub.defaultFrequency ? ' selected' : ''}>${esc(f.label)}</option>`).join('')}
              </select>
              ${icons.chevron}
            </div>
            <p class="po__terms">${esc(sub.termsText)}</p>
          </div>
        </div>
      </fieldset>` : p.price != null ? `<p class="po__single"><span class="sr-only">Price</span>${money(p.price, p.currency)}</p>` : `<p class="po__single po__single--pending">Price coming soon</p>${p.pending ? `<p class="po__terms">${esc(p.pending)}</p>` : ''}`}
      <div class="po__buy">
        ${p.price != null && p.available ? stepper(p.title) : ''}
        ${p.price != null && p.available
          ? '<button class="btn btn--dark po__add" type="submit">Add to cart</button>'
          : '<button class="btn btn--dark po__add" type="button" disabled>Coming soon</button>'}
      </div>
      <p class="po__summary" data-summary hidden></p>
      <p class="sr-only" role="status" data-announce></p>
    </form>`;
}

/** Size pills for apparel. Unavailable sizes are disabled, greyed and crossed out. */
function sizesMarkup(p) {
  if (!p.sizes?.length) return '';
  const first = p.sizes.find((z) => z.available);
  return `
      <fieldset class="po__set sizes">
        <legend class="po__legend">Size: <span data-size-label>${esc(first?.label ?? 'Unavailable')}</span> ${reviewFlag(p.sizesPending)}</legend>
        <div class="sizes__row">
          ${p.sizes.map((z) => `
          <label class="sizes__pill${z.available ? '' : ' is-out'}">
            <input type="radio" name="size" value="${esc(z.label)}"${z === first ? ' checked' : ''}${z.available ? '' : ' disabled'}>
            <span>${esc(z.label)}${z.available ? '' : '<span class="sr-only"> (unavailable)</span>'}</span>
          </label>`).join('')}
        </div>
      </fieldset>`;
}

/**
 * @param {HTMLElement} root  element containing the markup above
 * @param {object} p          product
 * @param {{ onChange?: (state) => void, onAdd: (state) => void }} handlers
 * @returns {{ getState: () => object, add: () => void }}
 */
export function initPurchaseOptions(root, p, { onChange, onAdd }) {
  const form = qs('[data-purchase-options]', root);
  const { subscription: sub } = getPurchaseOptions(p);
  const qty = qs('.stepper__value', form);
  const freqWrap = qs('[data-frequency]', form);
  const clamp = (n) => Math.max(1, Math.min(99, Number.parseInt(n, 10) || 1));

  function getState() {
    const type = sub && form.elements.purchase.value === 'subscription' ? 'subscription' : 'one-time';
    const frequency = type === 'subscription' ? sub.frequencies.find((f) => f.id === form.elements.frequency.value) : null;
    const unitPrice = type === 'subscription' ? sub.price : p.price;
    const quantity = qty ? clamp(qty.value) : 1;
    return { handle: p.handle, type, frequency, quantity, unitPrice, total: (unitPrice ?? 0) * quantity, size: form.elements.size?.value ?? null };
  }

  function paint(announce) {
    const s = getState();
    qsa('.po__card', form).forEach((c) => c.classList.toggle('is-selected', c.querySelector('input').checked));
    if (freqWrap) {
      freqWrap.classList.toggle('is-open', s.type === 'subscription');
      freqWrap.inert = s.type !== 'subscription';
    }
    const size = form.elements.size?.value;
    if (size) qs('[data-size-label]', form).textContent = size;
    // The line under the button appears only when it adds something: a subscription, or more than one.
    const summary = s.type === 'subscription'
      ? `${s.quantity} × ${p.title}: ${money(s.total, p.currency)} per delivery, ${s.frequency.label.toLowerCase()}`
      : s.quantity > 1 && p.price != null ? `${s.quantity} × ${p.title}: ${money(s.total, p.currency)}` : '';
    const line = qs('[data-summary]', form);
    line.textContent = summary;
    line.hidden = !summary;
    if (announce) qs('[data-announce]', form).textContent = `${size ? `Size ${size}. ` : ''}${sub ? (s.type === 'subscription' ? `${sub.label} selected. ` : 'One-time purchase selected. ') : ''}${p.price != null ? `Total ${money(s.total, p.currency)}${s.type === 'subscription' ? ` per delivery, ${s.frequency.label.toLowerCase()}` : ''}.` : ''}`;
    onChange?.(s);
  }

  const add = () => {
    if (!qty) return;
    onAdd(getState());
    qty.value = 1;
    paint(false);
  };
  form.addEventListener('change', () => {
    if (qty) qty.value = clamp(qty.value);
    paint(true);
  });
  // The shared stepper buttons update the input after this handler runs.
  form.addEventListener('click', (e) => e.target.closest('.stepper__btn') && requestAnimationFrame(() => paint(false)));
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    add();
  });
  paint(false);
  return { getState, add };
}
