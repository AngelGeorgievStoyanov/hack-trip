import { normalizeApiError } from '@/api/client';
import { API_ERROR_CODES } from '@/constants/api';

const GENERIC_MESSAGE = 'Something went wrong. Please try again.';

function isTechnicalErrorMessage(message: string): boolean {
  return (
    /cannot read propert(?:y|ies) of (?:undefined|null)/i.test(message) ||
    /cannot set propert(?:y|ies) of (?:undefined|null)/i.test(message) ||
    / is not a function/i.test(message) ||
    /undefined is not an object/i.test(message) ||
    /\bTypeError:|\bReferenceError:|\bSyntaxError:/i.test(message)
  );
}

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

  if (!apiError.message || isTechnicalErrorMessage(apiError.message)) {
    return GENERIC_MESSAGE;
  }

  return apiError.message;
}

/** Message for verification/reset-token failures (backend returns `VALIDATION_ERROR`). */
export function getTokenErrorMessage(error: unknown): string {
  const apiError = normalizeApiError(error);
  if (apiError.code === API_ERROR_CODES.VALIDATION_ERROR) {
    return 'This link is invalid or has expired.';
  }
  return getGenericErrorMessage(error);
}
