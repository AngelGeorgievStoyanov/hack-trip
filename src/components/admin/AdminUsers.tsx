'use client';

import { useState } from 'react';
import PersonOutlineRoundedIcon from '@mui/icons-material/PersonOutlineRounded';
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
import { ImageLightbox } from '@/components/images/ImageLightbox';
import type { ImageDto } from '@/types';

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
  const [failedThumbnailIds, setFailedThumbnailIds] = useState<Set<string>>(() => new Set());
  const [failedProfileImageIds, setFailedProfileImageIds] = useState<Set<string>>(() => new Set());
  const [preview, setPreview] = useState<{ image: ImageDto; alt: string } | null>(null);
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
  const visibleUsers =
    data?.items.filter((item) => isAdmin || (isManager && item.role === 'user')) ?? [];

  return (
    <Box>
      <Typography variant="h4" sx={{ mb: 2 }}>
        Users
      </Typography>
      {error ? (
        <Alert severity="error" onClose={() => setError(null)}>
          {error}
        </Alert>
      ) : null}
      {isLoading ? <CircularProgress /> : null}
      {queryError ? <Alert severity="error">{getGenericErrorMessage(queryError)}</Alert> : null}
      {data ? (
        <>
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 320px), 1fr))',
              gap: 2,
            }}
          >
            {visibleUsers.map((u) => {
              const canManage = isAdmin || (isManager && u.role === 'user');
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
                  <CardContent
                    sx={{ display: 'flex', flexDirection: 'column', gap: 1.25, flexGrow: 1 }}
                  >
                    <Stack direction="row" spacing={1.5} alignItems="center">
                      <Avatar
                        src={
                          failedProfileImageIds.has(u.id)
                            ? undefined
                            : failedThumbnailIds.has(u.id)
                              ? u.profileImage?.url || undefined
                              : u.profileImage?.thumbnailUrl || u.profileImage?.url || undefined
                        }
                        alt={`${u.firstName} ${u.lastName}`.trim() || 'User profile'}
                        onClick={() => {
                          if (u.profileImage) {
                            setPreview({
                              image: u.profileImage,
                              alt: `${u.firstName} ${u.lastName}`.trim() || 'User profile',
                            });
                          }
                        }}
                        onError={() => {
                          if (
                            !failedThumbnailIds.has(u.id) &&
                            u.profileImage?.thumbnailUrl &&
                            u.profileImage?.url
                          ) {
                            setFailedThumbnailIds((current) => new Set(current).add(u.id));
                          } else {
                            setFailedProfileImageIds((current) => new Set(current).add(u.id));
                          }
                        }}
                        sx={{ width: 88, height: 88, bgcolor: 'action.selected', flexShrink: 0, cursor: u.profileImage ? 'zoom-in' : 'default' }}
                      >
                        <PersonOutlineRoundedIcon fontSize="large" />
                      </Avatar>
                      <Box sx={{ minWidth: 0 }}>
                        <Typography variant="h6">
                          {u.firstName} {u.lastName}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {u.role} · {u.status}
                        </Typography>
                      </Box>
                    </Stack>
                    <Divider />
                    <Typography variant="body2">
                      <strong>User ID:</strong> {u.id}
                    </Typography>
                    <Typography variant="body2">
                      <strong>Email:</strong> {u.email}
                    </Typography>
                    <Typography variant="body2">
                      <strong>Email verified:</strong> {u.emailVerified ? 'Yes' : 'No'}
                    </Typography>
                    <Typography variant="body2">
                      <strong>Profile created:</strong> {formatDate(u.createdAt)}
                    </Typography>
                    <Typography variant="body2">
                      <strong>Profile last edited:</strong> {formatDate(u.updatedAt)}
                    </Typography>
                    <Typography variant="body2">
                      <strong>Count of logs:</strong> {u.countOfLogs ?? '—'}
                    </Typography>
                    <Typography variant="body2">
                      <strong>Last login:</strong> {formatDate(u.lastTimeLogin)}
                    </Typography>
                  </CardContent>
                  <Divider />
                  <Stack direction="row" spacing={1} justifyContent="center" sx={{ p: 1 }}>
                    {canManage ? (
                      <Button component={Link} href={`/admin/users/${u.id}`} variant="contained">
                        Edit user
                      </Button>
                    ) : null}
                    {canManage ? (
                      <Button
                        color="error"
                        onClick={() =>
                          void confirm(
                            'Are you sure you want to delete this user?',
                            'Delete Confirmation',
                          ).then((confirmed) => {
                            if (confirmed) deleteMutation.mutate(u.id);
                          })
                        }
                      >
                        Delete
                      </Button>
                    ) : null}
                  </Stack>
                </Card>
              );
            })}
          </Box>
          {visibleUsers.length === 0 ? <Typography>WELCOME!</Typography> : null}
        </>
      ) : null}
      <ImageLightbox
        images={preview ? [preview.image] : []}
        index={preview ? 0 : null}
        alt={preview?.alt ?? 'User profile'}
        onIndexChange={() => undefined}
        onClose={() => setPreview(null)}
      />
      {pagination && (pagination.totalPages ?? 0) > 1 ? (
        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', mt: 2 }}>
          <Button disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
            Previous
          </Button>
          <Typography>
            Page {page} of {pagination.totalPages}
          </Typography>
          <Button
            disabled={page >= (pagination.totalPages ?? 1)}
            onClick={() => setPage((p) => p + 1)}
          >
            Next
          </Button>
        </Box>
      ) : null}
    </Box>
  );
}
