import type { Metadata } from 'next';
import { Suspense } from 'react';
import { NOINDEX } from '@/constants/seo';
import { CreatePointPage } from '@/components/points/CreatePointPage';

export const metadata: Metadata = {
  title: 'Add point',
  robots: NOINDEX,
};

export default function CreateTripPointPage() {
  return (
    <Suspense fallback={null}>
      <CreatePointPage />
    </Suspense>
  );
}
