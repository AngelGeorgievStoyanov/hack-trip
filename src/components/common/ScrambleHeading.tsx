'use client';

import { useEffect, useRef, useState } from 'react';
import { Typography, type TypographyProps } from '@mui/material';

const CHARSET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
const SCRAMBLE_INTERVAL_MS = 60;
const SCRAMBLE_MIN_LENGTH = 5;

interface ScrambleHeadingProps {
  text: string;
  variant?: TypographyProps['variant'];
}

export function ScrambleHeading({ text, variant = 'h4' }: ScrambleHeadingProps) {
  const [display, setDisplay] = useState(text);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    setDisplay(text);
  }, [text]);

  useEffect(() => {
    return () => {
      if (timerRef.current !== null) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

  function scramble(): void {
    if (text.length <= SCRAMBLE_MIN_LENGTH) {
      return;
    }
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      return;
    }
    if (timerRef.current !== null) {
      clearInterval(timerRef.current);
    }
    let step = 0;
    timerRef.current = setInterval(() => {
      step += 1;
      if (step >= text.length) {
        setDisplay(text);
        if (timerRef.current !== null) {
          clearInterval(timerRef.current);
          timerRef.current = null;
        }
        return;
      }
      let next = text.slice(0, step);
      for (let index = step; index < text.length; index += 1) {
        next +=
          text[index] === ' '
            ? ' '
            : CHARSET[Math.floor(Math.random() * CHARSET.length)];
      }
      setDisplay(next);
    }, SCRAMBLE_INTERVAL_MS);
  }

  return (
    <Typography
      variant={variant}
      aria-label={text}
      onMouseEnter={scramble}
      onTouchStart={scramble}
      sx={{ cursor: 'default' }}
    >
      <span aria-hidden="true">{display}</span>
    </Typography>
  );
}
