import type { Metadata } from 'next';
import { NOINDEX } from '@/constants/seo';
import { notFound } from 'next/navigation';
import { RequireTripOwner } from '@/components/auth';
import { TripDaysManager } from '@/components/trips/TripDaysManager';
import { getTrip, isNotFoundError } from '@/lib/serverApi';
import { positiveIdParam } from '@/validations';
import type { TripGroupResponse } from '@/types';

export const metadata: Metadata = {
  title: 'Edit trip',
  robots: NOINDEX,
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
  const tripGroupId = Number(parsed.data);

  let trip: TripGroupResponse;
  try {
    trip = await getTrip(tripGroupId);
  } catch (error) {
    if (isNotFoundError(error)) {
      notFound();
    }
    throw error;
  }

  // There is no trip-level update endpoint: trip metadata is day-scoped, so editing the
  // trip happens through its days (`PUT /trips/:tripGroupId/days/:dayId`).
  return (
    <RequireTripOwner tripGroupId={trip.id}>
      <div style={{ maxWidth: 720, display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
        <TripDaysManager tripGroupId={trip.id} initialTrip={trip} />
      </div>
    </RequireTripOwner>
  );
}

