'use client'

import { ReactNode, useEffect, useState } from 'react'
import dynamic from 'next/dynamic'
import { FullPageLoader } from '@/components/FullPageLoader'

const NoSsrAppProvider = dynamic(
    async () => {
        return import('@dhis2/app-runtime').then(({ Provider }) => ({
            default: Provider,
        }))
    },
    {
        ssr: false,
        loading: FullPageLoader,
    }
)

export function DHIS2AppProvider({
    children,
    contextPath,
}: {
    children: ReactNode
    contextPath: string
}) {
    const [mounted, setMounted] = useState(false)

    useEffect(() => {
        setMounted(true)
    }, [])

    if (!mounted) {
        return <>{children}</>
    }

    return (
        <NoSsrAppProvider
            userInfo={{
                id: 'portal-user',
                authorities: [],
                organisationUnits: [],
                username: 'portal-user',
                displayName: 'Portal User',
            }}
            config={{
                baseUrl: `${window.location.protocol}//${window.location.host}${contextPath ?? ''}`,
                // @ts-expect-error not required in this instance
                apiVersion: '',
            }}
            plugin={false}
            parentAlertsAdd={{}}
            showAlertsInPlugin={false}
        >
            {children}
        </NoSsrAppProvider>
    )
}
