import { benefits } from '../data/content.js';
import { icon, picture } from '../data/assets.js';
import { esc } from '../utils/dom.js';
import { reviewFlag } from '../components/review-flag.js';
import { pageHeader } from './_shared.js';

export function render(main) {
  main.innerHTML = `
    ${pageHeader('Made with intention in every bite', '', 'Our story')}
    <section class="page__section page__split">
      <div class="page__media">${picture('story-intention', { alt: 'Silhouette of a dancer with arms raised in warm desert haze', sizes: '(min-width: 900px) 44vw, 92vw', eager: true })}</div>
      <div class="prose">
        <p>At MUSHI, we believe feeling good should taste just as good. That’s why we combine thoughtfully selected ingredients, irresistible flavors, and feel-good experiences into every bite. No complicated routines. No wellness chores. Just delicious indulgences made to elevate everyday moments and give you something worth looking forward to.</p>
        <p>Because life’s better when you savor the moment.</p>
        <p><a class="btn btn--dark" href="/pages/shop.html">Shop all</a></p>
      </div>
    </section>
    <section class="page__section page__section--wide">
      <ul class="benefits" aria-label="What goes into Mushi">${benefits.map((b) => { const a = icon(b.icon); return `<li><img src="${a.file}" alt="${esc(b.label)}" width="${a.width}" height="${a.height}" loading="lazy">${reviewFlag(b.review)}</li>`; }).join('')}</ul>
    </section>`;
}
