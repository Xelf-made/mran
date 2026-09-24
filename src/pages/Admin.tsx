import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { BarChart3, LogOut, Package, Search, Settings, ShieldCheck, ShoppingBag, Users, X } from 'lucide-react';
import { useAuth } from '@/contexts/useAuth';
import { PageShell } from '@/components/PageShell';
import { Orders } from '@/pages/admin/Orders';
import { Products } from '@/pages/admin/Products';
import { Customers } from '@/pages/admin/Customers';
import { Analytics } from '@/pages/admin/Analytics';
import { StoreSettings } from '@/pages/admin/StoreSettings';

type AdminTab = 'orders' | 'products' | 'customers' | 'analytics' | 'settings';

export function AdminPage() {
  const { demoUser, user, isAdmin, signOut } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState<AdminTab>('orders');

  const displayName = demoUser?.name ?? user?.email ?? 'Admin';
  const email = demoUser?.email ?? user?.email ?? '';

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
          <div>
            <span className="eyebrow"><ShieldCheck size={14} /> Admin dashboard</span>
            <h1>Store management</h1>
            <p className="track__welcome">{displayName} · {email}</p>
          </div>
          <button className="btn btn--outline track__signout" onClick={async () => { await signOut(); navigate('/'); }}>
            <LogOut size={16} /> Sign out
          </button>
        </div>

        <div className="account__layout account__layout--admin">
          <aside className="account__sidebar">
            {tabs.map((item) => (
              <button
                key={item.id}
                className={`account__tab ${tab === item.id ? 'account__tab--active' : ''}`}
                onClick={() => setTab(item.id)}
              >
                <item.icon size={18} /> {item.label}
              </button>
            ))}
          </aside>
          <div className="account__content">
            {tab === 'orders' && <Orders />}
            {tab === 'products' && <Products />}
            {tab === 'customers' && <Customers />}
            {tab === 'analytics' && <Analytics />}
            {tab === 'settings' && <StoreSettings />}
          </div>
        </div>
      </section>
    </PageShell>
  );
}
