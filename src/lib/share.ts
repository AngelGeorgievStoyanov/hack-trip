export interface ShareTarget {
  url: string;
  title: string;
  text?: string;
  hashtag?: string;
}

export type SharePlatformId = 'facebook' | 'viber' | 'whatsapp' | 'telegram';

export interface ShareLink {
  id: SharePlatformId;
  label: string;
  href: string;
}

function messageText(target: ShareTarget): string {
  return target.text ?? `${target.title} - ${target.url}`;
}

const PLATFORM_BUILDERS: Record<
  SharePlatformId,
  { label: string; buildHref: (target: ShareTarget) => string }
> = {
  facebook: {
    label: 'Facebook',
    buildHref: (target) =>
      `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(target.url)}${
        target.hashtag ? `&hashtag=%23${encodeURIComponent(target.hashtag)}` : ''
      }`,
  },
  viber: {
    label: 'Viber',
    buildHref: (target) => `viber://forward?text=${encodeURIComponent(messageText(target))}`,
  },
  whatsapp: {
    label: 'WhatsApp',
    buildHref: (target) => `https://wa.me/?text=${encodeURIComponent(messageText(target))}`,
  },
  telegram: {
    label: 'Telegram',
    buildHref: (target) =>
      `https://t.me/share/url?url=${encodeURIComponent(target.url)}&text=${encodeURIComponent(target.title)}`,
  },
};

export const SHARE_PLATFORM_IDS = Object.keys(PLATFORM_BUILDERS) as SharePlatformId[];

export function getShareLinks(
  target: ShareTarget,
  platforms: SharePlatformId[] = SHARE_PLATFORM_IDS,
): ShareLink[] {
  return platforms.map((id) => ({
    id,
    label: PLATFORM_BUILDERS[id].label,
    href: PLATFORM_BUILDERS[id].buildHref(target),
  }));
}

export function resolveShareImage(images: {
  primary?: string | null;
  fallback?: string | null;
}): string | null {
  return images.primary || images.fallback || null;
}
