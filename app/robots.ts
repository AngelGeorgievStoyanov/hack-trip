import type { MetadataRoute } from 'next';
import { config } from '@/config';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/login',
          '/register',
          '/verify-email',
          '/resend-verification',
          '/forgot-password',
          '/reset-password',
          '/profile',
          '/my-trips',
          '/favorites',
          '/admin',
          '/trips/create',
          '/*/edit',
        ],
      },
    ],
    sitemap: `${config.siteUrl}/sitemap.xml`,
    host: config.siteUrl,
  };
}
