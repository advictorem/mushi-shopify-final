// Single source for header, mobile menu and footer links.
const live = 'https://mushiworld.com';

export const primaryNav = [
  {
    label: 'Shop',
    items: [
      { label: 'All', href: '/pages/shop.html' },
      { label: 'Gummies', href: '/pages/shop.html?category=gummies' },
      { label: 'Chocolates', href: '/pages/shop.html?category=chocolates' },
      { label: 'Merch', href: '/pages/shop.html?category=merch' },
    ],
  },
  {
    label: 'Learn',
    items: [
      { label: 'About Us', href: '/pages/about.html' },
      { label: 'Coaching', href: '/pages/coaching.html' },
      { label: 'FAQs', href: '/pages/faqs.html' },
      { label: 'Ingredients', href: '/pages/ingredients.html' },
    ],
  },
];

export const footerNav = [
  {
    label: 'Shop',
    items: [
      { label: 'Shop All', href: '/pages/shop.html' },
      { label: 'Gummies', href: '/pages/shop.html?category=gummies' },
      { label: 'Chocolates', href: '/pages/shop.html?category=chocolates' },
      { label: 'Merch', href: '/pages/shop.html?category=merch' },
    ],
  },
  {
    label: 'Learn',
    items: [
      { label: 'About Us', href: '/pages/about.html' },
      { label: 'Coaching', href: '/pages/coaching.html' },
      { label: 'FAQs', href: '/pages/faqs.html' },
      { label: 'Ingredients', href: '/pages/ingredients.html' },
    ],
  },
  {
    label: 'Support',
    items: [
      { label: 'Contact Us', href: '/pages/contact.html' },
      { label: 'Shipping Information', href: `${live}/pages/shipping-policy`, external: true },
      // No returns page or subscription portal was found on the live site on 2026-11-18.
      { label: 'Returns & Refunds', href: '/pages/contact.html', pending: true },
    ],
  },
  {
    label: 'Partners',
    items: [{ label: 'Wholesale & Bulk', href: '/pages/wholesale.html' }],
  },
];

// Small print, shown on the bottom line beside the copyright.
export const legalNav = [
  { label: 'Privacy Policy', href: `${live}/pages/privacy-policy`, external: true },
  { label: 'Terms of Service', href: `${live}/pages/terms-of-service`, external: true },
  { label: 'Data Sharing Opt-Out', href: `${live}/pages/data-sharing-opt-out`, external: true },
];
