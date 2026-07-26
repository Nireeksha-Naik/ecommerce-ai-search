import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View, Image } from 'react-native';
import { Product } from '../types/product';
import { formatINR } from '../utils/currency';

interface ProductCardProps {
  product: Product;
  aiExplanation?: string;
  singleColumn?: boolean;
}

export default function ProductCard({ product, aiExplanation, singleColumn = false }: ProductCardProps) {
  const router = useRouter();
  const [imgError, setImgError] = useState(false);
  const isOnSale = product.discountPrice !== undefined && product.discountPrice < product.price;

  return (
    <TouchableOpacity
      style={[styles.card, singleColumn ? styles.cardSingle : styles.card]}
      activeOpacity={0.85}
      onPress={() => router.push((`/product/${product.id}`) as any)}
    >
      <View style={styles.imageWrap}>
        {!imgError ? (
          <Image
            source={{ uri: product.image }}
            style={[styles.image, singleColumn ? styles.imageLarge : undefined]}
            resizeMode="cover"
            onError={() => setImgError(true)}
          />
        ) : (
          <View style={[styles.image, styles.imagePlaceholder]} />
        )}

        {isOnSale && (
          <View style={styles.saleBadge}>
            <Text style={styles.saleBadgeText}>SALE</Text>
          </View>
        )}
        {!product.inStock && (
          <View style={styles.outOfStockOverlay}>
            <Text style={styles.outOfStockText}>Out of Stock</Text>
          </View>
        )}
      </View>

      <View style={styles.body}>
        <Text style={styles.category}>{product.category}</Text>
        <Text style={styles.name} numberOfLines={2}>
          {product.name}
        </Text>

        <View style={styles.row}>
          <View style={styles.priceWrap}>
            {isOnSale ? (
              <>
                <Text style={styles.priceDiscounted}>{formatINR(product.discountPrice!)}</Text>
                <Text style={styles.priceOriginal}>{formatINR(product.price)}</Text>
              </>
            ) : (
              <Text style={styles.price}>{formatINR(product.price)}</Text>
            )}
          </View>
          <View style={styles.ratingWrap}>
            <Text style={styles.ratingText}>⭐ {product.rating.toFixed(1)}</Text>
            <Text style={styles.reviewCountText}>({product.reviewCount})</Text>
          </View>
        </View>

        {aiExplanation ? (
          <View style={styles.badge}>
            <Text style={styles.badgeText} numberOfLines={2}>
              {aiExplanation}
            </Text>
          </View>
        ) : null}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    margin: 4,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 1,
  },
  cardSingle: {
    marginHorizontal: 12,
    marginVertical: 8,
  },
  imageWrap: {
    position: 'relative',
  },
  image: {
    width: '100%',
    height: 140,
    backgroundColor: '#F3F4F6',
  },
  imageLarge: {
    height: 200,
  },
  imagePlaceholder: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F3F4F6',
  },
  saleBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: '#DC2626',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  saleBadgeText: {
    fontSize: 9.5,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 0.3,
  },
  outOfStockOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(17, 24, 39, 0.55)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  outOfStockText: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#FFFFFF',
    backgroundColor: 'rgba(0,0,0,0.35)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  body: {
    padding: 8,
  },
  category: {
    fontSize: 9.5,
    fontWeight: '700',
    color: '#9CA3AF',
    textTransform: 'uppercase',
    letterSpacing: 0.3,
    marginBottom: 2,
  },
  name: {
    fontSize: 12.5,
    fontWeight: '600',
    color: '#111827',
    minHeight: 32,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
  },
  priceWrap: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 5,
  },
  price: {
    fontSize: 14,
    fontWeight: '700',
    color: '#4F46E5',
  },
  priceDiscounted: {
    fontSize: 14,
    fontWeight: '700',
    color: '#DC2626',
  },
  priceOriginal: {
    fontSize: 11,
    fontWeight: '500',
    color: '#9CA3AF',
    textDecorationLine: 'line-through',
  },
  ratingWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  ratingText: {
    fontSize: 11.5,
    color: '#6B7280',
    fontWeight: '500',
  },
  reviewCountText: {
    fontSize: 10,
    color: '#9CA3AF',
    fontWeight: '500',
  },
  badge: {
    marginTop: 6,
    backgroundColor: '#F5F3FF',
    borderRadius: 6,
    paddingHorizontal: 7,
    paddingVertical: 5,
  },
  badgeText: {
    fontSize: 10,
    color: '#6D28D9',
    fontWeight: '600',
    lineHeight: 13,
  },
});