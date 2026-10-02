'use client';

import { useState, type CSSProperties } from 'react';
import Image from 'next/image';
import { pickImageUrl } from '@/lib/images/thumbnail';
import type { ImageDto } from '@/types';

interface AppImageProps {
  image?: ImageDto | null;
  /** Bare URL (e.g. `TripListItem.coverImage`), used when no thumbnail is available. */
  src?: string | null;
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
  src,
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
  const resolved = src ?? pickImageUrl(image, useThumbnail);

  if (errored || !resolved) {
    return <div className={className} style={style} role="img" aria-label={alt} />;
  }

  return (
    <Image
      src={resolved}
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
