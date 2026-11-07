'use client';

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Box,
  Button,
  CircularProgress,
  IconButton,
  InputAdornment,
  TextField,
  Typography,
} from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import { useAuth } from '@/hooks/useAuth';
import { zodResolver } from '@/lib/zodResolver';
import { getAuthErrorMessage } from '@/lib/errors';
import { loginSchema } from '@/validations/auth';
import type { LoginInput } from '@/api/auth';
import { COLORS, CARD_SHADOW, CARD_BORDER } from '@/constants/ui';
import { WelcomeHeading } from '@/components/common/WelcomeHeading';
import { useNotification } from '@/components/common/NotificationProvider';
import { Captcha } from '@/components/auth/Captcha';
import { LOGIN_EMAIL_VERIFIED_MESSAGE } from '@/constants/notifications';

export function LoginForm() {
  const { login } = useAuth();
  const router = useRouter();
  const notification = useNotification();
  const [captchaToken, setCaptchaToken] = useState('');

  useEffect(() => {
    if (typeof BroadcastChannel === 'undefined') return;
    const channel = new BroadcastChannel('hacktrip-auth-events');
    const handleMessage = (event: MessageEvent<{ type?: string }>) => {
      if (event.data?.type === 'email-verified') notification.success(LOGIN_EMAIL_VERIFIED_MESSAGE);
    };
    channel.addEventListener('message', handleMessage);
    return () => { channel.removeEventListener('message', handleMessage); channel.close(); };
  }, [notification]);
  const [submitting, setSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitted },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    mode: 'onSubmit',
    reValidateMode: 'onChange',
  });

  async function onSubmit(values: LoginInput): Promise<void> {
    setSubmitting(true);
    try {
      await login({ ...values, captchaToken });
      router.replace('/');
    } catch (error) {
      notification.error(getAuthErrorMessage(error));
    } finally {
      setSubmitting(false);
    }
  }

  const SECONDARY_BUTTON_SX = {
    ':hover': { color: 'rgb(248 245 245)' },
    margin: '5px',
    backgroundColor: 'rgb(194 194 224)',
    color: 'black',
  } as const;

  return (
    <WelcomeHeading>
      <Box
        component="form"
        noValidate
        onSubmit={handleSubmit(onSubmit)}
        sx={{
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
        }}
      >
        <Typography variant="h5" component="div" sx={{ margin: '10px auto', textAlign: 'center' }}>
          LOGIN
        </Typography>
        <TextField
          label="Email"
          type="email"
          autoComplete="email"
          {...register('email')}
          error={isSubmitted && !!errors.email}
          helperText={isSubmitted ? errors.email?.message : ' '}
        />
        <TextField
          label="Password"
          type={showPassword ? 'text' : 'password'}
          autoComplete="current-password"
          {...register('password')}
          error={isSubmitted && !!errors.password}
          helperText={isSubmitted ? errors.password?.message : ' '}
          slotProps={{
            input: {
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                    onClick={() => setShowPassword((visible) => !visible)}
                    onMouseDown={(event) => event.preventDefault()}
                    edge="end"
                  >
                    {showPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            },
          }}
        />
        <input type="hidden" {...register('captchaToken')} />
        <Captcha disabled={submitting} onTokenChange={(token) => { setCaptchaToken(token); setValue('captchaToken', token, { shouldValidate: true }); }} />
        <Button
          type="submit"
          variant="contained"
          disabled={submitting || !captchaToken}
          startIcon={submitting ? <CircularProgress size={18} /> : undefined}
          sx={{ ':hover': { backgroundColor: '#4daf30' } }}
        >
          Login
        </Button>
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', justifyContent: 'center', mt: 1 }}>
          <Button component={Link} href="/register" variant="contained" sx={SECONDARY_BUTTON_SX}>
            Register
          </Button>
          <Button
            component={Link}
            href="/forgot-password"
            variant="contained"
            sx={SECONDARY_BUTTON_SX}
          >
            Forgot password?
          </Button>
          <Button
            component={Link}
            href="/resend-verification"
            variant="contained"
            sx={SECONDARY_BUTTON_SX}
          >
            Resend verification email
          </Button>
        </Box>
      </Box>
    </WelcomeHeading>
  );
}
