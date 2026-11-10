import Link from 'next/link';
import { buildTripsUrl } from '@/lib/tripUrl';
import type { TripSort } from '@/constants/trips';

interface TripPaginationProps {
  page: number;
  hasNextPage: boolean;
  search?: string;
  group?: string;
  transport?: string;
  sort?: TripSort;
}

/** Crawlable pagination: every destination is a regular anchor with a real href. */
export function TripPagination({
  page,
  hasNextPage,
  search,
  group,
  transport,
  sort,
}: TripPaginationProps) {
  const pages = [...(page > 1 ? [page - 1] : []), page, ...(hasNextPage ? [page + 1] : [])];

  if (pages.length <= 1) return null;

  return (
    <nav
      aria-label="Trip list pages"
      style={{ display: 'flex', justifyContent: 'center', margin: 20 }}
    >
      <ul style={{ display: 'flex', alignItems: 'center', gap: 12, listStyle: 'none', padding: 0 }}>
        {page > 1 ? (
          <li>
            <Link href={buildTripsUrl({ search, group, transport, sort, page: page - 1 })}>
              Previous
            </Link>
          </li>
        ) : null}
        {pages.map((pageNumber) => (
          <li key={pageNumber}>
            {pageNumber === page ? (
              <span aria-current="page" aria-label={'Page ' + pageNumber}>
                {pageNumber}
              </span>
            ) : (
              <Link
                href={buildTripsUrl({
                  search,
                  group,
                  transport,
                  sort,
                  page: pageNumber,
                })}
                aria-label={'Page ' + pageNumber}
              >
                {pageNumber}
              </Link>
            )}
          </li>
        ))}
        {hasNextPage ? (
          <li>
            <Link href={buildTripsUrl({ search, group, transport, sort, page: page + 1 })}>
              Next
            </Link>
          </li>
        ) : null}
      </ul>
    </nav>
  );
}
