import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Admin',
  robots: { index: false, follow: false },
};

export default function AdminPage() {
  return (
    <section>
      <h1>Admin</h1>
      <p>Admin dashboard will be implemented in the admin step.</p>
    </section>
  );
}
