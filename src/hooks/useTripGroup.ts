'use client';

import { useCallback } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { socialApi } from '@/api/social';
import { tripApi } from '@/api/trips';
import { useAuth } from '@/hooks/useAuth';
import { useReportActions } from '@/hooks/useReportActions';
import type { SocialState, TripGroupResponse } from '@/types';

/** React Query keys for trip-group reads. */
export const tripGroupKeys = {
  detail: (tripGroupId: number, viewerCacheKey: string) =>
    ['trips', 'detail', tripGroupId, viewerCacheKey] as const,
};

/**
 * Trip-group read used by the trip details page.
 *
 * The server render uses the public frontend bearer token, which the backend treats as an
 * anonymous viewer, so `likedByMe`, `favoritedByMe` and `reportedByMe` are always `false`
 * there (API_CONTRACT.md §20.14). Only the authenticated read carries the viewer's real
 * social state, so the client read is what restores the icons after a reload.
 */
export function useTripGroup(initialTrip: TripGroupResponse) {
  const { status, viewerCacheKey } = useAuth();

  return useQuery({
    queryKey: tripGroupKeys.detail(initialTrip.id, viewerCacheKey),
    queryFn: () => tripApi.getTrip(initialTrip.id),
    enabled: status === 'authenticated',
    initialData: initialTrip,
  });
}

/**
 * Trip-group social mutations.
 *
 * Every successful action patches the cached trip group with the values returned by the
 * backend, so the API response stays the single source of truth for the rendered icons.
 *
 * @param tripGroupId the trip group the actions target.
 * @param social the current social state of the trip group, as returned by the API.
 */
export function useTripGroupSocial(tripGroupId: number, social: SocialState) {
  const { viewerCacheKey } = useAuth();
  const queryClient = useQueryClient();

  const patchSocial = useCallback(
    (patch: Partial<SocialState>): void => {
      queryClient.setQueryData<TripGroupResponse>(
        tripGroupKeys.detail(tripGroupId, viewerCacheKey),
        (previous) =>
          previous ? { ...previous, social: { ...previous.social, ...patch } } : previous,
      );
    },
    [queryClient, tripGroupId, viewerCacheKey],
  );

  const likeMutation = useMutation({
    mutationFn: async (): Promise<SocialState | null> => {
      if (social.likedByMe) {
        await socialApi.unlike({ targetType: 'tripgroup', targetId: tripGroupId });
        return null;
      }
      return socialApi.like({ targetType: 'tripgroup', targetId: tripGroupId });
    },
    onSuccess: (state) => {
      if (state) {
        patchSocial({ likedByMe: state.likedByMe, likes: state.likes });
        return;
      }
      patchSocial({ likedByMe: false, likes: Math.max(0, social.likes - 1) });
    },
  });

  const favoriteMutation = useMutation({
    mutationFn: async (): Promise<SocialState | null> => {
      if (social.favoritedByMe) {
        await socialApi.unfavorite({ tripGroupId });
        return null;
      }
      return socialApi.favorite({ tripGroupId });
    },
    onSuccess: (state) => {
      if (state) {
        patchSocial({
          favoritedByMe: state.favoritedByMe ?? false,
          favorites: state.favorites ?? 0,
        });
        return;
      }
      patchSocial({
        favoritedByMe: false,
        favorites: Math.max(0, (social.favorites ?? 0) - 1),
      });
    },
  });

  const reportActions = useReportActions('tripgroup', tripGroupId, {
    onReportedChange: (reported) => patchSocial({ reportedByMe: reported }),
  });

  return { likeMutation, favoriteMutation, reportActions };
}
