'use client';

import { useEffect, useState } from 'react';
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
  const selectedChoice = choices.find((choice) => choice.value === value) ?? null;
  const [inputValue, setInputValue] = useState(selectedChoice?.label ?? '');

  useEffect(() => {
    if (selectedChoice) {
      setInputValue(selectedChoice.label);
    }
  }, [selectedChoice?.value, selectedChoice?.label]);

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
    return (
      <Autocomplete
        options={choices}
        value={selectedChoice}
        inputValue={inputValue}
        onInputChange={(_, nextInputValue, reason) => {
          // MUI emits "reset" when the selected value is cleared. Do not let that
          // event overwrite the text the user is currently typing.
          if (reason === 'input' || reason === 'clear') {
            setInputValue(nextInputValue);
          }
          if (reason === 'input' || reason === 'clear') {
            onChange('');
          }
        }}
        getOptionLabel={(choice) => choice.label}
        isOptionEqualToValue={(option, selected) => option.value === selected.value}
        filterOptions={(options, state) => {
          const query = state.inputValue.trim().toLowerCase();
          if (!query) return options;
          return options.filter((choice) =>
            `${choice.label} ${choice.value}`.toLowerCase().includes(query),
          );
        }}
        onChange={(_, choice) => {
          onChange(choice?.value ?? '');
          setInputValue(choice?.label ?? '');
        }}
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
