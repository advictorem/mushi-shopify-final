// Subscribe & Save configuration for the product pages.
//
// Phase 1: a frontend demonstration. Nothing here bills or schedules anything.
// Shopify phase: these values come from the product's selling plans (set up in
// RecurrinGO! Subscriptions); replace this object with the selling plan group
// and fill `sellingPlanId` for each frequency. See README → "Subscriptions".
//
// The 10% saving and the three schedules are taken from the client-confirmed
// FAQ ("Can I subscribe?"). Billing, cancellation and shipping terms are not
// confirmed, so no such promise appears in termsText.
export const subscription = {
  enabled: true,
  demo: true, // shows the staging review tag next to the selector
  eligibleCategories: ['gummies', 'chocolates'],
  discountType: 'percentage', // 'percentage' | 'fixed' (minor units off each unit)
  discountValue: 10,
  displayLabel: 'Subscribe and Save',
  frequencies: [
    { id: 'every-week', label: 'Every week', interval: 1, unit: 'week', sellingPlanId: null },
    { id: 'every-2-weeks', label: 'Every 2 weeks', interval: 2, unit: 'week', sellingPlanId: null },
    { id: 'every-month', label: 'Once per month', interval: 1, unit: 'month', sellingPlanId: null },
  ],
  defaultFrequency: 'every-month',
  termsText: 'Choose how often you’d like to receive this flavor. Your subscription will be managed through your customer account once activated.',
  futureSellingPlanReference: null, // Shopify selling plan group ID, once it exists
};
