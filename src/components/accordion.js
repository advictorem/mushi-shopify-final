import { qsa, reducedMotion } from '../utils/dom.js';

/**
 * Animated <details> accordion. Works without JS (native details); the script
 * adds a height transition. [data-accordion="single"] closes siblings.
 */
export function initAccordions(root = document) {
  qsa('[data-accordion]', root).forEach((group) => {
    const single = group.dataset.accordion === 'single';
    qsa('details', group).forEach((d) => {
      const summary = d.querySelector('summary');
      const body = d.querySelector('.accordion__body');
      if (!summary || !body) return;
      summary.addEventListener('click', (e) => {
        e.preventDefault();
        toggle(d, body, !d.open || d.classList.contains('is-closing'));
        if (single && d.open) qsa('details[open]', group).forEach((o) => o !== d && toggle(o, o.querySelector('.accordion__body'), false));
      });
    });
  });
}

function toggle(d, body, open) {
  if (reducedMotion()) {
    d.open = open;
    return;
  }
  body.getAnimations().forEach((a) => a.cancel());
  if (open) {
    d.classList.remove('is-closing');
    d.open = true;
    const h = body.scrollHeight;
    body.animate([{ height: '0px', opacity: 0 }, { height: `${h}px`, opacity: 1 }], { duration: 320, easing: 'cubic-bezier(.2,.7,.2,1)' });
  } else if (d.open) {
    d.classList.add('is-closing');
    const h = body.scrollHeight;
    const a = body.animate([{ height: `${h}px`, opacity: 1 }, { height: '0px', opacity: 0 }], { duration: 240, easing: 'cubic-bezier(.4,0,.6,1)' });
    a.onfinish = () => {
      d.open = false;
      d.classList.remove('is-closing');
    };
  }
}
