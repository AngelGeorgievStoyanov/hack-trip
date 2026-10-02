import type { Metadata } from 'next';
import { TripForm } from '@/components/trips/TripForm';

export const metadata: Metadata = {
  title: 'Create trip',
  robots: { index: false, follow: false },
};

export default function CreateTripPage() {
  return <TripForm />;
}
