import type { QueryClient } from '@tanstack/react-query';
import type { SocialTargetTypeInput } from '@/types';

/** Refresh viewer-aware resource and comment reads after a social mutation. */
export function invalidateSocialQueries(
  queryClient: QueryClient,
  targetType: SocialTargetTypeInput,
): void {
  const invalidate = (queryKey: string[]) => {
    void queryClient.invalidateQueries({ queryKey });
  };

  switch (targetType) {
    case 'tripgroup':
    case 'trip':
    case 'day':
      invalidate(['trips']);
      break;
    case 'point':
      invalidate(['points']);
      break;
    case 'image':
      invalidate(['trips']);
      invalidate(['points']);
      break;
    case 'comment':
      invalidate(['comments']);
      invalidate(['trips']);
      invalidate(['points']);
      break;
  }
}
