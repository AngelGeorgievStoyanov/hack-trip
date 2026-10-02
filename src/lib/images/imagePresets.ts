import { IMAGE_SIZES } from './imageMetadata';

export interface ImagePreset {
  width?: number;
  height?: number;
  sizes?: string;
  priority?: boolean;
  fill?: boolean;
  useThumbnail?: boolean;
}

/** Single source of image presentation defaults; call sites pass `preset` to `AppImage`. */
export const IMAGE_PRESETS = {
  hero: { width: 1200, height: 630, sizes: IMAGE_SIZES.hero, priority: true },
  tripCard: { width: 400, height: 240, sizes: IMAGE_SIZES.card },
  gallery: { width: 240, height: 180, sizes: IMAGE_SIZES.gallery, useThumbnail: true },
  tripPointThumb: { width: 200, height: 150, useThumbnail: true },
  editorDayThumb: { width: 120, height: 90, useThumbnail: true },
  editorPointThumb: { width: 80, height: 60, useThumbnail: true },
  profile: { width: 160, height: 160 },
} satisfies Record<string, ImagePreset>;

export type ImagePresetName = keyof typeof IMAGE_PRESETS;