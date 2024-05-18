import TextField from '@mui/material/TextField';
import { Control, Controller, FieldPath, FieldValues, Path, RegisterOptions } from "react-hook-form";

interface FormTextAreaProps<TFieldValues extends FieldValues> {
    name: Path<TFieldValues>
    control: Control<TFieldValues, any>;
    label: string;
    rules?: Omit<RegisterOptions<TFieldValues, FieldPath<TFieldValues>>, 'valueAsNumber' | 'valueAsDate' | 'setValueAs' | 'disabled'>;
    disabled?: boolean;
    size?: 'small' | 'medium';
    error?: string | undefined;
    type?: 'text' | 'password' | 'number' | 'intiger';
    multiline: boolean
    rows: number;

}


function FormTextArea<TFieldValues extends FieldValues>(
    { name, control, label, rules = {}, disabled = false, size = 'medium', error = undefined, type = 'text', multiline, rows }:
        FormTextAreaProps<TFieldValues>) {
    return (
        (
            <Controller
                name={name}
                control={control}
                render={({ field }) =>
                    <TextField label={label} disabled={disabled} size={size} error={!!error} multiline={multiline} rows={rows}
                        helperText={error || ''} type={type} {...field} />
                }
                rules={rules}
            />
        )
    )
}

export default FormTextArea