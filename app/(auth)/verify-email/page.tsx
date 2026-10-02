import type { Metadata } from 'next';
import { VerifyEmailForm } from '@/components/auth/VerifyEmailForm';

export const metadata: Metadata = {
  title: 'Verify email',
  robots: { index: false, follow: false },
};

interface VerifyEmailPageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export default async function VerifyEmailPage({ searchParams }: VerifyEmailPageProps) {
  const sp = await searchParams;
  const token = typeof sp.token === 'string' ? sp.token : undefined;
  return <VerifyEmailForm token={token} />;
}
