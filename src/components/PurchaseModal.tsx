import React from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

interface PurchaseModalProps {
  visible: boolean;
  orderId: string;
  productName: string;
  quantity: number;
  price: string;
  onClose: () => void;
  onViewOrder: () => void;
}

export default function PurchaseModal({
  visible,
  orderId,
  productName,
  quantity,
  price,
  onClose,
  onViewOrder,
}: PurchaseModalProps) {
  return (
    <Modal visible={visible} transparent animationType="fade">
      <SafeAreaView style={styles.overlay}>
        <View style={styles.centerContainer}>
          <View style={styles.modal}>
            <View style={styles.successIcon}>
              <Text style={styles.checkmark}>✓</Text>
            </View>

            <Text style={styles.title}>Order Confirmed!</Text>

            <View style={styles.orderDetails}>
              <Text style={styles.label}>Order ID</Text>
              <Text style={styles.orderId}>{orderId}</Text>

              <Text style={[styles.label, { marginTop: 16 }]}>
                Product
              </Text>
              <Text style={styles.value}>{productName}</Text>

              <View style={styles.row}>
                <View style={styles.column}>
                  <Text style={styles.label}>Quantity</Text>
                  <Text style={styles.value}>{quantity}</Text>
                </View>
                <View style={styles.column}>
                  <Text style={styles.label}>Total</Text>
                  <Text style={styles.value}>{price}</Text>
                </View>
              </View>
            </View>

            <Text style={styles.message}>
              Your order has been placed successfully. You will receive a confirmation email shortly.
            </Text>

            <View style={styles.buttonContainer}>
              <TouchableOpacity
                style={[styles.button, styles.viewButton]}
                onPress={onViewOrder}
              >
                <Text style={styles.viewButtonText}>View Order</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.button, styles.closeButton]}
                onPress={onClose}
              >
                <Text style={styles.closeButtonText}>Continue Shopping</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  centerContainer: {
    width: '100%',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  modal: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 24,
    width: '100%',
    maxWidth: 400,
    alignItems: 'center',
  },
  successIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#D1FAE5',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  checkmark: {
    fontSize: 48,
    color: '#059669',
    fontWeight: '700',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 20,
  },
  orderDetails: {
    width: '100%',
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6B7280',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  orderId: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1F2937',
    marginTop: 4,
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: '#EFF6FF',
    borderRadius: 8,
    borderLeftWidth: 3,
    borderLeftColor: '#0EA5E9',
  },
  value: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
    marginTop: 4,
  },
  row: {
    flexDirection: 'row',
    marginTop: 16,
    gap: 12,
  },
  column: {
    flex: 1,
  },
  message: {
    fontSize: 13,
    color: '#6B7280',
    lineHeight: 20,
    marginBottom: 20,
    textAlign: 'center',
  },
  buttonContainer: {
    width: '100%',
    gap: 12,
  },
  button: {
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  viewButton: {
    backgroundColor: '#059669',
  },
  viewButtonText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 16,
  },
  closeButton: {
    backgroundColor: '#F3F4F6',
  },
  closeButtonText: {
    color: '#111827',
    fontWeight: '700',
    fontSize: 16,
  },
});
