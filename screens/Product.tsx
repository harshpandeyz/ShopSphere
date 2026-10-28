// Product details: photo, price, stock, rating, quantity, cart, wishlist, reviews.
import React, { useMemo, useState } from 'react';
import { Alert, Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useShop } from '../store';
import { discountPct, inr, validateReview } from '../utils';
import { Btn, COLORS, Field, Qty, ReviewCard, Stars } from '../ui';

export default function ProductDetails() {
  const nav = useNavigation<any>();
  const route = useRoute<any>();
  const { productById, addToCart, toggleWishlist, isWishlisted, addReview, reviewsFor, profile, cart, ratingFor } = useShop();
  const product = productById(route.params?.productId);

  const [qty, setQtyLocal] = useState(1);
  const [stars, setStars] = useState(5);
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const reviews = useMemo(() => (product ? reviewsFor(product.id) : []), [product, reviewsFor]);
  if (!product) return <View style={s.center}><Text>Product not found.</Text></View>;

  const wished = isWishlisted(product.id);
  const out = product.stock <= 0;
  const pct = discountPct(product.price, product.mrp);
  const { avg: blendedRating, count: totalRatings } = ratingFor(product);
  const inCartQty = cart.find((i) => i.productId === product.id)?.qty ?? 0;

  const add = () => {
    if (out) {
      Alert.alert('Out of stock', 'This item is currently unavailable.');
      return;
    }
    const room = product.stock - inCartQty;
    if (room <= 0) {
      Alert.alert('Already in cart', 'Your cart already holds all available stock of this item.');
      return;
    }
    const n = Math.min(qty, room);
    addToCart(product.id, n);
    Alert.alert('Added to cart', `${n} × ${product.name}`, [
      { text: 'Continue', style: 'cancel' },
      { text: 'Go to Cart', onPress: () => nav.navigate('Tabs', { screen: 'Cart' }) },
    ]);
  };

  const buyNow = () => {
    if (out) {
      Alert.alert('Out of stock', 'This item is currently unavailable.');
      return;
    }
    const room = product.stock - inCartQty;
    if (room <= 0) {
      Alert.alert('Already in cart', 'Your cart already holds all available stock. Review it in your cart.');
      return;
    }
    addToCart(product.id, Math.min(qty, room));
    nav.navigate('Checkout');
  };

  const submitReview = () => {
    const e = validateReview({ rating: stars, title, body });
    setErrors(e);
    if (Object.keys(e).length) return;
    addReview({ productId: product.id, author: profile.name || 'Guest Shopper', rating: stars, title: title.trim(), body: body.trim() });
    setTitle(''); setBody(''); setStars(5);
    Alert.alert('Thanks!', 'Your review has been published.');
  };

  return (
    <ScrollView style={s.page} showsVerticalScrollIndicator={false}>
      <Image source={product.image} style={s.img} resizeMode="cover" />
      <View style={s.card}>
        <View style={s.row}>
          <Text style={s.brand}>{product.brand.toUpperCase()} · {product.category.toUpperCase()}</Text>
          <TouchableOpacity onPress={() => toggleWishlist(product.id)} hitSlop={12}>
            <Text style={[s.heart, wished && s.heartOn]}>{wished ? '♥' : '♡'}</Text>
          </TouchableOpacity>
        </View>
        <Text style={s.name}>{product.name}</Text>
        <View style={s.row}>
          <Stars rating={blendedRating} />
          <Text style={s.ratings}>· {totalRatings} ratings</Text>
        </View>
        <View style={s.priceRow}>
          <Text style={s.price}>{inr(product.price)}</Text>
          {product.mrp > product.price && <Text style={s.mrp}>{inr(product.mrp)}</Text>}
          {pct > 0 && <View style={s.off}><Text style={s.offText}>{pct}% off</Text></View>}
        </View>
        <Text style={[s.stock, out ? s.oos : s.inStock]}>
          {out ? '● Out of stock' : product.stock <= 10 ? `● Only ${product.stock} left — hurry!` : '● In stock'}
        </Text>
        <Text style={s.desc}>{product.description}</Text>

        <Text style={s.sec}>Quantity</Text>
        <Qty qty={qty} onChange={(q) => setQtyLocal(Math.max(1, Math.min(q, Math.max(product.stock, 1))))} max={Math.max(product.stock, 1)} />

        <View style={s.ctaRow}>
          <View style={{ flex: 1, marginRight: 8 }}>
            <Btn title={out ? 'Out of Stock' : 'Add to Cart'} onPress={add} kind="outline" disabled={out} />
          </View>
          <View style={{ flex: 1 }}>
            <Btn title="Buy Now" onPress={buyNow} disabled={out} />
          </View>
        </View>

        <View style={s.meta}>
          <Text style={s.metaText}>🚚 Free delivery above ₹999 (₹49 below) · 🧪 Demo store — prices and stock are sample data</Text>
        </View>

        <Text style={s.sec}>Ratings & Reviews ({reviews.length})</Text>
        {reviews.length === 0 && <Text style={s.muted}>No reviews yet — be the first to review!</Text>}
        {reviews.map((r) => <ReviewCard key={r.id} review={r} />)}

        <Text style={s.sec}>Write a review</Text>
        <Text style={s.muted}>Your rating</Text>
        <View style={s.starRow}>
          {[1, 2, 3, 4, 5].map((n) => (
            <TouchableOpacity key={n} onPress={() => setStars(n)} hitSlop={8}>
              <Text style={[s.bigStar, n <= stars && s.bigOn]}>★</Text>
            </TouchableOpacity>
          ))}
        </View>
        {!!errors.rating && <Text style={s.err}>{errors.rating}</Text>}
        <Field label="Headline" value={title} onChange={setTitle} placeholder="Sums up your experience" error={errors.title} />
        <Field label="Review" value={body} onChange={setBody} placeholder="What did you like or dislike?" multiline error={errors.body} />
        <Btn title="Submit Review" onPress={submitReview} />
        <View style={{ height: 28 }} />
      </View>
    </ScrollView>
  );
}

