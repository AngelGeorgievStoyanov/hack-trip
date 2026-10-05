'use client';

import { createContext, useCallback, useContext, useMemo, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import { Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle } from '@mui/material';

interface ConfirmDialogContextValue {
  confirm: (message: string, title?: string) => Promise<boolean>;
}

const ConfirmDialogContext = createContext<ConfirmDialogContextValue | undefined>(undefined);

export function ConfirmDialogProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [title, setTitle] = useState<string | undefined>(undefined);
  const resolveRef = useRef<((value: boolean) => void) | null>(null);

  const confirm = useCallback(
    (confirmMessage: string, confirmTitle?: string): Promise<boolean> => {
      setMessage(confirmMessage);
      setTitle(confirmTitle);
      setOpen(true);
      return new Promise<boolean>((resolve) => {
        resolveRef.current = resolve;
      });
    },
    [],
  );

  function handleClose(result: boolean): void {
    resolveRef.current?.(result);
    resolveRef.current = null;
    setOpen(false);
    setMessage('');
    setTitle(undefined);
  }

  const value = useMemo(() => ({ confirm }), [confirm]);

  return (
    <ConfirmDialogContext.Provider value={value}>
      {children}
      <Dialog
        open={open}
        onClose={() => handleClose(false)}
        PaperProps={{
          sx: {
            backgroundColor: '#eee7e7',
            boxShadow: '3px 2px 5px black',
            border: 'solid 1px',
            borderRadius: '0px',
          },
        }}
      >
        <DialogTitle>{title || 'Confirm'}</DialogTitle>
        <DialogContent>
          <DialogContentText>{message}</DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => handleClose(false)} color="primary" variant="contained">
            No
          </Button>
          <Button onClick={() => handleClose(true)} color="primary" variant="contained" autoFocus>
            Yes
          </Button>
        </DialogActions>
      </Dialog>
    </ConfirmDialogContext.Provider>
  );
}

export function useConfirm(): ConfirmDialogContextValue {
  const context = useContext(ConfirmDialogContext);
  if (!context) {
    throw new Error('useConfirm must be used within a ConfirmDialogProvider');
  }
  return context;
}
