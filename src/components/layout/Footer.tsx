'use client';

import { useEffect, useRef } from 'react';
import { COLORS } from '@/constants/ui';

const COPYRIGHT_START = 2022;

/**
 * Client Component because the legacy footer nudged the page scroll on iPhone/iPad in
 * landscape so the copyright line stayed visible.
 */
export function Footer() {
  const footerRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const isIphoneOrIpad =
      /\b(iPhone|iPad)\b/.test(navigator.userAgent) && /WebKit/.test(navigator.userAgent);
    if (!isIphoneOrIpad) {
      return;
    }

    function syncLandscapeScroll(): void {
      const footer = footerRef.current;
      if (!footer) {
        return;
      }
      const orientation = window.screen?.orientation?.type ?? '';
      const landscape = orientation
        ? /landscape/.test(orientation)
        : window.matchMedia('(orientation: landscape)').matches;
      // iOS reports a viewport shorter than the screen width in landscape, leaving the
      // footer cut off; the legacy code scrolled the page by the remaining difference.
      if (landscape && footer.getBoundingClientRect().bottom < window.screen.width + 5) {
        const root = document.getElementById('root') ?? document.body;
        window.scroll(0, root.clientHeight - window.screen.width - 5);
      }
    }

    // Listeners are removed on unmount; the legacy version leaked them for the page lifetime.
    window.addEventListener('resize', syncLandscapeScroll);
    window.addEventListener('touchend', syncLandscapeScroll);
    return () => {
      window.removeEventListener('resize', syncLandscapeScroll);
      window.removeEventListener('touchend', syncLandscapeScroll);
    };
  }, []);

  return (
    <footer
      ref={footerRef}
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        backgroundColor: COLORS.brand,
        color: 'white',
        padding: '0 20px',
      }}
    >
      <h4 style={{ fontFamily: 'Space Mono, monospace', color: '#fff', opacity: 1 }}>
        {'Copyright © '} {COPYRIGHT_START} - {new Date().getFullYear()} {'"HACK-TRIP" by Angel Stoyanov.  All rights reserved.'}
      </h4>
    </footer>
  );
}
