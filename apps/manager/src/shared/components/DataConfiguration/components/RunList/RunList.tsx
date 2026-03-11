import {
    DataRun,
    MetadataRun,
} from '@/shared/components/DataConfiguration/components/RunList/hooks/data'
import { CircularLoader, colors, IconError24 } from '@dhis2/ui'
import { SimpleDataTable } from '@hisptz/dhis2-ui'
import i18n from '@dhis2/d2-i18n'
import { PeriodUtility } from '@hisptz/dhis2-utils'
import { RunConfigSummary } from '@/shared/components/DataConfiguration/components/RunConfiguration/components/RunConfigSummary/RunConfigSummary'
import { DataServiceConfig } from '@packages/shared/schemas'
import { useWatch } from 'react-hook-form'
import { RunStatus } from '../RunStatus'
import { useMemo } from 'react'
import { capitalize } from 'lodash'
import { FetchError } from '@dhis2/app-runtime'
import { formatDateTime } from '@/shared/hooks/config'

const metadataColumns = [
    {
        key: 'uid',
        label: i18n.t('Run ID'),
    },
    {
        key: 'serviceType',
        label: i18n.t('Service type'),
    },
    {
        key: 'startedAt',
        label: i18n.t('Initialized at'),
    },

    {
        key: 'sourceType',
        label: i18n.t('Source type'),
    },
    {
        key: 'visualizations',
        label: i18n.t('Visualizations'),
    },
    {
        key: 'maps',
        label: i18n.t('Maps'),
    },
    {
        key: 'dashboards',
        label: i18n.t('Dashboards'),
    },
    {
        key: 'status',
        label: i18n.t('Status'),
    },
    {
        key: 'actions',
        label: i18n.t('Actions'),
    },
]

const dataColumns = [
    {
        key: 'uid',
        label: i18n.t('Run ID'),
    },
    {
        key: 'serviceType',
        label: i18n.t('Service type'),
    },
    {
        key: 'startedAt',
        label: i18n.t('Initialized at'),
    },
    {
        key: 'periods',
        label: i18n.t('Period(s)'),
    },
    {
        key: 'configurations',
        label: i18n.t('Configuration(s)'),
    },
    {
        key: 'status',
        label: i18n.t('Status'),
    },
    {
        key: 'actions',
        label: i18n.t('Actions'),
    },
]

export function RunList({
    loading,
    runs,
    fetching,
    activeTab,
    pagination,
    error,
}: {
    loading: boolean
    runs: (MetadataRun | DataRun)[]
    activeTab: 'metadata' | 'data'
    fetching: boolean
    pagination: {
        page: number
        pageSize: number
        total: number
        pageCount: number
        onPageChange: (page: number) => void
        onPageSizeChange: (pageSize: number) => void
    }
    error: FetchError | null
    refetch: () => void
}) {
    const config = useWatch<DataServiceConfig>()

    const transformRun = (
        run: MetadataRun | DataRun,
        configurationsValue: string
    ) => ({
        id: run.uid,
        ...run,
        serviceType:
            'isDelete' in run
                ? run.isDelete
                    ? i18n.t('Data Deletion')
                    : i18n.t('Data Migration')
                : i18n.t('Metadata Migration'),
        startedAt: formatDateTime(run.startedAt),
        periods: run.periods
            ?.map((period: string) => {
                return PeriodUtility.getPeriodById(period).name
            })
            .join(', '),
        configurations: configurationsValue,
        sourceType:
            'sourceType' in run
                ? capitalize(
                      (run as MetadataRun).sourceType
                          .toString()
                          .split('_')
                          .join(' ')
                  )
                : '',
        visualizations: (run as MetadataRun).visualizations?.length ?? 0,
        maps: (run as MetadataRun).maps?.length ?? 0,
        dashboards: (run as MetadataRun).dashboards?.length ?? 0,
        status: (
            <>
                <RunStatus runId={run.uid} type={activeTab} />
            </>
        ),
        actions: (
            <>
                <RunConfigSummary runId={run.uid} type={activeTab} />
            </>
        ),
    })

    const rows = useMemo(() => {
        if (activeTab === 'metadata') {
            return (
                (runs as MetadataRun[])?.map((run) =>
                    transformRun(run, run.mainConfigId)
                ) ?? []
            )
        } else {
            return (
                (runs as DataRun[])?.map((run) => {
                    const configurations = run.configIds.map(
                        (configId: string) => {
                            const conf = config?.itemsConfig?.find(
                                ({ id }: { id: string }) => id === configId
                            )
                            return conf?.name ?? i18n.t('Unknown')
                        }
                    )
                    return transformRun(run, configurations.join(', '))
                }) ?? []
            )
        }
    }, [runs, config, activeTab])

    const columns = useMemo(() => {
        switch (activeTab) {
            case 'metadata':
                return metadataColumns
            case 'data':
                return dataColumns
        }
    }, [activeTab])

    if (loading) {
        return (
            <div className="w-full h-full flex justify-center items-center">
                <CircularLoader small />
            </div>
        )
    }

    if (error) {
        return (
            <div className="w-full h-full flex justify-center items-center">
                <IconError24 />
                <span style={{ color: colors.grey700 }}>{error.message}</span>
            </div>
        )
    }

    return (
        <SimpleDataTable
            pagination={pagination}
            emptyLabel={i18n.t(
                `There are no ${activeTab === 'metadata' ? 'metadata' : 'data'} runs for this configuration`
            )}
            loading={fetching}
            rows={rows}
            columns={columns}
        />
    )
}
