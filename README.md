# MUSHI — Shopify Final Design Version

Phase 1: the complete storefront **frontend** in semantic HTML, modern CSS and vanilla ES modules.
No Shopify, no backend, no checkout. Everything commerce-related runs on local data behind an adapter so Shopify can be plugged in later without rebuilding the UI.

## Commands

```bash
npm install
npm run dev       # local dev server (Vite)
npm run build     # production build to /dist
npm run preview   # serve the production build
npm run assets    # regenerate optimized images/video from design-source/exports (needs Python 3 + Pillow, ffmpeg)
```

## Deploying to Vercel

Import the GitHub repo in Vercel. It detects Vite automatically (build `npm run build`, output `dist`). `vercel.json` only turns on clean URLs. Every push to `main` deploys; other branches get preview URLs.

## Architecture

```
index.html                 Homepage (static, semantic markup; data-driven parts are filled by JS)
pages/*.html               Thin shells: <body data-page="name">
design-source/exports/     ORIGINAL exports from Mushi Exports.zip — never edited
design-source/reference/   Annotated PDF, clean design raster, age-gate screenshot
public/assets/             Optimized derivatives (AVIF + WebP, video, icons) — generated
scripts/optimize_assets.py Asset pipeline (originals → public/assets + manifest)
src/
  main.js                  Homepage entry
  page.js                  Entry for every secondary page (loads src/pages/<name>.js)
  app.js                   Shared shell: header, footer, cart, search, modals, age gate, popup, motion
  styles/                  tokens.css · base.css · components.css · sections.css · pages.css
  components/              Reusable UI (see below)
  sections/                Homepage sections
  pages/                   One render module per secondary page
  data/                    products.json · content.js · navigation.js · site.config.js · assets.js
  adapters/                commerce.js · forms.js  ← the only places a backend will be wired in
  utils/                   dom.js · motion.js
docs/QA.md                 What was tested, what is outstanding
```

Separation the Shopify phase relies on: **markup** (HTML + component templates) · **style** (`src/styles`) · **behaviour** (`components`, `sections`) · **product data** (`src/data/products.json`) · **commerce logic** (`src/adapters/commerce.js`).

## Components

| Group | Module | Notes |
|---|---|---|
| Global | `header.js` | Announcement marquee, dropdown nav (hover, click, keyboard), mobile menu drawer, cart count |
| | `footer.js` | Footer nav from `navigation.js`, newsletter form, oversized wordmark |
| | `modal.js` | One accessible dialog (focus trap, Esc, scroll lock, focus return) behind every overlay |
| | `search-overlay.js` | Local search over product data |
| | `cart-drawer.js` | Drawer + shared cart markup used by `/pages/cart` |
| Commerce | `product-card.js` | Card, price, quantity stepper, add to cart. One delegated listener for all of them |
| | `carousel.js` | Scroll-snap carousel with dots/arrows that hide when everything fits |
| Editorial | `marquee.js` | Seamless loop, either direction, pauses on hover, static under reduced motion |
| | `accordion.js` | Animated `<details>` (works without JS) |
| | `utils/motion.js` | `[data-reveal]` scroll reveals, `[data-parallax]` transform-only parallax |
| Promotional | `age-gate.js` | Blocking gate, remembered for a configurable number of days |
| | `offer-popup.js` | Popup A and B, config-switched |
| | `inquiry-forms.js` | Coaching and wholesale modals, account placeholder, shared validation |
| Staging | `review-flag.js` | Magenta “Needs review” markers on unverified copy/assets |

## Design tokens

All in `src/styles/tokens.css`: colours (sampled from the comp), gradients, type scale (fluid `clamp()`), spacing, container widths, radii, shadows, durations, easings, z-index layers. Fonts are self-hosted via `@fontsource` (Oswald variable, Permanent Marker, PT Mono) — no third-party font requests.

`--display-stretch: 1.15` — the oversized labels in the comp are about 15% taller than stock Oswald Bold at the same width, so labels and the hero title are scaled vertically to match.

## Assets

`design-source/exports` holds the originals exactly as supplied. `npm run assets` writes AVIF + WebP at two widths (never upscaled, transparency preserved), transcodes the hero video from HEVC to H.264 (1080p + 540p) and extracts poster frames. It also writes `src/data/assets.generated.json`: original filename → optimized files, usage, dimensions, aspect ratio.

