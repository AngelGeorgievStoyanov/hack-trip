import { AppImage } from '@/components/images/AppImage';
import { EngagementBar } from '@/components/social/EngagementBar';
import { PointActions } from './PointActions';
import { CommentsSection } from '@/components/comments/CommentsSection';
import type { TripPoint } from '@/types';

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
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
          <AppImage image={hero} alt={point.title} width={1200} height={630} sizes="100vw" priority />
          <EngagementBar
            targetType="image"
            targetId={hero.id}
            social={hero.social}
            commentTarget={{ type: 'image', imageId: hero.id }}
          />
        </div>
      ) : null}
      {point.images.slice(1).map((img) => (
        <div key={img.id} style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
          <AppImage
            image={img}
            alt={point.title}
            useThumbnail
            width={240}
            height={180}
            sizes="(max-width: 600px) 50vw, 33vw"
          />
          <EngagementBar
            targetType="image"
            targetId={img.id}
            social={img.social}
            commentTarget={{ type: 'image', imageId: img.id }}
          />
        </div>
      ))}

      <CommentsSection target={{ type: 'point', pointId: point.id }} />
    </article>
  );
}
