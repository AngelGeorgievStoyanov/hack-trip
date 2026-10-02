import type { Metadata } from 'next';
import { NOINDEX } from '@/constants/seo';
import { RegisterForm } from '@/components/auth/RegisterForm';

export const metadata: Metadata = {
  title: 'Register',
  robots: NOINDEX,
};

export default function RegisterPage() {
  return <RegisterForm />;
}
