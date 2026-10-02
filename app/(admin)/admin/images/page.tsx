import type { Metadata } from 'next';
import { NOINDEX } from '@/constants/seo';
import { AdminImages } from '@/components/admin';

export const metadata: Metadata = {
  title: 'Image inventory',
  robots: NOINDEX,
};

export default function AdminImagesPage() {
  return (
    <section>
      <AdminImages />
    </section>
  );
}

