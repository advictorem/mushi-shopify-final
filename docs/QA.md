# QA summary — 2026-11-18

Tested on the production build (`vite build` + `vite preview`) in headless Chrome via Playwright.

## Passed (automated, 51 checks)

**Age gate** — shown on first entry, page scroll locked, focus lands on YES, Escape does not dismiss, NO shows an exit link, YES closes it and is remembered on reload.

**Hero** — video does not load behind the gate; after YES it plays muted, inline, no controls, no loop; reaches `ended` once and is not restarted by scrolling. Under `prefers-reduced-motion` it never loads and the end frame is shown.

**Marquees** — announcement and type strip loop; testimonials move left to right; all static under reduced motion.

**Category showcase** — next/previous, ←/→ keys, wraps, background cross-fade, label behind the PNG.

**Lifestyle accordion** — panel widens on hover/focus/click (218px → 567px at 1440).

**Product cards** — hover image cross-fades; quantity stepper; add to cart.

**Mock cart** — 3 × Cherry = $165.00; count badge; quantity change → $110.00; second product; remove; empty state; Escape closes; checkout states it is not connected.

**FAQ** — opens, single-open closes the previous item.

**Search** — “berry” returns Midnight Berry; empty state message.

**Navigation** — dropdown opens from keyboard, `aria-expanded` updates, Escape closes.

**Forms** — coaching modal: four required-field errors, invalid email rejected, success state labelled as a preview. Newsletter and wholesale the same.

**Offer popups** — off by default; with `?offer=a` not shown at 3s, shown after 6s; B renders; dismissal stored.

**Pages** — all 11 secondary routes render (shop, category filter, product, product without image, cart, ingredients, about, coaching, faqs, contact, wholesale, bundles, account). Bundle builder totals at list price.

**Console** — no errors or warnings on any route.

## Visual comparison

Full-page screenshots at 1440px were compared section by section with the PDF raster (announcement, header, hero, type strip, category showcase, lifestyle, gummies, chocolates, story, benefits, bundle, wholesale, FAQ, comparison, testimonials, UGC, coaching, newsletter, footer) and the age gate with the supplied screenshot. Display type was calibrated by measurement so each oversized label spans the same width as in the comp.

Mobile was reviewed at 375px: comparison table hidden, lifestyle becomes swipe cards, product carousels show one card plus a peek, testimonials become swipeable, footer stacks.

## Product data

All nine products match `mushiworld.com/products.json` on 2026-11-18: titles, prices ($55 ×6, $40, $30, $27), no compare-at prices, single default variant each, descriptions from the product records.

## Outstanding

Not tested:
- Safari, Firefox, iOS Safari, Android Chrome (only Chromium was available)
- 430, 768, 1024 and 1920 widths were not individually screenshotted
- Screen-reader pass (VoiceOver/NVDA); colour-contrast audit of the pale testimonial stars (decorative; rating is in the accessible name)
- Lighthouse / Core Web Vitals on the deployed URL

Needs from the client:
- Figma dev values or frame exports for Popup A, Popup B and the Chocolates/Merch category slides
- Wholesale photo, five UGC photos, age-gate image, coaching video file, merch product images
- Approved answer for “Can I subscribe?” and confirmation of shipping eligibility
- Confirmation that the testimonials are real customer reviews
- Bundle discount terms behind “Save up to 50%”
- Support email (live site and wireframes disagree) and a returns/refunds destination
- Compliance review of flagged copy. Note the live product pages say “functional mushrooms” while the draft FAQ says the blend is not functional mushrooms; one of them needs correcting before launch

## Round 2 — client markup (homepage.pdf), 2026-11-18

Applied and re-checked at 1440px and 1720px, 54 automated checks passing, console clean:

- Hero video scaled from the left so the subject's nose sits under the logo
- Category showcase centred at wide viewports; Chocolates ("CHOCO") and Merch slides use the Gummies background and label colour
- Lifestyle tiles taller and no longer buttons (hover still widens them)
- "GUMMIES" background word raised; gummies-to-chocolates blend lengthened
- New `VEGAN.png` and `wholesale-bulk-packaging-mix.png` exports in place (wholesale placeholder removed)
- Bundle footnote enlarged
- "WHY MUSHI?" centred on the page, colour `#C1E5CA`; "elderberry juice" on its own line
- UGC heading and button centred
- Coaching: heading shortened; image replaced with the Instagram embed, cropped to the media
- Coaching form: Desired outcomes optional with a custom chevron; confirmation shows the Mushi logo and the approved message
- Newsletter and footer sign-ups share one pill field (input and button inside the pill)
- Footer: Bundles link removed, legal links moved beside the copyright, sign-up heading enlarged
- Sticky header is frosted glass (22px blur, 22% white)

Not verified: the Instagram embed itself (Instagram is blocked from the test environment; checked manually that the embed serves a 54px header and 4:5 media). Instagram's embed shows a poster with a play button and plays on Instagram's terms, not as an inline autoplay loop.

## Round 3 — 2026-11-18

57 automated checks passing, console clean. Re-checked at 1720px.

- Category showcase: the label lands first, the product PNG follows 0.38s later with more travel
- Gap between the Gummies and Chocolates sections closed; the blend now starts behind the gummy cards
- Story headline reads "Intention in every bite"
- Bundle footnote review tag removed; "Build your bundle" links to the Shop All page
- Wholesale modal matches the coaching modal; Business name optional
- "WHY MUSHI?" sits behind the product PNGs. `alternatives.png` was exported at 50% opacity, so the word showed through it; the pipeline now flattens it onto the page colour
- Coaching: native 9:16 video (720x1280), autoplays muted in view, pauses out of view, play/pause and sound buttons. Verified: frame ratio 0.5625, autoplay, pause, unmute
- Newsletter background parallax travel tripled (factor 0.42)
- Footer wordmark at 5% white
- Support email set to support@mushiworld.com (footer, contact page)

## Round 4 — 2026-11-18

Bundle builder page removed (`/pages/bundles` now 404s; the homepage button and popup B link to Shop All). "1-on-1 Expert Coaching" added above the coaching headline. Footer sign-up confirmed at 10%.
