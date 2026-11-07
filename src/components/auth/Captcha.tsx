'use client';

import { useEffect, useRef, useState } from 'react';
import Script from 'next/script';
import { Box } from '@mui/material';
import { config } from '@/config';
import { CAPTCHA_SCRIPT_URL, CAPTCHA_UNAVAILABLE_MESSAGE } from '@/constants/notifications';

declare global {
  interface Window {
    grecaptcha?: {
      ready: (callback: () => void) => void;
      render: (container: HTMLElement, parameters: {
        sitekey: string;
        callback: (token: string) => void;
        'expired-callback': () => void;
        'error-callback': () => void;
      }) => number;
    };
  }
}

interface CaptchaProps {
  onTokenChange: (token: string) => void;
  disabled?: boolean;
}

export function Captcha({ onTokenChange, disabled = false }: CaptchaProps) {
  const [loaded, setLoaded] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const widgetIdRef = useRef<number | null>(null);

  useEffect(() => {
    if (!loaded || !config.recaptchaV2SiteKey || !containerRef.current || !window.grecaptcha || widgetIdRef.current !== null) return;
    window.grecaptcha.ready(() => {
      const api = window.grecaptcha;
      const container = containerRef.current;
      if (!api || !container || widgetIdRef.current !== null) return;
      widgetIdRef.current = api.render(container, {
        sitekey: config.recaptchaV2SiteKey,
        callback: onTokenChange,
        'expired-callback': () => onTokenChange(''),
        'error-callback': () => onTokenChange(''),
      });
    });
  }, [loaded, onTokenChange]);

  if (!config.recaptchaV2SiteKey) return <Box role="alert">{CAPTCHA_UNAVAILABLE_MESSAGE}</Box>;

  return (
    <>
      <Script src={CAPTCHA_SCRIPT_URL} strategy="afterInteractive" onReady={() => setLoaded(true)} />
      <Box sx={{ display: 'flex', justifyContent: 'center', minHeight: 78, pointerEvents: disabled ? 'none' : 'auto', opacity: disabled ? 0.6 : 1 }}>
        <Box ref={containerRef} />
      </Box>
    </>
  );
}
