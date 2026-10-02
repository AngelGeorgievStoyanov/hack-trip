'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Alert, Box, Button, CircularProgress, List, ListItem, ListItemText, Tab, Tabs, Typography } from '@mui/material';
import { adminApi } from '@/api/admin';
import { getGenericErrorMessage } from '@/lib/errors';

const PAGE_SIZE = 50;

function stringList(items: string[], empty: string) {
  if (items.length === 0) {
    return <ListItem><ListItemText primary={empty} /></ListItem>;
  }
  return items.map((item) => <ListItem key={item}><ListItemText primary={item} /></ListItem>);
}

function CloudImages() {
  const [page, setPage] = useState(1);
  const { data, isLoading, error } = useQuery({
    queryKey: ['admin', 'images', 'cloud', page, PAGE_SIZE],
    queryFn: () => adminApi.listCloudImages({ page, pageSize: PAGE_SIZE }),
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
            <Button disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>Previous</Button>
            <Typography>Page {page}</Typography>
            <Button disabled={!hasNext} onClick={() => setPage((p) => p + 1)}>Next</Button>
          </Box>
        </Box>
      ) : null}
    </Box>
  );
}

function DatabaseImages() {
  const [page, setPage] = useState(1);
  const { data, isLoading, error } = useQuery({
    queryKey: ['admin', 'images', 'database', page, PAGE_SIZE],
    queryFn: () => adminApi.listDatabaseImages({ page, pageSize: PAGE_SIZE }),
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
              <Button disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>Previous</Button>
              <Typography>Page {page} of {pagination.totalPages}</Typography>
              <Button disabled={page >= (pagination.totalPages ?? 1)} onClick={() => setPage((p) => p + 1)}>Next</Button>
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
    queryKey: ['admin', 'images', 'orphans', page, PAGE_SIZE],
    queryFn: () => adminApi.listOrphanImages({ page, pageSize: PAGE_SIZE }),
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
            <Button disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>Previous</Button>
            <Typography>Page {page}</Typography>
            <Button disabled={!hasNext} onClick={() => setPage((p) => p + 1)}>Next</Button>
          </Box>
        </Box>
      ) : null}
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
      </Tabs>
      {tab === 0 ? <CloudImages /> : tab === 1 ? <DatabaseImages /> : <OrphanImages />}
    </Box>
  );
}
