'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Alert, Box, Button, CircularProgress, TextField, Typography } from '@mui/material';
import { authApi } from '@/api/auth';
import type { ConfirmPasswordInput } from '@/api/auth';
import { zodResolver } from '@/lib/zodResolver';
import { getGenericErrorMessage } from '@/lib/errors';
import { confirmPasswordSchema } from '@/validations/auth';

export function ConfirmPasswordForm() {
  const [result, setResult] = useState<'idle' | 'valid' | 'invalid'>('idle');
  const [serverError, setServerError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ConfirmPasswordInput>({ resolver: zodResolver(confirmPasswordSchema) });

  async function onSubmit(values: ConfirmPasswordInput): Promise<void> {
    setSubmitting(true);
    setServerError(null);
    try {
      const response = await authApi.confirmPassword(values);
      setResult(response.valid ? 'valid' : 'invalid');
      reset();
    } catch (error) {
      setServerError(getGenericErrorMessage(error));
      setResult('idle');
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
      {result === 'valid' ? <Alert severity="success">Password confirmed.</Alert> : null}
      {result === 'invalid' ? <Alert severity="warning">Incorrect password.</Alert> : null}
      {serverError ? <Alert severity="error">{serverError}</Alert> : null}
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
