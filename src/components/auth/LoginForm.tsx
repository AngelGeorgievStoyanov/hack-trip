'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Alert, Box, Button, CircularProgress, TextField, Typography } from '@mui/material';
import { useAuth } from '@/hooks/useAuth';
import { zodResolver } from '@/lib/zodResolver';
import { getAuthErrorMessage } from '@/lib/errors';
import { loginSchema } from '@/validations/auth';
import type { LoginInput } from '@/api/auth';

export function LoginForm() {
  const { login } = useAuth();
  const router = useRouter();
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
      router.replace('/profile');
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
      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
        <Link href="/register">Register</Link>
        <Link href="/forgot-password">Forgot password?</Link>
      </Box>
    </Box>
  );
}
