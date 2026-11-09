import { OG_IMAGE_FETCH_TIMEOUT_MS, OG_IMAGE_HEIGHT, OG_IMAGE_MAX_BYTES, OG_IMAGE_SIZE, OG_IMAGE_WIDTH } from '@/constants/seo';
import { ImageResponse } from 'next/og';

function detectImageType(bytes: Uint8Array): string | null {
  if (bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) {
    return 'image/jpeg';
  }
  if (
    bytes.length >= 8 &&
    [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a].every((value, index) => bytes[index] === value)
  ) {
    return 'image/png';
  }
  if (bytes[0] === 0x47 && bytes[1] === 0x49 && bytes[2] === 0x46 && bytes[3] === 0x38) {
    return 'image/gif';
  }
  if (
    bytes.length >= 12 &&
    String.fromCharCode(...bytes.slice(0, 4)) === 'RIFF' &&
    String.fromCharCode(...bytes.slice(8, 12)) === 'WEBP'
  ) {
    return 'image/webp';
  }
  if (
    bytes.length >= 12 &&
    String.fromCharCode(...bytes.slice(4, 8)) === 'ftyp' &&
    /^(avif|avis)$/.test(String.fromCharCode(...bytes.slice(8, 12)))
  ) {
    return 'image/avif';
  }

  const header = new TextDecoder().decode(bytes.slice(0, Math.min(bytes.length, 2048)));
  if (/^\s*(<\?xml[^>]*>\s*)?<svg[\s>]/i.test(header)) {
    // SVG is rendered as an image by Satori; reject active or externally-loaded content.
    if (
      /<\s*(script|foreignObject)\b/i.test(header) ||
      /\son[a-z]+\s*=/i.test(header) ||
      /(?:href|xlink:href)\s*=\s*["']\s*(?:https?:|\/\/|javascript:|data:)/i.test(header)
    ) {
      return null;
    }
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

      // Detect the actual file format instead of trusting a thumbnail's URL or HTTP header.
      const contentType = detectImageType(bytes);
      if (!contentType) continue;

      return `data:${contentType};base64,${Buffer.from(bytes).toString('base64')}`;
    } catch {
      // A missing or inaccessible photo should not prevent trying the next one.
    }
  }

  return null;
}

/** Creates a branded preview using the shared OG dimensions, with a clean fallback when no trip photo is available. */
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
    <div
      style={{
        display: 'flex',
        position: 'relative',
        width: '100%',
        height: '100%',
        overflow: 'hidden',
        background: 'linear-gradient(135deg, #142a22 0%, #315c48 58%, #b18b53 100%)',
        color: '#ffffff',
        fontFamily: 'Arial, sans-serif',
      }}
    >
      {imageSrc ? (
        <img
          src={imageSrc}
          alt={title}
          width={OG_IMAGE_WIDTH}
          height={OG_IMAGE_HEIGHT}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            objectFit: 'cover',
          }}
        />
      ) : null}
      <div
        style={{
          display: 'flex',
          position: 'absolute',
          top: 0,
          right: 0,
          bottom: 0,
          left: 0,
          background:
            'linear-gradient(90deg, rgba(9, 20, 16, 0.88) 0%, rgba(9, 20, 16, 0.62) 55%, rgba(9, 20, 16, 0.18) 100%)',
        }}
      />
      <div
        style={{
          display: 'flex',
          position: 'absolute',
          top: 54,
          left: 66,
          alignItems: 'center',
          gap: 14,
        }}
      >
        <div
          style={{
            display: 'flex',
            width: 54,
            height: 46,
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: 12,
            background: '#e8ad59',
            color: '#142a22',
            fontSize: 24,
            fontWeight: 800,
            letterSpacing: -1,
          }}
        >
          HT
        </div>
        <div style={{ display: 'flex', fontSize: 28, fontWeight: 800, letterSpacing: 4 }}>
          HACKTRIP
        </div>
      </div>
      <div
        style={{
          display: 'flex',
          position: 'absolute',
          top: 62,
          right: 66,
          padding: '10px 18px',
          border: '1px solid rgba(255,255,255,0.55)',
          borderRadius: 24,
          background: 'rgba(12, 24, 19, 0.38)',
          fontSize: 16,
          fontWeight: 700,
          letterSpacing: 2,
        }}
      >
        TRIP GROUP
      </div>
      <div
        style={{
          display: 'flex',
          position: 'absolute',
          right: 72,
          bottom: 66,
          left: 72,
          flexDirection: 'column',
          gap: 17,
        }}
      >
        <div
          style={{
            display: 'flex',
            color: '#f0c27f',
            fontSize: 19,
            fontWeight: 700,
            letterSpacing: 3,
          }}
        >
          PLAN · EXPLORE · SHARE
        </div>
        <div
          style={{
            display: 'flex',
            maxWidth: 1000,
            fontSize: 64,
            lineHeight: 1.08,
            fontWeight: 800,
            letterSpacing: -1,
          }}
        >
          {title}
        </div>
        <div
          style={{
            display: 'flex',
            maxWidth: 980,
            color: '#f1f3ed',
            fontSize: 27,
            lineHeight: 1.25,
          }}
        >
          {subtitle}
        </div>
      </div>
    </div>,
    OG_IMAGE_SIZE,
  );
}
