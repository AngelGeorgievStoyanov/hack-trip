import { cache } from 'react';
import { tripApi } from '@/api/trips';
import { pointApi } from '@/api/points';
import { normalizeApiError } from '@/api/client';
import { API_ERROR_CODES } from '@/constants/api';

/**
 * Server-only, request-scoped API access for public pages. `cache()` dedupes the call so
 * `generateMetadata` and the page body share a single backend request per render.
 */
export const getTrip = cache((id: number) => tripApi.getTrip(id));
export const getPoint = cache((pointId: number) => pointApi.getPoint(pointId));

/** True when the backend reported a not-found result (used for Next.js `notFound()`). */
export function isNotFoundError(error: unknown): boolean {
  const apiError = normalizeApiError(error);
  return (
    apiError.status === 404 ||
    apiError.code === API_ERROR_CODES.NOT_FOUND ||
    apiError.code === API_ERROR_CODES.TRIP_NOT_FOUND
  );
}
