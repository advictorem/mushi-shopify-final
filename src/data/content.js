// Homepage copy and section data. `review` marks anything that still needs
// client sign-off; the UI surfaces it when siteConfig.showReviewFlags is on.

export const heroMarquee = ['Embrace the moment', 'Deepen connection', 'Elevate your mood', 'Unlock energy'];

export const categories = [
  {
    handle: 'gummies',
    title: 'Gummies',
    image: 'category-gummies',
    alt: 'Three MUSHI gummy pouches: Green Apple, Cherry and Peach Bliss',
    // Background and label colours sampled from the approved comp.
    bg: '#c1e5cb',
    label: '#ffc09f',
  },
  {
    handle: 'chocolates',
    title: 'Chocolates',
    image: 'category-chocolates',
    alt: 'Three MUSHI chocolate boxes: Midnight Berry, Dark Chocolate and Milk Chocolate',
    // Not in the comp (only the Gummies state is drawn). Derived from the packaging.
    bg: '#f3c9bd',
    label: '#6a4037',
    review: 'Colours for this slide are not in Figma',
  },
  {
    handle: 'merch',
    title: 'Merch',
    image: 'category-merch',
    alt: 'MUSHI hoodie, back view',
    bg: '#cdd9e6',
    label: '#1c2932',
    review: 'Colours for this slide are not in Figma',
  },
];

export const lifestyle = [
  { key: 'alive', label: 'Alive', image: 'lifestyle-alive', alt: 'Woman dancing at an outdoor festival', focus: '50% 30%' },
  { key: 'focus', label: 'Focus', image: 'lifestyle-focus', alt: 'Person working at a desk lit by warm lamp light', focus: '50% 40%' },
  { key: 'present', label: 'Present', image: 'lifestyle-present', alt: 'Woman with eyes closed, arms raised', focus: '60% 35%' },
  { key: 'creative', label: 'Creative', image: 'lifestyle-creative', alt: 'Painter laughing on a studio floor among canvases', focus: '50% 35%' },
  { key: 'connected', label: 'Connected', image: 'lifestyle-connected', alt: 'Couple laughing together by a pool', focus: '45% 25%' },
];

export const benefits = [
  { icon: 'benefit-belgian', label: '100% Belgian chocolate', review: 'Applies to chocolates only' },
  { icon: 'benefit-gluten-free', label: 'Gluten-free' },
  { icon: 'benefit-lab-tested', label: 'Lab tested' },
  { icon: 'benefit-made-in-usa', label: 'Made in USA' },
  { icon: 'benefit-non-gmo', label: 'Non-GMO' },
  { icon: 'benefit-no-palm', label: 'No palm oils' },
  { icon: 'benefit-no-synthetics', label: 'No synthetics' },
  { icon: 'benefit-vegan', label: 'Vegan gummies', review: 'Applies to gummies only' },
];

// Answers are taken from the client's own FAQ draft (mushi-wireframes/faq.html)
// and the live shipping policy. None has been through regulatory review.
export const faqs = [
  {
    q: 'What is Mushi?',
    a: [
      'Mushi creates Feel-Good Indulgences—gummies and chocolates that bring together thoughtful ingredients, craveable flavor and an experience designed to make everyday moments feel a little more special.',
      'We believe feeling good should feel less like a wellness routine and more like something you actually look forward to.',
    ],
    source: 'mushi-wireframes/faq.html #01',
  },
  {
    q: 'How much should I have?',
    a: [
      'You’re in control of the pace. Always follow the dosage guidance printed on the specific Mushi package. If you’re new to Mushi, begin with a lower amount and give yourself plenty of time to understand how it feels before considering more.',
      'Everyone responds differently, so more isn’t automatically better.',
    ],
    source: 'mushi-wireframes/faq.html #07',
    review: 'Dosage guidance — needs compliance review',
  },
  {
    q: 'When should I enjoy it?',
    a: [
      'Mushi isn’t built around one specific time of day. Some people may prefer a lighter experience around creative, social or relaxing moments, while others may choose a different setting entirely.',
      'Start conservatively, understand how Mushi affects you personally and never drive or operate machinery after consuming it.',
    ],
    source: 'mushi-wireframes/faq.html #10',
    review: 'Usage guidance — needs compliance review',
  },
  {
    q: 'What’s inside?',
    a: [
      'Our gummy formula includes organic tapioca syrup, organic cane sugar, water, pectin, natural flavor, elderberry juice for color, citric acid, sodium citrate and our proprietary organic mushroom blend.',
      'Ingredients may vary slightly by flavor or product, so always refer to the packaging for the complete ingredient statement.',
    ],
    link: { label: 'See all ingredients', href: '/pages/ingredients.html' },
    source: 'mushi-wireframes/faq.html #03',
  },
  {
    q: 'Where do you ship?',
    a: [
      'We ship to all 50 states. Every Mushi order is delivered directly to your door in discreet outer packaging. What’s inside is your business.',
      'Once your order ships, you’ll receive tracking information so you can follow it along the way. Shipping is free on orders over $100.',
    ],
    link: { label: 'Read the shipping policy', href: 'https://mushiworld.com/pages/shipping-policy', external: true },
    source: 'mushi-wireframes/faq.html #23, confirmed by client 2026-11-18',
  },
  {
    q: 'Can I subscribe?',
    a: [
      'Yes. Subscribe & Save 10%. Choose your favorite flavor and we’ll automatically send the same flavor from your original purchase on the schedule that works best for you: every week, every 2 weeks or once per month.',
      'Want to switch flavors? Simply cancel your current subscription and start a new subscription with the flavor you’d like instead.',
    ],
    source: 'mushi-wireframes/faq.html #25, confirmed by client 2026-11-18',
    review: 'Subscription sign-up is not built in Phase 1 — it arrives with the Shopify integration',
  },
];

