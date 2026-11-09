import type { MetadataRoute } from 'next';
import { tripApi } from '@/api/trips';
import { absoluteUrl } from '@/config';
import { SITEMAP_MAX_TRIP_PAGES, SITEMAP_TRIPS_PAGE_SIZE } from '@/constants/seo';
import { buildTripSeoContent } from '@/seo/modules/trip/buildContent';

export const revalidate = 3600;

/** Points have no public standalone URL; their GPS data belongs to their parent trip. */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const entries: MetadataRoute.Sitemap = [
    { url: absoluteUrl('/'), changeFrequency: 'daily', priority: 1 },
    { url: absoluteUrl('/trips'), changeFrequency: 'daily', priority: 0.8 },
    { url: absoluteUrl('/about'), changeFrequency: 'monthly', priority: 0.5 },
    { url: absoluteUrl('/privacy-policy'), changeFrequency: 'yearly', priority: 0.3 },
  ];

  try {
    let page = 1;
    while (page <= SITEMAP_MAX_TRIP_PAGES) {
      const trips = await tripApi.listTrips({
        page,
        limit: SITEMAP_TRIPS_PAGE_SIZE,
        sort: 'newest',
      });
      for (const trip of trips) {
        if (!buildTripSeoContent(trip).isIndexable) continue;
        const timestamps = trip.days.flatMap((day) => [
          day.createdAt,
          day.updatedAt,
          ...day.points.flatMap((point) => [point.createdAt, point.updatedAt]),
        ]).filter((value): value is string => Boolean(value)).sort();
        const latest = timestamps.length ? timestamps[timestamps.length - 1] : undefined;
        entries.push({
          url: absoluteUrl('/trips/' + trip.id),
          ...(latest ? { lastModified: new Date(latest) } : {}),
          changeFrequency: 'weekly',
          priority: 0.7,
        });
      }
      if (trips.length < SITEMAP_TRIPS_PAGE_SIZE) return entries;
      page += 1;
    }
    console.error('[SEO] Sitemap reached its configured trip-page cap; some trips may be omitted.');
  } catch (error) {
    console.error('[SEO] Could not load all public trips for sitemap generation:', error);
  }

  return entries;
}
