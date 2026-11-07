'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import Link from 'next/link';
import { Box, Button, CircularProgress, TextField, Typography } from '@mui/material';
import { authApi } from '@/api/auth';
import type { ResendVerificationInput } from '@/api/auth';
import { zodResolver } from '@/lib/zodResolver';
import { getGenericErrorMessage } from '@/lib/errors';
import { resendVerificationSchema } from '@/validations/auth';
import { useNotification } from '@/components/common/NotificationProvider';
import { Captcha } from '@/components/auth/Captcha';
import { RESEND_VERIFICATION_SUCCESS_MESSAGE } from '@/constants/notifications';

export function ResendVerificationForm() {
  const notification = useNotification();
  const [captchaToken, setCaptchaToken] = useState('');
  const [captchaResetKey, setCaptchaResetKey] = useState(0);
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<ResendVerificationInput>({
    resolver: zodResolver(resendVerificationSchema),
    defaultValues: { email: '', captchaToken: '' },
  });

  async function onSubmit(values: ResendVerificationInput): Promise<void> {
    setSubmitting(true);
    try {
      await authApi.resendVerification({ ...values, captchaToken });
      notification.success(RESEND_VERIFICATION_SUCCESS_MESSAGE);
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
    <Box component="form" onSubmit={handleSubmit(onSubmit)} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <Typography variant="h4" component="h1">Resend verification</Typography>
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
        resetKey={captchaResetKey}
        disabled={submitting}
        onTokenChange={(token) => {
          setCaptchaToken(token);
          setValue('captchaToken', token, { shouldValidate: true });
        }}
      />
      <Button type="submit" variant="contained" disabled={submitting || !captchaToken} startIcon={submitting ? <CircularProgress size={18} /> : undefined}>
        Resend
      </Button>
      <Link href="/login">Back to login</Link>
    </Box>
  );
}
