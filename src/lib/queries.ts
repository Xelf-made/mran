import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from './supabase';
import type { AdminOrder, AdminProduct, AdminCustomer, StoreSettings as StoreSettingsType } from '@/pages/admin/types';

/*
 * Centralized query keys for consistent cache management.
 * All keys are arrays so TanStack Query can do partial invalidation.
 */
export const queryKeys = {
  products: ['products'] as const,
  productsList: (page: number, limit: number) => ['products', 'list', page, limit] as const,
  productDetail: (id: number) => ['products', 'detail', id] as const,
  orders: ['orders'] as const,
  ordersList: (page: number, limit: number) => ['orders', 'list', page, limit] as const,
  customerOrders: (userId: string) => ['orders', 'customer', userId] as const,
  customers: ['customers'] as const,
  storeSettings: ['store-settings'] as const,
  customerCount: ['customers', 'count'] as const,
  addresses: (userId: string) => ['addresses', userId] as const,
  paymentMethods: (userId: string) => ['payment-methods', userId] as const,
  wishlist: (userId: string) => ['wishlist', userId] as const,
  profile: (userId: string) => ['profile', userId] as const,
};

/*
 * Column lists — replaces SELECT * with only the fields each view needs,
 * reducing payload size and database work.
 */
const PRODUCT_CARD_COLUMNS = 'id, name, brand, category, price, old_price, rating, reviews, image, tag, is_new, prescription';
const PRODUCT_ADMIN_COLUMNS = 'id, name, brand, category, price, old_price, rating, reviews, image, tag, is_new, prescription, stock, sales, description';
const ORDER_ADMIN_COLUMNS = 'id, order_number, status, total, delivery_fee, payment_method, items, delivery_name, delivery_phone, delivery_address, delivery_area, created_at';
const ORDER_ANALYTICS_COLUMNS = 'id, order_number, status, total, items, delivery_name, created_at';
const PRODUCT_STOCK_COLUMNS = 'id, name, stock, sales';
const PROFILE_COLUMNS = 'id, full_name, phone, area, created_at';
const ORDER_CUSTOMER_COLUMNS = 'user_id, total, status, delivery_area';
const ADDRESS_COLUMNS = 'id, user_id, label, name, phone, line1, area, city, is_default, created_at';
const PAYMENT_COLUMNS = 'id, user_id, type, label, detail, is_default, created_at';
const WISHLET_COLUMNS = 'id, user_id, product_id, created_at';
const ORDER_CUSTOMER_FULL_COLUMNS = 'id, order_number, status, total, delivery_fee, payment_method, items, delivery_name, delivery_phone, delivery_address, delivery_area, created_at';

/*
 * Public product catalog query — cached for 10 minutes (staleTime set globally
 * but also here for explicitness). Only fetches columns needed for product cards.
 */
export function useProductsCatalog() {
  return useQuery({
    queryKey: queryKeys.products,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('products')
        .select(PRODUCT_CARD_COLUMNS)
        .order('id', { ascending: true });
      if (error) throw error;
      return data as AdminProduct[];
    },
    staleTime: 10 * 60 * 1000,
  });
}

/*
 * Paginated admin product list with specific columns for the admin table.
 */
export function useAdminProducts(page: number, limit: number = 20) {
  return useQuery({
    queryKey: queryKeys.productsList(page, limit),
    queryFn: async () => {
      const from = (page - 1) * limit;
      const to = from + limit - 1;
      const { data, error, count } = await supabase
        .from('products')
        .select(PRODUCT_ADMIN_COLUMNS, { count: 'exact' })
        .order('id', { ascending: true })
        .range(from, to);
      if (error) throw error;
      return { items: data as AdminProduct[], total: count ?? 0 };
    },
    staleTime: 2 * 60 * 1000,
  });
}

/*
 * All products with stock columns — for analytics stock alerts.
 */
export function useProductStock() {
  return useQuery({
    queryKey: ['products', 'stock'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('products')
        .select(PRODUCT_STOCK_COLUMNS)
        .order('id', { ascending: true });
      if (error) throw error;
      return data as Pick<AdminProduct, 'id' | 'name' | 'stock' | 'sales'>[];
    },
    staleTime: 2 * 60 * 1000,
  });
}

/*
 * Paginated admin orders list with specific columns.
 */
export function useAdminOrders(page: number, limit: number = 50) {
  return useQuery({
    queryKey: queryKeys.ordersList(page, limit),
    queryFn: async () => {
      const from = (page - 1) * limit;
      const to = from + limit - 1;
      const { data, error, count } = await supabase
        .from('orders')
        .select(ORDER_ADMIN_COLUMNS, { count: 'exact' })
        .order('created_at', { ascending: false })
        .range(from, to);
      if (error) throw error;
      return { items: data as AdminOrder[], total: count ?? 0 };
    },
    staleTime: 30 * 1000,
  });
}

