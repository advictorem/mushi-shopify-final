import { lifestyle } from '../data/content.js';
import { picture } from '../data/assets.js';
import { qs, qsa } from '../utils/dom.js';

/**
 * Lifestyle accordion. Desktop: five panels that widen on hover. They are
 * decorative, not controls (client direction): no click, no focus stop.
 * Mobile (CSS): the same markup becomes a swipeable scroll-snap row.
 */
export function initLifestyle() {
  const host = qs('[data-lifestyle]');
  if (!host) return;
  host.innerHTML = lifestyle.map((p) => `
    <div class="lifestyle__panel" data-key="${p.key}">
      <span class="lifestyle__media" data-parallax="0.06">${picture(p.image, { alt: p.alt, sizes: '(min-width: 900px) 45vw, 80vw', style: `object-position:${p.focus}` })}</span>
      <span class="lifestyle__label">${p.label}</span>
    </div>`).join('');

  const panels = qsa('.lifestyle__panel', host);
  const activate = (panel) => {
    panels.forEach((p) => {
      const on = p === panel;
      p.classList.toggle('is-active', on);
    });
    host.classList.toggle('has-active', Boolean(panel));
  };
  const fine = window.matchMedia('(hover: hover) and (min-width: 900px)');
  panels.forEach((p) => {
    p.addEventListener('mouseenter', () => fine.matches && activate(p));
  });
  host.addEventListener('mouseleave', () => activate(null));
}
