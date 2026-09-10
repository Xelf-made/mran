import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, Bell, CreditCard, Heart, LogOut, MapPin, Package, Settings, ShoppingBag, User as UserIcon, Eye, EyeOff, Check, Plus, Trash2 } from 'lucide-react';
import { useAuth } from '@/contexts/useAuth';
import { PageShell } from '@/components/PageShell';
import { Button } from '@/components/ProductCard';
import { demoOrders, demoAddresses, demoPayments, demoCustomerProfile, demoWishlist } from '@/data/demo';

const price = (value: number) => `KSh ${value.toLocaleString()}`;
const STATUS_LABELS: Record<string, string> = { pending: 'Order placed', confirmed: 'Confirmed', packed: 'Packed', dispatched: 'Dispatched', delivered: 'Delivered', cancelled: 'Cancelled' };

type Tab = 'overview' | 'orders' | 'addresses' | 'payments' | 'wishlist' | 'profile' | 'notifications';

export function AccountPage() {
  const { demoUser, user, signOut } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState<Tab>('overview');

  const displayName = demoUser?.name ?? user?.email ?? 'Guest';
  const email = demoUser?.email ?? user?.email ?? '';
  const isDemo = Boolean(demoUser);

  if (!demoUser && !user) {
    return <PageShell><div className="shell track-auth"><div className="track-auth__card"><UserIcon size={42} /><h1>Sign in to your account</h1><p>Manage your orders, addresses, payment methods and profile settings.</p><div className="track-auth__cta"><Link to="/login" className="btn btn--primary">Sign in <ArrowRight size={16} /></Link><Link to="/signup" className="btn btn--outline">Create account</Link></div></div></div></PageShell>;
  }

  const tabs: { id: Tab; label: string; icon: typeof Package }[] = [
    { id: 'overview', label: 'Overview', icon: Package },
    { id: 'orders', label: 'My Orders', icon: ShoppingBag },
    { id: 'addresses', label: 'Addresses', icon: MapPin },
    { id: 'payments', label: 'Payment Methods', icon: CreditCard },
    { id: 'wishlist', label: 'Wishlist', icon: Heart },
    { id: 'profile', label: 'Profile Settings', icon: Settings },
    { id: 'notifications', label: 'Notifications', icon: Bell },
  ];

  return (
    <PageShell>
      <section className="shell account">
        <div className="account__head">
          <div><span className="eyebrow">My account</span><h1>Hello, {displayName.split(' ')[0]}</h1><p className="track__welcome">{email}</p></div>
          <button className="btn btn--outline track__signout" onClick={async () => { await signOut(); navigate('/'); }}><LogOut size={16} /> Sign out</button>
        </div>

        {isDemo && <div className="account__demo-banner"><Check size={16} /> You are signed in with a demo account. All data shown is sample data for demonstration.</div>}

        <div className="account__layout">
          <aside className="account__sidebar">
            {tabs.map((item) => <button key={item.id} className={`account__tab ${tab === item.id ? 'account__tab--active' : ''}`} onClick={() => setTab(item.id)}><item.icon size={18} /> {item.label}</button>)}
          </aside>

          <div className="account__content">
            {tab === 'overview' && <Overview />}
            {tab === 'orders' && <Orders />}
            {tab === 'addresses' && <Addresses />}
            {tab === 'payments' && <Payments />}
            {tab === 'wishlist' && <Wishlist />}
            {tab === 'profile' && <Profile />}
            {tab === 'notifications' && <Notifications />}
          </div>
        </div>
      </section>
    </PageShell>
  );
}

function Overview() {
  const totalSpent = demoOrders.filter((o) => o.status !== 'cancelled').reduce((sum, o) => sum + o.total, 0);
  const activeOrders = demoOrders.filter((o) => !['delivered', 'cancelled'].includes(o.status)).length;
  const stats = [
    { label: 'Total orders', value: String(demoOrders.length), icon: ShoppingBag, color: 'green' },
    { label: 'Active orders', value: String(activeOrders), icon: Package, color: 'orange' },
    { label: 'Total spent', value: price(totalSpent), icon: CreditCard, color: 'blue' },
    { label: 'Wishlist items', value: String(demoWishlist.length), icon: Heart, color: 'pink' },
  ];
  const recentOrder = demoOrders[0];

  return (
    <div>
      <div className="account__stats">
        {stats.map((stat) => <div key={stat.label} className={`account__stat account__stat--${stat.color}`}><span className="account__stat-icon"><stat.icon size={20} /></span><div><strong>{stat.value}</strong><small>{stat.label}</small></div></div>)}
      </div>
      <div className="account__section">
        <h3>Recent order</h3>
        <div className="account__recent-order">
          <div className="account__recent-info"><strong>{recentOrder.order_number}</strong><span>{new Date(recentOrder.created_at).toLocaleDateString('en-KE', { day: 'numeric', month: 'short', year: 'numeric' })}</span></div>
          <span className={`order-status order-status--${recentOrder.status}`}>{STATUS_LABELS[recentOrder.status]}</span>
          <strong className="account__recent-total">{price(recentOrder.total)}</strong>
        </div>
        <Link to="/track" className="text-link" style={{ marginTop: 12, display: 'inline-flex' }}>View all orders <ArrowRight size={15} /></Link>
      </div>
      <div className="account__section">
        <h3>Default delivery address</h3>
        <div className="account__addr-card"><MapPin size={18} /><div><strong>{demoAddresses[0].label}</strong><span>{demoAddresses[0].name}</span><span>{demoAddresses[0].line1}, {demoAddresses[0].area}, {demoAddresses[0].city}</span><span>{demoAddresses[0].phone}</span></div></div>
      </div>
    </div>
  );
}

