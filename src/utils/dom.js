export const qs = (sel, root = document) => root.querySelector(sel);
export const qsa = (sel, root = document) => [...root.querySelectorAll(sel)];

/** Build an element from an HTML string. */
export function el(html) {
  const t = document.createElement('template');
  t.innerHTML = html.trim();
  return t.content.firstElementChild;
}

export const esc = (s = '') =>
  String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

/** Format integer minor units (cents) for display. */
export function money(minor, currency = 'USD') {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(minor / 100);
}

export const reducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/** localStorage that never throws (private mode, blocked storage). */
export const store = {
  get(key, fallback = null) {
    try {
      const v = localStorage.getItem(key);
      return v === null ? fallback : JSON.parse(v);
    } catch {
      return fallback;
    }
  },
  set(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch {
      /* storage unavailable: state lives for this page view only */
    }
  },
};

const FOCUSABLE = 'a[href],button:not([disabled]),input:not([disabled]),select:not([disabled]),textarea:not([disabled]),[tabindex]:not([tabindex="-1"])';
export const focusables = (root) => qsa(FOCUSABLE, root).filter((n) => n.offsetParent !== null || n === document.activeElement);

/** Keep Tab inside `root`. Returns a function that removes the trap. */
export function trapFocus(root) {
  const onKey = (e) => {
    if (e.key !== 'Tab') return;
    const f = focusables(root);
    if (!f.length) return e.preventDefault();
    const first = f[0];
    const last = f[f.length - 1];
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  };
  root.addEventListener('keydown', onKey);
  return () => root.removeEventListener('keydown', onKey);
}

let locks = 0;
export function lockScroll(on) {
  locks = Math.max(0, locks + (on ? 1 : -1));
  document.documentElement.classList.toggle('is-locked', locks > 0);
}

export const icons = {
  search: '<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" aria-hidden="true"><circle cx="10.5" cy="10.5" r="6.5"/><path d="m15.5 15.5 5 5"/></svg>',
  account: '<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" aria-hidden="true"><circle cx="12" cy="8" r="4"/><path d="M4.5 21a7.5 7.5 0 0 1 15 0"/></svg>',
  bag: '<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 8h14l-1 13H6L5 8Z"/><path d="M9 8V6a3 3 0 0 1 6 0v2"/></svg>',
  bagPlus: '<svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor" aria-hidden="true"><path d="M8.2 7V6a3.8 3.8 0 0 1 7.6 0v1H19l-1 14H6L5 7h3.200ZM10 7h4V6a2 2 0 0 0-4 0v1Zm1.200 5.200v2h-2v1.600h2v2h1.600v-2h2v-1.600h-2v-2h-1.600Z"/></svg>',
  chevron: '<svg viewBox="0 0 12 8" width="12" height="8" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m1.500 1.500 4.500 4.500 4.500-4.500"/></svg>',
  arrow: '<svg viewBox="0 0 40 64" width="40" height="64" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="m6 4 28 28L6 60"/></svg>',
  close: '<svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" aria-hidden="true"><path d="M5 5l14 14M19 5 5 19"/></svg>',
  menu: '<svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" aria-hidden="true"><path d="M3 7h18M3 12h18M3 17h18"/></svg>',
  plus: '<svg class="plus" viewBox="0 0 40 40" width="40" height="40" fill="none" stroke="currentColor" stroke-width="2.600" aria-hidden="true"><path d="M2 20h36"/><path class="plus__v" d="M20 2v36"/></svg>',
  check: '<svg viewBox="0 0 20 20" width="20" height="20" aria-hidden="true"><circle cx="10" cy="10" r="10" fill="#a3cf2f"/><path d="m5.500 10.300 3 3 6-6.300" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  cross: '<svg viewBox="0 0 20 20" width="20" height="20" aria-hidden="true"><circle cx="10" cy="10" r="10" fill="#e2581c"/><path d="m6.500 6.500 7 7m0-7-7 7" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round"/></svg>',
  instagram: '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.800" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.400" cy="6.600" r=".800" fill="currentColor"/></svg>',
  tiktok: '<svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor" aria-hidden="true"><path d="M14 3h3a5 5 0 0 0 4 4.500v3a8 8 0 0 1-4-1.200V15a6 6 0 1 1-6-6v3.100A2.900 2.900 0 1 0 14 15V3Z"/></svg>',
  star: '<svg viewBox="0 0 20 20" width="20" height="20" fill="currentColor" aria-hidden="true"><path d="m10 1.500 2.600 5.400 5.900.800-4.300 4.100 1 5.900L10 14.900l-5.200 2.800 1-5.900L1.500 7.700l5.900-.800L10 1.500Z"/></svg>',
};
