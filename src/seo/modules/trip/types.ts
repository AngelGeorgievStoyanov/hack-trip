/** Minimal trip data required by the Trip SEO module. */
interface TripSeoPointInput {
  name?: string | null;
  description?: string | null;
  lat?: number | null;
  lng?: number | null;
  images?: readonly { id: number }[];
}

interface TripSeoDayInput {
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

interface TripSeoPoint {
  name?: string;
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
  isIndexable: boolean;
}

export interface TripSeoMetadataOptions {
  tripId: number;
  dayNumber?: number;
}
