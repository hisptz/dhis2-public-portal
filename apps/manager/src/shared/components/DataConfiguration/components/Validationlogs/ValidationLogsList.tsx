import { useEffect, useRef } from 'react'
import { CircularLoader, NoticeBox } from '@dhis2/ui'
import i18n from '@dhis2/d2-i18n'

interface ValidationLogEntry {
    id: string
    timestamp: string
    level: 'info' | 'warn' | 'error' | 'success'
    message: string
    metadata?: Record<string, unknown>
}

interface ValidationLogsListProps {
    logs: ValidationLogEntry[]
    isLoading: boolean
    error: Error | null
}

export function ValidationLogsList({
    logs,
    isLoading,
    error,
}: ValidationLogsListProps) {
    const logContainerRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        if (logContainerRef.current) {
            logContainerRef.current.scrollTop =
                logContainerRef.current.scrollHeight
        }
    }, [logs])

    const getLevelColor = (level: string) => {
        switch (level) {
            case 'error':
                return 'text-red-600'
            case 'warn':
                return 'text-yellow-600'
            case 'success':
                return 'text-green-600'
            case 'info':
            default:
                return 'text-blue-600'
        }
    }

    const getLevelPrefix = (level: string) => {
        switch (level) {
            case 'error':
                return 'ERROR'
            case 'warn':
                return 'WARN '
            case 'success':
                return 'INFO '
            case 'info':
            default:
                return 'INFO '
        }
    }

    const formatTimestamp = (timestamp: string) => {
        const date = new Date(timestamp)
        return date.toTimeString().split(' ')[0]
    }

    if (isLoading) {
        return (
            <div className="flex items-center justify-center p-8">
                <CircularLoader />
            </div>
        )
    }

    if (error) {
        return (
            <NoticeBox error title={i18n.t('Failed to load validation logs')}>
                {error.message ||
                    i18n.t(
                        'An error occurred while loading the validation logs'
                    )}
            </NoticeBox>
        )
    }

    if (logs.length === 0) {
        return (
            <div className="bg-gray-50 text-gray-700 font-mono text-sm p-4 rounded border border-gray-300 min-h-96">
                <div className="flex items-center gap-2 text-gray-700">
                    <span>⚡</span>
                    <span>
                        {i18n.t(
                            'Validation console ready. Logs will appear here when validation starts.'
                        )}
                    </span>
                </div>
            </div>
        )
    }

    return (
        <div
            ref={logContainerRef}
            className="bg-gray-50 text-gray-800 font-mono text-sm p-4 rounded border border-gray-300 max-h-96 overflow-y-auto"
        >
            {/* Log Entries */}
            <div className="space-y-1">
                {logs.map((log) => (
                    <div
                        key={log.id}
                        className="flex items-start gap-3 py-1 hover:bg-gray-100 px-2 -mx-2 rounded"
                    >
                        {/* Timestamp */}
                        <span className="text-gray-500 text-xs whitespace-nowrap">
                            {formatTimestamp(log.timestamp)}
                        </span>

                        {/* Log Level */}
                        <span
                            className={`text-xs font-semibold whitespace-nowrap ${getLevelColor(log.level)}`}
                        >
                            [{getLevelPrefix(log.level)}]
                        </span>

                        {/* Message */}
                        <span className="text-gray-700 flex-1 leading-relaxed">
                            {log.message}
                        </span>
                    </div>
                ))}
            </div>
        </div>
    )
}
