import { z } from 'zod';

const MAX_RESOURCE_ID = 2147483647;
const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

interface LengthOptions {
  max: number;
  min?: number;
}

/** `z.string() -> trim() -> pipe(min/max/regex)` with optional legacy wording. */
export function trimmedString({
  max,
  min,
  pattern,
  patternMessage,
  minMessage,
  maxMessage,
}: LengthOptions & {
  pattern?: RegExp;
  patternMessage?: string;
  minMessage?: string;
  maxMessage?: string;
}): z.ZodString {
  const base = z.string().trim();
  const withMin = min !== undefined ? (minMessage ? base.min(min, minMessage) : base.min(min)) : base;
  const withMax = maxMessage ? withMin.max(max, maxMessage) : withMin.max(max);
  if (pattern) {
    return patternMessage ? withMax.regex(pattern, patternMessage) : withMax.regex(pattern);
  }
  return withMax;
}

/** Trimmed email string (1..45 + email pattern). */
export const emailString = (message = 'Invalid email address') =>
  trimmedString({ min: 1, max: 45, pattern: EMAIL_REGEX, patternMessage: message });

/**
 * Password policy shared verbatim by the frontend and backend.
 * Only ASCII Latin letters, digits and printable ASCII punctuation count
 * toward the required character classes. Any Unicode whitespace is rejected.
 */
export interface PasswordRequirement {
  key: 'minLength' | 'maxLength' | 'printableAscii' | 'latinLetter' | 'number' | 'specialCharacter' | 'noSpaces';
  label: string;
  valid: boolean;
}

/**
 * Password requirements used by both the Zod validator and the live form feedback.
 * Keep this as the single frontend source of truth for the password policy.
 */
export function getPasswordRequirements(value: string, minLength = 8, maxLength = 72): PasswordRequirement[] {
  const normalizedValue = value.trim();
  const characters = Array.from(normalizedValue);
  const isPrintableAscii = characters.every((character) => {
    const code = character.charCodeAt(0);
    return code >= 33 && code <= 126;
  });

  return [
    { key: 'minLength', label: `At least ${minLength} characters`, valid: normalizedValue.length >= minLength },
    { key: 'maxLength', label: `At most ${maxLength} characters`, valid: normalizedValue.length <= maxLength },
    {
      key: 'printableAscii',
      label: 'English letters, numbers and symbols only',
      valid: normalizedValue.length > 0 && isPrintableAscii,
    },
    {
      key: 'latinLetter',
      label: 'At least one Latin letter (a–z, A–Z)',
      valid: /[a-zA-Z]/.test(normalizedValue),
    },
    { key: 'number', label: 'At least one number (0–9)', valid: /[0-9]/.test(normalizedValue) },
    {
      key: 'specialCharacter',
      label: 'At least one special character (!@#$…)',
      valid: characters.some((character) => {
        const code = character.charCodeAt(0);
        const isLatinLetter =
          (code >= 65 && code <= 90) || (code >= 97 && code <= 122);
        const isNumber = code >= 48 && code <= 57;
        return code >= 33 && code <= 126 && !isLatinLetter && !isNumber;
      }),
    },
    {
      key: 'noSpaces',
      label: 'No spaces',
      valid: normalizedValue.length > 0 && characters.every((character) => !/\s/.test(character)),
    },
  ];
}

export function isValidPassword(value: string, minLength = 8, maxLength = 72): boolean {
  return getPasswordRequirements(value, minLength, maxLength).every((requirement) => requirement.valid);
}

/** Password policy shared by registration, reset and password changes. */
export function passwordString(
  { min, max }: { min: number; max: number },
  messages?: { min?: string; max?: string; pattern?: string },
) {
  return z
    .string()
    .trim()
    .min(min, messages?.min ?? `Password must contain at least ${min} characters.`)
    .max(max, messages?.max ?? `Password must not exceed ${max} characters.`)
    .refine(
      (value) => new TextEncoder().encode(value).length <= max,
      messages?.max ?? `Password must be at most ${max} bytes.`,
    )
    .refine(
      (value) => isValidPassword(value, min, max),
      messages?.pattern ??
        'Use at least 8 characters with a Latin letter, a number and a special character. Do not include spaces.',
    );
}

