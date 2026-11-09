import { seoUrl } from '@/seo/config';

export interface TripJsonLdInput {
  name: string;
  description?: string | null;
  canonicalPath: string;
  imageUrl?: string | null;
}

/** Creates Trip JSON-LD without coupling schema generation to a page component. */
export function buildTripJsonLd(input: TripJsonLdInput): Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    '@type': 'Trip',
    name: input.name,
    ...(input.description ? { description: input.description } : {}),
    url: seoUrl(input.canonicalPath),
    ...(input.imageUrl ? { image: input.imageUrl } : {}),
  };
}
