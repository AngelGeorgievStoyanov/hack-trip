import type { Metadata } from 'next';
import type { CSSProperties } from 'react';
import { tripApi, type TripListQuery } from '@/api/trips';
import { TripFilters } from '@/components/trips/TripFilters';
import { TripList } from '@/components/trips/TripList';
import { TripPagination } from '@/components/trips/TripPagination';
import { WelcomeHeading } from '@/components/common/WelcomeHeading';
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

const INTRO_STYLE: CSSProperties = {
  maxWidth: 900,
  margin: '0 20px 24px',
  textAlign: 'center',
  color: '#fff',
  textShadow: '3px 3px 3px rgb(10,10,10)',
  lineHeight: 1.6,
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
    title: 'Discover Trips, Places and Travel Experiences',
    description:
      'Explore destinations, photos, routes and personal recommendations shared by travelers. Find interesting places and inspiration for your next adventure.',
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

  const intro = (
    <WelcomeHeading>
      <p style={INTRO_STYLE}>
        Discover destinations, photos and experiences shared by the HackTrip community. Explore
        interesting places and personal recommendations from around the world, then share your own
        discoveries.
      </p>
    </WelcomeHeading>
  );

  try {
    const trips = await tripApi.listTrips({ ...query, page, limit });
    const hasNextPage = trips.length === limit;
    return (
      <>
        {filters}
        <main style={MAIN_STYLE}>
          {intro}
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
          {intro}
          <p style={INTRO_STYLE}>Trips are temporarily unavailable. Please try again later.</p>
        </main>
      </>
    );
  }
}
