'use client';

import { useState } from 'react';

interface ShareButtonProps {
  url: string;
  title: string;
  text?: string;
}

/**
 * Reusable share control. Uses the native Web Share API where available (mobile), falling
 * back to copying the URL to the clipboard. No third-party share library is required.
 */
export function ShareButton({ url, title, text }: ShareButtonProps) {
  const [copied, setCopied] = useState(false);

  async function handleShare(): Promise<void> {
    const payload = { url, title, text: text ?? title };

    if (typeof navigator !== 'undefined' && 'share' in navigator) {
      try {
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
