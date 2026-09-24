import { useEffect, useState } from 'react';
import { Activity, BarChart3, ShoppingBag, TrendingUp, Users } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import type { AdminOrder, AdminProduct } from './types';
import { STATUSES, STATUS_LABELS, price } from './types';

interface ProductSales {
  name: string;
  sales: number;
  revenue: number;
}

export function Analytics() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [products, setProducts] = useState<AdminProduct[]>([]);
  const [customers, setCustomers] = useState<number>(0);

  useEffect(() => { loadAll(); }, []);

  const loadAll = async () => {
    setLoading(true);
    setError(null);
    const [{ data: ordData, error: ordErr }, { data: prodData, error: prodErr }, { data: profData, error: profErr }] = await Promise.all([
      supabase.from('orders').select('*').order('created_at', { ascending: false }),
      supabase.from('products').select('*'),
      supabase.from('profiles').select('id'),
    ]);
    if (ordErr || prodErr || profErr) { setError('Could not load analytics data.'); setLoading(false); return; }
    setOrders((ordData as AdminOrder[]) ?? []);
    setProducts((prodData as AdminProduct[]) ?? []);
    setCustomers(profData?.length ?? 0);
    setLoading(false);
  };

  if (loading) return <div className="track-loading"><BarChart3 className="spin" size={36} /><p>Loading analytics…</p></div>;

  const now = new Date();
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startOfWeek = new Date(startOfDay);
  startOfWeek.setDate(startOfWeek.getDate() - 6);
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59);

  const validOrders = orders.filter((o) => o.status !== 'cancelled');
  const orderTime = (o: AdminOrder) => new Date(o.created_at).getTime();

  const revenueToday = validOrders.filter((o) => orderTime(o) >= startOfDay.getTime()).reduce((s, o) => s + o.total, 0);
  const revenueWeek = validOrders.filter((o) => orderTime(o) >= startOfWeek.getTime()).reduce((s, o) => s + o.total, 0);
  const revenueMonth = validOrders.filter((o) => orderTime(o) >= startOfMonth.getTime()).reduce((s, o) => s + o.total, 0);
  const revenueLastMonth = validOrders.filter((o) => { const t = orderTime(o); return t >= lastMonthStart.getTime() && t <= lastMonthEnd.getTime(); }).reduce((s, o) => s + o.total, 0);

  const growth = revenueLastMonth > 0 ? (((revenueMonth - revenueLastMonth) / revenueLastMonth) * 100).toFixed(1) : '0.0';

  const ordersToday = orders.filter((o) => orderTime(o) >= startOfDay.getTime()).length;
  const ordersWeek = orders.filter((o) => orderTime(o) >= startOfWeek.getTime()).length;
  const ordersMonth = orders.filter((o) => orderTime(o) >= startOfMonth.getTime()).length;
  const pendingCount = orders.filter((o) => o.status === 'pending').length;

  const statusBreakdown = STATUSES.map((status) => ({ status, count: orders.filter((o) => o.status === status).length }));

  const productSalesMap = new Map<string, ProductSales>();
  validOrders.forEach((order) => {
    order.items.forEach((item) => {
      const entry = productSalesMap.get(item.name) ?? { name: item.name, sales: 0, revenue: 0 };
      entry.sales += item.quantity;
      entry.revenue += item.price * item.quantity;
      productSalesMap.set(item.name, entry);
    });
  });
  const topProducts = [...productSalesMap.values()].sort((a, b) => b.sales - a.sales).slice(0, 5);
  const maxSales = topProducts.length > 0 ? Math.max(...topProducts.map((p) => p.sales)) : 1;

  const recentOrders = orders.slice(0, 5);
  const lowStockProducts = products.filter((p) => p.stock > 0 && p.stock <= 10).slice(0, 5);
  const outOfStockProducts = products.filter((p) => p.stock === 0);

  return (
    <div>
      {error && <div className="auth__error" style={{ marginBottom: 20 }}>{error}</div>}

      <div className="admin__stats">
        <div className="admin-stat admin-stat--delivered"><span className="admin-stat__icon"><TrendingUp size={16} /></span><div><strong>{price(revenueMonth)}</strong><small>Revenue this month</small></div></div>
        <div className="admin-stat"><span className="admin-stat__icon"><ShoppingBag size={16} /></span><div><strong>{ordersMonth}</strong><small>Orders this month</small></div></div>
        <div className="admin-stat"><span className="admin-stat__icon"><Users size={16} /></span><div><strong>{customers}</strong><small>Total customers</small></div></div>
        <div className="admin-stat admin-stat--pending"><span className="admin-stat__icon"><Activity size={16} /></span><div><strong>{pendingCount}</strong><small>Pending orders</small></div></div>
      </div>

      <div className="analytics__grid">
        <div className="analytics__card">
          <h3>Revenue overview</h3>
          <div className="analytics__rev-row"><span>Today</span><strong>{price(revenueToday)}</strong></div>
          <div className="analytics__rev-row"><span>This week</span><strong>{price(revenueWeek)}</strong></div>
          <div className="analytics__rev-row"><span>This month</span><strong>{price(revenueMonth)}</strong></div>
          <div className="analytics__rev-row analytics__rev-row--growth"><span>Growth vs last month</span>
            <strong className={Number(growth) >= 0 ? 'analytics__positive' : 'analytics__negative'}><TrendingUp size={14} /> {growth}%</strong>
          </div>
        </div>

        <div className="analytics__card">
          <h3>Orders summary</h3>
          <div className="analytics__rev-row"><span>Today</span><strong>{ordersToday}</strong></div>
          <div className="analytics__rev-row"><span>This week</span><strong>{ordersWeek}</strong></div>
          <div className="analytics__rev-row"><span>This month</span><strong>{ordersMonth}</strong></div>
          <div className="analytics__rev-row"><span>Pending</span><strong className="analytics__pending">{pendingCount}</strong></div>
        </div>

        <div className="analytics__card analytics__card--wide">
          <h3>Top selling products</h3>
          {topProducts.length === 0 ? (
            <p style={{ color: '#94a884', fontSize: 14 }}>No sales data yet.</p>
          ) : (
            <div className="analytics__bars">
              {topProducts.map((product, index) => (
                <div key={index} className="analytics__bar-row">
                  <span className="analytics__bar-label">{product.name}</span>
                  <div className="analytics__bar-track"><div className="analytics__bar-fill" style={{ width: `${(product.sales / maxSales) * 100}%` }} /></div>
                  <span className="analytics__bar-sales">{product.sales}</span>
                  <span className="analytics__bar-revenue">{price(product.revenue)}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="analytics__card analytics__card--wide">
          <h3>Order status breakdown</h3>
          <div className="analytics__insights">
            {statusBreakdown.map((s) => (
              <div key={s.status} className="analytics__insight">
                <Activity size={20} />
                <div><strong>{s.count}</strong><small>{STATUS_LABELS[s.status]}</small></div>
              </div>
            ))}
          </div>
        </div>

        <div className="analytics__card analytics__card--wide">
          <h3>Recent orders</h3>
          <div className="analytics__activity">
            {recentOrders.length === 0 ? (
              <p style={{ color: '#94a884', fontSize: 14 }}>No orders yet.</p>
            ) : (
              recentOrders.map((order) => (
                <div key={order.id} className="analytics__activity-row">
                  <span className="analytics__activity-dot analytics__activity-dot--order" />
                  <span className="analytics__activity-text">{order.order_number} — {order.delivery_name}</span>
                  <span className="analytics__activity-time">{new Date(order.created_at).toLocaleDateString('en-KE', { day: 'numeric', month: 'short' })}</span>
                  <span className="analytics__activity-amount">{price(order.total)}</span>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="analytics__card analytics__card--wide">
          <h3>Stock alerts</h3>
          <div className="analytics__activity">
            {lowStockProducts.length === 0 && outOfStockProducts.length === 0 ? (
              <p style={{ color: '#94a884', fontSize: 14 }}>All products are well stocked.</p>
            ) : (
              <>
                {lowStockProducts.map((p) => (
                  <div key={`low-${p.id}`} className="analytics__activity-row">
                    <span className="analytics__activity-dot analytics__activity-dot--stock" />
                    <span className="analytics__activity-text">{p.name} is low on stock ({p.stock} left)</span>
                  </div>
                ))}
                {outOfStockProducts.map((p) => (
                  <div key={`out-${p.id}`} className="analytics__activity-row">
                    <span className="analytics__activity-dot analytics__activity-dot--stock" />
                    <span className="analytics__activity-text">{p.name} is out of stock</span>
                  </div>
                ))}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
