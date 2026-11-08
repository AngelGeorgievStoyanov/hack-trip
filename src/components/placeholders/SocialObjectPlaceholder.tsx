'use client';

import { useEffect, useState } from 'react';
import { Box, Typography } from '@mui/material';
import { SOCIAL_OBJECT_PLACEHOLDERS } from './socialObjectPlaceholderAssets';

/**
 * Random decorative SVG for social objects without uploaded photos.
 * Only the selected SVG is requested by the browser.
 */
export function SocialObjectPlaceholder() {
  const [imageSrc, setImageSrc] = useState<string | null>(null);

  useEffect(() => {
    const randomIndex = Math.floor(Math.random() * SOCIAL_OBJECT_PLACEHOLDERS.length);
    setImageSrc(SOCIAL_OBJECT_PLACEHOLDERS[randomIndex] ?? SOCIAL_OBJECT_PLACEHOLDERS[0]);
  }, []);

  return (
    <Box
      role="img"
      aria-label="Your next adventure. No photos uploaded yet."
      sx={{
        position: 'relative',
        display: 'block',
        width: '100%',
        height: '100%',
        overflow: 'hidden',
        bgcolor: '#e7f0f2',
      }}
    >
      {imageSrc ? (
        <Box
          component="img"
          src={imageSrc}
          alt=""
          aria-hidden="true"
          width={1200}
          height={1200}
          sx={{
            display: 'block',
            width: '100%',
            height: '100%',
            objectFit: 'cover',
          }}
        />
      ) : null}

      <Box
        sx={{
          position: 'absolute',
          right: 0,
          bottom: 0,
          left: 0,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 0.25,
          px: 2,
          py: 1.25,
          color: '#fff',
          textAlign: 'center',
          background: 'linear-gradient(transparent, rgba(15, 35, 45, 0.72))',
        }}
      >
        <Typography component="span" sx={{ fontSize: '0.95rem', fontWeight: 600, lineHeight: 1.3 }}>
          Your next adventure
        </Typography>
        <Typography component="span" sx={{ fontSize: '0.72rem', lineHeight: 1.3, opacity: 0.95 }}>
          No photos uploaded yet
        </Typography>
      </Box>
    </Box>
  );
}
