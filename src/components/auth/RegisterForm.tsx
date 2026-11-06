'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import Link from 'next/link';
import {
  Alert,
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

type RegisterFormValues = z.infer<typeof registerFormSchema>;

export function RegisterForm() {
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitted },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerFormSchema),
    mode: 'onSubmit',
    reValidateMode: 'onChange',
    defaultValues: {
      email: '',
      firstName: '',
      lastName: '',
      password: '',
      confirmPassword: '',
      acceptedTerms: false,
    },
  });

  const password = watch('password') ?? '';
  const passwordRules = [
    { label: 'At least 8 characters', valid: password.length >= 8 },
    { label: 'At least one letter', valid: /[a-zA-Z]/.test(password) },
    { label: 'At least one number', valid: /\d/.test(password) },
    { label: 'At least one symbol', valid: /\W/.test(password) },
    { label: 'No spaces', valid: !/\s/.test(password) },
  ];

  async function onSubmit(values: RegisterFormValues): Promise<void> {
    setSubmitting(true);
    setError(null);
    setMessage(null);
    try {
      const input: RegisterInput = {
        email: values.email,
        password: values.password,
        firstName: values.firstName,
        lastName: values.lastName,
      };
      const response = await authApi.register(input);
      setMessage(response.message);
    } catch (e) {
      setError(getGenericErrorMessage(e));
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
          REGISTER
        </Typography>
        {message ? <Alert severity="success">{message}</Alert> : null}
        {error ? <Alert severity="error">{error}</Alert> : null}
        <TextField
          label="Email"
          type="email"
          autoComplete="email"
          {...register('email')}
          error={isSubmitted && !!errors.email}
          helperText={isSubmitted ? errors.email?.message : ' '}
        />
        <TextField
          label="First name"
          autoComplete="given-name"
          {...register('firstName')}
          error={isSubmitted && !!errors.firstName}
          helperText={isSubmitted ? errors.firstName?.message : ' '}
        />
        <TextField
          label="Last name"
          autoComplete="family-name"
          {...register('lastName')}
          error={isSubmitted && !!errors.lastName}
          helperText={isSubmitted ? errors.lastName?.message : ' '}
        />
        <TextField
          label="Password"
          type={showPassword ? 'text' : 'password'}
          autoComplete="new-password"
          {...register('password')}
          error={isSubmitted && !!errors.password}
          helperText={
            isSubmitted && errors.password?.message
              ? errors.password.message
              : 'Create a password that meets all the requirements below.'
          }
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
          type={showConfirmPassword ? 'text' : 'password'}
          autoComplete="new-password"
          {...register('confirmPassword')}
          error={isSubmitted && !!errors.confirmPassword}
          helperText={isSubmitted ? errors.confirmPassword?.message : ' '}
          slotProps={{
            input: {
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
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
          control={<Checkbox {...register('acceptedTerms')} />}
          label={
            <>
              I accept the <Link href="/privacy-policy">terms of use and privacy policy</Link>
            </>
          }
        />
        {isSubmitted && errors.acceptedTerms?.message ? (
          <Typography color="error" role="alert">
            {errors.acceptedTerms.message}
          </Typography>
        ) : null}
        <Button
          type="submit"
          variant="contained"
          disabled={submitting || !!message}
          startIcon={submitting ? <CircularProgress size={18} /> : undefined}
          sx={{ ':hover': { backgroundColor: '#4daf30' } }}
        >
          Register
        </Button>
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', justifyContent: 'center', mt: 1 }}>
          <Button component={Link} href="/login" variant="contained" sx={SECONDARY_BUTTON_SX}>
            Already have an account? Login
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