/** Optional/nullable text: `undefined`/`null`/`''` -> `null`. Output `string | null`. */
export const optionalText = ({ max, min }: LengthOptions, messages?: { max?: string }) =>
  z
    .union([
      trimmedString({ max, min, maxMessage: messages?.max }),
      z.null(),
      z.literal(''),
    ])
    .optional()
    .transform((value) =>
      value === undefined || value === null || value === '' ? null : value,
    );

/** Patch text: keeps `undefined`; `null`/`''` -> `null`. Output `string | null | undefined`. */
export const patchText = ({ max, min }: LengthOptions, messages?: { max?: string }) =>
  z
    .union([
      trimmedString({ max, min, maxMessage: messages?.max }),
      z.null(),
      z.literal(''),
    ])
    .optional()
    .transform((value) => (value === null || value === '' ? null : value));

/** Required JSON number: strings are rejected, matching the backend body contract. */
export const requiredNumber = ({ min, max }: { min: number; max: number }) =>
  z.number().min(min).max(max);

/** Form adapter for numeric text inputs; output is still a bounded JSON number. */
export const requiredNumberInput = ({ min, max }: { min: number; max: number }) =>
  z.union([z.number(), z.string().min(1).transform(Number)]).pipe(z.number().min(min).max(max));

/** Optional patch number. Output `number | null | undefined`; JSON body values stay numeric. */
export const patchNumber = ({ min, max }: { min: number; max: number }) =>
  z.union([z.number().min(min).max(max), z.null()]).optional();

/** Optional integer: `''`/`null` -> `undefined`, then coerce int min/max. */
export const optionalInt = ({ min, max }: { min: number; max: number }) =>
  z.preprocess(
    (value) => (value === '' || value === null ? undefined : value),
    z.coerce.number().int().min(min).max(max).optional(),
  );

/** Route-parameter positive integer: 1..2147483647. */
export const positiveIdParam = z
  .string()
  .regex(/^\d+$/, 'Id must be a positive integer')
  .refine(
    (value) => {
      const n = Number(value);
      return n >= 1 && n <= MAX_RESOURCE_ID;
    },
    'Id must be between 1 and 2147483647',
  );

/** UUID route parameter. */
export const userIdParam = z.string().regex(UUID_REGEX, 'Invalid UUID');

/** Positive integer id in a JSON body; strings are rejected. */
export const positiveId = z.number().int().min(1).max(MAX_RESOURCE_ID);

/** Positive integer id from a query string; query parameters arrive as strings. */
export const positiveIdQuery = z.coerce.number().int().min(1).max(MAX_RESOURCE_ID);

/** Required JSON integer: strings are rejected, matching the backend body contract. */
export const requiredInt = ({ min, max }: { min: number; max: number }) =>
  z.number().int().min(min).max(max);

/** Form adapter for numeric text inputs; output is still a bounded JSON integer. */
export const requiredIntInput = ({ min, max }: { min: number; max: number }) =>
  z.union([z.number(), z.string().min(1).transform(Number)]).pipe(z.number().int().min(min).max(max));

/** Like target type input: trimmed, lowercased, then enumerated. */
export const targetTypeInput = z
  .string()
  .trim()
  .transform((value) => value.toLowerCase())
  .pipe(z.enum(['tripgroup', 'day', 'trip', 'point', 'image', 'comment']));

/** Report target type input: like targets plus comment targets. */
export const reportTargetTypeInput = z
  .string()
  .trim()
  .transform((value) => value.toLowerCase())
  .pipe(z.enum(['tripgroup', 'day', 'trip', 'point', 'image', 'comment']));

/** Array of positive ids with min/max length and no duplicates. */
export const idList = ({ min, max }: { min: number; max: number }) =>
  z
    .array(positiveId)
    .min(min)
    .max(max)
    .refine((ids) => new Set(ids).size === ids.length, 'Ids must be unique');
