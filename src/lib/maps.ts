import { config } from '../config';
import { GOOGLE_MAPS_LIBRARIES, MAP_COORDINATE_PRECISION } from '@/constants/maps';
import type { GoogleMapsLibrary } from '@/constants/maps';
import {
  LATITUDE_MAX,
  LATITUDE_MIN,
  LONGITUDE_MAX,
  LONGITUDE_MIN,
} from '@/constants/points';

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

export function formatCoordinate(value: number): string {
  return String(Number(value.toFixed(MAP_COORDINATE_PRECISION)));
}

export function parseCoordinate(raw: string): number | null {
  const trimmed = raw.trim();
  if (!trimmed) {
    return null;
  }
  const parsed = Number(trimmed);
  return Number.isFinite(parsed) ? parsed : null;
}

export function coordinatePairToMapPosition(
  latitude: string,
  longitude: string,
): MapPosition | null {
  const lat = parseCoordinate(latitude);
  const lng = parseCoordinate(longitude);
  if (lat == null || lng == null) {
    return null;
  }
  if (
    lat < LATITUDE_MIN ||
    lat > LATITUDE_MAX ||
    lng < LONGITUDE_MIN ||
    lng > LONGITUDE_MAX
  ) {
    return null;
  }
  return { lat, lng };
}

export function sameMapPosition(a: MapPosition | null, b: MapPosition | null): boolean {
  if (a == null || b == null) {
    return a === b;
  }
  return a.lat === b.lat && a.lng === b.lng;
}
