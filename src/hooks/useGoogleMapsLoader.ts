'use client';

import { useJsApiLoader } from '@react-google-maps/api';
import { googleMapsInitConfig } from '@/lib/maps';
import { GOOGLE_MAPS_LOADER_ID } from '@/constants/maps';

/**
 * Single loading entry point for the Google Maps JavaScript SDK.
 *
 * Map components must load the SDK through this hook instead of calling `useJsApiLoader`
 * themselves so the API key and libraries stay centralized and the SDK is never loaded
 * independently in multiple components (docs/ARCHITECTURE.md §22).
 */
export function useGoogleMapsLoader() {
  return useJsApiLoader({ ...googleMapsInitConfig, id: GOOGLE_MAPS_LOADER_ID });
}
