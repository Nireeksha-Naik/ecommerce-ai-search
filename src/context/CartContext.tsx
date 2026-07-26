import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';
import type { Product } from '../types/product';

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface PurchaseItem extends CartItem {
  purchaseDate: string;
  orderId: string;
}

interface CartContextValue {
  items: CartItem[];
  purchases: PurchaseItem[];
  addToCart: (product: Product, qty?: number) => void;
  removeFromCart: (productId: string) => void;
  clearCart: () => void;
  getQuantity: (productId: string) => number;
  totalItems: number;
  buyItem: (product: Product, qty?: number) => string; // Returns orderId
  removePurchase: (orderId: string) => void;
  clearPurchases: () => void;
}

const CartContext = createContext<CartContextValue | undefined>(undefined);

export const CartProvider = ({ children }: { children: React.ReactNode }) => {
  const [items, setItems] = useState<CartItem[]>([]);
  const [purchases, setPurchases] = useState<PurchaseItem[]>([]);

  const addToCart = useCallback((product: Product, qty = 1) => {
    setItems((prev) => {
      const existing = prev.find((p) => p.product.id === product.id);
      if (existing) {
        return prev.map((p) =>
          p.product.id === product.id ? { ...p, quantity: p.quantity + qty } : p
        );
      }
      return [...prev, { product, quantity: qty }];
    });
  }, []);

  const removeFromCart = useCallback((productId: string) => {
    setItems((prev) => prev.filter((p) => p.product.id !== productId));
  }, []);

  const clearCart = useCallback(() => setItems([]), []);

  const getQuantity = useCallback(
    (productId: string) => items.find((i) => i.product.id === productId)?.quantity ?? 0,
    [items]
  );

  const buyItem = useCallback((product: Product, qty = 1) => {
    const orderId = `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
    const purchaseDate = new Date().toLocaleString();
    
    setPurchases((prev) => [
      ...prev,
      { product, quantity: qty, orderId, purchaseDate },
    ]);
    
    // Remove from cart if it exists
    removeFromCart(product.id);
    
    return orderId;
  }, [removeFromCart]);

  const removePurchase = useCallback((orderId: string) => {
    setPurchases((prev) => prev.filter((p) => p.orderId !== orderId));
  }, []);

  const clearPurchases = useCallback(() => setPurchases([]), []);

  const totalItems = useMemo(() => items.reduce((s, i) => s + i.quantity, 0), [items]);

  const value = useMemo(
    () => ({
      items,
      purchases,
      addToCart,
      removeFromCart,
      clearCart,
      getQuantity,
      totalItems,
      buyItem,
      removePurchase,
      clearPurchases,
    }),
    [items, purchases, addToCart, removeFromCart, clearCart, getQuantity, totalItems, buyItem, removePurchase, clearPurchases]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
}

export default CartContext;
