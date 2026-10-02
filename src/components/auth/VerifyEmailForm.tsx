'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Alert, Box, CircularProgress, Typography } from '@mui/material';
import { authApi } from '@/api/auth';
import { getTokenErrorMessage } from '@/lib/errors';

export function VerifyEmailForm({ token }: { token?: string }) {
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!token) {
      setStatus('error');
      setMessage('Missing verification token.');
      return;
    }

    let cancelled = false;
    setStatus('loading');
    authApi
      .verifyEmail({ token })
      .then(() => {
        if (!cancelled) {
          setStatus('success');
          setMessage('Your email has been verified. You can now log in.');
        }
      })
      .catch((error) => {
        if (!cancelled) {
          setStatus('error');
          setMessage(getTokenErrorMessage(error));
        }
      });

    return () => {
      cancelled = true;
    };
  }, [token]);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, alignItems: 'flex-start' }}>
      <Typography variant="h4" component="h1">
        Verify email
      </Typography>
      {status === 'loading' ? <CircularProgress /> : null}
      {status === 'success' ? <Alert severity="success">{message}</Alert> : null}
      {status === 'error' ? <Alert severity="error">{message}</Alert> : null}
      {status === 'success' ? <Link href="/login">Go to login</Link> : null}
    </Box>
  );
}
