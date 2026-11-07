import { ImageResponse } from 'next/og';

const IMAGE_SIZE = { width: 1200, height: 630 };

async function loadImageDataUrl(imageUrl: string | null): Promise<string | null> {
  if (!imageUrl) {
    return null;
  }

  try {
    const response = await fetch(imageUrl, {
      signal: AbortSignal.timeout(5000),
      cache: 'force-cache',
    });
    if (!response.ok) {
      return null;
    }

    const contentType = response.headers.get('content-type')?.split(';')[0] ?? '';
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(contentType)) {
      return null;
    }

    const contentLength = Number(response.headers.get('content-length') ?? 0);
    if (contentLength > 8 * 1024 * 1024) {
      return null;
    }

    const bytes = await response.arrayBuffer();
    if (bytes.byteLength > 8 * 1024 * 1024) {
      return null;
    }

    return `data:${contentType};base64,${Buffer.from(bytes).toString('base64')}`;
  } catch {
    return null;
  }
}

/** Creates a 1200x630 branded preview, with a clean fallback when no trip photo is available. */
export async function renderTripOgImage({
  title,
  subtitle,
  imageUrl,
}: {
  title: string;
  subtitle: string;
  imageUrl: string | null;
}): Promise<ImageResponse> {
  const imageSrc = await loadImageDataUrl(imageUrl);

  return new ImageResponse(
    (
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
            width={1200}
            height={630}
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
              width: 46,
              height: 46,
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: 12,
              background: '#e8ad59',
              color: '#142a22',
              fontSize: 30,
              fontWeight: 800,
            }}
          >
            H
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
          <div style={{ display: 'flex', color: '#f0c27f', fontSize: 19, fontWeight: 700, letterSpacing: 3 }}>
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
          <div style={{ display: 'flex', maxWidth: 980, color: '#f1f3ed', fontSize: 27, lineHeight: 1.25 }}>
            {subtitle}
          </div>
        </div>
      </div>
    ),
    IMAGE_SIZE,
  );
}
