import {
    DataServiceConfig,
    dataServiceRuntimeConfig,
} from '@packages/shared/schemas'
import {
    FormProvider,
    SubmitErrorHandler,
    useForm,
    useWatch,
} from 'react-hook-form'
import {
    Button,
    ButtonStrip,
    Modal,
    ModalActions,
    ModalContent,
    ModalTitle,
    NoticeBox,
} from '@dhis2/ui'

import i18n from '@dhis2/d2-i18n'
import { PeriodSelector } from './components/PeriodSelector'
import { z } from 'zod'
import { useAlert, useConfig, useDataEngine } from '@dhis2/app-runtime'
import { ConfigSelector } from './components/ConfigSelector'
import { useQueryClient } from '@tanstack/react-query'
import { RHFCheckboxField, RHFSingleSelectField } from '@hisptz/dhis2-ui'
import { RHFNumberField } from '../../../../../Fields/RHFNumberField'
import { RHFMultiSelectField } from '../../../../../Fields/RHFMultiSelectField'
import { SourceMetadataSelector } from './components/SourceMetadataSelector'
import {
    downloadData,
    downloadMetadata,
} from '@/shared/services/dataServiceClient'
import { useNavigate } from '@tanstack/react-router'
import { useStartValidation } from '../../../../../DataConfiguration/components/Validationlogs/hooks/validation'
import { zodResolver } from '@hookform/resolvers/zod'
import { capitalize } from 'lodash'

const baseRunConfigSchema = z.object({
    service: z.enum([
        'metadata-migration',
        'data-migration',
        'data-validation',
        'data-deletion',
    ]),
})

const baseMetaMigrationSchema = baseRunConfigSchema.extend({
    service: z.literal('metadata-migration'),
    metadataSource: z.enum(['source', 'flexiportal-config']),
})

const sourceMetaMigrationSchema = baseMetaMigrationSchema
    .extend({
        metadataSource: z.literal('source'),
        metadataTypes: z
            .array(z.enum(['visualizations', 'maps', 'dashboards']))
            .optional(),
        selectedVisualizations: z
            .array(z.object({ id: z.string(), name: z.string() }))
            .optional(),
        selectedMaps: z
            .array(z.object({ id: z.string(), name: z.string() }))
            .optional(),
        selectedDashboards: z
            .array(z.object({ id: z.string(), name: z.string() }))
            .optional(),
    })
    .superRefine((data, context) => {
        const hasAnyMeta =
            !!data.selectedVisualizations?.length ||
            !!data.selectedMaps?.length ||
            !!data.selectedDashboards?.length
        if (!hasAnyMeta) {
            data.metadataTypes?.forEach((type) => {
                context.addIssue({
                    code: 'custom',
                    message: i18n.t('Please select at least one metadata type'),
                    path: [`selected${capitalize(type)}`],
                })
            })
        }
    })

const flexiPortalMetaMigrationSchema = baseMetaMigrationSchema.extend({
    metadataSource: z.literal('flexiportal-config'),
})

const metadataMigrationSchema = z.discriminatedUnion('metadataSource', [
    sourceMetaMigrationSchema,
    flexiPortalMetaMigrationSchema,
])

const dataMigrationSchema = baseRunConfigSchema.extend({
    service: z.enum(['data-migration', 'data-validation', 'data-deletion']),
    runtimeConfig: dataServiceRuntimeConfig.extend({
        periods: z.array(z.string()).optional(),
    }),
    dataItemsConfigIds: z.array(z.string()).min(1, i18n.t('')),
})

const runConfigSchema = z.discriminatedUnion('service', [
    metadataMigrationSchema,
    dataMigrationSchema,
])

export type RunConfigFormValues = z.infer<typeof runConfigSchema>

