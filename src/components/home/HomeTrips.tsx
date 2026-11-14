import { TripList } from '@/components/trips/TripList';
import { headingTextStyle } from '@/constants/ui';
import type { TripGroupResponse } from '@/types';

const HEADING_STYLE = {
  margin: '2px',
  textAlign: 'center' as const,
  ...headingTextStyle,
};

export function HomeTrips({ trips }: { trips: TripGroupResponse[] }) {
  if (trips.length === 0) return null;

  return (
    <>
      <h3 style={HEADING_STYLE}>These are our TOP 5 most liked in Hack Trips!</h3>
      <TripList trips={trips} prioritizeFirstImage />
    </>
  );
}
