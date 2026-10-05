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
    { url: absoluteUrl('/trips'), lastModified: new Date(), changeFrequency: 'daily', priority: 0.8 },
  ];

  try {
    const limit = 100;
    let page = 1;
    let totalPages = 1;

    while (page <= totalPages && page <= 100) {
      const response = await tripApi.listTrips({ page, limit, sort: 'newest' });
      for (const trip of response.items) {
        entries.push({
          url: absoluteUrl(`/trips/${trip.id}`),
          lastModified: trip.createdAt ? new Date(trip.createdAt) : new Date(),
          changeFrequency: 'weekly',
          priority: 0.7,
        });
      }
      totalPages = response.pagination.totalPages;
      page += 1;
    }
  } catch {
    // Backend unreachable: still serve the static routes above.
  }

  return entries;
}
