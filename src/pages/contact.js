import { siteConfig } from '../data/site.config.js';
import { picture } from '../data/assets.js';
import { pageHeader, previewBanner } from './_shared.js';
import { PREVIEW_NOTE } from '../adapters/forms.js';

export function render(main) {
  main.innerHTML = `
    ${pageHeader('Contact us', 'Questions about an order, a product or wholesale? Send us a note.', 'Contact')}
    <section class="page__section page__narrow">
      ${previewBanner(PREVIEW_NOTE.replace('nothing was sent', 'nothing will be sent'))}
      <form data-preview-form="contact" data-success="Your message is ready to send." novalidate>
        <div class="field"><label for="contact-name">Name</label><input id="contact-name" name="name" type="text" autocomplete="name"></div>
        <div class="field"><label for="contact-email">Email <span aria-hidden="true">*</span></label><input id="contact-email" name="email" type="email" autocomplete="email" required></div>
        <div class="field"><label for="contact-phone">Phone number</label><input id="contact-phone" name="phone" type="tel" autocomplete="tel"></div>
        <div class="field"><label for="contact-message">Message <span aria-hidden="true">*</span></label><textarea id="contact-message" name="message" rows="5" required data-label="message"></textarea></div>
        <button class="btn btn--dark" type="submit">Send message</button>
        <p class="form__status" role="status"></p>
      </form>
      <p class="page__cta">Or email us at <a class="link" href="mailto:${siteConfig.contactEmail}">${siteConfig.contactEmail}</a>.</p>
    </section>
    <div class="page-beach" aria-hidden="true">${picture('contact-beach', { alt: '', sizes: '100vw' })}</div>`;
  main.classList.add('page--flush');
}
