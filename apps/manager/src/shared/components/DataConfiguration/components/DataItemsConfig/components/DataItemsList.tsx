import { useFieldArray, useWatch } from 'react-hook-form'
import { DataServiceConfig } from '@packages/shared/schemas'
import { SimpleTable, SimpleTableColumn } from '@hisptz/dhis2-ui'
import i18n from '@dhis2/d2-i18n'
import { startCase } from 'lodash'
import { FixedPeriodType } from '@hisptz/dhis2-utils'
import { ButtonStrip, Divider, Button, IconDelete16 } from '@dhis2/ui'
import { AddDataItemConfig } from './AddDataItemConfig/AddDataItemConfig'
import { EditDataItemConfig } from './AddDataItemConfig/EditDataItemConfig'
import { DeleteConfirmationAlert } from '../../DeleteConfirmationAlert'
import React from 'react'

const columns: SimpleTableColumn[] = [
    {
        label: i18n.t('ID'),
        key: 'id',
    },
    {
        label: i18n.t('Type'),
        key: 'type',
    },
    {
        label: i18n.t('Period Type'),
        key: 'periodType',
    },

    {
        label: i18n.t('Actions'),
        key: 'actions',
    },
]

export function DataItemsList() {
    const { fields, append, update, remove } = useFieldArray<
        DataServiceConfig,
        'itemsConfig'
    >({
        name: 'itemsConfig',
        keyName: 'fieldId' as unknown as 'id',
    })

    const [deleteStates, setDeleteStates] = React.useState<
        Record<number, boolean>
    >({})

    const config = useWatch<DataServiceConfig>()
    const routeId = config?.source?.routeId

    const rows = fields.map((item, index) => {
        const hide = deleteStates[index] ?? true
        const onClose = () =>
            setDeleteStates((prev) => ({ ...prev, [index]: true }))
        const onShow = () =>
            setDeleteStates((prev) => ({ ...prev, [index]: false }))

        return {
            ...item,
            type: startCase(item.type.toLowerCase()),
            periodType: FixedPeriodType.getFromId(item.periodTypeId, {}).config
                .name,
            actions: (
                <ButtonStrip>
                    <EditDataItemConfig
                        config={item}
                        routeId={routeId}
                        onUpdate={(data) => update(index, data)}
                    />

                    {!hide && (
                        <DeleteConfirmationAlert
                            title={i18n.t(`Delete ${item.name} config`)}
                            message={i18n.t(
                                `Are you sure you want to delete ${item.name} config?`
                            )}
                            onConfirm={() => remove(index)}
                            hide={hide}
                            onClose={onClose}
                        />
                    )}
                    <Button
                        small
                        icon={<IconDelete16 color="red" />}
                        onClick={onShow}
                    />
                </ButtonStrip>
            ),
        }
    })

    return (
        <div className="flex flex-col gap-2 w-full">
            <ButtonStrip end>
                <AddDataItemConfig routeId={routeId} onAdd={append} />
            </ButtonStrip>
            <Divider />
            <SimpleTable
                columns={columns}
                rows={rows}
                emptyLabel={i18n.t('There are no data items present')}
            />
        </div>
    )
}
