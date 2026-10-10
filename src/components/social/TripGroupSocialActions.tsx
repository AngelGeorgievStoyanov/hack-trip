'use client';

import { useEffect, useState } from 'react';
import { Tooltip, IconButton } from '@mui/material';
import { useMutation } from '@tanstack/react-query';
import { socialApi } from '@/api/social';
import { useAuth } from '@/hooks/useAuth';
import { getGenericErrorMessage } from '@/lib/errors';
import BookmarkAddIcon from '@mui/icons-material/BookmarkAdd';
import BookmarkRemoveIcon from '@mui/icons-material/BookmarkRemove';
import ReportIcon from '@mui/icons-material/Report';
import ReportOffIcon from '@mui/icons-material/ReportOff';
import ThumbUpIcon from '@mui/icons-material/ThumbUp';
import ThumbUpOffAltIcon from '@mui/icons-material/ThumbUpOffAlt';

interface TripGroupSocialActionsProps {
  tripGroupId: number;
  initialLiked: boolean;
  initialLikes: number;
  initialFavorited: boolean;
  initialReported: boolean;
}

export function TripGroupSocialActions({
  tripGroupId,
  initialLiked,
  initialLikes,
  initialFavorited,
  initialReported,
}: TripGroupSocialActionsProps) {
  const [liked, setLiked] = useState(initialLiked);
  const [likes, setLikes] = useState(initialLikes);
  const [favorited, setFavorited] = useState(initialFavorited);
  const [reported, setReported] = useState(initialReported);
  const [likeError, setLikeError] = useState<string | null>(null);
  const [favoriteError, setFavoriteError] = useState<string | null>(null);
  const [reportError, setReportError] = useState<string | null>(null);

  // Trip Group social is global for the whole trip: when fresh server state arrives
  // (authenticated refetch, revalidation), adopt it; day switches never change it.
  useEffect(() => {
    setLiked(initialLiked);
  }, [initialLiked]);
  useEffect(() => {
    setLikes(initialLikes);
  }, [initialLikes]);
  useEffect(() => {
    setFavorited(initialFavorited);
  }, [initialFavorited]);
  useEffect(() => {
    setReported(initialReported);
  }, [initialReported]);

  const { status } = useAuth();
  const isAuthenticated = status === 'authenticated';

  const likeMutation = useMutation({
    mutationFn: async () => {
      if (liked) {
        await socialApi.unlike({ targetType: 'tripgroup', targetId: tripGroupId });
        return null;
      }
      return socialApi.like({ targetType: 'tripgroup', targetId: tripGroupId });
    },
    onSuccess: (state) => {
      setLiked((prev) => !prev);
      if (state) {
        setLikes(state.likes);
      } else {
        setLikes((prev) => Math.max(0, prev - 1));
      }
    },
    onError: (e) => setLikeError(getGenericErrorMessage(e)),
  });

  const favoriteMutation = useMutation({
    mutationFn: async () => {
      if (favorited) {
        await socialApi.unfavorite({ tripGroupId });
        return null;
      }
      return socialApi.favorite({ tripGroupId: tripGroupId });
    },
    onSuccess: (state) => {
      setFavorited((prev) => !prev);
    },
    onError: (e) => setFavoriteError(getGenericErrorMessage(e)),
  });

  const reportMutation = useMutation({
    mutationFn: () => socialApi.report({ targetType: 'tripgroup', targetId: tripGroupId }),
    onSuccess: () => {
      setReported(true);
    },
    onError: (e) => setReportError(getGenericErrorMessage(e)),
  });

  return (
    <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
      <Tooltip title={!isAuthenticated ? 'Log in to add to favorites' : (favorited ? 'REMOVE FROM FAVORITE' : 'ADD TO FAVORITE')} arrow>
        <span style={{ display: 'inline-flex' }}>
          <IconButton
            onClick={() => favoriteMutation.mutate()}
            disabled={!isAuthenticated || favoriteMutation.isPending}
            aria-label={favorited ? 'Remove from favorites' : 'Add to favorites'}
            color={favorited ? 'primary' : 'default'}
          >
            {favorited ? <BookmarkRemoveIcon /> : <BookmarkAddIcon />}
          </IconButton>
        </span>
      </Tooltip>
      {favoriteError && <span role="alert" style={{ color: 'red', fontSize: '0.75rem' }}>{favoriteError}</span>}

      <Tooltip title={!isAuthenticated ? 'Log in to like' : (liked ? 'UN LIKE' : 'LIKE')} arrow>
        <span style={{ display: 'inline-flex' }}>
          <IconButton
            onClick={() => likeMutation.mutate()}
            disabled={!isAuthenticated || likeMutation.isPending}
            aria-label={liked ? 'Unlike' : 'Like'}
            color={liked ? 'primary' : 'default'}
          >
            {liked ? <ThumbUpIcon /> : <ThumbUpOffAltIcon />}
          </IconButton>
        </span>
      </Tooltip>
      <Tooltip title={`${likes} likes`} arrow>
        <span style={{ fontSize: '0.875rem', minWidth: '2.5rem', textAlign: 'center' }}>{likes}</span>
      </Tooltip>
      {likeError && <span role="alert" style={{ color: 'red', fontSize: '0.75rem' }}>{likeError}</span>}

      <Tooltip title={!isAuthenticated ? 'Log in to report' : (reported ? 'REPORTED' : 'REPORT TRIP')} arrow>
        <span style={{ display: 'inline-flex' }}>
          <IconButton
            onClick={() => reportMutation.mutate()}
            disabled={!isAuthenticated || reportMutation.isPending || reported}
            aria-label={reported ? 'Reported' : 'Report trip'}
            color={reported ? 'error' : 'default'}
          >
            {reported ? <ReportOffIcon /> : <ReportIcon />}
          </IconButton>
        </span>
      </Tooltip>
      {reportError && <span role="alert" style={{ color: 'red', fontSize: '0.75rem' }}>{reportError}</span>}
    </div>
  );
}