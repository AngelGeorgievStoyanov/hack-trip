'use client';

import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { Alert, CircularProgress } from '@mui/material';
import { tripApi } from '@/api/trips';
import { TripList } from '@/components/trips/TripList';
import { getGenericErrorMessage } from '@/lib/errors';

export default function MyTripsPage() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['me', 'trips'],
    queryFn: () => tripApi.listMyTrips(),
  });

  if (isLoading) {
    return (
      <section>
        <h1>My trips</h1>
        <CircularProgress size={24} />
      </section>
    );
  }

  if (error) {
    return (
      <section>
        <h1>My trips</h1>
        <Alert severity="error">{getGenericErrorMessage(error)}</Alert>
      </section>
    );
  }

  const trips = data ?? [];

  if (trips.length === 0) {
    return (
      <section>
        <h1>My trips</h1>
        <p>You don&apos;t have a published trip yet.</p>
        <Link href="/trips/create">CLICK HERE AND ADD YOUR FIRST TRIP</Link>
      </section>
    );
  }

  return (
    <section>
      <h1>My trips</h1>
      <TripList trips={trips} />
    </section>
  );
}
