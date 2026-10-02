/**
 * Image-related frontend limits and identifiers.
 */

/** Maximum images allowed per day row and per point. */
export const MAX_IMAGES_PER_ENTITY = 9;

/** Backend multipart upload cap (25 MB). */
export const MAX_UPLOAD_BYTES = 25 * 1024 * 1024;

export const ACCEPTED_IMAGE_MIME_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
] as const;

export const ACCEPTED_IMAGE_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.webp', '.gif'] as const;
