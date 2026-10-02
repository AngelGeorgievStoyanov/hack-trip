/**
 * Image URL helpers. The backend already returns absolute `url` / `thumbnailUrl` values
 * (API_CONTRACT.md §11.3), so this module only centralizes normalization and the single
 * place where a missing image resolves to `null`. Pages/components must not concatenate
 * image URLs themselves.
 */

export function resolveImageSrc(src: string | null | undefined): string | null {
  return src ? src : null;
}

export function isAbsoluteUrl(url: string): boolean {
  return /^https?:\/\//i.test(url);
}
