'use client';

import type { ReactNode } from 'react';
import { WelcomeHeading } from '@/components/common/WelcomeHeading';
import { headingTextStyle } from '@/constants/ui';

interface HomeHeroProps {
  /** Server-rendered trips list and share controls. */
  children: ReactNode;
}

/** Homepage introduction using the original responsive welcome heading. */
export function HomeHero({ children }: HomeHeroProps) {
  return (
    <WelcomeHeading>
      <p
        style={{
          ...headingTextStyle,
          maxWidth: 850,
          margin: '0 20px 24px',
          textAlign: 'center',
          lineHeight: 1.6,
        }}
      >
        Discover places worth visiting, explore photos and experiences shared by others, and share
        your own discoveries with the HackTrip community.
      </p>
      {children}
    </WelcomeHeading>
  );
}
