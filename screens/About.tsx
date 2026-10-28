// About the store plus the customer-support form (both describe ShopSphere).
import React, { useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useShop } from '../store';
import { validateContact } from '../utils';
import { Btn, COLORS, Field } from '../ui';

const TOPICS = ['Order help', 'Returns', 'Coupons', 'Product question', 'Other'];

export default function About() {
  const nav = useNavigation<any>();
  return (
    <ScrollView style={s.page}>
      <View style={s.hero}>
        <Text style={s.logo}>ShopSphere</Text>
        <Text style={s.tag}>Everything you love, delivered.</Text>
      </View>
      <View style={s.box}>
        <Text style={s.h}>About this app</Text>
        <Text style={s.p}>
          ShopSphere is a demo e-commerce app built with React Native and Expo. The catalogue
          (14 sample products across 6 categories), prices, stock levels, ratings and reviews
          are all sample data bundled with the app — there is no real store behind it.
        </Text>
        <Text style={s.p}>
          You can browse banners and categories, search with filters, read and write reviews,
          apply demo coupons, check out with a simulated payment, and follow your order on a
          simulated tracking timeline. Everything you do is stored only on this device.
        </Text>
      </View>
      <View style={s.nums}>
        {([['14', 'Sample products'], ['6', 'Categories'], ['4', 'Demo coupons'], ['₹0', 'Real payments']] as const).map(([v, k]) => (
          <View key={k} style={s.num}><Text style={s.numVal}>{v}</Text><Text style={s.numKey}>{k}</Text></View>
        ))}
      </View>
      <View style={s.box}>
        <Text style={s.h}>Good to know</Text>
        {[
          '🧪 Checkout is simulated — UPI, Card and COD move no real money.',
          '🚚 Delivery is ₹49 below ₹999 and free above it (demo rule).',
          '🎟️ Working demo codes: WELCOME20, SAVE10, FLAT100, FREESHIP.',
          '🔒 Cart, orders and settings stay on this device (AsyncStorage).',
        ].map((t) => <Text key={t} style={s.bullet}>{t}</Text>)}
      </View>
      <View style={s.box}>
        <Text style={s.h}>Support</Text>
        <Text style={s.p}>There is no real support team — the Help form saves your message on this device so you can demo the flow.</Text>
        <View style={{ marginTop: 10 }}>
          <Btn title="Contact Support" onPress={() => nav.navigate('Contact')} />
        </View>
      </View>
      <View style={{ height: 24 }} />
    </ScrollView>
  );
}

export function Contact() {
  const { profile, addSupport, supportMessages } = useShop();
  const [name, setName] = useState(profile.name);
  const [email, setEmail] = useState(profile.email);
  const [orderId, setOrderId] = useState('');
  const [topic, setTopic] = useState(TOPICS[0]);
  const [message, setMessage] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [ticket, setTicket] = useState<string | null>(null);

  const submit = () => {
    const e = validateContact({ name, email, message });
    setErrors(e);
    if (Object.keys(e).length) return;
    const id = 'TKT' + Date.now().toString().slice(-6);
    addSupport({ name: name.trim(), email: email.trim(), topic: `${topic}${orderId ? ' · ' + orderId.trim() : ''}`, message: message.trim() });
    setTicket(id);
    setMessage('');
    Alert.alert('Saved on this device', `Ticket ${id} stored locally (demo) — no email is sent anywhere.`);
  };

  return (
    <ScrollView style={s.page} keyboardShouldPersistTaps="handled">
      <View style={s.box}>
        <Text style={s.big}>Talk to the store 💬</Text>
        <Text style={s.sub}>Questions about an order or coupon? This demo form saves your message on this device only — nothing is sent.</Text>
        <Field label="Your name" value={name} onChange={setName} placeholder="Full name" error={errors.name} />
        <Field label="Email" value={email} onChange={setEmail} placeholder="you@example.com" keyboard="email-address" error={errors.email} />
        <Field label="Order ID (optional)" value={orderId} onChange={setOrderId} placeholder="e.g. ORD12345678" />
        <Text style={s.label}>Topic</Text>
        <View style={s.chips}>
          {TOPICS.map((t) => (
            <TouchableOpacity key={t} onPress={() => setTopic(t)} style={[s.chip, topic === t && s.chipOn]}>
              <Text style={[s.chipText, topic === t && s.chipTextOn]}>{t}</Text>
            </TouchableOpacity>
          ))}
        </View>
        <Field label="Message" value={message} onChange={setMessage} placeholder="How can we help?" multiline error={errors.message} />
        <Btn title="Send Message" onPress={submit} />
        {ticket && <Text style={s.ok}>✓ Ticket {ticket} saved on this device.</Text>}
      </View>
      {supportMessages.length > 0 && (
        <View style={s.box}>
          <Text style={s.h}>Previous messages (this device)</Text>
          {supportMessages.map((m) => (
            <View key={m.id} style={s.msg}>
              <Text style={s.msgTitle}>{m.topic}</Text>
              <Text style={s.msgBody} numberOfLines={2}>{m.message}</Text>
              <Text style={s.msgDate}>{new Date(m.date).toLocaleDateString('en-IN')} · {m.name}</Text>
            </View>
          ))}
        </View>
      )}
      <View style={{ height: 24 }} />
    </ScrollView>
  );
}

