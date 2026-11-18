import { coachingFormMarkup } from '../components/inquiry-forms.js';
import { coachingVideoMarkup } from '../sections/coaching-video.js';
import { pageHeader } from './_shared.js';

export function render(main) {
  main.innerHTML = `
    ${pageHeader('Your journey. Your pace.', '1-on-1 Expert Coaching', 'Coaching')}
    <section class="page__section page__split page__split--top">
      <div class="page__video">${coachingVideoMarkup()}</div>
      <div class="prose">
        <p>Curious about microdosing but not sure where to start? Our MUSHI coaches are here to make exploring something new feel simple and approachable. Get personalized guidance, ask questions, and discover what works best for you all in a relaxed, judgment-free conversation.</p>
        ${coachingFormMarkup()}
      </div>
    </section>`;
}
