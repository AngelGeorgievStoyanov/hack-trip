import type { Role, UserStatus } from './common';

/**
 * Profile returned by auth/profile endpoints (login, refresh, verify-email, PUT /auth/me, GET /auth/me).
 * Per API_CONTRACT.md §6.16, this shape intentionally omits `id`, `role`, `status`
 * and verification state — only `permissions` distinguishes manager/admin accounts.
 */
export interface ProfilePermissions {
  isManager: boolean;
  isAdmin: boolean;
}

export interface ProfileDto {
  email: string;
  firstName: string;
  lastName: string;
  /** Present only for manager/admin accounts; regular users receive no `permissions` field. */
  permissions?: ProfilePermissions;
}

/**
 * AuthUserDto is returned exclusively by admin user endpoints (GET/PUT /admin/users).
 * Per API_CONTRACT.md §6.16, it includes database user identity fields that are
 * never part of the ProfileDto returned to the frontend during authentication.
 */
export interface AuthUserDto {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: Role;
  status: UserStatus;
  emailVerified: boolean;
}

export interface AuthSessionDto {
  accessToken: string;
  tokenType: 'Bearer';
  expiresIn: number;
  user: ProfileDto;
}

export interface AuthUserResponse {
  user: ProfileDto;
}

export interface AuthSessionProbeDto {
  hasSession: boolean;
}

export interface MessageResponse {
  message: string;
}
