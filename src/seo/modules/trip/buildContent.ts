import {
  SEO_DESCRIPTION_MAX_LENGTH,
  SEO_DESCRIPTION_POINTS_MAX_COUNT,
  SEO_LATITUDE_MAX,
  SEO_LATITUDE_MIN,
  SEO_LONGITUDE_MAX,
  SEO_LONGITUDE_MIN,
  SEO_TEXT_TRUNCATION_MIN_WORD_BOUNDARY,
  SEO_TITLE_HIGHLIGHTS_MAX_COUNT,
  SEO_TITLE_MAX_LENGTH,
} from '@/constants/seo';
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
  const endIndex = lastSpace > SEO_TEXT_TRUNCATION_MIN_WORD_BOUNDARY ? lastSpace : maxLength - 1;
  return shortened.slice(0, endIndex).trimEnd() + '…';
}

/** Converts trip data to SEO content without network calls, geocoding or AI dependencies. */
export function buildTripSeoContent(trip: TripSeoInput): TripSeoContent {
  const days = [...trip.days].sort((a, b) => a.dayNumber - b.dayNumber);
  const destinations = unique(days.map((day) => clean(day.destination)));
  const pointNames = unique(
    days.flatMap((day) => (day.points ?? []).map((point) => clean(point.name))),
  );
  const primaryDestination = destinations[0];
  const titleSubject = primaryDestination
    ? 'Trip to ' + primaryDestination
    : days.map((day) => clean(day.title)).find(Boolean) ?? 'Travel itinerary';
  const highlights = pointNames.slice(0, SEO_TITLE_HIGHLIGHTS_MAX_COUNT);
  const title = fitText(
    highlights.length ? titleSubject + ': ' + highlights.join(', ') : titleSubject,
    SEO_TITLE_MAX_LENGTH,
  );

  const descriptions = unique(days.map((day) => clean(day.description)));
  const pointSummary = pointNames.slice(0, SEO_DESCRIPTION_POINTS_MAX_COUNT).join(', ');
  const descriptionParts = [
    destinations.length ? 'Explore ' + destinations.join(', ') + '.' : undefined,
    descriptions[0],
    pointSummary ? 'Places along the way: ' + pointSummary + '.' : undefined,
  ].filter((part): part is string => Boolean(part));
  const description = fitText(
    descriptionParts.join(' ') ||
      'Explore this travel itinerary, its destinations and points of interest on HackTrip.',
    SEO_DESCRIPTION_MAX_LENGTH,
  );

  const itinerary: TripSeoDay[] = days.map((day) => ({
    dayNumber: day.dayNumber,
    name: clean(day.title) ?? clean(day.destination) ?? 'Day ' + day.dayNumber,
    ...(clean(day.description) ? { description: clean(day.description) } : {}),
    points: (day.points ?? []).flatMap((point) => {
      const name = clean(point.name);
      const hasCoordinates =
        typeof point.lat === 'number' &&
        Number.isFinite(point.lat) &&
        point.lat >= SEO_LATITUDE_MIN &&
        point.lat <= SEO_LATITUDE_MAX &&
        typeof point.lng === 'number' &&
        Number.isFinite(point.lng) &&
        point.lng >= SEO_LONGITUDE_MIN &&
        point.lng <= SEO_LONGITUDE_MAX;
      if (!name && !hasCoordinates && !clean(point.description)) return [];

      return [{
        ...(name ? { name } : {}),
        ...(clean(point.description) ? { description: clean(point.description) } : {}),
        ...(hasCoordinates
          ? { latitude: point.lat as number, longitude: point.lng as number }
          : {}),
      }];
    }),
  }));

  const hasEditorialContent =
    destinations.length > 0 ||
    descriptions.length > 0 ||
    days.some((day) => Boolean(clean(day.title))) ||
    itinerary.some((day) => day.points.some((point) => Boolean(point.name || point.description)));
  return { title, description, itinerary, isIndexable: hasEditorialContent };
}
