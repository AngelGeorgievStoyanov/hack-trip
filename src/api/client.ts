import axios, { AxiosError, AxiosInstance, InternalAxiosRequestConfig } from 'axios';
import { config } from '../config';
import { ACCESS_TOKEN_STORAGE_KEY } from '../constants/auth';
import {
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

/**
 * Holder for the short-lived access token.
 *
 * The refresh token is an HttpOnly cookie managed exclusively by the browser and is never
 * stored here or in browser-accessible storage. The access token is persisted to
 * `localStorage` so a session survives reloads; it is never treated as the refresh token.
 */
let accessToken: string | null =
  typeof window !== 'undefined' ? window.localStorage.getItem(ACCESS_TOKEN_STORAGE_KEY) : null;

export const authToken = {
  get: (): string | null => accessToken,
  set: (token: string | null): void => {
    accessToken = token;
    if (typeof window === 'undefined') {
      return;
    }
    if (token) {
      window.localStorage.setItem(ACCESS_TOKEN_STORAGE_KEY, token);
    } else {
      window.localStorage.removeItem(ACCESS_TOKEN_STORAGE_KEY);
    }
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

let refreshPromise: Promise<string | null> | null = null;

function refreshAccessToken(): Promise<string | null> {
  return axios
    .post<AuthSessionDto>(`${config.apiBaseUrl}${AUTH}/refresh`, undefined, {
      withCredentials: true,
      headers: { [CLIENT_MARKER_HEADER]: CLIENT_MARKER_VALUE },
    })
    .then((response) => {
      const token = response.data.accessToken;
      authToken.set(token);
      return token;
    })
    .catch(() => {
      authToken.set(null);
      return null;
    });
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
      const token = await (refreshPromise ??
        (refreshPromise = refreshAccessToken().finally(() => {
          refreshPromise = null;
        })));

      if (token) {
        original.headers.set(AUTHORIZATION_HEADER, `Bearer ${token}`);
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
