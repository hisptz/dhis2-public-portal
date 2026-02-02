import { z } from 'zod'
import { capitalize } from 'lodash'

import i18n from '@dhis2/d2-i18n'
import { dataServiceRuntimeConfig } from './config'

export const baseRunConfigSchema = z.object({
    service: z.enum([
        'metadata-migration',
        'data-migration',
        'data-validation',
        'data-deletion',
    ]),
})

export const baseMetaMigrationSchema = baseRunConfigSchema.extend({
    service: z.literal('metadata-migration'),
    metadataSource: z.enum(['source', 'flexiportal-config']),
})

export const sourceMetaMigrationSchema = baseMetaMigrationSchema
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

export const flexiPortalMetaMigrationSchema = baseMetaMigrationSchema.extend({
    metadataSource: z.literal('flexiportal-config'),
})

export const metadataMigrationSchema = z.discriminatedUnion('metadataSource', [
    sourceMetaMigrationSchema,
    flexiPortalMetaMigrationSchema,
])

export type MetadataMigrationConfig = z.infer<typeof metadataMigrationSchema>

export const dataMigrationSchema = baseRunConfigSchema.extend({
    service: z.enum(['data-migration', 'data-validation', 'data-deletion']),
    runtimeConfig: dataServiceRuntimeConfig.extend({
        periodType: z.string().optional(),
        periods: z.array(z.string()).optional(),
    }),
    dataItemsConfigIds: z.array(z.string()).min(1, i18n.t('')),
})

export const runConfigSchema = z.discriminatedUnion('service', [
    metadataMigrationSchema,
    dataMigrationSchema,
])

export type RunConfigFormValues = z.infer<typeof runConfigSchema>
