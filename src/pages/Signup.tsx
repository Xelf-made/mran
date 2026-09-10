import { PageShell } from '@/components/PageShell';
import { AuthForm, AuthLayout } from '@/components/AuthForm';

export function SignupPage() {
  return <PageShell><AuthLayout><AuthForm mode="signup" /></AuthLayout></PageShell>;
}
