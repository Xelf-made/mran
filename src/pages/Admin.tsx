import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Activity, BarChart3, Check, Clock, Download, LogOut, Package, Search, Settings, ShieldCheck, ShoppingBag, TrendingUp, Users, X, Plus, Eye, Edit3 } from 'lucide-react';
import { useAuth } from '@/contexts/useAuth';
import { PageShell } from '@/components/PageShell';
import { Button } from '@/components/ProductCard';
import { demoAdminOrders, demoAdminProducts, demoCustomers, demoAnalytics } from '@/data/demo';

const price = (value: number) => `KSh ${value.toLocaleString()}`;
const STATUS_LABELS: Record<string, string> = { pending: 'Pending', confirmed: 'Confirmed', packed: 'Packed', dispatched: 'Dispatched', delivered: 'Delivered', cancelled: 'Cancelled' };
const STATUSES = ['pending', 'confirmed', 'packed', 'dispatched', 'delivered', 'cancelled'] as const;

type AdminTab = 'orders' | 'products' | 'customers' | 'analytics' | 'settings';

export function AdminPage() {
  const { demoUser, user, isAdmin, signOut } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState<AdminTab>('orders');

  const displayName = demoUser?.name ?? user?.email ?? 'Admin';
  const email = demoUser?.email ?? user?.email ?? '';
  const isDemo = Boolean(demoUser);

  if (!demoUser && !user) {
    return <PageShell><div className="shell track-auth"><div className="track-auth__card"><ShieldCheck size={42} /><h1>Admin sign in required</h1><p>Sign in with an admin account to manage the store.</p><Link to="/admin-login" className="btn btn--primary">Admin sign in</Link></div></div></PageShell>;
  }

  if (!isAdmin) {
    return <PageShell><div className="shell track-auth"><div className="track-auth__card"><X size={42} /><h1>Access denied</h1><p>This account does not have admin privileges.</p><Link to="/" className="btn btn--outline">Back to home</Link></div></div></PageShell>;
  }

  const tabs: { id: AdminTab; label: string; icon: typeof Package }[] = [
    { id: 'orders', label: 'Orders', icon: ShoppingBag },
    { id: 'products', label: 'Products', icon: Package },
    { id: 'customers', label: 'Customers', icon: Users },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'settings', label: 'Store Settings', icon: Settings },
  ];

  return (
    <PageShell>
      <section className="shell admin">
        <div className="track__head">
          <div><span className="eyebrow"><ShieldCheck size={14} /> Admin dashboard</span><h1>Store management</h1><p className="track__welcome">{displayName} · {email}</p></div>
          <button className="btn btn--outline track__signout" onClick={async () => { await signOut(); navigate('/'); }}><LogOut size={16} /> Sign out</button>
        </div>

        {isDemo && <div className="account__demo-banner"><Check size={16} /> You are in demo admin mode. All data is sample data for demonstration.</div>}

        <div className="account__layout account__layout--admin">
          <aside className="account__sidebar">
            {tabs.map((item) => <button key={item.id} className={`account__tab ${tab === item.id ? 'account__tab--active' : ''}`} onClick={() => setTab(item.id)}><item.icon size={18} /> {item.label}</button>)}
          </aside>
          <div className="account__content">
            {tab === 'orders' && <AdminOrders />}
            {tab === 'products' && <AdminProducts />}
            {tab === 'customers' && <AdminCustomers />}
            {tab === 'analytics' && <AdminAnalytics />}
            {tab === 'settings' && <AdminSettings />}
          </div>
        </div>
      </section>
    </PageShell>
  );
}

