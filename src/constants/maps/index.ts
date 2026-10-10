export type GoogleMapsLibrary = 'drawing' | 'places' | 'geometry';

export const GOOGLE_MAPS_LIBRARIES: GoogleMapsLibrary[] = ['places', 'drawing', 'geometry'];

export const GOOGLE_MAPS_LOADER_ID = 'hacktrip-google-maps';

export const MAP_CONTAINER_HEIGHT = 400;

/** Legacy trip-details map size, hardcoded as 600×250 in the legacy map settings. */
export const MAP_TRIP_WIDTH = 600;
export const MAP_TRIP_HEIGHT = 250;

/** Legacy trip-details map options: zoom control shown, greedy gesture handling. */
export const MAP_TRIP_OPTIONS = {
  zoomControl: true,
  gestureHandling: 'greedy',
} as const;

export const MAP_DEFAULT_ZOOM = 14;

/** Sofia — the fallback centre used before any position exists. */
export const MAP_DEFAULT_CENTER = { lat: 42.697866831005435, lng: 23.321590139866355 };

export const MAP_POINT_PICKER_HEIGHT = 360;
export const MAP_GEOCODED_ZOOM = 16;
export const MAP_TRACKING_ZOOM = 16;

export const MAP_COORDINATE_PRECISION = 6;
export const MAP_SEARCH_MIN_LENGTH = 2;

export const GEOLOCATION_OPTIONS: PositionOptions = {
  enableHighAccuracy: true,
  timeout: 10000,
  maximumAge: 0,
};
