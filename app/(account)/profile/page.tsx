import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Profile',
  robots: { index: false, follow: false },
};

export default function ProfilePage() {
  return (
    <section>
      <h1>Profile</h1>
      <p>Account profile will be implemented in a later step.</p>
    </section>
  );
}
