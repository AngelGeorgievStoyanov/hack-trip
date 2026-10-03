/**
 * True for an application-internal path that is safe to redirect to after login. Rejects
 * protocol-relative and external URLs to prevent open redirects.
 */
export function isSafeInternalPath(path: string): boolean {
  return path.startsWith('/') && !path.startsWith('//') && !path.includes('\\');
}
