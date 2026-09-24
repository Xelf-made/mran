import { useEffect, useState, useCallback } from 'react';
import { Clock, Package, Search } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import type { AdminOrder, OrderStatus } from './types';
import { STATUSES, STATUS_LABELS, price } from './types';

export function Orders() {
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    setLoading(true);
    setError(null);
    const { data, error: fetchError } = await supabase
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false });

    if (fetchError) {
      setError('Could not load orders.');
      setLoading(false);
      return;
    }
    setOrders((data as AdminOrder[]) ?? []);
    setLoading(false);
  };

  const updateStatus = useCallback(async (id: string, newStatus: OrderStatus) => {
    setUpdatingId(id);
    const { error: updateError } = await supabase
      .from('orders')
      .update({ status: newStatus, updated_at: new Date().toISOString() })
      .eq('id', id);

    if (updateError) {
      setError('Could not update order status.');
      setUpdatingId(null);
      return;
    }
    setOrders((prev) => prev.map((o) => (o.id === id ? { ...o, status: newStatus } : o)));
    setUpdatingId(null);
  }, []);

  const counts: Record<string, number> = { all: orders.length, pending: 0, confirmed: 0, packed: 0, dispatched: 0, delivered: 0, cancelled: 0 };
  orders.forEach((o) => { counts[o.status] = (counts[o.status] ?? 0) + 1; });

  const filtered = orders.filter((o) =>
    (filter === 'all' || o.status === filter) &&
    (!search || o.order_number.toLowerCase().includes(search.toLowerCase()) || o.delivery_name.toLowerCase().includes(search.toLowerCase()))
  );

  if (loading) return <div className="track-loading"><Package className="spin" size={36} /><p>Loading orders…</p></div>;

  return (
    <div>
      {error && <div className="auth__error" style={{ marginBottom: 20 }}>{error}</div>}

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
                  onChange={(e) => updateStatus(order.id, e.target.value as OrderStatus)}
                  className="admin__select"
                >
                  {STATUSES.map((status) => <option key={status} value={status}>{STATUS_LABELS[status]}</option>)}
                </select>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
