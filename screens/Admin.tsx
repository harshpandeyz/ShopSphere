// Admin dashboard (demo mode): live sales stats, product and order management.
import React, { useMemo, useState } from 'react';
import { Alert, Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useShop } from '../store';
import type { Category } from '../catalog';
import { CATEGORIES } from '../catalog';
import { inr, validateNewProduct } from '../utils';
import { Btn, COLORS, Field, Qty } from '../ui';

export default function Admin() {
  const { prefs, savePrefs, products, orders, advanceOrder, cancelOrder, addProduct, updateStock, deleteProduct } = useShop();
  const [showAdd, setShowAdd] = useState(false);
  const [name, setName] = useState('');
  const [brand, setBrand] = useState('');
  const [cat, setCat] = useState<Category>('Electronics');
  const [price, setPrice] = useState('');
  const [mrp, setMrp] = useState('');
  const [stock, setStock] = useState('');
  const [desc, setDesc] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const stats = useMemo(() => {
    const live = orders.filter((o) => o.status !== 'Cancelled');
    const revenue = live.reduce((sum, o) => sum + o.total, 0);
    const items = live.reduce((sum, o) => sum + o.items.reduce((n, i) => n + i.qty, 0), 0);
    return {
      revenue, count: live.length, avg: live.length ? revenue / live.length : 0, items,
      low: products.filter((p) => p.stock > 0 && p.stock <= 10).length,
      oos: products.filter((p) => p.stock <= 0).length,
    };
  }, [orders, products]);

  if (!prefs.adminMode) {
    return (
      <View style={s.locked}>
        <Text style={s.lockIcon}>🔒</Text>
        <Text style={s.lockTitle}>Admin mode is off</Text>
        <Text style={s.lockSub}>Enable “Demo Admin Mode” in Account → Settings to manage products, orders and view sales stats.</Text>
        <Btn title="Enable Admin Mode" onPress={() => savePrefs({ ...prefs, adminMode: true })} />
      </View>
    );
  }

  const submit = () => {
    const e = validateNewProduct({ name, price, stock });
    setErrors(e);
    if (Object.keys(e).length) return;
    const p = Number(price);
    addProduct({
      name: name.trim(), brand: brand.trim() || 'ShopSphere', category: cat,
      price: p, mrp: Math.max(Number(mrp || price), p), stock: Number(stock),
      description: desc.trim() || 'New arrival at ShopSphere.',
    });
    setName(''); setBrand(''); setPrice(''); setMrp(''); setStock(''); setDesc(''); setErrors({});
    setShowAdd(false);
    Alert.alert('Added', 'Product is now live in the catalogue.');
  };

  const remove = (id: string, label: string) => {
    Alert.alert('Delete?', `Remove "${label}" from the catalogue?`, [
      { text: 'Keep', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => deleteProduct(id) },
    ]);
  };

  const terminal = (status: string) => status === 'Delivered' || status === 'Cancelled';

  return (
    <ScrollView style={s.page}>
      <Text style={s.sec}>Sales Overview</Text>
      <View style={s.stats}>
        {[
          ['Revenue', inr(stats.revenue)], ['Orders', String(stats.count)],
          ['Avg order', inr(stats.avg)], ['Items sold', String(stats.items)],
          ['Low stock', String(stats.low)], ['Out of stock', String(stats.oos)],
        ].map(([k, v]) => (
          <View key={k} style={s.stat}>
            <Text style={s.statVal}>{v}</Text>
            <Text style={s.statKey}>{k}</Text>
          </View>
        ))}
      </View>

      <View style={s.secRow}>
        <Text style={s.secTight}>Products ({products.length})</Text>
        <TouchableOpacity onPress={() => setShowAdd((v) => !v)}>
          <Text style={s.link}>{showAdd ? '✕ Close' : '+ Add product'}</Text>
        </TouchableOpacity>
      </View>
      {showAdd && (
        <View style={s.box}>
          <Field label="Name" value={name} onChange={setName} placeholder="e.g. Nimbus Earbuds Pro" error={errors.name} />
          <Field label="Brand" value={brand} onChange={setBrand} placeholder="e.g. Nimbus" />
          <Text style={s.mini}>Category</Text>
          <View style={s.chips}>
            {(CATEGORIES as unknown as string[]).filter((c) => c !== 'All').map((c) => (
              <TouchableOpacity key={c} onPress={() => setCat(c as Category)} style={[s.chip, cat === c && s.chipOn]}>
                <Text style={[s.chipText, cat === c && s.chipTextOn]}>{c}</Text>
              </TouchableOpacity>
            ))}
          </View>
          <View style={s.two}>
            <View style={{ flex: 1, marginRight: 8 }}>
              <Field label="Price ₹" value={price} onChange={setPrice} placeholder="999" keyboard="numeric" error={errors.price} />
            </View>
            <View style={{ flex: 1 }}>
              <Field label="MRP ₹" value={mrp} onChange={setMrp} placeholder="1499" keyboard="numeric" />
            </View>
          </View>
          <Field label="Opening stock (0 allowed)" value={stock} onChange={setStock} placeholder="20" keyboard="numeric" error={errors.stock} />
          <Field label="Description" value={desc} onChange={setDesc} placeholder="Short product description" multiline />
          <Btn title="Add Product" onPress={submit} />
        </View>
      )}
      {products.map((p) => (
        <View key={p.id} style={s.prow}>
          <Image source={p.image} style={s.pimg} />
          <View style={s.pmid}>
            <Text style={s.pname} numberOfLines={1}>{p.name}</Text>
            <Text style={s.pmeta}>{inr(p.price)} · stock {p.stock}</Text>
            <View style={s.pactions}>
              <Qty small qty={p.stock} onChange={(q) => updateStock(p.id, q)} />
              <TouchableOpacity onPress={() => remove(p.id, p.name)}>
                <Text style={s.del}>Delete</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      ))}

      <Text style={s.sec}>Orders ({orders.length})</Text>
      {orders.length === 0 && <Text style={s.muted}>No orders yet — place a demo order to manage it here.</Text>}
      {orders.map((o) => (
        <View key={o.id} style={s.box}>
          <View style={s.orow}>
            <Text style={s.oid}>{o.id}</Text>
            <Text style={s.ostatus}>{o.status}</Text>
          </View>
          <Text style={s.muted}>{o.items.reduce((n, i) => n + i.qty, 0)} items · {inr(o.total)} · {o.payment}</Text>
          <View style={s.orow2}>
            <TouchableOpacity
              disabled={terminal(o.status)} onPress={() => advanceOrder(o.id)}
              style={[s.adv, terminal(o.status) && s.dim]}
            >
              <Text style={s.advText}>Advance status →</Text>
            </TouchableOpacity>
            {!terminal(o.status) && (
              <TouchableOpacity onPress={() => cancelOrder(o.id)}>
                <Text style={s.del}>Cancel</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      ))}
      <View style={{ height: 28 }} />
    </ScrollView>
  );
}

const s = StyleSheet.create({
  page: { flex: 1, backgroundColor: COLORS.background },
  locked: { flex: 1, backgroundColor: COLORS.background, alignItems: 'center', justifyContent: 'center', padding: 28 },
  lockIcon: { fontSize: 56 },
  lockTitle: { fontSize: 19, fontWeight: '800', color: COLORS.text, marginTop: 10 },
  lockSub: { fontSize: 13.5, color: COLORS.muted, textAlign: 'center', marginVertical: 10, lineHeight: 20 },
  sec: { fontSize: 16, fontWeight: '800', color: COLORS.text, paddingHorizontal: 16, marginTop: 18, marginBottom: 8 },
  secTight: { fontSize: 16, fontWeight: '800', color: COLORS.text },
  secRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, marginTop: 18, marginBottom: 8 },
  link: { color: COLORS.primary, fontWeight: '800' },
  stats: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 10 },
  stat: { width: '33.33%', padding: 4 },
  statVal: { fontSize: 15, fontWeight: '900', color: COLORS.text },
  statKey: { fontSize: 11, color: COLORS.muted },
  box: { backgroundColor: '#fff', marginHorizontal: 16, marginBottom: 10, borderRadius: 12, padding: 12, borderWidth: 1, borderColor: COLORS.border },
  mini: { fontSize: 13, fontWeight: '700', marginBottom: 6, color: COLORS.text },
  chips: { flexDirection: 'row', flexWrap: 'wrap' },
  chip: { borderWidth: 1, borderColor: COLORS.border, borderRadius: 16, paddingHorizontal: 11, paddingVertical: 6, marginRight: 6, marginBottom: 6, backgroundColor: '#fff' },
  chipOn: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  chipText: { fontSize: 12, fontWeight: '700', color: COLORS.text },
  chipTextOn: { color: '#fff' },
  two: { flexDirection: 'row' },
  prow: { flexDirection: 'row', backgroundColor: '#fff', marginHorizontal: 16, marginBottom: 8, borderRadius: 12, padding: 10, borderWidth: 1, borderColor: COLORS.border },
  pimg: { width: 56, height: 56, borderRadius: 10, backgroundColor: '#EDEFF7' },
  pmid: { flex: 1, marginLeft: 10 },
  pname: { fontWeight: '700', fontSize: 13.5, color: COLORS.text },
  pmeta: { fontSize: 12, color: COLORS.muted, marginTop: 2 },
  pactions: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 6 },
  del: { color: COLORS.danger, fontWeight: '700', fontSize: 13 },
  orow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  oid: { fontWeight: '800', color: COLORS.text },
  ostatus: { fontWeight: '800', fontSize: 12, color: COLORS.primary },
  orow2: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 8 },
  adv: { backgroundColor: COLORS.primarySoft, borderRadius: 8, paddingHorizontal: 12, paddingVertical: 7 },
  advText: { color: COLORS.primary, fontWeight: '800', fontSize: 13 },
  dim: { opacity: 0.4 },
  muted: { fontSize: 12.5, color: COLORS.muted, paddingHorizontal: 16, marginTop: 2 },
});
