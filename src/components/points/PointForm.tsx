'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Alert, Box, Button, CircularProgress, TextField, Typography } from '@mui/material';
import { pointApi } from '@/api/points';
import { zodResolver } from '@/lib/zodResolver';
import { getGenericErrorMessage } from '@/lib/errors';
import { pointCreateSchema } from '@/validations/points';
import { PointLocationPicker } from '@/components/maps/PointLocationPicker';
import type { TripPoint } from '@/types';

interface PointFormProps {
  dayId: number;
  point?: TripPoint;
  onDone: () => void;
}

interface PointFormValues {
  title: string;
  description: string;
  latitude: string;
  longitude: string;
}

const formSchema = pointCreateSchema.omit({ dayId: true });

export function PointForm({ dayId, point, onDone }: PointFormProps) {
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
      title: point?.title ?? '',
      description: point?.description ?? '',
      latitude: point?.latitude != null ? String(point.latitude) : '',
      longitude: point?.longitude != null ? String(point.longitude) : '',
    },
  });

  const latitude = watch('latitude');
  const longitude = watch('longitude');

  async function onSubmit(values: PointFormValues): Promise<void> {
    setSubmitting(true);
    setServerError(null);
    try {
      const input = {
        title: values.title,
        description: values.description || null,
        latitude: Number(values.latitude),
        longitude: Number(values.longitude),
      };
      if (isEdit && point) {
        await pointApi.updatePoint(point.id, input);
      } else {
        await pointApi.createPoint({ dayId, ...input });
      }
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
      <TextField label="Title" {...register('title')} error={!!errors.title} helperText={errors.title?.message} />
      <TextField label="Description" multiline minRows={2} {...register('description')} error={!!errors.description} helperText={errors.description?.message} />
      <TextField label="Latitude" {...register('latitude')} error={!!errors.latitude} helperText={errors.latitude?.message} />
      <TextField label="Longitude" {...register('longitude')} error={!!errors.longitude} helperText={errors.longitude?.message} />
      <PointLocationPicker
        latitude={latitude}
        longitude={longitude}
        onChange={(nextLatitude, nextLongitude) => {
          setValue('latitude', nextLatitude, { shouldValidate: true });
          setValue('longitude', nextLongitude, { shouldValidate: true });
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
