import { createFileRoute, Outlet } from '@tanstack/react-router'
import { MetadataProvider } from '../../shared/components/GeneralPage/providers/GeneralProvider'
import React from 'react'
import { InitConfigProvider } from '../../shared/components/InitConfigProvider'
import { DatastoreKeys } from '@packages/shared/constants'

export const Route = createFileRoute('/general/_provider')({
    component: RouteComponent,
})

function RouteComponent() {
    return (
        <InitConfigProvider
            dataStoreKey={DatastoreKeys.METADATA}
            defaultConfig={{}}
        >
            <MetadataProvider>
                <Outlet />
            </MetadataProvider>
        </InitConfigProvider>
    )
}
