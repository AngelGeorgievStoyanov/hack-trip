import type { Metadata } from 'next';
import { NOINDEX } from '@/constants/seo';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { RequireAuth } from '@/components/auth';

export const metadata: Metadata = {
  robots: NOINDEX,
};

export default function AccountLayout({ children }: { children: React.ReactNode }) {
  return (
    <RequireAuth>
      <Header />
      <main style={{ padding: '2rem', flex: 1 }}>{children}</main>
      <Footer />
    </RequireAuth>
  );
}
