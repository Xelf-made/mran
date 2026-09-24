import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ClipboardCheck, Clock, FileText, LogOut, Pill, Stethoscope, X } from 'lucide-react';
import { useAuth } from '@/contexts/useAuth';
import { PageShell } from '@/components/PageShell';
import { PendingReviews } from '@/pages/pharmacist/PendingReviews';
import { ReviewHistory } from '@/pages/pharmacist/ReviewHistory';
import { RxProducts } from '@/pages/pharmacist/RxProducts';

type PharmacistTab = 'pending' | 'history' | 'rx-products';

export function PharmacistDashboard() {
  const { demoUser, user, isPharmacist, signOut } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState<PharmacistTab>('pending');

  const displayName = demoUser?.name ?? user?.email ?? 'Pharmacist';
  const email = demoUser?.email ?? user?.email ?? '';

  if (!demoUser && !user) {
    return (
      <PageShell>
        <div className="shell track-auth">
          <div className="track-auth__card">
            <Stethoscope size={42} />
            <h1>Pharmacist sign in required</h1>
            <p>Sign in with a pharmacist or admin account to access the review portal.</p>
            <Link to="/pharmacist-login" className="btn btn--primary">Pharmacist sign in</Link>
          </div>
        </div>
      </PageShell>
    );
  }

  if (!isPharmacist) {
    return (
      <PageShell>
        <div className="shell track-auth">
          <div className="track-auth__card">
            <X size={42} />
            <h1>Access denied</h1>
            <p>This account does not have pharmacist privileges.</p>
            <Link to="/" className="btn btn--outline">Back to home</Link>
          </div>
        </div>
      </PageShell>
    );
  }

  const tabs: { id: PharmacistTab; label: string; icon: typeof Pill }[] = [
    { id: 'pending', label: 'Pending Reviews', icon: Clock },
    { id: 'history', label: 'Review History', icon: ClipboardCheck },
    { id: 'rx-products', label: 'Rx Products', icon: Pill },
  ];

  return (
    <PageShell>
      <section className="shell admin">
        <div className="track__head">
          <div>
            <span className="eyebrow"><Stethoscope size={14} /> Pharmacist portal</span>
            <h1>Prescription review workspace</h1>
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
            {tab === 'pending' && <PendingReviews />}
            {tab === 'history' && <ReviewHistory />}
            {tab === 'rx-products' && <RxProducts />}
          </div>
        </div>
      </section>
    </PageShell>
  );
}
