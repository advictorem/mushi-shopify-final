import { picture } from '../data/assets.js';
import { qs, reducedMotion } from '../utils/dom.js';

/**
 * Sunset beach that closes a page above the footer. The photo fades in and
 * floats up as it scrolls into view ([data-rise], src/utils/motion.js).
 * Used by Contact and About. The page's <main> needs the `page--flush` class.
 *
 * Options
 *   deep    pulls the beach further up under the content (About)
 *   ripple  adds a slow water ripple over the sea (call initBeachRipple after inserting)
 */
export function beachMarkup({ deep = false, ripple = false } = {}) {
  const photo = picture('contact-beach', { alt: '', sizes: deep ? '(min-width: 700px) 100vw, 190vw' : '100vw' });
  return `
    <div class="page-beach${deep ? ' page-beach--deep' : ''}" aria-hidden="true" data-rise>
      <div class="page-beach__inner">
        ${photo}
        ${ripple ? `
        <div class="page-beach__water" data-ripple>${photo}</div>
        <svg class="page-beach__defs" width="0" height="0" focusable="false">
          <filter id="beach-ripple" x="0" y="0" width="100%" height="100%" color-interpolation-filters="sRGB">
            <feTurbulence type="fractalNoise" baseFrequency="0.009 0.06" numOctaves="2" seed="4" result="noise"/>
            <feDisplacementMap in="SourceGraphic" in2="noise" scale="16" xChannelSelector="R" yChannelSelector="G"/>
          </filter>
        </svg>` : ''}
      </div>
    </div>`;
}

/**
 * Water ripple: a second copy of the photo, masked to the sea, is pushed around
 * by slowly changing noise (SVG feTurbulence + feDisplacementMap). Runs only on
 * wider screens, only while the beach is on screen, at about 20 frames a second,
 * and not at all with reduced motion. Without it the photo is simply still.
 */
export function initBeachRipple(root = document) {
  const water = qs('[data-ripple]', root);
  const noise = qs('#beach-ripple feTurbulence', root);
  if (!water || !noise || reducedMotion() || !window.matchMedia('(min-width: 700px)').matches) return;
  water.classList.add('is-live');
  let visible = false;
  let last = 0;
  const frame = (now) => {
    if (!visible) return;
    if (now - last > 50) {
      last = now;
      const t = now / 1000;
      noise.setAttribute('baseFrequency', `${(0.009 + Math.sin(t * 0.55) * 0.0022).toFixed(5)} ${(0.06 + Math.cos(t * 0.4) * 0.012).toFixed(5)}`);
    }
    requestAnimationFrame(frame);
  };
  new IntersectionObserver(([e]) => {
    const was = visible;
    visible = e.isIntersecting;
    if (visible && !was) requestAnimationFrame(frame);
  }).observe(water);
}
