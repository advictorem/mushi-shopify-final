import md from '../data/policies/data-sharing-opt-out.md?raw';
import { PREVIEW_NOTE } from '../adapters/forms.js';
import { renderPolicy } from './_policy.js';

// On Shopify this control is the platform's own opt-out widget. Here it is a preview.
const optOut = `
  <form class="policy__optout" data-preview-form="opt-out" data-success="Your choice is ready to save." novalidate>
    <p class="page__preview">${PREVIEW_NOTE.replace('this form is not connected yet, so nothing was sent', 'the opt-out control is supplied by Shopify at integration; nothing is saved here')}</p>
    <div class="field">
      <label for="optout-email">Don’t share data from my account (optional)</label>
      <input id="optout-email" name="email" type="email" autocomplete="email" placeholder="Email address">
    </div>
    <button class="btn btn--dark" type="submit">Opt out</button>
    <p class="form__status" role="status"></p>
  </form>`;

export const render = (main) => renderPolicy(main, { title: 'Your privacy choices', label: 'Privacy', md, extra: optOut });
