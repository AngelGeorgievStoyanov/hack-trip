'use client';

import { useEffect, type ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/hooks/useAuth';
import { isModeratorUser } from '@/constants/roles';
import { tripApi } from '@/api/trips';

interface RequireTripOwnerProps {
  tripGroupId: number;
  children: ReactNode;
}

/**
 * Backend authorization remains authoritative; this only hides the edit UI from non-owners.
 * Trip responses never expose an owner id, so ownership is derived from the authenticated
 * `GET /me/trips` result, which returns only the current user's owned trip groups.
 */
export function RequireTripOwner({ tripGroupId, children }: RequireTripOwnerProps) {
  const { status, user } = useAuth();
  const router = useRouter();

  const isModerator = isModeratorUser(user);
  const {
    data: myTrips,
    isError,
  } = useQuery({
    queryKey: ['me', 'trips'],
    queryFn: () => tripApi.listMyTrips(),
    enabled: status === 'authenticated' && !isModerator,
  });

  const isOwner = myTrips?.some((group) => group.id === tripGroupId) ?? false;
  const allowed = status === 'authenticated' && (isModerator || isOwner);
  const ownershipResolved = isModerator || myTrips !== undefined || isError;

  useEffect(() => {
    if (status === 'authenticated' && ownershipResolved && !allowed) {
      router.replace(`/trips/${tripGroupId}`);
    }
  }, [status, ownershipResolved, allowed, router, tripGroupId]);

  if (!allowed) {
    return null;
  }

  return <>{children}</>;
}
