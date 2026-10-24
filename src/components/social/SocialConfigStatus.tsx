'use client';

import { Alert, Box, CircularProgress } from '@mui/material';
import { getGenericErrorMessage } from '@/lib/errors';

interface SocialConfigStatusProps {
  isLoading: boolean;
  error: Error | null;
}

export function SocialConfigStatus({ isLoading, error }: SocialConfigStatusProps) {
  if (isLoading) {
    return (
      <Box role="status" aria-label="Loading social actions" sx={{ display: 'inline-flex', p: 0.5 }}>
        <CircularProgress size={18} />
      </Box>
    );
  }

  return error ? <Alert severity="error">{getGenericErrorMessage(error)}</Alert> : null;
}
