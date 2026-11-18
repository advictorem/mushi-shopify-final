import { picture } from '../data/assets.js';

/**
 * Sunset beach that closes a page above the footer. The photo fades in and
 * floats up as it scrolls into view ([data-rise], src/utils/motion.js).
 * Used by Contact and About; `deep` pulls it further up under the content.
 * The page's <main> needs the `page--flush` class so it meets the footer.
 */
export function beachMarkup({ deep = false } = {}) {
  return `<div class="page-beach${deep ? ' page-beach--deep' : ''}" aria-hidden="true" data-rise>${picture('contact-beach', { alt: '', sizes: deep ? '(min-width: 700px) 100vw, 190vw' : '100vw' })}</div>`;
}
