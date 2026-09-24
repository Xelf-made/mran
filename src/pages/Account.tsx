import { useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { ArrowRight, Bell, Check, CreditCard, Heart, LogOut, MapPin, Package, Settings, ShoppingBag, User as UserIcon } from 'lucide-react';
import { useAuth } from '@/contexts/useAuth';
import { PageShell } from '@/components/PageShell';
import { Overview } from '@/pages/account/Overview';
import { MyOrders } from '@/pages/account/MyOrders';
import { Addresses } from '@/pages/account/Addresses';
import { PaymentMethods } from '@/pages/account/PaymentMethods';
import { Wishlist } from '@/pages/account/Wishlist';
import { ProfileSettings } from '@/pages/account/ProfileSettings';
import { Notifications } from '@/pages/account/Notifications';

type Tab = 'overview' | 'orders' | 'addresses' | 'payments' | 'wishlist' | 'profile' | 'notifications';

export function AccountPage() {
  const { demoUser, user, isPharmacist, signOut } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState<Tab>('overview');

  const displayName = demoUser?.name ?? user?.email ?? 'Guest';
  const email = demoUser?.email ?? user?.email ?? '';
  const isDemo = Boolean(demoUser);

  if (isPharmacist) {
    return <Navigate to="/pharmacist" replace />;
  }

  if (!demoUser && !user) {
    return (
      <PageShell>
        <div className="shell track-auth">
          <div className="track-auth__card">
            <UserIcon size={42} />
            <h1>Sign in to your account</h1>
            <p>Manage your orders, addresses, payment methods and profile settings.</p>
            <div className="track-auth__cta">
              <Link to="/login" className="btn btn--primary">Sign in <ArrowRight size={16} /></Link>
              <Link to="/signup" className="btn btn--outline">Create account</Link>
            </div>
          </div>
        </div>
      </PageShell>
    );
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
          <div>
            <span className="eyebrow">My account</span>
            <h1>Hello, {displayName.split(' ')[0]}</h1>
            <p className="track__welcome">{email}</p>
          </div>
          <button className="btn btn--outline track__signout" onClick={async () => { await signOut(); navigate('/'); }}>
            <LogOut size={16} /> Sign out
          </button>
        </div>

        {isDemo && (
          <div className="account__demo-banner">
            <Check size={16} /> You are signed in with a demo account. Data shown is sample data. Sign up for a real account to save your information.
          </div>
        )}

        <div className="account__layout">
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
            {tab === 'overview' && <Overview />}
            {tab === 'orders' && <MyOrders />}
            {tab === 'addresses' && <Addresses />}
            {tab === 'payments' && <PaymentMethods />}
            {tab === 'wishlist' && <Wishlist />}
            {tab === 'profile' && <ProfileSettings />}
            {tab === 'notifications' && <Notifications />}
          </div>
        </div>
      </section>
    </PageShell>
  );
}
