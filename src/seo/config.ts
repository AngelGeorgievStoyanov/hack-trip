import { config } from '@/config';

export const SEO_CONFIG = {
  siteName: 'HackTrip',
  defaultTitle: 'HackTrip — plan and share your trips',
  defaultDescription: 'Discover, plan and share trips with HackTrip.',
  defaultImagePath: '/opengraph-image',
  twitterImagePath: '/twitter-image',
  locale: 'en_US',
} as const;

export const seoUrl = (path: string): string => {
  const normalized = path.startsWith('/') ? path : `/${path}`;
  return `${config.siteUrl.replace(/\\/+$/, '')}${normalized}`;
};
