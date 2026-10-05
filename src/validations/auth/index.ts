import { z } from 'zod';
import { emailString, passwordString, trimmedString } from '../shared';

export const registerSchema = z
  .object({
    email: emailString(),
    password: passwordString({ min: 8, max: 72 }),
    firstName: trimmedString({
      min: 2,
      max: 15,
      minMessage: 'First Name cannot be empty string and must contain at least 2 characters .',
    }),
    lastName: trimmedString({
      min: 2,
      max: 15,
      minMessage: 'Last Name cannot be empty string and must contain at least 2 characters .',
    }),
  })
  .strict();

export const loginSchema = z
  .object({
    email: emailString(),
    password: z.string().min(1, 'Password cannot be empty string.').max(200),
  })
  .strict();

export const verifyEmailSchema = z
  .object({
    token: trimmedString({ min: 1, max: 200 }),
  })
  .strict();

export const resendVerificationSchema = z
  .object({
    email: emailString(),
  })
  .strict();

export const updateProfileSchema = z
  .object({
    firstName: trimmedString({
      min: 2,
      max: 15,
      minMessage: 'First Name cannot be empty string and must contain at least 2 characters .',
    }),
    lastName: trimmedString({
      min: 2,
      max: 15,
      minMessage: 'Last Name cannot be empty string and must contain at least 2 characters .',
    }),
  })
  .strict();

export const confirmPasswordSchema = z
  .object({
    password: z.string().min(1, 'Password cannot be empty string.').max(200),
  })
  .strict();

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, 'Old password is required.').max(200),
    newPassword: passwordString({ min: 8, max: 72 }),
  })
  .strict();

export const forgotPasswordSchema = z
  .object({
    email: emailString(),
  })
  .strict();

export const resetPasswordSchema = z
  .object({
    token: z.string().min(1).max(200),
    password: passwordString({ min: 8, max: 72 }),
  })
  .strict();
