export type TabSyncEvent =
  | { type: 'email-verified' }
  | { type: 'session-changed' }
  | { type: 'logged-out' }
  | { type: 'trip-created'; tripId: number }
  | { type: 'trip-updated'; tripId: number }
  | { type: 'social-updated'; entityType: 'trip' | 'point' | 'image' | 'comment'; entityId: number };

const CHANNEL_NAME = 'hacktrip-tab-sync';
const STORAGE_EVENT_KEY = '__hacktrip_tab_sync__';

function isTabSyncEvent(value: unknown): value is TabSyncEvent {
  if (!value || typeof value !== 'object' || !('type' in value)) return false;

  const event = value as Record<string, unknown>;

  switch (event.type) {
    case 'email-verified':
    case 'session-changed':
    case 'logged-out':
      return true;
    case 'trip-created':
    case 'trip-updated':
      return typeof event.tripId === 'number';
    case 'social-updated':
      return (
        (event.entityType === 'trip' ||
          event.entityType === 'point' ||
          event.entityType === 'image' ||
          event.entityType === 'comment') &&
        typeof event.entityId === 'number'
      );
    default:
      return false;
  }
}

export function publishTabEvent(event: TabSyncEvent): void {
  if (typeof window === 'undefined') return;

  if (typeof BroadcastChannel !== 'undefined') {
    try {
      const channel = new BroadcastChannel(CHANNEL_NAME);
      channel.postMessage(event);
      channel.close();
      return;
    } catch {
      // Fall back to the storage event when BroadcastChannel is unavailable.
    }
  }

  try {
    localStorage.setItem(STORAGE_EVENT_KEY, JSON.stringify(event));
    localStorage.removeItem(STORAGE_EVENT_KEY);
  } catch {
    // Cross-tab notifications are best-effort and must not break the user action.
  }
}

export function subscribeToTabEvents(
  listener: (event: TabSyncEvent) => void,
): () => void {
  if (typeof window === 'undefined') return () => undefined;

  if (typeof BroadcastChannel !== 'undefined') {
    try {
      const channel = new BroadcastChannel(CHANNEL_NAME);
      channel.onmessage = (message: MessageEvent<unknown>) => {
        if (isTabSyncEvent(message.data)) listener(message.data);
      };

      return () => channel.close();
    } catch {
      // Fall back to the storage event when BroadcastChannel is unavailable.
    }
  }

  const handleStorage = (event: StorageEvent) => {
    if (event.key !== STORAGE_EVENT_KEY || !event.newValue) return;

    try {
      const value: unknown = JSON.parse(event.newValue);
      if (isTabSyncEvent(value)) listener(value);
    } catch {
      // Ignore malformed storage events.
    }
  };

  window.addEventListener('storage', handleStorage);
  return () => window.removeEventListener('storage', handleStorage);
}
