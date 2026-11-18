/**
 * Commerce adapter — the ONLY module the UI talks to for products and cart.
 *
 * Phase 1: backed by src/data/products.json and localStorage.
 * Shopify phase: keep these function signatures and swap the bodies for
 * Storefront API calls (headless) or /cart/*.js Ajax endpoints (Liquid theme).
 * See README → "Future Shopify integration".
 */
import catalog from '../data/products.json';
import { store } from '../utils/dom.js';

const CART_KEY = 'mushi.cart.v1';
const listeners = new Set();
let cart = sanitize(store.get(CART_KEY, []));

function sanitize(lines) {
  if (!Array.isArray(lines)) return [];
  return lines.filter((l) => l && byHandle(l.handle)?.price != null && Number.isInteger(l.quantity) && l.quantity > 0);
}

function byHandle(handle) {
  return catalog.products.find((p) => p.handle === handle) || null;
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
    return { handle: l.handle, quantity: l.quantity, product, lineTotal: product.price * l.quantity };
  });
  return {
    lines,
    itemCount: lines.reduce((n, l) => n + l.quantity, 0),
    subtotal: lines.reduce((n, l) => n + l.lineTotal, 0),
    currency: 'USD',
  };
}

export function addToCart(handle, quantity = 1) {
  const product = byHandle(handle);
  if (!product || product.price == null || !product.available) return getCart(); // unpriced items cannot be bought
  const qty = Math.max(1, Math.min(99, Math.floor(quantity)));
  const line = cart.find((l) => l.handle === handle);
  if (line) line.quantity = Math.min(99, line.quantity + qty);
  else cart.push({ handle, quantity: qty });
  persist();
  return getCart();
}

export function updateQuantity(handle, quantity) {
  const qty = Math.floor(quantity);
  if (qty <= 0) return removeFromCart(handle);
  const line = cart.find((l) => l.handle === handle);
  if (line) line.quantity = Math.min(99, qty);
  persist();
  return getCart();
}

export function removeFromCart(handle) {
  cart = cart.filter((l) => l.handle !== handle);
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
