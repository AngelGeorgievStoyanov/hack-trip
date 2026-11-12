'use client';

import { createContext, useCallback, useContext, useMemo, useRef, useState } from 'react';
import type { ReactNode, SyntheticEvent } from 'react';
import Alert from '@mui/material/Alert';
import Snackbar from '@mui/material/Snackbar';
import type { AlertColor } from '@mui/material/Alert';
import type { SnackbarCloseReason } from '@mui/material/Snackbar';
import { NOTIFICATION_DEFAULTS } from '@/constants/notifications';
import type { NotificationOptions, NotificationPosition } from '@/constants/notifications';

interface NotificationApi {
  success: (message: string, options?: NotificationOptions) => void;
  error: (message: string, options?: NotificationOptions) => void;
  warning: (message: string, options?: NotificationOptions) => void;
  info: (message: string, options?: NotificationOptions) => void;
}

interface ActiveNotification {
  id: number;
  message: string;
  severity: AlertColor;
  duration: number | null;
  position: NotificationPosition;
  onClose?: () => void;
}

const NotificationContext = createContext<NotificationApi | undefined>(undefined);

const anchorOrigins = {
  'top-left': { vertical: 'top', horizontal: 'left' },
  'top-center': { vertical: 'top', horizontal: 'center' },
  'top-right': { vertical: 'top', horizontal: 'right' },
  'bottom-left': { vertical: 'bottom', horizontal: 'left' },
  'bottom-center': { vertical: 'bottom', horizontal: 'center' },
  'bottom-right': { vertical: 'bottom', horizontal: 'right' },
} as const;

export function NotificationProvider({ children }: { children: ReactNode }) {
  const [notification, setNotification] = useState<ActiveNotification | null>(null);
  const notificationRef = useRef<ActiveNotification | null>(null);
  const nextId = useRef(0);

  const showNotification = useCallback(
    (severity: AlertColor, message: string, options?: NotificationOptions) => {
      const defaultDuration =
        severity === 'success'
          ? NOTIFICATION_DEFAULTS.successDuration
          : severity === 'error'
            ? NOTIFICATION_DEFAULTS.errorDuration
            : severity === 'warning'
              ? NOTIFICATION_DEFAULTS.warningDuration
              : NOTIFICATION_DEFAULTS.infoDuration;
      const duration = options?.duration !== undefined ? options.duration : defaultDuration;

      const nextNotification: ActiveNotification = {
        id: ++nextId.current,
        message,
        severity,
        duration,
        position: options?.position ?? NOTIFICATION_DEFAULTS.position,
        onClose: options?.onClose,
      };

      notificationRef.current = nextNotification;
      setNotification(nextNotification);
    },
    [],
  );

  const dismiss = useCallback(() => {
    const current = notificationRef.current;
    if (!current) return;

    notificationRef.current = null;
    setNotification(null);
    current.onClose?.();
  }, []);

  const handleSnackbarClose = useCallback(
    (_event: Event | SyntheticEvent<unknown>, reason?: SnackbarCloseReason) => {
      if (reason === 'clickaway') return;
      dismiss();
    },
    [dismiss],
  );

  const value = useMemo<NotificationApi>(
    () => ({
      success: (message, options) => showNotification('success', message, options),
      error: (message, options) => showNotification('error', message, options),
      warning: (message, options) => showNotification('warning', message, options),
      info: (message, options) => showNotification('info', message, options),
    }),
    [showNotification],
  );

  return (
    <NotificationContext.Provider value={value}>
      {children}
      <Snackbar
        key={notification?.id}
        open={notification !== null}
        autoHideDuration={notification?.duration ?? null}
        anchorOrigin={anchorOrigins[notification?.position ?? NOTIFICATION_DEFAULTS.position]}
        onClose={handleSnackbarClose}
      >
        {notification ? (
          <Alert
            severity={notification.severity}
            variant={NOTIFICATION_DEFAULTS.variant}
            onClose={dismiss}
            sx={{ width: '100%' }}
          >
            {notification.message}
          </Alert>
        ) : undefined}
      </Snackbar>
    </NotificationContext.Provider>
  );
}

export function useNotification(): NotificationApi {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
}
