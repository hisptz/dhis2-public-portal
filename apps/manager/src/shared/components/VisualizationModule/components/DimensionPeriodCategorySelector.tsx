import { useController, useFormContext } from 'react-hook-form'
import { MultiSelectField, MultiSelectOption } from '@dhis2/ui'
import i18n from '@dhis2/d2-i18n'
import { useEffect } from 'react'

const PERIOD_CATEGORY_OPTIONS = [
    { label: i18n.t('Relative'), value: 'RELATIVE' },
    { label: i18n.t('Fixed'), value: 'FIXED' },
]

type Props = {
    categoriesField: string
    periodTypesField: string
    periodsField: string
    label?: string
    helpText?: string
    required?: boolean
    disabled?: boolean
}

export const DimensionPeriodCategorySelector = ({
    categoriesField,
    periodTypesField,
    periodsField,
    label,
    helpText,
    required,
    disabled,
}: Props) => {
    const { control } = useFormContext()

    const {
        field: categoriesFieldController,
        fieldState: { error },
    } = useController({ name: categoriesField, control })

    const { field: periodTypesFieldController } = useController({
        name: periodTypesField,
        control,
    })

    const { field: periodsFieldController } = useController({
        name: periodsField,
        control,
    })

    useEffect(() => {
        if (!categoriesFieldController.value?.length) {
            categoriesFieldController.onChange(['RELATIVE', 'FIXED'])
        }
    }, [])

    return (
        <MultiSelectField
            label={label ?? i18n.t('Period categories')}
            helpText={helpText}
            required={required}
            disabled={disabled}
            error={!!error}
            validationText={error?.message}
            selected={categoriesFieldController.value ?? []}
            onChange={({ selected }) => {
                categoriesFieldController.onChange(selected)
                periodTypesFieldController.onChange([])
                periodsFieldController.onChange([])
            }}
        >
            {PERIOD_CATEGORY_OPTIONS.map((opt) => (
                <MultiSelectOption
                    key={opt.value}
                    label={opt.label}
                    value={opt.value}
                />
            ))}
        </MultiSelectField>
    )
}
