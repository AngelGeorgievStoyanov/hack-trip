import Link from 'next/link';
import { AppImage } from '@/components/images/AppImage';
import type { TripListItem } from '@/types';

export function TripCard({ trip }: { trip: TripListItem }) {
  return (
    <article>
      <Link href={`/trips/${trip.id}`}>
        <AppImage src={trip.coverImage} alt={trip.title} preset="tripCard" />
      </Link>
      <h2>
        <Link href={`/trips/${trip.id}`}>{trip.title}</Link>
      </h2>
      {trip.description ? <p>{trip.description}</p> : null}
      <p>
        {trip.author.firstName} {trip.author.lastName}
      </p>
      <p>
        {trip.group.name} · {trip.transport.name}
      </p>
    </article>
  );
}
