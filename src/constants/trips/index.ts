export const TRIP_SORT_OPTIONS = {
  newest: 'newest',
  oldest: 'oldest',
} as const;

export type TripSort = (typeof TRIP_SORT_OPTIONS)[keyof typeof TRIP_SORT_OPTIONS];

export const TRIP_TITLE_MAX_LENGTH = 60;
export const TRIP_DESCRIPTION_MAX_LENGTH = 2000;
export const TRIP_GROUP_MAX_LENGTH = 45;
export const TRIP_TRANSPORT_MAX_LENGTH = 45;
export const TRIP_SEARCH_MAX_LENGTH = 200;

export const DAY_NUMBER_MAX = 500;
export const DAY_TITLE_MAX_LENGTH = 60;
