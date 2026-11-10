'use client';

import { Fragment, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Collapse,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';
import { adminApi } from '@/api/admin';
import { getGenericErrorMessage } from '@/lib/errors';
import { ADMIN_PAGE_SIZE_DEFAULT } from '@/constants/ui';
import type { RouteNotFoundLogDto } from '@/types/admin';

function formatDate(value: string | null): string {
  if (!value) return '—';
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleString();
}

function formatDiagnosticValue(value: string | null): string {
  if (!value) return '—';

  try {
    return JSON.stringify(JSON.parse(value), null, 2);
  } catch {
    return value;
  }
}

function DiagnosticField({ label, value }: { label: string; value: string | null }) {
  return (
    <Box sx={{ minWidth: 0 }}>
      <Typography variant="subtitle2" sx={{ mb: 0.5 }}>
        {label}
      </Typography>
      <Box
        component="pre"
        sx={{
          m: 0,
          p: 1,
          maxWidth: '100%',
          overflow: 'auto',
          whiteSpace: 'pre-wrap',
          overflowWrap: 'anywhere',
          borderRadius: 1,
          bgcolor: 'action.hover',
          fontFamily: 'monospace',
          fontSize: '0.8rem',
        }}
      >
        {formatDiagnosticValue(value)}
      </Box>
    </Box>
  );
}

function RouteNotFoundLogDetails({ item }: { item: RouteNotFoundLogDto }) {
  return (
    <Box sx={{ display: 'grid', gap: 2, p: 2 }}>
      <DiagnosticField label="Request path" value={item.reqUrl} />
      <DiagnosticField label="Headers" value={item.reqHeaders} />
      <DiagnosticField label="Query" value={item.reqQuery} />
      <DiagnosticField label="Body" value={item.reqBody} />
      <DiagnosticField label="Params" value={item.reqParams} />
    </Box>
  );
}

export function AdminRouteNotFoundLogs() {
  const [page, setPage] = useState(1);
  const [expandedRows, setExpandedRows] = useState<Record<number, boolean>>({});

  const { data, isLoading, error } = useQuery({
    queryKey: ['admin', 'route-not-found-logs', page, ADMIN_PAGE_SIZE_DEFAULT],
    queryFn: () => adminApi.listRouteNotFoundLogs({ page, pageSize: ADMIN_PAGE_SIZE_DEFAULT }),
  });

  const pagination = data?.pagination;

  const toggleRow = (id: number) => {
    setExpandedRows((current) => ({ ...current, [id]: !current[id] }));
  };

  return (
    <Box>
      <Typography variant="h4">Route not found logs</Typography>
      {error ? <Alert severity="error">{getGenericErrorMessage(error)}</Alert> : null}
      {isLoading ? <CircularProgress /> : null}
      {data ? (
        <TableContainer component={Paper}>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Date</TableCell>
                <TableCell>Method</TableCell>
                <TableCell>IP</TableCell>
                <TableCell>User</TableCell>
                <TableCell>Email</TableCell>
                <TableCell align="right">Details</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {data.items.map((item) => {
                const isExpanded = Boolean(expandedRows[item.id]);

                return (
                  <Fragment key={item.id}>
                    <TableRow hover>
                      <TableCell>{formatDate(item.date)}</TableCell>
                      <TableCell>{item.reqMethod ?? '—'}</TableCell>
                      <TableCell>{item.reqIp ?? '—'}</TableCell>
                      <TableCell>{item.reqUserId ?? '—'}</TableCell>
                      <TableCell>{item.reqUserEmail ?? '—'}</TableCell>
                      <TableCell align="right">
                        <Button
                          size="small"
                          aria-expanded={isExpanded}
                          aria-controls={`route-not-found-details-${item.id}`}
                          onClick={() => toggleRow(item.id)}
                        >
                          {isExpanded ? 'Hide' : 'View'}
                        </Button>
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell
                        colSpan={6}
                        sx={{ p: 0, borderBottom: isExpanded ? undefined : 0 }}
                      >
                        <Collapse in={isExpanded} timeout="auto" unmountOnExit>
                          <Box id={`route-not-found-details-${item.id}`}>
                            <RouteNotFoundLogDetails item={item} />
                          </Box>
                        </Collapse>
                      </TableCell>
                    </TableRow>
                  </Fragment>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      ) : null}
      {pagination && (pagination.totalPages ?? 0) > 1 ? (
        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', mt: 1 }}>
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
  );
}
