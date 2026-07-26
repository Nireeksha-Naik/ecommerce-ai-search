import React from 'react';
import { StyleSheet, Text, View, FlatList, Image, TouchableOpacity, Alert, SectionList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack } from 'expo-router';
import { useCart } from '../context/CartContext';
import { formatINR } from '@/utils/currency';

export default function CartScreen() {
  const { items, purchases, removeFromCart, removePurchase, clearCart } = useCart();

  const cartTotal = items.reduce((s, it) => s + it.quantity * it.product.price, 0);

  const sections = [];

  if (purchases.length > 0) {
    sections.push({
      title: 'Orders',
      data: purchases,
      type: 'purchases',
    });
  }

  if (items.length > 0) {
    sections.push({
      title: 'Add to Cart',
      data: items,
      type: 'cart',
    });
  }

  const isEmpty = items.length === 0 && purchases.length === 0;

  if (isEmpty) {
    return (
      <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
        <Stack.Screen options={{ title: 'Cart' }} />
        <View style={styles.container}>
          <View style={styles.empty}>
            <Text style={styles.emptyIcon}>🛒</Text>
            <Text style={styles.emptyText}>Your cart is empty</Text>
            <Text style={styles.emptySubtext}>Start shopping to add items</Text>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <Stack.Screen options={{ title: 'Cart' }} />
      <View style={styles.container}>
        <SectionList
          sections={sections}
          keyExtractor={(item: any, index) => item.product?.id || item.orderId || `${index}`}
          renderSectionHeader={({ section }) => (
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>
                {section.type === 'purchases' ? '✓ Ordered Items' : '🛒 Add to Cart'}
              </Text>
            </View>
          )}
          renderItem={({ item, section }: any) => {
            const isPurchase = section.type === 'purchases';
            return (
              <View style={styles.row}>
                <Image source={{ uri: item.product.image }} style={styles.img} />
                <View style={styles.meta}>
                  <Text style={styles.name}>{item.product.name}</Text>
                  <Text style={styles.qty}>Qty: {item.quantity}</Text>
                  <Text style={styles.price}>
                    {formatINR(item.product.price * item.quantity)}
                  </Text>
                  {isPurchase && (
                    <Text style={styles.orderInfo}>
                      Order: {(item as any).orderId.split('-')[1]}
                    </Text>
                  )}
                </View>
                <TouchableOpacity
                  onPress={() => {
                    if (isPurchase) {
                      removePurchase((item as any).orderId);
                    } else {
                      removeFromCart(item.product.id);
                    }
                  }}
                  style={styles.remove}
                >
                  <Text style={styles.removeText}>{isPurchase ? '✕' : '✕'}</Text>
                </TouchableOpacity>
              </View>
            );
          }}
        />

        {items.length > 0 && (
          <View style={styles.footer}>
            <View style={styles.totalSection}>
              <Text style={styles.total}>Subtotal: {formatINR(cartTotal)}</Text>
            </View>
            <TouchableOpacity
              style={styles.clear}
              onPress={() => {
                Alert.alert('Clear cart', 'Remove all items from cart?', [
                  { text: 'Cancel', style: 'cancel' },
                  { text: 'Clear', style: 'destructive', onPress: () => clearCart() },
                ]);
              }}
            >
              <Text style={styles.clearText}>Clear Cart</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#FFFFFF' },
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  emptyIcon: { fontSize: 64, marginBottom: 16 },
  emptyText: { color: '#1F2937', fontSize: 18, fontWeight: '700', marginBottom: 8 },
  emptySubtext: { color: '#6B7280', fontSize: 14 },
  sectionHeader: {
    backgroundColor: '#F9FAFB',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    marginTop: 12,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1F2937',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  row: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, paddingHorizontal: 12, borderBottomWidth: 1, borderBottomColor: '#F3F4F6' },
  img: { width: 72, height: 72, borderRadius: 10, backgroundColor: '#F3F4F6' },
  meta: { flex: 1, marginLeft: 12 },
  name: { fontSize: 14, fontWeight: '700', color: '#111827' },
  qty: { fontSize: 12, color: '#6B7280', marginTop: 4 },
  price: { fontSize: 13, fontWeight: '700', color: '#6366F1', marginTop: 2 },
  orderInfo: { fontSize: 11, color: '#059669', marginTop: 4, fontWeight: '600' },
  remove: { paddingHorizontal: 8, paddingVertical: 8, justifyContent: 'center', alignItems: 'center' },
  removeText: { color: '#DC2626', fontWeight: '700', fontSize: 18 },
  footer: { borderTopWidth: 1, borderTopColor: '#E5E7EB', paddingVertical: 12, paddingHorizontal: 12 },
  totalSection: { marginBottom: 12 },
  total: { fontSize: 16, fontWeight: '800', color: '#111827' },
  clear: { backgroundColor: '#FEE2E2', paddingHorizontal: 12, paddingVertical: 12, borderRadius: 10, alignItems: 'center' },
  clearText: { color: '#B91C1C', fontWeight: '700', fontSize: 15 },
});