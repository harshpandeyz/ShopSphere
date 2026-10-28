// ShopSphere catalogue: every shared type plus the product/coupon/seed data.
// All product photos are LOCAL files (assets/images) — the app works offline.
import type { ImageSourcePropType } from 'react-native';

export type Category = 'Electronics' | 'Fashion' | 'Footwear' | 'Accessories' | 'Beauty' | 'Home';

export interface Product {
  id: string;
  name: string;
  brand: string;
  category: Category;
  price: number; // selling price, INR
  mrp: number; // strikethrough price, INR
  rating: number; // 0–5
  reviewCount: number;
  stock: number;
  description: string;
  image: ImageSourcePropType;
  featured?: boolean;
  isNew?: boolean;
  tags: string[];
}

export interface CartItem {
  productId: string;
  qty: number;
}

export interface Coupon {
  code: string;
  label: string;
  description: string;
  minSubtotal: number;
}

export interface Address {
  name: string;
  phone: string;
  line: string;
  city: string;
  pincode: string;
}

export type PaymentMethod = 'UPI' | 'Card' | 'COD';

export interface OrderItem extends CartItem {
  price: number;
  name: string;
}

export type OrderStatus = 'Placed' | 'Packed' | 'Shipped' | 'Out for delivery' | 'Delivered' | 'Cancelled';

export interface Order {
  id: string;
  date: string; // ISO string
  items: OrderItem[];
  subtotal: number;
  discount: number;
  deliveryFee: number;
  total: number;
  coupon?: string;
  address: Address;
  payment: PaymentMethod;
  status: OrderStatus;
}

export interface Review {
  id: string;
  productId: string;
  author: string;
  rating: number;
  title: string;
  body: string;
  date: string; // YYYY-MM-DD
}

export interface UserProfile {
  name: string;
  email: string;
  phone: string;
  address: string;
  avatarUri: string | null; // gallery URI, or null = bundled placeholder
}

export interface Preferences {
  orderUpdates: boolean;
  offers: boolean;
  newsletter: boolean;
  darkMode: boolean;
  adminMode: boolean;
}

export interface SupportMessage {
  id: string;
  name: string;
  email: string;
  topic: string;
  message: string;
  date: string;
}

export const CATEGORIES = ['All', 'Electronics', 'Fashion', 'Footwear', 'Accessories', 'Beauty', 'Home'] as const;

