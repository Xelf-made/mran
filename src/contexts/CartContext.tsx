import { useEffect, useMemo, useReducer, type ReactNode } from 'react';
import { CartContext, type CartAction, type CartLine } from './cart-context';
import type { Product } from '@/data/products';

function reducer(items: CartLine[], action: CartAction): CartLine[] {
  if (action.type === 'add') {
    const found = items.find((item) => item.id === action.product.id);
    return found ? items.map((item) => item.id === action.product.id ? { ...item, quantity: item.quantity + 1 } : item) : [...items, { ...action.product, quantity: 1 }];
  }
  if (action.type === 'remove') return items.filter((item) => item.id !== action.id);
  return action.quantity < 1 ? items.filter((item) => item.id !== action.id) : items.map((item) => item.id === action.id ? { ...item, quantity: action.quantity } : item);
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, dispatch] = useReducer(reducer, [], () => {
    try { return JSON.parse(localStorage.getItem('moran-cart') ?? '[]') as CartLine[]; } catch { return []; }
  });
  useEffect(() => localStorage.setItem('moran-cart', JSON.stringify(items)), [items]);
  const value = useMemo(() => ({ items, count: items.reduce((sum, item) => sum + item.quantity, 0), subtotal: items.reduce((sum, item) => sum + item.price * item.quantity, 0), addItem: (product: Product) => dispatch({ type: 'add', product }), removeItem: (id: number) => dispatch({ type: 'remove', id }), updateQuantity: (id: number, quantity: number) => dispatch({ type: 'update', id, quantity }), clearCart: () => items.forEach((item) => dispatch({ type: 'remove', id: item.id })) }), [items]);
  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}
