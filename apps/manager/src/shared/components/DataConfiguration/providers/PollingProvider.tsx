import { createContext, ReactNode, useContext, useState } from 'react'

interface PollingContextType {
    isPollingPaused: boolean
    pausePolling: () => void
    resumePolling: () => void
}

const PollingContext = createContext<PollingContextType | undefined>(undefined)

export function PollingProvider({ children }: { children: ReactNode }) {
    const [isPollingPaused, setIsPollingPaused] = useState(false)

    const pausePolling = () => setIsPollingPaused(true)
    const resumePolling = () => setIsPollingPaused(false)

    return (
        <PollingContext.Provider
            value={{ isPollingPaused, pausePolling, resumePolling }}
        >
            {children}
        </PollingContext.Provider>
    )
}

export function usePollingControl() {
    const context = useContext(PollingContext)
    if (context === undefined) {
        throw new Error(
            'usePollingControl must be used within a PollingProvider'
        )
    }
    return context
}
