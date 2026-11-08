'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { Alert, Box, Button, CircularProgress, TextField, Typography } from '@mui/material';
import { useAuth } from '@/hooks/useAuth';
import { authApi } from '@/api/auth';
import type { UpdateProfileInput } from '@/api/auth';
import { zodResolver } from '@/lib/zodResolver';
import { getGenericErrorMessage } from '@/lib/errors';
import { updateProfileSchema } from '@/validations/auth';
import { ChangePasswordForm } from '@/components/auth/ChangePasswordForm';

export function ProfileForm() {
  const { user, updateUser } = useAuth();
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [passwordExpanded, setPasswordExpanded] = useState(false);

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
    <>
      <Box
        component="form"
        noValidate
        aria-busy={submitting}
        onSubmit={handleSubmit(onSubmit)}
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'stretch',
          gap: 1.5,
          width: '100%',
          '& .MuiTextField-root': { width: 'calc(100% - 10px)', mx: '5px' },
        }}
      >
        <Typography variant="h5" component="h2" sx={{ textAlign: 'center', my: 1 }}>
          {user?.firstName ? `${user.firstName}'s  PROFILE` : 'PROFILE'}
        </Typography>
        {success ? <Alert severity="success">{'Profile updated.'}</Alert> : null}
        {serverError ? <Alert severity="error">{serverError}</Alert> : null}
        <TextField
          label="Email"
          type="email"
          autoComplete="email"
          value={user?.email ?? ''}
          slotProps={{ htmlInput: { readOnly: true } }}
        />
        <TextField
          label="First Name"
          autoComplete="given-name"
          {...register('firstName')}
          error={!!errors.firstName}
          helperText={errors.firstName?.message}
        />
        <TextField
          label="Last Name"
          autoComplete="family-name"
          {...register('lastName')}
          error={!!errors.lastName}
          helperText={errors.lastName?.message}
        />
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: 1,
            mt: 1,
            '& .MuiButton-root': { m: '2px' },
          }}
        >
          <Button
            type="submit"
            variant="contained"
            disabled={submitting}
            startIcon={submitting ? <CircularProgress size={18} /> : undefined}
            sx={{ ':hover': { backgroundColor: '#4daf30' } }}
          >
            EDIT PROFILE
          </Button>
          <Button
            variant="contained"
            onClick={() => router.back()}
            sx={{
              backgroundColor: 'rgb(194 194 224)',
              color: 'black',
              ':hover': { color: 'rgb(248 245 245)' },
            }}
          >
            BACK
          </Button>
          <Button
            variant="contained"
            onClick={() => setPasswordExpanded((current) => !current)}
            disabled={submitting}
            sx={{
              backgroundColor: 'rgb(194 194 224)',
              color: 'black',
              ':hover': { color: 'rgb(248 245 245)' },
            }}
          >
            {passwordExpanded ? 'HIDE CHANGE PASSWORD' : 'CHANGE PASSWORD'}
          </Button>
        </Box>
      </Box>
      <ChangePasswordForm expanded={passwordExpanded} />
    </>
  );
}
