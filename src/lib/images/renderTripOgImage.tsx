import {
  OG_IMAGE_FETCH_TIMEOUT_MS,
  OG_IMAGE_HEIGHT,
  OG_IMAGE_MAX_BYTES,
  OG_IMAGE_SIZE,
  OG_IMAGE_WIDTH,
  SEO_BRAND,
} from '@/constants/seo';
import { ImageResponse } from 'next/og';

function detectImageType(bytes: Uint8Array): string | null {
  if (bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) return 'image/jpeg';
  if (
    bytes.length >= 8 &&
    [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a].every((value, index) => bytes[index] === value)
  ) return 'image/png';
  if (bytes[0] === 0x47 && bytes[1] === 0x49 && bytes[2] === 0x46 && bytes[3] === 0x38) return 'image/gif';
  if (bytes.length >= 12 && String.fromCharCode(...bytes.slice(0, 4)) === 'RIFF' &&
      String.fromCharCode(...bytes.slice(8, 12)) === 'WEBP') return 'image/webp';
  if (bytes.length >= 12 && String.fromCharCode(...bytes.slice(4, 8)) === 'ftyp' &&
      /^(avif|avis)$/.test(String.fromCharCode(...bytes.slice(8, 12)))) return 'image/avif';
  const header = new TextDecoder().decode(bytes.slice(0, Math.min(bytes.length, 2048)));
  if (/^\s*(<\?xml[^>]*>\s*)?<svg[\s>]/i.test(header)) {
    if (/<\s*(script|foreignObject)\b/i.test(header) || /\son[a-z]+\s*=/i.test(header) ||
      /(?:href|xlink:href)\s*=\s*["']\s*(?:https?:|\/\/|javascript:|data:)/i.test(header)) return null;
    return 'image/svg+xml';
  }
  return null;
}

async function loadImageDataUrl(imageUrls: readonly string[]): Promise<string | null> {
  for (const imageUrl of imageUrls) {
    try {
      const response = await fetch(imageUrl, {
        signal: AbortSignal.timeout(OG_IMAGE_FETCH_TIMEOUT_MS),
        cache: 'no-store',
      });
      if (!response.ok) continue;
      const contentLength = Number(response.headers.get('content-length') ?? 0);
      if (contentLength > OG_IMAGE_MAX_BYTES) continue;
      const bytes = new Uint8Array(await response.arrayBuffer());
      if (bytes.byteLength === 0 || bytes.byteLength > OG_IMAGE_MAX_BYTES) continue;
      const contentType = detectImageType(bytes);
      if (!contentType) continue;
      return 'data:' + contentType + ';base64,' + Buffer.from(bytes).toString('base64');
    } catch {
      // An unavailable photo should not prevent trying the next one.
    }
  }
  return null;
}

/** Charcoal-and-antique-gold HackTrip social preview; trip photos remain optional. */
export async function renderTripOgImage({
  title,
  subtitle,
  imageUrls,
}: {
  title: string;
  subtitle: string;
  imageUrls: readonly string[];
}): Promise<ImageResponse> {
  const imageSrc = await loadImageDataUrl(imageUrls);
  return new ImageResponse(
    <div style={{
      display: 'flex', position: 'relative', width: '100%', height: '100%', overflow: 'hidden',
      background: SEO_BRAND.backgroundGradient, color: SEO_BRAND.gold, fontFamily: 'Arial, sans-serif',
    }}>
      {imageSrc ? <img src={imageSrc} alt="" width={OG_IMAGE_WIDTH} height={OG_IMAGE_HEIGHT}
        style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover', opacity: 0.3 }} /> : null}
      <div style={{ display: 'flex', position: 'absolute', top: 0, right: 0, bottom: 0, left: 0,
        background: SEO_BRAND.overlayGradient }} />
      <div style={{ display: 'flex', position: 'absolute', top: 54, left: 68, alignItems: 'center', gap: 18 }}>
        <div style={{ display: 'flex', width: 58, height: 58, border: '2px solid ' + SEO_BRAND.antiqueGold,
          borderRadius: 14, alignItems: 'center', justifyContent: 'center', fontFamily: 'Georgia, serif',
          fontSize: 27, color: SEO_BRAND.gold }}>HT</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
          <div style={{ display: 'flex', fontSize: 27, fontWeight: 700, letterSpacing: 5 }}>HACKTRIP</div>
          <div style={{ display: 'flex', color: SEO_BRAND.antiqueGold, fontSize: 11, letterSpacing: 3 }}>TRAVEL, YOUR WAY</div>
        </div>
      </div>
      <div style={{ display: 'flex', position: 'absolute', top: 188, left: 72, right: 70,
        flexDirection: 'column', gap: 22 }}>
        <div style={{ display: 'flex', color: SEO_BRAND.antiqueGold, fontSize: 17, fontWeight: 700, letterSpacing: 4 }}>
          YOUR TRIP. YOUR ROUTE. YOUR STORY.
        </div>
        <div style={{ display: 'flex', maxWidth: 1040, fontFamily: 'Georgia, serif',
          fontSize: 62, lineHeight: 1.08, fontWeight: 500 }}>{title}</div>
        <div style={{ display: 'flex', maxWidth: 950, color: SEO_BRAND.mutedText, fontSize: 25, lineHeight: 1.3 }}>
          {subtitle}
        </div>
      </div>
      <div style={{ display: 'flex', position: 'absolute', bottom: 44, left: 72,
        color: SEO_BRAND.antiqueGold, fontSize: 12, letterSpacing: 3 }}>
        PLAN · EXPLORE · SHARE
      </div>
    </div>,
    OG_IMAGE_SIZE,
  );
}
