import { cache } from 'react';
import { tripApi } from '@/api/trips';
import { pointApi } from '@/api/points';
import { normalizeApiError } from '@/api/client';
import { API_ERROR_CODES } from '@/constants/api';
import type { TripGroupResponse, TripPoint } from '@/types';

export const getTrip = cache((tripGroupId: number): Promise<TripGroupResponse> =>
  tripApi.getTrip(tripGroupId),
);
export const getPoint = cache((pointId: number): Promise<TripPoint> => pointApi.getPoint(pointId));

/** True when the backend reported a not-found result (used for Next.js `notFound()`). */
export function isNotFoundError(error: unknown): boolean {
  const apiError = normalizeApiError(error);
  return (
    apiError.status === 404 ||
    apiError.code === API_ERROR_CODES.NOT_FOUND ||
    apiError.code === API_ERROR_CODES.TRIP_NOT_FOUND
  );
}
