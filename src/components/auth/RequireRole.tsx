'use client';

import { useEffect, type ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import type { Role } from '@/types';

/**
 * Client-side role guard. Backend authorization remains authoritative; this only controls
 * UI visibility. Replaces the legacy `GuardedRouteAdmin`.
 */
export function RequireRole({ roles, children }: { roles: Role[]; children: ReactNode }) {
  const { status, user } = useAuth();
  const router = useRouter();

  const allowed = status === 'authenticated' && user !== null && roles.includes(user.role);

  useEffect(() => {
    if (status === 'anonymous' || status === 'accountError') {
      const path = window.location.pathname + window.location.search;
      const returnTo = path && path !== '/login' ? `?returnTo=${encodeURIComponent(path)}` : '';
      router.replace(`/login${returnTo}`);
    } else if (status === 'authenticated' && !allowed) {
      router.replace('/');
    }
  }, [status, allowed, router]);

  if (!allowed) {
    return null;
  }

  return <>{children}</>;
}