function Orders() {
  return (
    <div>
      <h3>Order history ({demoOrders.length})</h3>
      <div className="account__orders">
        {demoOrders.map((order) => (
          <div key={order.id} className="account__order-row">
            <div className="account__order-main">
              <div className="account__order-icons">{order.items.slice(0, 3).map((item, i) => <img key={i} src={item.image} alt={item.name} />)}{order.items.length > 3 && <span className="account__order-more">+{order.items.length - 3}</span>}</div>
              <div className="account__order-info"><strong>{order.order_number}</strong><span>{new Date(order.created_at).toLocaleDateString('en-KE', { day: 'numeric', month: 'short', year: 'numeric' })}</span><span>{order.items.reduce((s, i) => s + i.quantity, 0)} items</span></div>
            </div>
            <div className="account__order-side"><span className={`order-status order-status--${order.status}`}>{STATUS_LABELS[order.status]}</span><strong>{price(order.total)}</strong></div>
          </div>
        ))}
      </div>
    </div>
  );
}

function Addresses() {
  const [addresses, setAddresses] = useState(demoAddresses);
  const setDefault = (id: string) => setAddresses(addresses.map((a) => ({ ...a, isDefault: a.id === id })));
  return (
    <div>
      <div className="account__section-head"><h3>Saved addresses</h3><Button className="btn btn--outline btn--sm"><Plus size={16} /> Add address</Button></div>
      <div className="account__addr-grid">
        {addresses.map((addr) => (
          <div key={addr.id} className={`account__addr-card-full ${addr.isDefault ? 'account__addr-card-full--default' : ''}`}>
            <div className="account__addr-top"><span className="account__addr-label">{addr.label}</span>{addr.isDefault && <span className="account__addr-default-tag">Default</span>}</div>
            <strong>{addr.name}</strong>
            <span>{addr.line1}</span>
            <span>{addr.area}, {addr.city}</span>
            <span>{addr.phone}</span>
            <div className="account__addr-actions">
              {!addr.isDefault && <button onClick={() => setDefault(addr.id)} className="account__addr-action">Set as default</button>}
              <button className="account__addr-action account__addr-action--danger"><Trash2 size={14} /> Remove</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function Payments() {
  const [payments, setPayments] = useState(demoPayments);
  const setDefault = (id: string) => setPayments(payments.map((p) => ({ ...p, isDefault: p.id === id })));
  return (
    <div>
      <div className="account__section-head"><h3>Payment methods</h3><Button className="btn btn--outline btn--sm"><Plus size={16} /> Add method</Button></div>
      <div className="account__pay-grid">
        {payments.map((pay) => (
          <div key={pay.id} className={`account__pay-card ${pay.isDefault ? 'account__pay-card--default' : ''}`}>
            <div className="account__pay-top"><span className={`account__pay-type account__pay-type--${pay.type}`}>{pay.type === 'mpesa' ? 'M-Pesa' : 'Card'}</span>{pay.isDefault && <span className="account__addr-default-tag">Default</span>}</div>
            <strong>{pay.label}</strong>
            <span>{pay.detail}</span>
            <div className="account__addr-actions">
              {!pay.isDefault && <button onClick={() => setDefault(pay.id)} className="account__addr-action">Set as default</button>}
              <button className="account__addr-action account__addr-action--danger"><Trash2 size={14} /> Remove</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function Wishlist() {
  const [items, setItems] = useState(demoWishlist);
  const remove = (id: number) => setItems(items.filter((i) => i.id !== id));
  return (
    <div>
      <h3>Wishlist ({items.length})</h3>
      {items.length === 0 ? (
        <div className="track__empty"><Heart size={42} /><h3>Your wishlist is empty</h3><p>Save products you love to find them quickly later.</p><Link to="/products" className="btn btn--primary">Browse products <ArrowRight size={16} /></Link></div>
      ) : (
        <div className="account__wishlist">
          {items.map((item) => (
            <div key={item.id} className="account__wish-item">
              <Link to={`/products/${item.id}`} className="account__wish-img"><img src={item.image} alt={item.name} /></Link>
              <div className="account__wish-info"><strong>{item.name}</strong><span>{item.brand}</span><div className="account__stars">{'★'.repeat(Math.floor(item.rating))}<span>{'★'.repeat(5 - Math.floor(item.rating))}</span></div></div>
              <div className="account__wish-stock"><span className={`order-status order-status--${item.inStock ? 'delivered' : 'cancelled'}`}>{item.inStock ? 'In stock' : 'Out of stock'}</span></div>
              <strong className="account__wish-price">{price(item.price)}</strong>
              <div className="account__wish-actions"><Button className="btn btn--primary btn--sm">Add to cart</Button><button className="account__addr-action account__addr-action--danger" onClick={() => remove(item.id)}><Trash2 size={14} /></button></div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function Profile() {
  const [showPwd, setShowPwd] = useState(false);
  const [saved, setSaved] = useState(false);
  const [form, setForm] = useState({ name: demoCustomerProfile.name, email: demoCustomerProfile.email, phone: demoCustomerProfile.phone, area: demoCustomerProfile.area });
  const save = (event: React.FormEvent) => { event.preventDefault(); setSaved(true); setTimeout(() => setSaved(false), 3000); };
  return (
    <div>
      <h3>Profile settings</h3>
      <form className="account__settings-form" onSubmit={save}>
        <label className="auth__field"><span>Full name</span><div className="auth__input-wrap"><UserIcon size={17} /><input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div></label>
        <label className="auth__field"><span>Email address</span><div className="auth__input-wrap"><UserIcon size={17} /><input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></div></label>
        <label className="auth__field"><span>Phone number</span><div className="auth__input-wrap"><UserIcon size={17} /><input type="tel" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} /></div></label>
        <label className="auth__field"><span>Area / neighbourhood</span><div className="auth__input-wrap"><MapPin size={17} /><input type="text" value={form.area} onChange={(e) => setForm({ ...form, area: e.target.value })} /></div></label>
        <div className="account__divider" />
        <h4>Change password</h4>
        <label className="auth__field"><span>Current password</span><div className="auth__input-wrap"><input type={showPwd ? 'text' : 'password'} placeholder="••••••••" /><button type="button" className="auth__toggle" onClick={() => setShowPwd(!showPwd)}>{showPwd ? <EyeOff size={17} /> : <Eye size={17} />}</button></div></label>
        <div className="field-row"><label className="auth__field"><span>New password</span><div className="auth__input-wrap"><input type={showPwd ? 'text' : 'password'} placeholder="At least 6 characters" /></div></label><label className="auth__field"><span>Confirm new password</span><div className="auth__input-wrap"><input type={showPwd ? 'text' : 'password'} placeholder="Repeat password" /></div></label></div>
        {saved && <div className="account__saved"><Check size={16} /> Profile updated successfully.</div>}
        <Button type="submit" className="btn btn--primary">Save changes</Button>
      </form>
    </div>
  );
}

function Notifications() {
  const [prefs, setPrefs] = useState({ orderUpdates: true, promotions: true, newsletter: true, sms: false, restock: true, reviewRequests: true });
  const toggle = (key: keyof typeof prefs) => setPrefs({ ...prefs, [key]: !prefs[key] });
  const items: { key: keyof typeof prefs; label: string; desc: string }[] = [
    { key: 'orderUpdates', label: 'Order updates', desc: 'Get notified when your order status changes.' },
    { key: 'promotions', label: 'Promotions & offers', desc: 'Receive exclusive deals and discount codes.' },
    { key: 'newsletter', label: 'Health newsletter', desc: 'Weekly health tips and wellness articles.' },
    { key: 'sms', label: 'SMS notifications', desc: 'Get order updates via SMS (carrier charges may apply).' },
    { key: 'restock', label: 'Back in stock alerts', desc: 'Be notified when wishlist items are restocked.' },
    { key: 'reviewRequests', label: 'Review requests', desc: 'Get asked to review products after delivery.' },
  ];
  return (
    <div>
      <h3>Notification preferences</h3>
      <div className="account__notif-list">
        {items.map((item) => (
          <div key={item.key} className="account__notif-item">
            <div><strong>{item.label}</strong><span>{item.desc}</span></div>
            <button type="button" className={`toggle-switch ${prefs[item.key] ? 'toggle-switch--on' : ''}`} onClick={() => toggle(item.key)} aria-label={item.label}><span className="toggle-switch__knob" /></button>
          </div>
        ))}
      </div>
    </div>
  );
}
