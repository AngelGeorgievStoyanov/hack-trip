'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQueryClient } from '@tanstack/react-query';
import { Controller, useForm } from 'react-hook-form';
import {
  Alert,
  Box,
  Button,
  ButtonGroup,
  CircularProgress,
  IconButton,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import { tripApi, type TripEditInput } from '@/api/trips';
import { AppImage } from '@/components/images/AppImage';
import ImageUploadField from '@/components/images/ImageUploadField';
import { TripLocationPicker } from '@/components/maps/TripLocationPicker';
import { TripSelectField } from './TripSelectField';
import { SELECT_TYPE_KEYS } from '@/constants/config';
import { useSelectChoices } from '@/hooks/useSelects';
import { zodResolver } from '@/lib/zodResolver';
import { getGenericErrorMessage } from '@/lib/errors';
import { buildTripUrl } from '@/lib/tripUrl';
import { tripEditSchema } from '@/validations/trips';
import { DAY_NUMBER_MAX } from '@/constants/trips';
import { AddIcon, RemoveIcon, RemoveImageIcon } from '@/constants/icons';
import { useConfirm } from '@/components/common/ConfirmDialog';
import type { TripGroupResponse } from '@/types';

interface EditTripLayoutProps {
  trip: TripGroupResponse;
  selectedDayId?: number;
}

/**
 * Edits one concrete Trip row using PUT /trips/:tripGroupId/days/:tripId.
 * All fields required by the backend are submitted together.
 */
export function EditTripLayout({ trip, selectedDayId }: EditTripLayoutProps) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { confirm } = useConfirm();
  const [serverError, setServerError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [newImages, setNewImages] = useState<File[]>([]);
  const [existingImages, setExistingImages] = useState(
    trip.days.find((day) => day.id === selectedDayId)?.images ?? trip.days[0]?.images ?? [],
  );
  const [deletingImageId, setDeletingImageId] = useState<number | null>(null);
  const [dayNumberLocked, setDayNumberLocked] = useState(false);
  const selectedDay = trip.days.find((day) => day.id === selectedDayId) ?? trip.days[0];

  const {
    control,
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isDirty, isValid },
  } = useForm<TripEditInput>({
    resolver: zodResolver(tripEditSchema),
    mode: 'onChange',
    defaultValues: {
      dayNumber: selectedDay?.dayNumber ?? 1,
      title: selectedDay?.title ?? '',
      description: selectedDay?.description ?? '',
      price: selectedDay?.price ?? 0,
      transport: selectedDay?.transport.key ?? '',
      countPeoples: selectedDay?.countPeoples ?? 1,
      typeOfPeople: selectedDay?.group.key ?? '',
      currency: selectedDay?.currency?.code ?? '',
      destination: selectedDay?.destination ?? '',
      lat: selectedDay?.lat ?? null,
      lng: selectedDay?.lng ?? null,
    },
  });

  const transportChoices = useSelectChoices(SELECT_TYPE_KEYS.transport, watch('transport'));
  const groupChoices = useSelectChoices(SELECT_TYPE_KEYS.group, watch('typeOfPeople'));
  const currencyChoices = useSelectChoices(SELECT_TYPE_KEYS.currency, watch('currency'));
  const latitude = watch('lat');
  const longitude = watch('lng');
  const dayNumber = watch('dayNumber');
  const conflictingDay = selectedDay
    ? trip.days.find((day) => day.id !== selectedDay.id && day.dayNumber === dayNumber)
    : undefined;
  const hasDayNumberConflict = Boolean(conflictingDay);

  function changeDayNumber(delta: -1 | 1): void {
    const nextDayNumber = Math.min(
      DAY_NUMBER_MAX,
      Math.max(1, dayNumber + delta),
    );
    setValue('dayNumber', nextDayNumber, {
      shouldDirty: true,
      shouldValidate: true,
    });
    setDayNumberLocked(false);
    setServerError(null);
  }

  function setSelectedDayNumber(): void {
    if (!selectedDay || dayNumber === selectedDay.dayNumber || hasDayNumberConflict) {
      return;
    }
    setDayNumberLocked((current) => !current);
  }

  async function deleteExistingImage(imageId: number): Promise<void> {
    const confirmed = await confirm(
      'Are you sure you want to delete this image?',
      'Delete Confirmation',
    );
    if (!confirmed) return;

    setDeletingImageId(imageId);
    setServerError(null);
    try {
      await tripApi.deleteImage(imageId);
      setExistingImages((current) => current.filter((image) => image.id !== imageId));

      const cachedTrip = queryClient.getQueryData<TripGroupResponse>(['trip', trip.id]) ?? trip;
      queryClient.setQueryData<TripGroupResponse>(['trip', trip.id], {
        ...cachedTrip,
        days: cachedTrip.days.map((day) =>
          day.id === selectedDay?.id
            ? { ...day, images: day.images.filter((image) => image.id !== imageId) }
            : day,
        ),
      });
    } catch (error) {
      setServerError(getGenericErrorMessage(error));
    } finally {
      setDeletingImageId(null);
    }
  }

  async function onSubmit(values: TripEditInput): Promise<void> {
    if (!selectedDay) return;
    if (hasDayNumberConflict) {
      setServerError(
        'Day ' + values.dayNumber + ' already exists. Choose a free day number.',
      );
      return;
    }

    setSubmitting(true);
    setServerError(null);

    try {
      const response = await tripApi.updateDay(trip.id, selectedDay.id, values);
      queryClient.setQueryData(['trip', trip.id], response);

      if (newImages.length > 0) {
        const filesToUpload = [...newImages];
        const uploadResults = await Promise.allSettled(
          filesToUpload.map((file) => tripApi.uploadDayImage(trip.id, selectedDay.id, file)),
        );
        const failedFiles = filesToUpload.filter(
          (_file, index) => uploadResults[index].status === 'rejected',
        );

        setNewImages(failedFiles);

        if (failedFiles.length > 0) {
          try {
            const refreshedTrip = await tripApi.getTrip(trip.id);
            queryClient.setQueryData(['trip', trip.id], refreshedTrip);
            const refreshedDay = refreshedTrip.days.find((day) => day.id === selectedDay.id);
            if (refreshedDay) setExistingImages(refreshedDay.images);
          } catch {
            // Keep the failed files available for retry; the successful uploads remain attached.
          }

          setServerError(
            'Trip details were saved, but ' +
              failedFiles.length +
              ' image upload(s) failed. Select EDIT YOUR TRIP again to retry the failed images.',
          );
          return;
        }
      }

      const updatedDay = response.days.find((day) => day.id === selectedDay.id);
      router.replace(buildTripUrl(trip.id, updatedDay?.dayNumber ?? values.dayNumber));
      router.refresh();
    } catch (error) {
      setServerError(getGenericErrorMessage(error));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Box
      sx={{
        width: '100%',
        maxWidth: 1440,
        mx: 'auto',
        px: { xs: 1, sm: 2 },
        py: { xs: 2, sm: 2 },
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 2,
      }}
    >
      <Box sx={{ width: '100%', maxWidth: 1100 }}>
        <TripLocationPicker
          latitude={latitude == null ? '' : String(latitude)}
          longitude={longitude == null ? '' : String(longitude)}
          onChange={(nextLatitude, nextLongitude) => {
            setValue('lat', nextLatitude === '' ? null : Number(nextLatitude), {
              shouldDirty: true,
              shouldValidate: true,
            });
            setValue('lng', nextLongitude === '' ? null : Number(nextLongitude), {
              shouldDirty: true,
              shouldValidate: true,
            });
          }}
        />
      </Box>

      <Box
        sx={{
          display: 'flex',
          flexDirection: 'row',
          justifyContent: 'center',
          alignItems: 'flex-start',
          gap: 2,
          width: '100%',
          '@media (max-width: 1120px)': {
            flexDirection: 'column-reverse',
            alignItems: 'center',
          },
        }}
      >
        <Box
          component="form"
          onSubmit={handleSubmit(onSubmit)}
          sx={{
            boxSizing: 'border-box',
            m: { xs: 0, sm: 2 },
            p: { xs: 2, sm: '30px' },
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            gap: 1,
            width: 'min(100%, 520px)',
            flex: '0 1 520px',
            minWidth: 0,
            height: 'fit-content',
            backgroundColor: '#eee7e79e',
            boxShadow: '3px 2px 5px black',
            border: '1px solid',
            borderRadius: 0,
            '& .MuiFormControl-root': { m: 0.5, width: 'calc(100% - 10px)' },
            '& .MuiButton-root': { m: 1 },
          }}
        >
          <Typography
            component="h1"
            variant="h5"
            sx={{ m: '10px auto', textTransform: 'uppercase', textAlign: 'center' }}
          >
            EDIT TRIP
          </Typography>

          {serverError ? <Alert severity="error">{serverError}</Alert> : null}

          {selectedDay ? (
            <>
              <Box
                sx={{
                  display: 'flex',
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  '@media (max-width: 600px)': {
                    flexDirection: 'column',
                  },
                }}
              >
                <TextField
                  label="DAY"
                  value={dayNumber}
                  size="small"
                  error={!!errors.dayNumber || hasDayNumberConflict}
                  helperText={
                    errors.dayNumber?.message ??
                    (hasDayNumberConflict ? 'This day number is already in use.' : undefined)
                  }
                  slotProps={{
                    htmlInput: {
                      readOnly: true,
                      min: 1,
                      max: DAY_NUMBER_MAX,
                      style: { textAlign: 'center' },
                    },
                  }}
                  sx={{ maxWidth: 90, pointerEvents: 'none' }}
                />
                <ButtonGroup
                  disabled={dayNumberLocked || submitting}
                  sx={{
                    m: 1,
                    '& .MuiButton-root': {
                      m: 0,
                      p: 0,
                      maxWidth: 100,
                      height: 36,
                      width: 50,
                    },
                  }}
                >
                  <Button
                    type="button"
                    variant="contained"
                    aria-label="Decrease day number"
                    disabled={dayNumberLocked || submitting || dayNumber <= 1}
                    onClick={() => changeDayNumber(-1)}
                  >
                    <RemoveIcon fontSize="small" />
                  </Button>
                  <Button
                    type="button"
                    variant="contained"
                    aria-label="Increase day number"
                    disabled={dayNumberLocked || submitting || dayNumber >= DAY_NUMBER_MAX}
                    onClick={() => changeDayNumber(1)}
                  >
                    <AddIcon fontSize="small" />
                  </Button>
                </ButtonGroup>
                <Button
                  type="button"
                  variant="contained"
                  onClick={setSelectedDayNumber}
                  disabled={
                    submitting ||
                    dayNumber === selectedDay.dayNumber ||
                    hasDayNumberConflict
                  }
                >
                  {dayNumberLocked ? 'CHANGE DAY' : 'SET DAY'}
                </Button>
              </Box>

              <TextField
                label="TITLE"
                {...register('title')}
                error={!!errors.title}
                helperText={errors.title?.message}
              />
              <Box sx={{ display: 'flex', flexDirection: 'row', width: '100%', gap: 1 }}>
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <TextField
                    label="PRICE"
                    type="number"
                    {...register('price', { valueAsNumber: true })}
                    error={!!errors.price}
                    helperText={errors.price?.message}
                    slotProps={{ htmlInput: { min: 0, max: 1000000, step: 'any' } }}
                  />
                </Box>
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Controller
                    control={control}
                    name="currency"
                    render={({ field }) => (
                      <TripSelectField
                        name={field.name}
                        label="CURRENCY"
                        value={field.value}
                        choices={currencyChoices}
                        searchable
                        onChange={field.onChange}
                        onBlur={field.onBlur}
                        error={!!errors.currency}
                        helperText={errors.currency?.message}
                      />
                    )}
                  />
                </Box>
              </Box>
              <Controller
                control={control}
                name="transport"
                render={({ field }) => (
                  <TripSelectField
                    name={field.name}
                    label="TRANSPORT"
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
                label="COUNT OF PEOPLE"
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
                    label="TYPE OF THE GROUP"
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
                label="DESTINATION"
                {...register('destination')}
                error={!!errors.destination}
                helperText={errors.destination?.message}
              />

              <Box sx={{ pointerEvents: submitting ? 'none' : 'auto', opacity: submitting ? 0.7 : 1 }}>
                <ImageUploadField
                  files={newImages}
                  setFiles={setNewImages}
                  existingCount={existingImages.length}
                />
              </Box>

              <TextField
                label="DESCRIPTION"
                multiline
                minRows={4}
                {...register('description')}
                error={!!errors.description}
                helperText={errors.description?.message}
              />
            </>
          ) : (
            <Typography>No trip days found.</Typography>
          )}

          <Box sx={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', alignItems: 'center' }}>
            <Button
              type="submit"
              variant="contained"
              disabled={
                !selectedDay ||
                submitting ||
                !isValid ||
                (!isDirty && newImages.length === 0)
              }
              startIcon={submitting ? <CircularProgress size={18} /> : undefined}
              sx={{ ':hover': { background: '#4daf30' } }}
            >
              EDIT YOUR TRIP
            </Button>
            <Button
              type="button"
              variant="contained"
              onClick={() => router.back()}
              sx={{
                background: 'rgb(194 194 224)',
                color: 'black',
                ':hover': { color: 'rgb(248 245 245)', background: 'rgb(194 194 224)' },
              }}
            >
              BACK
            </Button>
          </Box>
        </Box>

        <Box
          component="section"
          sx={{
            boxSizing: 'border-box',
            width: 'min(100%, 520px)',
            flex: '0 1 520px',
            minWidth: 0,
            m: { xs: 0, sm: 2 },
            p: 1,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {existingImages.length > 0 ? (
            <Box
              sx={{
                display: 'grid',
                width: '100%',
                gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
                gap: 1,
              }}
            >
              {existingImages.map((image) => (
                <Box
                  key={image.id}
                  sx={{
                    position: 'relative',
                    width: '100%',
                    aspectRatio: '1 / 1',
                    overflow: 'hidden',
                    border: '1px solid rgba(0, 0, 0, 0.2)',
                    p: 0.5,
                  }}
                >
                  <AppImage
                    image={image}
                    alt={selectedDay?.title ?? 'Trip image'}
                    fill
                    sizes="(max-width: 600px) 33vw, 170px"
                  />
                  <Tooltip title="Delete image" arrow>
                    <span>
                      <IconButton
                        aria-label="Delete image"
                        size="small"
                        color="error"
                        disabled={submitting || deletingImageId !== null}
                        onClick={() => void deleteExistingImage(image.id)}
                        sx={{
                          position: 'absolute',
                          top: 4,
                          right: 4,
                          backgroundColor: 'rgba(255, 255, 255, 0.82)',
                          '&:hover': { backgroundColor: 'rgba(255, 255, 255, 0.96)' },
                        }}
                      >
                        {deletingImageId === image.id ? (
                          <CircularProgress size={18} />
                        ) : (
                          <RemoveImageIcon fontSize="small" />
                        )}
                      </IconButton>
                    </span>
                  </Tooltip>
                </Box>
              ))}
            </Box>
          ) : (
            <Typography
              variant="h6"
              sx={{ m: 2, maxWidth: '95%', textAlign: 'center', textTransform: 'uppercase' }}
            >
              FOR THIS TRIP DON'T HAVE IMAGES
            </Typography>
          )}
        </Box>
      </Box>
    </Box>
  );
}
