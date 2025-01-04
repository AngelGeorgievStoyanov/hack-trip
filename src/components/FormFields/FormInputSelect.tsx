import React from 'react';
import { Control, Controller, FieldValues, Path } from 'react-hook-form';
import { FormControl, InputLabel, MenuItem, Select } from '@mui/material';

export interface SelectOption {
    key: number | string;
    value: string;
}

interface FormInputSelectProps<TFieldValues extends FieldValues> {
    name: Path<TFieldValues>;
    control: Control<TFieldValues, any>;
    label: string;
    options: SelectOption[];
    defaultOptionIndex?: number;
    rules?: any;
    disabled?: boolean;
    size?: 'small' | 'medium';
    error?: string;
}

function FormInputSelect<TFieldValues extends FieldValues>({
    name,
    control,
    label,
    options = [],
    defaultOptionIndex = 0,
    rules = {},
    disabled = false,
    size = 'medium',
    error = undefined
}: FormInputSelectProps<TFieldValues>) {
    return (
        <Controller
            name={name}
            control={control}
            render={({ field }) => (
                <FormControl fullWidth size={size} disabled={disabled} error={!!error}>
                    <InputLabel id={`${name}-label`}>{label}</InputLabel>
                    <Select
                        labelId={`${name}-label`}
                        id={name}
                        label={label}
                        value={field.value || options[defaultOptionIndex]?.key}
                        onChange={field.onChange}
                    >
                        {options.map((option) => (
                            <MenuItem key={option.key} value={option.key}>
                                {option.value}
                            </MenuItem>
                        ))}
                    </Select>
                    {error && <span style={{ color: 'red' }}>{error}</span>}
                </FormControl>
            )}
            rules={rules}
        />
    );
}

export default FormInputSelect;
