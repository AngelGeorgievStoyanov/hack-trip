'use client';

import { useEffect, useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Badge, IconButton, Tooltip } from '@mui/material';
import BookmarkAddIcon from '@mui/icons-material/BookmarkAdd';
import BookmarkRemoveIcon from '@mui/icons-material/BookmarkRemove';
import { socialApi } from '@/api/social';
import { getGenericErrorMessage } from '@/lib/errors';
import { invalidateSocialQueries } from '@/lib/socialQuerySync';
import type { SocialTargetTypeInput } from '@/types';

interface FavoriteButtonProps {
  targetType: SocialTargetTypeInput;
  targetId: number;
  initialFavorited: boolean;
  initialFavorites: number;
  /** Icon button size. `'medium'` elsewhere, `'small'` for image overlays. */
  size?: 'small' | 'medium';
}

export function FavoriteButton({
  targetType,
  targetId,
  initialFavorited,
  initialFavorites,
  size = 'medium',
}: FavoriteButtonProps) {
  const [favorited, setFavorited] = useState(initialFavorited);
  const [count, setCount] = useState(initialFavorites);
  const [error, setError] = useState<string | null>(null);
  const queryClient = useQueryClient();

  useEffect(() => setFavorited(initialFavorited), [initialFavorited]);
  useEffect(() => setCount(initialFavorites), [initialFavorites]);

  const mutation = useMutation({
    mutationFn: async () => {
      if (favorited) {
        await socialApi.unfavorite({ targetType, targetId });
        return null;
      }
      return socialApi.favorite({ targetType, targetId });
    },
    onSuccess: (state) => {
      setError(null);
      invalidateSocialQueries(queryClient, targetType);
      setFavorited(state?.favoritedByMe ?? false);
      if (state) {
        setCount(state.favorites ?? 0);
      } else {
        setCount((prev) => Math.max(0, prev - 1));
      }
    },
    onError: (e) => setError(getGenericErrorMessage(e)),
  });

  return (
    <>
      <Tooltip title={favorited ? 'Remove from favorites' : 'Add to favorites'} arrow>
        <span>
          <IconButton
            onClick={() => mutation.mutate()}
            disabled={mutation.isPending}
            aria-label={favorited ? `Remove from favorites (${count})` : `Add to favorites (${count})`}
            aria-pressed={favorited}
            color={favorited ? 'error' : 'default'}
            size={size}
          >
            <Badge badgeContent={count} invisible={count === 0} max={Number.MAX_SAFE_INTEGER} color="error" sx={size === 'small' ? { '& .MuiBadge-badge': { fontSize: '0.65rem', height: 14, minWidth: 14, padding: '0 3px', lineHeight: 1 } } : undefined}>
              {favorited ? <BookmarkRemoveIcon /> : <BookmarkAddIcon />}
            </Badge>
          </IconButton>
        </span>
      </Tooltip>
      {error ? <span role="alert">{error}</span> : null}
    </>
  );
}
