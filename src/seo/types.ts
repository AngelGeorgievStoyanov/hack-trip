import type { Metadata } from 'next';

export interface SeoMetadataInput {
  title: string;
  description?: string;
  canonicalPath: string;
  openGraphPath?: string;
  imageUrl?: string;
  imageAlt?: string;
  openGraphType?: 'website' | 'article';
  noIndex?: boolean;
}

export type SeoMetadata = Metadata;
