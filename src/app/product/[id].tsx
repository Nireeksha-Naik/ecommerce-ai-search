import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { useCart } from '../../context/CartContext';
import React, { useState } from 'react';
import ProductActionBar from '../../components/ProductActionBar';
import PurchaseModal from '../../components/PurchaseModal';
import {
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { PRODUCTS } from '../../data/product';
import { formatINR } from '../../utils/currency';

export default function ProductDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { addToCart, getQuantity, buyItem } = useCart();
  const insets = useSafeAreaInsets();
  const [imgError, setImgError] = useState(false);
  const [showPurchaseModal, setShowPurchaseModal] = useState(false);
  const [lastOrderId, setLastOrderId] = useState('');

  const product = PRODUCTS.find((p) => p.id === id);

  if (!product) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <Stack.Screen options={{ title: 'Not found' }} />
        <View style={styles.notFound}>
          <Text style={styles.notFoundText}>Product not found.</Text>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Text style={styles.backButtonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const isOnSale = product.discountPrice !== undefined && product.discountPrice < product.price;
  const displayPriceUSD = isOnSale ? product.discountPrice! : product.price;

  const handleAddToCart = () => {
    if (!product.inStock) return;
    addToCart(product, 1);
    Alert.alert('✓ Added to Cart', `${product.name} has been added to your cart.`);
  };

  const handleBuyNow = () => {
    if (!product.inStock) return;
    const orderId = buyItem(product, 1);
    setLastOrderId(orderId);
    setShowPurchaseModal(true);
  };

  const handleClosePurchaseModal = () => {
    setShowPurchaseModal(false);
    router.back();
  };

  const handleViewOrder = () => {
    setShowPurchaseModal(false);
    router.push('/cart');
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      {/* Issue D: no share/more header options */}
      <Stack.Screen options={{ title: product.name, headerBackTitle: 'Back' }} />
      <ScrollView contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 100 }]}>
        <View style={styles.imageWrap}>
          {!imgError ? (
            <Image
              source={{ uri: product.image }}
              style={styles.image}
              resizeMode="cover"
              onError={() => setImgError(true)}
            />
          ) : (
            <View style={[styles.image, styles.imagePlaceholder]}>
              <Text style={styles.imagePlaceholderIcon}>🖼️</Text>
              <Text style={styles.imagePlaceholderText}>Image unavailable</Text>
            </View>
          )}
          {!product.inStock && (
            <View style={styles.outOfStockOverlay}>
              <Text style={styles.outOfStockText}>Out of Stock</Text>
            </View>
          )}
        </View>

        <View style={styles.content}>
          <Text style={styles.category}>{product.category}</Text>
          <Text style={styles.name}>{product.name}</Text>

          <View style={styles.metaRow}>
            <View style={styles.priceWrap}>
              {isOnSale ? (
                <>
                  <Text style={styles.priceDiscounted}>{formatINR(displayPriceUSD)}</Text>
                  <Text style={styles.priceOriginal}>{formatINR(product.price)}</Text>
                </>
              ) : (
                <Text style={styles.price}>{formatINR(product.price)}</Text>
              )}
            </View>
            <View style={styles.ratingPill}>
              <Text style={styles.ratingText}>⭐ {product.rating.toFixed(1)}</Text>
              <Text style={styles.reviewCountText}> ({product.reviewCount})</Text>
            </View>
          </View>

          {!product.inStock && (
            <View style={styles.stockNotice}>
              <Text style={styles.stockNoticeText}>
                This item is currently out of stock. Check back soon.
              </Text>
            </View>
          )}

          <View style={styles.tagsRow}>
            {product.tags.map((tag) => (
              <View key={tag} style={styles.tagChip}>
                <Text style={styles.tagText}>{tag}</Text>
              </View>
            ))}
          </View>

          <Text style={styles.sectionTitle}>Description</Text>
          <Text style={styles.description}>{product.description}</Text>
        </View>
      </ScrollView>

      {/* Issue C: rendered on all platforms now, not just web */}
      <ProductActionBar
        product={product}
        priceLabel={formatINR(displayPriceUSD)}
        quantity={getQuantity(product.id)}
        disabled={!product.inStock}
        onAdd={handleAddToCart}
        onBuyNow={handleBuyNow}
      />

      <PurchaseModal
        visible={showPurchaseModal}
        orderId={lastOrderId}
        productName={product.name}
        quantity={1}
        price={formatINR(displayPriceUSD)}
        onClose={handleClosePurchaseModal}
        onViewOrder={handleViewOrder}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#FFFFFF' },
  scrollContent: { paddingBottom: 24 },
  imageWrap: { position: 'relative' },
  image: { width: '100%', height: 320, backgroundColor: '#F3F4F6' },
  imagePlaceholder: { alignItems: 'center', justifyContent: 'center' },
  imagePlaceholderIcon: { fontSize: 32, marginBottom: 6 },
  imagePlaceholderText: { fontSize: 12, color: '#9CA3AF', fontWeight: '600' },
  outOfStockOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(17, 24, 39, 0.5)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  outOfStockText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
    backgroundColor: 'rgba(0,0,0,0.35)',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 10,
  },
  content: { padding: 18 },
  category: { fontSize: 11, fontWeight: '700', color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 4 },
  name: { fontSize: 22, fontWeight: '700', color: '#111827', marginBottom: 10 },
  metaRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 },
  priceWrap: { flexDirection: 'row', alignItems: 'baseline', gap: 8 },
  price: { fontSize: 24, fontWeight: '800', color: '#4F46E5' },
  priceDiscounted: { fontSize: 24, fontWeight: '800', color: '#DC2626' },
  priceOriginal: { fontSize: 15, fontWeight: '500', color: '#9CA3AF', textDecorationLine: 'line-through' },
  ratingPill: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FEF3C7', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 12 },
  ratingText: { fontSize: 13, fontWeight: '600', color: '#92400E' },
  reviewCountText: { fontSize: 12, fontWeight: '500', color: '#92400E' },
  stockNotice: { backgroundColor: '#FEF2F2', borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10, marginBottom: 14 },
  stockNoticeText: { fontSize: 12.5, color: '#991B1B', fontWeight: '500' },
  tagsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 18 },
  tagChip: { backgroundColor: '#F5F3FF', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 14 },
  tagText: { fontSize: 12, fontWeight: '600', color: '#6D28D9' },
  sectionTitle: { fontSize: 15, fontWeight: '700', color: '#111827', marginBottom: 6 },
  description: { fontSize: 14, lineHeight: 21, color: '#4B5563' },
  notFound: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  notFoundText: { fontSize: 15, color: '#6B7280', marginBottom: 12 },
  backButton: { backgroundColor: '#EEF2FF', paddingHorizontal: 16, paddingVertical: 10, borderRadius: 10 },
  backButtonText: { color: '#4F46E5', fontWeight: '600' },
});