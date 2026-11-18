/**
 * Commerce adapter — the ONLY module the UI talks to for products and cart.
 *
 * Phase 1: backed by src/data/products.json and localStorage.
 * Shopify phase: keep these function signatures and swap the bodies for
 * Storefront API calls (headless) or /cart/*.js Ajax endpoints (Liquid theme).
 * See README → "Future Shopify integration".
 */
import catalog from '../data/products.json';
import { subscription } from '../data/subscription.config.js';
import { store } from '../utils/dom.js';

const CART_KEY = 'mushi.cart.v1';
const listeners = new Set();

function byHandle(handle) {
  return catalog.products.find((p) => p.handle === handle) || null;
}

/* ---------- purchase options (one-time / Subscribe & Save) ---------- */

const frequency = (id) => subscription.frequencies.find((f) => f.id === id) || null;

/** Unit price on subscription, in minor units. Independent of any quantity promotion. */
export function subscriptionPrice(basePrice) {
  if (subscription.discountType === 'fixed') return Math.max(0, basePrice - subscription.discountValue);
  return Math.round((basePrice * (100 - subscription.discountValue)) / 100);
}

/**
 * What a product can be bought as. `subscription` is null when the product is
 * not eligible. Shopify phase: build this from product.selling_plan_groups.
 */
export function getPurchaseOptions(product) {
  const eligible = subscription.enabled && product?.price != null && product.available && subscription.eligibleCategories.includes(product.category);
  return {
    oneTime: { price: product?.price ?? null },
    subscription: eligible
      ? {
          label: subscription.displayLabel,
          price: subscriptionPrice(product.price),
          discountType: subscription.discountType,
          discountValue: subscription.discountValue,
          frequencies: subscription.frequencies,
          defaultFrequency: subscription.defaultFrequency,
          termsText: subscription.termsText,
          demo: subscription.demo,
        }
      : null,
  };
}

/* ---------- cart state ---------- */

// A line is one product bought one way: { handle, quantity, plan }.
// plan is null for a one-time purchase or a frequency id for a subscription,
// so the same flavor can sit in the cart once as each.
const lineKey = (l) => (l.plan ? `${l.handle}::${l.plan}` : l.handle);
let cart = sanitize(store.get(CART_KEY, []));

function sanitize(lines) {
  if (!Array.isArray(lines)) return [];
  return lines
    .filter((l) => l && byHandle(l.handle)?.price != null && Number.isInteger(l.quantity) && l.quantity > 0)
    .filter((l) => !l.plan || (frequency(l.plan) && getPurchaseOptions(byHandle(l.handle)).subscription))
    .map((l) => ({ handle: l.handle, quantity: l.quantity, plan: l.plan || null }));
}

function persist() {
  store.set(CART_KEY, cart);
  const snapshot = getCart();
  listeners.forEach((fn) => fn(snapshot));
}

/* ---------- catalog ---------- */

export const catalogMeta = catalog._meta;
export const getCategories = () => catalog.categories;
export const getProducts = (category) =>
  category ? catalog.products.filter((p) => p.category === category) : [...catalog.products];
export const getProduct = byHandle;

/** Local search over title, category, description and flavor profile. */
export function searchProducts(query) {
  const terms = query.toLowerCase().trim().split(/\s+/).filter(Boolean);
  if (!terms.length) return [];
  return catalog.products
    .map((p) => {
      const title = p.title.toLowerCase();
      const hay = [p.title, p.category, p.formatLabel, p.shortDescription, p.fullDescription, p.flavorProfile].join(' ').toLowerCase();
      if (!terms.every((t) => hay.includes(t))) return null;
      return { p, score: terms.reduce((s, t) => s + (title.startsWith(t) ? 3 : title.includes(t) ? 2 : 1), 0) };
    })
    .filter(Boolean)
    .sort((a, b) => b.score - a.score)
    .map((r) => r.p);
}

/* ---------- cart ---------- */

/** Cart with line totals and subtotal, always priced from the product data. */
export function getCart() {
  const lines = cart.map((l) => {
    const product = byHandle(l.handle);
    const unitPrice = l.plan ? subscriptionPrice(product.price) : product.price;
    return {
      key: lineKey(l),
      handle: l.handle,
      quantity: l.quantity,
      product,
      unitPrice,
      // null for one-time; for subscriptions the chosen schedule (and, later, its selling plan)
      subscription: l.plan ? { label: subscription.displayLabel, frequency: frequency(l.plan) } : null,
      lineTotal: unitPrice * l.quantity,
    };
  });
  return {
    lines,
    itemCount: lines.reduce((n, l) => n + l.quantity, 0),
    subtotal: lines.reduce((n, l) => n + l.lineTotal, 0),
    hasSubscription: lines.some((l) => l.subscription),
    currency: 'USD',
  };
}

/**
 * @param {string} handle
 * @param {number} [quantity]
 * @param {{ plan?: string|null }} [options] plan = frequency id for Subscribe & Save
 * Shopify phase: POST /cart/add.js { id: variantId, quantity, selling_plan }.
 */
export function addToCart(handle, quantity = 1, { plan = null } = {}) {
  const product = byHandle(handle);
  if (!product || product.price == null || !product.available) return getCart(); // unpriced items cannot be bought
  if (plan && !(frequency(plan) && getPurchaseOptions(product).subscription)) plan = null;
  const qty = Math.max(1, Math.min(99, Math.floor(quantity)));
  const key = lineKey({ handle, plan });
  const line = cart.find((l) => lineKey(l) === key);
  if (line) line.quantity = Math.min(99, line.quantity + qty);
  else cart.push({ handle, quantity: qty, plan });
  persist();
  return getCart();
}

/** `key` is the line key from getCart().lines[n].key. */
export function updateQuantity(key, quantity) {
  const qty = Math.floor(quantity);
  if (qty <= 0) return removeFromCart(key);
  const line = cart.find((l) => lineKey(l) === key);
  if (line) line.quantity = Math.min(99, qty);
  persist();
  return getCart();
}

export function removeFromCart(key) {
  cart = cart.filter((l) => lineKey(l) !== key);
  persist();
  return getCart();
}

export function onCartChange(fn) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

// Keep tabs in sync.
window.addEventListener('storage', (e) => {
  if (e.key !== CART_KEY) return;
  cart = sanitize(store.get(CART_KEY, []));
  const snapshot = getCart();
  listeners.forEach((fn) => fn(snapshot));
});

/**
 * Checkout is intentionally not implemented in Phase 1.
 * Shopify phase: return { status: 'redirect', url: cart.checkoutUrl }.
 */
export function beginCheckout() {
  return { status: 'not-connected', message: 'Checkout will be connected when the Shopify integration begins.' };
}
