// Single source for header, mobile menu and footer links.

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
      { label: 'Shipping Information', href: '/pages/shipping.html' },
    ],
  },
  {
    label: 'Partners',
    items: [{ label: 'Wholesale & Bulk', href: '/pages/wholesale.html' }],
  },
];

// Small print, shown on the bottom line beside the copyright.
export const legalNav = [
  { label: 'Privacy Policy', href: '/pages/privacy.html' },
  { label: 'Terms of Service', href: '/pages/terms.html' },
  { label: 'Data Sharing Opt-Out', href: '/pages/data-sharing-opt-out.html' },
];
