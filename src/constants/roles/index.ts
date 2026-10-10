import type { ProfileDto } from '@/types';

/** Backend authorization remains authoritative; these values only control UI visibility. */
export const ROLES = {
  user: 'user',
  manager: 'manager',
  admin: 'admin',
} as const;

export const MODERATOR_ROLES = [ROLES.admin, ROLES.manager] as const;
export const ADMIN_ROLES = [ROLES.admin] as const;

/** Checks `ProfileDto.permissions` (§6.16) instead of a `role` field that the backend never sends to auth/profile endpoints. */
export function hasRole(user: ProfileDto | null, role: (typeof ROLES)[keyof typeof ROLES]): boolean {
  if (!user) return false;
  switch (role) {
    case ROLES.admin:
      return user.permissions?.isAdmin === true;
    case ROLES.manager:
      return user.permissions?.isManager === true;
    case ROLES.user:
      return !user.permissions;
    default:
      return false;
  }
}

export function isModeratorUser(user: ProfileDto | null): boolean {
  return hasRole(user, ROLES.admin) || hasRole(user, ROLES.manager);
}
