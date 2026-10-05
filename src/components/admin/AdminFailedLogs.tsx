'use client';

import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Alert, Box, Button, Checkbox, CircularProgress, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography } from '@mui/material';
import { adminApi } from '@/api/admin';
import { useConfirm } from '@/components/common/ConfirmDialog';
import { getGenericErrorMessage } from '@/lib/errors';
import { ADMIN_PAGE_SIZE_DEFAULT } from '@/constants/ui';

function formatDate(value: string | null): string {
  if (!value) return '—';
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleString();
}

export function AdminFailedLogs() {
  const queryClient = useQueryClient();
  const { confirm } = useConfirm();
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [error, setError] = useState<string | null>(null);

  const { data, isLoading, error: queryError } = useQuery({
    queryKey: ['admin', 'failed-logs', page, ADMIN_PAGE_SIZE_DEFAULT],
    queryFn: () => adminApi.listFailedLogs({ page, pageSize: ADMIN_PAGE_SIZE_DEFAULT }),
  });

  const deleteMutation = useMutation({
    mutationFn: (ids: number[]) => adminApi.deleteFailedLogs({ ids }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['admin', 'failed-logs'] });
      setSelected(new Set());
    },
    onError: (e) => setError(getGenericErrorMessage(e)),
  });

  const pagination = data?.pagination;
  const allChecked = data ? data.items.length > 0 && data.items.every((item) => selected.has(item.id)) : false;

  function toggleAll() {
    if (!data) return;
    setSelected(allChecked ? new Set() : new Set(data.items.map((item) => item.id)));
  }

  function toggleOne(id: number) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  return (
    <Box>
      <Typography variant="h4">Failed login logs</Typography>
      {error ? <Alert severity="error" onClose={() => setError(null)}>{error}</Alert> : null}
      {queryError ? <Alert severity="error">{getGenericErrorMessage(queryError)}</Alert> : null}
      {selected.size > 0 ? (
        <Box sx={{ my: 1, display: 'flex', gap: 1, alignItems: 'center' }}>
          <Typography>{selected.size} selected</Typography>
          <Button
            color="error"
            disabled={deleteMutation.isPending}
            onClick={() =>
              void confirm('Are you sure you want to delete the selected logs?', 'Delete Confirmation').then(
                (confirmed) => {
                  if (confirmed) {
                    deleteMutation.mutate([...selected]);
                  }
                },
              )
            }
          >
            Delete selected
          </Button>
        </Box>
      ) : null}
      {isLoading ? <CircularProgress /> : null}
      {data ? (
        <TableContainer component={Paper}>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell padding="checkbox">
                  <Checkbox checked={allChecked} onChange={toggleAll} />
                </TableCell>
                <TableCell>Date</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>IP</TableCell>
                <TableCell>Country</TableCell>
                <TableCell>City</TableCell>
                <TableCell>User agent</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {data.items.map((item) => (
                <TableRow key={item.id} hover>
                  <TableCell padding="checkbox">
                    <Checkbox checked={selected.has(item.id)} onChange={() => toggleOne(item.id)} />
                  </TableCell>
                  <TableCell>{formatDate(item.date)}</TableCell>
                  <TableCell>{item.email}</TableCell>
                  <TableCell>{item.ip}</TableCell>
                  <TableCell>{item.countryName ?? item.countryCode ?? '—'}</TableCell>
                  <TableCell>{item.city ?? '—'}</TableCell>
                  <TableCell>{item.userAgent}</TableCell>
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
