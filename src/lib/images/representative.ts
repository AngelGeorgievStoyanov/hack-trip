import type { TripGroupDay, TripGroupResponse } from '@/types';

function tripDayRepresentativeImage(day: TripGroupDay): string | null {
  if (day.images[0]) {
    return day.images[0].url;
  }

  for (const point of day.points) {
    if (point.images[0]) {
      return point.images[0].url;
    }
  }

  return null;
}

export function tripRepresentativeImage(trip: TripGroupResponse): string | null {
  for (const day of trip.days) {
    const image = tripDayRepresentativeImage(day);
    if (image) {
      return image;
    }
  }
  return null;
}
