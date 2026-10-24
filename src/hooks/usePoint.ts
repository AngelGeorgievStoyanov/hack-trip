'use client';

import { useQuery } from '@tanstack/react-query';
import { pointApi } from '@/api/points';
import { useAuth } from '@/hooks/useAuth';
import type { TripPoint } from '@/types';

/** React Query keys for point reads. */
export const pointKeys = {
  detail: (pointId: number, viewerCacheKey: string) =>
    ['points', 'detail', pointId, viewerCacheKey] as const,
};

/**
 * Point read used by the public point page.
 *
 * The server render uses the public frontend bearer token, which the backend treats as an
 * anonymous viewer, so `likedByMe` and `reportedByMe` are always `false` there
 * (API_CONTRACT.md §20.14). The authenticated read restores the viewer's real state.
 */
export function usePoint(initialPoint: TripPoint) {
  const { status, viewerCacheKey } = useAuth();

  return useQuery({
    queryKey: pointKeys.detail(initialPoint.id, viewerCacheKey),
    queryFn: () => pointApi.getPoint(initialPoint.id),
    enabled: status === 'authenticated',
    initialData: initialPoint,
  });
}
