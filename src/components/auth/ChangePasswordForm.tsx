'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Alert, Box, Button, CircularProgress } from '@mui/material';
import { authApi } from '@/api/auth';
import { zodResolver } from '@/lib/zodResolver';
import { getAuthErrorMessage } from '@/lib/errors';
import { changePasswordSchema } from '@/validations/auth';
import { PasswordField } from '@/components/common/PasswordField';
import { PasswordRequirements } from '@/components/common/PasswordRequirements';

const changePasswordFormSchema = changePasswordSchema
  .extend({
    confirmNewPassword: z.string().min(1, 'Please confirm your new password.'),
  })
  .refine((values) => values.newPassword === values.confirmNewPassword, {
    path: ['confirmNewPassword'],
    message: 'Passwords must match',
  });

type ChangePasswordFormValues = z.infer<typeof changePasswordFormSchema>;

export function ChangePasswordForm() {
  const [expanded, setExpanded] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors, isValid, isSubmitted, touchedFields },
  } = useForm<ChangePasswordFormValues>({
    resolver: zodResolver<ChangePasswordFormValues>(changePasswordFormSchema),
    mode: 'onChange',
    reValidateMode: 'onChange',
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmNewPassword: '',
    },
  });

  const newPassword = watch('newPassword') ?? '';

  function toggleExpanded(): void {
    if (submitting) return;
    if (expanded) {
      reset();
      setServerError(null);
      setSuccess(false);
    }
    setExpanded((current) => !current);
  }

  async function onSubmit(values: ChangePasswordFormValues): Promise<void> {
    setSubmitting(true);
    setServerError(null);
    setSuccess(false);
    try {
      await authApi.changePassword({
        currentPassword: values.currentPassword,
        newPassword: values.newPassword,
      });
      setSuccess(true);
      reset();
    } catch (error) {
      setServerError(getAuthErrorMessage(error));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <Button
        variant="contained"
        onClick={toggleExpanded}
        disabled={submitting}
        sx={{
          alignSelf: 'flex-start',
          backgroundColor: 'rgb(194 194 224)',
          color: 'black',
          ':hover': { color: 'rgb(248 245 245)' },
        }}
      >
        {expanded ? 'HIDE CHANGE PASSWORD' : 'CHANGE PASSWORD'}
      </Button>

      {success ? <Alert severity="success">Password changed.</Alert> : null}
      {expanded ? (
        <Box
          component="form"
          noValidate
          aria-busy={submitting}
          onSubmit={handleSubmit(onSubmit)}
          sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}
        >
          {serverError ? <Alert severity="error">{serverError}</Alert> : null}
          <PasswordField
            label="Current password"
            autoComplete="current-password"
            maxLength={200}
            registration={register('currentPassword')}
            error={!!errors.currentPassword}
            helperText={errors.currentPassword?.message ?? ' '}
          />
          <PasswordField
            label="New password"
            autoComplete="new-password"
            registration={register('newPassword')}
            error={!!errors.newPassword}
            helperText={
              (isSubmitted || touchedFields.newPassword) && errors.newPassword?.message
                ? errors.newPassword.message
                : 'Create a password that meets all the requirements below.'
            }
          />
          <PasswordRequirements password={newPassword} />
          <PasswordField
            label="Confirm new password"
            autoComplete="new-password"
            registration={register('confirmNewPassword')}
            error={!!errors.confirmNewPassword}
            helperText={errors.confirmNewPassword?.message ?? ' '}
          />
          <Button
            type="submit"
            variant="contained"
            disabled={submitting || !isValid}
            startIcon={submitting ? <CircularProgress size={18} /> : undefined}
            sx={{ alignSelf: 'flex-start', ':hover': { backgroundColor: '#4daf30' } }}
          >
            Save password
          </Button>
        </Box>
      ) : null}
    </Box>
  );
}
