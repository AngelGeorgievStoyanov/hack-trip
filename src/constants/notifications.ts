export const NOTIFICATION_DEFAULTS = {
  position: 'top-right',
  variant: 'standard',
  successDuration: 5500,
  errorDuration: 6000,
  warningDuration: 5000,
  infoDuration: 5000,
} as const;

export type NotificationPosition =
  | 'top-left'
  | 'top-center'
  | 'top-right'
  | 'bottom-left'
  | 'bottom-center'
  | 'bottom-right';

export interface NotificationOptions {
  duration?: number | null;
  position?: NotificationPosition;
  onClose?: () => void;
}
