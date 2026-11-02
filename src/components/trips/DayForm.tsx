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
import { SELECT_TYPE_KEYS } from '@/constants/config';
import { useSelectChoices } from '@/hooks/useSelects';
import { firstSelectValue } from '@/lib/selects';
import { zodResolver } from '@/lib/zodResolver';
import { getGenericErrorMessage } from '@/lib/errors';
import { buildTripUrl } from '@/lib/tripUrl';
import { dayCreateSchema } from '@/validations/trips';
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
  const transportChoices = useSelectChoices(SELECT_TYPE_KEYS.transport, day?.transport.key);
  const groupChoices = useSelectChoices(SELECT_TYPE_KEYS.group, day?.group.key);
  const currencyChoices = useSelectChoices(SELECT_TYPE_KEYS.currency, day?.currency?.code ?? undefined);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<DayFormValues>({
    resolver: zodResolver(dayCreateSchema),
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
          dayNumber: day.dayNumber,
          title: values.title.trim(),
          description: typeof values.description === 'string' ? values.description.trim() || null : null,
          price: day.price ?? 0,
          transport: day.transport.key || firstSelectValue(transportChoices),
          countPeoples: day.countPeoples,
          typeOfPeople: day.group.key || firstSelectValue(groupChoices),
          currency: day.currency?.code || firstSelectValue(currencyChoices),
          destination: day.destination,
          lat: day.lat,
          lng: day.lng,
        });
        queryClient.setQueryData(['trip', tripGroupId], response);
        const updatedDay = response.days.find((candidate) => candidate.id === day.id);
        router.replace(buildTripUrl(tripGroupId, updatedDay?.dayNumber ?? day.dayNumber));
        onDone();
        return;
      }
      const sourceDay = [...existingDays].sort((a, b) => b.dayNumber - a.dayNumber)[0];
      const response = await tripApi.createDay(
        tripGroupId,
        {
          dayNumber: Number(values.dayNumber),
          title: values.title.trim(),
          description: typeof values.description === 'string' ? values.description.trim() || null : null,
          price: sourceDay?.price ?? 0,
          transport: sourceDay?.transport.key || firstSelectValue(transportChoices),
          countPeoples: sourceDay?.countPeoples ?? 1,
          typeOfPeople: sourceDay?.group.key || firstSelectValue(groupChoices),
          currency: sourceDay?.currency?.code || firstSelectValue(currencyChoices),
          destination: sourceDay?.destination ?? undefined,
        },
        {
          lat: sourceDay?.lat ?? null,
          lng: sourceDay?.lng ?? null,
        },
      );
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
