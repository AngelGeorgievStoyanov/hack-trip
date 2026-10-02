import type { Metadata } from 'next';

interface AdminUserEditPageProps {
  params: Promise<{ userId: string }>;
}

export const metadata: Metadata = {
  title: 'Edit user',
  robots: { index: false, follow: false },
};

export default async function AdminUserEditPage({ params }: AdminUserEditPageProps) {
  const { userId } = await params;
  return (
    <section>
      <h1>Edit user {userId}</h1>
      <p>User editing will be implemented in the admin step.</p>
    </section>
  );
}
