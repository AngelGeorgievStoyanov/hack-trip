import { ACCEPTED_IMAGE_MIME_TYPES, MAX_UPLOAD_BYTES } from '@/constants/images';

export function validateImageFile(file: File): string | null {
  if (file.size > MAX_UPLOAD_BYTES) {
    return 'The file is too large (max 25 MB).';
  }
  if (!(ACCEPTED_IMAGE_MIME_TYPES as readonly string[]).includes(file.type)) {
    return 'Unsupported image format.';
  }
  return null;
}
