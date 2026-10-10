import { SocialImageGallery } from '@/components/images/SocialImageGallery';
import { ExpandableText } from '@/components/common/ExpandableText';
import { PointActions } from './PointActions';
import { CommentsSection } from '@/components/comments/CommentsSection';
import type { TripPoint } from '@/types';

export function PointDetails({ point }: { point: TripPoint }) {
  return (
    <article>
      <h1>{point.name}</h1>
      {point.description ? <ExpandableText text={point.description} /> : null}
      {point.lat != null && point.lng != null ? (
        <p>
          Coordinates: {point.lat.toFixed(6)}, {point.lng.toFixed(6)}
        </p>
      ) : null}
      <PointActions point={point} />

      <SocialImageGallery
        images={point.images}
        alt={point.name}
        preset="gallery"
        leadPreset="hero"
        variant="stack"
      />

      <CommentsSection target={{ type: 'point', pointId: point.id }} />
    </article>
  );
}
