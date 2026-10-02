import type { Metadata } from 'next';
import { NOINDEX } from '@/constants/seo';
import { VerifyEmailForm } from '@/components/auth/VerifyEmailForm';

export const metadata: Metadata = {
  title: 'Verify email',
  robots: NOINDEX,
};

interface VerifyEmailPageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export default async function VerifyEmailPage({ searchParams }: VerifyEmailPageProps) {
  const sp = await searchParams;
  const token = typeof sp.token === 'string' ? sp.token : undefined;
  return <VerifyEmailForm token={token} />;
}
