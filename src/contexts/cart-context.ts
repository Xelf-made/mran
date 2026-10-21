import { createContext, useContext } from 'react';
import type { Product } from '@/lib/types';

export type CartLine = Product & { quantity: number };
export type CartAction = { type: 'add'; product: Product } | { type: 'remove'; id: string } | { type: 'update'; id: string; quantity: number };

export interface CartContextValue {
  items: CartLine[];
  count: number;
  subtotal: number;
  addItem: (product: Product) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
}

export const CartContext = createContext<CartContextValue | undefined>(undefined);

export function useCart() {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used inside CartProvider');
  return context;
}

export { CartProvider } from './CartContext';
