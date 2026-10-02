import type { Metadata } from 'next';
import { NOINDEX } from '@/constants/seo';
import { LoginForm } from '@/components/auth/LoginForm';

export const metadata: Metadata = {
  title: 'Login',
  robots: NOINDEX,
};

export default function LoginPage() {
  return <LoginForm />;
}
