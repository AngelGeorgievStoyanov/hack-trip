import Link from 'next/link';
import { AppImage } from '@/components/images/AppImage';
import { IMAGE_SIZES } from '@/lib/images/imageMetadata';
import type { TripListItem } from '@/types';

/** Presentational trip card for list pages. Uses the centralized image layer. */
export function TripCard({ trip }: { trip: TripListItem }) {
  return (
    <article>
      <Link href={`/trips/${trip.id}`}>
        <AppImage
          src={trip.coverImage}
          alt={trip.title}
          width={400}
          height={240}
          sizes={IMAGE_SIZES.card}
        />
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
