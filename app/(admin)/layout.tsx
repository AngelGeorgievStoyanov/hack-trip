import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { RequireRole } from '@/components/auth';
import { MODERATOR_ROLES } from '@/constants/roles';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <RequireRole roles={[...MODERATOR_ROLES]}>
      <Header />
      <main style={{ padding: '2rem' }}>{children}</main>
      <Footer />
    </RequireRole>
  );
}
