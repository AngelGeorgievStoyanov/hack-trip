'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { subscribeToTabEvents } from '@/lib/tabSync';

export function TabSyncListener() {
  const router = useRouter();

  useEffect(
    () =>
      subscribeToTabEvents((event) => {
        if (event.type === 'email-verified') {
          router.replace('/login');
        }
      }),
    [router],
  );

  return null;
}
