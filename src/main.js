// Homepage entry.
import { initHero } from './sections/hero.js';
import { initCategoryShowcase } from './sections/category-showcase.js';
import { initLifestyle } from './sections/lifestyle.js';
import { initProductCarousels } from './sections/product-carousels.js';
import { renderHeroMarquee, renderBenefits, renderFaq, renderComparison, renderTestimonials, renderUgc, renderAssetFlags } from './sections/home-content.js';
import { initSite } from './app.js';

renderHeroMarquee();
initCategoryShowcase();
initLifestyle();
initProductCarousels();
renderBenefits();
renderFaq();
renderComparison();
renderTestimonials();
renderUgc();
renderAssetFlags();
initSite();
initHero();
