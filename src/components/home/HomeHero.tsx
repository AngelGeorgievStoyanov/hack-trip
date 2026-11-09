'use client';

import { useRef, type CSSProperties, type ReactNode } from 'react';
import { Box, useMediaQuery } from '@mui/material';
import { ScrambleHeading, type ScrambleHeadingHandle } from '@/components/common/ScrambleHeading';
import { BREAKPOINTS, headingTextStyle, minWidthQuery } from '@/constants/ui';

interface HomeHeroProps {
  /** Legacy only announced the Top-5 line once trips were available. */
  hasTopTrips: boolean;
  /** Server-rendered trips list and share controls. */
  children: ReactNode;
}

const HEADING_STYLE: CSSProperties = {
  margin: '2px',
  textAlign: 'center',
  ...headingTextStyle,
};

/** Homepage introduction with one semantic H1 and a concise product proposition. */
export function HomeHero({ hasTopTrips, children }: HomeHeroProps) {
  const headingRef = useRef<ScrambleHeadingHandle | null>(null);
  const singleLineHeading = useMediaQuery(minWidthQuery(BREAKPOINTS.homeHeading));

  return (
    <Box
      onTouchStart={() => headingRef.current?.scramble()}
      sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}
    >
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          padding: '0 25px',
        }}
      >
        <ScrambleHeading
          ref={headingRef}
          text={singleLineHeading ? 'Plan, Create and Share Your Trips' : 'Plan and Share Your Trips'}
          style={HEADING_STYLE}
        />
        <h2 style={HEADING_STYLE}>
          Your travel planner for routes, places and experiences around the world.
        </h2>
        <p style={{ ...HEADING_STYLE, maxWidth: 850, lineHeight: 1.6 }}>
          Create day-by-day itineraries, add any GPS location — from restaurants and landmarks to
          hidden beaches and remote mountain spots — then add photos, descriptions and tips to
          share with other travelers.
        </p>
        {hasTopTrips ? (
          <h3 style={HEADING_STYLE}>Discover popular trips shared by travelers</h3>
        ) : null}
      </Box>
      {children}
    </Box>
  );
}
