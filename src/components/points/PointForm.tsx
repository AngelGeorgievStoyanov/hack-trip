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
        gap: 2,
        minWidth: 0,
        width: '100%',
      }}
    >
      <Typography variant="h6" component="h2">
        {isEdit ? 'Edit point' : 'Add point'}
      </Typography>
      {serverError ? <Alert severity="error">{serverError}</Alert> : null}

      <TextField
        label="Name"
        fullWidth
        {...register('name')}
        error={!!errors.name}
        helperText={errors.name?.message}
      />
      <TextField
        label="Description"
        fullWidth
        multiline
        minRows={3}
        {...register('description')}
        error={!!errors.description}
        helperText={errors.description?.message}
      />

      <Box sx={{ display: 'flex', gap: 1, minWidth: 0, flexWrap: 'wrap' }}>
        <TextField
          label="Latitude"
          fullWidth
          sx={{ flex: '1 1 150px' }}
          {...register('lat')}
          error={!!errors.lat}
          helperText={errors.lat?.message}
        />
        <TextField
          label="Longitude"
          fullWidth
          sx={{ flex: '1 1 150px' }}
          {...register('lng')}
          error={!!errors.lng}
          helperText={errors.lng?.message}
        />
      </Box>

      <PointLocationPicker
        latitude={lat}
        longitude={lng}
        onChange={(nextLatitude, nextLongitude) => {
          setValue('lat', nextLatitude, { shouldValidate: true });
          setValue('lng', nextLongitude, { shouldValidate: true });
        }}
      />

      {existingImages.length > 0 ? (
        <Box>
          <Typography variant="subtitle2" sx={{ mb: 1 }}>Current images</Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
            {existingImages.map((image) => (
              <Box key={image.id} sx={{ width: 112, display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                <AppImage image={image} alt={point?.name ?? 'Point image'} preset="editorPointThumb" />
                <Button
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

      <Box>
        <Typography variant="subtitle2" sx={{ mb: 1 }}>
          Add images ({existingImages.length + files.length}/{MAX_IMAGES_PER_ENTITY})
        </Typography>
        <ImageUploadField
          files={files}
          setFiles={setFiles}
          existingCount={existingImages.length + uploadedImageCount}
        />
      </Box>

      <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
        <Button type="button" onClick={onDone} disabled={submitting}>
          Cancel
        </Button>
        <Button
          type="submit"
          variant="contained"
          disabled={submitting || existingImages.length + uploadedImageCount + files.length > MAX_IMAGES_PER_ENTITY}
          startIcon={submitting ? <CircularProgress size={16} /> : undefined}
        >
          {isEdit ? 'Save point' : createdPointId ? 'Retry image upload' : 'Add point'}
        </Button>
      </Box>
    </Box>
  );
}
