import { faqs } from '../data/content.js';
import { faqMarkup } from '../sections/home-content.js';
import { pageHeader } from './_shared.js';

export function render(main) {
  main.innerHTML = `
    ${pageHeader('Got questions?', 'Good questions deserve clear answers.', 'FAQs')}
    <section class="page__section"><div class="accordion" data-accordion>${faqMarkup(faqs)}</div>
      <p class="page__cta">Still curious? <a class="link" href="/pages/contact.html">Contact us</a></p>
    </section>`;
}
