import { z } from 'zod';

/**
 * Shared Zod helpers mirroring the backend request schemas (API_CONTRACT.md §18.1).
 * All schemas preserve `.strict()` behavior where applicable.
 */

const MAX_RESOURCE_ID = 2147483647;
const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

interface LengthOptions {
  max: number;
  min?: number;
}

/** `z.string() -> trim() -> pipe(min/max/regex)`. */
export function trimmedString({
  max,
  min,
  pattern,
  patternMessage,
}: LengthOptions & { pattern?: RegExp; patternMessage?: string }): z.ZodString {
  const base = z.string().trim();
  const withMin = min !== undefined ? base.min(min) : base;
  const withMax = withMin.max(max);
  if (pattern) {
    return patternMessage ? withMax.regex(pattern, patternMessage) : withMax.regex(pattern);
  }
  return withMax;
}

/** Trimmed email string (1..45 + email pattern). */
export const emailString = (message = 'Invalid email address') =>
  trimmedString({ min: 1, max: 45, pattern: EMAIL_REGEX, patternMessage: message });

/** Password: min/max chars plus a byte-length ceiling. Never trimmed. */
export const passwordString = ({ min, max }: { min: number; max: number }) =>
  z
    .string()
    .min(min)
    .max(max)
    .refine(
      (value) => new TextEncoder().encode(value).length <= max,
      `Password must be at most ${max} bytes`,
    );

/** Optional/nullable text: `undefined`/`null`/`''` -> `null`. Output `string | null`. */
export const optionalText = ({ max, min }: LengthOptions) =>
  z
    .union([trimmedString({ max, min }), z.null(), z.literal('')])
    .optional()
    .transform((value) =>
      value === undefined || value === null || value === '' ? null : value,
    );

/** Patch text: keeps `undefined`; `null`/`''` -> `null`. Output `string | null | undefined`. */
export const patchText = ({ max, min }: LengthOptions) =>
  z
    .union([trimmedString({ max, min }), z.null(), z.literal('')])
    .optional()
    .transform((value) => (value === null || value === '' ? null : value));

/** Required numeric (accepts number or numeric string), then min/max. */
export const requiredNumber = ({ min, max }: { min: number; max: number }) =>
  z
    .union([z.number(), z.string().min(1).transform(Number)])
    .pipe(z.number().min(min).max(max));

/** Optional patch number. Output `number | null | undefined`. */
export const patchNumber = ({ min, max }: { min: number; max: number }) =>
  z
    .union([
      z.number().min(min).max(max),
      z.string().min(1).transform(Number).pipe(z.number().min(min).max(max)),
      z.null(),
    ])
    .optional();

/** Optional integer: `''`/`null` -> `undefined`, then coerce int min/max. */
export const optionalInt = ({ min, max }: { min: number; max: number }) =>
  z.preprocess(
    (value) => (value === '' || value === null ? undefined : value),
    z.coerce.number().int().min(min).max(max).optional(),
  );

/** Route-parameter positive integer (as string): 1..2147483647. */
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

/** Positive integer id (coerced, for bodies/query). */
export const positiveId = z.coerce.number().int().min(1).max(MAX_RESOURCE_ID);

/** Like/report target type input: trimmed, lowercased, then enumerated. */
export const targetTypeInput = z
  .string()
  .trim()
  .transform((value) => value.toLowerCase())
  .pipe(z.enum(['tripgroup', 'day', 'trip', 'point', 'image']));

/** Array of positive ids with min/max length and no duplicates. */
export const idList = ({ min, max }: { min: number; max: number }) =>
  z
    .array(positiveId)
    .min(min)
    .max(max)
    .refine((ids) => new Set(ids).size === ids.length, 'Ids must be unique');
