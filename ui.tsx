// Shared look and reusable components: one theme plus the small building blocks
// every screen is made of (buttons, inputs, product cards, stars, steppers…).
import React, { useState } from 'react';
import {
  Dimensions, Image, NativeScrollEvent, NativeSyntheticEvent, ScrollView,
  StyleSheet, Text, TextInput, TouchableOpacity, View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { Product, Review } from './catalog';
import { BANNERS } from './catalog';
import { discountPct, inr } from './utils';

export const COLORS = {
  primary: '#4F46E5',
  primaryDark: '#3730A3',
  primarySoft: '#EEF2FF',
  accent: '#FF6B6B',
  background: '#F6F7FB',
  card: '#FFFFFF',
  text: '#111827',
  muted: '#6B7280',
  border: '#E5E7EB',
  success: '#10B981',
  warning: '#F59E0B',
  danger: '#EF4444',
  star: '#FBBF24',
};

const SHADOW = {
  elevation: 2, shadowColor: '#000', shadowOpacity: 0.06,
  shadowRadius: 8, shadowOffset: { width: 0, height: 2 },
} as const;

/** Screen wrapper: safe-area aware page with the app background. */
export function Screen({ children }: { children: React.ReactNode }) {
  return <SafeAreaView style={s.screen} edges={['left', 'right']}>{children}</SafeAreaView>;
}

/** Primary / outline / danger button. */
export function Btn({ title, onPress, kind, disabled }: {
  title: string; onPress: () => void; kind?: 'primary' | 'outline' | 'danger'; disabled?: boolean;
}) {
  return (
    <TouchableOpacity
      activeOpacity={0.8} onPress={onPress} disabled={disabled}
      style={[s.btn, kind === 'outline' && s.btnOutline, kind === 'danger' && s.btnDanger, disabled && s.dim]}
    >
      <Text style={[s.btnText, kind === 'outline' && s.btnTextOutline]}>{title}</Text>
    </TouchableOpacity>
  );
}

/** Labelled text input with an optional error message. */
export function Field({ label, value, onChange, placeholder, error, keyboard, multiline }: {
  label?: string; value: string; onChange: (t: string) => void; placeholder?: string;
  error?: string; keyboard?: 'default' | 'numeric' | 'email-address' | 'phone-pad'; multiline?: boolean;
}) {
  return (
    <View style={s.fieldWrap}>
      {!!label && <Text style={s.fieldLabel}>{label}</Text>}
      <TextInput
        value={value} onChangeText={onChange} placeholder={placeholder}
        placeholderTextColor="#9CA3AF" keyboardType={keyboard ?? 'default'}
        multiline={multiline} style={[s.fieldInput, multiline && s.fieldMulti, !!error && s.fieldError]}
      />
      {!!error && <Text style={s.fieldErr}>{error}</Text>}
    </View>
  );
}

/** Star rating display. */
export function Stars({ rating, size = 14 }: { rating: number; size?: number }) {
  const full = Math.floor(rating);
  const half = rating - full >= 0.5;
  const glyphs = [0, 1, 2, 3, 4].map((i) => (i < full ? '★' : i === full && half ? '⯪' : '☆')).join('');
  return (
    <View style={s.starsRow}>
      <Text style={[s.stars, { fontSize: size }]}>{glyphs}</Text>
      <Text style={s.starsVal}>{rating.toFixed(1)}</Text>
    </View>
  );
}

/** Quantity stepper (− qty +). */
export function Qty({ qty, onChange, small, max = 99 }: {
  qty: number; onChange: (q: number) => void; small?: boolean; max?: number;
}) {
  return (
    <View style={[s.qtyRow, small && s.qtySmall]}>
      <TouchableOpacity style={[s.qtyBtn, small && s.qtyBtnSmall]} onPress={() => onChange(qty - 1)}>
        <Text style={s.qtyBtnText}>−</Text>
      </TouchableOpacity>
      <Text style={s.qtyVal}>{qty}</Text>
      <TouchableOpacity style={[s.qtyBtn, small && s.qtyBtnSmall]} onPress={() => onChange(Math.min(qty + 1, max))}>
        <Text style={s.qtyBtnText}>+</Text>
      </TouchableOpacity>
    </View>
  );
}

/** Product card for grids and horizontal rails. Rating comes from the caller
 * (blended seed + user average) so cards and detail pages always agree. */
export function ProductCard({ product, rating, onPress, onWishlist, wishlisted, wide }: {
  product: Product; rating: number; onPress: () => void; onWishlist: () => void; wishlisted: boolean; wide?: boolean;
}) {
  const pct = discountPct(product.price, product.mrp);
  return (
    <TouchableOpacity activeOpacity={0.85} onPress={onPress} style={[s.card, wide && s.cardWide]}>
      <View>
        <Image source={product.image} style={[s.cardImg, wide && s.cardImgWide]} resizeMode="cover" />
        <TouchableOpacity onPress={onWishlist} style={s.heart} hitSlop={10}>
          <Text style={[s.heartText, wishlisted && s.heartOn]}>{wishlisted ? '♥' : '♡'}</Text>
        </TouchableOpacity>
        {pct > 0 && <View style={s.off}><Text style={s.offText}>{pct}% OFF</Text></View>}
        {product.stock <= 0 && <View style={s.oos}><Text style={s.oosText}>OUT OF STOCK</Text></View>}
      </View>
      <View style={s.cardBody}>
        <Text style={s.cardBrand}>{product.brand.toUpperCase()}</Text>
        <Text style={s.cardName} numberOfLines={2}>{product.name}</Text>
        <Stars rating={rating} size={12} />
        <View style={s.cardPriceRow}>
          <Text style={s.cardPrice}>{inr(product.price)}</Text>
          {product.mrp > product.price && <Text style={s.cardMrp}>{inr(product.mrp)}</Text>}
        </View>
      </View>
    </TouchableOpacity>
  );
}

/** Category pill. */
export function Chip({ label, active, onPress }: { label: string; active: boolean; onPress: () => void }) {
  const icons: Record<string, string> = {
    All: '🛍️', Electronics: '📱', Fashion: '👕', Footwear: '👟',
    Accessories: '🎒', Beauty: '💄', Home: '🏠',
  };
  return (
    <TouchableOpacity onPress={onPress} style={[s.chip, active && s.chipOn]}>
      <Text style={s.chipIcon}>{icons[label] ?? '🏷️'}</Text>
      <Text style={[s.chipText, active && s.chipTextOn]}>{label}</Text>
    </TouchableOpacity>
  );
}

/** Promo banner carousel (local images). Tapping a banner opens Search. */
export function Banner({ onPress }: { onPress: () => void }) {
  const [page, setPage] = useState(0);
  const w = Dimensions.get('window').width;
  const scrolled = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    setPage(Math.round(e.nativeEvent.contentOffset.x / (w - 32)));
  };
  return (
    <View>
      <ScrollView horizontal pagingEnabled showsHorizontalScrollIndicator={false} onMomentumScrollEnd={scrolled} style={s.bannerScroll}>
        {BANNERS.map((b) => (
          <TouchableOpacity key={b.id} activeOpacity={0.9} onPress={onPress}>
            <Image source={b.image} style={[s.bannerImg, { width: w - 32 }]} resizeMode="cover" />
          </TouchableOpacity>
        ))}
      </ScrollView>
      <View style={s.dots}>
        {BANNERS.map((b, i) => <View key={b.id} style={[s.dot, i === page && s.dotOn]} />)}
      </View>
    </View>
  );
}

