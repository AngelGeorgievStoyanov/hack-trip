'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Alert, Box, Button, CircularProgress, TextField, Typography } from '@mui/material';
import { useAuth } from '@/hooks/useAuth';
import { zodResolver } from '@/lib/zodResolver';
import { getAuthErrorMessage } from '@/lib/errors';
import { isSafeInternalPath } from '@/lib/returnPath';
import { loginSchema } from '@/validations/auth';
import type { LoginInput } from '@/api/auth';
import { COLORS, CARD_SHADOW, CARD_BORDER } from '@/constants/ui';
import { WelcomeHeading } from '@/components/common/WelcomeHeading';

export function LoginForm() {
  const { login } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [serverError, setServerError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginInput>({ resolver: zodResolver(loginSchema) });

  async function onSubmit(values: LoginInput): Promise<void> {
    setSubmitting(true);
    setServerError(null);
    try {
      await login(values);
      const returnTo = searchParams.get('returnTo');
      router.replace(returnTo && isSafeInternalPath(returnTo) ? returnTo : '/profile');
    } catch (error) {
      setServerError(getAuthErrorMessage(error));
    } finally {
      setSubmitting(false);
    }
  }

  const SECONDARY_BUTTON_SX = {
    ':hover': { color: 'rgb(248 245 245)' },
    margin: '5px',
    backgroundColor: 'rgb(194 194 224)',
    color: 'black',
  } as const;

  return (
    <WelcomeHeading>
      <Box
        component="form"
        onSubmit={handleSubmit(onSubmit)}
        sx={{
          display: 'flex',
          flexDirection: 'column',
          gap: 2,
          backgroundColor: COLORS.formPanelBackground,
          boxShadow: CARD_SHADOW,
          border: CARD_BORDER,
          borderRadius: '0px',
          padding: '30px',
          maxWidth: '700px',
          width: '100%',
          boxSizing: 'border-box',
          marginX: 'auto',
        }}
      >
        <Typography variant="h5" component="div" sx={{ margin: '10px auto', textAlign: 'center' }}>
          LOGIN
        </Typography>
        {serverError ? <Alert severity="error">{serverError}</Alert> : null}
        <TextField
          label="Email"
          type="email"
          autoComplete="email"
          {...register('email')}
          error={!!errors.email}
          helperText={errors.email?.message}
        />
        <TextField
          label="Password"
          type="password"
          autoComplete="current-password"
          {...register('password')}
          error={!!errors.password}
          helperText={errors.password?.message}
        />
        <Button
          type="submit"
          variant="contained"
          disabled={submitting}
          startIcon={submitting ? <CircularProgress size={18} /> : undefined}
          sx={{ ':hover': { backgroundColor: '#4daf30' } }}
        >
          Login
        </Button>
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', justifyContent: 'center', mt: 1 }}>
          <Button component={Link} href="/register" variant="contained" sx={SECONDARY_BUTTON_SX}>
            Register
          </Button>
          <Button
            component={Link}
            href="/forgot-password"
            variant="contained"
            sx={SECONDARY_BUTTON_SX}
          >
            Forgot password?
          </Button>
          <Button
            component={Link}
            href="/resend-verification"
            variant="contained"
            sx={SECONDARY_BUTTON_SX}
          >
            Resend verification email
          </Button>
        </Box>
      </Box>
    </WelcomeHeading>
  );
}
