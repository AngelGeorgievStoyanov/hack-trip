import type { Metadata } from 'next';
import { buildSeoMetadata } from '@/seo';

export const metadata: Metadata = buildSeoMetadata({
  title: 'Privacy Policy and Terms of Use',
  description:
    'Read the HackTrip Terms of Use and Privacy Policy to understand the rules for using the travel platform and how personal information is handled.',
  canonicalPath: '/privacy-policy',
});
