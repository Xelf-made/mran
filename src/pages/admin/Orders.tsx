import { useState } from 'react';
import { ChevronLeft, ChevronRight, Clock, Package, Search } from 'lucide-react';
import type { AdminOrder, OrderStatus } from './types';
import { STATUSES, STATUS_LABELS, price } from './types';
import { useAdminOrders, useUpdateOrderStatus } from '@/lib/queries';
import { useOrdersRealtime } from '@/lib/useOrdersRealtime';
import { useDebounce } from '@/lib/useDebounce';
import { useToast } from '@/components/Toast';
import { useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/lib/queries';

const PAGE_SIZE = 25;

export function Orders() {
  const [page, setPage] = useState(1);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const debouncedSearch = useDebounce(search, 300);
  const showToast = useToast();
  const qc = useQueryClient();

  const { data, isLoading, error } = useAdminOrders(page, PAGE_SIZE);
  const updateStatus = useUpdateOrderStatus();
  useOrdersRealtime();

  const orders = data?.items ?? [];
  const total = data?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  const handleStatusChange = async (id: string, newStatus: OrderStatus) => {
    setUpdatingId(id);

    // Optimistic update — instantly reflect new status in the cache
    qc.setQueriesData({ queryKey: queryKeys.orders }, (oldData: unknown) => {
      if (!oldData || typeof oldData !== 'object') return oldData;
      const d = oldData as { items?: AdminOrder[]; total?: number };
      return {
        ...d,
        items: (d.items ?? []).map((o) => o.id === id ? { ...o, status: newStatus } : o),
      };
    });

    try {
      await updateStatus.mutateAsync({ id, status: newStatus });
      showToast('success', `Order status updated to ${STATUS_LABELS[newStatus]}.`);
    } catch {
      showToast('error', 'Could not update order status. Reverting.');
      // Rollback — refetch from server
      qc.invalidateQueries({ queryKey: queryKeys.orders });
    }
    setUpdatingId(null);
  };

  const counts: Record<string, number> = { all: total, pending: 0, confirmed: 0, packed: 0, dispatched: 0, delivered: 0, cancelled: 0 };
  orders.forEach((o) => { counts[o.status] = (counts[o.status] ?? 0) + 1; });

  const lowerSearch = debouncedSearch.toLowerCase();
  const filtered = orders.filter((o: AdminOrder) =>
    (filter === 'all' || o.status === filter) &&
    (!lowerSearch || o.order_number.toLowerCase().includes(lowerSearch) || o.delivery_name.toLowerCase().includes(lowerSearch))
  );

  if (isLoading) return <div className="track-loading"><Package className="spin" size={36} /><p>Loading orders…</p></div>;

  return (
    <div>
      {error && <div className="auth__error" style={{ marginBottom: 20 }}>Could not load orders. Showing cached data if available.</div>}

      <div className="admin__stats">
        {STATUSES.map((status) => (
          <div key={status} className="admin-stat" onClick={() => setFilter(status)}>
            <span className="admin-stat__icon"><Clock size={16} /></span>
            <div><strong>{counts[status] ?? 0}</strong><small>{STATUS_LABELS[status]}</small></div>
          </div>
        ))}
      </div>

      <div className="admin__bar">
        <div className="admin__filters">
          <button className={`filter ${filter === 'all' ? 'filter--active' : ''}`} onClick={() => setFilter('all')}>All ({counts.all})</button>
          {STATUSES.map((status) => (
            <button key={status} className={`filter ${filter === status ? 'filter--active' : ''}`} onClick={() => setFilter(status)}>
              {STATUS_LABELS[status]} ({counts[status] ?? 0})
            </button>
          ))}
        </div>
        <label className="sort admin__search"><Search size={15} /><input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search order or customer" /></label>
      </div>

      {filtered.length === 0 ? (
        <div className="track__empty"><Package size={36} /><h3>No orders found</h3></div>
      ) : (
        <div className="admin__table">
          <div className="admin__row admin__row--head"><span>Order</span><span>Customer</span><span>Items</span><span>Total</span><span>Status</span><span>Update</span></div>
          {filtered.map((order) => (
            <div className="admin__row" key={order.id}>
              <div className="admin__order-no">
                <strong>{order.order_number}</strong>
                <span>{new Date(order.created_at).toLocaleDateString('en-KE', { day: 'numeric', month: 'short' })}</span>
              </div>
              <div className="admin__customer">
                <strong>{order.delivery_name}</strong>
                <span>{order.delivery_area}</span>
                <span>{order.delivery_phone}</span>
              </div>
              <div className="admin__items-count">{order.items.reduce((s, i) => s + i.quantity, 0)} items</div>
              <div className="admin__total">{price(order.total)}</div>
              <div><span className={`order-status order-status--${order.status}`}>{STATUS_LABELS[order.status]}</span></div>
              <div className="admin__action">
                <select
                  value={order.status}
                  disabled={updatingId === order.id}
                  onChange={(e) => handleStatusChange(order.id, e.target.value as OrderStatus)}
                  className="admin__select"
                >
                  {STATUSES.map((status) => <option key={status} value={status}>{STATUS_LABELS[status]}</option>)}
                </select>
              </div>
            </div>
          ))}
        </div>
      )}

      {totalPages > 1 && (
        <div className="admin__bar" style={{ justifyContent: 'center', marginTop: 20 }}>
          <button className="btn btn--outline btn--sm" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}><ChevronLeft size={16} /> Prev</button>
          <span style={{ fontSize: 13, fontWeight: 700, color: '#5a704e' }}>Page {page} of {totalPages}</span>
          <button className="btn btn--outline btn--sm" disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)}>Next <ChevronRight size={16} /></button>
        </div>
      )}
    </div>
  );
}
