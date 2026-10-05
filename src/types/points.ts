import type { SocialImageDto } from './images';
import type { SocialState } from './social';

export interface TripPoint {
  id: number;
  title: string;
  description: string | null;
  latitude: number | null;
  longitude: number | null;
  images: SocialImageDto[];
  social: SocialState;
}

export interface TripDay {
  id: number;
  day: number;
  title: string | null;
  images: SocialImageDto[];
  points: TripPoint[];
  social: SocialState;
}
