'use client';

import { useEffect, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  Alert,
  Box,
  Button,
  ButtonGroup,
  CircularProgress,
  TextField,
  Typography,
  Snackbar,
} from '@mui/material';
import { AddIcon, RemoveIcon } from '@/constants/icons';
import { tripApi, type TripWriteInput } from '@/api/trips';
import type { TripGroupResponse } from '@/types';
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
import { MAX_CONCURRENT_IMAGE_UPLOADS } from '@/constants/images';

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
 * Creates the trip and first day; selected map coordinates are included in the create request.
 */
export function TripForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const urlTripGroupId = Number(searchParams.get('tripGroupId')) || null;
  const [serverError, setServerError] = useState<string | null>(null);
  const [missingDays, setMissingDays] = useState<number[]>([]);
  const [existingTrip, setExistingTrip] = useState<TripGroupResponse | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [createdTrip, setCreatedTrip] = useState<TripGroupResponse | null>(null);
  const [createdPointTripId, setCreatedPointTripId] = useState<number | null>(null);
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
  const currentDayNumber = watch('dayNumber');
  const isLoadingExistingTrip = Boolean(urlTripGroupId && !existingTrip);
  const isDayNumberOccupied = Boolean(
    existingTrip?.days.some((day) => day.dayNumber === currentDayNumber),
  );

  useEffect(() => {
    if (!urlTripGroupId || !Number.isInteger(urlTripGroupId) || urlTripGroupId < 1) return;
    let cancelled = false;
    tripApi.getTrip(urlTripGroupId)
      .then((trip) => {
        if (cancelled) return;
        setExistingTrip(trip);
        const sortedDays = [...trip.days].sort((a, b) => a.dayNumber - b.dayNumber);
        const latestDay = sortedDays[sortedDays.length - 1];
        const missingDayNumbers: number[] = [];
        for (let index = 1; index < sortedDays.length; index += 1) {
          for (
            let dayNumber = sortedDays[index - 1].dayNumber + 1;
            dayNumber < sortedDays[index].dayNumber;
            dayNumber += 1
          ) {
            missingDayNumbers.push(dayNumber);
          }
        }
        setMissingDays(missingDayNumbers);
        if (latestDay) {
          setValue('dayNumber', latestDay.dayNumber + 1, { shouldValidate: true });
          setValue('transport', latestDay.transport.key, { shouldValidate: true });
          setValue('typeOfPeople', latestDay.group.key, { shouldValidate: true });
          setValue('currency', latestDay.currency?.code ?? '', { shouldValidate: true });
        }
      })
      .catch((error) => {
        if (!cancelled) setServerError(getGenericErrorMessage(error));
      });
    return () => { cancelled = true; };
  }, [urlTripGroupId, setValue]);

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


  function validateDayNumber(dayNumber: number): boolean {
    const occupied = Boolean(
      existingTrip?.days.some((day) => day.dayNumber === dayNumber),
    );
    setServerError(occupied ? `Day ${dayNumber} already exists!` : null);
    return !occupied;
  }

  function changeDayNumber(delta: number): void {
    const current = getValues('dayNumber');
    const next = Math.min(DAY_NUMBER_MAX, Math.max(1, current + delta));
    setValue('dayNumber', next, { shouldDirty: true, shouldValidate: true });
    validateDayNumber(next);
  }

  function navigateToCreatedTrip(created: TripGroupResponse): void {
    const createdDay = created.days.find((day) => day.dayNumber === getValues('dayNumber'));
    router.replace(buildTripUrl(created.id, createdDay?.dayNumber));
    router.refresh();
  }

  function navigateToCreatedPoint(created: TripGroupResponse, tripId: number): void {
    router.replace(`/trips/create/points?tripGroupId=${created.id}&tripId=${tripId}`);
    router.refresh();
  }

  async function uploadPendingImages(
    created: TripGroupResponse,
    files: File[],
    stayOnForm = false,
    destinationTripId: number | null = createdPointTripId,
  ): Promise<boolean> {
    const createdDay = created.days.find((day) => day.dayNumber === getValues('dayNumber'));

    if (!createdDay) {
      setServerError('The trip was created, but its day could not be identified.');
      return false;
    }

    setServerError(null);
    const failedFiles: File[] = [];
    const failedByIndex = files.map(() => false);
      let nextFileIndex = 0;

      const uploadWorker = async (): Promise<void> => {
        while (nextFileIndex < files.length) {
          const fileIndex = nextFileIndex;
          nextFileIndex += 1;

          try {
            await tripApi.uploadDayImage(created.id, createdDay.id, files[fileIndex]);
          } catch {
            failedByIndex[fileIndex] = true;
          }
        }
      };

      const workerCount = Math.min(MAX_CONCURRENT_IMAGE_UPLOADS, files.length);
      await Promise.all(
        Array.from({ length: workerCount }, () => uploadWorker()),
      );

      failedFiles.push(...files.filter((_, index) => failedByIndex[index]));

      setSelectedFiles(failedFiles);
      if (failedFiles.length > 0) {
        setServerError(
          `${failedFiles.length} image upload(s) failed. Select the same action again to retry.`,
        );
        return false;
      }

      if (stayOnForm) return true;
      if (destinationTripId !== null) {
        navigateToCreatedPoint(created, destinationTripId);
      } else {
        navigateToCreatedTrip(created);
      }
    return true;
  }

  async function onSubmit(
    values: TripWriteInput,
    intent: 'add-trip' | 'add-next-day' | 'add-point' = 'add-trip',
  ): Promise<void> {
    if (isLoadingExistingTrip) return;

    if (createdTrip) {
      await uploadPendingImages(createdTrip, selectedFiles, false, createdPointTripId);
      return;
    }

    if (!validateDayNumber(values.dayNumber)) return;

    setSubmitting(true);
    setServerError(null);
    try {
      const tripGroupId = urlTripGroupId ?? existingTrip?.id ?? null;
      const coordinates = {
        lat: latitude === '' ? null : Number(latitude),
        lng: longitude === '' ? null : Number(longitude),
      };
      const created = tripGroupId
        ? await tripApi.createDay(tripGroupId, values, coordinates)
        : await tripApi.createTrip(values, coordinates);

      if (intent === 'add-next-day') {
        setExistingTrip(created);
        const createdDay = created.days.find((day) => day.dayNumber === values.dayNumber);
        if (createdDay && selectedFiles.length > 0) {
          const uploadsSucceeded = await uploadPendingImages(created, selectedFiles, true);
          if (!uploadsSucceeded) {
            setCreatedTrip(created);
            return;
          }
        }
        const latestDay = [...created.days].sort((a, b) => b.dayNumber - a.dayNumber)[0];
        const nextDayNumber = latestDay ? latestDay.dayNumber + 1 : values.dayNumber + 1;
        setValue('dayNumber', nextDayNumber, { shouldValidate: true });
        setValue('title', '');
        setValue('description', '');
        setValue('price', 0);
        setValue('countPeoples', latestDay?.countPeoples ?? values.countPeoples);
        if (latestDay) {
          setValue('transport', latestDay.transport.key, { shouldValidate: true });
          setValue('typeOfPeople', latestDay.group.key, { shouldValidate: true });
          setValue('currency', latestDay.currency?.code ?? '', { shouldValidate: true });
        }
        setValue('destination', '');
        setLatitude('');
        setLongitude('');
        setSelectedFiles([]);
        setCreatedTrip(null);
        setCreatedPointTripId(null);
        setServerError(null);
        if (!urlTripGroupId) router.replace(`/trips/create?tripGroupId=${created.id}`);
        setExistingTrip(created);
        return;
      }

      const createdDay = created.days.find((day) => day.dayNumber === values.dayNumber);
      if (intent === 'add-point') {
        if (!createdDay) {
          setServerError('The trip was created, but its new Trip ID could not be identified.');
          setCreatedTrip(created);
          return;
        }

        setCreatedTrip(created);
        setCreatedPointTripId(createdDay.id);
        if (selectedFiles.length === 0) {
          navigateToCreatedPoint(created, createdDay.id);
          return;
        }
        await uploadPendingImages(created, selectedFiles, false, createdDay.id);
        return;
      }

      // Keep the created response for safe image retry; navigate only after uploads finish.
      setCreatedPointTripId(null);
      setCreatedTrip(created);
      if (selectedFiles.length === 0) {
        navigateToCreatedTrip(created);
        return;
      }
      await uploadPendingImages(created, selectedFiles);
    } catch (error) {
      setServerError(getGenericErrorMessage(error));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <>
      <Box sx={{ width: 'min(100%, 600px)', mx: 'auto', px: { xs: 2, sm: 0 }, mb: 1 }}>
        <TripLocationPicker
          latitude={latitude}
          longitude={longitude}
          onChange={(nextLatitude, nextLongitude) => {
            setLatitude(nextLatitude);
            setLongitude(nextLongitude);
          }}
        />
      </Box>
      <Box
        component="form"
        onSubmit={handleSubmit((values) => onSubmit(values, 'add-trip'))}
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
      <Typography
        variant="h5"
        component="h1"
        sx={{ m: '10px auto', textTransform: 'uppercase', textAlign: 'center' }}
      >
        Create trip
      </Typography>

      <Snackbar
        anchorOrigin={{ vertical: 'top', horizontal: 'left' }}
        open={Boolean(serverError)}
        autoHideDuration={5000}
        onClose={() => setServerError(null)}
      >
        <Alert severity="error" onClose={() => setServerError(null)}>
          {serverError}
        </Alert>
      </Snackbar>
      <Snackbar
        anchorOrigin={{ vertical: 'top', horizontal: 'left' }}
        open={missingDays.length > 0}
        autoHideDuration={10000}
        onClose={() => setMissingDays([])}
      >
        <Alert severity="info" onClose={() => setMissingDays([])}>
          Missing day(s): {missingDays.join(', ')}
        </Alert>
      </Snackbar>

      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap', m: '4px' }}>
        <TextField
          label="Day"
          type="number"
          size="small"
          {...register('dayNumber', { valueAsNumber: true })}
          onChange={(event) => {
            register('dayNumber', { valueAsNumber: true }).onChange(event);
            const nextDayNumber = Number(event.target.value);
            if (Number.isInteger(nextDayNumber) && nextDayNumber > 0) {
              validateDayNumber(nextDayNumber);
            } else {
              setServerError(null);
            }
          }}
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
          disabled={submitting || isLoadingExistingTrip || !isValid || isDayNumberOccupied}
          startIcon={submitting ? <CircularProgress size={18} /> : undefined}
          sx={{ '&:hover': { backgroundColor: '#4daf30' } }}
        >
          Add trip
        </Button>
        <Button
          type="button"
          variant="contained"
          disabled={submitting || isLoadingExistingTrip || !isValid || isDayNumberOccupied}
          onClick={() => {
            void handleSubmit((values) => onSubmit(values, 'add-next-day'))();
          }}
          sx={{ '&:hover': { backgroundColor: '#4daf30' } }}
        >
          Add next day trip
        </Button>
        <Button
          type="button"
          variant="contained"
          disabled={submitting || isLoadingExistingTrip || !isValid || isDayNumberOccupied}
          onClick={() => {
            void handleSubmit((values) => onSubmit(values, 'add-point'))();
          }}
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
    </>
  );
}
