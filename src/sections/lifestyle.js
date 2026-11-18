import { lifestyle } from '../data/content.js';
import { picture } from '../data/assets.js';
import { qs, qsa } from '../utils/dom.js';

/**
 * Lifestyle accordion. Desktop: five panels that widen on hover, focus or
 * click. Mobile (CSS): the same markup becomes a swipeable scroll-snap row.
 */
export function initLifestyle() {
  const host = qs('[data-lifestyle]');
  if (!host) return;
  host.innerHTML = lifestyle.map((p) => `
    <button class="lifestyle__panel" type="button" aria-pressed="false" data-key="${p.key}">
      <span class="lifestyle__media" data-parallax="0.06">${picture(p.image, { alt: p.alt, sizes: '(min-width: 900px) 45vw, 80vw', style: `object-position:${p.focus}` })}</span>
      <span class="lifestyle__label">${p.label}</span>
    </button>`).join('');

  const panels = qsa('.lifestyle__panel', host);
  const activate = (panel) => {
    panels.forEach((p) => {
      const on = p === panel;
      p.classList.toggle('is-active', on);
      p.setAttribute('aria-pressed', String(on));
    });
    host.classList.toggle('has-active', Boolean(panel));
  };
  const fine = window.matchMedia('(hover: hover) and (min-width: 900px)');
  panels.forEach((p) => {
    p.addEventListener('mouseenter', () => fine.matches && activate(p));
    p.addEventListener('focus', () => activate(p));
    p.addEventListener('click', () => activate(p.classList.contains('is-active') && !fine.matches ? null : p));
  });
  host.addEventListener('mouseleave', () => fine.matches && !host.contains(document.activeElement) && activate(null));
}
