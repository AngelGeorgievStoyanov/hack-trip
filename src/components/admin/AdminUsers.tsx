'use client';

import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import Link from 'next/link';
import { Alert, Box, Button, CircularProgress, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography } from '@mui/material';
import { adminApi } from '@/api/admin';
import { useAuth } from '@/hooks/useAuth';
import { useConfirm } from '@/components/common/ConfirmDialog';
import { getGenericErrorMessage } from '@/lib/errors';
import { ADMIN_PAGE_SIZE_DEFAULT } from '@/constants/ui';
import { isModeratorUser } from '@/constants/roles';

export function AdminUsers() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const { confirm } = useConfirm();
  const [page, setPage] = useState(1);
  const [error, setError] = useState<string | null>(null);
  const isAdmin = isModeratorUser(user);

  const { data, isLoading, error: queryError } = useQuery({
    queryKey: ['admin', 'users', page, ADMIN_PAGE_SIZE_DEFAULT],
    queryFn: () => adminApi.listUsers({ page, pageSize: ADMIN_PAGE_SIZE_DEFAULT }),
  });

  const deleteMutation = useMutation({
    mutationFn: (userId: string) => adminApi.deleteUser(userId),
    onSuccess: () => void queryClient.invalidateQueries({ queryKey: ['admin', 'users'] }),
    onError: (e) => setError(getGenericErrorMessage(e)),
  });

  const pagination = data?.pagination;

  return (
    <Box>
      <Typography variant="h4">Users</Typography>
      {error ? <Alert severity="error" onClose={() => setError(null)}>{error}</Alert> : null}
      {isLoading ? <CircularProgress /> : null}
      {queryError ? <Alert severity="error">{getGenericErrorMessage(queryError)}</Alert> : null}
      {data ? (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Email</TableCell>
                <TableCell>Name</TableCell>
                <TableCell>Role</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {data.items.map((u) => (
                <TableRow key={u.id}>
                  <TableCell>{u.email}</TableCell>
                  <TableCell>{u.firstName} {u.lastName}</TableCell>
                  <TableCell>{u.role}</TableCell>
                  <TableCell>{u.status}</TableCell>
                  <TableCell>
                    {isAdmin ? (
                      <Link href={`/admin/users/${u.id}`}>
                        <Button size="small">Edit</Button>
                      </Link>
                    ) : null}
                    <Button
                      size="small"
                      color="error"
                      onClick={() =>
                        void confirm('Are you sure you want to delete this user?', 'Delete Confirmation').then(
                          (confirmed) => {
                            if (confirmed) {
                              deleteMutation.mutate(u.id);
                            }
                          },
                        )
                      }
                    >
                      Delete
                    </Button>
                  </TableCell>
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
