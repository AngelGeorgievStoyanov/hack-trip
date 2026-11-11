'use client';

import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  Alert,
  Box,
  Button,
  Checkbox,
  CircularProgress,
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  List,
  ListItem,
  ListItemText,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tab,
  Tabs,
  Typography,
} from '@mui/material';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import { adminApi } from '@/api/admin';
import { getGenericErrorMessage } from '@/lib/errors';
import { ADMIN_PAGE_SIZE_DEFAULT } from '@/constants/ui';

function stringList(items: string[], empty: string) {
  if (items.length === 0) {
    return (
      <ListItem>
        <ListItemText primary={empty} />
      </ListItem>
    );
  }
  return items.map((item) => (
    <ListItem key={item}>
      <ListItemText primary={item} />
    </ListItem>
  ));
}

function CloudImages() {
  const [page, setPage] = useState(1);
  const { data, isLoading, error } = useQuery({
    queryKey: ['admin', 'images', 'cloud', page, ADMIN_PAGE_SIZE_DEFAULT],
    queryFn: () => adminApi.listCloudImages({ page, pageSize: ADMIN_PAGE_SIZE_DEFAULT }),
  });
  const hasNext = data?.pagination.hasNext ?? false;

  return (
    <Box>
      {error ? <Alert severity="error">{getGenericErrorMessage(error)}</Alert> : null}
      {isLoading ? <CircularProgress /> : null}
      {data ? (
        <Box>
          <List dense>{stringList(data.items, 'No cloud images.')}</List>
          <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
            <Button disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
              Previous
            </Button>
            <Typography>Page {page}</Typography>
            <Button disabled={!hasNext} onClick={() => setPage((p) => p + 1)}>
              Next
            </Button>
          </Box>
        </Box>
      ) : null}
    </Box>
  );
}

function DatabaseImages() {
  const [page, setPage] = useState(1);
  const { data, isLoading, error } = useQuery({
    queryKey: ['admin', 'images', 'database', page, ADMIN_PAGE_SIZE_DEFAULT],
    queryFn: () => adminApi.listDatabaseImages({ page, pageSize: ADMIN_PAGE_SIZE_DEFAULT }),
  });
  const pagination = data?.pagination;

  return (
    <Box>
      {error ? <Alert severity="error">{getGenericErrorMessage(error)}</Alert> : null}
      {isLoading ? <CircularProgress /> : null}
      {data ? (
        <Box>
          <List dense>{stringList(data.items, 'No database images.')}</List>
          {pagination && (pagination.totalPages ?? 0) > 1 ? (
            <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
              <Button disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
                Previous
              </Button>
              <Typography>
                Page {page} of {pagination.totalPages}
              </Typography>
              <Button
                disabled={page >= (pagination.totalPages ?? 1)}
                onClick={() => setPage((p) => p + 1)}
              >
                Next
              </Button>
            </Box>
          ) : null}
        </Box>
      ) : null}
    </Box>
  );
}

function OrphanImages() {
  const [page, setPage] = useState(1);
  const { data, isLoading, error } = useQuery({
    queryKey: ['admin', 'images', 'orphans', page, ADMIN_PAGE_SIZE_DEFAULT],
    queryFn: () => adminApi.listOrphanImages({ page, pageSize: ADMIN_PAGE_SIZE_DEFAULT }),
  });
  const hasNext = data ? data.pagination.cloudHasNext || data.pagination.databaseHasNext : false;

  return (
    <Box>
      {error ? <Alert severity="error">{getGenericErrorMessage(error)}</Alert> : null}
      {isLoading ? <CircularProgress /> : null}
      {data ? (
        <Box>
          <Typography variant="h6">Cloud only ({data.cloudOnly.length})</Typography>
          <List dense>{stringList(data.cloudOnly, 'None.')}</List>
          <Typography variant="h6">Database only ({data.databaseOnly.length})</Typography>
          <List dense>{stringList(data.databaseOnly, 'None.')}</List>
          <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
            <Button disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
              Previous
            </Button>
            <Typography>Page {page}</Typography>
            <Button disabled={!hasNext} onClick={() => setPage((p) => p + 1)}>
              Next
            </Button>
          </Box>
        </Box>
      ) : null}
    </Box>
  );
}

