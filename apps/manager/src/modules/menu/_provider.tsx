import { createFileRoute, Outlet } from '@tanstack/react-router'
import { MenuProvider } from '@/shared/components/MenuPage/providers/MenuProvider'
import React from 'react'
import { InitConfigProvider } from '@/shared/components/InitConfigProvider'
import { DatastoreKeys } from '@packages/shared/constants'

export const Route = createFileRoute('/menu/_provider')({
    component: RouteComponent,
})

function RouteComponent() {
    return (
        <InitConfigProvider
            dataStoreKey={DatastoreKeys.MENU}
            defaultConfig={[]}
        >
            <MenuProvider>
                <Outlet />
            </MenuProvider>
        </InitConfigProvider>
    )
}
