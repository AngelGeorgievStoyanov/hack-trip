'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import Link from 'next/link';
import { Alert, Box, Button, CircularProgress, TextField, Typography } from '@mui/material';
import { authApi } from '@/api/auth';
import type { ResendVerificationInput } from '@/api/auth';
import { zodResolver } from '@/lib/zodResolver';
import { getGenericErrorMessage } from '@/lib/errors';
import { resendVerificationSchema } from '@/validations/auth';

export function ResendVerificationForm() {
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResendVerificationInput>({ resolver: zodResolver(resendVerificationSchema) });

  async function onSubmit(values: ResendVerificationInput): Promise<void> {
    setSubmitting(true);
    setError(null);
    setMessage(null);
    try {
      const response = await authApi.resendVerification(values);
      // Anti-enumeration: neutral message whether or not the account exists/needs it.
      setMessage(response.message);
    } catch (e) {
      setError(getGenericErrorMessage(e));
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
        Resend verification
      </Typography>
      {message ? <Alert severity="success">{message}</Alert> : null}
      {error ? <Alert severity="error">{error}</Alert> : null}
      <TextField
        label="Email"
        type="email"
        autoComplete="email"
        {...register('email')}
        error={!!errors.email}
        helperText={errors.email?.message}
      />
      <Button
        type="submit"
        variant="contained"
        disabled={submitting}
        startIcon={submitting ? <CircularProgress size={18} /> : undefined}
      >
        Resend
      </Button>
      <Link href="/login">Back to login</Link>
    </Box>
  );
}