export const comparison = {
  rows: [
    { icon: 'compare-natural', label: 'Natural formula', mushi: 'Natural ingredients only', other: 'Often synthetic blends + processed additives' },
    { icon: 'compare-non-addictive', label: 'Non-addictive', mushi: 'Natural, non-addictive experience', other: 'Can feel habit-forming or overly intense' },
    { icon: 'compare-synthetic', label: 'Synthetic chemicals', mushi: 'No synthetic chemicals', other: 'Often made with synthetic actives' },
    { icon: 'compare-sugar', label: 'Sugar', mushi: '4g added sugar per gummy', other: 'Often higher sugar or syrup-heavy formulas' },
    { icon: 'compare-ingredient', label: 'Ingredient source', mushi: 'Organic tapioca syrup, organic cane sugar, pectin, elderberry juice', other: 'Artificial flavors, fillers, and lab-made systems' },
    { icon: 'compare-aftereffect', label: 'After effects', mushi: 'No crash or hangover after', other: 'Crash, fog, or hangover-like aftereffects' },
    { icon: 'compare-dosing', label: 'Dosing', mushi: '1 gummy serving • 5 per package', other: 'Inconsistent dosing or messy formats' },
    { icon: 'compare-readiness', label: 'Readiness', mushi: 'Ready anytime, no prep', other: 'Often require mixing, measuring, or extra steps' },
  ],
  review: 'Comparative and health claims copied from Figma — need compliance review',
};

// Reviews from mushiworld.com, confirmed as genuine by the client on 2026-11-18.
export const testimonials = {
  review: '',
  items: [
    { quote: 'Split a pack with friends at a rooftop dinner and the whole night just glowed. Juicy peach, zero heaviness.', name: 'Jordan M.', rating: 5, product: 'peach-bliss', tone: 'peach' },
    { quote: 'Cherry Blossom before studio time is my new rule. Rich flavor, and the ideas just keep arriving.', name: 'Alex T.', rating: 5, product: 'cherry', tone: 'cherry' },
    { quote: 'One tart little apple gummy with my evening tea and my mind actually clocks out. Best sleep ritual I have found.', name: 'Priya S.', rating: 5, product: 'green-apple', tone: 'apple' },
    { quote: 'These little gummies turned my Sunday reset into the best part of my week.', name: 'Maya R.', rating: 5, product: 'cherry', tone: 'cherry' },
  ],
};

// Static stand-ins. Shape matches what an Instagram feed integration would
// return (image, permalink, handle, caption) so the component can be re-pointed.
export const ugc = {
  review: 'Photos, handles and captions are placeholders cropped from the comp — supply approved UGC or connect the feed',
  items: [1, 2, 3, 4, 5].map((n) => ({
    image: `/assets/placeholder/ugc-${n}.webp`,
    permalink: 'https://instagram.com/taste.mushi',
    handle: '@taste.mushi',
    caption: 'Tag @taste.mushi to be featured here.',
    alt: 'Community photo placeholder',
  })),
};

export const coachingOutcomes = [
  'Creativity & Inspiration',
  'Focus & Mental Clarity',
  'Relaxation & Unwinding',
  'Connection & Social Experiences',
  'Building a Mindful Ritual',
];
