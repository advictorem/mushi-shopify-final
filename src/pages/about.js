import { beachMarkup } from '../sections/beach.js';

// The manifesto markup lives in pages/about.html. This only adds the shared
// beach; scroll-fill, parallax and rise are started by initSite() (src/app.js).
export function render(main) {
  main.insertAdjacentHTML('beforeend', beachMarkup({ deep: true }));
}
