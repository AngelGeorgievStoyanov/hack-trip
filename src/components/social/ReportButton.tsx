'use client';

import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { Alert, Button, Dialog, DialogActions, DialogContent, DialogTitle, TextField } from '@mui/material';
import { socialApi } from '@/api/social';
import { getGenericErrorMessage } from '@/lib/errors';
import type { ReportTargetTypeInput } from '@/types';

interface ReportButtonProps {
  targetType: ReportTargetTypeInput;
  targetId: number;
}

export function ReportButton({ targetType, targetId }: ReportButtonProps) {
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState('');
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const mutation = useMutation({
    mutationFn: (text: string) => socialApi.report({ targetType, targetId, reason: text || undefined }),
    onSuccess: () => {
      setDone(true);
      setReason('');
      setOpen(false);
    },
    onError: (e) => setError(getGenericErrorMessage(e)),
  });

  function submit(): void {
    mutation.mutate(reason);
  }

  return (
    <>
      <Button variant="outlined" onClick={() => setOpen(true)}>
        Report
      </Button>
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
          <Button onClick={submit} disabled={mutation.isPending}>
            Submit
          </Button>
        </DialogActions>
      </Dialog>
      {done ? <span role="status">Reported. Thank you.</span> : null}
    </>
  );
}
