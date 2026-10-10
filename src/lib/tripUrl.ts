import type { TripSort } from '@/constants/trips';

export interface TripsQueryParams {
  search?: string;
  group?: string;
  transport?: string;
  sort?: TripSort;
  page?: number;
}

/** Builds `/trips?...`, omitting empty values so the canonical URL stays clean. */
export function buildTripsUrl(params: TripsQueryParams): string {
  const search = new URLSearchParams();
  if (params.search) {
    search.set('search', params.search);
  }
  if (params.group) {
    search.set('group', params.group);
  }
  if (params.transport) {
    search.set('transport', params.transport);
  }
  if (params.sort) {
    search.set('sort', params.sort);
  }
  if (params.page !== undefined && params.page > 1) {
    search.set('page', String(params.page));
  }
  const query = search.toString();
  return query ? `/trips?${query}` : '/trips';
}

/** Trip detail URL, preserving the selected day (`?day=N`) like the legacy day navigation. */
export function buildTripUrl(tripId: number, day?: number): string {
  return day === undefined ? `/trips/${tripId}` : `/trips/${tripId}?day=${day}`;
}
