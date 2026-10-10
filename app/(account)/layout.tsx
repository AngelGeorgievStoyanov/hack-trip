import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { RequireAuth } from '@/components/auth';

export default function AccountLayout({ children }: { children: React.ReactNode }) {
  return (
    <RequireAuth>
      <Header />
      <main style={{ padding: '2rem' }}>{children}</main>
      <Footer />
    </RequireAuth>
  );
}
