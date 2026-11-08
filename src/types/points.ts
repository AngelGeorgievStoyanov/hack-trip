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
