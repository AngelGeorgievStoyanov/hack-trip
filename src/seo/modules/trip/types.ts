/** Minimal trip data required by the Trip SEO module. */
export interface TripSeoPointInput {
  name?: string | null;
  description?: string | null;
  lat?: number | null;
  lng?: number | null;
  images?: readonly { id: number }[];
}

export interface TripSeoDayInput {
  dayNumber: number;
  title?: string | null;
  description?: string | null;
  destination?: string | null;
  points?: readonly TripSeoPointInput[];
  images?: readonly { id: number }[];
}

export interface TripSeoInput {
  days: readonly TripSeoDayInput[];
}

export interface TripSeoPoint {
  name: string;
  description?: string;
  latitude?: number;
  longitude?: number;
}

export interface TripSeoDay {
  dayNumber: number;
  name: string;
  description?: string;
  points: TripSeoPoint[];
}

export interface TripSeoContent {
  title: string;
  description?: string;
  itinerary: TripSeoDay[];
}

export interface TripSeoMetadataOptions {
  tripId: number;
  dayNumber?: number;
}
