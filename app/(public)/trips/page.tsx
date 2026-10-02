import type { Metadata } from 'next';
import Link from 'next/link';
import { tripApi, type TripListQuery } from '@/api/trips';
import { TripFilters } from '@/components/trips/TripFilters';
import { TripList } from '@/components/trips/TripList';
import { absoluteUrl } from '@/config';
import type { TripSort } from '@/constants/trips';

export const metadata: Metadata = {
  title: 'Trips',
  description: 'Browse and discover trips on HackTrip.',
  alternates: { canonical: absoluteUrl('/trips') },
};

interface TripsPageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

function first(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

function parseOptionalInt(value: string | undefined, max: number): number | undefined {
  if (value === undefined || value === '') {
    return undefined;
  }
  const n = Number(value);
  return Number.isInteger(n) && n >= 1 && n <= max ? n : undefined;
}

function cleanString(value: string | undefined, max: number): string | undefined {
  const trimmed = value?.trim();
  if (!trimmed) {
    return undefined;
  }
  return trimmed.slice(0, max);
}

function parseQuery(sp: Record<string, string | string[] | undefined>): TripListQuery {
  const sortRaw = first(sp.sort);
  const sort: TripSort | undefined =
    sortRaw === 'newest' || sortRaw === 'oldest' ? sortRaw : undefined;

  return {
    page: parseOptionalInt(first(sp.page), 10000),
    limit: parseOptionalInt(first(sp.limit), 100),
    search: cleanString(first(sp.search), 200),
    group: cleanString(first(sp.group), 45),
    transport: cleanString(first(sp.transport), 45),
    sort,
  };
}

function pageUrl(
  sp: Record<string, string | string[] | undefined>,
  page: number,
): string {
  const params = new URLSearchParams();
  for (const key of ['search', 'group', 'transport', 'sort'] as const) {
    const value = first(sp[key]);
    if (value) {
      params.set(key, value);
    }
  }
  params.set('page', String(page));
  return `/trips?${params.toString()}`;
}

export default async function TripsPage({ searchParams }: TripsPageProps) {
  const sp = await searchParams;
  const query = parseQuery(sp);

  let items;
  let pagination;
  try {
    const response = await tripApi.listTrips(query);
    items = response.items;
    pagination = response.pagination;
  } catch {
    return (
      <main style={{ padding: '2rem' }}>
        <h1>Trips</h1>
        <TripFilters search={query.search} sort={query.sort} />
        <p>Trips are temporarily unavailable. Please try again later.</p>
      </main>
    );
  }

  const currentPage = pagination.page;
  const totalPages = pagination.totalPages;

  return (
    <main style={{ padding: '2rem' }}>
      <h1>Trips</h1>
      <TripFilters search={query.search} sort={query.sort} />
      <TripList trips={items} />

      {totalPages > 1 ? (
        <nav style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', marginTop: '1rem' }}>
          {currentPage > 1 ? <Link href={pageUrl(sp, currentPage - 1)}>Previous</Link> : null}
          <span>
            Page {currentPage} of {totalPages}
          </span>
          {currentPage < totalPages ? <Link href={pageUrl(sp, currentPage + 1)}>Next</Link> : null}
        </nav>
      ) : null}
    </main>
  );
}

