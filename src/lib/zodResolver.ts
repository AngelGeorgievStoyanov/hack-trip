import type { Resolver } from 'react-hook-form';

type ZodLikeIssue = {
  path?: unknown[];
  code?: string;
  message?: string;
};

type ZodLikeSchema = {
  safeParseAsync: (values: unknown) => Promise<{
    success: boolean;
    data?: unknown;
    error?: { issues?: ZodLikeIssue[] };
  }>;
};

/**
 * Minimal Zod v4 → react-hook-form resolver adapter.
 *
 * Zod v4 renamed `error.errors` to `error.issues`, so a Zod-v3-era resolver would read the
 * wrong property. This adapter keeps the existing Zod schemas working with React Hook Form.
 */
export function zodResolver(schema: ZodLikeSchema): Resolver<any> {
  return async (values) => {
    const result = await schema.safeParseAsync(values);

    if (result.success) {
      return { values: result.data, errors: {} };
    }

    const errors: Record<string, { type: string; message: string }> = {};
    for (const issue of result.error?.issues ?? []) {
      const key = issue.path?.length ? issue.path.map(String).join('.') : 'root';
      if (!errors[key]) {
        errors[key] = {
          type: issue.code ?? 'invalid_type',
          message: issue.message ?? 'Invalid value',
        };
      }
    }

    return { values: {}, errors };
  };
}
