import type { Metadata } from 'next';
import { Suspense } from 'react';
import { NOINDEX } from '@/constants/seo';
import { LoginForm } from '@/components/auth/LoginForm';
import { GuestOnly } from '@/components/auth/GuestOnly';

export const metadata: Metadata = {
  title: 'Login',
  robots: NOINDEX,
};

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <GuestOnly><LoginForm /></GuestOnly>
    </Suspense>
  );
}
