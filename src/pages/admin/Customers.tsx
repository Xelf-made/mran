import { useState } from 'react';
import { Check, Clock, Search, TrendingUp, Users } from 'lucide-react';
import type { SortKey } from './types';
import type { AdminCustomer } from './types';
import { price } from './types';
import { useCustomers } from '@/lib/queries';


export function Customers() {
  const { data: customers, isLoading, error } = useCustomers();
  const [search, setSearch] = useState('');
  const [sortKey, setSortKey] = useState<SortKey>('spent');

  const list = customers ?? [];

  const filtered = list
    .filter((c) => !search || (c.full_name ?? '').toLowerCase().includes(search.toLowerCase()) || c.id.includes(search))
    .sort((a, b) => {
      switch (sortKey) {
        case 'name': return (a.full_name ?? '').localeCompare(b.full_name ?? '');
        case 'orders': return b.order_count - a.order_count;
        case 'spent': return b.total_spent - a.total_spent;
        case 'joined': return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      }
    });

  const totalRevenue = list.reduce((s, c) => s + c.total_spent, 0);
  const activeCount = list.filter((c) => c.order_count > 0).length;
  const newCount = list.filter((c) => c.order_count === 0).length;

  if (isLoading) return <div className="track-loading"><Users className="spin" size={36} /><p>Loading customers…</p></div>;

  return (
    <div>
      {error && <div className="auth__error" style={{ marginBottom: 20 }}>{(error as Error).message}</div>}

      <div className="admin__stats">
        <div className="admin-stat"><span className="admin-stat__icon"><Users size={16} /></span><div><strong>{list.length}</strong><small>Customers</small></div></div>
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
