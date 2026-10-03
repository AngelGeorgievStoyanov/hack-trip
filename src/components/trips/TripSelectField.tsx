'use client';

import { MenuItem, TextField } from '@mui/material';
import type { SelectChoice } from '@/lib/selects';

interface TripSelectFieldProps {
  name: string;
  label: string;
  value: string;
  choices: SelectChoice[];
  onChange: (value: string) => void;
  onBlur?: () => void;
  error?: boolean;
  helperText?: string;
}

/**
 * A trip select driven by `GET /config/selects`.
 *
 * Without runtime choices (request still pending, failed, or empty) the field keeps the
 * pre-config free-text behaviour, so trip create/edit stays usable while the config endpoint is
 * unavailable. The submitted value is always the option `key`.
 */
export function TripSelectField({
  name,
  label,
  value,
  choices,
  onChange,
  onBlur,
  error,
  helperText,
}: TripSelectFieldProps) {
  if (choices.length === 0) {
    return (
      <TextField
        label={label}
        name={name}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        onBlur={onBlur}
        error={error}
        helperText={helperText}
      />
    );
  }

  return (
    <TextField
      select
      label={label}
      name={name}
      value={value}
      onChange={(event) => onChange(event.target.value)}
      onBlur={onBlur}
      error={error}
      helperText={helperText}
    >
      {choices.map((choice) => (
        <MenuItem key={choice.value} value={choice.value}>
          {choice.label}
        </MenuItem>
      ))}
    </TextField>
  );
}
