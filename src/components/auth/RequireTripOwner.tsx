'use client';

import { useEffect, type ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { MODERATOR_ROLES } from '@/constants/roles';

interface RequireTripOwnerProps {
  tripId: number;
  authorId: string;
  children: ReactNode;
}

/** Backend authorization remains authoritative; this only hides the edit UI from non-owners. */
export function RequireTripOwner({ tripId, authorId, children }: RequireTripOwnerProps) {
  const { status, user } = useAuth();
  const router = useRouter();

  const isOwner = user !== null && user.id === authorId;
  const isModerator = user !== null && (MODERATOR_ROLES as readonly string[]).includes(user.role);
  const allowed = status === 'authenticated' && (isOwner || isModerator);

  useEffect(() => {
    if (status === 'authenticated' && !allowed) {
      router.replace(`/trips/${tripId}`);
    }
  }, [status, allowed, router, tripId]);

  if (!allowed) {
    return null;
  }

  return <>{children}</>;
}
