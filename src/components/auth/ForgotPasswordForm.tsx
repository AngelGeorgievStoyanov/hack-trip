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

export function ForgotPasswordForm() {
  const notification = useNotification();
  const [captchaToken, setCaptchaToken] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
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
    }
  }

  return (
    <Box component="form" onSubmit={handleSubmit(onSubmit)} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <Typography variant="h4" component="h1">Forgot password</Typography>
      <TextField
        label="Email"
        type="email"
        autoComplete="email"
        {...register('email')}
        error={!!errors.email}
        helperText={errors.email?.message}
      />
      <input type="hidden" {...register('captchaToken')} />
      <Captcha
        disabled={submitting}
        onTokenChange={(token) => {
          setCaptchaToken(token);
          setValue('captchaToken', token, { shouldValidate: true });
        }}
      />
      <Button type="submit" variant="contained" disabled={submitting || !captchaToken} startIcon={submitting ? <CircularProgress size={18} /> : undefined}>
        Send reset link
      </Button>
      <Link href="/login">Back to login</Link>
    </Box>
  );
}
