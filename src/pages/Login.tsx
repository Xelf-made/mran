import { PageShell } from '@/components/PageShell';
import { AuthForm, AuthLayout } from '@/components/AuthForm';

export function LoginPage() {
  return <PageShell><AuthLayout><AuthForm mode="login" /></AuthLayout></PageShell>;
}
