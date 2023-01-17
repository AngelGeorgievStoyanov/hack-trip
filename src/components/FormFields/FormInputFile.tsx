import { Input } from '@mui/material';
import TextField from '@mui/material/TextField';
import { Control, Controller, FieldPath, FieldValues, Path, RegisterOptions, UnPackAsyncDefaultValues } from "react-hook-form";

interface FormInputTextProps<TFieldValues extends FieldValues> {
    name: Path<UnPackAsyncDefaultValues<TFieldValues>>
    control: Control<TFieldValues, any>;
    rules?: Omit<RegisterOptions<TFieldValues, FieldPath<TFieldValues>>, 'valueAsNumber' | 'valueAsDate' | 'setValueAs' | 'disabled'>;
    disabled?: boolean;
    size?: 'small' | 'medium';
    error?: string | undefined;
    type?:  'file';
    id?: string | undefined
     accept?: '.jpg' | '.jpeg' | '.png' | 'image/*';
    multiple?:boolean
}


function FormInputText<TFieldValues extends FieldValues>(
    { name, control,  rules = {}, disabled = false, size = 'medium', error = undefined, type = 'file', id,  multiple }:
        FormInputTextProps<TFieldValues>) {
    return (
        (
            <Controller
                name={name}
                control={control}
                render={({ field }) =>


                    <Input disabled={disabled} size={size} error={!!error} id={id}  multiline={multiple} 
                        type={type} {...field} />
                }
                rules={rules}
            />
        )
    )
}

export default FormInputText