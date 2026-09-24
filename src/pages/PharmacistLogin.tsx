import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, Eye, EyeOff, Lock, Mail, ShieldCheck, Stethoscope, Zap } from 'lucide-react';
import { useAuth } from '@/contexts/useAuth';
import { supabase } from '@/lib/supabase';
import { PageShell } from '@/components/PageShell';
import { AuthLayout } from '@/components/AuthForm';

export function PharmacistLoginPage() {
  const { signIn, demoUser, user, isPharmacist } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  if (demoUser?.isPharmacist || (user && isPharmacist)) {
    navigate('/pharmacist');
  }

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setError(null);
    setLoading(true);

    const { error: signInError } = await signIn(email, password);
    if (signInError) {
      setError(signInError);
      setLoading(false);
      return;
    }

    const isDemoPharmacist = email === 'pharmacist@moran.co.ke' || email === 'admin@moran.co.ke';

    if (isDemoPharmacist) {
      navigate('/pharmacist');
      return;
    }

    const { data: sessionData } = await supabase.auth.getSession();
    const metaRole = sessionData.session?.user?.app_metadata?.role as string | undefined;
    if (metaRole === 'pharmacist' || metaRole === 'admin') {
      navigate('/pharmacist');
    } else {
      setError('This account does not have pharmacist privileges. Please use a pharmacist or admin account.');
      await supabase.auth.signOut();
    }
    setLoading(false);
  };

  const fillDemo = (type: 'pharmacist' | 'admin') => {
    if (type === 'admin') { setEmail('admin@moran.co.ke'); setPassword('demo1234'); }
    else { setEmail('pharmacist@moran.co.ke'); setPassword('demo1234'); }
  };

  return (
    <PageShell>
      <AuthLayout>
        <div className="auth">
          <div className="auth__card">
            <div className="auth__head">
              <span className="eyebrow"><Stethoscope size={14} /> Pharmacist access</span>
              <h1>Pharmacist sign in</h1>
              <p>Sign in to review prescription uploads from customers.</p>
            </div>

            <div className="auth__admin-note"><ShieldCheck size={18} /> Pharmacist accounts are provisioned by the Moran Pharmacy team. Only licensed staff can access this portal.</div>

            <div className="auth__demo-box">
              <div className="auth__demo-head"><Zap size={16} /> <span>Demo accounts — click to auto-fill</span></div>
              <div className="auth__demo-buttons">
                <button type="button" className="auth__demo-btn" onClick={() => fillDemo('pharmacist')}><Stethoscope size={15} /> <span><strong>Pharmacist</strong><small>pharmacist@moran.co.ke</small></span></button>
                <button type="button" className="auth__demo-btn" onClick={() => fillDemo('admin')}><ShieldCheck size={15} /> <span><strong>Admin</strong><small>admin@moran.co.ke</small></span></button>
              </div>
              <div className="auth__demo-pwd">Password for both: <code>demo1234</code></div>
            </div>

            <form className="auth__form" onSubmit={submit}>
              <label className="auth__field">
                <span>Email address</span>
                <div className="auth__input-wrap"><Mail size={17} /><input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@moranpharmacy.co.ke" /></div>
              </label>
              <label className="auth__field">
                <span>Password</span>
                <div className="auth__input-wrap"><Lock size={17} /><input type={showPassword ? 'text' : 'password'} required minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="At least 6 characters" /><button type="button" className="auth__toggle" onClick={() => setShowPassword(!showPassword)} aria-label="Toggle password visibility">{showPassword ? <EyeOff size={17} /> : <Eye size={17} />}</button></div>
              </label>

              {error && <div className="auth__error">{error}</div>}

              <button type="submit" className="btn btn--primary auth__submit" disabled={loading}>
                {loading ? 'Please wait…' : (<>Sign in <ArrowRight size={16} /></>)}
              </button>
            </form>

            <div className="auth__footer">
              <Link to="/login" className="auth__switch">Customer sign in</Link>
              <span className="auth__sep" />
              <Link to="/admin-login" className="auth__switch">Admin sign in</Link>
            </div>
          </div>
        </div>
      </AuthLayout>
    </PageShell>
  );
}
