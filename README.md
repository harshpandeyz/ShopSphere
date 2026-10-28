# ShopSphere — Demo E-commerce App (React Native + Expo + TypeScript)

A small, fully working demo store: Home, Search, Product Details, Wishlist, Cart,
Coupons, Checkout, Orders + Tracking, Account, Reviews, Admin Dashboard, About and
Contact. Everything is stored on-device with AsyncStorage. All 14 product photos
and banners are bundled in `assets/images/` (Unsplash photos, free license;
visible third-party brand marks were removed), so the app works fully offline.

Checkout, payments, tracking, notifications and support replies are all openly
labelled as simulated — no real money, messages, or notifications leave the device.

## Setup & run

```bash
npm install
npx expo start --android   # launches on the already-running emulator (check: adb devices)
```

Checks:

```bash
npx tsc --noEmit   # must pass with no errors
npx expo-doctor    # diagnostics
```

No test suite ships with the template, so verification is the checks above plus
the manual emulator pass below. Demo coupons: `WELCOME20` (20% off up to ₹800,
min ₹999), `SAVE10` (10% off up to ₹500), `FLAT100` (flat ₹100 off, min ₹799),
`FREESHIP` (free delivery). Admin mode: Account → Settings → Demo Admin Mode.

## Final structure (15 source files)

```
App.tsx            entry + all navigation (bottom tabs inside a native stack)
catalog.ts         all types + 14 products + coupons + banners + seed reviews
store.tsx          global state (ShopProvider/useShop): cart, wishlist, profile,
                   orders, user reviews, admin catalogue — all persisted
ui.tsx             theme + every shared component (buttons, inputs, product
                   cards, stars, steppers, banners, review cards, price rows…)
utils.ts           money math (one shared cart summary), validation, storage
screens/Home.tsx       banners, categories, featured + new rails, product grid
screens/Search.tsx     live search + category, price and sort filters
screens/Product.tsx    details, stock status, quantity, wishlist, reviews
screens/Cart.tsx       quantities, coupons, price summary
screens/Wishlist.tsx   saved items, stock-aware move-to-cart
screens/Checkout.tsx   address + simulated payment + order confirmation
screens/Orders.tsx     order history + simulated delivery tracking
screens/Account.tsx    editable profile, photo, notification switches, menu
screens/Admin.tsx      sales stats, product add/stock/delete, order advancing
screens/About.tsx      honest demo info + on-device customer-support form
assets/images/     14 product photos, 3 banners, avatar placeholder (all local)
```

## Verified test results (emulator-5554, Expo Go, SDK 58)

- `npx tsc --noEmit` → exit 0, no errors. `npx expo-doctor` → 20/20 passed.
- Manual tap-through with screenshots, all passing: browse → product →
  add-to-cart dialog → cart; `WELCOME20` (−₹800 on ₹9,998) and `SAVE10`
  (−₹500 on ₹4,999); invalid code shows “Invalid coupon code”; delivery ₹49
  below ₹999 and FREE above, `FREESHIP` zeroes it; validated address form →
  order placed → tracking timeline with coupon line → order history.
- Cancelling an order returns its items to stock (tee 120 → 119 → 120,
  confirmed in Admin). Admin-deleted products disappear from the shop
  (search “sunglass” → 0 results). Admin add-product accepts 0 stock.
- Review submit publishes immediately, bumps the count and blends into the
  average; Buy Now jumps straight to checkout; support form stores a ticket
  and lists previous messages on-device.
- Metro log has no app errors. One `AsyncStorage … undefined key` warning at
  startup comes from the Expo Go host app: every storage key in ShopSphere is
  a string literal (enforced by `tsc`), and the single storage wrapper is only
  ever called with those keys.
