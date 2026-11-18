import { esc, icons } from '../utils/dom.js';
import { pageHeader } from './_shared.js';

const inline = (t) =>
  esc(t)
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\[(.+?)\]\((.+?)\)/g, '<a class="link" href="$2">$1</a>');

/** Tiny reader for src/data/policies/*.md: "## " section, "### " subheading, "- " list, blank line = paragraph break. */
function parse(md) {
  const doc = { intro: [], sections: [] };
  let target = doc.intro;
  let list = null;
  md.split('\n').forEach((raw) => {
    const line = raw.trim();
    if (!line.startsWith('- ')) list = null;
    if (!line) return;
    if (line.startsWith('## ')) {
      const s = { heading: line.slice(3), blocks: [] };
      doc.sections.push(s);
      target = s.blocks;
    } else if (line.startsWith('### ')) target.push(`<h3>${inline(line.slice(4))}</h3>`);
    else if (line.startsWith('- ')) {
      if (!list) {
        list = [];
        target.push(list);
      }
      list.push(line.slice(2));
    } else target.push(`<p>${inline(line)}</p>`);
  });
  const html = (blocks) => blocks.map((b) => (Array.isArray(b) ? `<ul>${b.map((i) => `<li>${inline(i)}</li>`).join('')}</ul>` : b)).join('');
  return { intro: html(doc.intro), sections: doc.sections.map((s) => ({ heading: s.heading, html: html(s.blocks) })) };
}

/**
 * Policy / legal page in the FAQ template: page header, intro, then one
 * accordion item per section. Copy lives in src/data/policies/<name>.md.
 */
export function renderPolicy(main, { title, label, md, extra = '' }) {
  const doc = parse(md);
  main.innerHTML = `
    ${pageHeader(title, '', label)}
    <section class="page__section policy">
      ${doc.intro ? `<div class="prose policy__intro">${doc.intro}</div>` : ''}
      ${doc.sections.length ? `
        <p class="policy__tools"><button class="link" type="button" data-expand-all aria-pressed="false">Open all sections</button></p>
        <div class="accordion accordion--compact" data-accordion>
          ${doc.sections.map((s) => `
            <details class="accordion__item">
              <summary><span>${inline(s.heading)}</span>${icons.plus}</summary>
              <div class="accordion__body"><div class="accordion__inner prose">${s.html}</div></div>
            </details>`).join('')}
        </div>` : ''}
      ${extra}
    </section>`;
  const toggle = main.querySelector('[data-expand-all]');
  toggle?.addEventListener('click', () => {
    const open = toggle.getAttribute('aria-pressed') !== 'true';
    main.querySelectorAll('.policy details').forEach((d) => (d.open = open));
    toggle.setAttribute('aria-pressed', String(open));
    toggle.textContent = open ? 'Close all sections' : 'Open all sections';
  });
}
