'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Alert, Box, Button, CircularProgress, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography } from '@mui/material';
import { adminApi } from '@/api/admin';
import { getGenericErrorMessage } from '@/lib/errors';
import { ADMIN_PAGE_SIZE_DEFAULT } from '@/constants/ui';

function formatDate(value: string | null): string {
  if (!value) return '—';
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleString();
}

export function AdminRouteNotFoundLogs() {
  const [page, setPage] = useState(1);

  const { data, isLoading, error } = useQuery({
    queryKey: ['admin', 'route-not-found-logs', page, ADMIN_PAGE_SIZE_DEFAULT],
    queryFn: () => adminApi.listRouteNotFoundLogs({ page, pageSize: ADMIN_PAGE_SIZE_DEFAULT }),
  });

  const pagination = data?.pagination;

  return (
    <Box>
      <Typography variant="h4">Route not found logs</Typography>
      {error ? <Alert severity="error">{getGenericErrorMessage(error)}</Alert> : null}
      {isLoading ? <CircularProgress /> : null}
      {data ? (
        <TableContainer component={Paper}>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Date</TableCell>
                <TableCell>Method</TableCell>
                <TableCell>IP</TableCell>
                <TableCell>User</TableCell>
                <TableCell>Email</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {data.items.map((item) => (
                <TableRow key={item.id} hover>
                  <TableCell>{formatDate(item.date)}</TableCell>
                  <TableCell>{item.reqMethod ?? '—'}</TableCell>
                  <TableCell>{item.reqIp ?? '—'}</TableCell>
                  <TableCell>{item.reqUserId ?? '—'}</TableCell>
                  <TableCell>{item.reqUserEmail ?? '—'}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      ) : null}
      {pagination && (pagination.totalPages ?? 0) > 1 ? (
        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', mt: 1 }}>
          <Button disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>Previous</Button>
          <Typography>Page {page} of {pagination.totalPages}</Typography>
          <Button disabled={page >= (pagination.totalPages ?? 1)} onClick={() => setPage((p) => p + 1)}>Next</Button>
        </Box>
      ) : null}
    </Box>
  );
}
