'use client';

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { Alert, Box, Button, CircularProgress, MenuItem, TextField, Typography } from '@mui/material';
import { adminApi, type AdminUserUpdateInput } from '@/api/admin';
import { useAuth } from '@/hooks/useAuth';
import { zodResolver } from '@/lib/zodResolver';
import { getGenericErrorMessage } from '@/lib/errors';
import { adminUserUpdateSchema } from '@/validations/admin';
import type { AuthUserDto, Role, UserStatus } from '@/types';

const ROLE_OPTIONS: Role[] = ['user', 'admin', 'manager'];
const STATUS_OPTIONS: UserStatus[] = ['PENDING_VERIFICATION', 'ACTIVE', 'SUSPENDED', 'DEACTIVATED'];

// The contract exposes no single-user admin endpoint, so the target user is located in the paginated list.
async function findUserById(userId: string): Promise<AuthUserDto | null> {
  const pageSize = 100;
  const first = await adminApi.listUsers({ page: 1, pageSize });
  const inFirst = first.items.find((u) => u.id === userId);
  if (inFirst) return inFirst;

  const totalPages = first.pagination.totalPages ?? 1;
  for (let page = 2; page <= totalPages; page += 1) {
    const result = await adminApi.listUsers({ page, pageSize });
    const hit = result.items.find((u) => u.id === userId);
    if (hit) return hit;
  }
  return null;
}

export function AdminUserForm({ userId }: { userId: string }) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const [serverError, setServerError] = useState<string | null>(null);
  const isAdmin = user?.role === 'admin';

  const { data: target, isLoading, error: queryError } = useQuery({
    queryKey: ['admin', 'user', userId],
    queryFn: () => findUserById(userId),
  });

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<AdminUserUpdateInput>({
    resolver: zodResolver(adminUserUpdateSchema),
  });

  useEffect(() => {
    if (target) {
      reset({
        firstName: target.firstName,
        lastName: target.lastName,
        role: target.role,
        status: target.status,
      });
    }
  }, [target, reset]);

  const updateMutation = useMutation({
    mutationFn: (input: AdminUserUpdateInput) => adminApi.updateUser(userId, input),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
      router.push('/admin/users');
      router.refresh();
    },
    onError: (e) => setServerError(getGenericErrorMessage(e)),
  });

  const deleteMutation = useMutation({
    mutationFn: () => adminApi.deleteUser(userId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
      router.push('/admin/users');
      router.refresh();
    },
    onError: (e) => setServerError(getGenericErrorMessage(e)),
  });

  if (isLoading) {
    return <CircularProgress />;
  }

  if (queryError || !target) {
    return <Alert severity="error">User not found.</Alert>;
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <Typography variant="h4">Edit user</Typography>
      <Typography>Email: {target.email}</Typography>
      <Typography>Name: {target.firstName} {target.lastName}</Typography>
      <Typography>Role: {target.role}</Typography>
      <Typography>Status: {target.status}</Typography>
      {serverError ? <Alert severity="error" onClose={() => setServerError(null)}>{serverError}</Alert> : null}

      {isAdmin ? (
        <Box
          component="form"
          onSubmit={handleSubmit((values) => updateMutation.mutate(values))}
          sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}
        >
          <TextField
            label="First name"
            {...register('firstName')}
            error={!!errors.firstName}
            helperText={errors.firstName?.message}
          />
          <TextField
            label="Last name"
            {...register('lastName')}
            error={!!errors.lastName}
            helperText={errors.lastName?.message}
          />
          <TextField select label="Role" {...register('role')} error={!!errors.role} helperText={errors.role?.message}>
            {ROLE_OPTIONS.map((role) => (
              <MenuItem key={role} value={role}>{role}</MenuItem>
            ))}
          </TextField>
          <TextField select label="Status" {...register('status')} error={!!errors.status} helperText={errors.status?.message}>
            {STATUS_OPTIONS.map((status) => (
              <MenuItem key={status} value={status}>{status}</MenuItem>
            ))}
          </TextField>
          <Button type="submit" variant="contained" disabled={updateMutation.isPending}>
            {updateMutation.isPending ? <CircularProgress size={18} /> : 'Save'}
          </Button>
        </Box>
      ) : null}

      <Box>
        <Button color="error" disabled={deleteMutation.isPending} onClick={() => { if (window.confirm('Delete this user?')) deleteMutation.mutate(); }}>
          Delete user
        </Button>
      </Box>
    </Box>
  );
}
