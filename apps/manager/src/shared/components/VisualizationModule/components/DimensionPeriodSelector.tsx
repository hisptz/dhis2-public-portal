import i18n from '@dhis2/d2-i18n'
import { PeriodTypeCategory, PeriodUtility } from '@hisptz/dhis2-utils'
import {
    Field,
    MultiSelectField,
    MultiSelectOption,
    SingleSelectField,
    SingleSelectOption,
} from '@dhis2/ui'
import { useState, useMemo, useRef } from 'react'
import { useWatch, useController } from 'react-hook-form'

type Props = {
    categoriesField: string
    periodTypesField: string
    periodsField: string
    helpText?: string
}

export const DimensionPeriodSelector = ({
    categoriesField,
    periodTypesField,
    periodsField,
    helpText,
}: Props) => {
    const [year, setYear] = useState<number>(new Date().getFullYear())

    const selectedPeriodTypes = useWatch({ name: periodTypesField })
    const selectedCategories: ('RELATIVE' | 'FIXED')[] | undefined = useWatch({
        name: categoriesField,
    })

    const { field: periodsFieldController } = useController({
        name: periodsField,
    })

    const periodLabelMapRef = useRef<Record<string, string>>({})

    const allPeriods = useMemo(() => {
        if (!selectedPeriodTypes?.length) return []

        const includeFixed =
            !selectedCategories?.length || selectedCategories.includes('FIXED')
        const includeRelative =
            !selectedCategories?.length ||
            selectedCategories.includes('RELATIVE')

        const fixedUtility = includeFixed
            ? PeriodUtility.fromObject({
                  year,
                  category: PeriodTypeCategory.FIXED,
                  preference: { allowFuturePeriods: false },
              })
            : null

        const relativeUtility = includeRelative
            ? PeriodUtility.fromObject({
                  year,
                  category: PeriodTypeCategory.RELATIVE,
                  preference: { allowFuturePeriods: false },
              })
            : null

        return selectedPeriodTypes.flatMap((periodTypeId: string) => {
            const fixedPeriods = fixedUtility
                ? (() => {
                      try {
                          return (
                              fixedUtility.getPeriodType(periodTypeId)
                                  ?.periods ?? []
                          )
                      } catch {
                          return []
                      }
                  })()
                : []

            const relativePeriods = relativeUtility
                ? (() => {
                      try {
                          return (
                              relativeUtility.getPeriodType(periodTypeId)
                                  ?.periods ?? []
                          )
                      } catch {
                          return []
                      }
                  })()
                : []

            return [...fixedPeriods, ...relativePeriods]
        })
    }, [selectedPeriodTypes, selectedCategories, year])

    const periodOptions = useMemo(() => {
        const currentOptions = allPeriods.map((period) => ({
            label: period.name,
            value: period.id,
        }))

        currentOptions.forEach(({ value, label }) => {
            periodLabelMapRef.current[value] = label
        })

        const currentValues = new Set(currentOptions.map((o) => o.value))
        const selectedValues: string[] = periodsFieldController.value ?? []
        const ghostOptions = selectedValues
            .filter((v) => !currentValues.has(v))
            .map((v) => ({
                label: periodLabelMapRef.current[v] ?? v,
                value: v,
            }))

        return [...currentOptions, ...ghostOptions]
    }, [allPeriods, periodsFieldController.value])

    const isDisabled = !(selectedPeriodTypes?.length > 0)

    return (
        <Field label={i18n.t('Periods')} helpText={helpText}>
            <div className="flex flex-col gap-2">
                <div className="flex gap-2 items-start">
                    <div className="flex-1">
                        <MultiSelectField
                            key={`${selectedPeriodTypes?.join('-')}-${year}`}
                            selected={periodsFieldController.value ?? []}
                            disabled={isDisabled}
                            onChange={({ selected }) => {
                                periodsFieldController.onChange(selected)
                            }}
                        >
                            {periodOptions.map((opt) => (
                                <MultiSelectOption
                                    key={opt.value}
                                    label={opt.label}
                                    value={opt.value}
                                />
                            ))}
                        </MultiSelectField>
                    </div>
                    <div className="w-32">
                        <SingleSelectField
                            selected={year.toString()}
                            disabled={isDisabled}
                            onChange={({ selected }) => {
                                setYear(Number(selected))
                            }}
                        >
                            {Array.from(
                                { length: 10 },
                                (_, i) => new Date().getFullYear() - i
                            ).map((y) => (
                                <SingleSelectOption
                                    key={y}
                                    label={y.toString()}
                                    value={y.toString()}
                                />
                            ))}
                        </SingleSelectField>
                    </div>
                </div>
            </div>
        </Field>
    )
}
