import { absoluteUrl } from '@/config';
import type { TripSeoContent } from './types';

export interface TripJsonLdInput {
  name: string;
  description?: string | null;
  canonicalPath: string;
  imageUrl?: string | null;
  itinerary?: TripSeoContent['itinerary'];
}

/** Creates Trip JSON-LD using only the Trip module's own data contract. */
export function buildTripJsonLd(input: TripJsonLdInput): Record<string, unknown> {
  const itinerary = input.itinerary?.map((day, dayIndex) => ({
    '@type': 'ListItem',
    position: dayIndex + 1,
    name: day.name,
    item: {
      '@type': 'TouristTrip',
      name: day.name,
      ...(day.description ? { description: day.description } : {}),
      ...(day.points.length
        ? {
            itinerary: {
              '@type': 'ItemList',
              itemListElement: day.points.map((point, pointIndex) => ({
                '@type': 'ListItem',
                position: pointIndex + 1,
                name: point.name,
                item: {
                  '@type': 'Place',
                  name: point.name,
                  ...(point.description ? { description: point.description } : {}),
                  ...(point.latitude !== undefined && point.longitude !== undefined
                    ? {
                        geo: {
                          '@type': 'GeoCoordinates',
                          latitude: point.latitude,
                          longitude: point.longitude,
                        },
                      }
                    : {}),
                },
              })),
            },
          }
        : {}),
    },
  }));

  return {
    '@context': 'https://schema.org',
    '@type': 'Trip',
    name: input.name,
    ...(input.description ? { description: input.description } : {}),
    url: absoluteUrl(input.canonicalPath),
    ...(input.imageUrl ? { image: input.imageUrl } : {}),
    ...(itinerary?.length
      ? { itinerary: { '@type': 'ItemList', itemListElement: itinerary } }
      : {}),
  };
}
