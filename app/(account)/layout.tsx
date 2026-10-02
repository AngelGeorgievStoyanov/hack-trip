import { Header } from '@/components/layout/Header';
import { RequireAuth } from '@/components/auth';

export default function AccountLayout({ children }: { children: React.ReactNode }) {
  return (
    <RequireAuth>
      <Header />
      <main style={{ padding: '2rem' }}>{children}</main>
    </RequireAuth>
  );
}
