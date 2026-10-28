'use client';

import { SocialImageGallery } from '@/components/images/SocialImageGallery';
import { GoogleMapView } from '@/components/maps/GoogleMapView';
import { ExpandableText } from '@/components/common/ExpandableText';
import { PointActions } from './PointActions';
import { CommentsSection } from '@/components/comments/CommentsSection';
import { usePoint } from '@/hooks/usePoint';
import type { TripPoint } from '@/types';

export function PointDetails({ point }: { point: TripPoint }) {
  // The server render is anonymous; the authenticated read restores the viewer's own
  // like / report state for the point and for its images.
  const { data } = usePoint(point);
  const current = data ?? point;

  return (
    <article>
      <h1>{current.name}</h1>
      {current.description ? <ExpandableText text={current.description} /> : null}
      {current.lat != null && current.lng != null ? (
        <>
          <p>
            Coordinates: {current.lat.toFixed(6)}, {current.lng.toFixed(6)}
          </p>
          <GoogleMapView
            markers={[{ id: current.id, title: current.name, position: { lat: current.lat, lng: current.lng } }]}
            center={{ lat: current.lat, lng: current.lng }}
            height={250}
            maxWidth={600}
          />
        </>
      ) : null}
      <PointActions point={current} />

      <SocialImageGallery
        images={current.images}
        alt={current.name}
        preset="gallery"
        leadPreset="hero"
        variant="stack"
      />

      <CommentsSection target={{ type: 'point', pointId: current.id }} />
    </article>
  );
}
