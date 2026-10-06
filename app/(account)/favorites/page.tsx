'use client';

import { useQuery } from '@tanstack/react-query';
import { Alert, CircularProgress } from '@mui/material';
import { tripApi } from '@/api/trips';
import { TripList } from '@/components/trips/TripList';
import { getGenericErrorMessage } from '@/lib/errors';

export default function FavoritesPage() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['me', 'favorites'],
    queryFn: () => tripApi.listMyFavorites(),
  });

  if (isLoading) {
    return (
      <section>
        <h1>Favorites</h1>
        <CircularProgress size={24} />
      </section>
    );
  }

  if (error) {
    return (
      <section>
        <h1>Favorites</h1>
        <Alert severity="error">{getGenericErrorMessage(error)}</Alert>
      </section>
    );
  }

  const trips = data ?? [];

  if (trips.length === 0) {
    return (
      <section>
        <h1>Favorites</h1>
        <p>You don&apos;t have a favorites trip yet.</p>
      </section>
    );
  }

  return (
    <section>
      <h1>Favorites</h1>
      <TripList trips={trips} />
    </section>
  );
}
