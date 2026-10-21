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
  TextField,
  Typography,
} from '@mui/material';
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

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormValues>({ resolver: zodResolver(registerFormSchema) });

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
      // Anti-enumeration: the backend returns a neutral message whether or not the email
      // is already registered.
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
          error={!!errors.email}
          helperText={errors.email?.message}
        />
        <TextField
          label="First name"
          autoComplete="given-name"
          {...register('firstName')}
          error={!!errors.firstName}
          helperText={errors.firstName?.message}
        />
        <TextField
          label="Last name"
          autoComplete="family-name"
          {...register('lastName')}
          error={!!errors.lastName}
          helperText={errors.lastName?.message}
        />
        <TextField
          label="Password"
          type="password"
          autoComplete="new-password"
          {...register('password')}
          error={!!errors.password}
          helperText={errors.password?.message}
        />
        <TextField
          label="Confirm password"
          type="password"
          autoComplete="new-password"
          {...register('confirmPassword')}
          error={!!errors.confirmPassword}
          helperText={errors.confirmPassword?.message}
        />
        <FormControlLabel
          control={<Checkbox {...register('acceptedTerms')} />}
          label={
            <>
              I accept the <Link href="/privacy-policy">terms of use and privacy policy</Link>
            </>
          }
        />
        {errors.acceptedTerms?.message ? (
          <Typography color="error" role="alert">
            {errors.acceptedTerms.message}
          </Typography>
        ) : null}
        <Button
          type="submit"
          variant="contained"
          disabled={submitting}
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
