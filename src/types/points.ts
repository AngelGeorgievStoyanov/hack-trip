import type { SocialImageDto } from './images';
import type { SocialState } from './social';

export interface ResourcePermissions {
  canEdit: boolean;
  canDelete: boolean;
}

/**
 * Point response DTO (`API_CONTRACT.md` §10.7). Uses database field names.
 */
export interface TripPoint {
  id: number;
  name: string;
  description: string | null;
  lat: number | null;
  lng: number | null;
  pointNumber: number;
  tripId: number;
  createdAt: string | null;
  updatedAt: string | null;
  images: SocialImageDto[];
  permissions: ResourcePermissions;
  social: SocialState;
}

/**
 * Day response DTO (`API_CONTRACT.md` §10.8), returned e.g. by
 * `PUT /trips/:tripId/days/reorder`. Note `day` (not `dayNumber`): this is a
 * stripped day shape — full trip days inside `TripGroupResponse` are `TripGroupDay`.
 */
export interface TripDay {
  id: number;
  day: number;
  title: string | null;
  images: SocialImageDto[];
  points: TripPoint[];
  permissions: ResourcePermissions;
  social: SocialState;
}
