/**
 * Runtime configuration resolution.
 *
 * Environment-dependent values are resolved here and kept separate from static constants
 * in `src/constants`. Next.js exposes public values through `NEXT_PUBLIC_*` env vars.
 */

export interface RuntimeConfig {
  /** Deployed HackTrip backend API origin (no trailing slash). */
  apiBaseUrl: string;
  /** Canonical public site origin used for SEO/canonical/OG URLs (no trailing slash). */
  siteUrl: string;
  /** Google Maps JavaScript API key. */
  googleMapsApiKey: string;
  /** reCAPTCHA v2 site key. */
  recaptchaV2SiteKey: string;
  /** reCAPTCHA v3 site key. */
  recaptchaV3SiteKey: string;
}

const DEFAULT_API_BASE_URL = 'https://www.api-hack-trip.com';
const DEFAULT_SITE_URL = 'https://www.hack-trip.com';

// NEXT_PUBLIC_* values are referenced literally so Next.js can inline them into client
// bundles; dynamic `process.env[key]` access is not statically replaced by Next.js.
export const config: RuntimeConfig = {
  apiBaseUrl: process.env.NEXT_PUBLIC_API_BASE_URL ?? DEFAULT_API_BASE_URL,
  siteUrl: process.env.NEXT_PUBLIC_SITE_URL ?? DEFAULT_SITE_URL,
  googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_KEY ?? '',
  recaptchaV2SiteKey: process.env.NEXT_PUBLIC_SITE_KEY2 ?? '',
  recaptchaV3SiteKey: process.env.NEXT_PUBLIC_SITE_KEY3 ?? '',
};

/** Builds an absolute URL for a path (canonical / Open Graph / sitemap links). */
export function absoluteUrl(path: string): string {
  const base = config.siteUrl.replace(/\/+$/, '');
  const normalized = path.startsWith('/') ? path : `/${path}`;
  return `${base}${normalized}`;
}

