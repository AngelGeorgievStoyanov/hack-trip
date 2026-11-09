import { absoluteUrl } from '@/config';
import { buildSeoMetadata } from '@/seo';
import type { Metadata } from 'next';
import { buildTripSeoContent } from './buildContent';
import type { TripSeoInput, TripSeoMetadataOptions } from './types';

/** Trip-specific metadata composition; route files only provide trip identity. */
export function buildTripSeoMetadata(
  trip: TripSeoInput,
  options: TripSeoMetadataOptions,
): Metadata {
  const content = buildTripSeoContent(trip);
  const selectedDay =
    trip.days.find((day) => day.dayNumber === options.dayNumber) ?? trip.days[0];
  const dayNumber = selectedDay?.dayNumber ?? 1;
  const imageIds = [
    ...(selectedDay?.images ?? []),
    ...(selectedDay?.points ?? []).flatMap((point) => point.images ?? []),
  ]
    .map((image) => image.id);
  // A changed or reordered image set produces a fresh, compact OG URL.
  const imageHash = imageIds.reduce(
    (hash, id) => Math.imul(hash ^ id, 16777619) >>> 0,
    2166136261,
  );
  const imageVersion = imageIds.length ? `${imageIds.length}-${imageHash.toString(36)}` : 'no-images';
  const imagePath = `/api/og/trips/${options.tripId}?day=${dayNumber}&v=${imageVersion}`;

  return buildSeoMetadata({
    title: content.title,
    description: content.description,
    canonicalPath: `/trips/${options.tripId}`,
    openGraphPath: `/trips/${options.tripId}?day=${dayNumber}`,
    imageUrl: absoluteUrl(imagePath),
    imageAlt: `${content.title} — HackTrip`,
  });
}
