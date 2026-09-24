import { createContext, useEffect, useState, type ReactNode } from 'react';
import type { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';

export type DemoRole = 'customer' | 'admin' | 'pharmacist';

export interface DemoUser {
  id: string;
  email: string;
  name: string;
  role: DemoRole;
  get isAdmin(): boolean;
  get isPharmacist(): boolean;
}

export interface AuthContextValue {
  session: Session | null;
  user: User | null;
  demoUser: DemoUser | null;
  isAdmin: boolean;
  isPharmacist: boolean;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signUp: (email: string, password: string, fullName: string) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
}

function makeDemoUser(id: string, email: string, name: string, role: DemoRole): DemoUser {
  return {
    id, email, name, role,
    get isAdmin() { return role === 'admin'; },
    get isPharmacist() { return role === 'pharmacist' || role === 'admin'; },
  } as DemoUser;
}

const DEMO_CUSTOMER = makeDemoUser('demo-customer', 'customer@moran.co.ke', 'Wanjiku Mwangi', 'customer');
const DEMO_ADMIN = makeDemoUser('demo-admin', 'admin@moran.co.ke', 'Moran Admin', 'admin');
const DEMO_PHARMACIST = makeDemoUser('demo-pharmacist', 'pharmacist@moran.co.ke', 'Dr. Achieng Otieno', 'pharmacist');
const DEMO_PASSWORD = 'demo1234';

export const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [demoUser, setDemoUser] = useState<DemoUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem('moran-demo-user');
    if (stored) {
      try {
        const parsed = JSON.parse(stored) as { id: string; email: string; name: string; role: DemoRole };
        if (parsed.id === DEMO_CUSTOMER.id) setDemoUser(DEMO_CUSTOMER);
        else if (parsed.id === DEMO_ADMIN.id) setDemoUser(DEMO_ADMIN);
        else if (parsed.id === DEMO_PHARMACIST.id) setDemoUser(DEMO_PHARMACIST);
        else setDemoUser(makeDemoUser(parsed.id, parsed.email, parsed.name, parsed.role));
      } catch { /* ignore */ }
    }

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
  const metaRole = user?.app_metadata?.role as string | undefined;
  const isAdmin = demoUser?.isAdmin ?? metaRole === 'admin';
  const isPharmacist = demoUser?.isPharmacist ?? (metaRole === 'pharmacist' || metaRole === 'admin');

  const signIn: AuthContextValue['signIn'] = async (email, password) => {
    if (email === DEMO_CUSTOMER.email && password === DEMO_PASSWORD) {
      setDemoUser(DEMO_CUSTOMER); localStorage.setItem('moran-demo-user', JSON.stringify({ id: DEMO_CUSTOMER.id, email: DEMO_CUSTOMER.email, name: DEMO_CUSTOMER.name, role: DEMO_CUSTOMER.role })); return { error: null };
    }
    if (email === DEMO_ADMIN.email && password === DEMO_PASSWORD) {
      setDemoUser(DEMO_ADMIN); localStorage.setItem('moran-demo-user', JSON.stringify({ id: DEMO_ADMIN.id, email: DEMO_ADMIN.email, name: DEMO_ADMIN.name, role: DEMO_ADMIN.role })); return { error: null };
    }
    if (email === DEMO_PHARMACIST.email && password === DEMO_PASSWORD) {
      setDemoUser(DEMO_PHARMACIST); localStorage.setItem('moran-demo-user', JSON.stringify({ id: DEMO_PHARMACIST.id, email: DEMO_PHARMACIST.email, name: DEMO_PHARMACIST.name, role: DEMO_PHARMACIST.role })); return { error: null };
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
    <AuthContext.Provider value={{ session, user, demoUser, isAdmin, isPharmacist, loading, signIn, signUp, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}
