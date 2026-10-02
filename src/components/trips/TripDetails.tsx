import Link from 'next/link';
import { AppImage } from '@/components/images/AppImage';
import { EngagementBar } from '@/components/social/EngagementBar';
import { TripActions } from './TripActions';
import { CommentsSection } from '@/components/comments/CommentsSection';
import type { TripDetails as TripDetailsDto } from '@/types';

export function TripDetails({ trip }: { trip: TripDetailsDto }) {
  return (
    <article>
      <header>
        <h1>{trip.title}</h1>
        {trip.description ? <p>{trip.description}</p> : null}
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
          {day.images.length > 0 ? (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
              {day.images.map((img) => (
                <div key={img.id} style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                  <AppImage image={img} alt={day.title ?? `Day ${day.day}`} preset="gallery" />
                  <EngagementBar
                    targetType="image"
                    targetId={img.id}
                    social={img.social}
                    commentTarget={{ type: 'image', imageId: img.id }}
                  />
                </div>
              ))}
            </div>
          ) : null}
          {day.points.length > 0 ? (
            <ol>
              {day.points.map((point) => (
                <li key={point.id}>
                  <h3>
                    <Link href={`/points/${point.id}`}>{point.title}</Link>
                  </h3>
                  {point.description ? <p>{point.description}</p> : null}
                  {point.latitude != null && point.longitude != null ? (
                    <p>
                      {point.latitude.toFixed(6)}, {point.longitude.toFixed(6)}
                    </p>
                  ) : null}
                  {point.images.length > 0 ? (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                      {point.images.map((img) => (
                        <div key={img.id} style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                          <AppImage image={img} alt={point.title} preset="tripPointThumb" />
                          <EngagementBar
                            targetType="image"
                            targetId={img.id}
                            social={img.social}
                            commentTarget={{ type: 'image', imageId: img.id }}
                          />
                        </div>
                      ))}
                    </div>
                  ) : null}
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
