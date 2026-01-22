import React from 'react'
import { useFormContext } from 'react-hook-form'
import { Field, InputField } from '@dhis2/ui'

type ColorPickerProps = {
    name: string
    label?: string
}

export function ColorPicker({ name, label }: ColorPickerProps) {
    const {
        register,
        watch,
        setValue,
        formState: { errors },
    } = useFormContext()

    const value = watch(name)

    const handleColorInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setValue(name, e.target.value, { shouldValidate: true })
    }

    const handleTextInputChange = ({ value }: { value?: string }) => {
        setValue(name, value, { shouldValidate: true })
    }

    const error = !!errors[name]
    const validationText = (errors[name] as { message?: string })?.message

    return (
        <Field label={label} error={error} validationText={validationText}>
            <div className="flex items-center gap-2">
                <input
                    type="color"
                    {...register(name)}
                    defaultValue="#000000"
                    value={value}
                    onChange={handleColorInputChange}
                    className="w-10 h-10  cursor-pointer rounded-sm p-0"
                />
                <InputField
                    className="w-20"
                    dense
                    /* @ts-expect-error @dhis2/ui errors*/
                    pattern="#[0-9a-fA-F]{6}"
                    name={name}
                    value={value || ''}
                    onChange={handleTextInputChange}
                    error={error}
                />
            </div>
        </Field>
    )
}
