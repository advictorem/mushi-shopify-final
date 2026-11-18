import { pageHeader, previewBanner } from './_shared.js';

export function render(main) {
  main.innerHTML = `
    ${pageHeader('Account', '', 'Account')}
    <section class="page__section page__narrow prose">
      ${previewBanner('Accounts are not connected in this preview. No sign-in details are collected.')}
      <p>When the Shopify integration begins, this page becomes the entry point to Shopify customer accounts:</p>
      <ul>
        <li>Sign in and create an account</li>
        <li>Order history and tracking</li>
        <li>Saved addresses</li>
        <li>Subscription management, if subscriptions are offered</li>
      </ul>
      <p><a class="btn btn--dark" href="/pages/shop.html">Keep shopping</a></p>
    </section>`;
}
