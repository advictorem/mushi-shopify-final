import { siteConfig } from '../data/site.config.js';
import { esc } from '../utils/dom.js';

/** Small staging-only marker for copy or assets that still need sign-off. */
export const reviewFlag = (note) =>
  siteConfig.showReviewFlags && note ? `<span class="review-flag" title="${esc(note)}"><span aria-hidden="true">Needs review</span><span class="sr-only">Needs review: ${esc(note)}</span></span>` : '';
