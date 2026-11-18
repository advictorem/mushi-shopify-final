import { qsa, reducedMotion } from './dom.js';

/** Fade/translate elements in once as they enter the viewport: [data-reveal]. */
export function initReveal(root = document) {
  const items = qsa('[data-reveal]', root);
  if (reducedMotion() || !('IntersectionObserver' in window)) {
    items.forEach((n) => n.classList.add('is-in'));
    return;
  }
  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((e) => {
        if (!e.isIntersecting) return;
        e.target.classList.add('is-in');
        io.unobserve(e.target);
      });
    },
    { rootMargin: '0px 0px -12% 0px', threshold: 0.05 }
  );
  items.forEach((n) => io.observe(n));
}

/**
 * Scroll parallax: [data-parallax="0.12"] shifts by that fraction of its
 * distance from the viewport centre. Transform-only, one rAF per frame, and
 * only for elements currently on screen. Desktop pointers only.
 */
export function initParallax(root = document) {
  const nodes = qsa('[data-parallax]', root);
  if (!nodes.length || reducedMotion() || !window.matchMedia('(min-width: 900px)').matches) return;
  const visible = new Set();
  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => (e.isIntersecting ? visible.add(e.target) : visible.delete(e.target)));
    request();
  }, { rootMargin: '20% 0px' });
  nodes.forEach((n) => io.observe(n));

  let ticking = false;
  const update = () => {
    ticking = false;
    const vh = window.innerHeight;
    visible.forEach((n) => {
      const host = n.parentElement.getBoundingClientRect();
      let offset = (host.top + host.height / 2 - vh / 2) * -parseFloat(n.dataset.parallax || '0.1');
      // Never move an oversized child far enough to expose its container.
      const spare = (n.offsetHeight - host.height) / 2 - 1;
      if (spare > 0) offset = Math.max(-spare, Math.min(spare, offset));
      n.style.transform = `translate3d(0, ${offset.toFixed(1)}px, 0)`;
    });
  };
  function request() {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(update);
  }
  window.addEventListener('scroll', request, { passive: true });
  window.addEventListener('resize', request, { passive: true });
  request();
}
