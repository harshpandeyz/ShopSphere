// Search tab: live text search plus category, price-band and sort controls.
import React, { useMemo, useState } from 'react';
import { FlatList, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useShop } from '../store';
import { CATEGORIES } from '../catalog';
import { Chip, COLORS, Empty, ProductCard, Screen } from '../ui';

type PriceBand = 'All' | 'Under ₹1k' | '₹1k–₹5k' | 'Above ₹5k';
type SortKey = 'Popular' | 'Price ↑' | 'Price ↓' | 'Rating';
const BANDS: PriceBand[] = ['All', 'Under ₹1k', '₹1k–₹5k', 'Above ₹5k'];
const SORTS: SortKey[] = ['Popular', 'Price ↑', 'Price ↓', 'Rating'];

export default function Search() {
  const nav = useNavigation<any>();
  const { products, toggleWishlist, isWishlisted, ratingFor } = useShop();
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState<string>('All');
  const [band, setBand] = useState<PriceBand>('All');
  const [sort, setSort] = useState<SortKey>('Popular');

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    const list = products.filter((p) => {
      const hitQ = !q || `${p.name} ${p.brand} ${p.category} ${p.tags.join(' ')}`.toLowerCase().includes(q);
      const hitC = category === 'All' || p.category === category;
      const hitB = band === 'All'
        || (band === 'Under ₹1k' && p.price < 1000)
        || (band === '₹1k–₹5k' && p.price >= 1000 && p.price <= 5000)
        || (band === 'Above ₹5k' && p.price > 5000);
      return hitQ && hitC && hitB;
    });
    return [...list].sort((a, b) => {
      if (sort === 'Price ↑') return a.price - b.price;
      if (sort === 'Price ↓') return b.price - a.price;
      if (sort === 'Rating') return b.rating - a.rating;
      return (b.featured ? 1 : 0) - (a.featured ? 1 : 0) || b.reviewCount - a.reviewCount;
    });
  }, [products, query, category, band, sort]);

  const clear = () => { setQuery(''); setCategory('All'); setBand('All'); setSort('Popular'); };

  return (
    <Screen>
      <ScrollView keyboardShouldPersistTaps="handled">
        <View style={s.searchBox}>
          <Text style={s.searchIcon}>🔍</Text>
          <TextInput
            value={query} onChangeText={setQuery} placeholder="Search headphones, sneakers, lamps…"
            placeholderTextColor="#9CA3AF" style={s.input}
          />
          {query.length > 0 && (
            <Text style={s.countInline}>{results.length} found</Text>
          )}
        </View>

        <Text style={s.label}>Category</Text>
        <FlatList horizontal showsHorizontalScrollIndicator={false}
          data={CATEGORIES as unknown as string[]} keyExtractor={(c) => c}
          contentContainerStyle={{ paddingHorizontal: 16 }}
          renderItem={({ item }) => <Chip label={item} active={category === item} onPress={() => setCategory(item)} />}
        />

        <Text style={s.label}>Price</Text>
        <View style={s.row}>
          {BANDS.map((b) => (
            <TouchableOpacity key={b} onPress={() => setBand(b)} style={[s.pill, band === b && s.pillOn]}>
              <Text style={[s.pillText, band === b && s.pillTextOn]}>{b}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={s.label}>Sort by</Text>
        <View style={s.row}>
          {SORTS.map((o) => (
            <TouchableOpacity key={o} onPress={() => setSort(o)} style={[s.pill, sort === o && s.pillOn]}>
              <Text style={[s.pillText, sort === o && s.pillTextOn]}>{o}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={s.count}>{results.length} result{results.length === 1 ? '' : 's'}</Text>
        {results.length === 0 ? (
          <Empty icon="🔍" title="No products found" subtitle="Try a different keyword, category or price band." cta="Clear filters" onCta={clear} />
        ) : (
          <View style={s.grid}>
            {results.map((p) => (
              <View key={p.id} style={s.cell}>
                <ProductCard product={p} rating={ratingFor(p).avg} onPress={() => nav.navigate('Product', { productId: p.id })}
                  onWishlist={() => toggleWishlist(p.id)} wishlisted={isWishlisted(p.id)} />
              </View>
            ))}
          </View>
        )}
        <View style={{ height: 24 }} />
      </ScrollView>
    </Screen>
  );
}

const s = StyleSheet.create({
  searchBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', margin: 16, borderRadius: 12, borderWidth: 1, borderColor: COLORS.border, paddingHorizontal: 12 },
  searchIcon: { fontSize: 17, marginRight: 8 },
  input: { flex: 1, paddingVertical: 13, fontSize: 15, color: COLORS.text },
  countInline: { fontSize: 12.5, fontWeight: '700', color: COLORS.primary, paddingLeft: 8 },
  label: { fontSize: 13, fontWeight: '800', color: COLORS.text, paddingHorizontal: 16, marginTop: 6, marginBottom: 8 },
  row: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 16 },
  pill: { backgroundColor: '#fff', borderWidth: 1, borderColor: COLORS.border, borderRadius: 20, paddingHorizontal: 13, paddingVertical: 8, marginRight: 8, marginBottom: 8 },
  pillOn: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  pillText: { fontSize: 12.5, fontWeight: '700', color: COLORS.text },
  pillTextOn: { color: '#fff' },
  count: { paddingHorizontal: 16, marginTop: 12, marginBottom: 4, color: COLORS.muted, fontSize: 12.5, fontWeight: '600' },
  grid: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 10 },
  cell: { width: '50%', padding: 6 },
});
