'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Box, Button, CircularProgress, TextField, Typography } from '@mui/material';
import { authApi } from '@/api/auth';
import type { ConfirmPasswordInput } from '@/api/auth';
import { zodResolver } from '@/lib/zodResolver';
import { getGenericErrorMessage } from '@/lib/errors';
import { useNotification } from '@/components/common/NotificationProvider';
import { confirmPasswordSchema } from '@/validations/auth';

export function ConfirmPasswordForm() {
  const notification = useNotification();
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ConfirmPasswordInput>({ resolver: zodResolver(confirmPasswordSchema) });

  async function onSubmit(values: ConfirmPasswordInput): Promise<void> {
    setSubmitting(true);
    try {
      const response = await authApi.confirmPassword(values);
      if (response.valid) notification.success('Password confirmed.');
      else notification.warning('Incorrect password.');
      reset();
    } catch (error) {
      notification.error(getGenericErrorMessage(error));
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
        Confirm password
      </Typography>
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
        Confirm
      </Button>
    </Box>
  );
}
