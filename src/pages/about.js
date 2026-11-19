import { beachMarkup, initBeachRipple } from '../sections/beach.js';
import { qsa, reducedMotion } from '../utils/dom.js';
import { whenAgeConfirmed } from '../components/age-gate.js';

// The manifesto markup lives in pages/about.html. This adds the shared beach and
// starts the inline video; scroll-fill, parallax and rise are started by initSite() (src/app.js).
export function render(main) {
  main.insertAdjacentHTML('beforeend', beachMarkup({ deep: true, ripple: true }));
  initBeachRipple(main);
  initInlineVideos(main);
}

/** [data-inline-video]: silent looping clip inside an inline frame. Plays only while on screen; poster only with reduced motion. */
function initInlineVideos(root) {
  const videos = qsa('video[data-inline-video]', root);
  if (!videos.length || reducedMotion()) return;
  whenAgeConfirmed(() => {
    const io = new IntersectionObserver((entries) => {
      entries.forEach(({ target: v, isIntersecting }) => {
        if (!isIntersecting) return v.pause();
        if (!v.src) v.src = v.dataset.src;
        v.play().catch(() => {}); // autoplay blocked: the poster stays
      });
    });
    videos.forEach((v) => io.observe(v));
  });
}