/*
 * Analytics: fetches order + product data with minimal columns for revenue
 * and stock calculations. Uses separate queries for parallelism.
 */
export function useAnalyticsData() {
  return useQuery({
    queryKey: ['analytics'],
    queryFn: async () => {
      const [{ data: orders, error: ordErr }, { data: products, error: prodErr }, { data: profiles, error: profErr }] = await Promise.all([
        supabase.from('orders').select(ORDER_ANALYTICS_COLUMNS).order('created_at', { ascending: false }),
        supabase.from('products').select(PRODUCT_STOCK_COLUMNS),
        supabase.from('profiles').select('id'),
      ]);
      if (ordErr) throw ordErr;
      if (prodErr) throw prodErr;
      if (profErr) throw profErr;
      return {
        orders: (orders ?? []) as AdminOrder[],
        products: (products ?? []) as Pick<AdminProduct, 'id' | 'name' | 'stock' | 'sales'>[],
        customerCount: profiles?.length ?? 0,
      };
    },
    staleTime: 60 * 1000,
  });
}

/*
 * Customers: fetches profiles + order aggregates in parallel, then joins
 * client-side. Cached for 1 minute.
 */
export function useCustomers() {
  return useQuery({
    queryKey: queryKeys.customers,
    queryFn: async () => {
      const [{ data: profiles, error: profErr }, { data: orders, error: ordErr }] = await Promise.all([
        supabase.from('profiles').select(PROFILE_COLUMNS),
        supabase.from('orders').select(ORDER_CUSTOMER_COLUMNS),
      ]);
      if (profErr) throw profErr;
      if (ordErr) throw ordErr;

      const orderMap = new Map<string, { count: number; spent: number; areas: Map<string, number> }>();
      (orders ?? []).forEach((o: { user_id: string; total: number; status: string; delivery_area: string }) => {
        if (o.status === 'cancelled') return;
        const entry = orderMap.get(o.user_id) ?? { count: 0, spent: 0, areas: new Map() };
        entry.count += 1;
        entry.spent += o.total;
        entry.areas.set(o.delivery_area, (entry.areas.get(o.delivery_area) ?? 0) + 1);
        orderMap.set(o.user_id, entry);
      });

      return (profiles ?? []).map((p: { id: string; full_name: string | null; phone: string | null; area: string | null; created_at: string }) => {
        const stats = orderMap.get(p.id);
        let primaryArea = p.area;
        if (stats && stats.areas.size > 0) {
          primaryArea = [...stats.areas.entries()].sort((a, b) => b[1] - a[1])[0][0];
        }
        return {
          id: p.id,
          full_name: p.full_name,
          phone: p.phone,
          area: p.area,
          created_at: p.created_at,
          order_count: stats?.count ?? 0,
          total_spent: stats?.spent ?? 0,
          primary_area: primaryArea,
        } as AdminCustomer;
      });
    },
    staleTime: 60 * 1000,
  });
}

/*
 * Store settings — singleton row, cached for 10 minutes (rarely changes).
 */
export function useStoreSettings() {
  return useQuery({
    queryKey: queryKeys.storeSettings,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('store_settings')
        .select('*')
        .eq('id', 1)
        .maybeSingle();
      if (error) throw error;
      return data as StoreSettingsType | null;
    },
    staleTime: 10 * 60 * 1000,
  });
}

/*
 * Mutations with automatic cache invalidation.
 */

export function useUpdateOrderStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const { error } = await supabase
        .from('orders')
        .update({ status, updated_at: new Date().toISOString() })
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.orders });
      qc.invalidateQueries({ queryKey: ['analytics'] });
    },
  });
}

export function useSaveProduct() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ editing, payload }: { editing: AdminProduct | null; payload: Omit<AdminProduct, 'id'> }) => {
      const cleanPayload = { ...payload, old_price: payload.old_price || null, tag: payload.tag || null };
      if (editing) {
        const { error } = await supabase.from('products').update(cleanPayload).eq('id', editing.id);
        if (error) throw error;
        return { ...editing, ...cleanPayload } as AdminProduct;
      }
      const { data, error } = await supabase.from('products').insert(cleanPayload).select('*').single();
      if (error) throw error;
      return data as AdminProduct;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.products });
    },
  });
}

export function useDeleteProduct() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      const { error } = await supabase.from('products').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.products });
    },
  });
}

export function useToggleStock() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, stock }: { id: number; stock: number }) => {
      const { error } = await supabase.from('products').update({ stock }).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.products });
    },
  });
}

export function useSaveSettings() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (settings: StoreSettingsType) => {
      const { error } = await supabase
        .from('store_settings')
        .update({ ...settings, updated_at: new Date().toISOString() })
        .eq('id', 1);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.storeSettings });
    },
  });
}

/*
 * Customer-facing hooks
 */

