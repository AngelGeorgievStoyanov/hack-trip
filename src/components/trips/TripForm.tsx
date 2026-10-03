'use client';

import { useEffect, useRef, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { useRouter } from 'next/navigation';
import { Alert, Box, Button, CircularProgress, TextField, Typography } from '@mui/material';
import { tripApi, type TripWriteInput } from '@/api/trips';
import { SELECT_TYPE_KEYS } from '@/constants/config';
import { useSelectChoices } from '@/hooks/useSelects';
import { firstSelectValue } from '@/lib/selects';
import { zodResolver } from '@/lib/zodResolver';
import { getGenericErrorMessage } from '@/lib/errors';
import { tripWriteSchema } from '@/validations/trips';
import { TripSelectField } from './TripSelectField';

interface TripFormProps {
  initial?: TripWriteInput;
  tripId?: number;
}

/**
 * Create/edit trip form. Sends only the documented request fields (`title`, `description`,
 * `group`, `transport`) — never server-generated fields.
 */
export function TripForm({ initial, tripId }: TripFormProps) {
  const router = useRouter();
  const isEdit = tripId !== undefined;
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
      title: initial?.title ?? '',
      description: initial?.description ?? '',
      group: initial?.group ?? '',
      transport: initial?.transport ?? '',
    },
  });

  const groupChoices = useSelectChoices(SELECT_TYPE_KEYS.group, watch('group'));
  const transportChoices = useSelectChoices(SELECT_TYPE_KEYS.transport, watch('transport'));

  // Runtime options arrive only after mount, so a new trip starts on the first active option;
  // an existing trip keeps the values it was loaded with.
  const defaultsApplied = useRef(false);
  useEffect(() => {
    if (isEdit || defaultsApplied.current) {
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
  }, [isEdit, groupChoices, transportChoices, getValues, setValue]);

  async function onSubmit(values: TripWriteInput): Promise<void> {
    setSubmitting(true);
    setServerError(null);
    try {
      const trip = isEdit ? await tripApi.updateTrip(tripId, values) : await tripApi.createTrip(values);
      router.replace(`/trips/${trip.id}`);
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
        {isEdit ? 'Edit trip' : 'Create trip'}
      </Typography>
      {serverError ? <Alert severity="error">{serverError}</Alert> : null}
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
        {isEdit ? 'Save' : 'Create'}
      </Button>
    </Box>
  );
}
