import { qsa } from '../utils/dom.js';

/**
 * Seamless horizontal marquee.
 *   <div class="marquee" data-marquee data-speed="60" data-direction="left|right">
 *     <div class="marquee__track"> …items… </div>
 *   </div>
 * Items are cloned until one "set" is at least as wide as the container, then
 * the whole set is duplicated once and the track is translated by exactly one
 * set width, so the loop has no seam. Pauses on hover/focus; reduced motion is
 * handled in CSS (the strip becomes a static, scrollable row).
 */
export function initMarquees(root = document) {
  qsa('[data-marquee]', root).forEach((m) => {
    const track = m.querySelector('.marquee__track');
    if (!track || track.dataset.ready) return;
    const originals = [...track.children];
    if (!originals.length) return;
    const build = () => {
      track.querySelectorAll('[data-clone]').forEach((n) => n.remove());
      const setWidth = track.scrollWidth;
      if (!setWidth) return;
      const copies = Math.max(1, Math.ceil(m.clientWidth / setWidth));
      const clone = (n) => {
        const c = n.cloneNode(true);
        c.dataset.clone = '';
        c.setAttribute('aria-hidden', 'true');
        c.querySelectorAll('a,button').forEach((f) => f.setAttribute('tabindex', '-1'));
        return c;
      };
      for (let i = 1; i < copies; i++) originals.forEach((n) => track.append(clone(n)));
      const fullSet = [...track.children];
      fullSet.forEach((n) => track.append(clone(n)));
      const distance = track.scrollWidth / 2;
      track.style.setProperty('--marquee-distance', `${distance}px`);
      track.style.setProperty('--marquee-duration', `${distance / Number(m.dataset.speed || 60)}s`);
    };
    build();
    m.rebuild = build;
    track.dataset.ready = 'true';
    let w = m.clientWidth;
    new ResizeObserver(() => {
      if (Math.abs(m.clientWidth - w) < 40) return;
      w = m.clientWidth;
      build();
    }).observe(m);
  });
}
