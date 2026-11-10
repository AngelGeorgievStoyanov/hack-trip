'use client';

import { useEffect, useState } from 'react';
import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded';
import { z } from 'zod';
import { Controller, useForm } from 'react-hook-form';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  FormControlLabel,
  MenuItem,
  Switch,
  TextField,
  Typography,
} from '@mui/material';
import { adminApi, type AdminUserUpdateInput } from '@/api/admin';
import { useAuth } from '@/hooks/useAuth';
import { useConfirm } from '@/components/common/ConfirmDialog';
import { zodResolver } from '@/lib/zodResolver';
import { getGenericErrorMessage } from '@/lib/errors';
import { ADMIN_PAGE_SIZE_MAX } from '@/constants/ui';
import { adminUserUpdateSchema } from '@/validations/admin';
import { PasswordField } from '@/components/common/PasswordField';
import { PasswordRequirements } from '@/components/common/PasswordRequirements';
import { hasRole } from '@/constants/roles';
import type { AuthUserDto, Role, UserStatus } from '@/types';

const ROLE_OPTIONS: Role[] = ['user', 'admin', 'manager'];
const STATUS_OPTIONS: UserStatus[] = ['PENDING_VERIFICATION', 'ACTIVE', 'SUSPENDED', 'DEACTIVATED'];

const adminUserFormSchema = adminUserUpdateSchema
  .extend({
    confirmPassword: z.preprocess(
      (value) => (value === '' ? undefined : value),
      z.string().optional(),
    ),
  })
  .refine(
    (values) =>
      values.password === undefined
        ? values.confirmPassword === undefined
        : values.password === values.confirmPassword,
    { path: ['confirmPassword'], message: 'Passwords must match.' },
  );
type AdminUserFormValues = z.infer<typeof adminUserFormSchema>;

async function findUserById(userId: string): Promise<AuthUserDto | null> {
  const pageSize = ADMIN_PAGE_SIZE_MAX;
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
  const { confirm } = useConfirm();
  const [serverError, setServerError] = useState<string | null>(null);
  const [passwordExpanded, setPasswordExpanded] = useState(false);
  const isAdmin = hasRole(user, 'admin');
  const isManager = hasRole(user, 'manager');

  const {
    data: target,
    isLoading,
    error: queryError,
  } = useQuery({
    queryKey: ['admin', 'user', userId],
    queryFn: () => findUserById(userId),
  });

  const {
    register,
    control,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<AdminUserFormValues>({
    resolver: zodResolver<AdminUserFormValues>(adminUserFormSchema),
  });

  useEffect(() => {
    if (target) {
      reset({
        firstName: target.firstName,
        lastName: target.lastName,
        emailVerified: target.emailVerified,
        ...(isAdmin ? { email: target.email, role: target.role } : {}),
        status: target.status,
      });
    }
  }, [target, reset, isAdmin]);

  const newPassword = watch('password') ?? '';

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

  if (isLoading) return <CircularProgress />;
  if (queryError || !target) return <Alert severity="error">User not found.</Alert>;
  if (!isAdmin && (!isManager || target.role !== 'user')) {
    return <Alert severity="error">You are not allowed to edit this user.</Alert>;
  }

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        gap: 2,
        width: '100%',
        maxWidth: 760,
        mx: 'auto',
        p: { xs: 2, sm: 3 },
        border: 1,
        borderColor: 'divider',
        borderRadius: 2,
        bgcolor: 'background.paper',
        boxShadow: 2,
      }}
    >
      <Typography variant="h4">Edit user</Typography>
      <Typography>Email: {target.email}</Typography>
      <Typography>
        Name: {target.firstName} {target.lastName}
      </Typography>
      <Typography>Role: {target.role}</Typography>
      <Typography>Status: {target.status}</Typography>
      {serverError ? (
        <Alert severity="error" onClose={() => setServerError(null)}>
          {serverError}
        </Alert>
      ) : null}

      <Box
        component="form"
        onSubmit={handleSubmit((values) => {
          if (isAdmin) {
            const { confirmPassword: _confirmPassword, ...input } = values;
            updateMutation.mutate(input);
            return;
          }

          const managerInput: AdminUserUpdateInput = {
            ...(values.firstName !== undefined ? { firstName: values.firstName } : {}),
            ...(values.lastName !== undefined ? { lastName: values.lastName } : {}),
            ...(values.status !== undefined ? { status: values.status } : {}),
            ...(values.emailVerified !== undefined ? { emailVerified: values.emailVerified } : {}),
          };
          updateMutation.mutate(managerInput);
        })}
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
        {isAdmin ? (
          <TextField
            label="Email"
            type="email"
            {...register('email')}
            error={!!errors.email}
            helperText={errors.email?.message}
          />
        ) : null}
        <Controller
          name="emailVerified"
          control={control}
          render={({ field }) => (
            <FormControlLabel
              label="Email verified"
              control={
                <Switch
                  checked={field.value ?? false}
                  onChange={(_, checked) => field.onChange(checked)}
                />
              }
            />
          )}
        />
        {isAdmin ? (
          <Controller
            name="role"
            control={control}
            defaultValue={target.role}
            render={({ field }) => (
              <TextField
                select
                label="Role"
                {...field}
                value={field.value ?? target.role}
                error={!!errors.role}
                helperText={errors.role?.message}
              >
                {ROLE_OPTIONS.map((role) => (
                  <MenuItem key={role} value={role}>
                    {role}
                  </MenuItem>
                ))}
              </TextField>
            )}
          />
        ) : null}
        {isAdmin ? (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            <Button
              type="button"
              variant="outlined"
              onClick={() => {
                setPasswordExpanded((expanded) => {
                  if (expanded) {
                    setValue('password', undefined, { shouldValidate: true });
                    setValue('confirmPassword', undefined, { shouldValidate: true });
                  }
                  return !expanded;
                });
              }}
            >
              {passwordExpanded ? 'Hide password fields' : 'Change user password'}
            </Button>
            {passwordExpanded ? (
              <>
                <PasswordField
                  label="New password"
                  registration={register('password')}
                  error={!!errors.password}
                  helperText={
                    errors.password?.message ??
                    'Create a password that meets all requirements below.'
                  }
                />
                <PasswordRequirements password={newPassword} />
                <PasswordField
                  label="Confirm password"
                  registration={register('confirmPassword')}
                  error={!!errors.confirmPassword}
                  helperText={errors.confirmPassword?.message ?? ' '}
                />
              </>
            ) : null}
          </Box>
        ) : null}
        <TextField
          select
          label="Status"
          {...register('status')}
          error={!!errors.status}
          helperText={errors.status?.message}
        >
          {STATUS_OPTIONS.map((status) => (
            <MenuItem key={status} value={status}>
              {status}
            </MenuItem>
          ))}
        </TextField>
        <Button type="submit" variant="contained" disabled={updateMutation.isPending}>
          {updateMutation.isPending ? <CircularProgress size={18} /> : 'Save'}
        </Button>
      </Box>

      <Box>
        <Button
          color="error"
          disabled={deleteMutation.isPending}
          onClick={() =>
            void confirm('Are you sure you want to delete this user?', 'Delete Confirmation').then(
              (confirmed) => {
                if (confirmed) deleteMutation.mutate();
              },
            )
          }
        >
          Delete user
        </Button>
      </Box>

      <Button
        variant="outlined"
        startIcon={<ArrowBackRoundedIcon />}
        onClick={() => router.push('/admin/users')}
        sx={{ alignSelf: 'flex-start', mt: 1 }}
      >
        Back
      </Button>
    </Box>
  );
}
