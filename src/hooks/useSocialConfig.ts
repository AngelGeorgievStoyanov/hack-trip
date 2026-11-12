'use client';

import { useQuery } from '@tanstack/react-query';
import { configApi } from '@/api/config';
import { SOCIAL_CONFIG_QUERY_KEY, SOCIAL_CONFIG_STALE_TIME_MS } from '@/constants/config';

export function useSocialConfig() {
  return useQuery({
    queryKey: SOCIAL_CONFIG_QUERY_KEY,
    queryFn: configApi.getSocial,
    staleTime: SOCIAL_CONFIG_STALE_TIME_MS,
    refetchOnWindowFocus: 'always',
  });
}
