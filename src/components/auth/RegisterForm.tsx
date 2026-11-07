'use client';

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Box,
  Button,
  Checkbox,
  CircularProgress,
  FormControlLabel,
  IconButton,
  InputAdornment,
  TextField,
  Typography,
} from '@mui/material';
import { CheckCircleOutline, RadioButtonUnchecked, Visibility, VisibilityOff } from '@mui/icons-material';
import { z } from 'zod';
import { authApi } from '@/api/auth';
import type { RegisterInput } from '@/api/auth';
import { zodResolver } from '@/lib/zodResolver';
import { getGenericErrorMessage } from '@/lib/errors';
import { registerSchema } from '@/validations/auth';
import { COLORS, CARD_SHADOW, CARD_BORDER } from '@/constants/ui';
import { WelcomeHeading } from '@/components/common/WelcomeHeading';
import { Captcha } from '@/components/auth/Captcha';
import { useNotification } from '@/components/common/NotificationProvider';
import {
  AUTH_SUCCESS_REDIRECT_DELAY_MS,
  REGISTRATION_SUCCESS_MESSAGE,
} from '@/constants/notifications';

const registerFormSchema = registerSchema
  .extend({
    confirmPassword: z.string().min(1, 'Confirm password is required.'),
    acceptedTerms: z.literal(true, {
      error: 'You must accept the terms of use and privacy policy.',
    }),
  })
  .refine((values) => values.confirmPassword === values.password, {
    path: ['confirmPassword'],
    message: 'Passwords must match',
  });

type RegisterFormValues = z.input<typeof registerFormSchema>;

