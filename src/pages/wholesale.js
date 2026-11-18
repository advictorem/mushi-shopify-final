import { picture } from '../data/assets.js';
import { pageHeader } from './_shared.js';

export function render(main) {
  main.innerHTML = `
    ${pageHeader('More Mushi. More vibes.', '', 'Wholesale')}
    <section class="page__section page__split">
      <div class="page__media page__media--plain">${picture('wholesale-display', { alt: 'MUSHI bulk display boxes of Green Apple, Peach Bliss and Cherry gummies', sizes: '(min-width: 900px) 46vw, 92vw', eager: true })}</div>
      <div class="prose">
        <p>Stock your shelves with Mushi. Our bulk boxes include 10 pouches of feel-good deliciousness, perfect for dispensaries, retail stores, and specialty shops looking to bring something different to their customers.</p>
        <p><button class="btn btn--dark" type="button" data-open-modal="wholesale">Wholesale inquiries</button></p>
      </div>
    </section>`;
}
