'use client';

import { useState, type ReactNode } from 'react';
import { IconButton, InputAdornment, TextField } from '@mui/material';
import type { UseFormRegisterReturn } from 'react-hook-form';
import { HidePasswordIcon, ShowPasswordIcon } from '@/constants/icons';

interface PasswordFieldProps {
  label: string;
  autoComplete?: string;
  disabled?: boolean;
  error?: boolean;
  helperText?: ReactNode;
  registration: UseFormRegisterReturn;
}

export function PasswordField({
  label,
  autoComplete = 'new-password',
  disabled = false,
  error = false,
  helperText = ' ',
  registration,
}: PasswordFieldProps) {
  const [visible, setVisible] = useState(false);

  return (
    <TextField
      label={label}
      disabled={disabled}
      type={visible ? 'text' : 'password'}
      autoComplete={autoComplete}
      {...registration}
      error={error}
      helperText={helperText}
      slotProps={{
        input: {
          endAdornment: (
            <InputAdornment position="end">
              <IconButton
                disabled={disabled}
                aria-label={visible ? 'Hide password' : 'Show password'}
                onClick={() => setVisible((current) => !current)}
                onMouseDown={(event) => event.preventDefault()}
                edge="end"
              >
                {visible ? <HidePasswordIcon /> : <ShowPasswordIcon />}
              </IconButton>
            </InputAdornment>
          ),
        },
      }}
    />
  );
}
