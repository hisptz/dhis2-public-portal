import { useEffect } from 'react'
import { useLocation } from '@tanstack/react-router'

export function SyncURLWithGlobalShell() {
    const location = useLocation()

    useEffect(() => {
        dispatchEvent(new PopStateEvent('popstate'))
    }, [location.hash])

    return null
}
