import { useMemo } from 'react'
import { SimpleTable, SimpleTableColumn } from '@hisptz/dhis2-ui'
import i18n from '@dhis2/d2-i18n'
import { Section } from '@packages/shared/schemas'
import { startCase } from 'lodash-es'

const columns: SimpleTableColumn[] = [
    {
        label: i18n.t('Label'),
        key: 'label',
    },
    {
        label: i18n.t('Section title'),
        key: 'title',
    },
    {
        label: i18n.t('Type'),
        key: 'type',
    },
    {
        label: i18n.t('Actions'),
        key: 'actions',
    },
]

export function Sections({ sections }: { sections: Section[] }) {
    const rows = useMemo(
        () =>
            sections.map((section) => ({
                ...section,
                type: startCase(section?.type?.toLowerCase()),
            })),
        [sections]
    )

    return <SimpleTable columns={columns} rows={rows} />
}
