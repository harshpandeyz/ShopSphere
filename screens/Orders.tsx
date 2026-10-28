// Orders history plus the simulated delivery-tracking screen.
import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useShop } from '../store';
import type { OrderStatus } from '../catalog';
import { inr } from '../utils';
import { Btn, COLORS, Empty, PriceRow } from '../ui';

const BADGE: Record<OrderStatus, string> = {
  Placed: '#4F46E5', Packed: '#7C3AED', Shipped: '#0284C7',
  'Out for delivery': '#D97706', Delivered: '#10B981', Cancelled: '#EF4444',
};

const STEPS = ['Placed', 'Packed', 'Shipped', 'Out for delivery', 'Delivered'] as const;

export default function Orders() {
  const nav = useNavigation<any>();
  const { orders, cancelOrder } = useShop();

  if (orders.length === 0) {
    return (
      <View style={s.page}>
        <Empty icon="📦" title="No orders yet" subtitle="Your placed orders will appear here with live demo tracking." cta="Shop Now" onCta={() => nav.navigate('Tabs', { screen: 'Home' })} />
      </View>
    );
  }

  return (
    <ScrollView style={s.page}>
      {orders.map((o) => (
        <TouchableOpacity key={o.id} activeOpacity={0.85} onPress={() => nav.navigate('Tracking', { orderId: o.id })} style={s.card}>
          <View style={s.row}>
            <Text style={s.id}>{o.id}</Text>
            <View style={[s.badge, { backgroundColor: BADGE[o.status] }]}>
              <Text style={s.badgeText}>{o.status}</Text>
            </View>
          </View>
          <Text style={s.meta}>
            {new Date(o.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })} ·{' '}
            {o.items.reduce((n, i) => n + i.qty, 0)} items · {o.payment}
          </Text>
          <Text style={s.total}>{inr(o.total)}</Text>
          <View style={s.row}>
            <Text style={s.link}>View & track ›</Text>
            {o.status !== 'Delivered' && o.status !== 'Cancelled' && (
              <TouchableOpacity onPress={() => cancelOrder(o.id)} hitSlop={8}>
                <Text style={s.cancel}>Cancel order</Text>
              </TouchableOpacity>
            )}
          </View>
        </TouchableOpacity>
      ))}
      <View style={{ alignItems: 'center', marginVertical: 16 }}>
        <Btn title="Continue Shopping" kind="outline" onPress={() => nav.navigate('Tabs', { screen: 'Home' })} />
      </View>
    </ScrollView>
  );
}

export function Tracking() {
  const route = useRoute<any>();
  const { orders } = useShop();
  const order = orders.find((o) => o.id === route.params?.orderId);
  if (!order) return <View style={s.center}><Text>Order not found.</Text></View>;

  const idx = order.status === 'Cancelled' ? -1 : (STEPS as readonly string[]).indexOf(order.status);

  return (
    <ScrollView style={s.page}>
      <View style={s.box}>
        <Text style={s.h}>{order.id}</Text>
        <Text style={s.muted}>Placed {new Date(order.date).toLocaleString('en-IN')} · {order.payment}</Text>
        {order.coupon && <Text style={s.coupon}>Coupon applied: {order.coupon}</Text>}
        {order.status === 'Cancelled' ? (
          <Text style={s.cancelled}>This order was cancelled.</Text>
        ) : (
          <View style={s.timeline}>
            {STEPS.map((step, i) => (
              <View key={step} style={s.step}>
                <View style={s.dotCol}>
                  <View style={[s.dot, i <= idx && s.dotOn]}><Text style={s.dotText}>{i <= idx ? '✓' : ''}</Text></View>
                  {i < STEPS.length - 1 && <View style={[s.line, i < idx && s.lineOn]} />}
                </View>
                <View style={s.stepBody}>
                  <Text style={[s.stepText, i <= idx && s.stepTextOn]}>{step}</Text>
                  {i === idx && <Text style={s.muted}>Current status (simulated demo)</Text>}
                </View>
              </View>
            ))}
          </View>
        )}
        <Text style={s.fine}>🧪 Simulated delivery tracking for demo — not real logistics.</Text>
      </View>

      <View style={s.box}>
        <Text style={s.h}>Items</Text>
        {order.items.map((it, i) => (
          <View key={i} style={s.itemRow}>
            <Text style={s.itemText} numberOfLines={1}>{it.qty} × {it.name}</Text>
            <Text style={s.itemVal}>{inr(it.price * it.qty)}</Text>
          </View>
        ))}
        <View style={s.div} />
        <PriceRow label="Subtotal" value={inr(order.subtotal)} />
        <PriceRow label="Discount" value={order.discount > 0 ? '− ' + inr(order.discount) : '—'} green />
        <PriceRow label="Delivery" value={order.deliveryFee === 0 ? 'FREE' : inr(order.deliveryFee)} />
        <PriceRow label="Total" value={inr(order.total)} bold />
      </View>

      <View style={s.box}>
        <Text style={s.h}>Deliver to</Text>
        <Text style={s.addr}>{order.address.name} · {order.address.phone}</Text>
        <Text style={s.addr}>{order.address.line}, {order.address.city} — {order.address.pincode}</Text>
      </View>
      <View style={{ height: 24 }} />
    </ScrollView>
  );
}

