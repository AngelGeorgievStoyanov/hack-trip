'use client';

import { useEffect, type ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';

/**
 * Client-side authentication guard for the authenticated application areas. Replaces the
 * legacy `GuardedRoute`; role/status come from `useAuth` (no JWT decoding).
 */
export function RequireAuth({ children }: { children: ReactNode }) {
  const { status } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (status === 'anonymous' || status === 'accountError') {
      const path = window.location.pathname + window.location.search;
      const returnTo = path && path !== '/login' ? `?returnTo=${encodeURIComponent(path)}` : '';
      router.replace(`/login${returnTo}`);
    }
  }, [status, router]);

  if (status !== 'authenticated') {
    return null;
  }

  return <>{children}</>;
}
