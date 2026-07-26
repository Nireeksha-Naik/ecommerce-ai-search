import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { Product } from '../types/product';

interface Props {
  product: Product;
  priceLabel: string;
  quantity?: number;
  disabled?: boolean;
  onAdd: () => void;
  onBuyNow: () => void;
}

export default function ProductActionBar({ product, priceLabel, quantity = 0, disabled = false, onAdd, onBuyNow }: Props) {
  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.row}>
          <TouchableOpacity
            style={[styles.addButton, disabled ? styles.disabled : null]}
            onPress={onAdd}
            activeOpacity={0.85}
            disabled={disabled}
          >
            <Text style={styles.buttonText}>Add to Cart</Text>
            {quantity > 0 && <Text style={styles.quantityBadge}>{quantity}</Text>}
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.buyButton, disabled ? styles.disabled : null]}
            onPress={onBuyNow}
            activeOpacity={0.85}
            disabled={disabled}
          >
            <Text style={styles.buttonText}>Buy Now</Text>
            <Text style={styles.priceLabel}>{priceLabel}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: '#FFFFFF',
  },
  container: {
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    paddingHorizontal: 12,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  addButton: {
    flex: 1,
    backgroundColor: '#6366F1',
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  buyButton: {
    flex: 1,
    backgroundColor: '#DC2626',
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 15,
  },
  priceLabel: {
    color: '#FFFFFF',
    fontWeight: '600',
    marginTop: 4,
    fontSize: 12,
  },
  quantityBadge: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: '#FCD34D',
    color: '#111827',
    fontWeight: '700',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
    fontSize: 12,
  },
  disabled: {
    backgroundColor: '#D1D5DB',
    opacity: 0.6,
  },
});
