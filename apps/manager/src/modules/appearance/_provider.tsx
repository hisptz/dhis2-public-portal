import { createFileRoute, Outlet } from '@tanstack/react-router'

import { InitConfigProvider } from '@/shared/components/InitConfigProvider'
import { DatastoreKeys } from '@packages/shared/constants'
import { defaultAppearanceConfig } from '@/shared/constants/defaults/appearance'

export const Route = createFileRoute('/appearance/_provider')({
    component: RouteComponent,
})

function RouteComponent() {
    return (
        <InitConfigProvider
            dataStoreKey={DatastoreKeys.APPEARANCE}
            defaultConfig={defaultAppearanceConfig}
        >
            <Outlet />
        </InitConfigProvider>
    )
}
