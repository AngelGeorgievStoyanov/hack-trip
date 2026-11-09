/**
 * Shared SEO core public API.
 * Feature-specific SEO modules are imported from their own entry points.
 */
export { buildSeoMetadata } from './metadata/buildMetadata';
export type { SeoMetadataInput, SeoMetadata } from './types';