export const PRODUCTS: Product[] = [
  {
    id: 'p-headphones', name: 'Nova Wireless Headphones', brand: 'Nova', category: 'Electronics',
    price: 4999, mrp: 7999, rating: 4.6, reviewCount: 2314, stock: 24,
    description: 'Flagship over-ear headphones with 40mm drivers, hybrid noise cancellation, 60-hour battery and plush memory-foam cushions. Folds flat for travel.',
    image: require('./assets/images/headphones.png'),
    featured: true, tags: ['Audio', 'Bestseller'],
  },
  {
    id: 'p-watch', name: 'Pulse Smartwatch Series 5', brand: 'Pulse', category: 'Electronics',
    price: 6999, mrp: 9999, rating: 4.4, reviewCount: 1876, stock: 31,
    description: '1.85" AMOLED display, Bluetooth calling, SpO2 + heart tracking, 100+ sport modes and 10-day battery. 5ATM water resistant.',
    image: require('./assets/images/smartwatch.png'),
    featured: true, isNew: true, tags: ['Wearables', 'New'],
  },
  {
    id: 'p-sneakers', name: 'AirFlex Runner Sneakers', brand: 'AirFlex', category: 'Footwear',
    price: 3499, mrp: 5499, rating: 4.5, reviewCount: 3421, stock: 42,
    description: 'Featherlight knit runners with responsive foam sole and breathable mesh. All-day comfort for running, gym and streetwear.',
    image: require('./assets/images/sneakers.png'),
    featured: true, tags: ['Running', 'Bestseller'],
  },
  {
    id: 'p-backpack', name: 'Urban Canvas Backpack 25L', brand: 'UrbanTrail', category: 'Accessories',
    price: 1899, mrp: 2999, rating: 4.3, reviewCount: 964, stock: 55,
    description: 'Water-repellent canvas backpack with padded 15.6" laptop sleeve, anti-theft pocket, bottle holder and rain cover included.',
    image: require('./assets/images/backpack.png'),
    tags: ['Travel', 'Laptop'],
  },
  {
    id: 'p-camera', name: 'Lumen Mirrorless Camera M50', brand: 'Lumen', category: 'Electronics',
    price: 42999, mrp: 52999, rating: 4.8, reviewCount: 412, stock: 8,
    description: '24.2MP APS-C sensor, 4K30 video, dual-pixel autofocus and flip touchscreen. Includes 15-45mm kit lens — ideal for creators.',
    image: require('./assets/images/camera.png'),
    featured: true, tags: ['Photography', 'Pro'],
  },
  {
    id: 'p-perfume', name: 'Essence Eau de Parfum 100ml', brand: 'Essence', category: 'Beauty',
    price: 2499, mrp: 3499, rating: 4.7, reviewCount: 1530, stock: 38,
    description: 'Long-lasting unisex EDP with bergamot, jasmine and sandalwood. 8-10 hour wear, IFRA-safe, cruelty-free.',
    image: require('./assets/images/perfume.png'),
    isNew: true, tags: ['Fragrance', 'Unisex'],
  },
  {
    id: 'p-tee', name: 'Classic White Tee (Pack of 1)', brand: 'ThreadLab', category: 'Fashion',
    price: 499, mrp: 999, rating: 4.2, reviewCount: 5210, stock: 120,
    description: '220 GSM combed-cotton tee with a clean tailored fit. Pre-shrunk, bio-washed, sizes S-XXL.',
    image: require('./assets/images/tshirt.png'),
    tags: ['Cotton', 'Essential'],
  },
  {
    id: 'p-jacket', name: 'Denim Trucker Jacket', brand: 'ThreadLab', category: 'Fashion',
    price: 2799, mrp: 4299, rating: 4.5, reviewCount: 876, stock: 19,
    description: 'Light-wash stretch-denim trucker with copper buttons and a modern slim cut. Layers perfectly over tees and hoodies.',
    image: require('./assets/images/jacket.png'),
    isNew: true, tags: ['Denim', 'Winter'],
  },
  {
    id: 'p-sunglasses', name: 'Aviator Sunglasses UV400', brand: 'SunCraft', category: 'Accessories',
    price: 1599, mrp: 2799, rating: 4.4, reviewCount: 1120, stock: 47,
    description: 'Polarized aviators with UV400 lenses, featherlight metal frame and hard case + microfiber cloth in the box.',
    image: require('./assets/images/sunglasses.png'),
    featured: true, tags: ['Polarized', 'Summer'],
  },
  {
    id: 'p-speaker', name: 'Aura Smart Speaker', brand: 'Aura', category: 'Electronics',
    price: 3999, mrp: 5999, rating: 4.3, reviewCount: 2034, stock: 27,
    description: 'Room-filling 360° sound, voice assistant built-in, multi-room pairing and 12-hour playtime. Wi-Fi + Bluetooth 5.3.',
    image: require('./assets/images/speaker.png'),
    tags: ['Audio', 'Smart Home'],
  },
  {
    id: 'p-chair', name: 'Ergo Lounge Chair', brand: 'CasaNest', category: 'Home',
    price: 12999, mrp: 18999, rating: 4.6, reviewCount: 356, stock: 11,
    description: 'Comfort-first accent lounge chair with a cushioned tufted backrest and sturdy wooden legs. 120kg capacity, assembles in 15 min.',
    image: require('./assets/images/chair.png'),
    featured: true, tags: ['Furniture', 'Premium'],
  },
  {
    id: 'p-lamp', name: 'Glow Minimal Pendant Light', brand: 'CasaNest', category: 'Home',
    price: 1299, mrp: 1999, rating: 4.1, reviewCount: 743, stock: 64,
    description: 'Dimmable LED pendant light with 3 colour temperatures and touch controls. 1.5m adjustable cord, E27 bulb included.',
    image: require('./assets/images/lamp.png'),
    tags: ['Lighting', 'Pendant'],
  },
  {
    id: 'p-keyboard', name: 'Pro Mechanical Keyboard', brand: 'KeyForge', category: 'Electronics',
    price: 5499, mrp: 7499, rating: 4.7, reviewCount: 689, stock: 22,
    description: 'Hot-swappable 75% mechanical keyboard with gasket mount, PBT keycaps, tri-mode (BT/2.4G/USB-C) and south-facing RGB.',
    image: require('./assets/images/keyboard.png'),
    isNew: true, tags: ['Gaming', 'Work'],
  },
  {
    id: 'p-phone', name: 'PixelPro Smartphone 5G (8/128)', brand: 'PixelPro', category: 'Electronics',
    price: 24999, mrp: 29999, rating: 4.5, reviewCount: 2874, stock: 15,
    description: '6.6" 120Hz AMOLED, 108MP OIS camera, 5G, 5000mAh with 67W turbo charging. Clean software, 3 years of updates.',
    image: require('./assets/images/smartphone.png'),
    featured: true, isNew: true, tags: ['5G', 'Flagship'],
  },
];

