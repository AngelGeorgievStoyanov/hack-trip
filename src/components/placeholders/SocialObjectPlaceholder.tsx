'use client';

import { useEffect, useState } from 'react';
import { Box } from '@mui/material';
import { SOCIAL_OBJECT_PLACEHOLDERS } from './socialObjectPlaceholderAssets';

/**
 * Random decorative SVG for social objects without uploaded photos.
 * Only the selected SVG is requested by the browser.
 */
export function SocialObjectPlaceholder() {
  const [imageSrc, setImageSrc] = useState<string | null>(null);

  useEffect(() => {
    const randomIndex = Math.floor(Math.random() * SOCIAL_OBJECT_PLACEHOLDERS.length);
    setImageSrc(SOCIAL_OBJECT_PLACEHOLDERS[randomIndex]);
  }, []);

  return (
    <Box
      role="img"
      aria-label="Travel scenery placeholder"
      sx={{
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
          sx={{
            display: 'block',
            width: '100%',
            height: '100%',
            objectFit: 'cover',
          }}
        />
      ) : null}
    </Box>
  );
}
