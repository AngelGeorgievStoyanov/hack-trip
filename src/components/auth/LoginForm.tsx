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

  return (
    <Box
      component="form"
      onSubmit={handleSubmit(onSubmit)}
      sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}
    >
      <Typography variant="h4" component="h1">
        Login
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
      >
        Login
      </Button>
      <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
        <Link href="/register">Register</Link>
        <Link href="/forgot-password">Forgot password?</Link>
        <Link href="/resend-verification">Resend verification email</Link>
      </Box>
    </Box>
  );
}
