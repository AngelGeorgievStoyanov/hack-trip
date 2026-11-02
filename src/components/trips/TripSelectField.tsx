'use client';

import { Autocomplete, MenuItem, TextField } from '@mui/material';
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
  searchable?: boolean;
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
  searchable = false,
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

  if (searchable) {
    const selectedChoice = choices.find((choice) => choice.value === value) ?? null;

    return (
      <Autocomplete
        options={choices}
        value={selectedChoice}
        getOptionLabel={(choice) => choice.label}
        isOptionEqualToValue={(option, selected) => option.value === selected.value}
        filterOptions={(options, state) => {
          const query = state.inputValue.trim().toLowerCase();
          if (!query) return options;
          return options.filter((choice) =>
            `${choice.label} ${choice.value}`.toLowerCase().includes(query),
          );
        }}
        onChange={(_, choice) => onChange(choice?.value ?? '')}
        onBlur={onBlur}
        autoHighlight
        openOnFocus
        renderInput={(params) => (
          <TextField
            {...params}
            name={name}
            label={label}
            error={error}
            helperText={helperText}
          />
        )}
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
