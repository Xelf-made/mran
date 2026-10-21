import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { BarChart3, Boxes, LayoutDashboard, LogOut, Package, ReceiptText, Settings, ShieldCheck, ShoppingBag, Users, X } from 'lucide-react';
import { useAuth } from '@/contexts/useAuth';
import { PageShell } from '@/components/PageShell';
import { Orders } from '@/pages/admin/Orders';
import { Products } from '@/pages/admin/Products';
import { Customers } from '@/pages/admin/Customers';
import { Analytics } from '@/pages/admin/Analytics';
import { StoreSettings } from '@/pages/admin/StoreSettings';

type AdminTab = 'orders' | 'products' | 'customers' | 'analytics' | 'settings';

interface TabMeta { id: AdminTab; label: string; icon: typeof Package; blurb: string }

const TABS: TabMeta[] = [
  { id: 'orders', label: 'Orders', icon: ShoppingBag, blurb: 'Process and track customer orders' },
  { id: 'products', label: 'Products', icon: Package, blurb: 'Manage your catalog and inventory' },
  { id: 'customers', label: 'Customers', icon: Users, blurb: 'View customer profiles and history' },
  { id: 'analytics', label: 'Analytics', icon: BarChart3, blurb: 'Revenue, sales and stock insights' },
  { id: 'settings', label: 'Store Settings', icon: Settings, blurb: 'Configure payments and operations' },
];

export function AdminPage() {
  const { demoUser, user, isAdmin, signOut } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState<AdminTab>('orders');

  const displayName = demoUser?.name ?? user?.email ?? 'Admin';
  const email = demoUser?.email ?? user?.email ?? '';
  const isDemoAdmin = Boolean(demoUser);
  const activeTab = TABS.find((t) => t.id === tab) ?? TABS[0];

  if (!demoUser && !user) {
    return (
      <PageShell>
        <div className="shell track-auth">
          <div className="track-auth__card">
            <ShieldCheck size={42} />
            <h1>Admin sign in required</h1>
            <p>Sign in with an admin account to manage the store.</p>
            <Link to="/admin-login" className="btn btn--primary">Admin sign in</Link>
          </div>
        </div>
      </PageShell>
    );
  }

  if (!isAdmin) {
    return (
      <PageShell>
        <div className="shell track-auth">
          <div className="track-auth__card">
            <X size={42} />
            <h1>Access denied</h1>
            <p>This account does not have admin privileges.</p>
            <Link to="/" className="btn btn--outline">Back to home</Link>
          </div>
        </div>
      </PageShell>
    );
  }

  return (
    <PageShell>
      <div className="adm">
        <aside className="adm__sidebar">
          <div className="adm__brand">
            <span className="adm__brand-icon"><ShieldCheck size={22} /></span>
            <div>
              <strong>Moran Admin</strong>
              <small>Control Center</small>
            </div>
          </div>

          <nav className="adm__nav">
            <div className="adm__nav-label">Manage</div>
            {TABS.map((item) => (
              <button
                key={item.id}
                className={`adm__nav-item ${tab === item.id ? 'adm__nav-item--active' : ''}`}
                onClick={() => setTab(item.id)}
              >
                <item.icon size={18} /> {item.label}
              </button>
            ))}
          </nav>

          <div className="adm__sidebar-footer">
            <div className="adm__user">
              <div className="adm__avatar">{displayName.charAt(0).toUpperCase()}</div>
              <div className="adm__user-info">
                <strong>{displayName}</strong>
                <span>{email || 'admin@moran.co.ke'}</span>
              </div>
            </div>
            <button className="adm__signout" onClick={async () => { await signOut(); navigate('/'); }}>
              <LogOut size={16} /> Sign out
            </button>
            {isDemoAdmin && <span className="adm__demo-tag">Demo admin</span>}
          </div>
        </aside>

        <main className="adm__main">
          <div className="adm__topbar">
            <div className="adm__topbar-left">
              <span className="adm__topbar-icon"><activeTab.icon size={20} /></span>
              <div>
                <h1 className="adm__topbar-title">{activeTab.label}</h1>
                <p className="adm__topbar-blurb">{activeTab.blurb}</p>
              </div>
            </div>
            <div className="adm__topbar-right">
              <span className="adm__live-dot" /> <span className="adm__live-text">Live data</span>
              <Link to="/" className="adm__view-store"><LayoutDashboard size={15} /> View store</Link>
            </div>
          </div>

          <div className="adm__content">
            {tab === 'orders' && <Orders />}
            {tab === 'products' && <Products />}
            {tab === 'customers' && <Customers />}
            {tab === 'analytics' && <Analytics />}
            {tab === 'settings' && <StoreSettings />}
          </div>

          <div className="adm__bottom-bar">
            <button className="adm__bottom-tab" onClick={() => setTab('orders')}>
              <ShoppingBag size={18} /><span>Orders</span>
            </button>
            <button className="adm__bottom-tab" onClick={() => setTab('products')}>
              <Package size={18} /><span>Products</span>
            </button>
            <button className="adm__bottom-tab" onClick={() => setTab('customers')}>
              <Users size={18} /><span>Customers</span>
            </button>
            <button className="adm__bottom-tab" onClick={() => setTab('analytics')}>
              <BarChart3 size={18} /><span>Analytics</span>
            </button>
            <button className="adm__bottom-tab" onClick={() => setTab('settings')}>
              <Settings size={18} /><span>Settings</span>
            </button>
          </div>
        </main>
      </div>
    </PageShell>
  );
}
