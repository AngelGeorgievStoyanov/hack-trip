'use client';

import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import Link from 'next/link';
import {
  Alert,
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Divider,
  Stack,
  Typography,
} from '@mui/material';
import { adminApi } from '@/api/admin';
import { useAuth } from '@/hooks/useAuth';
import { useConfirm } from '@/components/common/ConfirmDialog';
import { getGenericErrorMessage } from '@/lib/errors';
import { ADMIN_PAGE_SIZE_DEFAULT } from '@/constants/ui';
import { hasRole } from '@/constants/roles';

function formatDate(value: string | null): string {
  if (!value) return '—';
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? '—' : date.toLocaleString();
}

export function AdminUsers() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const { confirm } = useConfirm();
  const [page, setPage] = useState(1);
  const [error, setError] = useState<string | null>(null);
  const isAdmin = hasRole(user, 'admin');
  const isManager = hasRole(user, 'manager');

  const {
    data,
    isLoading,
    error: queryError,
  } = useQuery({
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
      <Typography variant="h4" sx={{ mb: 2 }}>Users</Typography>
      {error ? <Alert severity="error" onClose={() => setError(null)}>{error}</Alert> : null}
      {isLoading ? <CircularProgress /> : null}
      {queryError ? <Alert severity="error">{getGenericErrorMessage(queryError)}</Alert> : null}
      {data ? (
        <>
          <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 320px), 1fr))', gap: 2 }}>
            {data.items.filter((u) => isAdmin || u.role !== 'admin').map((u) => {
              const canEdit = isAdmin || (isManager && u.role !== 'admin');
              return (
                <Card
                  key={u.id}
                  variant="outlined"
                  sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    minWidth: 0,
                    p: 1,
                    borderRadius: 0,
                    bgcolor: 'action.hover',
                    boxShadow: 2,
                    '& .MuiTypography-root': { overflowWrap: 'anywhere' },
                  }}
                >
                  <CardContent sx={{ display: 'flex', flexDirection: 'column', gap: 1.25, flexGrow: 1 }}>
                    <Stack direction="row" spacing={1.5} alignItems="center">
                      <Avatar sx={{ width: 48, height: 48 }}>
                        {(u.firstName?.[0] || u.email?.[0] || '?').toUpperCase()}
                      </Avatar>
                      <Box sx={{ minWidth: 0 }}>
                        <Typography variant="h6">{u.firstName} {u.lastName}</Typography>
                        <Typography variant="body2" color="text.secondary">{u.role} · {u.status}</Typography>
                      </Box>
                    </Stack>
                    <Divider />
                    <Typography variant="body2"><strong>User ID:</strong> {u.id}</Typography>
                    <Typography variant="body2"><strong>Email:</strong> {u.email}</Typography>
                    <Typography variant="body2"><strong>Email verified:</strong> {u.emailVerified ? 'Yes' : 'No'}</Typography>
                    <Typography variant="body2"><strong>Profile created:</strong> {formatDate(u.createdAt)}</Typography>
                    <Typography variant="body2"><strong>Profile last edited:</strong> {formatDate(u.updatedAt)}</Typography>
                    <Typography variant="body2"><strong>Count of logs:</strong> {u.countOfLogs ?? '—'}</Typography>
                    <Typography variant="body2"><strong>Last login:</strong> {formatDate(u.lastTimeLogin)}</Typography>
                  </CardContent>
                  <Divider />
                  <Stack direction="row" spacing={1} justifyContent="center" sx={{ p: 1 }}>
                    {canEdit ? (
                      <Button component={Link} href={`/admin/users/${u.id}`} variant="contained">
                        Edit user
                      </Button>
                    ) : null}
                    <Button
                      color="error"
                      onClick={() =>
                        void confirm('Are you sure you want to delete this user?', 'Delete Confirmation').then((confirmed) => {
                          if (confirmed) deleteMutation.mutate(u.id);
                        })
                      }
                    >
                      Delete
                    </Button>
                  </Stack>
                </Card>
              );
            })}
          </Box>
          {data.items.filter((u) => isAdmin || u.role !== 'admin').length === 0 ? <Typography>WELCOME!</Typography> : null}
        </>
      ) : null}
      {pagination && (pagination.totalPages ?? 0) > 1 ? (
        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', mt: 2 }}>
          <Button disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>Previous</Button>
          <Typography>Page {page} of {pagination.totalPages}</Typography>
          <Button disabled={page >= (pagination.totalPages ?? 1)} onClick={() => setPage((p) => p + 1)}>Next</Button>
        </Box>
      ) : null}
    </Box>
  );
}
