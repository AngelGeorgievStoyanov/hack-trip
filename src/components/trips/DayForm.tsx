'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { Alert, Box, Button, CircularProgress, TextField, Typography } from '@mui/material';
import { tripApi } from '@/api/trips';
import { normalizeApiError } from '@/api/client';
import { API_ERROR_CODES } from '@/constants/api';
import { DAY_NUMBER_MAX } from '@/constants/trips';
import { zodResolver } from '@/lib/zodResolver';
import { getGenericErrorMessage } from '@/lib/errors';
import { buildTripUrl } from '@/lib/tripUrl';
import { dayCreateSchema, dayUpdateSchema } from '@/validations/trips';
import type { TripGroupDay } from '@/types';

interface DayFormProps {
  tripGroupId: number;
  day?: TripGroupDay;
  existingDays?: TripGroupDay[];
  initialDayNumber?: number;
  onOpenExistingDay?: (dayId: number) => void;
  onDone: () => void;
}

interface DayFormValues {
  dayNumber: string;
  title: string;
  description: string;
}

export function DayForm({
  tripGroupId,
  day,
  existingDays = [],
  initialDayNumber,
  onOpenExistingDay,
  onDone,
}: DayFormProps) {
  const queryClient = useQueryClient();
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const isEdit = day !== undefined;

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<DayFormValues>({
    resolver: zodResolver(isEdit ? dayUpdateSchema : dayCreateSchema),
    defaultValues: {
      dayNumber: isEdit
        ? String(day.dayNumber)
        : initialDayNumber !== undefined
          ? String(initialDayNumber)
          : '',
      title: day?.title ?? '',
      description: day?.description ?? '',
    },
  });

  const dayNumberValue = watch('dayNumber');
  const parsedDayNumber = Number(dayNumberValue);
  const hasDayNumber =
    dayNumberValue.trim() !== '' && Number.isInteger(parsedDayNumber) && parsedDayNumber > 0;
  const takenDay = hasDayNumber
    ? existingDays.find((candidate) => candidate.dayNumber === parsedDayNumber)
    : undefined;
  const takenMessage = hasDayNumber ? `Day ${parsedDayNumber} already exists.` : null;

  function stepDayNumber(delta: number): void {
    const current = hasDayNumber ? parsedDayNumber : (initialDayNumber ?? 1);
    const next = Math.min(Math.max(current + delta, 1), DAY_NUMBER_MAX);
    setValue('dayNumber', String(next), { shouldValidate: true });
  }

  async function onSubmit(values: DayFormValues): Promise<void> {
    if (!isEdit && takenDay) {
      return;
    }

    setSubmitting(true);
    setServerError(null);
    try {
      if (isEdit && day) {
        const response = await tripApi.updateDay(tripGroupId, day.id, {
          title: values.title.trim() || null,
          description: values.description.trim() || null,
        });
        queryClient.setQueryData(['trip', tripGroupId], response);
        const updatedDay = response.days.find((candidate) => candidate.id === day.id);
        router.replace(buildTripUrl(tripGroupId, updatedDay?.dayNumber ?? day.dayNumber));
        onDone();
        return;
      }
      const response = await tripApi.createDay(tripGroupId, {
        dayNumber: Number(values.dayNumber),
        title: values.title.trim() || null,
        description: values.description.trim() || null,
      });
      queryClient.setQueryData(['trip', tripGroupId], response);
      onDone();
    } catch (error) {
      const apiError = normalizeApiError(error);
      if (!isEdit && apiError.code === API_ERROR_CODES.CONFLICT) {
        setServerError(takenMessage ?? 'This day already exists.');
      } else {
        setServerError(getGenericErrorMessage(error));
      }
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Box
      component="form"
      onSubmit={handleSubmit(onSubmit)}
      sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}
    >
      <Typography variant="h6">{isEdit ? `Edit day ${day.dayNumber}` : 'Create a day'}</Typography>
      {serverError ? <Alert severity="error">{serverError}</Alert> : null}
      {!isEdit ? (
        <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
          <Button
            variant="outlined"
            onClick={() => stepDayNumber(-1)}
            aria-label="Previous day number"
          >
            -
          </Button>
          <TextField
            label="Day number"
            type="number"
            {...register('dayNumber')}
            error={!!errors.dayNumber || !!takenDay}
            helperText={errors.dayNumber?.message ?? takenMessage}
            slotProps={{ htmlInput: { min: 1, max: DAY_NUMBER_MAX } }}
          />
          <Button variant="outlined" onClick={() => stepDayNumber(1)} aria-label="Next day number">
            +
          </Button>
        </Box>
      ) : null}
      {takenDay && onOpenExistingDay ? (
        <Alert
          severity="info"
          action={
            <Button color="inherit" size="small" onClick={() => onOpenExistingDay(takenDay.id)}>
              {`Edit day ${takenDay.dayNumber}`}
            </Button>
          }
        >
          {takenMessage}
        </Alert>
      ) : null}
      <TextField
        label="Title"
        {...register('title')}
        error={!!errors.title}
        helperText={errors.title?.message}
      />
      <TextField
        label="Description"
        multiline
        minRows={2}
        {...register('description')}
        error={!!errors.description}
        helperText={errors.description?.message}
      />
      <Box sx={{ display: 'flex', gap: 1 }}>
        <Button
          type="submit"
          variant="contained"
          disabled={submitting || !!takenDay}
          startIcon={submitting ? <CircularProgress size={16} /> : undefined}
        >
          {isEdit ? 'Save' : hasDayNumber ? `Create day ${parsedDayNumber}` : 'Create day'}
        </Button>
        <Button type="button" onClick={onDone}>
          Cancel
        </Button>
      </Box>
    </Box>
  );
}
