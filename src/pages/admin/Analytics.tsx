import { Activity, BarChart3, Boxes, ShoppingBag, TrendingDown, TrendingUp, Users } from 'lucide-react';
import type { AdminOrder, AdminProduct } from './types';
import { STATUSES, STATUS_LABELS, price } from './types';
import { useAnalyticsData } from '@/lib/queries';

interface ProductSales {
  name: string;
  sales: number;
  revenue: number;
}

export function Analytics() {
  const { data, isLoading, error } = useAnalyticsData();

  if (isLoading) return <div className="track-loading"><BarChart3 className="spin" size={36} /><p>Loading analytics…</p></div>;

  const orders: AdminOrder[] = data?.orders ?? [];
  const products: Pick<AdminProduct, 'id' | 'name' | 'stock' | 'sales' | 'price' | 'compare_at_price' | 'old_price' | 'image' | 'category' | 'brand'>[] = data?.products ?? [];
  const customers: number = data?.customerCount ?? 0;

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
  const isGrowthPositive = Number(growth) >= 0;

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
      {error && <div className="auth__error" style={{ marginBottom: 20 }}>{(error as Error).message}</div>}

      {/* Hero KPI banner */}
      <div className="analytics__hero">
        <div className="analytics__hero-main">
          <span className="analytics__hero-label"><TrendingUp size={15} /> Revenue this month</span>
          <strong className="analytics__hero-value">{price(revenueMonth)}</strong>
          <span className={`analytics__hero-growth ${isGrowthPositive ? 'analytics__positive' : 'analytics__negative'}`}>
            {isGrowthPositive ? <TrendingUp size={14} /> : <TrendingDown size={14} />} {isGrowthPositive ? '+' : ''}{growth}% vs last month
          </span>
        </div>
        <div className="analytics__hero-side">
          <div className="analytics__hero-stat"><ShoppingBag size={18} /><div><strong>{ordersMonth}</strong><small>Orders this month</small></div></div>
          <div className="analytics__hero-stat"><Users size={18} /><div><strong>{customers}</strong><small>Total customers</small></div></div>
          <div className="analytics__hero-stat"><Activity size={18} /><div><strong>{pendingCount}</strong><small>Pending orders</small></div></div>
          <div className="analytics__hero-stat"><Boxes size={18} /><div><strong>{products.length}</strong><small>Products tracked</small></div></div>
        </div>
      </div>

      <div className="analytics__grid">
        <div className="analytics__card">
          <h3>Revenue overview</h3>
          <div className="analytics__rev-row"><span>Today</span><strong>{price(revenueToday)}</strong></div>
          <div className="analytics__rev-row"><span>This week</span><strong>{price(revenueWeek)}</strong></div>
          <div className="analytics__rev-row"><span>This month</span><strong>{price(revenueMonth)}</strong></div>
          <div className="analytics__rev-row analytics__rev-row--growth"><span>Growth vs last month</span>
            <strong className={isGrowthPositive ? 'analytics__positive' : 'analytics__negative'}>{isGrowthPositive ? <TrendingUp size={14} /> : <TrendingDown size={14} />} {isGrowthPositive ? '+' : ''}{growth}%</strong>
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
