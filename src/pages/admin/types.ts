export type OrderStatus = 'pending' | 'confirmed' | 'packed' | 'dispatched' | 'delivered' | 'cancelled';
export type ProductStatus = 'in-stock' | 'low-stock' | 'out-of-stock';

export interface AdminOrder {
  id: string;
  order_number: string;
  status: OrderStatus;
  total: number;
  delivery_fee: number;
  payment_method: 'mpesa' | 'card' | 'cod';
  items: { name: string; brand: string; price: number; quantity: number; image: string }[];
  delivery_name: string;
  delivery_phone: string;
  delivery_address: string;
  delivery_area: string;
  created_at: string;
}

export interface AdminProduct {
  id: number;
  name: string;
  brand: string;
  category: string;
  price: number;
  old_price: number | null;
  rating: number;
  reviews: number;
  image: string;
  tag: string | null;
  is_new: boolean;
  prescription: boolean;
  stock: number;
  sales: number;
  description: string;
}

export interface AdminCustomer {
  id: string;
  full_name: string | null;
  phone: string | null;
  area: string | null;
  created_at: string;
  order_count: number;
  total_spent: number;
  primary_area: string | null;
}

export interface StoreSettings {
  id: number;
  store_name: string;
  store_email: string;
  store_phone: string;
  store_address: string;
  ppb_license: string;
  free_delivery_threshold: number;
  delivery_fee: number;
  currency: string;
  order_notifications: boolean;
  low_stock_alerts: boolean;
  auto_confirm_orders: boolean;
  require_prescription: boolean;
  enable_guest_checkout: boolean;
  enable_mpesa: boolean;
  enable_card: boolean;
  enable_cod: boolean;
}

export const STATUS_LABELS: Record<OrderStatus, string> = {
  pending: 'Pending',
  confirmed: 'Confirmed',
  packed: 'Packed',
  dispatched: 'Dispatched',
  delivered: 'Delivered',
  cancelled: 'Cancelled',
};

export const STATUSES: OrderStatus[] = ['pending', 'confirmed', 'packed', 'dispatched', 'delivered', 'cancelled'];

export const price = (value: number) => `KSh ${value.toLocaleString()}`;

export function productStatus(stock: number): ProductStatus {
  if (stock === 0) return 'out-of-stock';
  if (stock <= 10) return 'low-stock';
  return 'in-stock';
}
