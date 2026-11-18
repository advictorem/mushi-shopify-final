/**
 * Form adapter. Phase 1 sends nothing anywhere: it validates the shape and
 * resolves with { delivered: false } so the UI can show an honest preview state.
 *
 * Later: point each form at its service (Shopify customer/contact form,
 * Klaviyo, a CRM webhook…) and return { delivered: true } on success.
 *
 * @param {'coaching'|'wholesale'|'newsletter'|'offer'|'contact'} form
 * @param {Record<string,string>} data
 * @returns {Promise<{delivered: boolean, form: string}>}
 */
export async function submitForm(form, data) {
  await new Promise((r) => setTimeout(r, 350)); // let the pending state be seen
  if (import.meta.env.DEV) console.info(`[forms] "${form}" preview submit (not sent)`, Object.keys(data));
  return { delivered: false, form };
}

export const PREVIEW_NOTE = 'Preview only — this form is not connected yet, so nothing was sent.';
