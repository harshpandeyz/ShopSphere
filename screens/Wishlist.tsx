// Wishlist tab: saved items with stock-aware move-to-cart.
import React from 'react';
import { Alert, ScrollView, StyleSheet, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useShop } from '../store';
import { Btn, Empty, ProductCard, Screen } from '../ui';

export default function Wishlist() {
  const nav = useNavigation<any>();
  const { wishlist, productById, toggleWishlist, isWishlisted, addToCart, ratingFor } = useShop();
  const items = wishlist.map((id) => productById(id)).filter((p): p is NonNullable<typeof p> => !!p);

  if (items.length === 0) {
    return (
      <Screen>
        <Empty icon="♥" title="Nothing saved yet" subtitle="Tap the heart on any product to save it here for later." cta="Discover Products" onCta={() => nav.navigate('Home')} />
      </Screen>
    );
  }

  const move = (id: string) => {
    if (!addToCart(id, 1)) {
      Alert.alert('Out of stock', 'This item is unavailable right now.');
      return;
    }
    toggleWishlist(id);
  };

  return (
    <Screen>
      <ScrollView>
        <View style={s.grid}>
          {items.map((p) => (
            <View key={p.id} style={s.cell}>
              <ProductCard product={p} rating={ratingFor(p).avg} onPress={() => nav.navigate('Product', { productId: p.id })}
                onWishlist={() => toggleWishlist(p.id)} wishlisted={isWishlisted(p.id)} />
              <View style={{ marginTop: 8 }}>
                <Btn
                  title={p.stock <= 0 ? 'Out of Stock' : 'Move to Cart'}
                  onPress={() => move(p.id)} disabled={p.stock <= 0}
                />
              </View>
            </View>
          ))}
        </View>
        <View style={{ height: 24 }} />
      </ScrollView>
    </Screen>
  );
}

const s = StyleSheet.create({
  grid: { flexDirection: 'row', flexWrap: 'wrap', padding: 10 },
  cell: { width: '50%', padding: 6 },
});
