import { esc } from '../utils/dom.js';

/** Standard page header used by every secondary template. */
export const pageHeader = (title, intro = '', label = '') => `
  <header class="page__header">
    <p class="display-label page__label" aria-hidden="true">${esc(label || title)}</p>
    <h1 class="page__title">${esc(title)}</h1>
    ${intro ? `<p class="page__intro">${esc(intro)}</p>` : ''}
  </header>`;

export const previewBanner = (text) => `<p class="page__preview">${esc(text)}</p>`;
