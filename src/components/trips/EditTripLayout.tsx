'use client';

import { useState, type ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { useQueryClient } from '@tanstack/react-query';
import { Controller, useForm } from 'react-hook-form';
import { Alert, Box, Button, CircularProgress, TextField, Typography } from '@mui/material';
import { tripApi, type TripEditInput } from '@/api/trips';
import { AppImage } from '@/components/images/AppImage';
import { TripLocationPicker } from '@/components/maps/TripLocationPicker';
import { TripSelectField } from './TripSelectField';
import { SELECT_TYPE_KEYS } from '@/constants/config';
import { useSelectChoices } from '@/hooks/useSelects';
import { zodResolver } from '@/lib/zodResolver';
import { getGenericErrorMessage } from '@/lib/errors';
import { buildTripUrl } from '@/lib/tripUrl';
import { tripEditSchema } from '@/validations/trips';
import type { TripGroupResponse, TripGroupDay } from '@/types';

interface EditTripLayoutProps {
  trip: TripGroupResponse;
  children: ReactNode;
  selectedDayId?: number;
}

function formatPrice(day: TripGroupDay): string {
  if (day.price == null) return '';
  return day.currency?.code ? `${day.price} ${day.currency.code}` : String(day.price);
}

/**
 * Edits one concrete Trip row using PUT /trips/:tripGroupId/days/:tripId.
 * All fields required by the backend are submitted together.
 */
export function EditTripLayout({ trip, children, selectedDayId }: EditTripLayoutProps) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [serverError, setServerError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const selectedDay = trip.days.find((day) => day.id === selectedDayId) ?? trip.days[0];

  const {
    control,
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
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
  const images = selectedDay?.images ?? [];

  async function onSubmit(values: TripEditInput): Promise<void> {
    if (!selectedDay) return;
    setSubmitting(true);
    setServerError(null);

    try {
      const response = await tripApi.updateDay(trip.id, selectedDay.id, values);
      queryClient.setQueryData(['trip', trip.id], response);
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
            gap: 1,
            width: 'min(100%, 520px)',
            flex: '0 1 520px',
            minWidth: 0,
            height: 'fit-content',
            backgroundColor: '#eee7e79e',
            boxShadow: '3px 2px 5px black',
            border: '1px solid',
            borderRadius: 0,
            '& .MuiFormControl-root': { my: 0.5, width: '100%' },
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
              <TextField
                label="DAY"
                type="number"
                {...register('dayNumber', { valueAsNumber: true })}
                error={!!errors.dayNumber}
                helperText={errors.dayNumber?.message}
                slotProps={{ htmlInput: { min: 1, max: 500, step: 1 } }}
              />
              <TextField
                label="TITLE"
                {...register('title')}
                error={!!errors.title}
                helperText={errors.title?.message}
              />
              <Box sx={{ display: 'flex', gap: 1, width: '100%' }}>
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

          <Box sx={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 1, mt: 1 }}>
            <Button
              type="submit"
              variant="contained"
              disabled={!selectedDay || submitting}
              startIcon={submitting ? <CircularProgress size={18} /> : undefined}
              sx={{ minWidth: 180, ':hover': { background: '#4daf30' } }}
            >
              EDIT YOUR TRIP
            </Button>
            <Button
              type="button"
              variant="contained"
              onClick={() => router.back()}
              sx={{
                minWidth: 120,
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
          {images.length > 0 ? (
            <Box
              sx={{
                display: 'grid',
                width: '100%',
                gridTemplateColumns: `repeat(${images.length > 3 ? 3 : images.length}, minmax(0, 1fr))`,
                gap: 1,
              }}
            >
              {images.map((image) => (
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

      <Box sx={{ width: '100%', maxWidth: 1100 }}>
        {children}
      </Box>
    </Box>
  );
}
