import { useMemo } from 'react'
import { Button, ButtonStrip, Field } from '@dhis2/ui'
import i18n from '@dhis2/d2-i18n'
import { useController, useWatch } from 'react-hook-form'
import {
    DataServiceConfig,
    RunConfigFormValues,
} from '@packages/shared/schemas'
import { RHFMultiSelectField } from '../../../../../../Fields/RHFMultiSelectField'
import { FixedPeriodType } from '@hisptz/dhis2-utils'

const isPeriodTypeLower = (periodTypeA: string, periodTypeB: string) => {
    const rankA = FixedPeriodType.getFromId(periodTypeA, {}).config.rank!
    const rankB = FixedPeriodType.getFromId(periodTypeB, {}).config.rank!
    return rankA < rankB
}

export function ConfigSelector({ config }: { config: DataServiceConfig }) {
    const { field } = useController<RunConfigFormValues, 'dataItemsConfigIds'>({
        name: 'dataItemsConfigIds',
    })
    const periodType = useWatch<
        RunConfigFormValues,
        'runtimeConfig.periodType'
    >({
        name: 'runtimeConfig.periodType',
    })

    const options = useMemo(() => {
        return config.itemsConfig
            .filter(({ periodTypeId }) => {
                if (!periodType) return true
                return (
                    periodTypeId === periodType ||
                    isPeriodTypeLower(periodTypeId, periodType)
                )
            })
            .map(({ id, name, dataElements, periodTypeId }) => {
                return {
                    label: `${name} (items: ${dataElements.length} period type: ${periodTypeId})`,
                    value: id,
                }
            })
    }, [config, periodType])

    return (
        <Field required label={i18n.t('Configuration items')}>
            <div className="flex flex-col gap-2">
                <ButtonStrip>
                    <Button
                        onClick={() => {
                            field.onChange(
                                options.map((period) => period.value)
                            )
                        }}
                        small
                    >
                        {i18n.t('Select all')}
                    </Button>
                    <Button
                        onClick={() => {
                            field.onChange([])
                        }}
                        small
                    >
                        {i18n.t('Clear selection')}
                    </Button>
                </ButtonStrip>
                <RHFMultiSelectField
                    options={options}
                    name={'dataItemsConfigIds'}
                />
            </div>
        </Field>
    )
}
