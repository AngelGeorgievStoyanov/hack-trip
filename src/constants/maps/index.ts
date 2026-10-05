export type GoogleMapsLibrary = 'drawing' | 'places' | 'geometry';

export const GOOGLE_MAPS_LIBRARIES: GoogleMapsLibrary[] = ['places', 'drawing', 'geometry'];

export const GOOGLE_MAPS_LOADER_ID = 'hacktrip-google-maps';

export const MAP_CONTAINER_HEIGHT = 400;

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
