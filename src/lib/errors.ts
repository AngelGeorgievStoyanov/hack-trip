import { normalizeApiError } from '@/api/client';
import { API_ERROR_CODES } from '@/constants/api';

/**
 * Centralized mapping of backend error codes to safe, user-facing messages
 * (AGENTS.md §17 — never expose stack traces or internal server details).
 */

const GENERIC_MESSAGE = 'Something went wrong. Please try again.';

export function getAuthErrorMessage(error: unknown): string {
  const apiError = normalizeApiError(error);

  switch (apiError.code) {
    case API_ERROR_CODES.UNAUTHORIZED:
      return 'Invalid email or password.';
    case API_ERROR_CODES.EMAIL_NOT_VERIFIED:
      return 'Your email address is not verified yet. Please check your inbox.';
    case API_ERROR_CODES.ACCOUNT_SUSPENDED:
      return 'Your account is suspended.';
    case API_ERROR_CODES.ACCOUNT_DEACTIVATED:
      return 'Your account is deactivated.';
    case API_ERROR_CODES.FORBIDDEN:
      return 'This action is not allowed.';
    default:
      return getGenericErrorMessage(error);
  }
}

export function getGenericErrorMessage(error: unknown): string {
  const apiError = normalizeApiError(error);

  if (
    apiError.code === API_ERROR_CODES.INTERNAL_SERVER_ERROR ||
    apiError.status === 500
  ) {
    return 'Something went wrong. Please try again later.';
  }

  return apiError.message || GENERIC_MESSAGE;
}

/** Message for verification/reset-token failures (backend returns `VALIDATION_ERROR`). */
export function getTokenErrorMessage(error: unknown): string {
  const apiError = normalizeApiError(error);
  if (apiError.code === API_ERROR_CODES.VALIDATION_ERROR) {
    return 'This link is invalid or has expired.';
  }
  return getGenericErrorMessage(error);
}
