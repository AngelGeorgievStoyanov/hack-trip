'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Box, Button, CircularProgress, Typography } from '@mui/material';
import { authApi } from '@/api/auth';
import { getTokenErrorMessage } from '@/lib/errors';
import { publishTabEvent } from '@/lib/tabSync';
import { WelcomeHeading } from '@/components/common/WelcomeHeading';
import { useNotification } from '@/components/common/NotificationProvider';
import {
  AUTH_SUCCESS_REDIRECT_DELAY_MS,
  LOGIN_EMAIL_VERIFIED_MESSAGE,
} from '@/constants/notifications';
import { COLORS, CARD_SHADOW, CARD_BORDER } from '@/constants/ui';

export function VerifyEmailForm({ token }: { token?: string }) {
  const router = useRouter();
  const notification = useNotification();
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!token) {
      setStatus('error');
      notification.error('Missing verification token.');
      return;
    }

    let cancelled = false;
    let redirectTimeout: number | undefined;
    setStatus('loading');

    authApi
      .verifyEmail({ token })
      .then(() => {
        if (cancelled) return;

        setStatus('success');
        setMessage(LOGIN_EMAIL_VERIFIED_MESSAGE);
        notification.success(LOGIN_EMAIL_VERIFIED_MESSAGE, {
          duration: AUTH_SUCCESS_REDIRECT_DELAY_MS,
        });
        publishTabEvent({ type: 'email-verified' });

        redirectTimeout = window.setTimeout(
          () => router.replace('/login'),
          AUTH_SUCCESS_REDIRECT_DELAY_MS,
        );
      })
      .catch((error) => {
        if (!cancelled) {
          setStatus('error');
          notification.error(getTokenErrorMessage(error));
        }
      });

    return () => {
      cancelled = true;
      if (redirectTimeout !== undefined) window.clearTimeout(redirectTimeout);
    };
  }, [token, notification, router]);

  return (
    <WelcomeHeading>
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 2,
          width: '100%',
          maxWidth: 560,
          boxSizing: 'border-box',
          mx: 'auto',
          p: { xs: 3, sm: 4 },
          backgroundColor: COLORS.formPanelBackground,
          boxShadow: CARD_SHADOW,
          border: CARD_BORDER,
          color: 'text.primary',
          textAlign: 'center',
        }}
      >
        <Typography variant="h5" component="h1" sx={{ fontWeight: 700 }}>
          Verify email
        </Typography>

        {status === 'loading' ? <CircularProgress /> : null}
        {status === 'success' ? (
          <>
            <Button
              variant="contained"
              onClick={() => router.replace('/login')}
              sx={{ ':hover': { backgroundColor: '#4daf30' } }}
            >
              Go to login
            </Button>
          </>
        ) : null}
      </Box>
    </WelcomeHeading>
  );
}