function AdminOrders() {
  const [orders, setOrders] = useState(demoAdminOrders);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');

  const counts: Record<string, number> = { all: orders.length, pending: 0, confirmed: 0, packed: 0, dispatched: 0, delivered: 0, cancelled: 0 };
  orders.forEach((o) => { counts[o.status] = (counts[o.status] ?? 0) + 1; });

  const filtered = orders.filter((o) => (filter === 'all' || o.status === filter) && (!search || o.order_number.toLowerCase().includes(search.toLowerCase()) || o.delivery_name.toLowerCase().includes(search.toLowerCase())));

  const updateStatus = (id: string, newStatus: string) => setOrders(orders.map((o) => o.id === id ? { ...o, status: newStatus as typeof o.status } : o));

  return (
    <div>
      <div className="admin__stats">
        {STATUSES.map((status) => <div key={status} className="admin-stat" onClick={() => setFilter(status)}><span className="admin-stat__icon"><Clock size={16} /></span><div><strong>{counts[status] ?? 0}</strong><small>{STATUS_LABELS[status]}</small></div></div>)}
      </div>
      <div className="admin__bar">
        <div className="admin__filters">
          <button className={`filter ${filter === 'all' ? 'filter--active' : ''}`} onClick={() => setFilter('all')}>All ({counts.all})</button>
          {STATUSES.map((status) => <button key={status} className={`filter ${filter === status ? 'filter--active' : ''}`} onClick={() => setFilter(status)}>{STATUS_LABELS[status]} ({counts[status] ?? 0})</button>)}
        </div>
        <label className="sort admin__search"><Search size={15} /><input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search order or customer" /></label>
      </div>
      {filtered.length === 0 ? <div className="track__empty"><Package size={36} /><h3>No orders found</h3></div> : (
        <div className="admin__table">
          <div className="admin__row admin__row--head"><span>Order</span><span>Customer</span><span>Items</span><span>Total</span><span>Status</span><span>Update</span></div>
          {filtered.map((order) => (
            <div className="admin__row" key={order.id}>
              <div className="admin__order-no"><strong>{order.order_number}</strong><span>{new Date(order.created_at).toLocaleDateString('en-KE', { day: 'numeric', month: 'short' })}</span></div>
              <div className="admin__customer"><strong>{order.delivery_name}</strong><span>{order.delivery_area}</span><span>{order.delivery_phone}</span></div>
              <div className="admin__items-count">{order.items.reduce((s, i) => s + i.quantity, 0)} items</div>
              <div className="admin__total">{price(order.total)}</div>
              <div><span className={`order-status order-status--${order.status}`}>{STATUS_LABELS[order.status]}</span></div>
              <div className="admin__action"><select value={order.status} onChange={(e) => updateStatus(order.id, e.target.value)} className="admin__select">{STATUSES.map((status) => <option key={status} value={status}>{STATUS_LABELS[status]}</option>)}</select></div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function AdminProducts() {
  const [products, setProducts] = useState(demoAdminProducts);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
  const filtered = products.filter((p) => (filter === 'all' || p.status === filter) && (!search || p.name.toLowerCase().includes(search.toLowerCase()) || p.brand.toLowerCase().includes(search.toLowerCase())));
  const stockValue = products.reduce((s, p) => s + p.price * p.stock, 0);
  const lowStock = products.filter((p) => p.status === 'low-stock').length;
  const outStock = products.filter((p) => p.status === 'out-of-stock').length;

  const toggleStock = (id: number) => setProducts(products.map((p) => p.id === id ? { ...p, stock: p.stock > 0 ? 0 : 50, status: p.stock > 0 ? 'out-of-stock' as const : 'in-stock' as const } : p));

  return (
    <div>
      <div className="admin__stats">
        <div className="admin-stat"><span className="admin-stat__icon"><Package size={16} /></span><div><strong>{products.length}</strong><small>Products</small></div></div>
        <div className="admin-stat"><span className="admin-stat__icon"><TrendingUp size={16} /></span><div><strong>{price(stockValue)}</strong><small>Stock value</small></div></div>
        <div className="admin-stat admin-stat--pending"><span className="admin-stat__icon"><Clock size={16} /></span><div><strong>{lowStock}</strong><small>Low stock</small></div></div>
        <div className="admin-stat admin-stat--cancelled"><span className="admin-stat__icon"><X size={16} /></span><div><strong>{outStock}</strong><small>Out of stock</small></div></div>
      </div>
      <div className="admin__bar">
        <div className="admin__filters">
          <button className={`filter ${filter === 'all' ? 'filter--active' : ''}`} onClick={() => setFilter('all')}>All</button>
          <button className={`filter ${filter === 'in-stock' ? 'filter--active' : ''}`} onClick={() => setFilter('in-stock')}>In stock</button>
          <button className={`filter ${filter === 'low-stock' ? 'filter--active' : ''}`} onClick={() => setFilter('low-stock')}>Low stock</button>
          <button className={`filter ${filter === 'out-of-stock' ? 'filter--active' : ''}`} onClick={() => setFilter('out-of-stock')}>Out of stock</button>
        </div>
        <div className="admin__bar-right">
          <label className="sort admin__search"><Search size={15} /><input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search products" /></label>
          <Button className="btn btn--primary btn--sm"><Plus size={16} /> Add product</Button>
        </div>
      </div>
      <div className="admin__table">
        <div className="admin__row admin__row--head admin__row--products"><span>Product</span><span>Category</span><span>Price</span><span>Stock</span><span>Status</span><span>Sales</span><span>Actions</span></div>
        {filtered.map((product) => (
          <div className="admin__row admin__row--products" key={product.id}>
            <div className="admin__product-name"><strong>{product.name}</strong><span>{product.brand}</span></div>
            <span className="admin__items-count">{product.category}</span>
            <div className="admin__total">{price(product.price)}</div>
            <div className="admin__stock">{product.stock} units</div>
            <div><span className={`order-status order-status--${product.status === 'in-stock' ? 'delivered' : product.status === 'low-stock' ? 'pending' : 'cancelled'}`}>{product.status.replace('-', ' ')}</span></div>
            <div className="admin__items-count">{product.sales}</div>
            <div className="admin__row-actions"><button className="admin__icon-btn" title="View"><Eye size={15} /></button><button className="admin__icon-btn" title="Edit"><Edit3 size={15} /></button><button className="admin__icon-btn admin__icon-btn--danger" title="Toggle stock" onClick={() => toggleStock(product.id)}><Package size={15} /></button></div>
          </div>
        ))}
      </div>
    </div>
  );
}

function AdminCustomers() {
  const [search, setSearch] = useState('');
  const filtered = demoCustomers.filter((c) => !search || c.name.toLowerCase().includes(search.toLowerCase()) || c.email.toLowerCase().includes(search.toLowerCase()));
  const totalRevenue = demoCustomers.reduce((s, c) => s + c.totalSpent, 0);
  return (
    <div>
      <div className="admin__stats">
        <div className="admin-stat"><span className="admin-stat__icon"><Users size={16} /></span><div><strong>{demoCustomers.length}</strong><small>Customers</small></div></div>
        <div className="admin-stat"><span className="admin-stat__icon"><TrendingUp size={16} /></span><div><strong>{price(totalRevenue)}</strong><small>Total revenue</small></div></div>
        <div className="admin-stat admin-stat--delivered"><span className="admin-stat__icon"><Check size={16} /></span><div><strong>{demoCustomers.filter((c) => c.status === 'active').length}</strong><small>Active</small></div></div>
        <div className="admin-stat admin-stat--pending"><span className="admin-stat__icon"><Clock size={16} /></span><div><strong>{demoCustomers.filter((c) => c.status === 'new').length}</strong><small>New</small></div></div>
      </div>
      <div className="admin__bar"><div className="admin__filters" /><label className="sort admin__search"><Search size={15} /><input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search customers" /></label></div>
      <div className="admin__table">
        <div className="admin__row admin__row--head admin__row--customers"><span>Customer</span><span>Contact</span><span>Area</span><span>Orders</span><span>Spent</span><span>Status</span><span>Joined</span></div>
        {filtered.map((customer) => (
          <div className="admin__row admin__row--customers" key={customer.id}>
            <div className="admin__product-name"><strong>{customer.name}</strong></div>
            <div className="admin__customer"><span>{customer.email}</span><span>{customer.phone}</span></div>
            <div className="admin__items-count">{customer.area}</div>
            <div className="admin__stock">{customer.orders}</div>
            <div className="admin__total">{price(customer.totalSpent)}</div>
            <div><span className={`order-status order-status--${customer.status === 'active' ? 'delivered' : 'pending'}`}>{customer.status}</span></div>
            <div className="admin__items-count">{new Date(customer.joined).toLocaleDateString('en-KE', { day: 'numeric', month: 'short', year: 'numeric' })}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function AdminAnalytics() {
  const a = demoAnalytics;
  const revenueGrowth = ((a.revenue.month - a.revenue.lastMonth) / a.revenue.lastMonth * 100).toFixed(1);
  const maxSales = Math.max(...a.topProducts.map((p) => p.sales));
  return (
    <div>
      <div className="admin__stats">
        <div className="admin-stat admin-stat--delivered"><span className="admin-stat__icon"><TrendingUp size={16} /></span><div><strong>{price(a.revenue.month)}</strong><small>Revenue this month</small></div></div>
        <div className="admin-stat"><span className="admin-stat__icon"><ShoppingBag size={16} /></span><div><strong>{a.orders.month}</strong><small>Orders this month</small></div></div>
        <div className="admin-stat"><span className="admin-stat__icon"><Users size={16} /></span><div><strong>{a.customers.total}</strong><small>Total customers</small></div></div>
        <div className="admin-stat admin-stat--pending"><span className="admin-stat__icon"><Activity size={16} /></span><div><strong>{a.conversion.rate}%</strong><small>Conversion rate</small></div></div>
      </div>

      <div className="analytics__grid">
        <div className="analytics__card">
          <h3>Revenue overview</h3>
          <div className="analytics__rev-row"><span>Today</span><strong>{price(a.revenue.today)}</strong></div>
          <div className="analytics__rev-row"><span>This week</span><strong>{price(a.revenue.week)}</strong></div>
          <div className="analytics__rev-row"><span>This month</span><strong>{price(a.revenue.month)}</strong></div>
          <div className="analytics__rev-row analytics__rev-row--growth"><span>Growth vs last month</span><strong className={Number(revenueGrowth) >= 0 ? 'analytics__positive' : 'analytics__negative'}><TrendingUp size={14} /> {revenueGrowth}%</strong></div>
        </div>

        <div className="analytics__card">
          <h3>Orders summary</h3>
          <div className="analytics__rev-row"><span>Today</span><strong>{a.orders.today}</strong></div>
          <div className="analytics__rev-row"><span>This week</span><strong>{a.orders.week}</strong></div>
          <div className="analytics__rev-row"><span>This month</span><strong>{a.orders.month}</strong></div>
          <div className="analytics__rev-row"><span>Pending</span><strong className="analytics__pending">{a.orders.pending}</strong></div>
        </div>

        <div className="analytics__card analytics__card--wide">
          <h3>Top selling products</h3>
          <div className="analytics__bars">
            {a.topProducts.map((product, index) => (
              <div key={index} className="analytics__bar-row">
                <span className="analytics__bar-label">{product.name}</span>
                <div className="analytics__bar-track"><div className="analytics__bar-fill" style={{ width: `${(product.sales / maxSales) * 100}%` }} /></div>
                <span className="analytics__bar-sales">{product.sales}</span>
                <span className="analytics__bar-revenue">{price(product.revenue)}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="analytics__card analytics__card--wide">
          <h3>Customer insights</h3>
          <div className="analytics__insights">
            <div className="analytics__insight"><Users size={20} /><div><strong>{a.customers.newThisMonth}</strong><small>New this month</small></div></div>
            <div className="analytics__insight"><Activity size={20} /><div><strong>{a.customers.newThisWeek}</strong><small>New this week</small></div></div>
            <div className="analytics__insight"><Eye size={20} /><div><strong>{a.conversion.visits.toLocaleString()}</strong><small>Visits this month</small></div></div>
            <div className="analytics__insight"><TrendingUp size={20} /><div><strong>{a.conversion.orders}</strong><small>Orders from visits</small></div></div>
          </div>
        </div>

        <div className="analytics__card analytics__card--wide">
          <h3>Recent activity</h3>
          <div className="analytics__activity">
            {a.recentActivity.map((activity, index) => (
              <div key={index} className="analytics__activity-row">
                <span className={`analytics__activity-dot analytics__activity-dot--${activity.type}`} />
                <span className="analytics__activity-text">{activity.text}</span>
                <span className="analytics__activity-time">{activity.time}</span>
                {activity.amount > 0 && <span className="analytics__activity-amount">{price(activity.amount)}</span>}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function AdminSettings() {
  const [settings, setSettings] = useState({
    storeName: 'Moran Pharmacy', storeEmail: 'info@moranpharmacy.co.ke', storePhone: '+254 700 123 456',
    storeAddress: 'Naivasha Road, Nairobi', ppbLicense: 'PPB Lic. 123456',
    freeDeliveryThreshold: 3000, deliveryFee: 200, currency: 'KES',
    orderNotifications: true, lowStockAlerts: true, autoConfirmOrders: false, requirePrescription: true,
    enableGuestCheckout: true, enableMpesa: true, enableCard: true, enableCod: true,
  });
  const [saved, setSaved] = useState(false);
  const set = (key: keyof typeof settings, value: string | number | boolean) => setSettings({ ...settings, [key]: value });
  const save = (event: React.FormEvent) => { event.preventDefault(); setSaved(true); setTimeout(() => setSaved(false), 3000); };

  return (
    <div>
      <form className="account__settings-form" onSubmit={save}>
        <h3>Store information</h3>
        <div className="field-row"><label className="auth__field"><span>Store name</span><div className="auth__input-wrap"><input type="text" value={settings.storeName} onChange={(e) => set('storeName', e.target.value)} /></div></label><label className="auth__field"><span>PPB license</span><div className="auth__input-wrap"><input type="text" value={settings.ppbLicense} onChange={(e) => set('ppbLicense', e.target.value)} /></div></label></div>
        <div className="field-row"><label className="auth__field"><span>Contact email</span><div className="auth__input-wrap"><input type="email" value={settings.storeEmail} onChange={(e) => set('storeEmail', e.target.value)} /></div></label><label className="auth__field"><span>Contact phone</span><div className="auth__input-wrap"><input type="tel" value={settings.storePhone} onChange={(e) => set('storePhone', e.target.value)} /></div></label></div>
        <label className="auth__field"><span>Store address</span><div className="auth__input-wrap"><input type="text" value={settings.storeAddress} onChange={(e) => set('storeAddress', e.target.value)} /></div></label>

        <div className="account__divider" />
        <h3>Delivery & payments</h3>
        <div className="field-row"><label className="auth__field"><span>Free delivery threshold (KSh)</span><div className="auth__input-wrap"><input type="number" value={settings.freeDeliveryThreshold} onChange={(e) => set('freeDeliveryThreshold', Number(e.target.value))} /></div></label><label className="auth__field"><span>Standard delivery fee (KSh)</span><div className="auth__input-wrap"><input type="number" value={settings.deliveryFee} onChange={(e) => set('deliveryFee', Number(e.target.value))} /></div></label></div>

        <div className="account__notif-list">
          <div className="account__notif-item"><div><strong>M-Pesa Express</strong><span>Accept M-Pesa STK push payments</span></div><button type="button" className={`toggle-switch ${settings.enableMpesa ? 'toggle-switch--on' : ''}`} onClick={() => set('enableMpesa', !settings.enableMpesa)}><span className="toggle-switch__knob" /></button></div>
          <div className="account__notif-item"><div><strong>Card payments</strong><span>Accept Visa and Mastercard</span></div><button type="button" className={`toggle-switch ${settings.enableCard ? 'toggle-switch--on' : ''}`} onClick={() => set('enableCard', !settings.enableCard)}><span className="toggle-switch__knob" /></button></div>
          <div className="account__notif-item"><div><strong>Cash on delivery</strong><span>Allow customers to pay on arrival</span></div><button type="button" className={`toggle-switch ${settings.enableCod ? 'toggle-switch--on' : ''}`} onClick={() => set('enableCod', !settings.enableCod)}><span className="toggle-switch__knob" /></button></div>
          <div className="account__notif-item"><div><strong>Guest checkout</strong><span>Allow orders without an account</span></div><button type="button" className={`toggle-switch ${settings.enableGuestCheckout ? 'toggle-switch--on' : ''}`} onClick={() => set('enableGuestCheckout', !settings.enableGuestCheckout)}><span className="toggle-switch__knob" /></button></div>
        </div>

        <div className="account__divider" />
        <h3>Operations</h3>
        <div className="account__notif-list">
          <div className="account__notif-item"><div><strong>New order notifications</strong><span>Get alerted when orders come in</span></div><button type="button" className={`toggle-switch ${settings.orderNotifications ? 'toggle-switch--on' : ''}`} onClick={() => set('orderNotifications', !settings.orderNotifications)}><span className="toggle-switch__knob" /></button></div>
          <div className="account__notif-item"><div><strong>Low stock alerts</strong><span>Get notified when products run low</span></div><button type="button" className={`toggle-switch ${settings.lowStockAlerts ? 'toggle-switch--on' : ''}`} onClick={() => set('lowStockAlerts', !settings.lowStockAlerts)}><span className="toggle-switch__knob" /></button></div>
          <div className="account__notif-item"><div><strong>Auto-confirm orders</strong><span>Automatically confirm new orders without review</span></div><button type="button" className={`toggle-switch ${settings.autoConfirmOrders ? 'toggle-switch--on' : ''}`} onClick={() => set('autoConfirmOrders', !settings.autoConfirmOrders)}><span className="toggle-switch__knob" /></button></div>
          <div className="account__notif-item"><div><strong>Require prescription verification</strong><span>Pharmacist reviews Rx products before dispatch</span></div><button type="button" className={`toggle-switch ${settings.requirePrescription ? 'toggle-switch--on' : ''}`} onClick={() => set('requirePrescription', !settings.requirePrescription)}><span className="toggle-switch__knob" /></button></div>
        </div>

        {saved && <div className="account__saved"><Check size={16} /> Settings saved successfully.</div>}
        <div className="admin__settings-actions"><Button type="submit" className="btn btn--primary">Save settings</Button><Button type="button" className="btn btn--outline"><Download size={15} /> Export data</Button></div>
      </form>
    </div>
  );
}
