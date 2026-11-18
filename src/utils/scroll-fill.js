import { qsa, reducedMotion } from './dom.js';

/**
 * Scroll-fill text.
 *
 *   <h2 data-scroll-fill>
 *     <span data-fill-item>Word</span> <span data-fill-item>…</span>
 *   </h2>
 *
 * Every [data-fill-item] gets a --p custom property (0 → 1) as the fill passes
 * through it in reading order; the block gets --bp, its overall progress.
 * CSS decides what --p looks like (see .fill-word and .imedia in pages.css),
 * so words, inline images or anything else can take part.
 *
 * Progress follows the scroll position and reverses when scrolling up. The
 * row being filled stays between roughly 45% and 80% of the viewport height.
 * A block inside a [data-fill-pin] wrapper (a short position: sticky hold)
 * uses data-scroll-fill="pin": it fills while the wrapper holds it in place.
 *
 * Options, as attributes on the block:
 *   data-fill-start="0.8"   viewport fraction where the first row starts filling
 *   data-fill-end="0.45"    viewport fraction where the last row finishes
 *   data-fill-smooth="0.14" scrub smoothing per frame (1 = none)
 *
 * Without JavaScript, or with reduced motion, --p stays at its CSS default of
 * 1 and the text is simply shown filled.
 */
export function initScrollFill(root = document) {
  const pending = () => document.documentElement.classList.remove('sf-pending');
  const els = qsa('[data-scroll-fill]', root);
  if (!els.length || reducedMotion()) return pending();

  const blocks = els.map((el) => ({
    el,
    items: qsa('[data-fill-item]', el).map((node) => ({ node, a: 0, b: 1, p: -1 })),
    pin: el.dataset.scrollFill === 'pin' ? el.closest('[data-fill-pin]') : null,
    start: parseFloat(el.dataset.fillStart || '0.8'),
    end: parseFloat(el.dataset.fillEnd || '0.45'),
    k: parseFloat(el.dataset.fillSmooth || '0.14'),
    s0: 0,
    s1: 1,
    cur: null,
  }));

  // Layout is read here only (load, fonts, resize, image load) — never while scrolling.
  function measure() {
    const vh = window.innerHeight;
    const sy = window.scrollY;
    blocks.forEach((b) => {
      const rect = b.el.getBoundingClientRect();
      const top = rect.top + sy;
      const rows = [];
      b.items.forEach((it) => {
        const r = it.node.getBoundingClientRect();
        const mid = r.top + r.height / 2;
        const last = rows[rows.length - 1];
        const tol = Math.max(8, r.height * 0.5);
        if (last && Math.abs(last.mid - mid) < tol) last.items.push([it, r.width]);
        else rows.push({ mid, items: [[it, r.width]] });
      });
      rows.forEach((row, i) => {
        const total = row.items.reduce((n, [, w]) => n + w, 0) || 1;
        let run = 0;
        row.items.forEach(([it, w]) => {
          it.a = (i + run / total) / rows.length;
          run += w;
          it.b = (i + run / total) / rows.length;
        });
      });
      if (b.pin) {
        const wrap = b.pin.getBoundingClientRect();
        const stick = parseFloat(getComputedStyle(b.el).top) || 0;
        // The block may already be stuck, so take its natural top from the wrapper.
        const stuckAt = wrap.top + sy - stick;
        b.s0 = Math.max(0, Math.min(stuckAt, wrap.top + sy - vh * b.start));
        b.s1 = Math.max(b.s0 + 120, stuckAt + (wrap.height - rect.height) + rect.height * 0.1);
      } else {
        b.s0 = Math.max(0, top - vh * b.start);
        b.s1 = Math.max(b.s0 + vh * 0.3, top + rect.height - vh * b.end);
      }
    });
    request();
  }

  let ticking = false;
  function update() {
    ticking = false;
    const sy = window.scrollY;
    let moving = false;
    blocks.forEach((b) => {
      const target = Math.max(0, Math.min(1, (sy - b.s0) / (b.s1 - b.s0)));
      if (b.cur === null) b.cur = target; // no animation on first paint
      const delta = target - b.cur;
      if (Math.abs(delta) < 0.0004) {
        if (b.cur === target && b.done) return;
        b.cur = target;
      } else {
        b.cur += delta * b.k;
        moving = true;
      }
      b.done = !moving;
      b.el.style.setProperty('--bp', b.cur.toFixed(4));
      b.items.forEach((it) => {
        const p = Math.max(0, Math.min(1, (b.cur - it.a) / (it.b - it.a)));
        if (p === it.p) return;
        it.p = p;
        it.node.style.setProperty('--p', p.toFixed(3));
      });
    });
    if (moving) request();
  }
  function request() {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(update);
  }

  let resizeTimer;
  const remeasure = () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(measure, 120);
  };
  window.addEventListener('scroll', request, { passive: true });
  window.addEventListener('resize', remeasure, { passive: true });
  window.addEventListener('load', measure, { once: true });
  document.fonts?.ready.then(measure);
  els.forEach((el) => qsa('img', el).forEach((img) => img.complete || img.addEventListener('load', remeasure, { once: true })));

  measure();
  update();
  pending();
}
