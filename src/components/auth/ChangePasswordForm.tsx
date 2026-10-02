'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Alert, Box, Button, CircularProgress, TextField, Typography } from '@mui/material';
import { authApi } from '@/api/auth';
import type { ChangePasswordInput } from '@/api/auth';
import { zodResolver } from '@/lib/zodResolver';
import { getAuthErrorMessage } from '@/lib/errors';
import { changePasswordSchema } from '@/validations/auth';

export function ChangePasswordForm() {
  const [serverError, setServerError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ChangePasswordInput>({ resolver: zodResolver(changePasswordSchema) });

  async function onSubmit(values: ChangePasswordInput): Promise<void> {
    setSubmitting(true);
    setServerError(null);
    setSuccess(false);
    try {
      await authApi.changePassword(values);
      setSuccess(true);
      reset();
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
      <Typography variant="h5" component="h2">
        Change password
      </Typography>
      {success ? <Alert severity="success">Password changed.</Alert> : null}
      {serverError ? <Alert severity="error">{serverError}</Alert> : null}
      <TextField
        label="Current password"
        type="password"
        autoComplete="current-password"
        {...register('currentPassword')}
        error={!!errors.currentPassword}
        helperText={errors.currentPassword?.message}
      />
      <TextField
        label="New password"
        type="password"
        autoComplete="new-password"
        {...register('newPassword')}
        error={!!errors.newPassword}
        helperText={errors.newPassword?.message}
      />
      <Button
        type="submit"
        variant="contained"
        disabled={submitting}
        startIcon={submitting ? <CircularProgress size={18} /> : undefined}
      >
        Change password
      </Button>
    </Box>
  );
}
