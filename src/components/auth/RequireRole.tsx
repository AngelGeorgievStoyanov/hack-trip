'use client';

import { type ReactNode } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { NotFound } from '@/components/common/NotFound';
import type { Role } from '@/types';

/**
 * Unauthorized visitors receive the normal not-found page so the existence of the route and
 * its role requirement are not revealed. Backend authorization remains authoritative.
 */
export function RequireRole({ roles, children }: { roles: Role[]; children: ReactNode }) {
  const { status, user } = useAuth();

  const allowed = status === 'authenticated' && user !== null && roles.includes(user.role);

  if (status === 'loading') {
    return null;
  }

  if (!allowed) {
    return <NotFound />;
  }

  return <>{children}</>;
}
