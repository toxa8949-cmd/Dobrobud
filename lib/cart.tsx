'use client';

import { createContext, useContext, useEffect, useState, useCallback } from 'react';

export interface CartItem {
  id: number;
  slug: string;
  title: string;
  price: number;
  qty: number;
  image?: string;
  oldPrice?: number; // оригінальна ціна (для показу економії від набору)
  kind?: 'product' | 'bundle';
  bundleItems?: { title: string; qty: number }[]; // склад набору (для показу в кошику)
}

interface CartContextValue {
  items: CartItem[];
  count: number;
  total: number;
  add: (item: Omit<CartItem, 'qty'>, qty?: number) => void;
  addBundle: (bundle: Omit<CartItem, 'qty' | 'kind'>) => void;
  remove: (id: number) => void;
  setQty: (id: number, qty: number) => void;
  clear: () => void;
}

const CartContext = createContext<CartContextValue | null>(null);
const STORAGE_KEY = 'dobrobud_cart';

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [loaded, setLoaded] = useState(false);

  // Відновлення з localStorage (тільки на клієнті, після монтування)
  useEffect(() => {
    try {
      const raw = typeof window !== 'undefined' ? window.localStorage.getItem(STORAGE_KEY) : null;
      if (raw) setItems(JSON.parse(raw));
    } catch {
      /* ignore */
    }
    setLoaded(true);
  }, []);

  // Збереження при змінах
  useEffect(() => {
    if (!loaded) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {
      /* ignore */
    }
  }, [items, loaded]);

  const add = useCallback((item: Omit<CartItem, 'qty'>, qty = 1) => {
    setItems((prev) => {
      const existing = prev.find((i) => i.id === item.id);
      if (existing) {
        return prev.map((i) => (i.id === item.id ? { ...i, qty: i.qty + qty } : i));
      }
      return [...prev, { ...item, qty, kind: item.kind ?? 'product' }];
    });
  }, []);

  // Додати набір як ОДНУ позицію (видаляється цілком, знижка не ламається)
  const addBundle = useCallback((bundle: Omit<CartItem, 'qty' | 'kind'>) => {
    setItems((prev) => {
      const existing = prev.find((i) => i.id === bundle.id && i.kind === 'bundle');
      if (existing) {
        return prev.map((i) =>
          i.id === bundle.id && i.kind === 'bundle' ? { ...i, qty: i.qty + 1 } : i
        );
      }
      return [...prev, { ...bundle, qty: 1, kind: 'bundle' }];
    });
  }, []);

  const remove = useCallback((id: number) => {
    setItems((prev) => prev.filter((i) => i.id !== id));
  }, []);

  const setQty = useCallback((id: number, qty: number) => {
    setItems((prev) =>
      prev.map((i) => (i.id === id ? { ...i, qty: Math.max(1, qty) } : i))
    );
  }, []);

  const clear = useCallback(() => setItems([]), []);

  const count = items.reduce((s, i) => s + i.qty, 0);
  const total = items.reduce((s, i) => s + i.price * i.qty, 0);

  return (
    <CartContext.Provider value={{ items, count, total, add, addBundle, remove, setQty, clear }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
}