function MissingThumbnails() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [resultMessage, setResultMessage] = useState<string | null>(null);
  const [selectionError, setSelectionError] = useState<string | null>(null);

  const queryKey = ['admin', 'images', 'missing-thumbnails', page, ADMIN_PAGE_SIZE_DEFAULT];
  const { data, isLoading, error, isFetching } = useQuery({
    queryKey,
    queryFn: () => adminApi.listMissingThumbnails({ page, pageSize: ADMIN_PAGE_SIZE_DEFAULT }),
  });
  const mutation = useMutation({
    mutationFn: () => adminApi.generateThumbnails(selectedIds),
    onSuccess: async (response) => {
      const { generated, alreadyExists, originalMissing, notFound, failed } = response.summary;
      setResultMessage(
        `Generated: ${generated}; already existed: ${alreadyExists}; missing original: ${originalMissing}; not found: ${notFound}; failed: ${failed}.`,
      );
      setSelectedIds([]);
      setSelectionError(null);
      await queryClient.invalidateQueries({ queryKey: ['admin', 'images', 'missing-thumbnails'] });
    },
  });

  const items = data?.items ?? [];
  const allSelected = items.length > 0 && items.every((item) => selectedIds.includes(item.id));

  const toggleSelected = (id: number, checked: boolean) => {
    setSelectedIds((current) => {
      if (!checked) return current.filter((value) => value !== id);
      if (current.includes(id)) return current;
      if (current.length >= 100) {
        setSelectionError('You can generate at most 100 thumbnails per request.');
        return current;
      }
      setSelectionError(null);
      return [...current, id];
    });
  };

  const togglePage = (checked: boolean) => {
    const pageIds = items.map((item) => item.id);
    setSelectedIds((current) => {
      if (!checked) return current.filter((id) => !pageIds.includes(id));
      const additions = pageIds.filter((id) => !current.includes(id));
      const availableSlots = Math.max(0, 100 - current.length);
      if (additions.length > availableSlots) {
        setSelectionError('You can generate at most 100 thumbnails per request.');
      } else {
        setSelectionError(null);
      }
      return [...current, ...additions.slice(0, availableSlots)];
    });
  };

  return (
    <Box sx={{ mt: 2 }}>
      <Typography variant="h6" gutterBottom>
        Missing thumbnails
      </Typography>
      <Typography color="text.secondary" variant="body2" sx={{ mb: 2 }}>
        Only images with a database record and an existing original in Google Cloud Storage are
        listed. Select images to generate their thumbnails.
      </Typography>

      {error ? <Alert severity="error" sx={{ mb: 2 }}>{getGenericErrorMessage(error)}</Alert> : null}
      {resultMessage ? <Alert severity="success" sx={{ mb: 2 }}>{resultMessage}</Alert> : null}
      {selectionError ? <Alert severity="warning" sx={{ mb: 2 }}>{selectionError}</Alert> : null}
      {mutation.error ? (
        <Alert severity="error" sx={{ mb: 2 }}>{getGenericErrorMessage(mutation.error)}</Alert>
      ) : null}

      <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', mb: 2, flexWrap: 'wrap' }}>
        <Button
          variant="contained"
          disabled={selectedIds.length === 0 || mutation.isPending}
          onClick={() => mutation.mutate()}
        >
          {mutation.isPending ? 'Generating…' : `Generate selected (${selectedIds.length})`}
        </Button>
        <Button
          variant="outlined"
          disabled={items.length === 0}
          onClick={() => togglePage(!allSelected)}
        >
          {allSelected ? 'Deselect page' : 'Select page'}
        </Button>
        <Typography variant="body2" color="text.secondary">
          {data ? `${items.length} shown` : ''}
        </Typography>
        {isFetching && !isLoading ? <CircularProgress size={20} /> : null}
      </Box>

      {isLoading ? <CircularProgress /> : null}
      {data ? (
        <>
          <TableContainer component={Paper} variant="outlined">
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell padding="checkbox">
                    <Checkbox
                      checked={allSelected}
                      indeterminate={selectedIds.some((id) => items.some((item) => item.id === id)) && !allSelected}
                      onChange={(event) => togglePage(event.target.checked)}
                      inputProps={{ 'aria-label': 'Select all images on this page' }}
                    />
                  </TableCell>
                  <TableCell>Preview</TableCell>
                  <TableCell>Image ID</TableCell>
                  <TableCell>Original URL</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {items.map((item) => (
                  <TableRow key={item.id} hover selected={selectedIds.includes(item.id)}>
                    <TableCell padding="checkbox">
                      <Checkbox
                        checked={selectedIds.includes(item.id)}
                        onChange={(event) => toggleSelected(item.id, event.target.checked)}
                        inputProps={{ 'aria-label': `Select image ${item.id}` }}
                      />
                    </TableCell>
                    <TableCell>
                      <Box
                        component="button"
                        type="button"
                        onClick={() => setPreviewUrl(item.url)}
                        aria-label={`Open image ${item.id} preview`}
                        sx={{
                          display: 'block',
                          p: 0,
                          border: 0,
                          background: 'transparent',
                          cursor: 'zoom-in',
                          lineHeight: 0,
                        }}
                      >
                        <Box
                          component="img"
                          src={item.url}
                          alt={`Image ${item.id}`}
                          loading="lazy"
                          sx={{
                            width: 88,
                            height: 66,
                            objectFit: 'cover',
                            borderRadius: 1,
                            border: 1,
                            borderColor: 'divider',
                          }}
                        />
                      </Box>
                    </TableCell>
                    <TableCell>{item.id}</TableCell>
                    <TableCell sx={{ maxWidth: 280, overflowWrap: 'anywhere' }}>
                      <Typography variant="body2" color="text.secondary">
                        {item.url}
                      </Typography>
                    </TableCell>
                  </TableRow>
                ))}
                {items.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} align="center">
                      No missing thumbnails on this page.
                    </TableCell>
                  </TableRow>
                ) : null}
              </TableBody>
            </Table>
          </TableContainer>
          <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', mt: 2 }}>
            <Button disabled={page <= 1 || isFetching} onClick={() => setPage((value) => value - 1)}>
              Previous
            </Button>
            <Typography>Page {page}</Typography>
            <Button
              disabled={!data.pagination.hasNext || isFetching}
              onClick={() => setPage((value) => value + 1)}
            >
              Next
            </Button>
          </Box>
        </>
      ) : null}

      <Dialog open={previewUrl !== null} onClose={() => setPreviewUrl(null)} maxWidth="lg">
        <DialogTitle>
          Image preview
          <IconButton
            aria-label="Close preview"
            onClick={() => setPreviewUrl(null)}
            sx={{ position: 'absolute', right: 8, top: 8 }}
          >
            <CloseRoundedIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ p: 2 }}>
          {previewUrl ? (
            <Box
              component="img"
              src={previewUrl}
              alt="Full-size original"
              sx={{ display: 'block', maxWidth: 'min(85vw, 1100px)', maxHeight: '75vh', objectFit: 'contain' }}
            />
          ) : null}
        </DialogContent>
      </Dialog>
    </Box>
  );
}

export function AdminImages() {
  const [tab, setTab] = useState(0);

  return (
    <Box>
      <Typography variant="h4">Image inventory</Typography>
      <Tabs value={tab} onChange={(_event, value: number) => setTab(value)}>
        <Tab label="Cloud" />
        <Tab label="Database" />
        <Tab label="Orphans" />
        <Tab label="Missing thumbnails" />
      </Tabs>
      {tab === 0 ? <CloudImages /> : null}
      {tab === 1 ? <DatabaseImages /> : null}
      {tab === 2 ? <OrphanImages /> : null}
      {tab === 3 ? <MissingThumbnails /> : null}
    </Box>
  );
}
