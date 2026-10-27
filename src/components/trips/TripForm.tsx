'use client';

import { useEffect, useRef, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { useRouter } from 'next/navigation';
import { Alert, Box, Button, CircularProgress, TextField, Typography } from '@mui/material';
import { tripApi, type TripWriteInput } from '@/api/trips';
import { SELECT_TYPE_KEYS } from '@/constants/config';
import { useSelectChoices } from '@/hooks/useSelects';
import { firstSelectValue } from '@/lib/selects';
import {
  DAY_NUMBER_MAX,
  TRIP_DESCRIPTION_MAX_LENGTH,
  TRIP_TITLE_MAX_LENGTH,
} from '@/constants/trips';
import { zodResolver } from '@/lib/zodResolver';
import { getGenericErrorMessage } from '@/lib/errors';
import { buildTripUrl } from '@/lib/tripUrl';
import { tripWriteSchema } from '@/validations/trips';
import { TripSelectField } from './TripSelectField';

/**
 * Creates only the trip group and its first day row.
 * Images, points and map coordinates are handled separately; coordinates are sent as null for now.
 */
export function TripForm() {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const {
    control,
    register,
    handleSubmit,
    watch,
    getValues,
    setValue,
    formState: { errors, isValid },
  } = useForm<TripWriteInput>({
    resolver: zodResolver(tripWriteSchema),
    mode: 'onChange',
    defaultValues: {
      dayNumber: 1,
      title: '',
      description: '',
      price: 0,
      transport: '',
      countPeoples: 1,
      typeOfPeople: '',
      currency: '',
      destination: '',
    },
  });

  const groupChoices = useSelectChoices(SELECT_TYPE_KEYS.group, watch('typeOfPeople'));
  const transportChoices = useSelectChoices(SELECT_TYPE_KEYS.transport, watch('transport'));
  const currencyChoices = useSelectChoices(SELECT_TYPE_KEYS.currency, watch('currency'));

  // Runtime options arrive after mount; use the first active option where one is available.
  const defaultsApplied = useRef(false);
  useEffect(() => {
    if (defaultsApplied.current) {
      return;
    }
    if (groupChoices.length === 0 && transportChoices.length === 0 && currencyChoices.length === 0) {
      return;
    }

    defaultsApplied.current = true;
    if (!getValues('typeOfPeople') && groupChoices.length > 0) {
      setValue('typeOfPeople', firstSelectValue(groupChoices), { shouldValidate: true });
    }
    if (!getValues('transport') && transportChoices.length > 0) {
      setValue('transport', firstSelectValue(transportChoices), { shouldValidate: true });
    }
    if (!getValues('currency') && currencyChoices.length > 0) {
      setValue('currency', firstSelectValue(currencyChoices), { shouldValidate: true });
    }
  }, [groupChoices, transportChoices, currencyChoices, getValues, setValue]);

  async function onSubmit(values: TripWriteInput): Promise<void> {
    setSubmitting(true);
    setServerError(null);
    try {
      const created = await tripApi.createTrip(values);
      const createdDay =
        created.days.length === 1
          ? created.days[0]
          : created.days.find((day) => day.title === values.title.trim());
      router.replace(buildTripUrl(created.id, createdDay?.dayNumber));
      router.refresh();
    } catch (error) {
      setServerError(getGenericErrorMessage(error));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Box
      component="form"
      onSubmit={handleSubmit(onSubmit)}
      sx={{ display: 'flex', flexDirection: 'column', gap: 2, maxWidth: 560 }}
    >
      <Typography variant="h4" component="h1">
        Create trip
      </Typography>

      {serverError ? <Alert severity="error">{serverError}</Alert> : null}

      <TextField
        label="Day number"
        type="number"
        {...register('dayNumber', { valueAsNumber: true })}
        error={!!errors.dayNumber}
        helperText={errors.dayNumber?.message ?? 'The starting day number for the trip'}
        slotProps={{ htmlInput: { min: 1, max: DAY_NUMBER_MAX, step: 1 } }}
      />

      <TextField
        label="Title"
        {...register('title')}
        slotProps={{ htmlInput: { maxLength: TRIP_TITLE_MAX_LENGTH } }}
        error={!!errors.title}
        helperText={errors.title?.message}
      />

      <TextField
        label="Description"
        multiline
        minRows={3}
        {...register('description')}
        slotProps={{ htmlInput: { maxLength: TRIP_DESCRIPTION_MAX_LENGTH } }}
        error={!!errors.description}
        helperText={errors.description?.message}
      />

      <TextField
        label="Price"
        type="number"
        {...register('price', { valueAsNumber: true })}
        error={!!errors.price}
        helperText={errors.price?.message}
        slotProps={{ htmlInput: { min: 0, max: 1000000, step: 'any' } }}
      />

      <TextField
        label="Number of people"
        type="number"
        {...register('countPeoples', { valueAsNumber: true })}
        error={!!errors.countPeoples}
        helperText={errors.countPeoples?.message}
        slotProps={{ htmlInput: { min: 1, max: 2147483647, step: 1 } }}
      />

      <Controller
        control={control}
        name="typeOfPeople"
        render={({ field }) => (
          <TripSelectField
            name={field.name}
            label="Type of people"
            value={field.value}
            choices={groupChoices}
            onChange={field.onChange}
            onBlur={field.onBlur}
            error={!!errors.typeOfPeople}
            helperText={errors.typeOfPeople?.message}
          />
        )}
      />

      <Controller
        control={control}
        name="transport"
        render={({ field }) => (
          <TripSelectField
            name={field.name}
            label="Transport"
            value={field.value}
            choices={transportChoices}
            onChange={field.onChange}
            onBlur={field.onBlur}
            error={!!errors.transport}
            helperText={errors.transport?.message}
          />
        )}
      />

      <Controller
        control={control}
        name="currency"
        render={({ field }) => (
          <TripSelectField
            name={field.name}
            label="Currency"
            value={field.value}
            choices={currencyChoices}
            onChange={field.onChange}
            onBlur={field.onBlur}
            error={!!errors.currency}
            helperText={errors.currency?.message}
          />
        )}
      />

      <TextField
        label="Destination (optional)"
        {...register('destination')}
        slotProps={{ htmlInput: { maxLength: TRIP_TITLE_MAX_LENGTH } }}
        error={!!errors.destination}
        helperText={errors.destination?.message}
      />

      <Button
        type="submit"
        variant="contained"
        disabled={submitting || !isValid}
        startIcon={submitting ? <CircularProgress size={18} /> : undefined}
      >
        Create
      </Button>
    </Box>
  );
}
