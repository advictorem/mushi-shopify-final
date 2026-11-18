import { icon } from '../data/assets.js';
import { esc } from '../utils/dom.js';

/** Grid of icon benefit boxes, three per row. */
export const benefitBoxes = (items) => `
  <ul class="benefit-boxes">
    ${items.map((b) => { const a = icon(b.icon); return `
      <li class="benefit-box" data-reveal>
        <img src="${a.file}" alt="" width="${a.width}" height="${a.height}" loading="lazy">
        <h3>${esc(b.title)}</h3>
        <p>${esc(b.text)}</p>
      </li>`; }).join('')}
  </ul>`;
