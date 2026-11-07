'use client';

import { useEffect, type ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { isModeratorUser } from '@/constants/roles';

export function RequireModeratorRedirect({ children }: { children: ReactNode }) {
  const { status, user } = useAuth();
  const router = useRouter();
  const allowed = status === 'authenticated' && isModeratorUser(user);

  useEffect(() => {
    if (status !== 'loading' && !allowed) {
      router.replace('/');
    }
  }, [status, allowed, router]);

  if (status === 'loading' || !allowed) {
    return null;
  }

  return <>{children}</>;
}
