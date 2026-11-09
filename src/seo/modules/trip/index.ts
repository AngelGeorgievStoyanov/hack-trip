/** Public API for the Trip SEO feature. */
export { buildTripSeoContent } from './buildContent';
export { buildTripSeoMetadata } from './buildMetadata';
export { buildTripJsonLd } from './buildStructuredData';
export { TripItineraryIndex } from './TripItineraryIndex';

export type {
  TripSeoContent,
  TripSeoDay,
  TripSeoInput,
  TripSeoMetadataOptions,
  TripSeoPoint,
  TripSeoDayInput,
  TripSeoPointInput,
} from './types';

export type { TripJsonLdInput } from './buildStructuredData';
