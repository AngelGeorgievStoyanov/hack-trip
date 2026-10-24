'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { keyframes } from '@emotion/react';

/**
 * Legacy like/unlike animations, restored from the original `TripDetails` component.
 * The keyframes and their timing are part of the legacy look and must not change.
 */
export const LIKE_KEYFRAMES = {
  shake: keyframes`
    0% { transform: scale(1) translateY(0px) rotate(0deg); }
    10% { transform: scale(1) translateY(-1px) rotate(10deg); }
    20% { transform: scale(1) translateY(-3px) rotate(-10deg); }
    30% { transform: scale(1) translateY(-5px) rotate(10deg); }
    40% { transform: scale(1) translateY(-10px) rotate(-10deg); }
    50% { transform: scale(1) translateY(-10px) rotate(10deg); }
    60% { transform: scale(1) translateY(-10px) rotate(-10deg); }
    70% { transform: scale(1) translateY(-5px) rotate(10deg); }
    80% { transform: scale(1) translateY(-3px) rotate(-10deg); }
    90% { transform: scale(1) translateY(-1px) rotate(10deg); }
    100% { transform: scale(1) translateY(0px) rotate(0deg); }
  `,
  growShrink: keyframes`
    0% { transform: scale(1); }
    50% { transform: scale(2) translateY(-10px); }
    100% { transform: scale(1); }
  `,
  rotate: keyframes`
    0% { transform: rotate(0deg); }
    50% { transform: rotate(180deg); }
    100% { transform: rotate(0deg); }
  `,
  rotateX: keyframes`
    0% { transform: rotateX(0deg); }
    50% { transform: rotateX(180deg); }
    100% { transform: rotateX(0deg); }
  `,
} as const;

export type LikeEffectName = keyof typeof LIKE_KEYFRAMES;

/**
 * Legacy effect pools. The filled (liked) thumb uses the "like" pool and the outlined
 * (not liked) thumb uses the "unlike" pool, exactly like the legacy component, which
 * picked one of the two variants of a pool at random.
 */
export const LIKE_EFFECTS = {
  like: ['shake', 'growShrink'] as LikeEffectName[],
  unlike: ['rotate', 'rotateX'] as LikeEffectName[],
} as const;

/** Legacy durations: the liked thumb shakes for 0.5s, the unliked thumb rotates for 1s. */
export const LIKE_EFFECT_DURATION = {
  like: 500,
  unlike: 1000,
} as const;

export interface ActiveLikeAnimation {
  effect: LikeEffectName;
  duration: number;
  /** Increments on every replay so the effect can be restarted on demand. */
  token: number;
}

export interface UseLikeAnimationOptions {
  /**
   * True when the last like/unlike request failed. A failed action must not leave a
   * pending animation behind, otherwise the next state change would replay it.
   */
  failed?: boolean;
}

export interface LikeAnimationState {
  /**
   * Marks a user initiated like/unlike. The variant is drawn when the action really
   * changed the state, so a restored state never animates on its own.
   */
  requestPlay: () => void;
  /** The effect that is currently playing, or `null` while nothing is playing. */
  active: ActiveLikeAnimation | null;
  /**
   * CSS `animation` value for the thumb matching the current like state.
   * `none` while idle, so the icon is not animated on first render.
   */
  animation: string;
}

/**
 * Legacy random variant picker.
 *
 * The legacy component drew a random variant of the matching pool on every action
 * (`Math.random() > 0.5 ? shake : growShrink`), so repeated likes and unlikes could
 * play different animations. It is a plain function, never a hook.
 */
function pickRandomEffect(options: readonly LikeEffectName[]): LikeEffectName {
  return options[Math.floor(Math.random() * options.length)] as LikeEffectName;
}

/** Legacy honouring of the operating system "reduce motion" preference. */
function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
    return false;
  }
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/**
 * Drives the legacy like/unlike animations.
 *
 * The animation is bound to the *result* of a real like/unlike action: the hook watches
 * the like state and starts a randomly drawn variant when the state actually flips.
 * Because the trigger is the state change itself and not the click, the animation is
 * never lost when the mutation resolves late, when the component re-renders, or when the
 * mutation fails. A state that is merely restored from the API (for example after a
 * reload) never plays an effect, exactly like the legacy component.
 *
 * @param isLiked current like state of the rendered thumb.
 * @param options `failed` clears a pending animation after a failed request.
 */
export function useLikeAnimation(isLiked: boolean, options: UseLikeAnimationOptions = {}): LikeAnimationState {
  const { failed = false } = options;
  const [active, setActive] = useState<ActiveLikeAnimation | null>(null);
  const previousLiked = useRef(isLiked);
  const userAction = useRef(false);

  const requestPlay = useCallback((): void => {
    userAction.current = true;
  }, []);

  useEffect(() => {
    if (failed) {
      // The action did not change anything, so no animation may stay pending.
      userAction.current = false;
    }
  }, [failed]);

  useEffect(() => {
    const wasLiked = previousLiked.current;
    previousLiked.current = isLiked;

    if (wasLiked === isLiked) {
      return;
    }

    if (!userAction.current) {
      // The state was restored from the API, not changed by the user.
      return;
    }
    userAction.current = false;

    if (prefersReducedMotion()) {
      return;
    }

    // The liked thumb uses the "like" pool, the unliked thumb the "unlike" pool. The
    // variant is drawn here, on the real state change, and not on an ordinary render.
    const effect = pickRandomEffect(isLiked ? LIKE_EFFECTS.like : LIKE_EFFECTS.unlike);
    const duration = isLiked ? LIKE_EFFECT_DURATION.like : LIKE_EFFECT_DURATION.unlike;
    setActive((previous) => ({ effect, duration, token: (previous?.token ?? 0) + 1 }));
  }, [isLiked]);

  const currentPool = isLiked ? LIKE_EFFECTS.like : LIKE_EFFECTS.unlike;
  const animation =
    active && currentPool.includes(active.effect)
      ? `${LIKE_KEYFRAMES[active.effect]} ${active.duration}ms ease`
      : 'none';

  return { requestPlay, active, animation };
}