`src/data/assets.js` adds:

- `picture(key, …)` — `<picture>` markup with AVIF/WebP `srcset`
- `missingAssets` — what the design needs that was not in the ZIP, and what stands in for it
- `assetNotes` — unresolved export-to-design matches (e.g. `MCT.png` is the *Made in USA* icon)

Stand-ins live in `public/assets/placeholder/` and are cropped from the design raster. To replace one: drop the real file into `design-source/exports`, move its entry from `PLACEHOLDERS` to `RASTER` in the script, re-run, update the `src`.

## Product data

`src/data/products.json` is a **verified snapshot** of https://mushiworld.com/collections/all, not a live sync.

- Prices are integer cents (`5500`), formatted with `money()` at display time.
- Every price on screen — cards, collection, product page, search, cart lines, subtotal, bundle builder — reads from this one file. No price is written in HTML.
- Each product records `liveUrl`, `sourceUrl` and `verifiedAt`; `_meta.notes` lists discrepancies with the comp.
- To update: edit the JSON, bump `verifiedAt`. To add a product: add an object; it appears in its category, search and the shop page automatically.

## Popup configuration

`src/data/site.config.js`:

```js
offerPopup: { active: 'disabled' | 'a' | 'b', delayMs: 6000, rememberDays: 14 }
```

Default is `disabled`. The timer starts when the age gate is passed, so a popup can never sit over the gate, and a dismissal is remembered. Preview without editing config: `/?offer=a` or `/?offer=b`.

Also here: age-gate settings, the announcement text, social links, and `showReviewFlags` (turn off to hide the magenta markers).

## Adding a page

1. Copy any file in `pages/` to `pages/<name>.html`, set `data-page="<name>"` and the `<title>`.
2. Create `src/pages/<name>.js` exporting `render(main)`. Use `pageHeader()` from `_shared.js` and existing components.
3. Add it to `src/data/navigation.js` if it belongs in the nav or footer.

Header, footer, cart, search, modals and tokens come with the shell; Vite picks the new HTML file up automatically.

## Future Shopify integration

Not committed to either route yet. Both keep the UI and replace only the adapters.

| Concern | Now | Liquid theme (Online Store 2.0) | Headless (Storefront API) |
|---|---|---|---|
| Products, collections, pricing, inventory | `products.json` via `getProducts/getProduct` | Liquid objects render the same card/section markup; `product-card.js` template becomes a snippet | `products`/`collection` queries mapped to the same object shape |
| Cart | `localStorage` via `addToCart/updateQuantity/removeFromCart/getCart/onCartChange` | `/cart/add.js`, `/cart/change.js`, `/cart.js` | `cartCreate`, `cartLinesAdd/Update/Remove` |
| Checkout | `beginCheckout()` returns `not-connected` | redirect to `/checkout` | redirect to `cart.checkoutUrl` |
| Search | `searchProducts()` local | `/search/suggest.json` | `predictiveSearch` |
| Accounts | Placeholder modal/page, no credentials collected | Shopify customer accounts | Customer Account API |
| Subscriptions | Not present | Selling-plan app (selling plans on the product form) | `sellingPlanAllocations` |
| Forms | `submitForm()` resolves `{ delivered: false }` | Shopify contact/customer forms or Klaviyo | Same services via their APIs |

Sections map one-to-one to theme sections; `content.js` and `site.config.js` become section settings/metafields.

## Known limitations

- Figma could not be read in this session (canvas does not render to the automation layer), so layout was matched against the annotated PDF and its embedded raster. Spacing and sizes are within a few pixels of the comp at 1440px but were not taken from Figma dev values.
- Popup A and B are built to the brief’s behaviour with provisional layout and copy.
- Eight assets are stand-ins (see `missingAssets`).
- Several pieces of copy are flagged for compliance review (FAQ dosage/usage answers, comparison table, benefit icons, testimonials, bundle discount).
- The age gate is a frontend courtesy gate, not legal age verification.
- No real-device testing yet (Safari, Firefox, iOS, Android) — see `docs/QA.md`.
