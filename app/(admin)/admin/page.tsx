import type { Metadata } from 'next';
import { NOINDEX } from '@/constants/seo';
import { AdminDashboard } from '@/components/admin';

export const metadata: Metadata = {
  title: 'Admin',
  robots: NOINDEX,
};

export default function AdminPage() {
  return (
    <section>
      <h1>Admin</h1>
      <AdminDashboard />
    </section>
  );
}

