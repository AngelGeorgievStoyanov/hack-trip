import { AppImage } from '@/components/images/AppImage';
import { PointActions } from './PointActions';
import { CommentsSection } from '@/components/comments/CommentsSection';
import type { TripPoint } from '@/types';

/** Server-rendered point detail: title, description, coordinates and images. */
export function PointDetails({ point }: { point: TripPoint }) {
  const hero = point.images[0];

  return (
    <article>
      <h1>{point.title}</h1>
      {point.description ? <p>{point.description}</p> : null}
      {point.latitude != null && point.longitude != null ? (
        <p>
          Coordinates: {point.latitude.toFixed(6)}, {point.longitude.toFixed(6)}
        </p>
      ) : null}
      <PointActions point={point} />

      {hero ? (
        <AppImage image={hero} alt={point.title} width={1200} height={630} sizes="100vw" priority />
      ) : null}
      {point.images.slice(1).map((img) => (
        <AppImage
          key={img.id}
          image={img}
          alt={point.title}
          useThumbnail
          width={240}
          height={180}
          sizes="(max-width: 600px) 50vw, 33vw"
        />
      ))}

      <CommentsSection target={{ type: 'point', pointId: point.id }} />
    </article>
  );
}
