'use client';

import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { Alert, Box, Button, CircularProgress, TextField, Typography } from '@mui/material';
import { pointApi } from '@/api/points';
import { zodResolver } from '@/lib/zodResolver';
import { getGenericErrorMessage } from '@/lib/errors';
import { pointCreateSchema } from '@/validations/points';
import { PointLocationPicker } from '@/components/maps/PointLocationPicker';
import type { TripGroupResponse, TripPoint } from '@/types';

interface PointFormProps {
  tripGroupId: number;
  dayId: number;
  point?: TripPoint;
  onDone: () => void;
}

interface PointFormValues {
  name: string;
  description: string;
  lat: string;
  lng: string;
}

const formSchema = pointCreateSchema.omit({ tripId: true });

export function PointForm({ tripGroupId, dayId, point, onDone }: PointFormProps) {
  const queryClient = useQueryClient();
  const [serverError, setServerError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const isEdit = point !== undefined;

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<PointFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: point?.name ?? '',
      description: point?.description ?? '',
      lat: point?.lat != null ? String(point.lat) : '',
      lng: point?.lng != null ? String(point.lng) : '',
    },
  });

  const lat = watch('lat');
  const lng = watch('lng');

  async function onSubmit(values: PointFormValues): Promise<void> {
    setSubmitting(true);
    setServerError(null);
    try {
      const input = {
        name: values.name,
        description: values.description || null,
        lat: Number(values.lat),
        lng: Number(values.lng),
      };
      // POST /points and PUT /points/:id both return the updated TripPoint[]
      // for the day. The cached trip response is updated by replacing the day's
      // points array with the returned array.
      const updatedPoints = isEdit && point
        ? await pointApi.updatePoint(point.id, input)
        : await pointApi.createPoint({ tripId: dayId, ...input });
      queryClient.setQueryData<TripGroupResponse>(['trip', tripGroupId], (current) =>
        current === undefined
          ? current
          : {
              ...current,
              days: current.days.map((day) =>
                day.id === dayId ? { ...day, points: updatedPoints } : day,
              ),
            },
      );
      onDone();
    } catch (error) {
      setServerError(getGenericErrorMessage(error));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Box component="form" onSubmit={handleSubmit(onSubmit)} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <Typography variant="h6">{isEdit ? 'Edit point' : 'Add point'}</Typography>
      {serverError ? <Alert severity="error">{serverError}</Alert> : null}
      <TextField label="Title" {...register('name')} error={!!errors.name} helperText={errors.name?.message} />
      <TextField label="Description" multiline minRows={2} {...register('description')} error={!!errors.description} helperText={errors.description?.message} />
      <TextField label="Latitude" {...register('lat')} error={!!errors.lat} helperText={errors.lat?.message} />
      <TextField label="Longitude" {...register('lng')} error={!!errors.lng} helperText={errors.lng?.message} />
      <PointLocationPicker
        latitude={lat}
        longitude={lng}
        onChange={(nextLatitude, nextLongitude) => {
          setValue('lat', nextLatitude, { shouldValidate: true });
          setValue('lng', nextLongitude, { shouldValidate: true });
        }}
      />
      <Box sx={{ display: 'flex', gap: 1 }}>
        <Button type="submit" variant="contained" disabled={submitting} startIcon={submitting ? <CircularProgress size={16} /> : undefined}>
          {isEdit ? 'Save' : 'Add'}
        </Button>
        <Button type="button" onClick={onDone}>Cancel</Button>
      </Box>
    </Box>
  );
}
