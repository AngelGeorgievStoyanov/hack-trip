import type { Metadata } from 'next';
import { NOINDEX } from '@/constants/seo';
import { AdminUserForm } from '@/components/admin';

interface AdminUserEditPageProps {
  params: Promise<{ userId: string }>;
}

export const metadata: Metadata = {
  title: 'Edit user',
  robots: NOINDEX,
};

export default async function AdminUserEditPage({ params }: AdminUserEditPageProps) {
  const { userId } = await params;
  return (
    <section>
      <AdminUserForm userId={userId} />
    </section>
  );
}