/** One customer review. */
export function ReviewCard({ review }: { review: Review }) {
  return (
    <View style={s.review}>
      <View style={s.reviewHead}>
        <View style={s.avatar}><Text style={s.avatarText}>{review.author.charAt(0).toUpperCase()}</Text></View>
        <View style={{ flex: 1 }}>
          <Text style={s.reviewAuthor}>{review.author}</Text>
          <Text style={s.reviewDate}>{review.date}</Text>
        </View>
        <Stars rating={review.rating} size={12} />
      </View>
      <Text style={s.reviewTitle}>{review.title}</Text>
      <Text style={s.reviewBody}>{review.body}</Text>
    </View>
  );
}

/** Label/value money row for cart and checkout summaries. */
export function PriceRow({ label, value, bold, green }: {
  label: string; value: string; bold?: boolean; green?: boolean;
}) {
  return (
    <View style={s.priceRow}>
      <Text style={[s.priceLabel, bold && s.priceBold]}>{label}</Text>
      <Text style={[s.priceVal, bold && s.priceBold, green && s.priceGreen]}>{value}</Text>
    </View>
  );
}

/** Empty-state panel with an optional action button. */
export function Empty({ icon, title, subtitle, cta, onCta }: {
  icon: string; title: string; subtitle: string; cta?: string; onCta?: () => void;
}) {
  return (
    <View style={s.empty}>
      <Text style={s.emptyIcon}>{icon}</Text>
      <Text style={s.emptyTitle}>{title}</Text>
      <Text style={s.emptySub}>{subtitle}</Text>
      {!!cta && !!onCta && <Btn title={cta} onPress={onCta} />}
    </View>
  );
}

