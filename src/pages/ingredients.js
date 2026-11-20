import { gummyBenefits, chocolateBenefits } from '../data/content.js';
import { picture } from '../data/assets.js';
import { benefitBoxes } from '../sections/benefit-boxes.js';
import { reviewFlag } from '../components/review-flag.js';
import { pageHeader } from './_shared.js';

// Copy source: advictorem.github.io/mushi-wireframes/ingredients.html.
const REFERENCES = [
  'Prochazkova L, Lippelt DP, Colzato LS, Kuchar M, Sjoerds Z, Hommel B. Exploring the effect of microdosing psychedelics on creativity in an open-label natural setting. Psychopharmacology. 2018;235(12):3401–3413.',
  'Cavanna F, Muller S, de la Fuente LA, Zamberlan F, Palmucci M, Janeckova L, Kuchar M, Pallavicini C, Tagliazucchi E. Microdosing with psilocybin mushrooms: a double-blind placebo-controlled study. Translational Psychiatry. 2022;12:307.',
];

export function render(main) {
  const flag = reviewFlag('Regulated-product and health language — needs legal review before launch');
  main.innerHTML = `
    ${pageHeader('Cleanly made. Thoughtfully formulated.', '', 'Ingredients')}

    <section class="ing-intro">
      <div class="ing-intro__art">${picture('bundle-group', { alt: 'Six MUSHI products together: three gummy pouches and three chocolate boxes', sizes: '(min-width: 1200px) 1000px, 92vw', eager: true })}</div>
      <div class="ing-intro__text">
        <p>Every Mushi formula is made in a clean, controlled U.S.-based lab using thoughtfully sourced ingredients and no synthetic ingredients.</p>
        <p>No overseas manufacturing. No unnecessary shortcuts. Just intentionally developed formulas, transparent ingredients and flavors that make the experience something you actually look forward to.</p>
      </div>
      <h2 class="sr-only">What goes into Mushi</h2>
      ${benefitBoxes([...gummyBenefits, ...chocolateBenefits])}
    </section>

    <section class="page__section page__split ing-split" aria-labelledby="ing-blend">
      <div class="page__media">${picture('ingredients-mushroom-blend', { alt: 'Mushrooms growing on a mossy log in soft forest light', sizes: '(min-width: 900px) 44vw, 92vw' })}</div>
      <div class="prose">
        <h2 id="ing-blend">Organic mushroom blend ${flag}</h2>
        <p>Our blend is built around the qualities people actually look for in a modern feel⁠-⁠good ritual. On one end, the things that sharpen a day — focus, memory, mental clarity and the kind of cognitive performance that holds up past the first hour. Underneath it, the quieter work: immune support and antioxidant support.</p>
        <p>Then there’s how the day actually feels. Natural energy and stamina that build steadily instead of spiking, with enough balance and relaxation left over for the evening.</p>
        <p>Rather than relying on a single ingredient or a single effect, we bring complementary mushrooms together into one intentionally developed formula.</p>
      </div>
    </section>

    <section class="page__section page__split ing-split ing-split--flip" aria-labelledby="ing-research">
      <div class="page__media">${picture('ingredients-lab', { alt: 'Lab technician in a hair net and safety glasses checking a clipboard on a production line', sizes: '(min-width: 900px) 44vw, 92vw' })}</div>
      <div class="prose">
        <h2 id="ing-research">Science is still exploring ${flag}</h2>
        <p>Research into microdosing is evolving quickly. Early observational and open-label studies have reported potential changes in mood, perception, creativity and cognition, while more rigorous placebo-controlled research has produced more mixed results.</p>
        <p>That distinction matters. We believe feeling good and being informed should go together, which is why Mushi encourages curiosity without pretending the science is finished.</p>
        <div class="references">
          <h3>Research references</h3>
          <ol>${REFERENCES.map((r) => `<li>${r}</li>`).join('')}</ol>
        </div>
      </div>
    </section>

    <section class="page__section prose prose--small" aria-labelledby="ing-safety">
      <h2 id="ing-safety">Safety information</h2>
      <p>Never attempt to operate heavy machinery or a moving vehicle while using this product. Do not use this product if you are pregnant or nursing. This product may cause drowsiness. Keep out of reach of children.</p>
      <p>Statements regarding dietary supplements have not been evaluated by the Food and Drug Administration and are not intended to diagnose, treat, cure or prevent any disease or health condition.</p>
    </section>`;
}
