import type { Metadata } from 'next';
import { NOINDEX } from '@/constants/seo';
import { AdminUsers } from '@/components/admin';

export const metadata: Metadata = {
  title: 'Users',
  robots: NOINDEX,
};

export default function AdminUsersPage() {
  return (
    <section>
      <AdminUsers />
    </section>
  );
}

