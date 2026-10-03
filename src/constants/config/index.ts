/**
 * Dynamic select configuration (`GET /config/selects`).
 *
 * Only the select type keys live here. The selectable options themselves are owned by the
 * backend runtime config and must never be mirrored as frontend constants.
 */

export const TRIP_SELECT_FIELDS = ['group', 'transport'] as const;

export type TripSelectFieldName = (typeof TRIP_SELECT_FIELDS)[number];

export const SELECT_TYPE_KEYS: Record<TripSelectFieldName, string> = {
  group: 'group_type',
  transport: 'transport',
};

/** Dynamic config only changes with a backend deployment, so a single load covers a long session. */
export const SELECTS_STALE_TIME_MS = 30 * 60 * 1000;

export const SELECTS_QUERY_KEY = ['config', 'selects'] as const;
