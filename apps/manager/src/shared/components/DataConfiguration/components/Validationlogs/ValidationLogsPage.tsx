import React, { useState } from 'react'
import { Button, Card, CircularLoader, NoticeBox, Tab, TabBar } from '@dhis2/ui'
import i18n from '@dhis2/d2-i18n'
import {
    useAnalyticsLastRun,
    useRerunValidation,
    useValidationDiscrepancies,
    useValidationLogs,
    useValidationStatus,
} from './hooks/validation'
import { DataServiceRunStatus } from '@packages/shared/schemas'
import { useAlert } from '@dhis2/app-runtime'
import { ValidationProgress } from './ValidationProgress'
import { ValidationLogsList } from './ValidationLogsList'
import { ValidationDiscrepancies } from './ValidationDiscrepancies'

interface ValidationLogsPageProps {
    configId: string
}

export function ValidationLogsPage({ configId }: ValidationLogsPageProps) {
    const [activeTab, setActiveTab] = useState('logs')

    const { show } = useAlert(
        ({ message }) => message,
        ({ type }) => ({ ...type, duration: 3000 })
    )

    const validationStatus = useValidationStatus(configId)
    const validationLogs = useValidationLogs(configId, { limit: 100 })
    const validationDiscrepancies = useValidationDiscrepancies(configId, {
        limit: 1000,
    })
    const rerunValidation = useRerunValidation(configId)
    const analyticsLastRun = useAnalyticsLastRun()

    const handleRerun = async () => {
        if (!validationStatus.data) return

        try {
            const lastValidationParams = localStorage.getItem(
                `validation-params-${configId}`
            )
            const params = lastValidationParams
                ? JSON.parse(lastValidationParams)
                : {
                      dataItemsConfigIds: [],
                      runtimeConfig: {
                          pageSize: 10,
                          paginateByData: false,
                          timeout: 1000 * 60 * 5,
                      },
                  }

            await rerunValidation.mutateAsync(params)
            show({
                message: i18n.t('Validation process restarted successfully'),
                type: { success: true },
            })
        } catch (error) {
            show({
                message: i18n.t('Failed to restart validation: {{error}}', {
                    error:
                        error instanceof Error ? error.message : String(error),
                }),
                type: { critical: true },
            })
        }
    }

    const isValidationRunning =
        validationStatus.data?.status === DataServiceRunStatus.RUNNING ||
        validationStatus.data?.status === DataServiceRunStatus.QUEUED

    const hasDiscrepancies =
        (validationDiscrepancies.data?.summary?.total ?? 0) > 0

    if (validationStatus.isLoading) {
        return (
            <div className="flex items-center justify-center p-8">
                <CircularLoader />
            </div>
        )
    }

    if (validationStatus.isError) {
        return (
            <NoticeBox error title={i18n.t('Failed to load validation status')}>
                {validationStatus.error?.message ||
                    i18n.t(
                        'An error occurred while loading the validation status'
                    )}
            </NoticeBox>
        )
    }

    return (
        <div className="space-y-4">
            <Card className="p-4">
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <h3 className="text-lg font-medium">
                            {i18n.t('Data Validation')}
                        </h3>
                        {analyticsLastRun.data?.lastAnalyticsTableSuccess && (
                            <p className="text-sm text-gray-600 mt-1">
                                {i18n.t('Destination analytics last run:')}{' '}
                                {new Date(
                                    analyticsLastRun.data
                                        .lastAnalyticsTableSuccess
                                ).toLocaleString()}
                            </p>
                        )}
                    </div>
                    <Button
                        onClick={handleRerun}
                        loading={rerunValidation.isPending}
                        disabled={isValidationRunning}
                        small
                    >
                        {i18n.t('Re-run validation')}
                    </Button>
                </div>

                <ValidationProgress status={validationStatus.data} />
            </Card>

            <Card>
                <TabBar>
                    <Tab
                        selected={activeTab === 'logs'}
                        onClick={() => setActiveTab('logs')}
                    >
                        {i18n.t('Validation Logs')}
                    </Tab>
                    {!isValidationRunning && hasDiscrepancies && (
                        <Tab
                            selected={activeTab === 'discrepancies'}
                            onClick={() => setActiveTab('discrepancies')}
                        >
                            {i18n.t('Discrepancies')}
                            {hasDiscrepancies && (
                                <span className="ml-1 px-2 py-1 text-xs bg-orange-100 text-orange-800 rounded-full">
                                    {
                                        validationDiscrepancies.data?.summary
                                            ?.total
                                    }
                                </span>
                            )}
                        </Tab>
                    )}
                </TabBar>

                <div className="p-4">
                    {activeTab === 'logs' && (
                        <ValidationLogsList
                            logs={validationLogs.data?.logs || []}
                            isLoading={validationLogs.isLoading}
                            error={validationLogs.error}
                        />
                    )}

                    {activeTab === 'discrepancies' &&
                        !isValidationRunning &&
                        hasDiscrepancies && (
                            <ValidationDiscrepancies
                                discrepancies={
                                    validationDiscrepancies.data
                                        ?.discrepancies || []
                                }
                                summary={validationDiscrepancies.data?.summary}
                                isLoading={validationDiscrepancies.isLoading}
                                error={validationDiscrepancies.error}
                            />
                        )}
                </div>
            </Card>
        </div>
    )
}
