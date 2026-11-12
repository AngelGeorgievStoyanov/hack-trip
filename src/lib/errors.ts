import axios from 'axios';
import { normalizeApiError } from '@/api/client';
import { API_ERROR_CODES } from '@/constants/api';
import { AUTH_NOTIFICATION_MESSAGES } from '@/constants/notifications';

const GENERIC_MESSAGE = AUTH_NOTIFICATION_MESSAGES.genericError;

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
      return AUTH_NOTIFICATION_MESSAGES.invalidCredentials;
    case API_ERROR_CODES.EMAIL_NOT_VERIFIED:
      return AUTH_NOTIFICATION_MESSAGES.emailNotVerified;
    case API_ERROR_CODES.ACCOUNT_SUSPENDED:
      return AUTH_NOTIFICATION_MESSAGES.accountSuspended;
    case API_ERROR_CODES.ACCOUNT_DEACTIVATED:
      return AUTH_NOTIFICATION_MESSAGES.accountDeactivated;
    case API_ERROR_CODES.FORBIDDEN:
      return AUTH_NOTIFICATION_MESSAGES.actionNotAllowed;
    default:
      return getGenericErrorMessage(error);
  }
}

export function getGenericErrorMessage(error: unknown): string {
  if (
    axios.isAxiosError(error) &&
    !error.response &&
    ['ERR_NETWORK', 'ECONNABORTED', 'ETIMEDOUT', 'ECONNREFUSED'].includes(error.code ?? '')
  ) {
    return GENERIC_MESSAGE;
  }

  const apiError = normalizeApiError(error);

  if (apiError.code === API_ERROR_CODES.INTERNAL_SERVER_ERROR || apiError.status === 500) {
    return AUTH_NOTIFICATION_MESSAGES.genericErrorLater;
  }

  if (
    !apiError.message ||
    isTechnicalErrorMessage(apiError.message) ||
    (apiError.status === undefined &&
      /network error|timeout|timed out|err_network|econnaborted/i.test(apiError.message))
  ) {
    return GENERIC_MESSAGE;
  }

  return apiError.message;
}

/** Message for verification/reset-token failures (backend returns `VALIDATION_ERROR`). */
export function getTokenErrorMessage(error: unknown): string {
  const apiError = normalizeApiError(error);
  if (apiError.code === API_ERROR_CODES.VALIDATION_ERROR) {
    return AUTH_NOTIFICATION_MESSAGES.invalidOrExpiredLink;
  }
  return getGenericErrorMessage(error);
}
