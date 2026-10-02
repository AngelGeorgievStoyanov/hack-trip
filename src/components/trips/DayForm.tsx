'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Alert, Box, Button, CircularProgress, TextField, Typography } from '@mui/material';
import { tripApi } from '@/api/trips';
import { zodResolver } from '@/lib/zodResolver';
import { getGenericErrorMessage } from '@/lib/errors';
import { dayCreateSchema, dayUpdateSchema } from '@/validations/trips';
import type { TripDay } from '@/types';

interface DayFormProps {
  tripId: number;
  day?: TripDay;
  onDone: () => void;
}

interface DayFormValues {
  dayNumber: string;
  title: string;
  description: string;
}

export function DayForm({ tripId, day, onDone }: DayFormProps) {
  const [serverError, setServerError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const isEdit = day !== undefined;

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<DayFormValues>({
    resolver: zodResolver(isEdit ? dayUpdateSchema.pick({ title: true }) : dayCreateSchema),
    defaultValues: {
      dayNumber: isEdit ? String(day.day) : '',
      title: day?.title ?? '',
      description: '',
    },
  });

  async function onSubmit(values: DayFormValues): Promise<void> {
    setSubmitting(true);
    setServerError(null);
    try {
      if (isEdit && day) {
        await tripApi.updateDay(tripId, day.id, { title: values.title.trim() || null });
      } else {
        await tripApi.createDay(tripId, {
          dayNumber: values.dayNumber.trim() ? Number(values.dayNumber) : undefined,
          title: values.title.trim() || null,
          description: values.description.trim() || null,
        });
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
      <Typography variant="h6">{isEdit ? `Edit day ${day.day}` : 'Add day'}</Typography>
      {serverError ? <Alert severity="error">{serverError}</Alert> : null}
      {!isEdit ? <TextField label="Day number (optional)" {...register('dayNumber')} error={!!errors.dayNumber} helperText={errors.dayNumber?.message} /> : null}
      <TextField label="Title" {...register('title')} error={!!errors.title} helperText={errors.title?.message} />
      {!isEdit ? <TextField label="Description" multiline minRows={2} {...register('description')} error={!!errors.description} helperText={errors.description?.message} /> : null}
      <Box sx={{ display: 'flex', gap: 1 }}>
        <Button type="submit" variant="contained" disabled={submitting} startIcon={submitting ? <CircularProgress size={16} /> : undefined}>
          {isEdit ? 'Save' : 'Add'}
        </Button>
        <Button type="button" onClick={onDone}>Cancel</Button>
      </Box>
    </Box>
  );
}

