'use client';

import { useEffect } from 'react';
import { subscribeToTabEvents, type TabSyncEvent } from '@/lib/tabSync';

interface TabSyncListenerProps {
  onEvent: (event: TabSyncEvent) => void;
}

export function TabSyncListener({ onEvent }: TabSyncListenerProps) {
  useEffect(() => subscribeToTabEvents(onEvent), [onEvent]);

  return null;
}
