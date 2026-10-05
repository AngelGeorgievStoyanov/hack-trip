'use client';

import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { configApi } from '@/api/config';
import { SELECTS_QUERY_KEY, SELECTS_STALE_TIME_MS } from '@/constants/config';
import { toSelectChoices, type SelectChoice } from '@/lib/selects';

/**
 * The query is deliberately never surfaced as an error: the runtime config only refines the UI,
 * so a pending, failed or malformed response must leave each consumer on its own fallback
 * instead of throwing or blocking the page.
 */
export function useSelects() {
  return useQuery({
    queryKey: SELECTS_QUERY_KEY,
    queryFn: () => configApi.getSelects(),
    staleTime: SELECTS_STALE_TIME_MS,
  });
}

export function useSelectChoices(typeKey: string, currentValue?: string): SelectChoice[] {
  const { data } = useSelects();

  const configs = useMemo(() => (Array.isArray(data) ? data : []), [data]);

  return useMemo(
    () => toSelectChoices(configs, typeKey, currentValue),
    [configs, typeKey, currentValue],
  );
}
