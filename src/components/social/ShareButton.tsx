'use client';

import { useState } from 'react';
import { useBackground } from '@/hooks/useBackground';
import { resolveShareImage, shareWithFallback } from '@/lib/share';

interface ShareButtonProps {
  url: string;
  title: string;
  text?: string;
  image?: string | null;
}

export function ShareButton({ url, title, text, image }: ShareButtonProps) {
  const [copied, setCopied] = useState(false);
  const { currentUrl: backgroundUrl } = useBackground();
  const shareImage = resolveShareImage({ primary: image, fallback: backgroundUrl });

  async function handleShare(): Promise<void> {
    const result = await shareWithFallback({ url, title, text: text ?? title, image: shareImage });
    if (result === 'copied') {
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    }
  }

  return (
    <button type="button" onClick={() => void handleShare()}>
      {copied ? 'Link copied!' : 'Share'}
    </button>
  );
}
