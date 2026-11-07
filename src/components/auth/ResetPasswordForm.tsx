'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { Alert, Box, Button, CircularProgress, Typography } from '@mui/material';
import { useNotification } from '@/components/common/NotificationProvider';
import { authApi } from '@/api/auth';
import { zodResolver } from '@/lib/zodResolver';
import { getTokenErrorMessage } from '@/lib/errors';
import { resetPasswordSchema } from '@/validations/auth';
import { COLORS, CARD_SHADOW, CARD_BORDER } from '@/constants/ui';
import { WelcomeHeading } from '@/components/common/WelcomeHeading';
import { PasswordField } from '@/components/common/PasswordField';
import { PasswordRequirements } from '@/components/common/PasswordRequirements';

interface ResetPasswordFormProps {
  token?: string;
}

interface ResetFormValues {
  password: string;
}

const FORM_SX = {
  display: 'flex',
  flexDirection: 'column',
  gap: 2,
  backgroundColor: COLORS.formPanelBackground,
  boxShadow: CARD_SHADOW,
  border: CARD_BORDER,
  borderRadius: '0px',
  padding: '30px',
  maxWidth: '700px',
  width: '100%',
  boxSizing: 'border-box',
  marginX: 'auto',
} as const;

export function ResetPasswordForm({ token }: ResetPasswordFormProps) {
  const notification = useNotification();
  const [success, setSuccess] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitted, isValid, touchedFields },
  } = useForm<ResetFormValues>({
    resolver: zodResolver(resetPasswordSchema.pick({ password: true })),
    mode: 'onChange',
    reValidateMode: 'onChange',
    defaultValues: { password: '' },
  });

  const password = watch('password') ?? '';

  async function onSubmit(values: ResetFormValues): Promise<void> {
    if (!token) {
      notification.error('Missing reset token.');
      return;
    }

    setSubmitting(true);

    try {
      await authApi.resetPassword({ token, password: values.password });
      setSuccess(true);
    } catch (error) {
      notification.error(getTokenErrorMessage(error));
    } finally {
      setSubmitting(false);
    }
  }

  if (success) {
    return (
      <WelcomeHeading>
        <Box component="section" sx={FORM_SX}>
          <Typography variant="h5" component="h1" sx={{ margin: '10px auto', textAlign: 'center' }}>
            RESET PASSWORD
          </Typography>
          <Alert severity="success">
            Your password has been reset. You can now log in.
          </Alert>
          <Button component={Link} href="/login" variant="contained">
            Go to login
          </Button>
        </Box>
      </WelcomeHeading>
    );
  }

  return (
    <WelcomeHeading>
      <Box
        component="form"
        noValidate
        aria-busy={submitting}
        onSubmit={handleSubmit(onSubmit)}
        sx={FORM_SX}
      >
        <Typography variant="h5" component="h1" sx={{ margin: '10px auto', textAlign: 'center' }}>
          RESET PASSWORD
        </Typography>
        <PasswordField
          label="New password"
          autoComplete="new-password"
          disabled={submitting}
          registration={register('password')}
          error={(isSubmitted || touchedFields.password) && !!errors.password}
          helperText={
            (isSubmitted || touchedFields.password) && errors.password?.message
              ? errors.password.message
              : 'Create a password that meets all the requirements below.'
          }
        />
        <PasswordRequirements password={password} />
        <Button
          type="submit"
          variant="contained"
          disabled={submitting || !isValid}
          startIcon={submitting ? <CircularProgress size={18} /> : undefined}
          sx={{ ':hover': { backgroundColor: '#4daf30' } }}
        >
          Reset password
        </Button>
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 1 }}>
          <Button component={Link} href="/login" disabled={submitting} variant="contained">
            Back to login
          </Button>
        </Box>
      </Box>
    </WelcomeHeading>
  );
}
