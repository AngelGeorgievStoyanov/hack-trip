import type { ImageDto } from '@/types';

/** Chooses the thumbnail vs. the full image. The backend DTO provides both URLs. */
export function pickImageUrl(
  image: ImageDto | null | undefined,
  useThumbnail: boolean,
): string | null {
  if (!image) {
    return null;
  }
  if (useThumbnail && image.thumbnailUrl) {
    return image.thumbnailUrl;
  }
  return image.url;
}
