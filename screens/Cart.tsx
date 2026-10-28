// Cart tab: quantities, demo coupons and the price summary.
// Money math comes from summarizeCart() in utils — the same helper Checkout uses.
import React, { useMemo, useState } from 'react';
import { Image, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useShop } from '../store';
import { COUPONS, applyCoupon } from '../catalog';
import { inr, summarizeCart } from '../utils';
import { Btn, COLORS, Empty, PriceRow, Qty, Screen } from '../ui';

export default function Cart() {
  const nav = useNavigation<any>();
  const { cart, productById, setQty, removeFromCart, subtotal, couponCode, setCouponCode } = useShop();
  const [draft, setDraft] = useState(couponCode);
  const [msg, setMsg] = useState('');

  const coupon = useMemo(() => applyCoupon(couponCode, subtotal), [couponCode, subtotal]);
  const sum = useMemo(
    () => summarizeCart(cart, productById, coupon.discount, coupon.freeShip),
    [cart, productById, coupon],
  );

  const apply = (code: string) => {
    const r = applyCoupon(code, subtotal);
    setDraft(code);
    setMsg(r.message || 'Enter a coupon code');
    if (r.discount > 0 || r.freeShip) setCouponCode(code.trim().toUpperCase());
  };
  const removeCoupon = () => { setCouponCode(''); setDraft(''); setMsg(''); };

  if (cart.length === 0) {
    return (
      <Screen>
        <Empty icon="🛒" title="Your cart is empty" subtitle="Looks like you haven't added anything yet. Explore bestsellers!" cta="Start Shopping" onCta={() => nav.navigate('Home')} />
      </Screen>
    );
  }

  return (
    <Screen>
      <ScrollView>
        {cart.map((it) => {
          const p = productById(it.productId);
          if (!p) return null;
          const capped = Math.min(it.qty, Math.max(p.stock, 0));
          return (
            <View key={it.productId} style={s.item}>
              <TouchableOpacity onPress={() => nav.navigate('Product', { productId: p.id })}>
                <Image source={p.image} style={s.img} />
              </TouchableOpacity>
              <View style={s.info}>
                <Text style={s.name} numberOfLines={2}>{p.name}</Text>
                <Text style={s.price}>{inr(p.price)}</Text>
                {p.stock <= 0 && <Text style={s.stockWarn}>Out of stock — will be removed at checkout</Text>}
                {p.stock > 0 && capped < it.qty && <Text style={s.stockWarn}>Only {p.stock} available</Text>}
                <View style={s.row}>
                  <Qty small qty={it.qty} onChange={(q) => setQty(it.productId, q)} max={Math.max(p.stock, 1)} />
                  <TouchableOpacity onPress={() => removeFromCart(it.productId)} hitSlop={8}>
                    <Text style={s.remove}>Remove</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          );
        })}

        <View style={s.box}>
          <Text style={s.boxTitle}>Have a coupon?</Text>
          <View style={s.couponRow}>
            <TextInput value={draft} onChangeText={setDraft} placeholder="Try WELCOME20" autoCapitalize="characters"
              placeholderTextColor="#9CA3AF" style={s.couponInput} />
            <TouchableOpacity onPress={() => apply(draft)} style={s.apply}><Text style={s.applyText}>Apply</Text></TouchableOpacity>
          </View>
          {!!(msg || coupon.message) && <Text style={s.couponMsg}>{msg || coupon.message}</Text>}
          {couponCode ? (
            <TouchableOpacity onPress={removeCoupon}><Text style={s.remove}>✕ Remove {couponCode}</Text></TouchableOpacity>
          ) : (
            <View style={s.chips}>
              {COUPONS.map((c) => (
                <TouchableOpacity key={c.code} style={s.chip} onPress={() => apply(c.code)}>
                  <Text style={s.chipCode}>{c.code}</Text>
                  <Text style={s.chipLabel}>{c.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>

        <View style={s.box}>
          <Text style={s.boxTitle}>Price Summary</Text>
          <PriceRow label={`Subtotal (${sum.count} item${sum.count === 1 ? '' : 's'})`} value={inr(sum.subtotal)} />
          <PriceRow label="Coupon discount" value={sum.discount > 0 ? '− ' + inr(sum.discount) : '—'} green />
          <PriceRow label="Delivery fee" value={sum.delivery === 0 ? 'FREE' : inr(sum.delivery)} green={sum.delivery === 0} />
          <View style={s.div} />
          <PriceRow label="Total" value={inr(sum.total)} bold />
          <View style={{ marginTop: 12 }}>
            <Btn title={`Proceed to Checkout · ${inr(sum.total)}`} onPress={() => nav.navigate('Checkout')} />
          </View>
          <TouchableOpacity onPress={() => nav.navigate('Home')} style={s.continue}>
            <Text style={s.continueText}>← Continue shopping</Text>
          </TouchableOpacity>
        </View>
        <View style={{ height: 24 }} />
      </ScrollView>
    </Screen>
  );
}

const s = StyleSheet.create({
  item: { flexDirection: 'row', backgroundColor: '#fff', marginHorizontal: 16, marginTop: 12, borderRadius: 12, padding: 10, borderWidth: 1, borderColor: COLORS.border },
  img: { width: 84, height: 84, borderRadius: 10, backgroundColor: '#EDEFF7' },
  info: { flex: 1, marginLeft: 12, justifyContent: 'space-between' },
  name: { fontWeight: '700', fontSize: 13.5, color: COLORS.text },
  price: { fontWeight: '800', fontSize: 15, color: COLORS.text, marginVertical: 2 },
  stockWarn: { fontSize: 12, color: COLORS.warning, fontWeight: '700' },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  remove: { color: COLORS.danger, fontWeight: '700', fontSize: 13 },
  box: { backgroundColor: '#fff', marginHorizontal: 16, marginTop: 12, borderRadius: 12, padding: 14, borderWidth: 1, borderColor: COLORS.border },
  boxTitle: { fontWeight: '800', fontSize: 15, color: COLORS.text, marginBottom: 10 },
  couponRow: { flexDirection: 'row' },
  couponInput: { flex: 1, borderWidth: 1, borderColor: COLORS.border, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10, fontSize: 14, backgroundColor: COLORS.background },
  apply: { backgroundColor: COLORS.primary, borderRadius: 10, paddingHorizontal: 18, justifyContent: 'center', marginLeft: 8 },
  applyText: { color: '#fff', fontWeight: '800' },
  couponMsg: { marginTop: 8, fontSize: 12.5, fontWeight: '700', color: COLORS.success },
  chips: { flexDirection: 'row', flexWrap: 'wrap', marginTop: 10 },
  chip: { borderWidth: 1, borderStyle: 'dashed', borderColor: COLORS.primary, borderRadius: 10, paddingHorizontal: 10, paddingVertical: 7, marginRight: 8, marginBottom: 8, backgroundColor: COLORS.primarySoft },
  chipCode: { fontWeight: '800', fontSize: 12, color: COLORS.primary },
  chipLabel: { fontSize: 10.5, color: COLORS.muted },
  div: { height: 1, backgroundColor: COLORS.border, marginVertical: 8 },
  continue: { alignItems: 'center', marginTop: 12 },
  continueText: { color: COLORS.primary, fontWeight: '700' },
});
