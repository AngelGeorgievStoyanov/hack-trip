'use client';

import { useCallback, useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { normalizeApiError } from '@/api/client';
import { socialApi } from '@/api/social';
import { API_ERROR_CODES } from '@/constants/api';
import { getGenericErrorMessage } from '@/lib/errors';
import { invalidateSocialQueries } from '@/lib/socialQuerySync';
import type { ReportTargetTypeInput } from '@/types';

interface UseReportActionsOptions {
  /** Called after the current user's report state for the target changed. */
  onReportedChange?: (reported: boolean) => void;
}

export interface ReportActions {
  /** Reports the target (`POST /reports`). */
  report: (reason?: string) => void;
  /** Withdraws the current user's report by its target. */
  unreport: () => void;
  /** True while a report or unreport request is in flight. */
  pending: boolean;
  /** Message of the last failed request, if any. */
  error: string | null;
  /** Clears the current error message. */
  clearError: () => void;
}

export function useReportActions(
  targetType: ReportTargetTypeInput,
  targetId: number,
  options: UseReportActionsOptions = {},
): ReportActions {
  const { onReportedChange } = options;
  const [error, setError] = useState<string | null>(null);
  const queryClient = useQueryClient();

  const reportMutation = useMutation({
    mutationFn: (reason: string | undefined) =>
      socialApi.report({ targetType, targetId, reason: reason || undefined }),
    onSuccess: () => {
      setError(null);
      invalidateSocialQueries(queryClient, targetType);
      onReportedChange?.(true);
    },
    onError: (e) => {
      // The backend rejects a second report of the same target with 409 CONFLICT, which
      // means this user has already reported it.
      if (normalizeApiError(e).code === API_ERROR_CODES.CONFLICT) {
        setError('You have already reported this content.');
        invalidateSocialQueries(queryClient, targetType);
        onReportedChange?.(true);
        return;
      }
      setError(getGenericErrorMessage(e));
    },
  });

  const unreportMutation = useMutation({
    mutationFn: () => socialApi.unreport({ targetType, targetId }),
    onSuccess: () => {
      setError(null);
      invalidateSocialQueries(queryClient, targetType);
      onReportedChange?.(false);
    },
    onError: (e) => setError(getGenericErrorMessage(e)),
  });

  const report = useCallback(
    (reason?: string) => reportMutation.mutate(reason),
    [reportMutation],
  );
  const unreport = useCallback(() => unreportMutation.mutate(), [unreportMutation]);
  const clearError = useCallback(() => setError(null), []);

  return {
    report,
    unreport,
    pending: reportMutation.isPending || unreportMutation.isPending,
    error,
    clearError,
  };
}
