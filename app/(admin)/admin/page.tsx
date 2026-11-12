import type { Metadata } from 'next';
import { NOINDEX } from '@/constants/seo';

export const metadata: Metadata = {
  title: 'Admin',
  robots: NOINDEX,
};

export default function AdminPage() {
  return (
    <section>
      <h1>Admin</h1>
    </section>
  );
}
