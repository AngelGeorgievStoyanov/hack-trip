'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useReportActions } from '@/hooks/useReportActions';
import { Alert, Button, IconButton, Tooltip } from '@mui/material';
import { Dialog, DialogActions, DialogContent, DialogTitle, TextField } from '@mui/material';
import { visuallyHidden } from '@mui/utils';
import ReportIcon from '@mui/icons-material/Report';
import ReportOffIcon from '@mui/icons-material/ReportOff';
import type { ReportTargetTypeInput } from '@/types';

interface ReportButtonProps {
  targetType: ReportTargetTypeInput;
  targetId: number;
  /**
   * Current-user report state for the target, taken from the API response
   * (`social.reportedByMe`). It is the source of truth for the rendered icon.
   */
  initialReported?: boolean;
  /** Tooltip label for the not-yet-reported state, e.g. `REPORT COMMENT`. */
  label?: string;
  /** Called after the current user's report state for the target changed. */
  onReportedChange?: (reported: boolean) => void;
  /** Icon button size. `'medium'` elsewhere, `'small'` for image overlays. */
  size?: 'small' | 'medium';
}

export function ReportButton({
  targetType,
  targetId,
  initialReported = false,
  label = 'REPORT TRIP',
  onReportedChange,
  size = 'medium',
}: ReportButtonProps) {
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState('');
  const [done, setDone] = useState(initialReported);

  // The API owns the report state: a fresh response (for example after a reload) must
  // restore the reported icon without another click.
  useEffect(() => {
    setDone(initialReported);
  }, [initialReported]);

  const { report, unreport, pending, error, clearError } = useReportActions(
    targetType,
    targetId,
    {
      onReportedChange: (reported) => {
        setDone(reported);
        onReportedChange?.(reported);
        if (reported) {
          setReason('');
          setOpen(false);
        }
      },
    },
  );

  const { status, viewerCacheKey } = useAuth();
  const isAuthenticated = status === 'authenticated';

  useEffect(() => {
    setOpen(false);
    setReason('');
    clearError();
  }, [viewerCacheKey, clearError]);

  function submit(): void {
    report(reason);
  }

  function handleClick(): void {
    if (done) {
      // The item is already reported by this user: withdraw the report again.
      unreport();
      return;
    }
    clearError();
    setOpen(true);
  }

  return (
    <>
      {isAuthenticated ? (
        <>
          <Tooltip title={done ? 'UN REPORT' : label} arrow>
            <span style={{ display: 'inline-flex' }}>
              <IconButton
                onClick={handleClick}
                disabled={pending}
                aria-label={done ? 'Withdraw report' : label}
                aria-pressed={done}
                color={done ? 'error' : 'primary'}
                size={size}
                sx={{ '&:hover': { color: 'red' } }}
              >
                {done ? <ReportOffIcon /> : <ReportIcon />}
              </IconButton>
            </span>
          </Tooltip>
          <Dialog open={open} onClose={() => setOpen(false)}>
            <DialogTitle>Report this content</DialogTitle>
            <DialogContent>
              {error ? <Alert severity="error">{error}</Alert> : null}
              <TextField
                label="Reason (optional)"
                multiline
                minRows={2}
                fullWidth
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                sx={{ mt: 1 }}
              />
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setOpen(false)}>Cancel</Button>
              <Button onClick={submit} disabled={pending}>
                Submit
              </Button>
            </DialogActions>
          </Dialog>
        </>
      ) : null}
      {isAuthenticated && error && !open ? (
        <span role="alert" style={{ color: 'red', fontSize: '0.75rem' }}>
          {error}
        </span>
      ) : null}
      {/* The icon carries the reported state; the status is announced but not shown as a
          second, text-based control. */}
      {isAuthenticated && done ? (
        <span role="status" style={visuallyHidden}>
          Reported. Thank you.
        </span>
      ) : null}
    </>
  );
}
