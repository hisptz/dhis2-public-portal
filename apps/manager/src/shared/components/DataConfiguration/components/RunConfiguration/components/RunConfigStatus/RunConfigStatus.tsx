import { Tag } from '@dhis2/ui'
import i18n from '@dhis2/d2-i18n'

export type RunStatus = 'QUEUED' | 'DONE' | 'FAILED' | 'INIT'
export function StatusIndicator({ status }: { status: RunStatus }) {
    switch (status) {
        case null:
            return <Tag>{i18n.t('N/A')}</Tag>
        case 'QUEUED':
            return <Tag neutral>{i18n.t('Idle')}</Tag>
        case 'INIT':
            return <Tag neutral>{i18n.t('Initialized')}</Tag>
        case 'FAILED':
            return <Tag negative>{i18n.t('Failed')}</Tag>
        case 'DONE':
            return <Tag positive>{i18n.t('Done')}</Tag>
    }
}
