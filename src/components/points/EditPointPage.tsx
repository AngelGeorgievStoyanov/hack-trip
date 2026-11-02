'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Alert, Box, CircularProgress, IconButton, Paper, Tooltip, Typography } from '@mui/material';
import { pointApi } from '@/api/points';
import { PointForm } from '@/components/points/PointForm';
import { AppImage } from '@/components/images/AppImage';
import { RemoveImageIcon } from '@/constants/icons';
import { useConfirm } from '@/components/common/ConfirmDialog';
import { PointLocationPicker } from '@/components/maps/PointLocationPicker';
import { getGenericErrorMessage } from '@/lib/errors';
import type { SocialImageDto, TripPoint } from '@/types';

export function EditPointPage() {
  const router = useRouter();
  const { confirm } = useConfirm();
  const params = useParams<{ pointId: string }>();
  const pointId = Number(params.pointId);
  const [point, setPoint] = useState<TripPoint | null>(null);
  const [existingImages, setExistingImages] = useState<SocialImageDto[]>([]);
  const [deletingImageId, setDeletingImageId] = useState<number | null>(null);
  const [latitude, setLatitude] = useState('');
  const [longitude, setLongitude] = useState('');
  const [findInMapTrigger, setFindInMapTrigger] = useState(0);
  const [mapSearchSelection, setMapSearchSelection] = useState<{ name: string; revision: number } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!Number.isSafeInteger(pointId) || pointId < 1) {
      setError('A valid point ID is required.');
      setLoading(false);
      return;
    }

    let cancelled = false;
    pointApi.getPoint(pointId)
      .then((result) => {
        if (cancelled) return;
        if (!result.permissions.canEdit) {
          setError('You do not have permission to edit this point.');
          return;
        }
        setPoint(result);
        setExistingImages(result.images ?? []);
        setLatitude(result.lat == null ? '' : String(result.lat));
        setLongitude(result.lng == null ? '' : String(result.lng));
      })
      .catch((requestError) => {
        if (!cancelled) setError(getGenericErrorMessage(requestError));
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [pointId]);

  async function handleDeleteImage(image: SocialImageDto): Promise<void> {
    const accepted = await confirm('Are you sure you want to delete this image?', 'Delete Confirmation');
    if (!accepted) return;

    setDeletingImageId(image.id);
    setError(null);
    try {
      await pointApi.deletePointImage(pointId, image.id);
      setExistingImages((current) => current.filter((item) => item.id !== image.id));
    } catch (requestError) {
      setError(getGenericErrorMessage(requestError));
    } finally {
      setDeletingImageId(null);
    }
  }

  if (loading) {
    return <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}><CircularProgress /></Box>;
  }

  if (error && !point) return <Alert severity="error">{error}</Alert>;
  if (!point) return <Alert severity="error">The point could not be loaded.</Alert>;

  return (
    <Box sx={{ width: '100%', maxWidth: 1200, mx: 'auto', px: { xs: 1, sm: 2 }, py: 2, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      {error ? <Alert severity="error" sx={{ width: '100%', mb: 2 }}>{error}</Alert> : null}
      <Box sx={{ width: '100%', maxWidth: 600, mx: 'auto' }}>
        <PointLocationPicker
          latitude={latitude}
          longitude={longitude}
          findInMapTrigger={findInMapTrigger}
          onChange={(nextLatitude, nextLongitude) => {
            setLatitude(nextLatitude);
            setLongitude(nextLongitude);
          }}
          onAddressSelect={(name) => setMapSearchSelection((current) => ({ name, revision: (current?.revision ?? 0) + 1 }))}
        />
      </Box>
      <Box
        sx={{
          mt: 2.5,
          width: '100%',
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'flex-start',
          justifyContent: 'center',
          gap: 2.5,
          '@media (max-width:1020px)': {
            flexDirection: 'column-reverse',
            alignItems: 'center',
          },
        }}
      >
        <Paper variant="outlined" sx={{ p: { xs: 2, sm: '30px' }, width: '100%', maxWidth: 600, minWidth: 0, boxSizing: 'border-box', backgroundColor: '#eee7e79e', border: '1px solid black', borderRadius: 0, boxShadow: '3px 2px 5px black', '& .MuiFormControl-root': { m: 0.5, width: 'calc(100% - 10px)' } }}>
          <PointForm
            key={point.id}
            tripGroupId={0}
            tripId={point.tripId}
            point={point}
            existingImages={existingImages}
            latitude={latitude}
            longitude={longitude}
            mapSearchSelection={mapSearchSelection}
            onLocationChange={(nextLatitude, nextLongitude) => {
              setLatitude(nextLatitude);
              setLongitude(nextLongitude);
            }}
            onFindInMap={() => setFindInMapTrigger((current) => current + 1)}
            onAddNextDay={() => undefined}
            onBack={() => router.back()}
            onDone={() => router.back()}
          />
        </Paper>

        <Box sx={{ width: { xs: '100%', sm: '100%', lg: 520 }, maxWidth: 520, minWidth: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', mt: { xs: 0, lg: 1 } }}>
          {existingImages.length > 0 ? (
            <Box
              sx={{
                width: '100%',
                display: 'grid',
                gridTemplateColumns: `repeat(${Math.min(existingImages.length, 3)}, minmax(0, 1fr))`,
                gap: 1,
                alignItems: 'start',
              }}
            >
              {existingImages.map((image) => (
                <Box key={image.id} sx={{ position: 'relative', width: '100%', aspectRatio: '1 / 1', m: { xs: 0, sm: 1 }, p: { xs: 0, sm: 1 }, boxSizing: 'border-box' }}>
                  <AppImage
                    image={image}
                    alt={point.name}
                    preset="editorPointThumb"
                    fill
                    sizes="(max-width: 600px) 30vw, 160px"
                    style={{ objectFit: 'cover' }}
                  />
                  <Tooltip title="Delete image" arrow>
                    <span>
                      <IconButton
                        aria-label={`Delete image ${image.id}`}
                        onClick={() => void handleDeleteImage(image)}
                        disabled={deletingImageId !== null}
                        size="small"
                        sx={{ position: 'absolute', top: 4, left: 4, zIndex: 1, backgroundColor: '#ffffffaa', '&:hover': { backgroundColor: '#ffffff' } }}
                      >
                        <RemoveImageIcon />
                      </IconButton>
                    </span>
                  </Tooltip>
                </Box>
              ))}
            </Box>
          ) : (
            <Typography variant="h6" sx={{ m: 1, maxWidth: '95%', textAlign: 'center' }}>
              FOR THIS POINT DON'T HAVE IMAGES
            </Typography>
          )}
        </Box>
      </Box>
    </Box>
  );
}
