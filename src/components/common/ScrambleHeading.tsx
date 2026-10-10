'use client';

import {
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
  type CSSProperties,
  type Ref,
} from 'react';
import { headingTextStyle } from '@/constants/ui';

const LETTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
const SCRAMBLE_INTERVAL_MS = 30;
const SCRAMBLE_STEP = 1 / 3;
const SCRAMBLE_MIN_LENGTH = 5;

export interface ScrambleHeadingHandle {
  scramble: () => void;
}

interface ScrambleHeadingProps {
  text: string;
  /** Exposed so a parent can re-trigger the effect from a wider touch area. */
  ref?: Ref<ScrambleHeadingHandle>;
  style?: CSSProperties;
}

/**
 * Reproduces the legacy scramble effect: every 30 ms one more leading character is
 * revealed, with the remaining characters reset to random A–Z letters.
 */
export function ScrambleHeading({ text, ref, style }: ScrambleHeadingProps) {
  const [display, setDisplay] = useState(text);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const stop = useCallback((): void => {
    if (timerRef.current !== null) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  useEffect(() => {
    stop();
    setDisplay(text);
  }, [stop, text]);

  useEffect(() => stop, [stop]);

  const scramble = useCallback((): void => {
    if (text.length <= SCRAMBLE_MIN_LENGTH) {
      return;
    }
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      return;
    }
    // A new hover/touch restarts the effect instead of stacking intervals.
    stop();
    let iterations = 0;
    timerRef.current = setInterval(() => {
      iterations += SCRAMBLE_STEP;
      if (iterations >= text.length) {
        setDisplay(text);
        stop();
        return;
      }
      const revealed = Math.floor(iterations);
      let next = text.slice(0, revealed);
      for (let index = revealed; index < text.length; index += 1) {
        next +=
          text[index] === ' '
            ? ' '
            : LETTERS[Math.floor(Math.random() * LETTERS.length)];
      }
      setDisplay(next);
    }, SCRAMBLE_INTERVAL_MS);
  }, [stop, text]);

  useImperativeHandle(ref, () => ({ scramble }), [scramble]);

  return (
    <h1
      aria-label={text}
      onMouseOver={scramble}
      style={{ margin: '2px', ...headingTextStyle, ...style }}
    >
      <span aria-hidden="true">{display}</span>
    </h1>
  );
}
