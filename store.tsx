// Global shop state: one context holding cart, wishlist, profile, orders and the
// catalogue. Everything is persisted with AsyncStorage, and the app waits for
// saved data before rendering (so screens never see half-loaded state).
import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import type {
  Address, CartItem, Category, Order, OrderStatus, PaymentMethod,
  Preferences, Product, Review, SupportMessage, UserProfile,
} from './catalog';
import { PRODUCTS, SEED_REVIEWS } from './catalog';
import { KEYS, loadJSON, saveJSON } from './utils';
import { COLORS } from './ui';

export interface NewProductInput {
  name: string;
  brand: string;
  category: Category;
  price: number;
  mrp: number;
  stock: number;
  description: string;
}

interface StoredCustom {
  id: string;
  input: NewProductInput;
}

// Seed review ids never persist: the store keeps only user-written reviews and
// merges the static seeds back at read time (so averages stay honest).
const SEED_IDS = new Set(SEED_REVIEWS.map((r) => r.id));

// Local bundled photos for admin-added products (never remote images).
const ADMIN_IMAGES: Record<string, any> = {
  Electronics: require('./assets/images/speaker.png'),
  Fashion: require('./assets/images/tshirt.png'),
  Footwear: require('./assets/images/sneakers.png'),
  Accessories: require('./assets/images/backpack.png'),
  Beauty: require('./assets/images/perfume.png'),
  Home: require('./assets/images/lamp.png'),
};

const DEFAULT_PROFILE: UserProfile = { name: '', email: '', phone: '', address: '', avatarUri: null };
const DEFAULT_PREFS: Preferences = { orderUpdates: true, offers: true, newsletter: false, darkMode: false, adminMode: false };

const NEXT_STATUS: Record<OrderStatus, OrderStatus | null> = {
  Placed: 'Packed',
  Packed: 'Shipped',
  Shipped: 'Out for delivery',
  'Out for delivery': 'Delivered',
  Delivered: null,
  Cancelled: null,
};

interface ShopState {
  products: Product[];
  cart: CartItem[];
  wishlist: string[];
  profile: UserProfile;
  prefs: Preferences;
  orders: Order[];
  reviews: Review[];
  couponCode: string;
  cartCount: number;
  subtotal: number;
  productById: (id: string) => Product | undefined;
  /** Blended rating: seed average weighted with user reviews. */
  ratingFor: (p: Product) => { avg: number; count: number };
  addToCart: (id: string, qty?: number) => boolean;
  setQty: (id: string, qty: number) => void;
  removeFromCart: (id: string) => void;
  /** Clamp cart lines to available stock. Returns true if anything changed. */
  reconcileCart: () => boolean;
  toggleWishlist: (id: string) => void;
  isWishlisted: (id: string) => boolean;
  setCouponCode: (c: string) => void;
  placeOrder: (
    address: Address, payment: PaymentMethod,
    amounts: { subtotal: number; discount: number; deliveryFee: number; total: number }, coupon?: string,
  ) => Order;
  advanceOrder: (id: string) => void;
  cancelOrder: (id: string) => void;
  addReview: (r: Omit<Review, 'id' | 'date'>) => void;
  reviewsFor: (productId: string) => Review[];
  saveProfile: (p: UserProfile) => void;
  savePrefs: (p: Preferences) => void;
  supportMessages: SupportMessage[];
  addSupport: (s: Omit<SupportMessage, 'id' | 'date'>) => void;
  addProduct: (input: NewProductInput) => void;
  updateStock: (id: string, stock: number) => void;
  deleteProduct: (id: string) => void;
}

const Ctx = createContext<ShopState | null>(null);

