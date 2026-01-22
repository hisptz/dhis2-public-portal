import React from 'react'
import i18n from '@dhis2/d2-i18n'
import {
    SimpleTable,
    SimpleTableColumn,
    SimpleTableRow,
} from '@hisptz/dhis2-ui'

const columns: SimpleTableColumn[] = [
    {
        label: i18n.t('Label'),
        key: 'name',
    },
    {
        label: i18n.t('Type'),
        key: 'type',
    },
    {
        label: i18n.t('Caption'),
        key: 'caption',
    },
]

export function GroupVisualizations({
    visualizations,
}: {
    visualizations: SimpleTableRow[]
}) {
    return <SimpleTable columns={columns} rows={visualizations} />
}
