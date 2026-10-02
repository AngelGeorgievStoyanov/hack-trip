'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { Alert, Box, Button, CircularProgress, TextField, Typography } from '@mui/material';
import { authApi } from '@/api/auth';
import { zodResolver } from '@/lib/zodResolver';
import { getTokenErrorMessage } from '@/lib/errors';
import { resetPasswordSchema } from '@/validations/auth';

interface ResetPasswordFormProps {
  token?: string;
}

interface ResetFormValues {
  password: string;
}

export function ResetPasswordForm({ token }: ResetPasswordFormProps) {
  const [serverError, setServerError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetFormValues>({
    resolver: zodResolver(resetPasswordSchema.pick({ password: true })),
  });

  async function onSubmit(values: ResetFormValues): Promise<void> {
    if (!token) {
      setServerError('Missing reset token.');
      return;
    }
    setSubmitting(true);
    setServerError(null);
    try {
      await authApi.resetPassword({ token, password: values.password });
      setSuccess(true);
    } catch (error) {
      setServerError(getTokenErrorMessage(error));
    } finally {
      setSubmitting(false);
    }
  }

  if (success) {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        <Alert severity="success">Your password has been reset. You can now log in.</Alert>
        <Link href="/login">Go to login</Link>
      </Box>
    );
  }

  return (
    <Box
      component="form"
      onSubmit={handleSubmit(onSubmit)}
      sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}
    >
      <Typography variant="h4" component="h1">
        Reset password
      </Typography>
      {serverError ? <Alert severity="error">{serverError}</Alert> : null}
      <TextField
        label="New password"
        type="password"
        autoComplete="new-password"
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
        Reset password
      </Button>
    </Box>
  );
}
