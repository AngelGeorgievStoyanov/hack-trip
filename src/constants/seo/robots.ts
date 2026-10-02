export const NOINDEX = {
  index: false,
  follow: false,
} as const;

// Routes intentionally excluded from search indexing. Dynamic segments use `:param`.
// `/admin` covers every admin sub-page (users, failed-login-logs, route-not-found-logs, images).
export const NOINDEX_ROUTES = [
  '/login',
  '/register',
  '/verify-email',
  '/resend-verification',
  '/forgot-password',
  '/reset-password',
  '/profile',
  '/my-trips',
  '/favorites',
  '/trips/create',
  '/trips/:id/edit',
  '/admin',
  '/admin/users/:userId',
] as const;
