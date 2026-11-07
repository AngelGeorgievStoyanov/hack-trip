'use client';

import { useEffect, useState } from 'react';
import { tripApi } from '@/api/trips';
import { TripList } from '@/components/trips/TripList';
import { headingTextStyle } from '@/constants/ui';
import type { TripGroupResponse } from '@/types';

const HEADING_STYLE = {
  margin: '2px',
  textAlign: 'center' as const,
  ...headingTextStyle,
};

export function HomeTrips() {
  const [trips, setTrips] = useState<TripGroupResponse[] | null>(null);

  useEffect(() => {
    let active = true;

    tripApi
      .getTopTrips()
      .then((result) => {
        if (active) setTrips(result);
      })
      .catch((error: unknown) => {
        console.error('[Home] Failed to load top trips:', error);
        if (active) setTrips([]);
      });

    return () => {
      active = false;
    };
  }, []);

  if (trips === null || trips.length === 0) {
    return null;
  }

  return (
    <>
      <h3 style={HEADING_STYLE}>These are our TOP 5 most liked in Hack Trips!</h3>
      <TripList trips={trips} />
    </>
  );
}
