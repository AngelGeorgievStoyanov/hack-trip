import { Header } from '@/components/layout/Header';
import { RequireRole } from '@/components/auth';
import { MODERATOR_ROLES } from '@/constants/roles';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <RequireRole roles={[...MODERATOR_ROLES]}>
      <Header />
      <main style={{ padding: '2rem' }}>{children}</main>
    </RequireRole>
  );
}
