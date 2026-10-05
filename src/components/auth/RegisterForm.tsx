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

  return (
    <Box
      component="form"
      onSubmit={handleSubmit(onSubmit)}
      sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}
    >
      <Typography variant="h4" component="h1">
        Register
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
      >
        Register
      </Button>
      <Link href="/login">Already have an account? Login</Link>
      <Link href="/resend-verification">Resend verification email</Link>
    </Box>
  );
}
