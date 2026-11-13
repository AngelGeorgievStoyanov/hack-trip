'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import Link from 'next/link';
import { Box, Button, CircularProgress, TextField, Typography } from '@mui/material';
import { authApi } from '@/api/auth';
import type { ForgotPasswordInput } from '@/api/auth';
import { zodResolver } from '@/lib/zodResolver';
import { getGenericErrorMessage } from '@/lib/errors';
import { forgotPasswordSchema } from '@/validations/auth';
import { useNotification } from '@/components/common/NotificationProvider';
import { Captcha } from '@/components/auth/Captcha';
import { FORGOT_PASSWORD_SUCCESS_MESSAGE } from '@/constants/notifications';
import { BUTTON_STYLES, FORM_PANEL_SX } from '@/constants/ui';
import { WelcomeHeading } from '@/components/common/WelcomeHeading';

const SECONDARY_BUTTON_SX = { ...BUTTON_STYLES.secondary, margin: '5px' } as const;

export function ForgotPasswordForm() {
  const notification = useNotification();
  const [captchaToken, setCaptchaToken] = useState('');
  const [captchaResetKey, setCaptchaResetKey] = useState(0);
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitted },
  } = useForm<ForgotPasswordInput>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: '', captchaToken: '' },
  });

  async function onSubmit(values: ForgotPasswordInput): Promise<void> {
    setSubmitting(true);
    try {
      await authApi.forgotPassword({ ...values, captchaToken });
      notification.success(FORGOT_PASSWORD_SUCCESS_MESSAGE);
    } catch (error) {
      notification.error(getGenericErrorMessage(error));
    } finally {
      setSubmitting(false);
      setCaptchaToken('');
      setValue('captchaToken', '', { shouldValidate: true });
      setCaptchaResetKey((key) => key + 1);
    }
  }

  return (
    <WelcomeHeading>
      <Box
        component="form"
        noValidate
        aria-busy={submitting}
        onSubmit={handleSubmit(onSubmit)}
        sx={{
          display: 'flex',
          flexDirection: 'column',
          gap: 2,
          ...FORM_PANEL_SX,
          padding: '30px',
          maxWidth: '700px',
          width: '100%',
          boxSizing: 'border-box',
          marginX: 'auto',
        }}
      >
        <Typography variant="h5" component="h1" sx={{ margin: '10px auto', textAlign: 'center' }}>
          FORGOT PASSWORD
        </Typography>
        <TextField
          label="Email"
          type="email"
          autoComplete="email"
          {...register('email')}
          error={isSubmitted && !!errors.email}
          helperText={isSubmitted ? (errors.email?.message ?? ' ') : ' '}
        />
        <input type="hidden" {...register('captchaToken')} />
        <Captcha
          resetKey={captchaResetKey}
          disabled={submitting}
          onTokenChange={(token) => {
            setCaptchaToken(token);
            setValue('captchaToken', token, { shouldValidate: true });
          }}
        />
        <Button
          type="submit"
          variant="contained"
          disabled={submitting || !captchaToken}
          startIcon={submitting ? <CircularProgress size={18} /> : undefined}
          sx={BUTTON_STYLES.containedHover}
        >
          Send reset link
        </Button>
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 1 }}>
          <Button
            component={Link}
            href="/login"
            disabled={submitting}
            variant="contained"
            sx={SECONDARY_BUTTON_SX}
          >
            Back to login
          </Button>
        </Box>
      </Box>
    </WelcomeHeading>
  );
}
