import { useState, type FormEvent, type ReactNode } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, Eye, EyeOff, Lock, Mail, ShieldCheck, User, Zap } from 'lucide-react';
import { useAuth } from '@/contexts/useAuth';

export function AuthForm({ mode, adminMode }: { mode: 'login' | 'signup'; adminMode?: boolean }) {
  const { signIn, signUp } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setError(null);
    setLoading(true);

    if (mode === 'signup') {
      const { error: signUpError } = await signUp(email, password, fullName);
      if (signUpError) { setError(signUpError); setLoading(false); return; }
      navigate('/account');
    } else {
      const { error: signInError } = await signIn(email, password);
      if (signInError) { setError(signInError); setLoading(false); return; }
      if (adminMode) { navigate('/admin'); return; }
      navigate('/account');
    }
  };

  const fillDemo = (type: 'customer' | 'admin') => {
    if (type === 'admin') { setEmail('admin@moran.co.ke'); setPassword('demo1234'); }
    else { setEmail('customer@moran.co.ke'); setPassword('demo1234'); }
  };

  return (
    <div className="auth">
      <div className="auth__card">
        <div className="auth__head">
          <span className="eyebrow">{adminMode ? 'Admin access' : mode === 'login' ? 'Welcome back' : 'Join Moran'}</span>
          <h1>{adminMode ? 'Admin sign in' : mode === 'login' ? 'Sign in' : 'Create your account'}</h1>
          <p>{adminMode ? 'Sign in to manage orders and products.' : mode === 'login' ? 'Sign in to track orders and check out faster.' : 'Create an account to order and track your deliveries.'}</p>
        </div>

        {adminMode && <div className="auth__admin-note"><ShieldCheck size={18} /> Admin accounts are provisioned by the Moran Pharmacy team.</div>}

        {mode === 'login' && (
          <div className="auth__demo-box">
            <div className="auth__demo-head"><Zap size={16} /> <span>Demo accounts — click to auto-fill</span></div>
            <div className="auth__demo-buttons">
              {!adminMode && <button type="button" className="auth__demo-btn" onClick={() => fillDemo('customer')}><User size={15} /> <span><strong>Customer</strong><small>customer@moran.co.ke</small></span></button>}
              <button type="button" className="auth__demo-btn" onClick={() => fillDemo('admin')}><ShieldCheck size={15} /> <span><strong>Admin</strong><small>admin@moran.co.ke</small></span></button>
            </div>
            <div className="auth__demo-pwd">Password for both: <code>demo1234</code></div>
          </div>
        )}

        <form className="auth__form" onSubmit={submit}>
          {mode === 'signup' && (
            <label className="auth__field">
              <span>Full name</span>
              <div className="auth__input-wrap"><User size={17} /><input type="text" required value={fullName} onChange={(event) => setFullName(event.target.value)} placeholder="Your full name" /></div>
            </label>
          )}
          <label className="auth__field">
            <span>Email address</span>
            <div className="auth__input-wrap"><Mail size={17} /><input type="email" required value={email} onChange={(event) => setEmail(event.target.value)} placeholder="you@email.com" /></div>
          </label>
          <label className="auth__field">
            <span>Password</span>
            <div className="auth__input-wrap"><Lock size={17} /><input type={showPassword ? 'text' : 'password'} required minLength={6} value={password} onChange={(event) => setPassword(event.target.value)} placeholder="At least 6 characters" /><button type="button" className="auth__toggle" onClick={() => setShowPassword(!showPassword)} aria-label="Toggle password visibility">{showPassword ? <EyeOff size={17} /> : <Eye size={17} />}</button></div>
          </label>

          {error && <div className="auth__error">{error}</div>}

          <button type="submit" className="btn btn--primary auth__submit" disabled={loading}>
            {loading ? 'Please wait…' : (<>{mode === 'login' ? 'Sign in' : 'Create account'} <ArrowRight size={16} /></>)}
          </button>
        </form>

        <div className="auth__footer">
          {adminMode ? (
            <Link to="/login" className="auth__switch">Are you a customer? Sign in here</Link>
          ) : mode === 'login' ? (
            <>
              <span>Don't have an account?</span>
              <div className="auth__switch-row">
                <Link to="/signup" className="auth__switch auth__switch--link">Create one</Link>
                <span className="auth__sep" />
                <Link to="/admin-login" className="auth__switch auth__switch--link">Admin sign in</Link>
              </div>
            </>
          ) : (
            <span>Already have an account? <Link to="/login" className="auth__switch auth__switch--link">Sign in</Link></span>
          )}
        </div>
      </div>
    </div>
  );
}

export function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="auth-layout">
      <div className="auth-layout__image" />
      <div className="auth-layout__form">{children}</div>
    </div>
  );
}
