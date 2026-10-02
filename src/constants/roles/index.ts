/**
 * Role constants.
 *
 * Backend authorization remains authoritative; these values only control UI visibility.
 * Keep in sync with the `Role` type in `src/types`.
 */

export const ROLES = {
  user: 'user',
  manager: 'manager',
  admin: 'admin',
} as const;

export const MODERATOR_ROLES = [ROLES.admin, ROLES.manager] as const;
export const ADMIN_ROLES = [ROLES.admin] as const;