const s = StyleSheet.create({
  page: { flex: 1, backgroundColor: COLORS.background },
  hero: { backgroundColor: COLORS.primary, padding: 28, borderBottomLeftRadius: 24, borderBottomRightRadius: 24, alignItems: 'center' },
  logo: { fontSize: 32, fontWeight: '900', color: '#fff' },
  tag: { color: '#E0E7FF', marginTop: 4, fontSize: 13.5 },
  box: { backgroundColor: '#fff', marginHorizontal: 16, marginTop: 12, borderRadius: 12, padding: 16, borderWidth: 1, borderColor: COLORS.border },
  h: { fontWeight: '800', fontSize: 16, color: COLORS.text, marginBottom: 8 },
  big: { fontWeight: '800', fontSize: 17, color: COLORS.text },
  sub: { fontSize: 13, color: COLORS.muted, marginVertical: 8, lineHeight: 19 },
  p: { fontSize: 13.5, color: '#374151', lineHeight: 21, marginBottom: 8 },
  nums: { flexDirection: 'row', paddingHorizontal: 12, marginTop: 12 },
  num: { flex: 1, backgroundColor: '#fff', borderRadius: 12, marginHorizontal: 4, paddingVertical: 14, alignItems: 'center', borderWidth: 1, borderColor: COLORS.border },
  numVal: { fontSize: 17, fontWeight: '900', color: COLORS.primary },
  numKey: { fontSize: 11, color: COLORS.muted, marginTop: 2 },
  bullet: { fontSize: 13.5, color: '#374151', marginBottom: 6, lineHeight: 20 },
  label: { fontSize: 13, fontWeight: '700', color: COLORS.text, marginBottom: 6 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: 4 },
  chip: { borderWidth: 1, borderColor: COLORS.border, borderRadius: 16, paddingHorizontal: 12, paddingVertical: 7, marginRight: 8, marginBottom: 8 },
  chipOn: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  chipText: { fontSize: 12.5, fontWeight: '700', color: COLORS.text },
  chipTextOn: { color: '#fff' },
  ok: { marginTop: 10, color: COLORS.success, fontWeight: '700', fontSize: 13 },
  msg: { borderTopWidth: 1, borderTopColor: '#F1F2F6', paddingVertical: 8 },
  msgTitle: { fontWeight: '700', fontSize: 13.5, color: COLORS.text },
  msgBody: { fontSize: 13, color: '#374151', marginTop: 2 },
  msgDate: { fontSize: 11.5, color: COLORS.muted, marginTop: 2 },
});
