import axios, { AxiosError, AxiosInstance, InternalAxiosRequestConfig } from 'axios';
import { config } from '../config';
import {
  API_ERROR_CODES,
  AUTH,
  AUTHORIZATION_HEADER,
  CLIENT_MARKER_HEADER,
  CLIENT_MARKER_VALUE,
  PUBLIC_FRONTEND_TOKEN,
} from '../constants/api';
import type { AuthSessionDto } from '../types';

declare module 'axios' {
  export interface AxiosRequestConfig {
    /**
     * When true, the Authorization header is not attached. Used by the auth endpoints
     * (`register`, `login`, `refresh`, `logout`, ...) that require no bearer token.
     */
    skipAuthHeader?: boolean;
  }
}

// Memory-only access token; the refresh token lives in an HttpOnly cookie owned by the browser.
let accessToken: string | null = null;

export const authToken = {
  get: (): string | null => accessToken,
  set: (token: string | null): void => {
    accessToken = token;
  },
};

/**
 * Centralized Axios client for HackTrip backend communication.
 */
export const apiClient: AxiosInstance = axios.create({
  baseURL: config.apiBaseUrl,
  withCredentials: true,
});

apiClient.interceptors.request.use((requestConfig: InternalAxiosRequestConfig) => {
  requestConfig.headers.set(CLIENT_MARKER_HEADER, CLIENT_MARKER_VALUE);

  if (!requestConfig.skipAuthHeader) {
    const token = accessToken ?? PUBLIC_FRONTEND_TOKEN;
    requestConfig.headers.set(AUTHORIZATION_HEADER, `Bearer ${token}`);
  }

  return requestConfig;
});

export type RefreshResult =
  | { status: 'ok'; token: string }
  | { status: 'accountError' }
  | { status: 'failed' };

const ACCOUNT_STATUS_CODES = [
  API_ERROR_CODES.EMAIL_NOT_VERIFIED,
  API_ERROR_CODES.ACCOUNT_SUSPENDED,
  API_ERROR_CODES.ACCOUNT_DEACTIVATED,
] as const;

export function isAccountStatusError(code?: string): boolean {
  return code !== undefined && (ACCOUNT_STATUS_CODES as readonly string[]).includes(code);
}

let refreshPromise: Promise<RefreshResult> | null = null;

function refreshSession(): Promise<RefreshResult> {
  return axios
    .post<AuthSessionDto>(`${config.apiBaseUrl}${AUTH}/refresh`, undefined, {
      withCredentials: true,
      headers: { [CLIENT_MARKER_HEADER]: CLIENT_MARKER_VALUE },
    })
    .then((response) => {
      const token = response.data.accessToken;
      authToken.set(token);
      return { status: 'ok' as const, token };
    })
    .catch((error) => {
      authToken.set(null);
      const code = normalizeApiError(error).code;
      if (isAccountStatusError(code)) {
        return { status: 'accountError' as const };
      }
      return { status: 'failed' as const };
    });
}

export function restoreSession(): Promise<RefreshResult> {
  return (
    refreshPromise ??
    (refreshPromise = refreshSession().finally(() => {
      refreshPromise = null;
    }))
  );
}

apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const original = error.config as (InternalAxiosRequestConfig & { _retry?: boolean }) | undefined;

    if (
      original &&
      !original._retry &&
      !original.skipAuthHeader &&
      error.response?.status === 401
    ) {
      original._retry = true;
      const result = await restoreSession();

      if (result.status === 'ok') {
        original.headers.set(AUTHORIZATION_HEADER, `Bearer ${result.token}`);
        return apiClient(original);
      }
    }

    return Promise.reject(error);
  },
);

/** Normalized backend error, exposing the documented `error.code` where available. */
export class ApiError extends Error {
  readonly code?: string;
  readonly status?: number;

  constructor(message: string, code?: string, status?: number) {
    super(message);
    this.name = 'ApiError';
    this.code = code;
    this.status = status;
  }
}

interface ApiErrorBody {
  error?: {
    code?: string;
    message?: string;
  };
}

/**
 * Converts any thrown value into an `ApiError`, preferring the backend `error.code`
 * over message text (see API_CONTRACT.md §4).
 */
export function normalizeApiError(error: unknown): ApiError {
  if (axios.isAxiosError(error)) {
    const status = error.response?.status;
    const body = error.response?.data as ApiErrorBody | undefined;
    const code = body?.error?.code;
    const message = body?.error?.message ?? error.message;
    return new ApiError(message, code, status);
  }

  if (error instanceof Error) {
    return new ApiError(error.message);
  }

  return new ApiError('Unknown error');
}
