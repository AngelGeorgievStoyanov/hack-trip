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
  const dayNumber = options.dayNumber ?? trip.days[0]?.dayNumber ?? 1;
  const imagePath = `/api/og/trips/${options.tripId}?day=${dayNumber}`;

  return buildSeoMetadata({
    title: content.title,
    description: content.description,
    canonicalPath: `/trips/${options.tripId}`,
    openGraphPath: `/trips/${options.tripId}?day=${dayNumber}`,
    imageUrl: absoluteUrl(imagePath),
    imageAlt: `${content.title} — HackTrip`,
  });
}
