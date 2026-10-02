import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { TripForm } from '@/components/trips/TripForm';
import { TripDaysManager } from '@/components/trips/TripDaysManager';
import { getTrip, isNotFoundError } from '@/lib/serverApi';
import { positiveIdParam } from '@/validations';

export const metadata: Metadata = {
  title: 'Edit trip',
  robots: { index: false, follow: false },
};

interface EditTripPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditTripPage({ params }: EditTripPageProps) {
  const { id } = await params;
  const parsed = positiveIdParam.safeParse(id);
  if (!parsed.success) {
    notFound();
  }
  const tripId = Number(parsed.data);

  let trip;
  try {
    trip = await getTrip(tripId);
  } catch (error) {
    if (isNotFoundError(error)) {
      notFound();
    }
    throw error;
  }

  return (
    <div style={{ maxWidth: 720, display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
      <TripForm
        tripId={trip.id}
        initial={{
          title: trip.title,
          description: trip.description,
          group: trip.group.key,
          transport: trip.transport.key,
        }}
      />
      <TripDaysManager tripId={trip.id} initialTrip={trip} />
    </div>
  );
}

