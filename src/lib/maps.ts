import { config } from '../config';
import { GOOGLE_MAPS_LIBRARIES } from '@/constants/maps';
import type { GoogleMapsLibrary } from '@/constants/maps';

export type { GoogleMapsLibrary };

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
