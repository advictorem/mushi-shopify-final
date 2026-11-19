import { esc } from '../utils/dom.js';

/** Standard page header used by every secondary template. */
// Each sentence of a title stays together: "More Mushi." / "More vibes." never splits mid-sentence on a phone.
const sentences = (title) => title.split(/(?<=[.!?])\s+/).map((t) => `<span class="page__title-part">${esc(t)}</span>`).join(' ');

export const pageHeader = (title, intro = '', label = '') => `
  <header class="page__header">
    <p class="display-label page__label" aria-hidden="true">${esc(label || title)}</p>
    <h1 class="page__title">${sentences(title)}</h1>
    ${intro ? `<p class="page__intro">${esc(intro)}</p>` : ''}
  </header>`;

export const previewBanner = (text) => `<p class="page__preview">${esc(text)}</p>`;