const s = StyleSheet.create({
  page: { flex: 1, backgroundColor: COLORS.background },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  img: { width: '100%', height: 320, backgroundColor: '#EDEFF7' },
  card: { backgroundColor: '#fff', borderTopLeftRadius: 20, borderTopRightRadius: 20, marginTop: -18, padding: 18 },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  brand: { fontSize: 11, fontWeight: '800', color: COLORS.muted, letterSpacing: 0.7 },
  heart: { fontSize: 28, color: '#C7CDD8' },
  heartOn: { color: COLORS.accent },
  name: { fontSize: 21, fontWeight: '800', color: COLORS.text, marginVertical: 6 },
  ratings: { fontSize: 12.5, color: COLORS.muted },
  priceRow: { flexDirection: 'row', alignItems: 'center', marginTop: 10 },
  price: { fontSize: 24, fontWeight: '900', color: COLORS.text },
  mrp: { fontSize: 15, color: COLORS.muted, textDecorationLine: 'line-through', marginLeft: 8 },
  off: { backgroundColor: COLORS.success, borderRadius: 6, paddingHorizontal: 8, paddingVertical: 3, marginLeft: 8 },
  offText: { color: '#fff', fontWeight: '800', fontSize: 12 },
  stock: { marginTop: 8, fontWeight: '700', fontSize: 13.5 },
  inStock: { color: COLORS.success },
  oos: { color: COLORS.danger },
  desc: { fontSize: 14, color: '#374151', lineHeight: 21, marginTop: 10 },
  sec: { fontSize: 16, fontWeight: '800', color: COLORS.text, marginTop: 20, marginBottom: 8 },
  ctaRow: { flexDirection: 'row', marginTop: 16 },
  meta: { backgroundColor: COLORS.primarySoft, borderRadius: 12, padding: 12, marginTop: 14 },
  metaText: { fontSize: 12.5, color: COLORS.primaryDark, lineHeight: 19 },
  muted: { color: COLORS.muted, fontSize: 13 },
  starRow: { flexDirection: 'row', marginVertical: 6 },
  bigStar: { fontSize: 34, color: '#D1D5DB', marginRight: 4 },
  bigOn: { color: COLORS.star },
  err: { color: COLORS.danger, fontSize: 12, marginBottom: 6 },
});
