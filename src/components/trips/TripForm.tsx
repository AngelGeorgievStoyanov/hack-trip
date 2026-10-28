'use client';

import { useEffect, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { useRouter } from 'next/navigation';
import {
  Alert,
  Box,
  Button,
  ButtonGroup,
  CircularProgress,
  TextField,
  Typography,
} from '@mui/material';
import { AddIcon, RemoveIcon } from '@/constants/icons';
import { tripApi, type TripWriteInput } from '@/api/trips';
import { SELECT_TYPE_KEYS } from '@/constants/config';
import { useSelectChoices } from '@/hooks/useSelects';
import { firstSelectValue, type SelectChoice } from '@/lib/selects';
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
import ImageUploadField from './ImageUploadField';
import { TripLocationPicker } from '@/components/maps/TripLocationPicker';

function preferredSelectValue(choices: SelectChoice[], preferred: string): string {
  const normalize = (value: string) => value.toLowerCase().replace(/[\\s_-]/g, '');
  const expected = normalize(preferred);
  return (
    choices.find(
      (choice) =>
        normalize(choice.value) === expected || normalize(choice.label) === expected,
    )?.value ?? firstSelectValue(choices)
  );
}

/**
 * Creates only the trip group and its first day row.
 * Images, points and map coordinates are handled separately; coordinates are sent as null for now.
 */
export function TripForm() {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [latitude, setLatitude] = useState('');
  const [longitude, setLongitude] = useState('');

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

  // Prefer the requested defaults only when the active backend config contains them.
  // Otherwise, fall back to the first active backend option and submit its canonical key.
  useEffect(() => {
    if (!getValues('typeOfPeople') && groupChoices.length > 0) {
      setValue('typeOfPeople', preferredSelectValue(groupChoices, 'Another type'), {
        shouldValidate: true,
      });
    }
  }, [groupChoices, getValues, setValue]);

  useEffect(() => {
    if (!getValues('transport') && transportChoices.length > 0) {
      setValue('transport', preferredSelectValue(transportChoices, 'Another type'), {
        shouldValidate: true,
      });
    }
  }, [transportChoices, getValues, setValue]);

  useEffect(() => {
    if (!getValues('currency') && currencyChoices.length > 0) {
      setValue('currency', preferredSelectValue(currencyChoices, 'EUR'), {
        shouldValidate: true,
      });
    }
  }, [currencyChoices, getValues, setValue]);


  function changeDayNumber(delta: number): void {
    const current = getValues('dayNumber');
    const next = Math.min(DAY_NUMBER_MAX, Math.max(1, current + delta));
    setValue('dayNumber', next, { shouldDirty: true, shouldValidate: true });
  }

  async function onSubmit(values: TripWriteInput): Promise<void> {
    setSubmitting(true);
    setServerError(null);
    try {
      const created = await tripApi.createTrip(values, {
        lat: latitude === '' ? null : Number(latitude),
        lng: longitude === '' ? null : Number(longitude),
      });
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
      sx={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        boxSizing: 'border-box',
        width: 'min(100%, 620px)',
        mx: 'auto',
        height: 'fit-content',
        minWidth: 0,
        p: { xs: 2, sm: '30px' },
        mb: '5px',
        backgroundColor: '#eee7e79e',
        boxShadow: '3px 2px 5px black',
        border: 'solid 1px',
        borderRadius: 0,
        gap: 1,
        '& .MuiFormControl-root': {
          m: '4px',
          width: '100%',
          minWidth: 0,
        },
        '& .MuiButton-root': {
          m: 1,
        },
        '@media (max-width: 600px)': {
          p: 2,
        },
      }}
    >
      <Box sx={{ mx: '4px', mb: 1, minWidth: 0 }}>
        <TripLocationPicker
          latitude={latitude}
          longitude={longitude}
          onChange={(nextLatitude, nextLongitude) => {
            setLatitude(nextLatitude);
            setLongitude(nextLongitude);
          }}
        />
      </Box>

      <Typography
        variant="h5"
        component="h1"
        sx={{ m: '10px auto', textTransform: 'uppercase', textAlign: 'center' }}
      >
        Create trip
      </Typography>

      {serverError ? <Alert severity="error">{serverError}</Alert> : null}

      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap', m: '4px' }}>
        <TextField
          label="Day"
          type="number"
          size="small"
          {...register('dayNumber', { valueAsNumber: true })}
          error={!!errors.dayNumber}
          helperText={errors.dayNumber?.message}
          slotProps={{ htmlInput: { min: 1, max: DAY_NUMBER_MAX, step: 1, style: { textAlign: 'center' } } }}
          sx={{ width: '76px !important', '& .MuiInputBase-root': { pointerEvents: 'none' } }}
        />
        <ButtonGroup
          size="small"
          aria-label="Change day number"
          sx={{
            ml: 0.5,
            mr: 0,
            my: 0,
            alignSelf: 'center',
            '& .MuiButton-root': {
              minWidth: 40,
              width: 40,
              height: 36,
              p: 0,
              m: 0,
              '&:hover': { backgroundColor: 'primary.dark' },
            },
          }}
        >
          <Button
            type="button"
            aria-label="Decrease day number"
            disabled={watch('dayNumber') <= 1}
            onClick={() => changeDayNumber(-1)}
          >
            <RemoveIcon fontSize="small" />
          </Button>
          <Button
            type="button"
            aria-label="Increase day number"
            disabled={watch('dayNumber') >= DAY_NUMBER_MAX}
            onClick={() => changeDayNumber(1)}
          >
            <AddIcon fontSize="small" />
          </Button>
        </ButtonGroup>
      </Box>

      <TextField
        label="Title"
        {...register('title')}
        slotProps={{ htmlInput: { maxLength: TRIP_TITLE_MAX_LENGTH } }}
        error={!!errors.title}
        helperText={errors.title?.message}
      />

      <Box
        sx={{
          display: 'flex',
          alignItems: 'flex-start',
          gap: 1,
          width: '100%',
          minWidth: 0,
          '& > *': { minWidth: 0, flex: '1 1 0' },
          '@media (max-width: 480px)': { flexDirection: 'column' },
        }}
      >
        <TextField
          label="Price"
          type="number"
          {...register('price', { valueAsNumber: true })}
          error={!!errors.price}
          helperText={errors.price?.message}
          slotProps={{ htmlInput: { min: 0, max: 1000000, step: 'any' } }}
          sx={{ flex: 1 }}
        />

        <Controller
          control={control}
          name="currency"
          render={({ field }) => (
            <Box sx={{ flex: '0 0 150px', width: '150px', minWidth: 0, '@media (max-width: 480px)': { flex: '1 1 auto', width: '100%' } }}>
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
            </Box>
          )}
        />
      </Box>

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

      <TextField
        label="Number of people"
        type="number"
        {...register('countPeoples', { valueAsNumber: true })}
        error={!!errors.countPeoples}
        helperText={errors.countPeoples?.message}
        slotProps={{ htmlInput: { min: 1, max: 1000, step: 1 } }}
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

      <TextField
        label="Destination (optional)"
        {...register('destination')}
        slotProps={{ htmlInput: { maxLength: TRIP_TITLE_MAX_LENGTH } }}
        error={!!errors.destination}
        helperText={errors.destination?.message}
      />

      <Box sx={{ mt: 1, mx: '4px', minWidth: 0 }}>
        <ImageUploadField files={selectedFiles} setFiles={setSelectedFiles} />
      </Box>

      <TextField
        label="Description"
        multiline
        minRows={3}
        {...register('description')}
        slotProps={{ htmlInput: { maxLength: TRIP_DESCRIPTION_MAX_LENGTH } }}
        error={!!errors.description}
        helperText={errors.description?.message}
      />

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: 'repeat(2, minmax(0, 1fr))', sm: 'repeat(4, minmax(0, 1fr))' },
          gap: 1,
          width: '100%',
          mt: 1,
          '& .MuiButton-root': {
            m: 0,
            minWidth: 0,
            minHeight: 36,
            px: 1,
            py: 0.75,
            fontSize: { xs: '0.65rem', sm: '0.7rem', md: '0.75rem' },
            lineHeight: 1.2,
            whiteSpace: 'normal',
            overflowWrap: 'anywhere',
            textTransform: 'uppercase',
          },
        }}
      >
        <Button
          type="submit"
          variant="contained"
          disabled={submitting || !isValid}
          startIcon={submitting ? <CircularProgress size={18} /> : undefined}
          sx={{ '&:hover': { backgroundColor: '#4daf30' } }}
        >
          Add trip
        </Button>
        <Button
          type="button"
          variant="contained"
          sx={{ '&:hover': { backgroundColor: '#4daf30' } }}
        >
          Add next day trip
        </Button>
        <Button
          type="button"
          variant="contained"
          sx={{
            color: 'black',
            backgroundColor: 'rgb(194 194 224)',
            '&:hover': { color: 'white', backgroundColor: 'rgb(194 194 224)' },
          }}
        >
          Add point's for the trip
        </Button>
        <Button
          type="button"
          variant="contained"
          sx={{ '&:hover': { backgroundColor: '#4daf30' } }}
        >
          Back
        </Button>
      </Box>
    </Box>
  );
}
