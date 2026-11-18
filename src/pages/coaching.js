import { pageHeader } from './_shared.js';

export function render(main) {
  main.innerHTML = `
    ${pageHeader('Your journey. Your pace. We’re here to help.', '', 'Coaching')}
    <section class="page__section prose prose--center">
      <p>Curious about microdosing but not sure where to start? Our MUSHI coaches are here to make exploring something new feel simple and approachable. Get personalized guidance, ask questions, and discover what works best for you all in a relaxed, judgment-free conversation.</p>
      <p><button class="btn btn--dark" type="button" data-open-modal="coaching">Book a free consult</button></p>
    </section>`;
}
