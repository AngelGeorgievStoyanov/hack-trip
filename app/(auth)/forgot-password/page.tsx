import type { Metadata } from 'next';
import { NOINDEX } from '@/constants/seo';
import { ForgotPasswordForm } from '@/components/auth/ForgotPasswordForm';

export const metadata: Metadata = {
  title: 'Forgot password',
  robots: NOINDEX,
};

export default function ForgotPasswordPage() {
  return <ForgotPasswordForm />;
}