/** Section title with an optional trailing action. */
export function SectionHead({ title, action, onAction }: { title: string; action?: string; onAction?: () => void }) {
  return (
    <View style={s.secHead}>
      <Text style={s.secTitle}>{title}</Text>
      {!!action && (
        <TouchableOpacity onPress={onAction}>
          <Text style={s.secLink}>{action} ›</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

/** Tappable settings/menu row (used on the Account screen). */
export function MenuRow({ icon, title, sub, onPress }: {
  icon: string; title: string; sub: string; onPress: () => void;
}) {
  return (
    <TouchableOpacity onPress={onPress} style={s.menuRow}>
      <Text style={s.menuIcon}>{icon}</Text>
      <View style={s.menuMid}>
        <Text style={s.menuTitle}>{title}</Text>
        <Text style={s.menuSub}>{sub}</Text>
      </View>
      <Text style={s.menuGo}>›</Text>
    </TouchableOpacity>
  );
}

const s = StyleSheet.create({
  screen: { flex: 1, backgroundColor: COLORS.background },
  btn: { backgroundColor: COLORS.primary, borderRadius: 12, paddingVertical: 13, paddingHorizontal: 18, alignItems: 'center', justifyContent: 'center' },
  btnOutline: { backgroundColor: 'transparent', borderWidth: 1.5, borderColor: COLORS.primary },
  btnDanger: { backgroundColor: COLORS.danger },
  dim: { opacity: 0.45 },
  btnText: { color: '#fff', fontWeight: '700', fontSize: 15 },
  btnTextOutline: { color: COLORS.primary },
  fieldWrap: { marginBottom: 12 },
  fieldLabel: { fontSize: 13, fontWeight: '600', color: COLORS.text, marginBottom: 6 },
  fieldInput: { backgroundColor: '#fff', borderWidth: 1, borderColor: COLORS.border, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12, fontSize: 15, color: COLORS.text },
  fieldMulti: { height: 96, textAlignVertical: 'top' },
  fieldError: { borderColor: COLORS.danger },
  fieldErr: { color: COLORS.danger, fontSize: 12, marginTop: 4 },
  starsRow: { flexDirection: 'row', alignItems: 'center' },
  stars: { color: COLORS.star, letterSpacing: 1 },
  starsVal: { marginLeft: 5, fontSize: 12, fontWeight: '700', color: COLORS.text },
  qtyRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.primarySoft, borderRadius: 12, padding: 4 },
  qtySmall: { padding: 2 },
  qtyBtn: { width: 32, height: 32, borderRadius: 8, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center' },
  qtyBtnSmall: { width: 26, height: 26 },
  qtyBtnText: { fontSize: 18, fontWeight: '800', color: COLORS.primary },
  qtyVal: { minWidth: 30, textAlign: 'center', fontWeight: '800', fontSize: 15, color: COLORS.text },
  card: { flex: 1, backgroundColor: COLORS.card, borderRadius: 16, overflow: 'hidden', ...SHADOW },
  cardWide: { width: 168, flex: 0, marginRight: 12 },
  cardImg: { width: '100%', height: 150, backgroundColor: '#EDEFF7' },
  cardImgWide: { height: 130 },
  cardBody: { padding: 10 },
  cardBrand: { fontSize: 10, fontWeight: '800', color: COLORS.muted, letterSpacing: 0.6 },
  cardName: { fontSize: 13.5, fontWeight: '700', color: COLORS.text, marginVertical: 3, minHeight: 36 },
  cardPriceRow: { flexDirection: 'row', alignItems: 'baseline', marginTop: 4 },
  cardPrice: { fontSize: 15, fontWeight: '800', color: COLORS.text },
  cardMrp: { fontSize: 12, color: COLORS.muted, textDecorationLine: 'line-through', marginLeft: 6 },
  heart: { position: 'absolute', top: 8, right: 8, backgroundColor: 'rgba(255,255,255,0.95)', width: 30, height: 30, borderRadius: 15, alignItems: 'center', justifyContent: 'center' },
  heartText: { fontSize: 17, color: '#9CA3AF' },
  heartOn: { color: COLORS.accent },
  off: { position: 'absolute', left: 8, top: 8, backgroundColor: COLORS.success, borderRadius: 6, paddingHorizontal: 7, paddingVertical: 3 },
  offText: { color: '#fff', fontSize: 10, fontWeight: '800' },
  oos: { position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: 'rgba(0,0,0,0.65)', paddingVertical: 5, alignItems: 'center' },
  oosText: { color: '#fff', fontSize: 10, fontWeight: '800' },
  chip: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderWidth: 1, borderColor: COLORS.border, borderRadius: 24, paddingHorizontal: 14, paddingVertical: 9, marginRight: 8 },
  chipOn: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  chipIcon: { fontSize: 14, marginRight: 6 },
  chipText: { fontSize: 13, fontWeight: '700', color: COLORS.text },
  chipTextOn: { color: '#fff' },
  bannerScroll: { paddingLeft: 16 },
  bannerImg: { height: 150, borderRadius: 16, marginRight: 12, backgroundColor: COLORS.primarySoft },
  dots: { flexDirection: 'row', justifyContent: 'center', marginTop: 8 },
  dot: { width: 7, height: 7, borderRadius: 4, backgroundColor: '#D1D5DB', marginHorizontal: 3 },
  dotOn: { backgroundColor: COLORS.primary, width: 20 },
  review: { backgroundColor: '#fff', borderRadius: 12, padding: 12, marginBottom: 10, borderWidth: 1, borderColor: COLORS.border },
  reviewHead: { flexDirection: 'row', alignItems: 'center' },
  avatar: { width: 34, height: 34, borderRadius: 17, backgroundColor: COLORS.primarySoft, alignItems: 'center', justifyContent: 'center', marginRight: 10 },
  avatarText: { fontWeight: '800', color: COLORS.primary },
  reviewAuthor: { fontWeight: '700', fontSize: 13, color: COLORS.text },
  reviewDate: { fontSize: 11, color: COLORS.muted },
  reviewTitle: { fontWeight: '700', fontSize: 13.5, marginTop: 8, color: COLORS.text },
  reviewBody: { fontSize: 13, color: '#374151', marginTop: 3, lineHeight: 19 },
  priceRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 4 },
  priceLabel: { fontSize: 13.5, color: COLORS.muted },
  priceVal: { fontSize: 13.5, color: COLORS.text, fontWeight: '600' },
  priceBold: { fontSize: 16, fontWeight: '800', color: COLORS.text },
  priceGreen: { color: COLORS.success },
  empty: { alignItems: 'center', padding: 32, backgroundColor: '#fff', borderRadius: 16, margin: 16 },
  emptyIcon: { fontSize: 44, marginBottom: 10 },
  emptyTitle: { fontSize: 17, fontWeight: '800', color: COLORS.text },
  emptySub: { fontSize: 13, color: COLORS.muted, textAlign: 'center', marginVertical: 8, lineHeight: 19 },
  secHead: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, marginTop: 20, marginBottom: 10 },
  secTitle: { fontSize: 17, fontWeight: '800', color: COLORS.text },
  secLink: { fontSize: 13, fontWeight: '700', color: COLORS.primary },
  menuRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 11, borderTopWidth: 1, borderTopColor: '#F1F2F6' },
  menuIcon: { fontSize: 22, marginRight: 12 },
  menuMid: { flex: 1 },
  menuTitle: { fontWeight: '700', fontSize: 14, color: COLORS.text },
  menuSub: { fontSize: 12, color: COLORS.muted, marginTop: 1 },
  menuGo: { fontSize: 22, color: COLORS.muted },
});
