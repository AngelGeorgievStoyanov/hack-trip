import type { Metadata } from 'next';
import { Suspense } from 'react';
import { NOINDEX } from '@/constants/seo';
import { TripForm } from '@/components/trips/TripForm';

export const metadata: Metadata = {
  title: 'Create trip',
  robots: NOINDEX,
};

export default function CreateTripPage() {
  return (
    <Suspense fallback={null}>
      <TripForm />
    </Suspense>
  );
}
