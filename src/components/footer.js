import { footerNav, legalNav } from '../data/navigation.js';
import { siteConfig } from '../data/site.config.js';
import { qs, icons } from '../utils/dom.js';
import { logoMarkup } from './header.js';
import { reviewFlag } from './review-flag.js';
import { bindPreviewForm } from './inquiry-forms.js';
import logoSvg from '../assets/svg/logo.svg?raw';

// The exported logo includes the "Infused Delights" line; cropping the viewBox
// leaves just the wordmark for the oversized footer artwork.
const wordmark = logoSvg
  .replace('<svg ', '<svg class="footer__wordmark" aria-hidden="true" focusable="false" preserveAspectRatio="xMidYMin slice" ')
  .replace(/ (width|height)="[^"]*"/g, '')
  .replace(/viewBox="[^"]*"/, 'viewBox="0 0 158 38"');

// Text placeholders. On Shopify the official card icons are rendered from the
// store's enabled payment methods ({{ type | payment_type_svg_tag }}).
const PAYMENT_METHODS = ['Visa', 'Mastercard', 'Amex', 'PayPal', 'Diners', 'Discover'];

export function mountFooter() {
  const host = qs('#site-footer');
  if (!host) return;
  const s = siteConfig.social;
  host.innerHTML = `
    <footer class="footer">
      <div class="footer__inner">
        <div class="footer__brand">
          <a href="/" aria-label="MUSHI home">${logoMarkup('logo--light')}</a>
          <ul class="footer__pay" aria-label="Payment methods">${PAYMENT_METHODS.map((m) => `<li>${m}</li>`).join('')}</ul>
        </div>
        <nav class="footer__nav" aria-label="Footer">
          ${footerNav.map((g) => `
            <section class="footer__col">
              <h2>${g.label}</h2>
              <ul>${g.items.map((it) => `<li><a href="${it.href}"${it.external && !it.plain ? ' target="_blank" rel="noopener"' : ''}${it.plain ? ' class="footer__plain"' : ''}>${it.label}</a>${it.pending ? reviewFlag('No dedicated page found on the live site') : ''}</li>`).join('')}</ul>
            </section>`).join('')}
          <section class="footer__col">
            <h2>Follow</h2>
            <ul class="footer__social">
              <li><a href="${s.instagram}" target="_blank" rel="noopener" aria-label="Instagram ${s.instagramHandle}">${icons.instagram}<span>${s.instagramHandle}</span></a></li>
              <li><a href="${s.tiktok}" target="_blank" rel="noopener" aria-label="TikTok">${icons.tiktok}<span>TikTok</span></a></li>
            </ul>
          </section>
          <section class="footer__col footer__signup">
            <h2>Get 10% off your first order</h2>
            <form class="footer__form" data-preview-form="newsletter" novalidate>
              <div class="pill-field">
                <label class="sr-only" for="footer-email">Email address</label>
                <input id="footer-email" name="email" type="email" autocomplete="email" placeholder="Enter your email address" required>
                <button class="btn btn--dark" type="submit">Subscribe</button>
              </div>
              <p class="form__status" role="status"></p>
            </form>
          </section>
        </nav>
      </div>
      <div class="footer__bottom">
        <p class="footer__copy">© ${new Date().getFullYear()} MUSHI. Staging preview — checkout, accounts and forms are not connected.</p>
        <ul class="footer__legal">${legalNav.map((it) => `<li><a href="${it.href}">${it.label}</a></li>`).join('')}</ul>
      </div>
      ${wordmark}
    </footer>`;
  bindPreviewForm(qs('.footer__form', host), { success: 'You’re on the list.' });
}
