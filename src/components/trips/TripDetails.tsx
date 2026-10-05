import Link from 'next/link';
import { AppImage } from '@/components/images/AppImage';
import { SocialImageGallery } from '@/components/images/SocialImageGallery';
import { ExpandableText } from '@/components/common/ExpandableText';
import { EngagementBar } from '@/components/social/EngagementBar';
import { TripActions } from './TripActions';
import { CommentsSection } from '@/components/comments/CommentsSection';
import type { TripDetails as TripDetailsDto } from '@/types';

export function TripDetails({ trip }: { trip: TripDetailsDto }) {
  return (
    <article>
      <header>
        <h1>{trip.title}</h1>
        {trip.description ? <ExpandableText text={trip.description} /> : null}
        <p>
          By {trip.author.firstName} {trip.author.lastName} · {trip.group.name} ·{' '}
          {trip.transport.name}
        </p>
        <TripActions trip={trip} />
      </header>

      {trip.coverImage ? (
        <AppImage src={trip.coverImage} alt={trip.title} preset="hero" />
      ) : null}

      {trip.days.map((day) => (
        <section key={day.id}>
          <h2>{day.title ?? `Day ${day.day}`}</h2>
          <SocialImageGallery images={day.images} alt={day.title ?? `Day ${day.day}`} preset="gallery" />
          {day.points.length > 0 ? (
            <ol>
              {day.points.map((point) => (
                <li key={point.id}>
                  <h3>
                    <Link href={`/points/${point.id}`}>{point.title}</Link>
                  </h3>
                  {point.description ? <ExpandableText text={point.description} /> : null}
                  {point.latitude != null && point.longitude != null ? (
                    <p>
                      {point.latitude.toFixed(6)}, {point.longitude.toFixed(6)}
                    </p>
                  ) : null}
                  <SocialImageGallery images={point.images} alt={point.title} preset="tripPointThumb" />
                </li>
              ))}
            </ol>
          ) : null}
          <EngagementBar
            targetType="day"
            targetId={day.id}
            social={day.social}
            commentTarget={{ type: 'day', tripId: trip.id, dayId: day.id }}
          />
        </section>
      ))}

      <CommentsSection target={{ type: 'tripGroup', tripGroupId: trip.id }} />
    </article>
  );
}
