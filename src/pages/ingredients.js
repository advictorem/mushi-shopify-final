import { getProducts } from '../adapters/commerce.js';
import { icon } from '../data/assets.js';
import { productCard } from '../components/product-card.js';
import { reviewFlag } from '../components/review-flag.js';
import { pageHeader } from './_shared.js';

// Copy source: advictorem.github.io/mushi-wireframes/ingredients.html.
// The dosage scale on that page is intentionally left out pending review.
const INGREDIENTS = [
  { icon: 'ingredient-plant', name: 'Organic tapioca syrup', text: 'A plant-based foundation that gives our gummies their soft, satisfying texture and clean sweetness.' },
  { icon: 'ingredient-cane', name: 'Organic cane sugar', text: 'Straightforward sweetness from organic cane sugar, selected to complement flavor without overcomplicating the formula.' },
  { icon: 'ingredient-berry', name: 'Elderberry', text: 'A recognizable botanical ingredient that brings natural depth of color and a subtly fruit-forward character.' },
  { icon: null, name: 'Belgian chocolate', text: 'Rich, smooth and deeply satisfying. Selected to make the experience feel like an indulgence first—not something you have to convince yourself to enjoy.' },
];

const REFERENCES = [
  'Prochazkova L, Lippelt DP, Colzato LS, Kuchar M, Sjoerds Z, Hommel B. Exploring the effect of microdosing psychedelics on creativity in an open-label natural setting. Psychopharmacology. 2018;235(12):3401–3413.',
  'Cavanna F, Muller S, de la Fuente LA, Zamberlan F, Palmucci M, Janeckova L, Kuchar M, Pallavicini C, Tagliazucchi E. Microdosing with psilocybin mushrooms: a double-blind placebo-controlled study. Translational Psychiatry. 2022;12:307.',
];

export function render(main) {
  const flag = reviewFlag('Regulated-product and health language — needs legal review before launch');
  main.innerHTML = `
    ${pageHeader('Ingredients made with intention', 'Thoughtfully chosen ingredients. Indulgent flavors. Formulas designed around how you want to feel.', 'Ingredients')}

    <section class="page__section" aria-labelledby="ing-list">
      <h2 class="sr-only" id="ing-list">Ingredients</h2>
      <dl class="ingredients">
        ${INGREDIENTS.map((i) => { const a = i.icon && icon(i.icon); return `
          <div class="ingredients__item">
            <dt>${a ? `<img src="${a.file}" alt="" width="${a.width}" height="${a.height}" loading="lazy">` : '<span class="ingredients__dot" aria-hidden="true"></span>'}${i.name}</dt>
            <dd>${i.text}</dd>
          </div>`; }).join('')}
      </dl>
    </section>

    <section class="page__section prose" aria-labelledby="ing-blend">
      <h2 id="ing-blend">Organic mushroom blend ${flag}</h2>
      <p>Our blend is built around the qualities people actually look for in a modern feel-good ritual. On one end, the things that sharpen a day — focus, memory, mental clarity and the kind of cognitive performance that holds up past the first hour. Underneath it, the quieter work: immune support and antioxidant support.</p>
      <p>Then there’s how the day actually feels. Natural energy and stamina that build steadily instead of spiking, with enough balance and relaxation left over for the evening.</p>
      <p>Rather than relying on a single ingredient or a single effect, we bring complementary mushrooms together into one intentionally developed formula.</p>
    </section>

    <section class="page__section prose" aria-labelledby="ing-research">
      <h2 id="ing-research">Science is still exploring ${flag}</h2>
      <p>Research into microdosing is evolving quickly. Early observational and open-label studies have reported potential changes in mood, perception, creativity and cognition, while more rigorous placebo-controlled research has produced more mixed results.</p>
      <p>That distinction matters. We believe feeling good and being informed should go together, which is why Mushi encourages curiosity without pretending the science is finished.</p>
      <h3>Research references</h3>
      <ol class="references">${REFERENCES.map((r) => `<li>${r}</li>`).join('')}</ol>
    </section>

    <section class="page__section prose" aria-labelledby="ing-made">
      <h2 id="ing-made">Cleanly made. Thoughtfully formulated.</h2>
      <p>Every Mushi formula is made in a clean, controlled U.S.-based lab using thoughtfully sourced ingredients and no synthetic ingredients.</p>
      <p>No overseas manufacturing. No unnecessary shortcuts. Just intentionally developed formulas, transparent ingredients and flavors that make the experience something you actually look forward to.</p>
    </section>

    <section class="page__section page__section--wide" aria-labelledby="ing-products">
      <h2 class="section-title" id="ing-products">Our products</h2>
      <div class="grid-products">${getProducts().filter((p) => p.category !== 'merch').map(productCard).join('')}</div>
    </section>

    <section class="page__section prose prose--small" aria-labelledby="ing-safety">
      <h2 id="ing-safety">Safety information</h2>
      <p>Never attempt to operate heavy machinery or a moving vehicle while using this product. Do not use this product if you are pregnant or nursing. This product may cause drowsiness. Keep out of reach of children.</p>
      <p>Statements regarding dietary supplements have not been evaluated by the Food and Drug Administration and are not intended to diagnose, treat, cure or prevent any disease or health condition.</p>
    </section>`;
}
