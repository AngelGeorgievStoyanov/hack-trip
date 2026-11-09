import type { MetadataRoute } from 'next';
import { tripApi } from '@/api/trips';
import { absoluteUrl } from '@/config';

/**
 * Points are intentionally omitted: there is no public "list points" endpoint, so points
 * cannot be discovered without inventing URLs.
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const entries: MetadataRoute.Sitemap = [
    { url: absoluteUrl('/'), lastModified: new Date(), changeFrequency: 'daily', priority: 1 },
    {
      url: absoluteUrl('/trips'),
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.8,
    },
    {
      url: absoluteUrl('/about'),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    {
      url: absoluteUrl('/privacy-policy'),
      changeFrequency: 'yearly',
      priority: 0.3,
    },
  ];

  try {
    const limit = 100;
    let page = 1;

    // Contract §17.1: `GET /trips` returns a raw array without a pagination object, so
    // fetch pages until a short page arrives (bounded by a 100-page safety cap).
    while (page <= 100) {
      const trips = await tripApi.listTrips({ page, limit, sort: 'newest' });
      for (const trip of trips) {
        const lastModified = trip.days.reduce<string | null>((latest, day) => {
          const timestamps = [
            day.createdAt,
            day.updatedAt,
            ...day.points.flatMap((point) => [point.createdAt, point.updatedAt]),
          ];
          return timestamps.reduce<string | null>((current, value) => {
            return value && (!current || value > current) ? value : current;
          }, latest);
        }, null);
        entries.push({
          url: absoluteUrl(`/trips/${trip.id}`),
          lastModified: lastModified ? new Date(lastModified) : new Date(),
          changeFrequency: 'weekly',
          priority: 0.7,
        });
      }
      if (trips.length < limit) {
        break;
      }
      page += 1;
    }
  } catch {
    // Backend unreachable: still serve the static routes above.
  }

  return entries;
}
