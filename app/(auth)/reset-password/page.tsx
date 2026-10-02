import type { Metadata } from 'next';
import { NOINDEX } from '@/constants/seo';
import { ResetPasswordForm } from '@/components/auth/ResetPasswordForm';

export const metadata: Metadata = {
  title: 'Reset password',
  robots: NOINDEX,
};

interface ResetPasswordPageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export default async function ResetPasswordPage({ searchParams }: ResetPasswordPageProps) {
  const sp = await searchParams;
  const token = typeof sp.token === 'string' ? sp.token : undefined;
  return <ResetPasswordForm token={token} />;
}
