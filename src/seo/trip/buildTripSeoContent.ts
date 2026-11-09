import type { TripGroupResponse } from '@/types';

export interface TripSeoContent {
  title: string;
  description?: string;
  itinerary: Array<{
    dayNumber: number;
    name: string;
    description?: string;
    points: Array<{
      name: string;
      description?: string;
      latitude?: number;
      longitude?: number;
    }>;
  }>;
}

function clean(value: string | null | undefined): string | undefined {
  const normalized = value?.replace(/\\s+/g, ' ').trim();
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
 * Builds SEO copy and a normalized itinerary from the complete Trip Group.
 * It only uses existing user-provided names/descriptions and coordinates:
 * no geocoding, AI calls, network requests, or database assumptions.
 */
export function buildTripSeoContent(trip: TripGroupResponse): TripSeoContent {
  const days = [...trip.days].sort((a, b) => a.dayNumber - b.dayNumber);
  const destinations = unique(days.map((day) => clean(day.destination)));
  const pointNames = unique(days.flatMap((day) => day.points.map((point) => clean(point.name))));
  const primaryDestination = destinations[0];
  const titleSubject = primaryDestination
    ? `Trip to ${primaryDestination}`
    : days.map((day) => clean(day.title)).find(Boolean) ?? 'Travel itinerary';
  const highlights = pointNames.slice(0, 3);
  const title = fitText(
    highlights.length ? `${titleSubject}: ${highlights.join(', ')}` : titleSubject,
    65,
  );

  const descriptions = unique(days.map((day) => clean(day.description)));
  const pointSummary = pointNames.slice(0, 5).join(', ');
  const descriptionParts = [
    destinations.length ? `Explore ${destinations.join(', ')}.` : undefined,
    descriptions[0],
    pointSummary ? `Places along the way: ${pointSummary}.` : undefined,
  ].filter((part): part is string => Boolean(part));
  const description = fitText(
    descriptionParts.join(' ') || 'Explore this travel itinerary, its destinations and points of interest on HackTrip.',
    300,
  );

  return {
    title,
    description,
    itinerary: days.map((day) => ({
      dayNumber: day.dayNumber,
      name: clean(day.title) ?? clean(day.destination) ?? `Day ${day.dayNumber}`,
      ...(clean(day.description) ? { description: clean(day.description) } : {}),
      points: day.points
        .map((point) => ({
          name: clean(point.name) ?? 'Point of interest',
          ...(clean(point.description) ? { description: clean(point.description) } : {}),
          ...(typeof point.lat === 'number' && typeof point.lng === 'number'
            ? { latitude: point.lat, longitude: point.lng }
            : {}),
        })),
    })),
  };
}
