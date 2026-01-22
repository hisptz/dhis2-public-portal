import React from 'react'
import {
    SimpleTable,
    SimpleTableColumn,
    SimpleTableRow,
} from '@hisptz/dhis2-ui'
import i18n from '@dhis2/d2-i18n'

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

export function DashboardVisualizations({
    visualizations,
}: {
    visualizations: SimpleTableRow[]
}) {
    return <SimpleTable columns={columns} rows={visualizations} />
}
