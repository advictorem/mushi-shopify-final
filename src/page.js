// Entry for every secondary page. Each /pages/*.html is a thin shell with
// <body data-page="name">; the matching module in src/pages renders <main>.
// To add a page: copy a shell, set data-page, add src/pages/<name>.js.
import { initSite } from './app.js';

const modules = import.meta.glob('./pages/*.js');
const name = document.body.dataset.page;
const load = modules[`./pages/${name}.js`];
const main = document.getElementById('main');

const notFound = () => {
  main.innerHTML = '<section class="page__section"><h1 class="page__title">Page not found</h1><p><a class="link" href="/">Back to the homepage</a></p></section>';
};

(load ? load().then((mod) => mod.render(main)) : Promise.resolve(notFound()))
  .catch((err) => {
    console.error(err);
    notFound();
  })
  .finally(initSite);
