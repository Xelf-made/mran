import { Link } from 'react-router-dom';
import { ArrowRight, Check, FileText, Lock, ShieldCheck, Stethoscope, Upload } from 'lucide-react';
import { PageShell } from '@/components/PageShell';
import { useAuth } from '@/contexts/useAuth';

const steps = [
  { icon: Upload, title: 'Upload your prescription', text: 'Take a clear photo or upload a PDF of your doctor\'s prescription from your account.' },
  { icon: Stethoscope, title: 'Pharmacist review', text: 'A licensed Moran pharmacist reviews your script, usually within 30 minutes during business hours.' },
  { icon: ShieldCheck, title: 'Shop with confidence', text: 'Once approved, prescription medicines unlock in your cart and you can check out securely.' },
  { icon: FileText, title: 'Track & reorder', text: 'Your approved prescriptions are saved in your account for easy reordering of refills.' },
];

const rxProducts = [
  { name: 'Amoxil 500mg Capsules', price: 'KSh 450', link: '/products/1' },
  { name: 'Cetirizine 10mg Tablets', price: 'KSh 280', link: '/products/3' },
];

export function PrescriptionsPage() {
  const { user, demoUser } = useAuth();
  const isLoggedIn = Boolean(user || demoUser);

  return (
    <PageShell>
      <section className="page-hero">
        <div className="shell">
          <span className="eyebrow">Prescription verification</span>
          <h1>Upload your prescription, get your medicine</h1>
          <p>Our licensed pharmacists review every prescription to make sure you get the right medicine at the right dose — safely and conveniently.</p>
        </div>
      </section>

      <section className="shell rx-public">
        <div className="rx-public__steps">
          {steps.map((step, i) => (
            <div className="rx-public__step" key={i}>
              <div className="rx-public__step-icon"><step.icon size={28} /></div>
              <h3>{step.title}</h3>
              <p>{step.text}</p>
            </div>
          ))}
        </div>

        <div className="rx-public__cta">
          <div className="rx-public__cta-card">
            <Lock size={32} />
            <h2>Ready to upload your prescription?</h2>
            <p>{isLoggedIn ? 'Go to your account to upload a prescription and track its review status.' : 'Sign in or create a free account to upload your prescription and unlock Rx products.'}</p>
            {isLoggedIn ? (
              <Link to="/account" className="btn btn--primary">Go to my prescriptions <ArrowRight size={16} /></Link>
            ) : (
              <div className="rx-public__cta-buttons">
                <Link to="/login" className="btn btn--primary">Sign in <ArrowRight size={16} /></Link>
                <Link to="/signup" className="btn btn--outline">Create free account</Link>
              </div>
            )}
          </div>
        </div>

        <div className="rx-public__products">
          <h2>Common prescription medicines</h2>
          <p>These products require a valid prescription. Upload yours to add them to your cart.</p>
          <div className="rx-public__product-list">
            {rxProducts.map((p) => (
              <Link to={p.link} key={p.name} className="rx-public__product">
                <div className="rx-public__product-info">
                  <strong>{p.name}</strong>
                  <span className="rx-public__product-badge"><FileText size={12} /> Rx required</span>
                </div>
                <span className="rx-public__product-price">{p.price}</span>
              </Link>
            ))}
          </div>
        </div>

        <div className="rx-public__trust">
          <div className="rx-public__trust-item"><Check size={18} /> Reviewed by licensed PPB pharmacists</div>
          <div className="rx-public__trust-item"><Check size={18} /> Secure and confidential</div>
          <div className="rx-public__trust-item"><Check size={18} /> Same-day review during business hours</div>
        </div>
      </section>
    </PageShell>
  );
}
