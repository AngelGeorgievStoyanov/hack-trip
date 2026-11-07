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

export const REGISTRATION_SUCCESS_MESSAGE =
  'Registration successful. Please check your email for a verification link.';

export const CAPTCHA_SCRIPT_URL = 'https://www.google.com/recaptcha/api.js?render=explicit';
export const CAPTCHA_UNAVAILABLE_MESSAGE = 'CAPTCHA is not configured. Please try again later.';
export const FORGOT_PASSWORD_SUCCESS_MESSAGE = 'If an account exists for this email, a password reset link has been sent.';
export const RESEND_VERIFICATION_SUCCESS_MESSAGE = 'If an account exists and needs verification, a verification email has been sent.';
export const LOGIN_EMAIL_VERIFIED_MESSAGE = 'Your email has been verified. You can now log in.';

export const AUTH_NOTIFICATION_MESSAGES = {
  genericError: 'Something went wrong. Please try again.',
  genericErrorLater: 'Something went wrong. Please try again later.',
  invalidCredentials: 'Invalid email or password.',
  emailNotVerified: 'Your email address is not verified yet. Please check your inbox.',
  accountSuspended: 'Your account is suspended.',
  accountDeactivated: 'Your account is deactivated.',
  actionNotAllowed: 'This action is not allowed.',
  invalidOrExpiredLink: 'This link is invalid or has expired.',
} as const;
