/**
 * Image dimension/layout metadata. The backend thumbnail sidecar is 800x600 (webp),
 * per API_CONTRACT.md §11.2.
 */
export const THUMBNAIL_WIDTH = 800;
export const THUMBNAIL_HEIGHT = 600;

/**
 * Responsive `sizes` presets for `next/image` (ARCHITECTURE.md §12).
 */
export const IMAGE_SIZES = {
  hero: '100vw',
  twoColumn: '50vw',
  threeColumn: '33vw',
  card: '(max-width: 600px) 100vw, 33vw',
  gallery: '(max-width: 600px) 50vw, 33vw',
} as const;
