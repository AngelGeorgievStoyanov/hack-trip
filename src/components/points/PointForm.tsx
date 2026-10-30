'use client';

import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  TextField,
  Typography,
} from '@mui/material';
import { pointApi } from '@/api/points';
import { AppImage } from '@/components/images/AppImage';
import ImageUploadField from '@/components/images/ImageUploadField';
import { PointLocationPicker } from '@/components/maps/PointLocationPicker';
import { useConfirm } from '@/components/common/ConfirmDialog';
import { zodResolver } from '@/lib/zodResolver';
import { getGenericErrorMessage } from '@/lib/errors';
import { pointCreateSchema } from '@/validations/points';
import { MAX_IMAGES_PER_ENTITY } from '@/constants/images';
import type { TripGroupResponse, TripPoint } from '@/types';

interface PointFormProps {
  tripGroupId: number;
  tripId: number;
  point?: TripPoint;
  onDone: () => void;
}

interface PointFormValues {
  name: string;
  description: string;
  lat: string;
  lng: string;
}

const formSchema = pointCreateSchema.omit({ tripId: true });

const legacyFieldSx = {
  '& .MuiOutlinedInput-root': {
    backgroundColor: 'rgba(242, 241, 229, 0.56)',
    borderRadius: '5px',
  },
};

const legacyButtonSx = {
  width: '32ch',
  maxWidth: '100%',
  m: 1,
  '&:hover': { backgroundColor: '#4daf30' },
};

