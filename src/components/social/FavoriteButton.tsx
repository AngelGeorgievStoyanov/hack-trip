'use client';

import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { Button } from '@mui/material';
import { socialApi } from '@/api/social';
import { getGenericErrorMessage } from '@/lib/errors';

interface FavoriteButtonProps {
  tripGroupId: number;
  initialFavorited: boolean;
  initialFavorites: number;
}

export function FavoriteButton({
  tripGroupId,
  initialFavorited,
  initialFavorites,
}: FavoriteButtonProps) {
  const [favorited, setFavorited] = useState(initialFavorited);
  const [count, setCount] = useState(initialFavorites);
  const [error, setError] = useState<string | null>(null);

  const mutation = useMutation({
    mutationFn: async () => {
      if (favorited) {
        await socialApi.unfavorite({ tripGroupId });
        return null;
      }
      return socialApi.favorite({ tripGroupId });
    },
    onSuccess: (state) => {
      setFavorited((prev) => !prev);
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