export const BANNERS = [
  { id: 'b1', image: require('./assets/images/banner-sale.png') },
  { id: 'b2', image: require('./assets/images/banner-new.png') },
  { id: 'b3', image: require('./assets/images/banner-fashion.png') },
];

// Working demo coupons. Rules are enforced by applyCoupon() below.
export const COUPONS: Coupon[] = [
  { code: 'WELCOME20', label: '20% off up to ₹800', description: 'Min order ₹999', minSubtotal: 999 },
  { code: 'SAVE10', label: '10% off up to ₹500', description: 'No minimum order', minSubtotal: 0 },
  { code: 'FLAT100', label: 'Flat ₹100 off', description: 'Min order ₹799', minSubtotal: 799 },
  { code: 'FREESHIP', label: 'Free delivery', description: 'Zero delivery fee on any order', minSubtotal: 0 },
];

export interface CouponResult {
  discount: number;
  freeShip: boolean;
  message: string;
}

export function applyCoupon(code: string, subtotal: number): CouponResult {
  const c = code.trim().toUpperCase();
  if (!c) return { discount: 0, freeShip: false, message: '' };
  if (c === 'WELCOME20') {
    if (subtotal < 999) return { discount: 0, freeShip: false, message: 'WELCOME20 needs min ₹999' };
    return { discount: Math.min(Math.round(subtotal * 0.2), 800), freeShip: false, message: 'WELCOME20 applied!' };
  }
  if (c === 'SAVE10') {
    return { discount: Math.min(Math.round(subtotal * 0.1), 500), freeShip: false, message: 'SAVE10 applied!' };
  }
  if (c === 'FLAT100') {
    if (subtotal < 799) return { discount: 0, freeShip: false, message: 'FLAT100 needs min ₹799' };
    return { discount: 100, freeShip: false, message: 'FLAT100 applied!' };
  }
  if (c === 'FREESHIP') {
    return { discount: 0, freeShip: true, message: 'Free delivery applied!' };
  }
  return { discount: 0, freeShip: false, message: 'Invalid coupon code' };
}

// Seeded reviews so product pages never look empty.
export const SEED_REVIEWS: Review[] = [
  { id: 'r1', productId: 'p-headphones', author: 'Aarav M.', rating: 5, title: 'Superb ANC', body: 'Battery easily lasts my whole work week. ANC on metro is excellent.', date: '2026-09-12' },
  { id: 'r2', productId: 'p-headphones', author: 'Sneha K.', rating: 4, title: 'Great value', body: 'Sound is rich, cushions are soft. App EQ could be better.', date: '2026-08-30' },
  { id: 'r3', productId: 'p-sneakers', author: 'Rohan D.', rating: 5, title: 'So light!', body: 'Feels like walking on foam. True to size, great grip.', date: '2026-10-02' },
  { id: 'r4', productId: 'p-watch', author: 'Priya S.', rating: 4, title: 'Bright display', body: 'AMOLED is crisp outdoors. Calling works well.', date: '2026-09-20' },
  { id: 'r5', productId: 'p-perfume', author: 'Kavya R.', rating: 5, title: 'Lasts all day', body: 'Two sprays in the morning and I still get compliments at night.', date: '2026-10-10' },
  { id: 'r6', productId: 'p-phone', author: 'Aditya V.', rating: 5, title: 'Camera beast', body: 'Night photos are flagship level. Charging is insanely fast.', date: '2026-09-28' },
];
