import { useEffect, useState } from 'react';
import { Check, Clock, Search, TrendingUp, Users } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import type { AdminCustomer } from './types';
import { price } from './types';

type SortKey = 'name' | 'orders' | 'spent' | 'joined';

export function Customers() {
  const [customers, setCustomers] = useState<AdminCustomer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [sortKey, setSortKey] = useState<SortKey>('spent');

  useEffect(() => { loadCustomers(); }, []);

  const loadCustomers = async () => {
    setLoading(true);
    setError(null);

    const [{ data: profiles, error: profErr }, { data: orders, error: ordErr }] = await Promise.all([
      supabase.from('profiles').select('id, full_name, phone, area, created_at'),
      supabase.from('orders').select('user_id, total, status, delivery_area'),
    ]);

    if (profErr || ordErr) { setError('Could not load customers.'); setLoading(false); return; }

    const orderMap = new Map<string, { count: number; spent: number; areas: Map<string, number> }>();
    (orders ?? []).forEach((o: { user_id: string; total: number; status: string; delivery_area: string }) => {
      if (o.status === 'cancelled') return;
      const entry = orderMap.get(o.user_id) ?? { count: 0, spent: 0, areas: new Map() };
      entry.count += 1;
      entry.spent += o.total;
      entry.areas.set(o.delivery_area, (entry.areas.get(o.delivery_area) ?? 0) + 1);
      orderMap.set(o.user_id, entry);
    });

    const combined: AdminCustomer[] = (profiles ?? []).map((p: { id: string; full_name: string | null; phone: string | null; area: string | null; created_at: string }) => {
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
      };
    });

    setCustomers(combined);
    setLoading(false);
  };

  const filtered = customers
    .filter((c) => !search || (c.full_name ?? '').toLowerCase().includes(search.toLowerCase()) || c.id.includes(search))
    .sort((a, b) => {
      switch (sortKey) {
        case 'name': return (a.full_name ?? '').localeCompare(b.full_name ?? '');
        case 'orders': return b.order_count - a.order_count;
        case 'spent': return b.total_spent - a.total_spent;
        case 'joined': return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      }
    });

  const totalRevenue = customers.reduce((s, c) => s + c.total_spent, 0);
  const activeCount = customers.filter((c) => c.order_count > 0).length;
  const newCount = customers.filter((c) => c.order_count === 0).length;

  if (loading) return <div className="track-loading"><Users className="spin" size={36} /><p>Loading customers…</p></div>;

  return (
    <div>
      {error && <div className="auth__error" style={{ marginBottom: 20 }}>{error}</div>}

      <div className="admin__stats">
        <div className="admin-stat"><span className="admin-stat__icon"><Users size={16} /></span><div><strong>{customers.length}</strong><small>Customers</small></div></div>
        <div className="admin-stat"><span className="admin-stat__icon"><TrendingUp size={16} /></span><div><strong>{price(totalRevenue)}</strong><small>Total revenue</small></div></div>
        <div className="admin-stat admin-stat--delivered"><span className="admin-stat__icon"><Check size={16} /></span><div><strong>{activeCount}</strong><small>Active</small></div></div>
        <div className="admin-stat admin-stat--pending"><span className="admin-stat__icon"><Clock size={16} /></span><div><strong>{newCount}</strong><small>New</small></div></div>
      </div>

      <div className="admin__bar">
        <div className="admin__filters" />
        <div className="admin__bar-right">
          <label className="sort">
            <select className="admin__select" value={sortKey} onChange={(e) => setSortKey(e.target.value as SortKey)}>
              <option value="spent">Sort: Total spent</option>
              <option value="orders">Sort: Order count</option>
              <option value="name">Sort: Name</option>
              <option value="joined">Sort: Joined</option>
            </select>
          </label>
          <label className="sort admin__search"><Search size={15} /><input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search customers" /></label>
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="track__empty"><Users size={36} /><h3>No customers found</h3></div>
      ) : (
        <div className="admin__table">
          <div className="admin__row admin__row--head admin__row--customers"><span>Customer</span><span>Contact</span><span>Area</span><span>Orders</span><span>Spent</span><span>Status</span><span>Joined</span></div>
          {filtered.map((customer) => (
            <div className="admin__row admin__row--customers" key={customer.id}>
              <div className="admin__product-name"><strong>{customer.full_name ?? 'Unnamed'}</strong></div>
              <div className="admin__customer"><span>{customer.id.slice(0, 8)}…</span><span>{customer.phone ?? 'No phone'}</span></div>
              <div className="admin__items-count">{customer.primary_area ?? '—'}</div>
              <div className="admin__stock">{customer.order_count}</div>
              <div className="admin__total">{price(customer.total_spent)}</div>
              <div><span className={`order-status order-status--${customer.order_count > 0 ? 'delivered' : 'pending'}`}>{customer.order_count > 0 ? 'Active' : 'New'}</span></div>
              <div className="admin__items-count">{new Date(customer.created_at).toLocaleDateString('en-KE', { day: 'numeric', month: 'short', year: 'numeric' })}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