export function RunConfigForm({
    hide,
    config,
    onClose,
}: {
    config: DataServiceConfig
    hide: boolean
    onClose: () => void
}) {
    const queryClient = useQueryClient()
    const engine = useDataEngine()
    const { serverVersion } = useConfig()
    const navigate = useNavigate({
        from: '/data-service-configuration/',
    })
    const startValidation = useStartValidation(config.id, config)
    const { show, hide: hideAlert } = useAlert(
        ({ message }) => message,
        ({ type }) => ({ ...type, duration: 3000 })
    )
    const form = useForm<RunConfigFormValues>({
        resolver: zodResolver(runConfigSchema),
        defaultValues: {
            service: 'metadata-migration',
            metadataSource: 'source',
            metadataTypes: [],
            selectedVisualizations: [],
            selectedMaps: [],
            selectedDashboards: [],
        },
    })

    const selectedService = useWatch({
        control: form.control,
        name: 'service',
    })
    const metadataSource = useWatch({
        control: form.control,
        name: 'metadataSource',
    })
    const metadataTypes = useWatch({
        control: form.control,
        name: 'metadataTypes',
    })

    const onSubmit = async (data: RunConfigFormValues) => {
        try {
            hideAlert()
            let result
            if (data.service === 'metadata-migration') {
                if (data.metadataSource === 'source') {
                    const metadataRequest = {
                        metadataSource: data.metadataSource,
                        selectedVisualizations:
                            data.selectedVisualizations || [],
                        selectedMaps: data.selectedMaps || [],
                        selectedDashboards: data.selectedDashboards || [],
                    }
                    result = await downloadMetadata(
                        engine,
                        config.id,
                        metadataRequest,
                        serverVersion
                    )
                }

                if (data.metadataSource === 'flexiportal-config') {
                    //TODO: handle this
                }
            } else if (data.service === 'data-deletion') {
                const deletionRequest = {
                    dataItemsConfigIds: data.dataItemsConfigIds,
                    runtimeConfig: data.runtimeConfig,
                    isDelete: true,
                }

                result = await downloadData(
                    engine,
                    config.id,
                    deletionRequest,
                    serverVersion
                )
            } else if (data.service === 'data-validation') {
                const validationRequest = {
                    dataItemsConfigIds: data.dataItemsConfigIds,
                    runtimeConfig: data.runtimeConfig,
                }

                // Get selected periods from form
                const selectedPeriods = data.runtimeConfig.periods || []
                if (selectedPeriods.length === 0) {
                    show({
                        message: i18n.t(
                            'Please select at least one period for validation'
                        ),
                        type: { critical: true },
                    })
                    return
                }

                // Get selected config items details
                const selectedConfigs = config.itemsConfig.filter((item) =>
                    data.dataItemsConfigIds.includes(item.id)
                )

                // Extract all data elements and org units from selected configs
                const allDataElements = selectedConfigs.flatMap((configItem) =>
                    configItem.dataItems.map((dataItem) => dataItem.id)
                )
                const allOrgUnits = selectedConfigs.map(
                    (configItem) => configItem.parentOrgUnitId
                )

                // Store comprehensive validation parameters for re-run functionality
                const fullValidationData = {
                    ...validationRequest,
                    periods: selectedPeriods,
                    dataElements: allDataElements,
                    orgUnits: allOrgUnits,
                    configDetails: selectedConfigs.map((item) => ({
                        id: item.id,
                        name: item.name,
                        type: item.type,
                        periodTypeId: item.periodTypeId,
                        dataItemsCount: item.dataItems.length,
                        parentOrgUnitId: item.parentOrgUnitId,
                        orgUnitLevel: item.orgUnitLevel,
                    })),
                }
                localStorage.setItem(
                    `validation-params-${config.id}`,
                    JSON.stringify(fullValidationData)
                )
                result = await startValidation.mutateAsync(validationRequest)
            } else {
                const dataRequest = {
                    dataItemsConfigIds: data.dataItemsConfigIds,
                    runtimeConfig: data.runtimeConfig,
                }

                result = await downloadData(
                    engine,
                    config.id,
                    dataRequest,
                    serverVersion
                )
            }

            queryClient.invalidateQueries({
                queryKey: ['data-service-logs', config.id],
            })

            queryClient.invalidateQueries({
                queryKey: ['config-status', config.id],
            })

            let successMessage =
                result.message || i18n.t('Service started successfully')
            if (data.service === 'data-deletion') {
                successMessage = i18n.t(
                    'Data deletion process started successfully. Check the queue for progress.'
                )
            } else if (data.service === 'data-validation') {
                successMessage = i18n.t(
                    'Data validation process started successfully. Redirecting to validation logs...'
                )
            }

            show({
                message: successMessage,
                type: { success: true },
            })

            // Navigate to validation logs page if this is a validation service
            if (data.service === 'data-validation') {
                onClose()
                navigate({
                    to: `${config.id}/validation-logs`,
                })
            } else {
                onClose()
            }
        } catch (error) {
            console.error(error)
            let errorMessage = i18n.t('Failed to start service')
            if (error instanceof Error) {
                errorMessage = `${errorMessage}: ${error.message}`
            } else {
                errorMessage = `${errorMessage}: ${String(error)}`
            }
            show({
                message: errorMessage,
                type: { critical: true },
            })
        }
    }
    const onError: SubmitErrorHandler<RunConfigFormValues> = (errors) => {
        console.error(errors)
        show({
            message: i18n.t(
                'There are errors with your form. Please fix them before submitting again'
            ),
            type: { critical: true },
        })
    }
    return (
        <FormProvider {...form}>
            <Modal hide={hide} onClose={onClose} position="middle">
                <ModalTitle>
                    {`${i18n.t('Run')} ${config.source.name}`}
                </ModalTitle>
                <ModalContent>
                    <form className="flex flex-col gap-2">
                        {selectedService === 'data-validation' && (
                            <NoticeBox
                                warning
                                title={i18n.t('Analytics Required')}
                            >
                                {i18n.t(
                                    'Please ensure analytics have been run on the source instance before proceeding with validation. Running analytics ensures the data is up-to-date for accurate validation results.'
                                )}
                            </NoticeBox>
                        )}
                        {selectedService === 'data-deletion' && (
                            <NoticeBox
                                error
                                title={i18n.t('Destructive Operation')}
                            >
                                {i18n.t(
                                    'This operation will permanently delete all data files for the selected configuration items and periods. This action cannot be undone.'
                                )}
                            </NoticeBox>
                        )}
                        <RHFSingleSelectField
                            label={i18n.t('Service Type')}
                            name="service"
                            placeholder={i18n.t('Select service type')}
                            required
                            options={[
                                {
                                    label: i18n.t('Metadata Migration'),
                                    value: 'metadata-migration',
                                },
                                {
                                    label: i18n.t('Data Migration'),
                                    value: 'data-migration',
                                },
                                {
                                    label: i18n.t('Data Validation'),
                                    value: 'data-validation',
                                },
                                {
                                    label: i18n.t('Data Deletion'),
                                    value: 'data-deletion',
                                },
                            ]}
                        />
                        {selectedService === 'metadata-migration' && (
                            <>
                                <RHFSingleSelectField
                                    name="metadataSource"
                                    label={i18n.t('Metadata Source')}
                                    placeholder={i18n.t(
                                        'Select metadata source'
                                    )}
                                    required
                                    options={[
                                        {
                                            label: i18n.t('Browse from Source'),
                                            value: 'source',
                                        },
                                        {
                                            label: i18n.t(
                                                'Extract from FlexiPortal Configuration'
                                            ),
                                            value: 'flexiportal-config',
                                        },
                                    ]}
                                />

                                {metadataSource === 'source' && (
                                    <>
                                        <RHFMultiSelectField
                                            name="metadataTypes"
                                            label={i18n.t('Metadata Types')}
                                            placeholder={i18n.t(
                                                'Select metadata types'
                                            )}
                                            required
                                            options={[
                                                {
                                                    label: i18n.t(
                                                        'Visualizations'
                                                    ),
                                                    value: 'visualizations',
                                                },
                                                {
                                                    label: i18n.t('Maps'),
                                                    value: 'maps',
                                                },
                                                {
                                                    label: i18n.t('Dashboards'),
                                                    value: 'dashboards',
                                                },
                                            ]}
                                        />

                                        {metadataTypes?.includes(
                                            'visualizations'
                                        ) && (
                                            <SourceMetadataSelector
                                                name="selectedVisualizations"
                                                resourceType="visualizations"
                                                label={i18n.t(
                                                    'Select Visualizations'
                                                )}
                                                config={config}
                                                required
                                            />
                                        )}

                                        {metadataTypes?.includes('maps') && (
                                            <SourceMetadataSelector
                                                name="selectedMaps"
                                                resourceType="maps"
                                                label={i18n.t('Select Maps')}
                                                config={config}
                                                required
                                            />
                                        )}

                                        {metadataTypes?.includes(
                                            'dashboards'
                                        ) && (
                                            <SourceMetadataSelector
                                                name="selectedDashboards"
                                                resourceType="dashboards"
                                                label={i18n.t(
                                                    'Select Dashboards'
                                                )}
                                                config={config}
                                                required
                                            />
                                        )}
                                    </>
                                )}
                            </>
                        )}
                        {selectedService !== 'metadata-migration' && (
                            <>
                                <PeriodSelector minPeriodType={'MONTHLY'} />
                                <ConfigSelector config={config} />
                                {selectedService !== 'data-validation' && (
                                    <>
                                        <RHFNumberField
                                            name={'runtimeConfig.pageSize'}
                                            label={i18n.t('Page size')}
                                        />
                                        <RHFCheckboxField
                                            name={
                                                'runtimeConfig.paginateByData'
                                            }
                                            label={i18n.t('Paginate by data')}
                                        />
                                    </>
                                )}
                            </>
                        )}
                    </form>
                </ModalContent>
                <ModalActions>
                    <ButtonStrip>
                        <Button onClick={onClose}>{i18n.t('Cancel')}</Button>
                        <Button
                            loading={form.formState.isSubmitting}
                            onClick={(_, e) =>
                                form.handleSubmit(onSubmit, onError)(e)
                            }
                            primary
                        >
                            {form.formState.isSubmitting
                                ? selectedService === 'data-deletion'
                                    ? i18n.t('Deleting data...')
                                    : i18n.t('Requesting run...')
                                : selectedService === 'data-deletion'
                                  ? i18n.t('Delete Data')
                                  : i18n.t('Run')}
                        </Button>
                    </ButtonStrip>
                </ModalActions>
            </Modal>
        </FormProvider>
    )
}
