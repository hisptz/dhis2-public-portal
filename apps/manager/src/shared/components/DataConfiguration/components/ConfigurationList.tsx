import { SimpleTable, SimpleTableColumn, useDialog } from '@hisptz/dhis2-ui'
import { useDataSources } from '../providers/DataSourcesProvider'
import { useEffect } from 'react'
import i18n from '@dhis2/d2-i18n'
import { AddDataSource } from './AddDataSource'
import { useRoutes } from '../hooks/useRoutes'
import { Button, ButtonStrip, IconDelete16, IconView16, Tooltip } from '@dhis2/ui'
import { useNavigate } from '@tanstack/react-router'
import { useDeleteDataSource } from '../hooks/save'
import { DataServiceConfig } from '@packages/shared/schemas'
import { ConfigStatus } from './RunStatus'

const columns: SimpleTableColumn[] = [
    {
        label: i18n.t('Name'),
        key: 'name',
    },
    {
        label: i18n.t('URL'),
        key: 'url',
    },
    {
        label: i18n.t('Latest Migration Status'),
        key: 'status',
    },
    {
        label: i18n.t('Actions'),
        key: 'actions',
    },
]

export function ConfigurationList() {
    const configurations = useDataSources()
    const { routes, refetch: refetchRoutes } = useRoutes()
    const navigate = useNavigate({
        from: "/data-service-configuration/",
    });
    const { confirm } = useDialog()
    const { deleteConfig } = useDeleteDataSource()

    const handleDelete = (config: DataServiceConfig) => {
        confirm({
            title: i18n.t('Confirm delete'),
            message: (
                <span>
                    {i18n.t(
                        'Are you sure you want to delete the configuration '
                    )}
                    <b>{config.source.name}</b>?{' '}
                    {i18n.t('This action cannot be undone.')}
                </span>
            ),
            onConfirm: async () => {
                await deleteConfig(config)
            },
            confirmButtonText: i18n.t('Delete'),
            confirmButtonColor: 'destructive',
        })
    }


    useEffect(() => {
        refetchRoutes()
    }, [configurations.length, refetchRoutes])

    const rows = configurations.map((configuration) => {
        const route = routes.find((r) => r.id === configuration.source.routeId)
        const url =
            route?.url?.replace('/api/**', '') || configuration.source.routeId

        return {
            ...configuration,
            name: configuration.source.name,
            url,
            status: <ConfigStatus configId={configuration.id} />,
            actions: (<ButtonStrip>
                <Tooltip content={i18n.t("View connection")}>

                    <Button small secondary onClick={() => {
                        navigate({
                            to: "/data-service-configuration/$configId",
                            params: {
                                configId: configuration.id,
                            },
                        });
                    }}  icon={<IconView16 />} />
                </Tooltip>
                <Tooltip content={i18n.t("Delete connection")}>
                    <Button small secondary onClick={() => handleDelete(configuration)} icon={<IconDelete16 color='red' />} />

                </Tooltip>

            </ButtonStrip>),
        }
    })

    return (
        <div className="flex flex-col gap-8">
            <div className="flex justify-end">
                <AddDataSource />
            </div>
            <SimpleTable
                rows={rows}
                emptyLabel="There are no configuration present"
                columns={columns}
            />
        </div>
    )
}
