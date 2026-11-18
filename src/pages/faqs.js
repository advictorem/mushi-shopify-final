import { faqs } from '../data/content.js';
import { faqMarkup } from '../sections/home-content.js';
import { reviewFlag } from '../components/review-flag.js';
import { pageHeader } from './_shared.js';

// Copy from the client's wireframe (mushi-wireframes). Dosage content: needs compliance sign-off.
const dosageScale = `
  <section class="dosage" aria-labelledby="dosage-title">
    <h2 class="dosage__title" id="dosage-title">Your moment. Your pace.</h2>
    <p class="dosage__intro">Everyone experiences Mushi differently. Use the product according to its approved packaging and choose the experience that feels right for the moment.</p>
    <div class="dosage__oval">
      <h3 class="dosage__heading">Dosage scale</h3>
      <p class="dosage__per">5 per package</p>
      <div class="dosage__bar" aria-hidden="true"><span></span><span></span><span></span><span></span><span></span></div>
      <ul class="dosage__levels">
        <li><strong>1</strong><span>Moderate</span></li>
        <li><strong>2–3</strong><span>Mega</span></li>
        <li><strong>4–5</strong><span>Extreme</span></li>
      </ul>
    </div>
    <p class="dosage__note">Individual experiences may vary. Use only as directed on product packaging. ${reviewFlag('Dosage content — needs compliance review')}</p>
  </section>`;

export function render(main) {
  main.innerHTML = `
    ${pageHeader('Got questions?', 'Good questions deserve clear answers.', 'FAQs')}
    ${dosageScale}
    <section class="page__section"><div class="accordion" data-accordion>${faqMarkup(faqs)}</div>
      <p class="page__cta">Still curious? <a class="link" href="/pages/contact.html">Contact us</a></p>
    </section>`;
}
