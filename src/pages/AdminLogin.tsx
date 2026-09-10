import { PageShell } from '@/components/PageShell';
import { AuthForm, AuthLayout } from '@/components/AuthForm';

export function AdminLoginPage() {
  return <PageShell><AuthLayout><AuthForm mode="login" adminMode /></AuthLayout></PageShell>;
}
