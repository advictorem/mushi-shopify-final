import { benefits, faqs, comparison, testimonials, ugc, heroMarquee } from '../data/content.js';
import { icon, picture } from '../data/assets.js';
import { getProduct } from '../adapters/commerce.js';
import { siteConfig } from '../data/site.config.js';
import { qs, esc, icons } from '../utils/dom.js';
import { reviewFlag } from '../components/review-flag.js';

const fill = (sel, html) => {
  const n = qs(sel);
  if (n) n.innerHTML = html;
  return n;
};

export function renderHeroMarquee() {
  fill('[data-hero-marquee]', heroMarquee.map((t, i) => `<span class="type-strip__item${i % 2 ? ' is-solid' : ''}">${t}</span>`).join(''));
}

export function renderBenefits() {
  fill('[data-benefits]', benefits.map((b) => {
    const a = icon(b.icon);
    return `<li><img src="${a.file}" alt="${esc(b.label)}" width="${a.width}" height="${a.height}" loading="lazy" decoding="async">${reviewFlag(b.review)}</li>`;
  }).join(''));
}

export const faqMarkup = (items) => items.map((f) => `
  <details class="accordion__item">
    <summary><span>${esc(f.q)}</span>${icons.plus}</summary>
    <div class="accordion__body"><div class="accordion__inner">
      ${f.a.length ? f.a.map((p) => `<p>${esc(p)}</p>`).join('') : '<p class="accordion__pending">This answer is waiting on approved copy.</p>'}
      ${f.link ? `<p><a class="link" href="${f.link.href}"${f.link.external ? ' target="_blank" rel="noopener"' : ''}>${f.link.label}</a></p>` : ''}
      ${reviewFlag(f.review)}
    </div></div>
  </details>`).join('');

export function renderFaq() {
  fill('[data-faq]', faqMarkup(faqs));
}

export function renderComparison() {
  fill('[data-comparison]', `
    <caption class="sr-only">How Mushi compares with typical alternatives</caption>
    <thead>
      <tr>
        <th scope="col"><span class="sr-only">Feature</span></th>
        <th scope="col">${picture('compare-mushi', { alt: 'Mushi', sizes: '212px' })}</th>
        <th scope="col">${picture('compare-alternatives', { alt: 'Typical alternatives', sizes: '218px' })}</th>
      </tr>
    </thead>
    <tbody>
      ${comparison.rows.map((r) => {
        const a = icon(r.icon);
        return `<tr>
          <th scope="row"><img src="${a.file}" alt="" width="${a.width}" height="${a.height}" loading="lazy">${esc(r.label)}</th>
          <td>${icons.check}<span>${esc(r.mushi)}</span></td>
          <td>${icons.cross}<span>${esc(r.other)}</span></td>
        </tr>`;
      }).join('')}
    </tbody>`);
  fill('[data-comparison-flag]', reviewFlag(comparison.review));
}

export function renderTestimonials() {
  fill('[data-testimonials]', testimonials.items.map((t, i) => {
    const p = getProduct(t.product);
    return `
      <figure class="quote quote--${t.tone}${i % 2 ? ' quote--drop' : ''}">
        <div class="quote__top"><span class="quote__mark" aria-hidden="true">“</span><span class="quote__stars" role="img" aria-label="${t.rating} out of 5 stars">${icons.star.repeat(t.rating)}</span></div>
        <blockquote>“${esc(t.quote)}”</blockquote>
        <figcaption>
          <span class="quote__thumb">${picture(p.images.primary, { alt: '', sizes: '44px' })}</span>
          <span><strong>${esc(p.title)}</strong><small>${esc(t.name)}</small></span>
        </figcaption>
      </figure>`;
  }).join(''));
  fill('[data-testimonials-flag]', reviewFlag(testimonials.review));
}

export function renderUgc() {
  const tilts = [-4, 3, 6, -5, 4];
  fill('[data-ugc]', ugc.items.map((u, i) => `
    <a class="polaroid" href="${u.permalink}" target="_blank" rel="noopener" style="--tilt:${tilts[i % tilts.length]}deg" aria-label="Open ${siteConfig.social.instagramHandle} on Instagram">
      <img src="${u.image}" alt="${esc(u.alt)}" width="220" height="250" loading="lazy" decoding="async">
      <span class="polaroid__handle">${icons.instagram}${esc(u.handle)}</span>
      <span class="polaroid__caption">${esc(u.caption)}</span>
    </a>`).join(''));
  fill('[data-ugc-flag]', reviewFlag(ugc.review));
}

export function renderAssetFlags() {
  fill('[data-bundle-flag]', reviewFlag('“Save up to 50%” — offer terms not verified on the live site'));
  fill('[data-wholesale-flag]', reviewFlag('Placeholder cropped from the comp — final photo not in Mushi Exports'));
  fill('[data-coaching-flag]', reviewFlag('Still from the comp — original coaching video file needed'));
}
