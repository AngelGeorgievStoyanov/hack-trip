import { TripCard } from './TripCard';
import type { TripListItem } from '@/types';

export function TripList({ trips }: { trips: TripListItem[] }) {
  if (trips.length === 0) {
    return <p>No trips found.</p>;
  }

  return (
    <ul
      style={{
        listStyle: 'none',
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
        gap: '1.25rem',
        padding: 0,
        margin: 0,
      }}
    >
      {trips.map((trip) => (
        <li key={trip.id}>
          <TripCard trip={trip} />
        </li>
      ))}
    </ul>
  );
}
