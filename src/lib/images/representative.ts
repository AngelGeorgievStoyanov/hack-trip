import type { TripGroupResponse, TripPoint } from '@/types';

export function tripRepresentativeImage(trip: TripGroupResponse): string | null {
  for (const day of trip.days) {
    if (day.images[0]) {
      return day.images[0].url;
    }
    for (const point of day.points) {
      if (point.images[0]) {
        return point.images[0].url;
      }
    }
  }
  return null;
}

/**
 * Selects one image from the entire Trip Group using its id as a stable seed.
 * Different groups can get different representative photos, while the same group
 * always produces the same preview image (important for social crawler caching).
 */
export function tripOpenGraphImage(trip: TripGroupResponse): string | null {
  const images = Array.from(
    new Set(
      trip.days.flatMap((day) => [
        ...day.images.map((image) => image.url),
        ...day.points.flatMap((point) => point.images.map((image) => image.url)),
      ]),
    ),
  );

  if (images.length === 0) {
    return null;
  }

  const seed = Math.imul(trip.id ^ (trip.id >>> 16), 0x45d9f3b) >>> 0;
  return images[seed % images.length] ?? null;
}

export function pointRepresentativeImage(point: TripPoint): string | null {
  return point.images[0]?.url ?? null;
}
