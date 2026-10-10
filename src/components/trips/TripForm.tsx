'use client';

import { useEffect, useRef, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { useRouter } from 'next/navigation';
import { Alert, Box, Button, CircularProgress, TextField, Typography } from '@mui/material';
import { tripApi, type TripWriteInput } from '@/api/trips';
import { SELECT_TYPE_KEYS } from '@/constants/config';
import { useSelectChoices } from '@/hooks/useSelects';
import { firstSelectValue } from '@/lib/selects';
import { DAY_NUMBER_MAX } from '@/constants/trips';
import { zodResolver } from '@/lib/zodResolver';
import { getGenericErrorMessage } from '@/lib/errors';
import { buildTripUrl } from '@/lib/tripUrl';
import { tripWriteSchema } from '@/validations/trips';
import { TripSelectField } from './TripSelectField';

/**
 * `Add Trip` (API_CONTRACT.md §8.7): `POST /trips` creates the trip group together with the
 * day being entered, so after success the frontend opens Trip Details on that day.
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
    formState: { errors },
  } = useForm<TripWriteInput>({
    resolver: zodResolver(tripWriteSchema),
    defaultValues: {
      dayNumber: 1,
      title: '',
      description: '',
      group: '',
      transport: '',
    },
  });

  const groupChoices = useSelectChoices(SELECT_TYPE_KEYS.group, watch('group'));
  const transportChoices = useSelectChoices(SELECT_TYPE_KEYS.transport, watch('transport'));

  // Runtime options arrive only after mount, so a new trip starts on the first active option.
  const defaultsApplied = useRef(false);
  useEffect(() => {
    if (defaultsApplied.current) {
      return;
    }
    if (groupChoices.length === 0 || transportChoices.length === 0) {
      return;
    }

    defaultsApplied.current = true;
    if (!getValues('group')) {
      setValue('group', firstSelectValue(groupChoices));
    }
    if (!getValues('transport')) {
      setValue('transport', firstSelectValue(transportChoices));
    }
  }, [groupChoices, transportChoices, getValues, setValue]);

  async function onSubmit(values: TripWriteInput): Promise<void> {
    setSubmitting(true);
    setServerError(null);
    try {
      const created = await tripApi.createTrip(values);
      // The backend creates exactly the day being entered; verify instead of assuming
      // a position in `days[]`, and open Trip Details on the created day.
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
       <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
         <TextField
           label="Day number"
           type="number"
           {...register('dayNumber', { valueAsNumber: true })}
           error={!!errors.dayNumber}
           helperText={errors.dayNumber?.message ?? 'The starting day number for the trip'}
           slotProps={{ htmlInput: { min: 1, max: DAY_NUMBER_MAX } }}
         />
       </Box>
       <TextField
         label="Title"
         {...register('title')}
         error={!!errors.title}
         helperText={errors.title?.message}
       />
       <TextField
         label="Description"
         multiline
         minRows={3}
         {...register('description')}
         error={!!errors.description}
         helperText={errors.description?.message}
       />
       <Controller
         control={control}
         name="group"
        render={({ field }) => (
          <TripSelectField
            name={field.name}
            label="Group"
            value={field.value}
            choices={groupChoices}
            onChange={(value) => field.onChange(value)}
            onBlur={field.onBlur}
            error={!!errors.group}
            helperText={errors.group?.message}
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
            onChange={(value) => field.onChange(value)}
            onBlur={field.onBlur}
            error={!!errors.transport}
            helperText={errors.transport?.message}
          />
        )}
      />
      <Button
        type="submit"
        variant="contained"
        disabled={submitting}
        startIcon={submitting ? <CircularProgress size={18} /> : undefined}
      >
        Create
      </Button>
    </Box>
  );
}
