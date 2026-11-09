import type { MetadataRoute } from 'next';
import { config } from '@/config';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/profile',
          '/my-trips',
          '/favorites',
          '/admin',
          '/trips/create',
          '/points/edit',
          '/*/edit',
        ],
      },
    ],
    sitemap: config.siteUrl + '/sitemap.xml',
    host: config.siteUrl,
  };
}
