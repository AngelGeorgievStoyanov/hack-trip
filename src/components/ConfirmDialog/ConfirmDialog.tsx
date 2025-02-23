import React, { useState, createContext, useContext } from 'react';
import { Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Button } from '@mui/material';



type ConfirmDialogContextValue = {
  confirm: (message: string, title?: string) => Promise<boolean>;
};

const ConfirmDialogContext = createContext<ConfirmDialogContextValue | undefined>(undefined);

export const ConfirmDialogProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [title, setTitle] = useState<string | undefined>('');
  const [resolveCallback, setResolveCallback] = useState<((value: boolean) => void) | null>(null);

  const confirm = (message: string, title?: string): Promise<boolean> => {
    setMessage(message);
    setTitle(title);
    setOpen(true);
    return new Promise((resolve) => {
      setResolveCallback(() => resolve);
    });
  };

  const handleClose = (result: boolean) => {
    if (resolveCallback) {
      resolveCallback(result);
    }
    setOpen(false);
    setMessage('');
    setTitle(undefined);
    setResolveCallback(null);
  };

  return (
    <ConfirmDialogContext.Provider value={{ confirm }}>
      {children}
      <Dialog open={open} onClose={() => handleClose(false)} PaperProps={{
        sx: {
          backgroundColor: '#eee7e7',
          boxShadow: '3px 2px 5px black',
          border: 'solid 1px',
          borderRadius: '0px',
        },
      }}>
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
};

export const useConfirm = (): ConfirmDialogContextValue => {
  const context = useContext(ConfirmDialogContext);
  if (!context) {
    throw new Error('useConfirm must be used within a ConfirmDialogProvider');
  }
  return context;
};

