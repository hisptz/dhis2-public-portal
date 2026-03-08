import { createLazyFileRoute, useNavigate } from '@tanstack/react-router'
import {
    Button,
    ButtonStrip,
    IconArrowLeft24,
    IconSettings24,
    Tooltip,
} from '@dhis2/ui'
import i18n from '@dhis2/d2-i18n'
import { FormTestConnection } from '@/shared/components/DataConfiguration/components/FormTestConnection'
import { RunConfiguration } from '@/shared/components/DataConfiguration/components/RunConfiguration/RunConfiguration'
import { PageHeader } from '@/shared/components/PageHeader'
import { DataServiceConfig } from '@packages/shared/schemas'
import { useWatch } from 'react-hook-form'
import { RunList } from '@/shared/components/DataConfiguration/components/RunList/RunList'
import { useConfigurationRuns } from '@/shared/components/DataConfiguration/components/RunList/hooks/data'

export const Route = createLazyFileRoute(
    '/data-service-configuration/_provider/$configId/_provider/'
)({
    component: RouteComponent,
})

function RouteComponent() {
    const navigate = useNavigate({
        from: '/data-service-configuration/$configId',
    })

    const config = useWatch<DataServiceConfig>()
    const source = config?.source

    const {
        loading,
        dataRuns,
        metadataRuns,
        fetching,
        pagination,
        error,
        refetch,
    } = useConfigurationRuns()

    return (
        <div className="h-full w-full flex flex-col gap-4 ">
            <div className="pb-2">
                <Button
                    onClick={() => {
                        navigate({
                            to: '/data-service-configuration',
                        })
                    }}
                    icon={<IconArrowLeft24 />}
                >
                    {i18n.t('Back')}
                </Button>
            </div>
            {!config || !config.id || !source ? (
                <></>
            ) : (
                <>
                    <PageHeader
                        actions={
                            <ButtonStrip>
                                <Tooltip content={i18n.t('Edit configuration')}>
                                    <Button
                                        onClick={() => {
                                            navigate({
                                                to: '/data-service-configuration/$configId/edit',
                                                params: {
                                                    configId: config.id,
                                                },
                                            })
                                        }}
                                        icon={<IconSettings24 />}
                                    >
                                        {i18n.t('Configure')}
                                    </Button>
                                </Tooltip>
                                <RunConfiguration
                                    label={i18n.t('Run')}
                                    config={
                                        config as Required<DataServiceConfig>
                                    }
                                    onRunComplete={() => {
                                        refetch()
                                    }}
                                />
                            </ButtonStrip>
                        }
                        title={config?.source?.name ?? ''}
                        subTitle={
                            <FormTestConnection
                                routeConfig={{
                                    name: source?.name ?? '',
                                    id: source?.routeId ?? '',
                                    url: '',
                                }}
                            />
                        }
                    />
                    <RunList
                        loading={loading}
                        dataRuns={dataRuns}
                        metadataRuns={metadataRuns}
                        fetching={fetching}
                        pagination={pagination}
                        error={error}
                        refetch={refetch}
                    />
                </>
            )}
        </div>
    )
}
