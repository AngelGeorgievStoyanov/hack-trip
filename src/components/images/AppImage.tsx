'use client';

import { useState, type CSSProperties } from 'react';
import Image from 'next/image';
import { pickImageUrl } from '@/lib/images/thumbnail';
import { IMAGE_PRESETS, type ImagePreset, type ImagePresetName } from '@/constants/images/presets';
import type { ImageDto } from '@/types';

interface AppImageProps {
  image?: ImageDto | null;
  src?: string | null;
  alt: string;
  preset?: ImagePresetName;
  useThumbnail?: boolean;
  fill?: boolean;
  width?: number;
  height?: number;
  sizes?: string;
  priority?: boolean;
  className?: string;
  style?: CSSProperties;
}

/**
 * Canonical image component — the only place `next/image` is used.
 */
export function AppImage({
  image,
  src,
  alt,
  preset,
  useThumbnail,
  fill,
  width,
  height,
  sizes,
  priority,
  className,
  style,
}: AppImageProps) {
  const [errored, setErrored] = useState(false);
  const presetProps: ImagePreset | undefined = preset ? IMAGE_PRESETS[preset] : undefined;
  const resolvedFill = fill ?? presetProps?.fill ?? false;
  const resolvedUseThumbnail = useThumbnail ?? presetProps?.useThumbnail ?? false;
  const resolvedPriority = priority ?? presetProps?.priority ?? false;
  const resolvedWidth = width ?? presetProps?.width;
  const resolvedHeight = height ?? presetProps?.height;
  const resolvedSizes = sizes ?? presetProps?.sizes;
  const resolved = src ?? pickImageUrl(image, resolvedUseThumbnail);

  if (errored || !resolved) {
    return <div className={className} style={style} role="img" aria-label={alt} />;
  }

  return (
    <Image
      src={resolved}
      alt={alt}
      fill={resolvedFill}
      width={resolvedFill ? undefined : resolvedWidth}
      height={resolvedFill ? undefined : resolvedHeight}
      sizes={resolvedSizes}
      priority={resolvedPriority}
      className={className}
      style={style}
      onError={() => setErrored(true)}
    />
  );
}
