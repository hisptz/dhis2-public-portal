import React, { useMemo, useState } from 'react'
import i18n from '@dhis2/d2-i18n'
import { Button, IconChevronDown16, IconChevronUp16 } from '@dhis2/ui'
import { DateTime } from 'luxon'
import {
    RunStatus,
    StatusIndicator,
} from '@/shared/components/DataConfiguration/components/RunConfiguration/components/RunConfigStatus/RunConfigStatus'
import { MetadataUploadJob, DataUploadJob } from './RunList/hooks/data'
import { useFailedTaskDownload } from './RunList/RunDetails/hooks/file'
import { formatDateTime } from '@/shared/hooks/config'

export function UploadTaskDetails({
    task,
    runType,
    runID,
}: {
    task: MetadataUploadJob | DataUploadJob
    runID: string
    runType: 'metadata' | 'data'
}) {
    const [showError, setShowError] = useState(false)
    const { download, loading } = useFailedTaskDownload({
        taskId: task.uid,
        type: runType,
        runId: runID,
    })

    const startedAtFmt = useMemo(
        () => formatDateTime(task?.startedAt),
        [task?.startedAt]
    )

    const finishedAtFmt = useMemo(
        () => formatDateTime(task?.finishedAt),
        [task?.finishedAt]
    )

    const timeTaken = useMemo(() => {
        if (!task?.startedAt || !task?.finishedAt) return '-'
        const started = DateTime.fromISO(task.startedAt)
        const finished = DateTime.fromISO(task.finishedAt)
        const duration = finished.diff(started, ['seconds']).normalize()
        return duration.toHuman({
            maximumFractionDigits: 0,
            notation: 'compact',
            compactDisplay: 'short',
        })
    }, [task?.startedAt, task?.finishedAt])

    return (
        <div className="w-full">
            <div className="flex flex-col gap-4 max-h-[60vh] min-h-[30vh] overflow-y-auto pr-1">
                <div className="grid grid-cols-2 gap-4">
                    <Detail
                        label={i18n.t('Status')}
                        value={
                            <StatusIndicator
                                status={String(task.status) as RunStatus}
                            />
                        }
                    />
                    <Detail label={i18n.t('Task ID')} value={task.uid} />
                    <Detail label={i18n.t('Started at')} value={startedAtFmt} />
                    <Detail
                        label={i18n.t('Finished at')}
                        value={finishedAtFmt}
                    />
                    <Detail label={i18n.t('Time taken')} value={timeTaken} />
                    <div>
                        <Button
                            secondary
                            hidden={String(task.status) !== 'FAILED'}
                            loading={loading}
                            onClick={download}
                        >
                            {i18n.t(loading ? 'Downloading' : 'Download File')}
                        </Button>
                    </div>
                    {runType === 'metadata' && (
                        <div className="grid grid-cols-5 gap-4 col-span-2">
                            <Detail
                                label={i18n.t('Total')}
                                value={num(
                                    (task as MetadataUploadJob).summary
                                        ?.response?.stats?.total ?? 0
                                )}
                            />
                            <Detail
                                label={i18n.t('Imported')}
                                value={num(
                                    (task as MetadataUploadJob).summary
                                        ?.response?.stats?.created ?? 0
                                )}
                            />
                            <Detail
                                label={i18n.t('Updated')}
                                value={num(
                                    (task as MetadataUploadJob).summary
                                        ?.response?.stats?.updated ?? 0
                                )}
                            />
                            <Detail
                                label={i18n.t('Ignored')}
                                value={num(
                                    (task as MetadataUploadJob).summary
                                        ?.response?.stats?.ignored ?? 0
                                )}
                            />
                            <Detail
                                label={i18n.t('Deleted')}
                                value={num(
                                    (task as MetadataUploadJob).summary
                                        ?.response?.stats?.deleted ?? 0
                                )}
                            />
                        </div>
                    )}
                    {runType === 'data' && (
                        <div className="grid grid-cols-5 gap-4 col-span-2">
                            <Detail
                                label={i18n.t('Total')}
                                value={num((task as DataUploadJob).count ?? 0)}
                            />
                            <Detail
                                label={i18n.t('Imported')}
                                value={num(
                                    (task as DataUploadJob).imported ?? 0
                                )}
                            />
                            <Detail
                                label={i18n.t('Updated')}
                                value={num(
                                    (task as DataUploadJob).updated ?? 0
                                )}
                            />
                            <Detail
                                label={i18n.t('Ignored')}
                                value={num(
                                    (task as DataUploadJob).ignored ?? 0
                                )}
                            />
                            <Detail
                                label={i18n.t('Deleted')}
                                value={num(
                                    (task as DataUploadJob).deleted ?? 0
                                )}
                            />
                        </div>
                    )}
                </div>

                {(task.error || task.errorObject) && (
                    <div className="flex flex-col gap-2">
                        <button
                            type="button"
                            className="flex items-center gap-2 text-red-700 hover:underline self-start"
                            onClick={() => setShowError((s) => !s)}
                        >
                            {showError ? (
                                <IconChevronUp16 />
                            ) : (
                                <IconChevronDown16 />
                            )}
                            <span className="text-sm">
                                {i18n.t('Show error details')}
                            </span>
                        </button>
                        {showError && (
                            <div className="flex flex-col gap-2">
                                {task.error && (
                                    <pre
                                        style={{ fontSize: 12 }}
                                        className="bg-gray-50 p-3 border-gray-200 rounded border overflow-auto text-sm whitespace-pre-wrap max-h-48"
                                    >
                                        {task.error}
                                    </pre>
                                )}
                                {task.errorObject && (
                                    <pre
                                        style={{ fontSize: 12 }}
                                        className="bg-gray-50 p-3 rounded border border-gray-200 overflow-auto max-h-48 w-full"
                                    >
                                        {JSON.stringify(
                                            task.errorObject,
                                            null,
                                            2
                                        )}
                                    </pre>
                                )}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    )
}

function num(value?: number) {
    return typeof value === 'number' ? String(value) : '-'
}

function Detail({ label, value }: { label: string; value?: React.ReactNode }) {
    return (
        <div className="flex flex-col gap-1">
            <div className="text-xs uppercase tracking-wide text-gray-600">
                {label}
            </div>
            <div className="text-sm text-gray-900">{value ?? '-'}</div>
        </div>
    )
}
