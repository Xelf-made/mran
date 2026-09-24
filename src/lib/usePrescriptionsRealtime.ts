import { useEffect } from 'react';
import { supabase } from './supabase';
import { useQueryClient } from '@tanstack/react-query';
import type { Prescription } from './queries';

/*
 * Subscribe to realtime changes on the prescriptions table for the pharmacist
 * pending queue. Automatically cleans up the subscription on unmount.
 */
export function usePrescriptionsRealtime() {
  const qc = useQueryClient();

  useEffect(() => {
    const channel = supabase
      .channel('pharmacist-prescriptions-realtime')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'prescriptions' },
        (payload) => {
          qc.invalidateQueries({ queryKey: ['prescriptions'] });

          if (payload.eventType === 'INSERT') {
            qc.invalidateQueries({ queryKey: ['prescriptions', 'pending'] });
          }
          if (payload.eventType === 'UPDATE') {
            const updated = payload.new as Prescription;
            qc.invalidateQueries({ queryKey: ['prescriptions', 'pending'] });
            qc.invalidateQueries({ queryKey: ['prescriptions', 'reviewed'] });
            qc.invalidateQueries({ queryKey: ['prescriptions', 'customer', updated.user_id] });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [qc]);
}

/*
 * Customer-side subscription: watches for approval/rejection of the current
 * user's prescriptions so the UI can react (unlock Rx products, show status).
 */
export function useCustomerPrescriptionRealtime(userId: string) {
  const qc = useQueryClient();

  useEffect(() => {
    if (!userId) return;

    const channel = supabase
      .channel(`customer-rx-${userId}`)
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'prescriptions', filter: `user_id=eq.${userId}` },
        () => {
          qc.invalidateQueries({ queryKey: ['prescriptions', 'customer', userId] });
        }
      )
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'prescriptions', filter: `user_id=eq.${userId}` },
        () => {
          qc.invalidateQueries({ queryKey: ['prescriptions', 'customer', userId] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [qc, userId]);
}
