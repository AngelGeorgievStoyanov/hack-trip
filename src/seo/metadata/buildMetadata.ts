import type { Metadata } from 'next';
import { SEO_CONFIG, seoUrl } from '@/seo/config';
import type { SeoMetadataInput } from '@/seo/types';

/**
 * Builds page metadata in one place. Route files only provide page-specific content;
 * global SEO defaults and URL rules stay isolated from page components.
 */
export function buildSeoMetadata(input: SeoMetadataInput): Metadata {
  const title = input.title.trim() || SEO_CONFIG.defaultTitle;
  const description = input.description?.trim() || SEO_CONFIG.defaultDescription;
  const imageUrl = input.imageUrl ?? seoUrl(SEO_CONFIG.defaultImagePath);
  const canonicalUrl = seoUrl(input.canonicalPath);
  const openGraphUrl = seoUrl(input.openGraphPath ?? input.canonicalPath);

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
