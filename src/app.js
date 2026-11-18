// Shared shell for every page: header, footer, cart, search, modals,
// age gate, offer popup and motion utilities.
import { mountHeader } from './components/header.js';
import { mountFooter } from './components/footer.js';
import { initMarquees } from './components/marquee.js';
import { initCarousels } from './components/carousel.js';
import { initAccordions } from './components/accordion.js';
import { bindCommerceControls } from './components/product-card.js';
import { bindModalTriggers, bindPreviewForm } from './components/inquiry-forms.js';
import { initAgeGate } from './components/age-gate.js';
import { initOfferPopup } from './components/offer-popup.js';
import { initVideoPlayers } from './components/video-player.js';
import { initReveal, initParallax } from './utils/motion.js';
import { qsa } from './utils/dom.js';

/** Call after page-specific markup has been rendered. */
export function initSite() {
  mountHeader();
  mountFooter();
  bindCommerceControls(document);
  bindModalTriggers(document);
  qsa('main [data-preview-form]').forEach((f) => bindPreviewForm(f, { success: f.dataset.success || 'Thanks.' }));
  initMarquees();
  initCarousels();
  initAccordions();
  initVideoPlayers();
  initReveal();
  initParallax();
  initAgeGate();
  initOfferPopup();
  // Fonts change text widths; rebuild marquees once they have loaded.
  document.fonts?.ready.then(() => qsa('[data-marquee]').forEach((m) => m.rebuild?.()));
}
