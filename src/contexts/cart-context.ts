import { createContext, useContext } from 'react';
import type { Product } from '@/data/products';

export type CartLine = Product & { quantity: number };
export type CartAction = { type: 'add'; product: Product } | { type: 'remove'; id: number } | { type: 'update'; id: number; quantity: number };

export interface CartContextValue {
  items: CartLine[];
  count: number;
  subtotal: number;
  addItem: (product: Product) => void;
  removeItem: (id: number) => void;
  updateQuantity: (id: number, quantity: number) => void;
  clearCart: () => void;
}

export const CartContext = createContext<CartContextValue | undefined>(undefined);

export function useCart() {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used inside CartProvider');
  return context;
}

export { CartProvider } from './CartContext';
