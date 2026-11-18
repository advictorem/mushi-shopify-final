import { el, icons, trapFocus, lockScroll, focusables } from '../utils/dom.js';

const stack = [];

/**
 * Accessible modal dialog. One implementation behind the age gate, offer
 * popups, inquiry forms, account placeholder, search and cart drawer.
 *
 * @param {object} o
 * @param {string} o.label         accessible name
 * @param {string} o.html          inner HTML of the panel
 * @param {string} [o.variant]     'center' | 'drawer' | 'top' | 'split'
 * @param {boolean} [o.dismissible=true]  Esc, backdrop and close button
 * @param {(root: HTMLElement) => void} [o.onOpen]
 * @param {() => void} [o.onClose]
 */
export function openModal({ label, html, variant = 'center', dismissible = true, onOpen, onClose }) {
  const opener = document.activeElement;
  const root = el(`
    <div class="modal modal--${variant}" role="dialog" aria-modal="true" aria-label="${label}">
      <div class="modal__backdrop" ${dismissible ? 'data-close' : ''}></div>
      <div class="modal__panel" tabindex="-1">
        ${dismissible ? `<button class="modal__close" type="button" data-close aria-label="Close">${icons.close}</button>` : ''}
        ${html}
      </div>
    </div>`);
  document.body.append(root);
  lockScroll(true);
  const release = trapFocus(root);
  let closed = false;

  function close() {
    if (closed) return;
    closed = true;
    root.classList.remove('is-open');
    release();
    document.removeEventListener('keydown', onKey);
    stack.splice(stack.indexOf(api), 1);
    lockScroll(false);
    const done = () => root.remove();
    root.addEventListener('transitionend', done, { once: true });
    setTimeout(done, 450);
    if (opener && document.contains(opener)) opener.focus({ preventScroll: true });
    onClose?.();
  }
  function onKey(e) {
    if (e.key === 'Escape' && dismissible && stack[stack.length - 1] === api) close();
  }
  const api = { root, close };
  stack.push(api);
  document.addEventListener('keydown', onKey);
  root.addEventListener('click', (e) => {
    if (e.target.closest('[data-close]')) close();
  });

  onOpen?.(root);
  requestAnimationFrame(() => {
    root.classList.add('is-open');
    const target = root.querySelector('[autofocus]') || focusables(root.querySelector('.modal__panel'))[0] || root.querySelector('.modal__panel');
    target.focus({ preventScroll: true });
  });
  return api;
}
