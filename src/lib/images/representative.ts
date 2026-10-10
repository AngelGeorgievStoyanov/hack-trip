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

export function pointRepresentativeImage(point: TripPoint): string | null {
  return point.images[0]?.url ?? null;
}
