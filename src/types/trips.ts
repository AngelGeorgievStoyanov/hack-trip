import type { TripPoint, ResourcePermissions } from './points';
import type { SocialImageDto } from './images';
import type { SocialState } from './social';

export interface SelectKeyName {
  key: string;
  name: string;
}

/**
 * Trip group response returned by `GET /trips`, `GET /trips/top`,
 * `GET /trips/:tripGroupId`, `GET /me/trips`, `GET /me/favorites`, and the
 * trip/day mutation endpoints. Per API_CONTRACT.md §8.68, the trip-group id
 * is serialized as `id` in the response root (there is no `tripGroupId` field).
 */
export interface TripGroupResponse {
  id: number;
  permissions: ResourcePermissions;
  social: SocialState;
  days: TripGroupDay[];
}

/**
 * A single existing `trips` row belonging to a trip group.
 * `id` is the `trips.id` row id; `dayNumber` is the day number (may be non-contiguous).
 */
export interface TripGroupDay {
  id: number;
  dayNumber: number;
  permissions: ResourcePermissions;
  title: string | null;
  description: string | null;
  countPeoples: number;
  destination: string | null;
  lat: number | null;
  lng: number | null;
  price: number | null;
  currency: {
    id: number;
    code: string;
    name: string;
  } | null;
  transport: SelectKeyName;
  group: SelectKeyName;
  images: SocialImageDto[];
  social: SocialState;
  points: TripPoint[];
  createdAt: string | null;
  updatedAt: string | null;
}

/** `GET /trips/background` response (`API_CONTRACT.md` §22.6). */
export interface BackgroundImageResponse {
  url: string;
}
