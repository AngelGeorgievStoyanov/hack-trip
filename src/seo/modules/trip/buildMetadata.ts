import { absoluteUrl } from '@/config';
import { buildSeoMetadata } from '@/seo';
import type { Metadata } from 'next';
import { buildTripSeoContent } from './buildContent';
import type { TripSeoInput, TripSeoMetadataOptions } from './types';

function hashVersion(value: string): string {
  let hash = 2166136261;
  for (let index = 0; index < value.length; index += 1) {
    hash = Math.imul(hash ^ value.charCodeAt(index), 16777619) >>> 0;
  }
  return hash.toString(36);
}

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
  ].map((image) => image.id);
  const versionInput = JSON.stringify({
    title: content.title,
    description: content.description,
    imageIds,
    dayUpdatedAt: selectedDay && 'updatedAt' in selectedDay ? selectedDay.updatedAt : null,
  });
  const imageVersion = hashVersion(versionInput);
  const imagePath = '/api/og/trips/' + options.tripId + '?day=' + dayNumber + '&v=' + imageVersion;

  return buildSeoMetadata({
    title: content.title,
    description: content.description,
    canonicalPath: '/trips/' + options.tripId,
    openGraphPath: '/trips/' + options.tripId + '?day=' + dayNumber,
    imageUrl: absoluteUrl(imagePath),
    imageAlt: content.title + ' — HackTrip',
    noIndex: !content.isIndexable,
  });
}
