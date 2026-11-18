import { siteConfig } from '../data/site.config.js';
import { store, qs } from '../utils/dom.js';
import { openModal } from './modal.js';
import { wordmarkMarkup } from './header.js';

const KEY = 'mushi.age.v1';
const DAY = 86400000;
const waiters = [];
let passed = false;

function isRemembered() {
  const t = store.get(KEY, 0);
  return typeof t === 'number' && Date.now() - t < siteConfig.ageGate.rememberDays * DAY;
}

function resolve() {
  passed = true;
  document.documentElement.classList.add('age-ok');
  waiters.splice(0).forEach((fn) => fn());
}

/** Run `fn` once the visitor is through the age gate (immediately if already). */
export function whenAgeConfirmed(fn) {
  if (passed) fn();
  else waiters.push(fn);
}

/**
 * Frontend age gate. It blocks the page, traps focus and cannot be dismissed
 * with Escape. It is NOT a substitute for legally required age verification.
 */
export function initAgeGate() {
  const cfg = siteConfig.ageGate;
  if (!cfg.enabled || isRemembered()) return resolve();
  const live = siteConfig.liveSite;
  const gate = openModal({
    label: 'Age verification',
    variant: 'split modal--gate',
    dismissible: false,
    html: `
      <div class="gate">
        <div class="gate__content">
          ${wordmarkMarkup('gate__logo')}
          <div data-gate-step="ask">
            <h2 class="gate__title">Please verify you are over ${cfg.minimumAge} years of age to continue.</h2>
            <div class="gate__actions">
              <button class="btn btn--pill" type="button" data-gate="yes" autofocus>Yes</button>
              <button class="btn btn--pill" type="button" data-gate="no">No</button>
            </div>
          </div>
          <div data-gate-step="denied" hidden>
            <h2 class="gate__title" tabindex="-1">Sorry, you must be ${cfg.minimumAge} or older to visit this site.</h2>
            <div class="gate__actions">
              <a class="btn btn--pill" href="${cfg.exitUrl}">Leave site</a>
              <button class="btn btn--pill" type="button" data-gate="back">Go back</button>
            </div>
          </div>
          <p class="gate__legal">By entering this site you are agreeing to the <a href="${live}/pages/terms-of-service" target="_blank" rel="noopener">Terms of Use</a> and <a href="${live}/pages/privacy-policy" target="_blank" rel="noopener">Privacy Policy</a>.</p>
        </div>
        <div class="gate__media"><img src="/assets/placeholder/age-gate.webp" alt="" width="442" height="602"></div>
      </div>`,
    onOpen(root) {
      const show = (step) => root.querySelectorAll('[data-gate-step]').forEach((n) => (n.hidden = n.dataset.gateStep !== step));
      root.addEventListener('click', (e) => {
        const a = e.target.closest('[data-gate]')?.dataset.gate;
        if (a === 'yes') {
          store.set(KEY, Date.now());
          gate.close();
          resolve();
        } else if (a === 'no') {
          show('denied');
          qs('[data-gate-step="denied"] .gate__title', root).focus();
        } else if (a === 'back') {
          show('ask');
          qs('[data-gate="yes"]', root).focus();
        }
      });
    },
  });
}
