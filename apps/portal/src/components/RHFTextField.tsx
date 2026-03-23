import { TextInput, TextInputProps } from '@mantine/core'
import { useController } from 'react-hook-form'

interface RHFTextFieldProps extends Omit<TextInputProps, 'name'> {
    name: string
}

export function RHFTextField({ name, ...props }: RHFTextFieldProps) {
    const { field, fieldState } = useController({
        name,
    })

    return <TextInput {...field} error={fieldState.error?.message} {...props} />
}
