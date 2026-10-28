// Small pure helpers: money math, one shared cart summary, form validation,
// and the AsyncStorage wrapper. No React here — easy to reason about and test.
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { Address, CartItem, Product } from './catalog';

/** Format a rupee amount: 4999 -> "₹4,999". */
export function inr(n: number): string {
  return '₹' + Math.max(0, Math.round(n)).toLocaleString('en-IN');
}

/** Percent saved vs MRP, for the "38% OFF" badges. */
export function discountPct(price: number, mrp: number): number {
  if (mrp <= 0 || mrp <= price) return 0;
  return Math.round(((mrp - price) / mrp) * 100);
}

/** Delivery is ₹49 below ₹999, free above. FREESHIP coupon zeroes it. */
export function deliveryFeeFor(subtotalAfterDiscount: number, freeShipCoupon: boolean): number {
  if (subtotalAfterDiscount <= 0) return 0;
  if (freeShipCoupon) return 0;
  return subtotalAfterDiscount >= 999 ? 0 : 49;
}

export interface CartSummary {
  subtotal: number;
  discount: number;
  delivery: number;
  total: number;
  count: number;
}

/**
 * Single source of truth for cart money math — Cart and Checkout both use this,
 * so the totals can never disagree. Unknown products (removed items) are skipped.
 */
export function summarizeCart(
  cart: CartItem[],
  lookup: (id: string) => Product | undefined,
  couponDiscount: number,
  freeShip: boolean,
): CartSummary {
  const subtotal = cart.reduce((s, it) => s + (lookup(it.productId)?.price ?? 0) * it.qty, 0);
  const discount = Math.max(0, Math.min(couponDiscount, subtotal));
  const delivery = deliveryFeeFor(subtotal - discount, freeShip);
  const count = cart.reduce((s, it) => s + it.qty, 0);
  return { subtotal, discount, delivery, total: subtotal - discount + delivery, count };
}

/** Checkout address check. Returns an error map — empty means valid. */
export function validateAddress(a: Address): Record<string, string> {
  const e: Record<string, string> = {};
  if (a.name.trim().length < 3) e.name = 'Enter your full name';
  if (!/^[6-9]\d{9}$/.test(a.phone.trim())) e.phone = 'Enter a valid 10-digit mobile number';
  if (a.line.trim().length < 8) e.line = 'Enter house no, street and area';
  if (a.city.trim().length < 2) e.city = 'Enter city';
  if (!/^\d{6}$/.test(a.pincode.trim())) e.pincode = 'Enter a 6-digit pincode';
  return e;
}

/** Support-form check. */
export function validateContact(v: { name: string; email: string; message: string }): Record<string, string> {
  const e: Record<string, string> = {};
  if (v.name.trim().length < 2) e.name = 'Enter your name';
  if (!/^\S+@\S+\.\S+$/.test(v.email.trim())) e.email = 'Enter a valid email';
  if (v.message.trim().length < 10) e.message = 'Tell us a little more (min 10 characters)';
  return e;
}

/** Review-form check. */
export function validateReview(v: { rating: number; title: string; body: string }): Record<string, string> {
  const e: Record<string, string> = {};
  if (v.rating < 1) e.rating = 'Please pick a star rating';
  if (v.title.trim().length < 3) e.title = 'Add a short headline';
  if (v.body.trim().length < 5) e.body = 'Write a few words about the product';
  return e;
}

/** New admin product form check. Stock 0 is allowed (lists as out of stock). */
export function validateNewProduct(v: { name: string; price: string; stock: string }): Record<string, string> {
  const e: Record<string, string> = {};
  if (v.name.trim().length < 3) e.name = 'Name needs min 3 characters';
  if (!(Number(v.price) > 0)) e.price = 'Enter a valid price';
  if (v.stock.trim() === '' || Number.isNaN(Number(v.stock)) || Number(v.stock) < 0) e.stock = 'Enter stock (0 allowed)';
  return e;
}

// ---- persistence (cart, wishlist, profile, orders, prefs, coupon, catalogue) ----

export const KEYS = {
  cart: '@shopsphere/cart',
  wishlist: '@shopsphere/wishlist',
  profile: '@shopsphere/profile',
  prefs: '@shopsphere/prefs',
  orders: '@shopsphere/orders',
  reviews: '@shopsphere/reviews',
  support: '@shopsphere/support',
  coupon: '@shopsphere/coupon',
  customProducts: '@shopsphere/custom-products',
  stockOverrides: '@shopsphere/stock-overrides',
  deleted: '@shopsphere/deleted-products',
};

export async function loadJSON<T>(key: string, fallback: T): Promise<T> {
  try {
    const raw = await AsyncStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export async function saveJSON(key: string, value: unknown): Promise<void> {
  try {
    await AsyncStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Storage unavailable — the app keeps working in memory.
  }
}
