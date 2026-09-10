import { createContext, useEffect, useState, type ReactNode } from 'react';
import type { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';

export interface DemoUser {
  id: string;
  email: string;
  name: string;
  isAdmin: boolean;
}

export interface AuthContextValue {
  session: Session | null;
  user: User | null;
  demoUser: DemoUser | null;
  isAdmin: boolean;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signUp: (email: string, password: string, fullName: string) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
}

const DEMO_CUSTOMER: DemoUser = { id: 'demo-customer', email: 'customer@moran.co.ke', name: 'Wanjiku Mwangi', isAdmin: false };
const DEMO_ADMIN: DemoUser = { id: 'demo-admin', email: 'admin@moran.co.ke', name: 'Moran Admin', isAdmin: true };
const DEMO_PASSWORD = 'demo1234';

export const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [demoUser, setDemoUser] = useState<DemoUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem('moran-demo-user');
    if (stored) { try { setDemoUser(JSON.parse(stored) as DemoUser); } catch { /* ignore */ } }

    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setLoading(false);
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession);
      setLoading(false);
    });

    return () => { listener.subscription.unsubscribe(); };
  }, []);

  const user = session?.user ?? null;
  const isAdmin = demoUser?.isAdmin ?? user?.app_metadata?.role === 'admin';

  const signIn: AuthContextValue['signIn'] = async (email, password) => {
    if (email === DEMO_CUSTOMER.email && password === DEMO_PASSWORD) {
      setDemoUser(DEMO_CUSTOMER); localStorage.setItem('moran-demo-user', JSON.stringify(DEMO_CUSTOMER)); return { error: null };
    }
    if (email === DEMO_ADMIN.email && password === DEMO_PASSWORD) {
      setDemoUser(DEMO_ADMIN); localStorage.setItem('moran-demo-user', JSON.stringify(DEMO_ADMIN)); return { error: null };
    }
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return { error: error?.message ?? null };
  };

  const signUp: AuthContextValue['signUp'] = async (email, password, fullName) => {
    const { error } = await supabase.auth.signUp({ email, password, options: { data: { full_name: fullName } } });
    return { error: error?.message ?? null };
  };

  const signOut = async () => {
    if (demoUser) { setDemoUser(null); localStorage.removeItem('moran-demo-user'); }
    await supabase.auth.signOut();
  };

  return (
    <AuthContext.Provider value={{ session, user, demoUser, isAdmin, loading, signIn, signUp, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}
