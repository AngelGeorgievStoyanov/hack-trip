'use client';

import { useState } from 'react';
import { useBackground } from '@/hooks/useBackground';
import { resolveShareImage } from '@/lib/share';

interface ShareButtonProps {
  url: string;
  title: string;
  text?: string;
  image?: string | null;
}

export function ShareButton({ url, title, text, image }: ShareButtonProps) {
  const [copied, setCopied] = useState(false);
  const { url: backgroundUrl } = useBackground();
  const shareImage = resolveShareImage({ primary: image, fallback: backgroundUrl });

  async function handleShare(): Promise<void> {
    const payload: ShareData = { url, title, text: text ?? title };

    if (typeof navigator !== 'undefined' && 'share' in navigator) {
      try {
        if (shareImage) {
          try {
            const response = await fetch(shareImage);
            const blob = await response.blob();
            const extension = blob.type.split('/')[1] ?? 'jpg';
            const file = new File([blob], `hacktrip-share.${extension}`, { type: blob.type });
            if (typeof navigator.canShare === 'function' && navigator.canShare({ files: [file] })) {
              await navigator.share({ ...payload, files: [file] });
              return;
            }
          } catch {
            // Image fetch/share unavailable; fall through to URL-only share.
          }
        }
        await navigator.share(payload);
        return;
      } catch {
        // Cancelled or unsupported; fall through to copy.
      }
    }

    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard unavailable; ignore.
    }
  }

  return (
    <button type="button" onClick={() => void handleShare()}>
      {copied ? 'Link copied!' : 'Share'}
    </button>
  );
}
