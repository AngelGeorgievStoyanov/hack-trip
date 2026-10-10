'use client';

import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Alert, Box, Button, Typography } from '@mui/material';
import { tripApi } from '@/api/trips';
import { pointApi } from '@/api/points';
import { AppImage } from '@/components/images/AppImage';
import { ImageUploadButton } from '@/components/images/ImageUploadButton';
import { DayForm } from './DayForm';
import { PointForm } from '@/components/points/PointForm';
import { useConfirm } from '@/components/common/ConfirmDialog';
import { getGenericErrorMessage } from '@/lib/errors';
import { MAX_IMAGES_PER_ENTITY } from '@/constants/images';
import type { TripGroupDay } from '@/types';

interface DayEditorProps {
  tripGroupId: number;
  day: TripGroupDay;
  editing: boolean;
  onEditingChange: (editing: boolean) => void;
  onMove: (direction: -1 | 1) => void;
}

export function DayEditor({ tripGroupId, day, editing, onEditingChange, onMove }: DayEditorProps) {
  const queryClient = useQueryClient();
  const { confirm } = useConfirm();
  const [addingPoint, setAddingPoint] = useState(false);
  const [editingPointId, setEditingPointId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ['trip', tripGroupId] });

  const deleteDayMutation = useMutation({
    mutationFn: () => tripApi.deleteDay(tripGroupId, day.id),
    onSuccess: () => void invalidate(),
    onError: (e) => setError(getGenericErrorMessage(e)),
  });

  const reorderPointsMutation = useMutation({
    mutationFn: (pointIds: number[]) => pointApi.reorderPoints(day.id, { pointIds }),
    onSuccess: () => void invalidate(),
    onError: (e) => setError(getGenericErrorMessage(e)),
  });

  const deletePointMutation = useMutation({
    mutationFn: (pointId: number) => pointApi.deletePoint(pointId),
    onSuccess: () => void invalidate(),
    onError: (e) => setError(getGenericErrorMessage(e)),
  });

  const uploadDayImageMutation = useMutation({
    mutationFn: (file: File) => tripApi.uploadDayImage(tripGroupId, day.id, file),
    onSuccess: () => void invalidate(),
    onError: (e) => setError(getGenericErrorMessage(e)),
  });

  const deleteImageMutation = useMutation({
    mutationFn: (imageId: number) => tripApi.deleteImage(imageId),
    onSuccess: () => void invalidate(),
    onError: (e) => setError(getGenericErrorMessage(e)),
  });

  const uploadPointImageMutation = useMutation({
    mutationFn: ({ pointId, file }: { pointId: number; file: File }) =>
      pointApi.uploadPointImage(pointId, file),
    onSuccess: () => void invalidate(),
    onError: (e) => setError(getGenericErrorMessage(e)),
  });

  const deletePointImageMutation = useMutation({
    mutationFn: ({ pointId, imageId }: { pointId: number; imageId: number }) =>
      pointApi.deletePointImage(pointId, imageId),
    onSuccess: () => void invalidate(),
    onError: (e) => setError(getGenericErrorMessage(e)),
  });

  function reorderPoint(index: number, direction: -1 | 1): void {
    const target = index + direction;
    if (target < 0 || target >= day.points.length) {
      return;
    }
    const next = [...day.points];
    [next[index], next[target]] = [next[target], next[index]];
    reorderPointsMutation.mutate(next.map((p) => p.id));
  }

  if (editing) {
    return <DayForm tripGroupId={tripGroupId} day={day} onDone={() => onEditingChange(false)} />;
  }

  return (
    <Box component="section" sx={{ border: '1px solid #e0e0e0', borderRadius: 1, p: 2, my: 1 }}>
      <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', flexWrap: 'wrap' }}>
        <Typography variant="h6">{day.title ?? `Day ${day.dayNumber}`}</Typography>
        <Button size="small" onClick={() => onMove(-1)}>↑</Button>
        <Button size="small" onClick={() => onMove(1)}>↓</Button>
        <Button size="small" onClick={() => onEditingChange(true)}>Edit</Button>
        <Button
          size="small"
          color="error"
          disabled={deleteDayMutation.isPending}
          onClick={() =>
            void confirm('Are you sure you want to delete this day?', 'Delete Confirmation').then(
              (confirmed) => {
                if (confirmed) {
                  deleteDayMutation.mutate();
                }
              },
            )
          }
        >
          Delete
        </Button>
      </Box>
      {error ? <Alert severity="error" onClose={() => setError(null)}>{error}</Alert> : null}

      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, my: 1, alignItems: 'flex-start' }}>
        {day.images.map((img) => (
          <Box key={img.id} sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
            <AppImage image={img} alt={day.title ?? `Day ${day.dayNumber}`} preset="editorDayThumb" />
            <Button
              size="small"
              color="error"
              onClick={() =>
                void confirm('Are you sure you want to delete this image?', 'Delete Confirmation').then(
                  (confirmed) => {
                    if (confirmed) {
                      deleteImageMutation.mutate(img.id);
                    }
                  },
                )
              }
            >
              Remove
            </Button>
          </Box>
        ))}
      </Box>
      <ImageUploadButton
        onUpload={(file) => uploadDayImageMutation.mutateAsync(file)}
        disabled={day.images.length >= MAX_IMAGES_PER_ENTITY}
        label="Add day image"
      />

      <Box sx={{ mt: 2 }}>
        <Typography variant="subtitle1">Points</Typography>
        {day.points.length === 0 ? <Typography variant="body2">No points yet.</Typography> : null}
        {day.points.map((point, index) => (
          <Box key={point.id} sx={{ border: '1px solid #eee', p: 1, my: 1 }}>
            {editingPointId === point.id ? (
              <PointForm tripGroupId={tripGroupId} dayId={day.id} point={point} onDone={() => setEditingPointId(null)} />
            ) : (
              <>
                <Typography variant="subtitle2">{point.name}</Typography>
                {point.description ? <Typography variant="body2">{point.description}</Typography> : null}
                {point.lat != null && point.lng != null ? (
                  <Typography variant="caption">{point.lat.toFixed(6)}, {point.lng.toFixed(6)}</Typography>
                ) : null}
                <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', flexWrap: 'wrap', my: 0.5 }}>
                  <Button size="small" onClick={() => reorderPoint(index, -1)}>↑</Button>
                  <Button size="small" onClick={() => reorderPoint(index, 1)}>↓</Button>
                  <Button size="small" onClick={() => setEditingPointId(point.id)}>Edit</Button>
                  <Button
                    size="small"
                    color="error"
                    onClick={() =>
                      void confirm('Are you sure you want to delete this point?', 'Delete Confirmation').then(
                        (confirmed) => {
                          if (confirmed) {
                            deletePointMutation.mutate(point.id);
                          }
                        },
                      )
                    }
                  >
                    Delete
                  </Button>
                  {point.images.map((img) => (
                    <Box key={img.id} sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                      <AppImage image={img} alt={point.name} preset="editorPointThumb" />
                      <Button
                        size="small"
                        color="error"
                        onClick={() =>
                          void confirm('Are you sure you want to delete this image?', 'Delete Confirmation').then(
                            (confirmed) => {
                              if (confirmed) {
                                deletePointImageMutation.mutate({ pointId: point.id, imageId: img.id });
                              }
                            },
                          )
                        }
                      >
                        Remove
                      </Button>
                    </Box>
                  ))}
                  <ImageUploadButton
                    onUpload={(file) => uploadPointImageMutation.mutateAsync({ pointId: point.id, file })}
                    disabled={point.images.length >= MAX_IMAGES_PER_ENTITY}
                    label="Add image"
                  />
                </Box>
              </>
            )}
          </Box>
        ))}
        {addingPoint ? (
          <PointForm tripGroupId={tripGroupId} dayId={day.id} onDone={() => setAddingPoint(false)} />
        ) : (
          <Button size="small" variant="outlined" onClick={() => setAddingPoint(true)}>Add point</Button>
        )}
      </Box>
    </Box>
  );
}
