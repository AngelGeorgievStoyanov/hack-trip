import { SocialImageGallery } from '@/components/images/SocialImageGallery';
import { ExpandableText } from '@/components/common/ExpandableText';
import { PointActions } from './PointActions';
import { CommentsSection } from '@/components/comments/CommentsSection';
import type { TripPoint } from '@/types';

export function PointDetails({ point }: { point: TripPoint }) {
  return (
    <article>
      <h1>{point.title}</h1>
      {point.description ? <ExpandableText text={point.description} /> : null}
      {point.latitude != null && point.longitude != null ? (
        <p>
          Coordinates: {point.latitude.toFixed(6)}, {point.longitude.toFixed(6)}
        </p>
      ) : null}
      <PointActions point={point} />

      <SocialImageGallery
        images={point.images}
        alt={point.title}
        preset="gallery"
        leadPreset="hero"
        variant="stack"
      />

      <CommentsSection target={{ type: 'point', pointId: point.id }} />
    </article>
  );
}
