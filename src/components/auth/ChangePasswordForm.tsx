'use client';

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Box, Button, CircularProgress } from '@mui/material';
import { authApi } from '@/api/auth';
import { normalizeApiError } from '@/api/client';
import { API_ERROR_CODES } from '@/constants/api';
import { zodResolver } from '@/lib/zodResolver';
import { getAuthErrorMessage } from '@/lib/errors';
import { changePasswordSchema } from '@/validations/auth';
import { PasswordField } from '@/components/common/PasswordField';
import { PasswordRequirements } from '@/components/common/PasswordRequirements';
import { useNotification } from '@/components/common/NotificationProvider';

const changePasswordFormSchema = changePasswordSchema
  .extend({
    confirmNewPassword: z.string().min(1, 'Please confirm your new password.'),
  })
  .refine((values) => values.newPassword !== values.currentPassword, {
    path: ['newPassword'],
    message: 'New password must be different from your current password.',
  })
  .refine((values) => values.newPassword === values.confirmNewPassword, {
    path: ['confirmNewPassword'],
    message: 'Passwords must match',
  });

type ChangePasswordFormValues = z.infer<typeof changePasswordFormSchema>;

interface ChangePasswordFormProps {
  expanded: boolean;
}

export function ChangePasswordForm({ expanded }: ChangePasswordFormProps) {
  const notification = useNotification();
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

  useEffect(() => {
    if (!expanded) {
      reset();
    }
  }, [expanded, reset]);

  async function onSubmit(values: ChangePasswordFormValues): Promise<void> {
    setSubmitting(true);
    try {
      await authApi.changePassword({
        currentPassword: values.currentPassword,
        newPassword: values.newPassword,
      });
      notification.success('Password changed.');
      reset();
    } catch (error) {
      const apiError = normalizeApiError(error);
      notification.error(
        apiError.code === API_ERROR_CODES.UNAUTHORIZED
          ? 'Current password is incorrect.'
          : getAuthErrorMessage(error),
      );
    } finally {
      setSubmitting(false);
    }
  }

  if (!expanded) return null;

  return (
    <Box
      component="form"
      noValidate
      aria-busy={submitting}
      onSubmit={handleSubmit(onSubmit)}
      sx={{
        display: 'flex',
        flexDirection: 'column',
        gap: 1.5,
        width: '100%',
        mt: 2,
        '& .MuiTextField-root': { width: 'calc(100% - 10px)', mx: '5px' },
      }}
    >
      {expanded ? (
        <>
          <PasswordField
            label="Old Password"
            autoComplete="current-password"
            maxLength={200}
            registration={register('currentPassword')}
            error={!!errors.currentPassword}
            helperText={errors.currentPassword?.message ?? ' '}
          />
          <PasswordField
            label="Password"
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
            label="Confirm Password"
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
            sx={{ alignSelf: 'flex-start', m: '2px', ':hover': { backgroundColor: '#4daf30' } }}
          >
            Save password
          </Button>
        </>
      ) : null}
    </Box>
  );
}
