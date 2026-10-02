import { z } from 'zod';
import { emailString, passwordString, trimmedString } from '../shared';

/**
 * Auth request schemas (API_CONTRACT.md §18.2). All `.strict()`.
 */

export const registerSchema = z
  .object({
    email: emailString(),
    password: passwordString({ min: 8, max: 72 }),
    firstName: trimmedString({ min: 1, max: 45 }),
    lastName: trimmedString({ min: 1, max: 45 }),
  })
  .strict();

export const loginSchema = z
  .object({
    email: emailString(),
    password: z.string().min(1).max(200),
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
    firstName: trimmedString({ min: 1, max: 45 }),
    lastName: trimmedString({ min: 1, max: 45 }),
  })
  .strict();

export const confirmPasswordSchema = z
  .object({
    password: z.string().min(1).max(200),
  })
  .strict();

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1).max(200),
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
