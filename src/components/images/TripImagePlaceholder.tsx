'use client';

import { Box, Typography } from '@mui/material';

/**
 * Branded fallback for trip cards without uploaded photos.
 * Keep the visual treatment isolated here so it can be redesigned independently.
 */
export function TripImagePlaceholder() {
  return (
    <Box
      role="img"
      aria-label="No trip photos uploaded yet"
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 1,
        width: '100%',
        height: '100%',
        overflow: 'hidden',
        color: '#476579',
        background: 'linear-gradient(145deg, #edf4f8 0%, #dce9f0 100%)',
      }}
    >
      <Box
        component="svg"
        viewBox="0 0 240 112"
        aria-hidden="true"
        sx={{ width: 'min(72%, 220px)', height: 'auto', display: 'block' }}
      >
        <circle cx="177" cy="29" r="15" fill="#f4c978" />
        <path d="M17 96 76 35l38 40 23-25 61 46H17Z" fill="#9bb8c8" />
        <path d="m54 58 22-23 18 19-12-4-8 8-8-5-12 5Z" fill="#f5f8fa" />
        <path d="m112 96 35-39 42 39h-77Z" fill="#6f98ad" />
        <path d="m134 71 13-14 15 17-12-5-7 5-9-3Z" fill="#f5f8fa" />
        <path d="M17 96h201" stroke="#6f98ad" strokeWidth="3" strokeLinecap="round" />
      </Box>
      <Typography
        component="span"
        sx={{ fontSize: '0.95rem', fontWeight: 600, lineHeight: 1.3, textAlign: 'center' }}
      >
        Your next adventure
      </Typography>
      <Typography
        component="span"
        sx={{ fontSize: '0.72rem', lineHeight: 1.3, color: '#66869b', textAlign: 'center' }}
      >
        No photos uploaded yet
      </Typography>
    </Box>
  );
}
