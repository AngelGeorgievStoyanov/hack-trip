'use client';

import { useEffect, useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { Button } from '@mui/material';
import { socialApi } from '@/api/social';
import { getGenericErrorMessage } from '@/lib/errors';
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
      <Button
        variant={favorited ? 'contained' : 'outlined'}
        onClick={() => mutation.mutate()}
        disabled={mutation.isPending}
      >
        {favorited ? 'Favorited' : 'Favorite'} ({count})
      </Button>
      {error ? <span role="alert">{error}</span> : null}
    </>
  );
}
