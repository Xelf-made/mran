import { useEffect } from 'react';
import { supabase } from './supabase';
import { queryKeys } from './queries';
import type { AdminOrder } from '@/pages/admin/types';
import { useQueryClient } from '@tanstack/react-query';

/*
 * Subscribe to realtime changes on the orders table, scoped to the admin
 * orders view. Automatically cleans up the subscription on unmount to free
 * the Supabase Realtime connection pool.
 *
 * Only the orders table gets a realtime subscription — products, profiles,
 * and settings are polled via TanStack Query's staleTime/refetch instead,
 * since they change infrequently and don't warrant a persistent socket.
 */
export function useOrdersRealtime() {
  const qc = useQueryClient();

  useEffect(() => {
    const channel = supabase
      .channel('admin-orders-realtime')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'orders' },
        (payload) => {
          qc.setQueriesData({ queryKey: queryKeys.orders }, (oldData: unknown) => {
            if (!oldData || typeof oldData !== 'object') return oldData;
            const data = oldData as { items?: AdminOrder[]; total?: number };

            if (payload.eventType === 'INSERT' && payload.new) {
              const newOrder = payload.new as AdminOrder;
              return {
                ...data,
                items: [newOrder, ...(data.items ?? [])],
                total: (data.total ?? 0) + 1,
              };
            }

            if (payload.eventType === 'UPDATE' && payload.new) {
              const updated = payload.new as AdminOrder;
              return {
                ...data,
                items: (data.items ?? []).map((o) => (o.id === updated.id ? updated : o)),
              };
            }

            if (payload.eventType === 'DELETE' && payload.old) {
              const deleted = payload.old as { id: string };
              return {
                ...data,
                items: (data.items ?? []).filter((o) => o.id !== deleted.id),
                total: Math.max((data.total ?? 1) - 1, 0),
              };
            }

            return oldData;
          });

          qc.invalidateQueries({ queryKey: ['analytics'] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [qc]);
}
