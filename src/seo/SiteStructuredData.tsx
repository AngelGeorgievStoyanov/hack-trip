import { absoluteUrl } from '@/config';
import { SEO_BRAND } from '@/constants/seo';

/** Site-wide Organization and WebSite entities, kept separate from page-specific schemas. */
export function SiteStructuredData() {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify({
          '@context': 'https://schema.org',
          '@graph': [
            {
              '@type': 'Organization',
              '@id': absoluteUrl('/#organization'),
              name: 'HackTrip',
              url: absoluteUrl('/'),
              logo: absoluteUrl(SEO_BRAND.logoPath),
            },
            {
              '@type': 'WebSite',
              '@id': absoluteUrl('/#website'),
              name: 'HackTrip',
              url: absoluteUrl('/'),
              publisher: { '@id': absoluteUrl('/#organization') },
            },
          ],
        }).replace(/</g, '\\u003c'),
      }}
    />
  );
}
