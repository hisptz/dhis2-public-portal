import { createFileRoute, Outlet, useParams } from '@tanstack/react-router'

import { FormProvider, useForm } from 'react-hook-form'
import { useGetDataSource } from '../../../../shared/components/DataConfiguration/hooks/data'
import {
    DataServiceConfig,
    dataServiceConfigSchema,
} from '@packages/shared/schemas'
import { zodResolver } from '@hookform/resolvers/zod'
import { FullLoader } from '../../../../shared/components/FullLoader'
import { colors, IconError24 } from '@dhis2/ui'

export const Route = createFileRoute(
    '/data-service-configuration/_provider/$configId/_provider'
)({
    component: RouteComponent,
})

function RouteComponent() {
    const { configId } = useParams({
        from: '/data-service-configuration/_provider/$configId/_provider',
    })
    const { refetch, error } = useGetDataSource(configId)
    const form = useForm<DataServiceConfig>({
        resolver: zodResolver(dataServiceConfigSchema),
        defaultValues: async () => {
            const response = (await refetch()) as { config: DataServiceConfig }
            return response.config
        },
    })

    if (error) {
        return (
            <div className="w-full h-full flex justify-center items-center">
                <IconError24 />
                <span style={{ color: colors.grey700 }}>{error.message}</span>
            </div>
        )
    }

    if (form.formState.isLoading) {
        return <FullLoader />
    }

    return (
        <FormProvider {...form}>
            <div className="flex flex-col gap-4">
                <div className="flex-1 w-full">
                    <Outlet />
                </div>
            </div>
        </FormProvider>
    )
}
