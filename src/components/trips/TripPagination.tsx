'use client';

import { useRouter } from 'next/navigation';
import { Box, Pagination } from '@mui/material';
import { buildTripsUrl } from '@/lib/tripUrl';
import type { TripSort } from '@/constants/trips';

interface TripPaginationProps {
  page: number;
  totalPages: number;
  search?: string;
  group?: string;
  transport?: string;
  sort?: TripSort;
}

/** Client Component: the legacy list used a MUI `Pagination` control that re-queried the page. */
export function TripPagination({
  page,
  totalPages,
  search,
  group,
  transport,
  sort,
}: TripPaginationProps) {
  const router = useRouter();

  if (totalPages <= 1) {
    return null;
  }

  return (
    <Box sx={{ display: 'flex', justifyContent: 'center', margin: '20px' }}>
      <Pagination
        count={totalPages}
        page={page}
        color="primary"
        onChange={(_event, value) => {
          router.push(buildTripsUrl({ search, group, transport, sort, page: value }));
        }}
      />
    </Box>
  );
}
