import { config } from '@/config';

export const SEO_CONFIG = {
  siteName: 'HackTrip',
  defaultTitle: 'HackTrip — plan and share your trips',
  defaultDescription: 'Discover, plan and share trips with HackTrip.',
  defaultImagePath: '/opengraph-image',
} as const;

/** Resolves an absolute URL using the configured public site origin. */
export function seoUrl(path: string): string {
  let base = config.siteUrl;
  while (base.endsWith('/')) {
    base = base.slice(0, -1);
  }
  const normalized = path.startsWith('/') ? path : `/${path}`;
  return `${base}${normalized}`;
}
