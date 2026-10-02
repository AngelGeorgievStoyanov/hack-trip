import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Users',
  robots: { index: false, follow: false },
};

export default function AdminUsersPage() {
  return (
    <section>
      <h1>Users</h1>
      <p>User administration will be implemented in the admin step.</p>
    </section>
  );
}
