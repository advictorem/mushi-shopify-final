import { qsa, reducedMotion } from '../utils/dom.js';

/**
 * Scroll-snap carousel with previous/next buttons and pagination dots.
 *   <div data-carousel>
 *     <div class="carousel__track" data-carousel-track> …slides… </div>
 *     <div data-carousel-dots></div>
 *     <button data-carousel-prev>, <button data-carousel-next>   (optional)
 *   </div>
 * Native scrolling gives touch swiping and keyboard scrolling for free; the
 * script only adds controls and keeps them in sync. Controls hide themselves
 * when everything fits.
 */
export function initCarousels(root = document) {
  qsa('[data-carousel]', root).forEach((c) => {
    if (c.dataset.ready) return;
    c.dataset.ready = 'true';
    const track = c.querySelector('[data-carousel-track]');
    const dots = c.querySelector('[data-carousel-dots]');
    const prev = c.querySelector('[data-carousel-prev]');
    const next = c.querySelector('[data-carousel-next]');
    const label = c.dataset.carouselLabel || 'Carousel';
    track.setAttribute('tabindex', '0');
    track.setAttribute('role', 'group');
    track.setAttribute('aria-label', label);

    const pages = () => Math.max(1, Math.round(track.scrollWidth / track.clientWidth - 0.15) || 1);
    const current = () => Math.round(track.scrollLeft / Math.max(1, track.scrollWidth - track.clientWidth) * (pages() - 1)) || 0;
    const go = (i) => {
      const max = track.scrollWidth - track.clientWidth;
      const n = pages();
      track.scrollTo({ left: n > 1 ? (max * i) / (n - 1) : 0, behavior: reducedMotion() ? 'auto' : 'smooth' });
    };

    function renderDots() {
      const n = pages();
      const scrollable = track.scrollWidth - track.clientWidth > 4;
      c.classList.toggle('is-static', !scrollable);
      if (!dots) return;
      dots.innerHTML = '';
      if (!scrollable) return;
      for (let i = 0; i < n; i++) {
        const b = document.createElement('button');
        b.type = 'button';
        b.className = 'carousel__dot';
        b.setAttribute('aria-label', `${label}: page ${i + 1} of ${n}`);
        b.addEventListener('click', () => go(i));
        dots.append(b);
      }
      sync();
    }
    function sync() {
      const i = current();
      if (dots) [...dots.children].forEach((d, j) => d.setAttribute('aria-current', j === i ? 'true' : 'false'));
      if (prev) prev.disabled = track.scrollLeft < 4;
      if (next) next.disabled = track.scrollLeft > track.scrollWidth - track.clientWidth - 4;
    }
    let raf = 0;
    track.addEventListener('scroll', () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(sync);
    }, { passive: true });
    prev?.addEventListener('click', () => go(Math.max(0, current() - 1)));
    next?.addEventListener('click', () => go(Math.min(pages() - 1, current() + 1)));
    new ResizeObserver(renderDots).observe(track);
    renderDots();
  });
}
