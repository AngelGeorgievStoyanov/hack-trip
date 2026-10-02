import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Image inventory',
  robots: { index: false, follow: false },
};

export default function AdminImagesPage() {
  return (
    <section>
      <h1>Image inventory</h1>
      <p>Image inventory (cloud/database/orphans) will be implemented in the admin step.</p>
    </section>
  );
}
