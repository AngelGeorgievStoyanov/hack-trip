export interface ImagePreset {
  width?: number;
  height?: number;
  sizes?: string;
  priority?: boolean;
  fill?: boolean;
  useThumbnail?: boolean;
}

export const IMAGE_SIZES = {
  hero: '100vw',
  card: '(max-width: 600px) 100vw, 33vw',
  gallery: '(max-width: 600px) 50vw, 33vw',
  about: '(max-width: 820px) 100vw, 640px',
} as const;

export const IMAGE_PRESETS = {
  hero: { width: 1200, height: 630, sizes: IMAGE_SIZES.hero, priority: true },
  tripCard: { width: 400, height: 240, sizes: IMAGE_SIZES.card },
  gallery: { width: 240, height: 180, sizes: IMAGE_SIZES.gallery, useThumbnail: true },
  tripPointThumb: { width: 200, height: 150, useThumbnail: true },
  editorDayThumb: { width: 120, height: 90, useThumbnail: true },
  editorPointThumb: { width: 80, height: 60, useThumbnail: true },
  profile: { width: 160, height: 160 },
  aboutIllustration: { width: 640, height: 480, sizes: IMAGE_SIZES.about },
} satisfies Record<string, ImagePreset>;

export type ImagePresetName = keyof typeof IMAGE_PRESETS;