export function RegisterForm() {
  const notification = useNotification();
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [registrationComplete, setRegistrationComplete] = useState(false);
  const isFormLocked = submitting || registrationComplete;

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);
  const [captchaResetKey, setCaptchaResetKey] = useState(0);

  useEffect(() => {
    if (!registrationComplete) return;

    const redirectTimeout = window.setTimeout(
      () => router.replace('/login'),
      AUTH_SUCCESS_REDIRECT_DELAY_MS,
    );

    return () => window.clearTimeout(redirectTimeout);
  }, [registrationComplete, router]);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitted, isValid, touchedFields },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver<RegisterFormValues>(registerFormSchema),
    mode: 'onChange',
    reValidateMode: 'onChange',
    defaultValues: {
      email: '',
      firstName: '',
      lastName: '',
      password: '',
      confirmPassword: '',
      acceptedTerms: false,
      captchaToken: '',
    },
  });

  const password = watch('password') ?? '';
  const confirmPassword = watch('confirmPassword') ?? '';
  const confirmPasswordMismatch =
    confirmPassword.length > 0 && confirmPassword !== password;

  const passwordRules = [
    { label: 'At least 8 characters', valid: password.length >= 8 },
    {
      label: 'English letters, numbers and symbols only',
      valid: password.length > 0 && Array.from(password).every((character) => {
        const code = character.charCodeAt(0);
        return code >= 33 && code <= 126;
      }),
    },
    { label: 'At least one Latin letter (a–z, A–Z)', valid: /[a-zA-Z]/.test(password) },
    { label: 'At least one number (0–9)', valid: /[0-9]/.test(password) },
    {
      label: 'At least one special character (!@#$…)',
      valid: Array.from(password).some((character) => {
        const code = character.charCodeAt(0);
        const isLatinLetter = (code >= 65 && code <= 90) || (code >= 97 && code <= 122);
        const isNumber = code >= 48 && code <= 57;
        return code >= 33 && code <= 126 && !isLatinLetter && !isNumber;
      }),
    },
    {
      label: 'No spaces',
      valid: password.length > 0 && Array.from(password).every((character) => character.trim().length > 0),
    },
  ];

  async function onSubmit(values: RegisterFormValues): Promise<void> {
    setSubmitting(true);
    try {
      const input: RegisterInput = {
        email: values.email,
        password: values.password,
        firstName: values.firstName,
        lastName: values.lastName,
        captchaToken: values.captchaToken,
      };
      await authApi.register(input);
      setRegistrationComplete(true);
      notification.success(REGISTRATION_SUCCESS_MESSAGE, {
        duration: AUTH_SUCCESS_REDIRECT_DELAY_MS,
      });
    } catch (e) {
      notification.error(getGenericErrorMessage(e));
    } finally {
      setSubmitting(false);
      setCaptchaToken(null);
      setValue('captchaToken', '', { shouldValidate: true });
      setCaptchaResetKey((key) => key + 1);
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
        aria-busy={submitting}
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
          REGISTER
        </Typography>
        <TextField
          label="Email"
          disabled={isFormLocked}
          type="email"
          autoComplete="email"
          {...register('email')}
          error={(isSubmitted || touchedFields.email) && !!errors.email}
          helperText={isSubmitted || touchedFields.email ? errors.email?.message ?? ' ' : ' '}
        />
        <TextField
          label="First name"
          disabled={isFormLocked}
          autoComplete="given-name"
          {...register('firstName')}
          error={(isSubmitted || touchedFields.firstName) && !!errors.firstName}
          helperText={isSubmitted || touchedFields.firstName ? errors.firstName?.message ?? ' ' : ' '}
        />
        <TextField
          label="Last name"
          disabled={isFormLocked}
          autoComplete="family-name"
          {...register('lastName')}
          error={(isSubmitted || touchedFields.lastName) && !!errors.lastName}
          helperText={isSubmitted || touchedFields.lastName ? errors.lastName?.message ?? ' ' : ' '}
        />
        <TextField
          label="Password"
          disabled={isFormLocked}
          type={showPassword ? 'text' : 'password'}
          autoComplete="new-password"
          {...register('password')}
          error={(isSubmitted || touchedFields.password) && !!errors.password}
          helperText={
            (isSubmitted || touchedFields.password) && errors.password?.message
              ? errors.password.message
              : 'Create a password that meets all the requirements below.'
          }
          slotProps={{
            input: {
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    disabled={isFormLocked}
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
        <Box component="ul" sx={{ listStyle: 'none', p: 0, m: '-8px 0 0 4px', display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 0.75 }}>
          {passwordRules.map((rule) => (
            <Box component="li" key={rule.label} sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
              {rule.valid ? (
                <CheckCircleOutline fontSize="small" color="success" />
              ) : (
                <RadioButtonUnchecked fontSize="small" sx={{ color: 'text.disabled' }} />
              )}
              <Typography variant="caption" color={rule.valid ? 'success.main' : 'text.secondary'}>
                {rule.label}
              </Typography>
            </Box>
          ))}
        </Box>
        <TextField
          label="Confirm password"
          disabled={isFormLocked}
          type={showConfirmPassword ? 'text' : 'password'}
          autoComplete="new-password"
          {...register('confirmPassword')}
          error={
            (isSubmitted || touchedFields.confirmPassword) &&
            (confirmPasswordMismatch || !!errors.confirmPassword)
          }
          helperText={
            isSubmitted || touchedFields.confirmPassword
              ? confirmPasswordMismatch
                ? 'Passwords must match'
                : errors.confirmPassword?.message ?? ' '
              : ' '
          }
          slotProps={{
            input: {
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    disabled={isFormLocked}
                    aria-label={showConfirmPassword ? 'Hide confirm password' : 'Show confirm password'}
                    onClick={() => setShowConfirmPassword((visible) => !visible)}
                    onMouseDown={(event) => event.preventDefault()}
                    edge="end"
                  >
                    {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            },
          }}
        />
        <FormControlLabel
          sx={{ pointerEvents: isFormLocked ? 'none' : 'auto' }}
          control={<Checkbox disabled={isFormLocked} {...register('acceptedTerms')} />}
          label={
            <>
              I accept the <Link href="/privacy-policy">terms of use and privacy policy</Link>
            </>
          }
        />
        {(isSubmitted || touchedFields.acceptedTerms) && errors.acceptedTerms?.message ? (
          <Typography color="error" role="alert">
            {errors.acceptedTerms.message}
          </Typography>
        ) : null}
        <input type="hidden" {...register('captchaToken')} />
        <Captcha resetKey={captchaResetKey} disabled={isFormLocked} onTokenChange={(token) => { setCaptchaToken(token || null); setValue('captchaToken', token, { shouldValidate: true }); }} />
        <Button
          type="submit"
          variant="contained"
          disabled={isFormLocked || !isValid || !captchaToken}
          startIcon={submitting ? <CircularProgress size={18} /> : undefined}
          sx={{ ':hover': { backgroundColor: '#4daf30' } }}
        >
          Register
        </Button>
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', justifyContent: 'center', mt: 1 }}>
          <Button component={Link} href="/login" disabled={submitting} variant="contained" sx={SECONDARY_BUTTON_SX}>
            Already have an account? Login
          </Button>
          <Button
            component={Link}
            href="/resend-verification"
            disabled={isFormLocked}
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
