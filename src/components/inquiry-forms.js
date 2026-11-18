import { submitForm, PREVIEW_NOTE } from '../adapters/forms.js';
import { coachingOutcomes } from '../data/content.js';
import { qs, qsa } from '../utils/dom.js';
import { openModal } from './modal.js';
import { wordmarkMarkup } from './header.js';
import { siteConfig } from '../data/site.config.js';
import { icons } from '../utils/dom.js';

const MESSAGES = {
  valueMissing: (label) => `Enter your ${label.toLowerCase()}.`,
  typeMismatch: () => 'Enter a valid email address, like name@example.com.',
  patternMismatch: () => 'Enter a valid phone number.',
};

/** Validate one field; writes the message next to it. Returns true if valid. */
function validate(field) {
  const wrap = field.closest('.field') || field.parentElement;
  let error = qs('.field__error', wrap);
  const label = field.dataset.label || qs('label', wrap)?.textContent.replace('*', '').trim() || 'value';
  const v = field.validity;
  let msg = '';
  if (v.valueMissing) msg = field.tagName === 'SELECT' ? `Choose ${label.toLowerCase()}.` : MESSAGES.valueMissing(label);
  else if (v.typeMismatch) msg = MESSAGES.typeMismatch();
  else if (v.patternMismatch) msg = MESSAGES.patternMismatch();
  if (!error && msg) {
    error = document.createElement('p');
    error.className = 'field__error';
    error.id = `${field.id || field.name}-error`;
    wrap.append(error);
    field.setAttribute('aria-describedby', error.id);
  }
  if (error) error.textContent = msg;
  field.setAttribute('aria-invalid', msg ? 'true' : 'false');
  return !msg;
}

/**
 * Frontend-only form: validates, calls the forms adapter, then shows a state
 * that says plainly it is a preview. Used by every form on the site.
 */
export function bindPreviewForm(form, { success = 'Looks good.', onDone } = {}) {
  if (!form) return;
  const fields = () => qsa('input,select,textarea', form);
  form.addEventListener('blur', (e) => e.target.matches('input,select,textarea') && e.target.value && validate(e.target), true);
  form.addEventListener('input', (e) => e.target.getAttribute('aria-invalid') === 'true' && validate(e.target));
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const bad = fields().filter((f) => !validate(f));
    if (bad.length) return bad[0].focus();
    const btn = qs('[type="submit"]', form);
    const status = qs('.form__status', form);
    btn.disabled = true;
    const res = await submitForm(form.dataset.previewForm, Object.fromEntries(new FormData(form)));
    btn.disabled = false;
    if (onDone) return onDone(res);
    status.textContent = `${success} ${res.delivered ? '' : PREVIEW_NOTE}`;
    form.reset();
  });
}

const field = (id, label, attrs, required = true) => `
  <div class="field">
    <label for="${id}">${label}${required ? ' <span aria-hidden="true">*</span>' : ''}</label>
    <input id="${id}" name="${id.split('-').pop()}" ${attrs} ${required ? 'required' : ''}>
  </div>`;

function inquiryModal({ label, title, intro, name, extra, submit, doneMessage }) {
  const m = openModal({
    label,
    html: `
      <div class="inquiry">
        <h2 class="inquiry__title">${title}</h2>
        ${intro ? `<p class="inquiry__intro">${intro}</p>` : ''}
        <form data-preview-form="${name}" novalidate>
          ${field(`${name}-name`, 'Full name', 'type="text" autocomplete="name"')}
          ${field(`${name}-phone`, 'Phone', 'type="tel" autocomplete="tel" inputmode="tel" pattern="[0-9+\\(\\)\\-\\s.]{7,}"')}
          ${field(`${name}-email`, 'Email', 'type="email" autocomplete="email"')}
          ${extra}
          <button class="btn btn--dark btn--block" type="submit">${submit}</button>
          <p class="form__status" role="status"></p>
        </form>
      </div>`,
    onOpen(root) {
      bindPreviewForm(qs('form', root), {
        onDone() {
          qs('.inquiry', root).innerHTML = `
            <div class="inquiry__done">
              ${wordmarkMarkup('inquiry__logo')}
              <p class="inquiry__thanks" tabindex="-1">${doneMessage}</p>
              ${siteConfig.showReviewFlags ? `<p class="inquiry__preview">${PREVIEW_NOTE}</p>` : ''}
              <button class="btn btn--dark" type="button" data-close>Close</button>
            </div>`;
          qs('.inquiry__thanks', root).focus();
        },
      });
    },
  });
  return m;
}

export const openCoaching = () =>
  inquiryModal({
    label: 'Book a free coaching consult',
    title: 'Book a free coaching consult',
    name: 'coaching',
    extra: `
      <div class="field">
        <label for="coaching-outcome">Desired outcomes</label>
        <div class="select">
          <select id="coaching-outcome" name="outcome">
            <option value="">Select one</option>
            ${coachingOutcomes.map((o) => `<option>${o}</option>`).join('')}
          </select>
          ${icons.chevron}
        </div>
      </div>`,
    submit: 'Request my free consult',
    doneMessage: 'A Mushi team member will be in touch regarding your appointment, Thank you!',
  });

export const openWholesale = () =>
  inquiryModal({
    label: 'Wholesale inquiry',
    title: 'Wholesale inquiries',
    intro: 'Tell us about your shop and we’ll follow up about bulk boxes.',
    name: 'wholesale',
    extra: `
      <div class="field">
        <label for="wholesale-business">Business name <span aria-hidden="true">*</span></label>
        <input id="wholesale-business" name="business" type="text" autocomplete="organization" required>
      </div>`,
    submit: 'Send inquiry',
    doneMessage: 'A Mushi team member will be in touch regarding your inquiry, Thank you!',
  });

export const openAccount = () =>
  openModal({
    label: 'Account',
    html: `
      <div class="inquiry">
        <h2 class="inquiry__title">Account</h2>
        <p class="inquiry__intro">Sign-in, order history and subscription management arrive with the Shopify integration. No sign-in details are collected in this preview.</p>
        <a class="btn btn--dark" href="/pages/account.html">See what’s planned</a>
      </div>`,
  });

/** Wire [data-open-modal="coaching|wholesale"] triggers anywhere on the page. */
export function bindModalTriggers(root = document) {
  root.addEventListener('click', (e) => {
    const t = e.target.closest('[data-open-modal]');
    if (!t) return;
    e.preventDefault();
    ({ coaching: openCoaching, wholesale: openWholesale, account: openAccount })[t.dataset.openModal]?.();
  });
}