const s = StyleSheet.create({
  page: { flex: 1, backgroundColor: COLORS.background },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  card: { backgroundColor: '#fff', marginHorizontal: 16, marginTop: 12, borderRadius: 12, padding: 14, borderWidth: 1, borderColor: COLORS.border },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  id: { fontWeight: '800', color: COLORS.text },
  badge: { borderRadius: 20, paddingHorizontal: 10, paddingVertical: 4 },
  badgeText: { color: '#fff', fontSize: 11, fontWeight: '800' },
  meta: { fontSize: 12.5, color: COLORS.muted, marginTop: 6 },
  total: { fontSize: 17, fontWeight: '800', color: COLORS.text, marginTop: 4 },
  link: { color: COLORS.primary, fontWeight: '700', marginTop: 8 },
  cancel: { color: COLORS.danger, fontWeight: '700', marginTop: 8 },
  box: { backgroundColor: '#fff', marginHorizontal: 16, marginTop: 12, borderRadius: 12, padding: 14, borderWidth: 1, borderColor: COLORS.border },
  h: { fontWeight: '800', fontSize: 16, color: COLORS.text },
  muted: { fontSize: 12.5, color: COLORS.muted, marginTop: 2 },
  coupon: { marginTop: 6, fontWeight: '700', color: COLORS.primary, fontSize: 13 },
  cancelled: { marginTop: 10, color: COLORS.danger, fontWeight: '800' },
  fine: { marginTop: 10, fontSize: 12, color: COLORS.warning, fontWeight: '600' },
  timeline: { marginTop: 14 },
  step: { flexDirection: 'row' },
  dotCol: { alignItems: 'center', width: 28 },
  dot: { width: 26, height: 26, borderRadius: 13, backgroundColor: '#E5E7EB', alignItems: 'center', justifyContent: 'center' },
  dotOn: { backgroundColor: COLORS.success },
  dotText: { color: '#fff', fontWeight: '800', fontSize: 13 },
  line: { width: 3, flex: 1, minHeight: 22, backgroundColor: '#E5E7EB' },
  lineOn: { backgroundColor: COLORS.success },
  stepBody: { marginLeft: 10, paddingBottom: 14 },
  stepText: { fontWeight: '700', color: COLORS.muted },
  stepTextOn: { color: COLORS.text },
  itemRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 3 },
  itemText: { flex: 1, fontSize: 13, color: COLORS.text },
  itemVal: { fontWeight: '700', fontSize: 13, marginLeft: 8 },
  div: { height: 1, backgroundColor: COLORS.border, marginVertical: 8 },
  addr: { fontSize: 13.5, color: COLORS.text, marginTop: 4, lineHeight: 20 },
});
