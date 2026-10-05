'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { GEOLOCATION_OPTIONS } from '@/constants/maps';
import { distanceMeters as haversineMeters, totalDistanceMeters } from '@/lib/tracking';

export interface TrackedPoint {
  lat: number;
  lng: number;
  altitude: number | null;
  speed: number | null;
  timestamp: number;
}

interface WakeLockApi {
  request: (type: 'screen') => Promise<{ release: () => Promise<void> }>;
}

const MIN_RECORD_DISTANCE_METERS = 5;

function describeGeoError(error: GeolocationPositionError): string {
  switch (error.code) {
    case error.PERMISSION_DENIED:
      return 'Location permission was denied. Allow access to use live tracking.';
    case error.POSITION_UNAVAILABLE:
      return 'Location information is unavailable.';
    default:
      return 'Timed out while waiting for a location update.';
  }
}

export function useLiveTracking() {
  const [points, setPoints] = useState<TrackedPoint[]>([]);
  const [current, setCurrent] = useState<TrackedPoint | null>(null);
  const [tracking, setTracking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [startedAt, setStartedAt] = useState<number | null>(null);
  const [now, setNow] = useState<number>(() => Date.now());

  const pointsRef = useRef<TrackedPoint[]>([]);
  const watchIdRef = useRef<number | null>(null);
  const wakeLockRef = useRef<{ release: () => Promise<void> } | null>(null);

  const handlePosition = useCallback((position: GeolocationPosition) => {
    const next: TrackedPoint = {
      lat: position.coords.latitude,
      lng: position.coords.longitude,
      altitude: position.coords.altitude,
      speed: position.coords.speed,
      timestamp: position.timestamp,
    };
    setCurrent(next);
    const last = pointsRef.current[pointsRef.current.length - 1];
    if (last && haversineMeters(last, next) < MIN_RECORD_DISTANCE_METERS) {
      return;
    }
    pointsRef.current = [...pointsRef.current, next];
    setPoints(pointsRef.current);
  }, []);

  const handleGeoError = useCallback((geoError: GeolocationPositionError) => {
    setError(describeGeoError(geoError));
  }, []);

  const releaseWakeLock = useCallback(() => {
    const sentinel = wakeLockRef.current;
    wakeLockRef.current = null;
    void sentinel?.release().catch(() => undefined);
  }, []);

  const acquireWakeLock = useCallback(async () => {
    const wakeLock = (navigator as Navigator & { wakeLock?: WakeLockApi }).wakeLock;
    if (!wakeLock) {
      return;
    }
    try {
      wakeLockRef.current = await wakeLock.request('screen');
    } catch {
      wakeLockRef.current = null;
    }
  }, []);

  const start = useCallback(() => {
    if (!('geolocation' in navigator)) {
      setError('This browser does not support location access.');
      return;
    }
    setError(null);
    if (watchIdRef.current === null) {
      watchIdRef.current = navigator.geolocation.watchPosition(
        handlePosition,
        handleGeoError,
        GEOLOCATION_OPTIONS,
      );
    }
    setTracking(true);
    setStartedAt((previous) => previous ?? Date.now());
    void acquireWakeLock();
  }, [acquireWakeLock, handleGeoError, handlePosition]);

  const stop = useCallback(() => {
    if (watchIdRef.current !== null && 'geolocation' in navigator) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
    setTracking(false);
    releaseWakeLock();
  }, [releaseWakeLock]);

  const reset = useCallback(() => {
    stop();
    pointsRef.current = [];
    setPoints([]);
    setCurrent(null);
    setStartedAt(null);
    setNow(Date.now());
    setError(null);
  }, [stop]);

  useEffect(() => {
    if (!tracking) {
      return undefined;
    }
    const intervalId = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(intervalId);
  }, [tracking]);

  useEffect(() => {
    return () => {
      if (watchIdRef.current !== null && 'geolocation' in navigator) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
      const sentinel = wakeLockRef.current;
      wakeLockRef.current = null;
      void sentinel?.release().catch(() => undefined);
    };
  }, []);

  const distanceMeters = useMemo(() => totalDistanceMeters(points), [points]);
  const elapsedSeconds = useMemo(() => {
    if (startedAt === null) {
      return 0;
    }
    return Math.max(0, Math.floor((now - startedAt) / 1000));
  }, [now, startedAt]);

  return {
    points,
    current,
    tracking,
    error,
    distanceMeters,
    elapsedSeconds,
    start,
    stop,
    reset,
  };
}
