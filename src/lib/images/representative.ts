import type { TripDetails, TripPoint } from '@/types';

/** Representative image for a trip (cover, else first day/point image). */
export function tripRepresentativeImage(trip: TripDetails): string | null {
  if (trip.coverImage) {
    return trip.coverImage;
  }
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

/** Representative image for a point (first image, if any). */
export function pointRepresentativeImage(point: TripPoint): string | null {
  return point.images[0]?.url ?? null;
}
