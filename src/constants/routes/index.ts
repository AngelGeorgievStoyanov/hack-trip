/**
 * Frontend route paths.
 *
 * These are navigation paths, distinct from backend API paths in `constants/api`.
 */

export const ROUTES = {
  home: '/',
  login: '/login',
  register: '/register',
  verifyEmail: '/verify-email',
  forgotPassword: '/forgot-password',
  resetPassword: '/reset-password',
  trips: '/trips',
  tripDetails: '/trips/:id',
  tripCreate: '/trips/create',
  tripEdit: '/trips/:id/edit',
  tripPoints: '/trips/:id/points',
  myTrips: '/my-trips',
  favorites: '/favorites',
  profile: '/profile',
  admin: '/admin',
  notFound: '/not-found',
} as const;
