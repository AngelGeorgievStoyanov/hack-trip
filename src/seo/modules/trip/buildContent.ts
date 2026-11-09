import type { TripSeoContent, TripSeoDay, TripSeoInput } from './types';

function clean(value: string | null | undefined): string | undefined {
  const normalized = value?.replace(/\s+/g, ' ').trim();
  return normalized || undefined;
}

function unique(values: Array<string | undefined>): string[] {
  return [...new Set(values.filter((value): value is string => Boolean(value)))];
}

function fitText(value: string, maxLength: number): string {
  if (value.length <= maxLength) return value;
  const shortened = value.slice(0, maxLength - 1);
  const lastSpace = shortened.lastIndexOf(' ');
  return `${shortened.slice(0, lastSpace > 35 ? lastSpace : maxLength - 1).trimEnd()}…`;
}

/**
 * Converts the small, stable Trip SEO input contract into metadata copy and
 * an itinerary. No API calls, geocoding, AI processing, or app-wide types.
 */
export function buildTripSeoContent(trip: TripSeoInput): TripSeoContent {
  const days = [...trip.days].sort((a, b) => a.dayNumber - b.dayNumber);
  const destinations = unique(days.map((day) => clean(day.destination)));
  const pointNames = unique(
    days.flatMap((day) => (day.points ?? []).map((point) => clean(point.name))),
  );
  const primaryDestination = destinations[0];
  const titleSubject = primaryDestination
    ? `Trip to ${primaryDestination}`
    : days.map((day) => clean(day.title)).find(Boolean) ?? 'Travel itinerary';
  const highlights = pointNames.slice(0, 3);
  // The root metadata template appends " | HackTrip" to page titles.
  const title = fitText(
    highlights.length ? `${titleSubject}: ${highlights.join(', ')}` : titleSubject,
    55,
  );

  const descriptions = unique(days.map((day) => clean(day.description)));
  const pointSummary = pointNames.slice(0, 5).join(', ');
  const descriptionParts = [
    destinations.length ? `Explore ${destinations.join(', ')}.` : undefined,
    descriptions[0],
    pointSummary ? `Places along the way: ${pointSummary}.` : undefined,
  ].filter((part): part is string => Boolean(part));
  const description = fitText(
    descriptionParts.join(' ') ||
      'Explore this travel itinerary, its destinations and points of interest on HackTrip.',
    300,
  );

  const itinerary: TripSeoDay[] = days.map((day) => ({
    dayNumber: day.dayNumber,
    name: clean(day.title) ?? clean(day.destination) ?? `Day ${day.dayNumber}`,
    ...(clean(day.description) ? { description: clean(day.description) } : {}),
    // Unnamed points are omitted instead of inventing "Point of interest".
    points: (day.points ?? []).flatMap((point) => {
      const name = clean(point.name);
      if (!name) return [];
      return [{
        name,
        ...(clean(point.description) ? { description: clean(point.description) } : {}),
        ...(typeof point.lat === 'number' && typeof point.lng === 'number'
          ? { latitude: point.lat, longitude: point.lng }
          : {}),
      }];
    }),
  }));

  return { title, description, itinerary };
}
