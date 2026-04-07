import { useMemo } from 'react'
import { useController, useFormContext, useWatch } from 'react-hook-form'
import { MultiSelectField, MultiSelectOption } from '@dhis2/ui'
import { PeriodTypeCategory, PeriodUtility } from '@hisptz/dhis2-utils'
import i18n from '@dhis2/d2-i18n'

type Props = {
    categoriesField: string
    periodTypesField: string
    periodsField: string
    label?: string
    helpText?: string
    required?: boolean
    disabled?: boolean
}

export const DimensionPeriodTypeSelector = ({
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
        field: periodTypesFieldController,
        fieldState: { error },
    } = useController({
        name: periodTypesField,
        control,
    })

    const { field: periodsFieldController } = useController({
        name: periodsField,
        control,
    })

    const selectedCategories: string[] = useWatch({ name: categoriesField })

    const periodTypeOptions = useMemo(() => {
        const categories = selectedCategories?.length
            ? selectedCategories
            : ['FIXED', 'RELATIVE']

        const allPeriodTypes = categories.flatMap((category) => {
            try {
                return PeriodUtility.fromObject({
                    year: new Date().getFullYear(),
                    category: category as PeriodTypeCategory,
                }).periodTypes
            } catch {
                return []
            }
        })

        const unique = new Map(allPeriodTypes.map((pt) => [pt.id, pt]))

        return Array.from(unique.values()).map((pt) => ({
            label: pt.config.name,
            value: pt.id,
        }))
    }, [selectedCategories])

    return (
        <MultiSelectField
            label={label ?? i18n.t('Period types')}
            helpText={helpText}
            required={required}
            disabled={disabled || !(selectedCategories?.length > 0)}
            error={!!error}
            validationText={error?.message}
            selected={periodTypesFieldController.value ?? []}
            onChange={({ selected }) => {
                periodTypesFieldController.onChange(selected)
                periodsFieldController.onChange([])
            }}
        >
            {periodTypeOptions.map((opt) => (
                <MultiSelectOption
                    key={opt.value}
                    label={opt.label}
                    value={opt.value}
                />
            ))}
        </MultiSelectField>
    )
}
