import i18n from '@/locales'
import { CheckboxField } from '@dhis2/ui'
import { useState } from 'react'
import { useFormContext, useWatch } from 'react-hook-form'
import { ManualDataItemMappingField } from './ManualDataItemMappingField'

export function ManualDataItemMappingToggle({ routeId }: { routeId?: string }) {
    const { control, setValue } = useFormContext()

    const dataItems = useWatch({
        control,
        name: 'dataItems',
    })

    const [enabled, setEnabled] = useState<boolean>(
        (dataItems?.length ?? 0) > 0
    )

    const handleToggle = (checked: boolean) => {
        setEnabled(checked)

        if (!checked) {
            setValue('dataItems', [])
        }
    }

    return (
        <>
            <CheckboxField
                checked={enabled}
                label={i18n.t('Data items')}
                onChange={({ checked }) => handleToggle(checked)}
            />

            {enabled && (
                <ManualDataItemMappingField
                    routeId={routeId}
                    name="dataItems"
                    helpText={i18n.t(
                        'Optionally define explicit mappings between source and destination data items'
                    )}
                />
            )}
        </>
    )
}
