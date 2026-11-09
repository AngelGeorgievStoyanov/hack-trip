import type { Metadata } from 'next';
import { absoluteUrl } from '@/config';
import { SEO_CONFIG } from '@/seo/config';
import type { SeoMetadataInput } from '@/seo/types';

/**
 * Shared metadata builder. It knows about site-wide SEO defaults only;
 * feature-specific metadata belongs in the corresponding SEO module.
 */
export function buildSeoMetadata(input: SeoMetadataInput): Metadata {
  const title = input.title.trim() || SEO_CONFIG.defaultTitle;
  const description = input.description?.trim() || SEO_CONFIG.defaultDescription;
  const imageUrl = input.imageUrl ?? absoluteUrl(SEO_CONFIG.defaultImagePath);
  const canonicalUrl = absoluteUrl(input.canonicalPath);
  const openGraphUrl = absoluteUrl(input.openGraphPath ?? input.canonicalPath);

  return {
    title,
    description,
    alternates: { canonical: canonicalUrl },
    robots: input.noIndex ? { index: false, follow: false } : { index: true, follow: true },
    openGraph: {
      title,
      description,
      url: openGraphUrl,
      siteName: SEO_CONFIG.siteName,
      type: input.openGraphType ?? 'website',
      images: [{ url: imageUrl, width: 1200, height: 630, alt: input.imageAlt ?? title }],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [imageUrl],
    },
  };
}
