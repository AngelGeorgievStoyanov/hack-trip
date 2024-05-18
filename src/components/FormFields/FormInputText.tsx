import TextField from '@mui/material/TextField';
import { Control, Controller, FieldPath, FieldValues, Path, RegisterOptions } from "react-hook-form";

interface FormInputTextProps<TFieldValues extends FieldValues> {
    name: Path<TFieldValues>;
    control: Control<TFieldValues, any>;
    label: string;
    rules?: Omit<RegisterOptions<TFieldValues, FieldPath<TFieldValues>>, 'valueAsNumber' | 'valueAsDate' | 'setValueAs' | 'disabled'>;
    disabled?: boolean;
    size?: 'small' | 'medium';
    error?: string | undefined;
    type?: 'text' | 'password' | 'number' | 'intiger' | 'search';
    id?: string | undefined
    color?: "error" | "primary" | "secondary" | "info" | "success" | "warning"
    autoFocus?: boolean | undefined
}


function FormInputText<TFieldValues extends FieldValues>(
    { name, control, label, rules = {}, disabled = false, size = 'medium', error = undefined, type = 'text', id, color, autoFocus }:
        FormInputTextProps<TFieldValues>) {
    return (
        (
            <Controller
                name={name}
                control={control}
                render={({ field }) =>
                    <TextField label={label} disabled={disabled} size={size} error={!!error} id={id}
                        helperText={error || ''} type={type} color={color} autoFocus={autoFocus} {...field} />
                }
                rules={rules}
            />
        )
    )
}

export default FormInputText