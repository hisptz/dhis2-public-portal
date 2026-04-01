import React, { useMemo, useState } from 'react'
import i18n from '@dhis2/d2-i18n'
import { IconChevronDown16, IconChevronUp16 } from '@dhis2/ui'
import { DateTime } from 'luxon'
import {
    RunStatus,
    StatusIndicator,
} from '@/shared/components/DataConfiguration/components/RunConfiguration/components/RunConfigStatus/RunConfigStatus'
import { MetadataDownloadJob, DataDownloadJob } from './RunList/hooks/data'
import { capitalize } from 'lodash'
import { formatDateTime } from '@/shared/hooks/config'

export function DownloadTaskDetails({
    task,
    runType,
}: {
    task: MetadataDownloadJob | DataDownloadJob
    runID: string
    runType: 'metadata' | 'data'
}) {
    const [showAdvanced, setShowAdvanced] = useState(false)
    const [showError, setShowError] = useState(false)

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
            <div className="flex flex-col gap-4 max-h-[60vh] overflow-y-auto pr-1">
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
                    {runType === 'metadata' && (
                        <>
                            <Detail
                                label={i18n.t('Type')}
                                value={capitalize(
                                    String((task as MetadataDownloadJob).type)
                                )}
                            />
                            <Detail
                                label={i18n.t('Items')}
                                value={
                                    (task as MetadataDownloadJob).items.length
                                        ? String(
                                              (task as MetadataDownloadJob)
                                                  .items.length
                                          )
                                        : '-'
                                }
                            />
                        </>
                    )}

                    {runType === 'data' && (
                        <Detail
                            label={i18n.t('Items')}
                            value={(task as DataDownloadJob).count ?? 0}
                        />
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

                {runType === 'data' &&
                    ((task as DataDownloadJob).dimensions ||
                        (task as DataDownloadJob).filters) && (
                        <div className="flex flex-col gap-2">
                            <button
                                type="button"
                                className="flex items-center gap-2 text-sm text-blue-700 hover:underline self-start"
                                onClick={() => setShowAdvanced((s) => !s)}
                            >
                                {showAdvanced ? (
                                    <IconChevronUp16 />
                                ) : (
                                    <IconChevronDown16 />
                                )}
                                {i18n.t('Show {{state}} details', {
                                    state: showAdvanced
                                        ? i18n.t('less')
                                        : i18n.t('more'),
                                })}
                            </button>
                            {showAdvanced && (
                                <div className="flex flex-col gap-2 w-full">
                                    {(task as DataDownloadJob).dimensions && (
                                        <JsonBlock
                                            label={i18n.t('Dimensions')}
                                            value={
                                                (task as DataDownloadJob)
                                                    .dimensions
                                            }
                                        />
                                    )}
                                    {(task as DataDownloadJob).filters && (
                                        <JsonBlock
                                            label={i18n.t('Filters')}
                                            value={
                                                (task as DataDownloadJob)
                                                    .filters ?? {}
                                            }
                                        />
                                    )}
                                </div>
                            )}
                        </div>
                    )}
            </div>
        </div>
    )
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

function JsonBlock({
    label,
    value,
}: {
    label: string
    value: Record<string, unknown>
}) {
    return (
        <div className="flex flex-col gap-2 w-full">
            <div className="text-xs uppercase tracking-wide text-gray-600">
                {label}
            </div>
            <pre
                style={{ fontSize: 12 }}
                className="bg-gray-50 p-3 rounded border border-gray-200 overflow-auto max-h-48 w-full"
            >
                {JSON.stringify(value, null, 2)}
            </pre>
        </div>
    )
}
