'use client';

import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { Button } from '@mui/material';
import { socialApi } from '@/api/social';
import { getGenericErrorMessage } from '@/lib/errors';
import type { SocialTargetTypeInput } from '@/types';

interface LikeButtonProps {
  targetType: SocialTargetTypeInput;
  targetId: number;
  initialLiked: boolean;
  initialLikes: number;
}

export function LikeButton({ targetType, targetId, initialLiked, initialLikes }: LikeButtonProps) {
  const [liked, setLiked] = useState(initialLiked);
  const [likes, setLikes] = useState(initialLikes);
  const [error, setError] = useState<string | null>(null);

  const mutation = useMutation({
    mutationFn: async () => {
      if (liked) {
        await socialApi.unlike({ targetType, targetId });
        return null;
      }
      return socialApi.like({ targetType, targetId });
    },
    onSuccess: (state) => {
      setLiked((prev) => !prev);
      if (state) {
        setLikes(state.likes);
      } else {
        setLikes((prev) => Math.max(0, prev - 1));
      }
    },
    onError: (e) => setError(getGenericErrorMessage(e)),
  });

  return (
    <>
      <Button
        variant={liked ? 'contained' : 'outlined'}
        onClick={() => mutation.mutate()}
        disabled={mutation.isPending}
      >
        {liked ? 'Liked' : 'Like'} ({likes})
      </Button>
      {error ? <span role="alert">{error}</span> : null}
    </>
  );
}