export interface CustomerAddress {
  id: string;
  user_id: string;
  label: string;
  name: string;
  phone: string;
  line1: string;
  area: string;
  city: string;
  is_default: boolean;
  created_at: string;
}

export interface CustomerPaymentMethod {
  id: string;
  user_id: string;
  type: 'mpesa' | 'card';
  label: string;
  detail: string;
  is_default: boolean;
  created_at: string;
}

export interface CustomerProfile {
  id: string;
  full_name: string | null;
  phone: string | null;
  area: string | null;
  created_at: string;
}

export interface WishlistItem {
  id: string;
  user_id: string;
  product_id: number;
  created_at: string;
  product: {
    id: number;
    name: string;
    brand: string;
    price: number;
    old_price: number | null;
    image: string;
    rating: number;
    stock: number;
  };
}

export function useCustomerOrders(userId: string) {
  return useQuery({
    queryKey: queryKeys.customerOrders(userId),
    queryFn: async () => {
      const { data, error } = await supabase
        .from('orders')
        .select(ORDER_CUSTOMER_FULL_COLUMNS)
        .eq('user_id', userId)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data as AdminOrder[];
    },
    staleTime: 30 * 1000,
    enabled: !!userId,
  });
}

export function useAddresses(userId: string) {
  return useQuery({
    queryKey: queryKeys.addresses(userId),
    queryFn: async () => {
      const { data, error } = await supabase
        .from('addresses')
        .select(ADDRESS_COLUMNS)
        .eq('user_id', userId)
        .order('created_at', { ascending: true });
      if (error) throw error;
      return data as CustomerAddress[];
    },
    staleTime: 60 * 1000,
    enabled: !!userId,
  });
}

export function useSaveAddress(userId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, payload }: { id: string | null; payload: Omit<CustomerAddress, 'id' | 'user_id' | 'created_at'> }) => {
      if (id) {
        const { error } = await supabase.from('addresses').update(payload).eq('id', id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('addresses').insert({ ...payload, user_id: userId });
        if (error) throw error;
      }
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.addresses(userId) }),
  });
}

export function useDeleteAddress(userId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('addresses').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.addresses(userId) }),
  });
}

export function useSetDefaultAddress(userId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await supabase.from('addresses').update({ is_default: false }).eq('user_id', userId);
      const { error } = await supabase.from('addresses').update({ is_default: true }).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.addresses(userId) }),
  });
}

export function usePaymentMethods(userId: string) {
  return useQuery({
    queryKey: queryKeys.paymentMethods(userId),
    queryFn: async () => {
      const { data, error } = await supabase
        .from('payment_methods')
        .select(PAYMENT_COLUMNS)
        .eq('user_id', userId)
        .order('created_at', { ascending: true });
      if (error) throw error;
      return data as CustomerPaymentMethod[];
    },
    staleTime: 60 * 1000,
    enabled: !!userId,
  });
}

export function useSavePaymentMethod(userId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, payload }: { id: string | null; payload: Omit<CustomerPaymentMethod, 'id' | 'user_id' | 'created_at'> }) => {
      if (id) {
        const { error } = await supabase.from('payment_methods').update(payload).eq('id', id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('payment_methods').insert({ ...payload, user_id: userId });
        if (error) throw error;
      }
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.paymentMethods(userId) }),
  });
}

export function useDeletePaymentMethod(userId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('payment_methods').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.paymentMethods(userId) }),
  });
}

export function useSetDefaultPayment(userId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await supabase.from('payment_methods').update({ is_default: false }).eq('user_id', userId);
      const { error } = await supabase.from('payment_methods').update({ is_default: true }).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.paymentMethods(userId) }),
  });
}

export function useWishlist(userId: string) {
  return useQuery({
    queryKey: queryKeys.wishlist(userId),
    queryFn: async () => {
      const { data, error } = await supabase
        .from('wishlist')
        .select(`${WISHLET_COLUMNS}, product:products(id, name, brand, price, old_price, image, rating, stock)`)
        .eq('user_id', userId)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return (data ?? []) as unknown as WishlistItem[];
    },
    staleTime: 60 * 1000,
    enabled: !!userId,
  });
}

export function useRemoveWishlistItem(userId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('wishlist').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.wishlist(userId) }),
  });
}

export function useProfile(userId: string) {
  return useQuery({
    queryKey: queryKeys.profile(userId),
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select(PROFILE_COLUMNS)
        .eq('id', userId)
        .maybeSingle();
      if (error) throw error;
      return data as CustomerProfile | null;
    },
    staleTime: 60 * 1000,
    enabled: !!userId,
  });
}

export function useUpdateProfile(userId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: { full_name: string; phone: string; area: string }) => {
      const { error } = await supabase.from('profiles').update({
        ...payload,
        updated_at: new Date().toISOString(),
      }).eq('id', userId);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.profile(userId) }),
  });
}
