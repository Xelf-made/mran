import { useEffect } from 'react';
import { supabase } from './supabase';
import { useQueryClient } from '@tanstack/react-query';
import type { AdminOrder } from '@/pages/admin/types';

/*
 * Customer-side realtime subscription: watches for changes to the current
 * user's orders so the My Orders screen updates live without a manual refresh.
 * Cleans up the subscription on unmount.
 */
export function useCustomerOrdersRealtime(userId: string) {
  const qc = useQueryClient();

  useEffect(() => {
    if (!userId) return;

    const channel = supabase
      .channel(`customer-orders-${userId}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'orders', filter: `user_id=eq.${userId}` },
        (payload) => {
          qc.setQueriesData({ queryKey: ['orders', 'customer', userId] }, (oldData: unknown) => {
            if (!oldData || !Array.isArray(oldData)) return oldData;
            const orders = oldData as AdminOrder[];

            if (payload.eventType === 'INSERT' && payload.new) {
              return [payload.new as AdminOrder, ...orders];
            }
            if (payload.eventType === 'UPDATE' && payload.new) {
              const updated = payload.new as AdminOrder;
              return orders.map((o) => (o.id === updated.id ? updated : o));
            }
            if (payload.eventType === 'DELETE' && payload.old) {
              const deleted = payload.old as { id: string };
              return orders.filter((o) => o.id !== deleted.id);
            }
            return oldData;
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [qc, userId]);
}
