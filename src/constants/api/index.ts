export const API_PREFIX = '/api/v1';

export const CLIENT_MARKER_HEADER = 'x-hacktrip-client';
export const CLIENT_MARKER_VALUE = 'web';

export const AUTHORIZATION_HEADER = 'Authorization';

/** Public, non-secret bearer used for anonymous read-only access. */
export const PUBLIC_FRONTEND_TOKEN = 'hacktrip-public-v1';

/** HttpOnly refresh cookie name (never read by the frontend). */
export const REFRESH_COOKIE_NAME = 'hack_trip_refresh';

export const AUTH = `${API_PREFIX}/auth`;
export const CONFIG = `${API_PREFIX}/config`;
export const TRIPS = `${API_PREFIX}/trips`;
export const TRIP_GROUPS = `${API_PREFIX}/trip-groups`;
export const DAYS = `${API_PREFIX}/days`;
export const POINTS = `${API_PREFIX}/points`;
export const IMAGES = `${API_PREFIX}/images`;
export const COMMENTS = `${API_PREFIX}/comments`;
export const LIKES = `${API_PREFIX}/likes`;
export const FAVORITES = `${API_PREFIX}/favorites`;
export const REPORTS = `${API_PREFIX}/reports`;
export const ADMIN = `${API_PREFIX}/admin`;
export const ME = `${API_PREFIX}/me`;

/** Documented backend error codes (see API_CONTRACT.md §4). */
export const API_ERROR_CODES = {
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  UNAUTHORIZED: 'UNAUTHORIZED',
  FORBIDDEN: 'FORBIDDEN',
  EMAIL_NOT_VERIFIED: 'EMAIL_NOT_VERIFIED',
  ACCOUNT_SUSPENDED: 'ACCOUNT_SUSPENDED',
  ACCOUNT_DEACTIVATED: 'ACCOUNT_DEACTIVATED',
  NOT_FOUND: 'NOT_FOUND',
  TRIP_NOT_FOUND: 'TRIP_NOT_FOUND',
  CONFLICT: 'CONFLICT',
  INTERNAL_SERVER_ERROR: 'INTERNAL_SERVER_ERROR',
} as const;

