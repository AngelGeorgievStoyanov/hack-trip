'use client';

import { useEffect, useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Badge, IconButton, Tooltip } from '@mui/material';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import FavoriteIcon from '@mui/icons-material/Favorite';
import { socialApi } from '@/api/social';
import { getGenericErrorMessage } from '@/lib/errors';
import { invalidateSocialQueries } from '@/lib/socialQuerySync';
import type { SocialTargetTypeInput } from '@/types';

interface FavoriteButtonProps {
  targetType: SocialTargetTypeInput;
  targetId: number;
  initialFavorited: boolean;
  initialFavorites: number;
}

export function FavoriteButton({
  targetType,
  targetId,
  initialFavorited,
  initialFavorites,
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
          >
            <Badge badgeContent={count} invisible={count === 0} max={Number.MAX_SAFE_INTEGER} color="error">
              {favorited ? <FavoriteIcon /> : <FavoriteBorderIcon />}
            </Badge>
          </IconButton>
        </span>
      </Tooltip>
      {error ? <span role="alert">{error}</span> : null}
    </>
  );
}
