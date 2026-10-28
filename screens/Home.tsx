// Home tab: store header, promo banners, category filter, featured rails, full grid.
import React, { useMemo, useState } from 'react';
import { FlatList, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useShop } from '../store';
import { CATEGORIES } from '../catalog';
import { Banner, Chip, COLORS, ProductCard, Screen, SectionHead } from '../ui';

export default function Home() {
  const nav = useNavigation<any>();
  const { products, toggleWishlist, isWishlisted, cartCount, ratingFor } = useShop();
  const [category, setCategory] = useState<string>('All');

  const featured = useMemo(() => products.filter((p) => p.featured), [products]);
  const arrivals = useMemo(() => products.filter((p) => p.isNew), [products]);
  const grid = useMemo(
    () => (category === 'All' ? products : products.filter((p) => p.category === category)),
    [products, category],
  );
  const open = (id: string) => nav.navigate('Product', { productId: id });
  const goSearch = () => nav.navigate('Search');

  return (
    <Screen>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={s.header}>
          <View>
            <Text style={s.brand}>ShopSphere</Text>
            <Text style={s.tagline}>Everything you love, delivered.</Text>
          </View>
          <TouchableOpacity style={s.cartBtn} onPress={() => nav.navigate('Cart')}>
            <Text style={s.cartIcon}>🛒</Text>
            {cartCount > 0 && <View style={s.badge}><Text style={s.badgeText}>{cartCount}</Text></View>}
          </TouchableOpacity>
        </View>

        <Banner onPress={goSearch} />

        <SectionHead title="Shop by Category" />
        <FlatList
          horizontal showsHorizontalScrollIndicator={false}
          data={CATEGORIES as unknown as string[]} keyExtractor={(c) => c}
          contentContainerStyle={{ paddingHorizontal: 16 }}
          renderItem={({ item }) => <Chip label={item} active={category === item} onPress={() => setCategory(item)} />}
        />

        <SectionHead title="🔥 Featured Products" action="See all" onAction={goSearch} />
        <FlatList
          horizontal showsHorizontalScrollIndicator={false}
          data={featured} keyExtractor={(p) => p.id}
          contentContainerStyle={{ paddingHorizontal: 16 }}
          renderItem={({ item }) => (
            <ProductCard wide product={item} rating={ratingFor(item).avg} onPress={() => open(item.id)}
              onWishlist={() => toggleWishlist(item.id)} wishlisted={isWishlisted(item.id)} />
          )}
        />

        <SectionHead title="✨ New Arrivals" action="See all" onAction={goSearch} />
        <FlatList
          horizontal showsHorizontalScrollIndicator={false}
          data={arrivals} keyExtractor={(p) => p.id}
          contentContainerStyle={{ paddingHorizontal: 16 }}
          renderItem={({ item }) => (
            <ProductCard wide product={item} rating={ratingFor(item).avg} onPress={() => open(item.id)}
              onWishlist={() => toggleWishlist(item.id)} wishlisted={isWishlisted(item.id)} />
          )}
        />

        <SectionHead title={category === 'All' ? '🛍️ All Products' : `🛍️ ${category}`} action="Search & filters" onAction={goSearch} />
        <View style={s.grid}>
          {grid.map((p) => (
            <View key={p.id} style={s.cell}>
            <ProductCard product={p} rating={ratingFor(p).avg} onPress={() => open(p.id)}
              onWishlist={() => toggleWishlist(p.id)} wishlisted={isWishlisted(p.id)} />
            </View>
          ))}
        </View>
        <View style={{ height: 24 }} />
      </ScrollView>
    </Screen>
  );
}

const s = StyleSheet.create({
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, paddingTop: 18, paddingBottom: 12 },
  brand: { fontSize: 26, fontWeight: '900', color: COLORS.primary },
  tagline: { fontSize: 12.5, color: COLORS.muted, marginTop: 1 },
  cartBtn: { width: 46, height: 46, borderRadius: 23, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: COLORS.border },
  cartIcon: { fontSize: 22 },
  badge: { position: 'absolute', top: -4, right: -4, backgroundColor: COLORS.accent, minWidth: 20, height: 20, borderRadius: 10, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 4 },
  badgeText: { color: '#fff', fontSize: 11, fontWeight: '800' },
  grid: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 10 },
  cell: { width: '50%', padding: 6 },
});
