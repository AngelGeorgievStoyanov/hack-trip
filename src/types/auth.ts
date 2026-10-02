import type { Role, UserStatus } from './common';

/**
 * Auth response DTOs.
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
  user: AuthUserDto;
}

export interface AuthUserResponse {
  user: AuthUserDto;
}

export interface MessageResponse {
  message: string;
}
