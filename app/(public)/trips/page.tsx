import type { Metadata } from 'next';
import type { CSSProperties } from 'react';
import { tripApi, type TripListQuery } from '@/api/trips';
import { TripFilters } from '@/components/trips/TripFilters';
import { TripList } from '@/components/trips/TripList';
import { TripPagination } from '@/components/trips/TripPagination';
import { buildSeoMetadata } from '@/seo';
import {
  TRIP_GROUP_MAX_LENGTH,
  TRIP_SEARCH_MAX_LENGTH,
  TRIP_TRANSPORT_MAX_LENGTH,
  type TripSort,
} from '@/constants/trips';
import {
  PAGE_MAX,
  TRIP_LIMIT_DEFAULT,
  TRIP_LIMIT_MAX,
  TRIP_PAGE_DEFAULT,
  pageBackgroundStyle,
} from '@/constants/ui';

interface TripsPageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

const MAIN_STYLE: CSSProperties = {
  ...pageBackgroundStyle,
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
};

function first(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

function parseOptionalInt(value: string | undefined, max: number): number | undefined {
  if (value === undefined || value === '') return undefined;
  const n = Number(value);
  return Number.isInteger(n) && n >= 1 && n <= max ? n : undefined;
}

function cleanString(value: string | undefined, max: number): string | undefined {
  const trimmed = value?.trim();
  return trimmed ? trimmed.slice(0, max) : undefined;
}

function parseQuery(sp: Record<string, string | string[] | undefined>): TripListQuery {
  const sortRaw = first(sp.sort);
  const sort: TripSort | undefined =
    sortRaw === 'newest' || sortRaw === 'oldest' ? sortRaw : undefined;
  return {
    page: parseOptionalInt(first(sp.page), PAGE_MAX),
    limit: parseOptionalInt(first(sp.limit), TRIP_LIMIT_MAX),
    search: cleanString(first(sp.search), TRIP_SEARCH_MAX_LENGTH),
    group: cleanString(first(sp.group), TRIP_GROUP_MAX_LENGTH),
    transport: cleanString(first(sp.transport), TRIP_TRANSPORT_MAX_LENGTH),
    sort,
  };
}

export async function generateMetadata({ searchParams }: TripsPageProps): Promise<Metadata> {
  const sp = await searchParams;
  const query = parseQuery(sp);
  const page = query.page ?? TRIP_PAGE_DEFAULT;
  const hasFilters = Boolean(
    query.search || query.group || query.transport || query.limit ||
    (query.sort && query.sort !== 'newest'),
  );
  const hasUnknownParams = Object.keys(sp).some(
    (key) => !['page', 'search', 'group', 'transport', 'sort', 'limit'].includes(key),
  );
  const noIndex = hasFilters || hasUnknownParams;
  const canonicalPath = page > 1 && !noIndex ? '/trips?page=' + page : '/trips';

  return buildSeoMetadata({
    title: 'Explore Travel Trips and Itineraries',
    description:
      'Explore travel itineraries shared by travelers, discover interesting destinations and GPS locations, and find inspiration for your next trip.',
    canonicalPath,
    noIndex,
  });
}

export default async function TripsPage({ searchParams }: TripsPageProps) {
  const sp = await searchParams;
  const query = parseQuery(sp);
  const page = query.page ?? TRIP_PAGE_DEFAULT;
  const limit = query.limit ?? TRIP_LIMIT_DEFAULT;
  const filters = (
    <TripFilters
      search={query.search}
      sort={query.sort}
      group={query.group}
      transport={query.transport}
    />
  );

  try {
    const trips = await tripApi.listTrips({ ...query, page, limit });
    const hasNextPage = trips.length === limit;
    return (
      <>
        {filters}
        <main style={MAIN_STYLE}>
          <header style={{ maxWidth: 900, padding: '24px 20px', textAlign: 'center' }}>
            <h1>Explore Trips, Places and Travel Ideas</h1>
            <p>
              Browse itineraries shared by travelers, discover destinations and interesting
              locations, and get ideas for your next journey. Explore routes that include cities,
              restaurants, nature, viewpoints and places off the beaten path.
            </p>
          </header>
          <TripList trips={trips} />
          <TripPagination
            page={page}
            hasNextPage={hasNextPage}
            search={query.search}
            group={query.group}
            transport={query.transport}
            sort={query.sort}
          />
        </main>
      </>
    );
  } catch {
    return (
      <>
        {filters}
        <main style={MAIN_STYLE}>
          <header className="trips-page__intro">
            <h1>Explore Trips, Places and Travel Ideas</h1>
            <p>Trips are temporarily unavailable. Please try again later.</p>
          </header>
        </main>
      </>
    );
  }
}
