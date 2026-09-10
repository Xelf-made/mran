import { type ReactNode } from 'react';
import { Navbar, Footer } from '@/components/Layout';

export function PageShell({ children }: { children: ReactNode }) {
  return <><Navbar /><main className="page">{children}</main><Footer /></>;
}
