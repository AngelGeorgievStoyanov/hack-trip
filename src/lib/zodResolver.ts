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
 * The installed `@hookform/resolvers@2.9.11` targets Zod v3 and reads `error.errors`, which
 * no longer exists in Zod v4 (renamed to `error.issues`). This adapter keeps the existing
 * Zod schemas working with React Hook Form without adding a new dependency.
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
