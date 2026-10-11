
'use client';

import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  useCallback,
  type ReactNode,
} from 'react';
import { usePathname } from 'next/navigation';
import { tripApi } from '@/api/trips';

interface BackgroundImage {
  url: string;
}

interface BackgroundContextValue {
  currentUrl: string | null;
  nextUrl: string | null;
}

type BackgroundState = {
  current: BackgroundImage | null;
  next: BackgroundImage | null;
};

const EMPTY_STATE: BackgroundState = {
  current: null,
  next: null,
};

const BackgroundContext = createContext<
  BackgroundContextValue | undefined
>(undefined);

function isBackgroundRoute(pathname: string): boolean {
  return !pathname.startsWith('/admin');
}

/**
 * Loads and decodes an image before considering it ready for display.
 * Resolves or rejects exactly once, including for cached images.
 */
function preloadImage(url: string): Promise<BackgroundImage> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    let settled = false;
    let decoding = false;

    const succeed = () => {
      if (settled) return;

      settled = true;
      resolve({ url });
    };

    const fail = (reason: string) => {
      if (settled) return;

      settled = true;
      reject(new Error(`${reason}: ${url}`));
    };

    const decode = () => {
      if (settled || decoding) return;

      if (img.naturalWidth === 0) {
        fail('Failed to load background image');
        return;
      }

      decoding = true;

      img.decode().then(
        succeed,
        () => fail('Failed to decode background image'),
      );
    };

    img.onload = decode;
    img.onerror = () => fail('Failed to load background image');

    img.src = url;

    // The image may already be available from the browser cache.
    if (img.complete) {
      if (img.naturalWidth === 0) {
        fail('Failed to load background image');
      } else {
        decode();
      }
    }
  });
}

export function BackgroundProvider({
  children,
}: {
  children: ReactNode;
}) {
  const pathname = usePathname() ?? '';

  const [state, setState] = useState<BackgroundState>(EMPTY_STATE);

  const stateRef = useRef<BackgroundState>(EMPTY_STATE);
  const mountedRef = useRef(false);

  const initialLoadDoneRef = useRef(false);
  const initialLoadStartedRef = useRef(false);

  const lifecycleGenerationRef = useRef(0);
  const navigationGenerationRef = useRef(0);
  const preloadGenerationRef = useRef(0);

  const publishState = useCallback((nextState: BackgroundState) => {
    stateRef.current = nextState;
    setState(nextState);
  }, []);

  useEffect(() => {
    mountedRef.current = true;

    return () => {
      mountedRef.current = false;

      // Invalidate asynchronous work from the previous mounted lifecycle.
      lifecycleGenerationRef.current += 1;
      navigationGenerationRef.current += 1;
      preloadGenerationRef.current += 1;
    };
  }, []);

  const loadInitial = useCallback(async (): Promise<void> => {
    // Avoid concurrent initial loads. The flag is reset if loading fails.
    if (initialLoadStartedRef.current || initialLoadDoneRef.current) {
      return;
    }

    initialLoadStartedRef.current = true;

    const lifecycle = lifecycleGenerationRef.current;
    const requestGeneration = ++navigationGenerationRef.current;

    try {
      const response = await tripApi.getBackgroundImage();

      if (
        lifecycle !== lifecycleGenerationRef.current ||
        requestGeneration !== navigationGenerationRef.current ||
        !mountedRef.current
      ) {
        return;
      }

      if (!response.current?.url || !response.next?.url) {
        return;
      }

      const currentImage = await preloadImage(response.current.url);

      if (
        lifecycle !== lifecycleGenerationRef.current ||
        requestGeneration !== navigationGenerationRef.current ||
        !mountedRef.current
      ) {
        return;
      }

      publishState({
        current: currentImage,
        next: null,
      });

      initialLoadDoneRef.current = true;

      // Prepare the next image without changing the visible background
      // when its preload finishes.
      const preloadGeneration = ++preloadGenerationRef.current;

      void preloadImage(response.next.url)
        .then((nextImage) => {
          if (
            lifecycle !== lifecycleGenerationRef.current ||
            preloadGeneration !== preloadGenerationRef.current ||
            !mountedRef.current
          ) {
            return;
          }

          publishState({
            ...stateRef.current,
            next: nextImage,
          });
        })
        .catch(() => {
          // Preserve the current background if preloading fails.
        });
    } catch {
      // Preserve any existing background if the API or image fails.
    } finally {
      // Permit a later attempt if the initial load did not complete.
      if (!initialLoadDoneRef.current) {
        initialLoadStartedRef.current = false;
      }
    }
  }, [publishState]);

  const loadNext = useCallback(async (): Promise<void> => {
    const lifecycle = lifecycleGenerationRef.current;
    const navigationGeneration = ++navigationGenerationRef.current;

    // Snapshot readiness at the moment this navigation is handled.
    // A candidate that finishes loading later must not be promoted
    // for this navigation.
    const candidate = stateRef.current.next;

    if (candidate) {
      publishState({
        current: candidate,
        next: null,
      });
    }

    try {
      const response = await tripApi.getBackgroundImage();

      if (
        lifecycle !== lifecycleGenerationRef.current ||
        navigationGeneration !== navigationGenerationRef.current ||
        !mountedRef.current
      ) {
        return;
      }

      if (!response.next?.url) {
        return;
      }

      const preloadGeneration = ++preloadGenerationRef.current;
      const nextImage = await preloadImage(response.next.url);

      if (
        lifecycle !== lifecycleGenerationRef.current ||
        navigationGeneration !== navigationGenerationRef.current ||
        preloadGeneration !== preloadGenerationRef.current ||
        !mountedRef.current
      ) {
        return;
      }

      // Only prepare the candidate for a future navigation.
      // Never change the current image when this preload completes.
      publishState({
        ...stateRef.current,
        next: nextImage,
      });
    } catch {
      // Preserve the current background on API or image failure.
    }
  }, [publishState]);

  useEffect(() => {
    if (!isBackgroundRoute(pathname)) {
      lifecycleGenerationRef.current += 1;
      navigationGenerationRef.current += 1;
      preloadGenerationRef.current += 1;

      publishState(EMPTY_STATE);

      initialLoadDoneRef.current = false;
      initialLoadStartedRef.current = false;

      return;
    }

    if (!initialLoadDoneRef.current) {
      void loadInitial();
    } else {
      void loadNext();
    }
  }, [pathname, loadInitial, loadNext, publishState]);

  return (
    <BackgroundContext.Provider
      value={{
        currentUrl: state.current?.url ?? null,
        nextUrl: state.next?.url ?? null,
      }}
    >
      {state.current ? (
        <div
          aria-hidden="true"
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: -1,
            backgroundImage: `url("${state.current.url}")`,
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