export function PointForm({ tripGroupId, tripId, point, onDone }: PointFormProps) {
  const queryClient = useQueryClient();
  const { confirm } = useConfirm();
  const [serverError, setServerError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [files, setFiles] = useState<File[]>([]);
  const [createdPointId, setCreatedPointId] = useState<number | null>(null);
  const [existingImages, setExistingImages] = useState(point?.images ?? []);
  const [uploadedImageCount, setUploadedImageCount] = useState(0);
  const isEdit = point !== undefined;

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm<PointFormValues>({
    resolver: zodResolver(formSchema),
    mode: 'onChange',
    defaultValues: {
      name: point?.name ?? '',
      description: point?.description ?? '',
      lat: point?.lat != null ? String(point.lat) : '',
      lng: point?.lng != null ? String(point.lng) : '',
    },
  });

  const lat = watch('lat');
  const lng = watch('lng');

  function updateTripCache(updatedPoints: TripPoint[]): void {
    queryClient.setQueryData<TripGroupResponse>(['trip', tripGroupId], (current) =>
      current === undefined
        ? current
        : {
            ...current,
            days: current.days.map((day) =>
              day.id === tripId ? { ...day, points: updatedPoints } : day,
            ),
          },
    );
  }

  async function onSubmit(values: PointFormValues): Promise<void> {
    setSubmitting(true);
    setServerError(null);
    try {
      const input = {
        name: values.name,
        description: values.description || null,
        lat: Number(values.lat),
        lng: Number(values.lng),
      };

      let pointId = point?.id ?? createdPointId;
      if (isEdit && point) {
        const updatedPoints = await pointApi.updatePoint(point.id, input);
        updateTripCache(updatedPoints);
      } else if (pointId === null) {
        const updatedPoints = await pointApi.createPoint({ tripId, ...input });
        updateTripCache(updatedPoints);
        const createdPoint = updatedPoints.reduce<TripPoint | null>(
          (latest, item) => !latest || item.pointNumber > latest.pointNumber ? item : latest,
          null,
        );
        if (!createdPoint) {
          throw new Error('The point was created, but its ID could not be identified.');
        }
        pointId = createdPoint.id;
        setCreatedPointId(pointId);
      } else if (!isEdit && pointId !== null) {
        const updatedPoints = await pointApi.updatePoint(pointId, input);
        updateTripCache(updatedPoints);
      }

      if (pointId !== null && files.length > 0) {
        const failedFiles: File[] = [];
        for (const file of files) {
          try {
            await pointApi.uploadPointImage(pointId, file);
            setUploadedImageCount((current) => current + 1);
          } catch {
            failedFiles.push(file);
          }
        }
        if (failedFiles.length > 0) {
          setFiles(failedFiles);
          setServerError(
            `${failedFiles.length} image upload(s) failed. Select Add again to retry without creating a duplicate point.`,
          );
          await queryClient.invalidateQueries({ queryKey: ['trip', tripGroupId] });
          return;
        }
      }

      if (files.length > 0) {
        await queryClient.invalidateQueries({ queryKey: ['trip', tripGroupId] });
      }

      if (!isEdit) {
        setCreatedPointId(null);
        setUploadedImageCount(0);
        setFiles([]);
        reset({ name: '', description: '', lat: '', lng: '' });
      }
      onDone();
    } catch (error) {
      setServerError(getGenericErrorMessage(error));
    } finally {
      setSubmitting(false);
    }
  }

  async function removeExistingImage(imageId: number): Promise<void> {
    const accepted = await confirm('Are you sure you want to delete this image?', 'Delete Confirmation');
    if (!accepted || !point) return;

    try {
      await pointApi.deletePointImage(point.id, imageId);
      setExistingImages((current) => current.filter((image) => image.id !== imageId));
      await queryClient.invalidateQueries({ queryKey: ['trip', tripGroupId] });
    } catch (error) {
      setServerError(getGenericErrorMessage(error));
    }
  }

  return (
    <Box
      component="form"
      onSubmit={handleSubmit(onSubmit)}
      sx={{
        display: 'flex',
        flexDirection: 'column',
        gap: 1,
        minWidth: 0,
        width: '100%',
        maxWidth: '100%',
        alignItems: 'stretch',
        '& .MuiFormControl-root': { m: 0.5, width: 'calc(100% - 10px)' },
      }}
    >
      <Box sx={{ width: '100%' }}>
        <PointLocationPicker
          latitude={lat}
          longitude={lng}
          onChange={(nextLatitude, nextLongitude) => {
            setValue('lat', nextLatitude, { shouldValidate: true });
            setValue('lng', nextLongitude, { shouldValidate: true });
          }}
        />
      </Box>

      <Typography variant="h5" component="h2" sx={{ my: 1.25, textTransform: 'uppercase' }}>
        {isEdit ? 'Edit point' : 'Add point'}
      </Typography>
      {serverError ? <Alert severity="error" sx={{ width: '100%' }}>{serverError}</Alert> : null}

      <TextField
        label="NAME OF CITY, PLACE, LANDMARK OR ANOTHER"
        fullWidth
        type="search"
        InputLabelProps={{ shrink: true }}
        sx={legacyFieldSx}
        {...register('name')}
        error={!!errors.name}
        helperText={errors.name?.message}
      />

      <TextField
        label="DESCRIPTION"
        fullWidth
        multiline
        rows={4}
        InputLabelProps={{ shrink: true }}
        sx={legacyFieldSx}
        {...register('description')}
        error={!!errors.description}
        helperText={errors.description?.message}
      />

      {existingImages.length > 0 ? (
        <Box sx={{ width: '100%' }}>
          <Typography variant="subtitle2" sx={{ mb: 1 }}>Current images</Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
            {existingImages.map((image) => (
              <Box key={image.id} sx={{ width: 112, display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                <AppImage image={image} alt={point?.name ?? 'Point image'} preset="editorPointThumb" />
                <Button
                  type="button"
                  size="small"
                  color="error"
                  disabled={submitting}
                  onClick={() => void removeExistingImage(image.id)}
                >
                  Remove
                </Button>
              </Box>
            ))}
          </Box>
        </Box>
      ) : null}

      <Box sx={{ width: '100%' }}>
        <ImageUploadField
          files={files}
          setFiles={setFiles}
          existingCount={existingImages.length + uploadedImageCount}
        />
      </Box>

      <Box
        sx={{
          display: 'flex',
          flexDirection: { xs: 'column', sm: 'row' },
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'center',
          width: '100%',
          mt: 1,
          '@media (max-width:610px)': { flexDirection: 'column' },
        }}
      >
        <Button
          type="submit"
          variant="contained"
          disabled={submitting || existingImages.length + uploadedImageCount + files.length > MAX_IMAGES_PER_ENTITY}
          startIcon={submitting ? <CircularProgress size={16} /> : undefined}
          sx={legacyButtonSx}
        >
          {isEdit ? 'SAVE POINT' : createdPointId ? 'RETRY IMAGE UPLOAD' : 'ADD POINT'}
        </Button>
        <Button
          type="button"
          variant="contained"
          onClick={() => {
            if (!isEdit) {
              setCreatedPointId(null);
              setUploadedImageCount(0);
              setFiles([]);
              reset({ name: '', description: '', lat: '', lng: '' });
            }
            onDone();
          }}
          disabled={submitting}
          sx={{
            ...legacyButtonSx,
            backgroundColor: 'rgb(194, 194, 224)',
            color: 'black',
            '&:hover': { backgroundColor: 'rgb(170, 170, 210)', color: 'black' },
          }}
        >
          {isEdit ? 'CANCEL' : 'BACK'}
        </Button>
      </Box>
    </Box>
  );
}
