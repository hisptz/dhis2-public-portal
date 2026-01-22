import { createFileRoute, Outlet } from '@tanstack/react-router'
import React from 'react'
import { ModulesProvider } from '@/shared/components/ModulesPage/providers/ModulesProvider'
import { DatastoreKeys } from '@packages/shared/constants'
import { MetadataConfigProvider } from '@/shared/components/MetadataConfigProvider'

export const Route = createFileRoute('/modules/_provider')({
    component: RouteComponent,
})

function RouteComponent() {
    return (
        <MetadataConfigProvider dataStoreKey={DatastoreKeys.METADATA}>
            <ModulesProvider>
                <Outlet />
            </ModulesProvider>
        </MetadataConfigProvider>
    )
}
