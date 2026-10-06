import type { Metadata } from 'next';
import { NOINDEX } from '@/constants/seo';
import { AdminReports } from '@/components/admin';

export const metadata: Metadata = {
  title: 'Reports',
  robots: NOINDEX,
};

export default function AdminReportsPage() {
  return (
    <section>
      <h1>Reports</h1>
      <AdminReports />
    </section>
  );
}
