'use client';

import { useState, type CSSProperties } from 'react';
import Image from 'next/image';
import { pickImageUrl } from '@/lib/images/thumbnail';
import type { ImageDto } from '@/types';

interface AppImageProps {
  image?: ImageDto | null;
  alt: string;
  /** Lists/cards pass `true` to use `thumbnailUrl`; detail/gallery use the full image. */
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
 * Canonical image component. Centralizes URL selection (thumbnail vs. full), `next/image`
 * optimization, responsive sizing, priority loading and fallback behavior.
 */
export function AppImage({
  image,
  alt,
  useThumbnail = false,
  fill = false,
  width,
  height,
  sizes,
  priority = false,
  className,
  style,
}: AppImageProps) {
  const [errored, setErrored] = useState(false);
  const src = pickImageUrl(image, useThumbnail);

  if (errored || !src) {
    return <div className={className} style={style} role="img" aria-label={alt} />;
  }

  return (
    <Image
      src={src}
      alt={alt}
      fill={fill}
      width={fill ? undefined : width}
      height={fill ? undefined : height}
      sizes={sizes}
      priority={priority}
      className={className}
      style={style}
      onError={() => setErrored(true)}
    />
  );
}
