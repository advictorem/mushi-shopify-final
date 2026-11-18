// Global, editable site settings. Nothing here talks to a backend.

export const siteConfig = {
  // Shows small "needs review" markers next to copy and assets that are
  // unverified or standing in for a missing export. Turn off for client demos.
  showReviewFlags: true,

  ageGate: {
    enabled: true,
    minimumAge: 21,
    rememberDays: 30, // how long a YES is remembered (localStorage)
    exitUrl: 'https://www.google.com/',
  },

  // Promotional popup: 'disabled' | 'a' | 'b'. Only one can be active.
  // Append ?offer=a or ?offer=b to any URL to preview one without editing this file.
  offerPopup: {
    active: 'disabled',
    delayMs: 6000, // counted from the moment the age gate is passed
    rememberDays: 14, // do not show again after dismissal
  },

  // Verified on mushiworld.com on 2026-11-18. Re-verify before launch.
  announcement: { text: 'Free shipping over $100', verifiedAt: '2026-11-18' },

  social: {
    instagram: 'https://instagram.com/taste.mushi',
    instagramHandle: '@TASTE.MUSHI',
    tiktok: 'https://www.tiktok.com/@taste.mushi',
  },

  // The live site and the wireframes disagree on the support address
  // (support@mushiworld.com vs hello@tastemushi.com). Left empty until confirmed;
  // the footer links to the contact page instead.
  contactEmail: '',

  liveSite: 'https://mushiworld.com',
};
