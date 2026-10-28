// Checkout (simulated demo payment — no real money moves) plus the order
// confirmation screen. Before placing, the cart is reconciled with live stock.
import React, { useMemo, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useShop } from '../store';
import type { Address, PaymentMethod } from '../catalog';
import { applyCoupon } from '../catalog';
import { inr, summarizeCart, validateAddress } from '../utils';
import { Btn, COLORS, Field, PriceRow } from '../ui';

const METHODS: { id: PaymentMethod; icon: string; note: string }[] = [
  { id: 'UPI', icon: '📲', note: 'GPay / PhonePe / Paytm (demo)' },
  { id: 'Card', icon: '💳', note: 'Credit / Debit card (demo)' },
  { id: 'COD', icon: '💵', note: 'Cash on delivery (simulated)' },
];

export function Checkout() {
  const nav = useNavigation<any>();
  const { cart, productById, subtotal, couponCode, reconcileCart, placeOrder, profile } = useShop();
  // The store only renders after saved data loads, so the profile is ready here.
  const [form, setForm] = useState<Address>({
    name: profile.name, phone: profile.phone, line: profile.address, city: '', pincode: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [method, setMethod] = useState<PaymentMethod>('UPI');
  const [placing, setPlacing] = useState(false);

  const coupon = useMemo(() => applyCoupon(couponCode, subtotal), [couponCode, subtotal]);
  const sum = useMemo(
    () => summarizeCart(cart, productById, coupon.discount, coupon.freeShip),
    [cart, productById, coupon],
  );

  if (cart.length === 0) {
    return <View style={s.center}><Text>Your cart is empty.</Text></View>;
  }

  const set = (k: keyof Address, v: string) => setForm((f) => ({ ...f, [k]: v }));

  const place = () => {
    if (placing) return;
    const e = validateAddress(form);
    setErrors(e);
    if (Object.keys(e).length) {
      Alert.alert('Check address', 'Please fix the highlighted fields.');
      return;
    }
    // Stock may have changed (e.g. edited in Admin) — clamp first, place on retry.
    if (reconcileCart()) {
      Alert.alert('Cart updated', 'Some quantities changed to match available stock. Please review and place again.');
      return;
    }
    setPlacing(true);
    try {
      const order = placeOrder(form, method,
        { subtotal: sum.subtotal, discount: sum.discount, deliveryFee: sum.delivery, total: sum.total }, couponCode);
      nav.navigate('Confirmation', { orderId: order.id });
    } finally {
      setPlacing(false);
    }
  };

  return (
    <ScrollView style={s.page} keyboardShouldPersistTaps="handled">
      <View style={s.box}>
        <Text style={s.h}>Delivery Address</Text>
        <Field label="Full name" value={form.name} onChange={(v) => set('name', v)} placeholder="e.g. Aarav Mehta" error={errors.name} />
        <Field label="Phone" value={form.phone} onChange={(v) => set('phone', v)} placeholder="10-digit mobile" keyboard="phone-pad" error={errors.phone} />
        <Field label="Address" value={form.line} onChange={(v) => set('line', v)} placeholder="House no, street, area" multiline error={errors.line} />
        <View style={s.two}>
          <View style={{ flex: 1, marginRight: 8 }}>
            <Field label="City" value={form.city} onChange={(v) => set('city', v)} placeholder="City" error={errors.city} />
          </View>
          <View style={{ flex: 1 }}>
            <Field label="Pincode" value={form.pincode} onChange={(v) => set('pincode', v)} placeholder="6-digit" keyboard="numeric" error={errors.pincode} />
          </View>
        </View>
      </View>

      <View style={s.box}>
        <Text style={s.h}>Payment Method (simulated)</Text>
        <Text style={s.sim}>🧪 Demo checkout — no real money moves.</Text>
        {METHODS.map((m) => (
          <TouchableOpacity key={m.id} onPress={() => setMethod(m.id)} style={[s.pay, method === m.id && s.payOn]}>
            <Text style={s.payIcon}>{m.icon}</Text>
            <View style={{ flex: 1 }}>
              <Text style={s.payTitle}>{m.id}</Text>
              <Text style={s.paySub}>{m.note}</Text>
            </View>
            <View style={[s.radio, method === m.id && s.radioOn]}>
              {method === m.id && <View style={s.dot} />}
            </View>
          </TouchableOpacity>
        ))}
      </View>

      <View style={s.box}>
        <Text style={s.h}>Order Summary</Text>
        {cart.map((it) => {
          const p = productById(it.productId);
          if (!p) return null;
          return (
            <View key={it.productId} style={s.line}>
              <Text style={s.lineText} numberOfLines={1}>{it.qty} × {p.name}</Text>
              <Text style={s.lineVal}>{inr(p.price * it.qty)}</Text>
            </View>
          );
        })}
        <View style={s.div} />
        <PriceRow label="Subtotal" value={inr(sum.subtotal)} />
        <PriceRow label={couponCode ? `Coupon (${couponCode})` : 'Discount'} value={sum.discount > 0 ? '− ' + inr(sum.discount) : '—'} green />
        <PriceRow label="Delivery" value={sum.delivery === 0 ? 'FREE' : inr(sum.delivery)} green={sum.delivery === 0} />
        <View style={s.div} />
        <PriceRow label="Total" value={inr(sum.total)} bold />
        <View style={{ marginTop: 12 }}>
          <Btn title={placing ? 'Placing…' : `Place Order · ${inr(sum.total)}`} onPress={place} disabled={placing} />
        </View>
      </View>
      <View style={{ height: 24 }} />
    </ScrollView>
  );
}

export function Confirmation() {
  const nav = useNavigation<any>();
  const route = useRoute<any>();
  const { orders } = useShop();
  const order = orders.find((o) => o.id === route.params?.orderId);

  return (
    <View style={s.done}>
      <Text style={s.tick}>✅</Text>
      <Text style={s.doneTitle}>Order placed!</Text>
      <Text style={s.doneSub}>
        {order ? `Order ${order.id} · ${inr(order.total)} via ${order.payment}.` : 'Your order was placed.'}
      </Text>
      <Text style={s.doneNote}>Demo checkout — no real payment was processed. Track your simulated delivery below.</Text>
      <View style={s.doneBtn}>
        {order && <Btn title="Track My Order" onPress={() => nav.navigate('Tracking', { orderId: order.id })} />}
      </View>
      <View style={s.doneBtn}>
        <Btn title="Continue Shopping" kind="outline" onPress={() => nav.navigate('Tabs', { screen: 'Home' })} />
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  page: { flex: 1, backgroundColor: COLORS.background },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  box: { backgroundColor: '#fff', marginHorizontal: 16, marginTop: 12, borderRadius: 12, padding: 14, borderWidth: 1, borderColor: COLORS.border },
  h: { fontWeight: '800', fontSize: 16, color: COLORS.text, marginBottom: 10 },
  two: { flexDirection: 'row' },
  sim: { fontSize: 12.5, color: COLORS.warning, fontWeight: '700', marginBottom: 10 },
  pay: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: COLORS.border, borderRadius: 12, padding: 12, marginBottom: 8 },
  payOn: { borderColor: COLORS.primary, backgroundColor: COLORS.primarySoft },
  payIcon: { fontSize: 22, marginRight: 10 },
  payTitle: { fontWeight: '800', color: COLORS.text },
  paySub: { fontSize: 12, color: COLORS.muted },
  radio: { width: 20, height: 20, borderRadius: 10, borderWidth: 2, borderColor: COLORS.border, alignItems: 'center', justifyContent: 'center' },
  radioOn: { borderColor: COLORS.primary },
  dot: { width: 10, height: 10, borderRadius: 5, backgroundColor: COLORS.primary },
  line: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 3 },
  lineText: { flex: 1, fontSize: 13, color: COLORS.text },
  lineVal: { fontSize: 13, fontWeight: '700', color: COLORS.text, marginLeft: 8 },
  div: { height: 1, backgroundColor: COLORS.border, marginVertical: 8 },
  done: { flex: 1, backgroundColor: COLORS.background, alignItems: 'center', justifyContent: 'center', padding: 28 },
  tick: { fontSize: 72 },
  doneTitle: { fontSize: 24, fontWeight: '900', color: COLORS.text, marginTop: 12 },
  doneSub: { fontSize: 14, color: COLORS.muted, textAlign: 'center', marginTop: 8, lineHeight: 21 },
  doneNote: { fontSize: 12.5, color: COLORS.warning, textAlign: 'center', marginTop: 10, fontWeight: '600' },
  doneBtn: { width: '100%', marginTop: 12 },
});
