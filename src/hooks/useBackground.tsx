'use client';

import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { usePathname } from 'next/navigation';
import { tripApi } from '@/api/trips';

interface BackgroundContextValue {
  url: string | null;
}

const BackgroundContext = createContext<BackgroundContextValue | undefined>(undefined);

function isBackgroundRoute(pathname: string): boolean {
  return !pathname.startsWith('/admin');
}

function preloadImage(url: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve();
    img.onerror = () => reject(new Error('background image preload failed'));
    img.src = url;
  });
}

export function BackgroundProvider({ children }: { children: ReactNode }) {
  const pathname = usePathname() ?? '';
  const [url, setUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!isBackgroundRoute(pathname)) {
      setUrl(null);
      return;
    }

    let cancelled = false;

    tripApi
      .getBackgroundImage()
      .then((response) => {
        if (cancelled || !response.url) {
          return null;
        }
        return preloadImage(response.url).then(() => response.url);
      })
      .then((next) => {
        if (!cancelled && next) {
          setUrl(next);
        }
      })
      .catch(() => {});

    return () => {
      cancelled = true;
    };
  }, [pathname]);

  return (
    <BackgroundContext.Provider value={{ url }}>
      {url ? (
        <div
          aria-hidden="true"
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: -1,
            backgroundImage: `url("${url}")`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
            pointerEvents: 'none',
          }}
        />
      ) : null}
      {children}
    </BackgroundContext.Provider>
  );
}

export function useBackground(): BackgroundContextValue {
  const context = useContext(BackgroundContext);
  if (!context) {
    throw new Error('useBackground must be used within a BackgroundProvider');
  }
  return context;
}