export function ShopProvider({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = useState(false);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [wishlist, setWishlist] = useState<string[]>([]);
  const [profile, setProfile] = useState<UserProfile>(DEFAULT_PROFILE);
  const [prefs, setPrefs] = useState<Preferences>(DEFAULT_PREFS);
  const [orders, setOrders] = useState<Order[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [support, setSupport] = useState<SupportMessage[]>([]);
  const [custom, setCustom] = useState<StoredCustom[]>([]);
  const [stockOverrides, setStockOverrides] = useState<Record<string, number>>({});
  const [deleted, setDeleted] = useState<string[]>([]);
  const [couponCode, setCouponCodeState] = useState('');

  // Load everything once on launch.
  useEffect(() => {
    (async () => {
      const [c, w, p, pr, o, r, s, cu, so, cc, del] = await Promise.all([
        loadJSON<CartItem[]>(KEYS.cart, []),
        loadJSON<string[]>(KEYS.wishlist, []),
        loadJSON<UserProfile>(KEYS.profile, DEFAULT_PROFILE),
        loadJSON<Preferences>(KEYS.prefs, DEFAULT_PREFS),
        loadJSON<Order[]>(KEYS.orders, []),
        loadJSON<Review[]>(KEYS.reviews, []),
        loadJSON<SupportMessage[]>(KEYS.support, []),
        loadJSON<StoredCustom[]>(KEYS.customProducts, []),
        loadJSON<Record<string, number>>(KEYS.stockOverrides, {}),
        loadJSON<string>(KEYS.coupon, ''),
        loadJSON<string[]>(KEYS.deleted, []),
      ]);
      setCart(c.filter((i) => i.qty > 0));
      setWishlist(w);
      setProfile({ ...DEFAULT_PROFILE, ...p });
      setPrefs({ ...DEFAULT_PREFS, ...pr });
      setOrders(o);
      setReviews(r.filter((x) => !SEED_IDS.has(x.id)));
      setSupport(s);
      setCustom(cu);
      setStockOverrides(so);
      setCouponCodeState(cc);
      setDeleted(del);
      setReady(true);
    })();
  }, []);

  // Persist every slice (only after load, so defaults never wipe saved data).
  useEffect(() => { if (ready) saveJSON(KEYS.cart, cart); }, [cart, ready]);
  useEffect(() => { if (ready) saveJSON(KEYS.wishlist, wishlist); }, [wishlist, ready]);
  useEffect(() => { if (ready) saveJSON(KEYS.profile, profile); }, [profile, ready]);
  useEffect(() => { if (ready) saveJSON(KEYS.prefs, prefs); }, [prefs, ready]);
  useEffect(() => { if (ready) saveJSON(KEYS.orders, orders); }, [orders, ready]);
  useEffect(() => { if (ready) saveJSON(KEYS.reviews, reviews); }, [reviews, ready]);
  useEffect(() => { if (ready) saveJSON(KEYS.support, support); }, [support, ready]);
  useEffect(() => { if (ready) saveJSON(KEYS.customProducts, custom); }, [custom, ready]);
  useEffect(() => { if (ready) saveJSON(KEYS.stockOverrides, stockOverrides); }, [stockOverrides, ready]);
  useEffect(() => { if (ready) saveJSON(KEYS.coupon, couponCode); }, [couponCode, ready]);
  useEffect(() => { if (ready) saveJSON(KEYS.deleted, deleted); }, [deleted, ready]);

  // Catalogue = admin additions first, then seed products with stock edits applied.
  // Admin-deleted seed products are hidden everywhere.
  const products: Product[] = useMemo(() => {
    const extra: Product[] = custom.map((c) => ({
      id: c.id, name: c.input.name, brand: c.input.brand, category: c.input.category,
      price: c.input.price, mrp: Math.max(c.input.mrp, c.input.price),
      rating: 4.0, reviewCount: 0, stock: c.input.stock,
      description: c.input.description, image: ADMIN_IMAGES[c.input.category] ?? ADMIN_IMAGES.Electronics,
      tags: ['Admin'],
    }));
    const seed = PRODUCTS.map((p) => ({ ...p, stock: stockOverrides[p.id] ?? p.stock }))
      .filter((p) => !deleted.includes(p.id));
    return [...extra, ...seed];
  }, [custom, stockOverrides, deleted]);

  const map = useMemo(() => new Map(products.map((p) => [p.id, p])), [products]);
  const productById = useCallback((id: string) => map.get(id), [map]);

  const subtotal = useMemo(
    () => cart.reduce((s, it) => s + (map.get(it.productId)?.price ?? 0) * it.qty, 0),
    [cart, map],
  );
  const cartCount = useMemo(() => cart.reduce((s, it) => s + it.qty, 0), [cart]);

  /** Add to cart, capped at available stock. Returns false when refused. */
  const addToCart = useCallback((id: string, qty = 1): boolean => {
    const p = map.get(id);
    if (!p || p.stock <= 0) return false;
    const current = cart.find((i) => i.productId === id)?.qty ?? 0;
    const next = Math.min(current + qty, p.stock);
    if (next <= current) return false;
    setCart((prev) => {
      const found = prev.find((i) => i.productId === id);
      if (found) return prev.map((i) => (i.productId === id ? { ...i, qty: next } : i));
      return [...prev, { productId: id, qty: next }];
    });
    return true;
  }, [cart, map]);

  const setQty = useCallback((id: string, qty: number) => {
    const cap = map.get(id)?.stock ?? 99;
    const q = Math.min(Math.max(0, qty), Math.max(cap, 0));
    setCart((prev) => (q <= 0 ? prev.filter((i) => i.productId !== id)
      : prev.map((i) => (i.productId === id ? { ...i, qty: q } : i))));
  }, [map]);

  const removeFromCart = useCallback(
    (id: string) => setCart((prev) => prev.filter((i) => i.productId !== id)), []);

  const reconcileCart = useCallback((): boolean => {
    let changed = false;
    const next: CartItem[] = [];
    for (const it of cart) {
      const stock = map.get(it.productId)?.stock ?? 0;
      if (stock <= 0) { changed = true; continue; }
      const q = Math.min(it.qty, stock);
      if (q !== it.qty) changed = true;
      next.push({ productId: it.productId, qty: q });
    }
    if (changed) setCart(next);
    return changed;
  }, [cart, map]);

  const toggleWishlist = useCallback((id: string) => {
    setWishlist((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  }, []);
  const isWishlisted = useCallback((id: string) => wishlist.includes(id), [wishlist]);
  const setCouponCode = useCallback((c: string) => setCouponCodeState(c), []);

  const placeOrder = useCallback((
    address: Address, payment: PaymentMethod,
    amounts: { subtotal: number; discount: number; deliveryFee: number; total: number }, coupon?: string,
  ): Order => {
    const order: Order = {
      id: 'ORD' + Date.now().toString().slice(-8),
      date: new Date().toISOString(),
      items: cart.map((i) => ({
        productId: i.productId, qty: i.qty,
        price: map.get(i.productId)?.price ?? 0,
        name: map.get(i.productId)?.name ?? 'Item',
      })),
      subtotal: amounts.subtotal, discount: amounts.discount,
      deliveryFee: amounts.deliveryFee, total: amounts.total,
      coupon: coupon || undefined, address, payment, status: 'Placed',
    };
    setOrders((prev) => [order, ...prev]);
    // Decrement inventory — seed products via overrides, admin products in place.
    const customIds = new Set(custom.map((c) => c.id));
    setCustom((prev) => prev.map((c) => {
      const line = cart.find((i) => i.productId === c.id);
      return line ? { ...c, input: { ...c.input, stock: Math.max(0, c.input.stock - line.qty) } } : c;
    }));
    setStockOverrides((prev) => {
      const next = { ...prev };
      for (const i of cart) {
        if (customIds.has(i.productId)) continue;
        const p = map.get(i.productId);
        if (p) next[i.productId] = Math.max(0, (next[i.productId] ?? p.stock) - i.qty);
      }
      return next;
    });
    setCart([]);
    setCouponCodeState('');
    return order;
  }, [cart, map, custom]);

  const advanceOrder = useCallback((id: string) => {
    setOrders((prev) => prev.map((o) => {
      const next = NEXT_STATUS[o.status];
      return o.id === id && next ? { ...o, status: next } : o;
    }));
  }, []);

  const cancelOrder = useCallback((id: string) => {
    const target = orders.find((o) => o.id === id);
    if (!target || target.status === 'Delivered' || target.status === 'Cancelled') return;
    setOrders((prev) => prev.map((o) => (o.id === id ? { ...o, status: 'Cancelled' as OrderStatus } : o)));
    // Eligible cancellations return the items to inventory.
    setCustom((prev) => prev.map((c) => {
      const line = target.items.find((i) => i.productId === c.id);
      return line ? { ...c, input: { ...c.input, stock: c.input.stock + line.qty } } : c;
    }));
    setStockOverrides((prev) => {
      const next = { ...prev };
      for (const it of target.items) {
        if (it.productId.startsWith('admin-')) continue;
        const base = PRODUCTS.find((p) => p.id === it.productId)?.stock ?? 0;
        next[it.productId] = (next[it.productId] ?? base) + it.qty;
      }
      return next;
    });
  }, [orders]);

  const addReview = useCallback((r: Omit<Review, 'id' | 'date'>) => {
    setReviews((prev) => [{ ...r, id: 'rev' + Date.now(), date: new Date().toISOString().slice(0, 10) }, ...prev]);
  }, []);
  const reviewsFor = useCallback((pid: string) => ([
    ...reviews.filter((r) => r.productId === pid),
    ...SEED_REVIEWS.filter((r) => r.productId === pid),
  ]), [reviews]);

  /** Seed average blended with the user's own reviews. */
  const ratingFor = useCallback((p: Product) => {
    const mine = reviews.filter((r) => r.productId === p.id);
    const count = p.reviewCount + mine.length;
    if (count === 0) return { avg: p.rating, count: 0 };
    const avg = (p.rating * p.reviewCount + mine.reduce((s, r) => s + r.rating, 0)) / count;
    return { avg: Math.round(avg * 10) / 10, count };
  }, [reviews]);

  const saveProfile = useCallback((p: UserProfile) => setProfile(p), []);
  const savePrefs = useCallback((p: Preferences) => setPrefs(p), []);

  const addSupport = useCallback((s: Omit<SupportMessage, 'id' | 'date'>) => {
    setSupport((prev) => [{ ...s, id: 'sup' + Date.now(), date: new Date().toISOString() }, ...prev]);
  }, []);

  const addProduct = useCallback((input: NewProductInput) => {
    setCustom((prev) => [...prev, { id: 'admin-' + Date.now(), input }]);
  }, []);

  const updateStock = useCallback((id: string, stock: number) => {
    const safe = Math.max(0, stock);
    if (id.startsWith('admin-')) {
      setCustom((prev) => prev.map((c) => (c.id === id ? { ...c, input: { ...c.input, stock: safe } } : c)));
    } else {
      setStockOverrides((prev) => ({ ...prev, [id]: safe }));
    }
  }, []);

  const deleteProduct = useCallback((id: string) => {
    if (id.startsWith('admin-')) {
      setCustom((prev) => prev.filter((c) => c.id !== id));
    } else if (!deleted.includes(id)) {
      // Seed products are hidden from the shop (and their stock edit dropped).
      setDeleted((prev) => [...prev, id]);
      setStockOverrides((prev) => {
        const next = { ...prev };
        delete next[id];
        return next;
      });
    }
    setCart((prev) => prev.filter((i) => i.productId !== id));
    setWishlist((prev) => prev.filter((x) => x !== id));
  }, [deleted]);

  // Wait for saved data so every screen renders with the real persisted state.
  if (!ready) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Loading ShopSphere…</Text>
      </View>
    );
  }

  const value: ShopState = {
    products, cart, wishlist, profile, prefs, orders, reviews,
    couponCode, cartCount, subtotal, productById, ratingFor,
    addToCart, setQty, removeFromCart, reconcileCart,
    toggleWishlist, isWishlisted, setCouponCode,
    placeOrder, advanceOrder, cancelOrder, addReview, reviewsFor,
    saveProfile, savePrefs, supportMessages: support, addSupport,
    addProduct, updateStock, deleteProduct,
  };
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

/** Read shop state and actions from any screen. Must be used inside ShopProvider. */
export function useShop(): ShopState {
  const v = useContext(Ctx);
  if (!v) throw new Error('useShop must be used inside ShopProvider');
  return v;
}

const styles = StyleSheet.create({
  loading: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#F6F7FB' },
  loadingText: { marginTop: 12, fontSize: 15, fontWeight: '600', color: '#6B7280' },
});
