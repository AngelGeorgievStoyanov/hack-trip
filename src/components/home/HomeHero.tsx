'use client';

import { useRef, type CSSProperties, type ReactNode } from 'react';
import { Box, useMediaQuery } from '@mui/material';
import {
  ScrambleHeading,
  type ScrambleHeadingHandle,
} from '@/components/common/ScrambleHeading';
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

/**
 * Client Component: the legacy home page attached a touch handler to the whole page so a
 * touch anywhere re-triggered the heading scramble, and the scramble heading below 550px
 * was split into two lines.
 */
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
        <h1 style={{ ...HEADING_STYLE }}>Welcome travelers or future travelers!</h1>
        {singleLineHeading ? (
          <ScrambleHeading ref={headingRef} text="Welcome in Hack Trip!" />
        ) : (
          <>
            <h1 style={{ ...HEADING_STYLE }}>Welcome in</h1>
            <ScrambleHeading ref={headingRef} text="Hack Trip!" />
          </>
        )}
        <h2 style={{ ...HEADING_STYLE }}>
          Hack Trip is an app where you can share your trips or get valuable tips for your future
          trips.
        </h2>
        {hasTopTrips ? (
          <h3 style={{ ...HEADING_STYLE }}>These are our TOP 5 most liked in Hack Trips!</h3>
        ) : null}
      </Box>
      {children}
    </Box>
  );
}
