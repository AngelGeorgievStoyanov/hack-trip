'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Alert, Box, Button, CircularProgress, TextField, Typography } from '@mui/material';
import { useAuth } from '@/hooks/useAuth';
import { authApi } from '@/api/auth';
import type { UpdateProfileInput } from '@/api/auth';
import { zodResolver } from '@/lib/zodResolver';
import { getGenericErrorMessage } from '@/lib/errors';
import { updateProfileSchema } from '@/validations/auth';

export function ProfileForm() {
  const { user, updateUser } = useAuth();
  const [serverError, setServerError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<UpdateProfileInput>({
    resolver: zodResolver(updateProfileSchema),
    defaultValues: {
      firstName: user?.firstName ?? '',
      lastName: user?.lastName ?? '',
    },
  });

  async function onSubmit(values: UpdateProfileInput): Promise<void> {
    setSubmitting(true);
    setServerError(null);
    setSuccess(false);
    try {
      const response = await authApi.updateProfile(values);
      updateUser(response.user);
      setSuccess(true);
    } catch (error) {
      setServerError(getGenericErrorMessage(error));
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
        Profile
      </Typography>
      {success ? <Alert severity="success">Profile updated.</Alert> : null}
      {serverError ? <Alert severity="error">{serverError}</Alert> : null}
      <TextField
        label="First name"
        autoComplete="given-name"
        {...register('firstName')}
        error={!!errors.firstName}
        helperText={errors.firstName?.message}
      />
      <TextField
        label="Last name"
        autoComplete="family-name"
        {...register('lastName')}
        error={!!errors.lastName}
        helperText={errors.lastName?.message}
      />
      <Button
        type="submit"
        variant="contained"
        disabled={submitting}
        startIcon={submitting ? <CircularProgress size={18} /> : undefined}
      >
        Save
      </Button>
    </Box>
  );
}
