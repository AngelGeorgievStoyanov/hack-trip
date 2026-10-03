export const MAX_IMAGES_PER_ENTITY = 9;

export const MAX_UPLOAD_BYTES = 25 * 1024 * 1024;

export const ACCEPTED_IMAGE_MIME_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
] as const;

export const THUMBNAIL_WIDTH = 800;
export const THUMBNAIL_HEIGHT = 600;

export * from './presets';
