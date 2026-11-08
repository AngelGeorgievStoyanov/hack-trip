export type ShareResult = 'shared' | 'copied' | 'failed';

export async function shareWithFallback({
  url,
  title,
  text,
  image,
}: {
  url: string;
  title: string;
  text: string;
  image?: string | null;
}): Promise<ShareResult> {
  const payload: ShareData = { url, title, text };

  if (typeof navigator !== 'undefined' && 'share' in navigator) {
    try {
      if (image) {
        try {
          const response = await fetch(image);
          const blob = await response.blob();
          const extension = blob.type.split('/')[1] ?? 'jpg';
          const file = new File([blob], `hacktrip-share.${extension}`, { type: blob.type });
          if (typeof navigator.canShare === 'function' && navigator.canShare({ files: [file] })) {
            await navigator.share({ ...payload, files: [file] });
            return 'shared';
          }
        } catch (error) {
          if (error instanceof Error && error.name === 'AbortError') {
            return 'failed';
          }
          // Fall through to URL-only sharing when the image cannot be shared.
        }
      }
      await navigator.share(payload);
      return 'shared';
    } catch (error) {
      // A user cancellation is intentional; do not turn it into an unexpected clipboard action.
      if (error instanceof Error && error.name === 'AbortError') {
        return 'failed';
      }
      // Fall back to copying the URL when native sharing is unavailable.
    }
  }

  try {
    await navigator.clipboard.writeText(url);
    return 'copied';
  } catch {
    return 'failed';
  }
}
