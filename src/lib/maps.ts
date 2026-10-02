import { config } from '../config';

/**
 * Google Maps integration boundary.
 *
 * Centralizes Google Maps configuration and any Google-specific SDK details. Map components
 * consume this boundary rather than reading environment variables or initializing the SDK
 * independently.
 */

export type GoogleMapsLibrary = 'drawing' | 'places' | 'geometry';

export const GOOGLE_MAPS_LIBRARIES: GoogleMapsLibrary[] = ['places', 'drawing', 'geometry'];

export const googleMapsApiKey: string = config.googleMapsApiKey;

export interface GoogleMapsInitConfig {
  googleMapsApiKey: string;
  libraries: GoogleMapsLibrary[];
}

export const googleMapsInitConfig: GoogleMapsInitConfig = {
  googleMapsApiKey: config.googleMapsApiKey,
  libraries: GOOGLE_MAPS_LIBRARIES,
};

export interface MapPosition {
  lat: number;
  lng: number;
}

export function toMapPosition(point: {
  latitude: number | null;
  longitude: number | null;
}): MapPosition | null {
  if (point.latitude == null || point.longitude == null) {
    return null;
  }
  return { lat: point.latitude, lng: point.longitude };
}

export function hasCoordinates(point: {
  latitude: number | null;
  longitude: number | null;
}): boolean {
  return point.latitude != null && point.longitude != null;
}
