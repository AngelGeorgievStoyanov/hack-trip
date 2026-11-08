import { z } from 'zod';
import { emailString, passwordString, trimmedString } from '../shared';

const captchaTokenSchema = z.string().min(1, 'Please complete the CAPTCHA.').max(8192).refine((value) => !/\\s/.test(value));
const opaqueTokenSchema = z.string().min(1).max(200).refine((value) => !/\\s/.test(value));

export const registerSchema = z
  .object({
    email: emailString(),
    password: passwordString({ min: 8, max: 72 }),
    firstName: trimmedString({
      min: 1,
      max: 45,
      minMessage: 'First Name cannot be empty string and must contain at least 2 characters .',
    }),
    lastName: trimmedString({
      min: 1,
      max: 45,
      minMessage: 'Last Name cannot be empty string and must contain at least 2 characters .',
    }),
    captchaToken: captchaTokenSchema,
  })
  .strict();

export const loginSchema = z
  .object({
    email: emailString(),
    password: z.string().trim().min(1, 'Password cannot be empty string.').max(200),
    captchaToken: captchaTokenSchema,
  })
  .strict();

export const verifyEmailSchema = z
  .object({
    token: opaqueTokenSchema,
  })
  .strict();

export const resendVerificationSchema = z
  .object({
    email: emailString(),
    captchaToken: captchaTokenSchema,
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
    password: passwordString({ min: 1, max: 200 }),
  })
  .strict();

export const changePasswordSchema = z
  .object({
    currentPassword: passwordString({ min: 1, max: 200 }),
    newPassword: passwordString({ min: 8, max: 72 }),
  })
  .strict();

export const forgotPasswordSchema = z
  .object({
    email: emailString(),
    captchaToken: captchaTokenSchema,
  })
  .strict();

export const resetPasswordSchema = z
  .object({
    token: z.string().min(1).max(200),
    password: passwordString({ min: 8, max: 72 }),
  })
  .strict();
