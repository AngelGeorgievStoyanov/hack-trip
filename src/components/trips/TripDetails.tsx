import { AppImage } from '@/components/images/AppImage';
import { ShareButton } from '@/components/social/ShareButton';
import { absoluteUrl } from '@/config';
import type { TripDetails as TripDetailsDto } from '@/types';

/**
 * Server-rendered trip detail: title, description, author, group/transport, days, points
 * and images. Interactive pieces (Share, like/favorite later, map later) stay client-side.
 */
export function TripDetails({ trip }: { trip: TripDetailsDto }) {
  const url = absoluteUrl(`/trips/${trip.id}`);

  return (
    <article>
      <header>
        <h1>{trip.title}</h1>
        {trip.description ? <p>{trip.description}</p> : null}
        <p>
          By {trip.author.firstName} {trip.author.lastName} · {trip.group.name} ·{' '}
          {trip.transport.name}
        </p>
        <ShareButton url={url} title={trip.title} text={trip.description ?? undefined} />
      </header>

      {trip.coverImage ? (
        <AppImage
          src={trip.coverImage}
          alt={trip.title}
          width={1200}
          height={630}
          sizes="100vw"
          priority
        />
      ) : null}

      {trip.days.map((day) => (
        <section key={day.id}>
          <h2>{day.title ?? `Day ${day.day}`}</h2>
          {day.images.length > 0 ? (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
              {day.images.map((img) => (
                <AppImage
                  key={img.id}
                  image={img}
                  alt={day.title ?? `Day ${day.day}`}
                  useThumbnail
                  width={240}
                  height={180}
                  sizes="(max-width: 600px) 50vw, 33vw"
                />
              ))}
            </div>
          ) : null}
          {day.points.length > 0 ? (
            <ol>
              {day.points.map((point) => (
                <li key={point.id}>
                  <h3>{point.title}</h3>
                  {point.description ? <p>{point.description}</p> : null}
                  {point.latitude != null && point.longitude != null ? (
                    <p>
                      {point.latitude.toFixed(6)}, {point.longitude.toFixed(6)}
                    </p>
                  ) : null}
                  {point.images.length > 0 ? (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                      {point.images.map((img) => (
                        <AppImage
                          key={img.id}
                          image={img}
                          alt={point.title}
                          useThumbnail
                          width={200}
                          height={150}
                        />
                      ))}
                    </div>
                  ) : null}
                </li>
              ))}
            </ol>
          ) : null}
        </section>
      ))}
    </article>
  );
}
