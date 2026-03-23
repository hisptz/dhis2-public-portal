import { z } from 'zod'
import i18n from '@dhis2/d2-i18n'

export const dataSourceSchema = z.object({
    routeId: z.string(),
    name: z.string(),
})

export type DataServiceDataSource = z.infer<typeof dataSourceSchema>

export const dataItemConfigSchema = z.object({
    sourceId: z.string(),
    id: z.string(),
})

export type DataServiceDataItemConfig = z.infer<typeof dataItemConfigSchema>

export enum DataServiceSupportedDataSourcesType {
    ATTRIBUTE_VALUES = 'ATTRIBUTE_VALUES',
    DX_VALUES = 'DX_VALUES',
}

export const supportedDataSourcesType = z.nativeEnum(
    DataServiceSupportedDataSourcesType
)

export const baseDataItemsSourceSchema = z
    .object({
        id: z.string(),
        name: z.string(),
        type: supportedDataSourcesType,
        periodTypeId: z.string(),
        parentOrgUnitId: z.string(),
        dataItems: z.array(dataItemConfigSchema).optional(),
        orgUnitLevel: z
            .number()
            .min(1, 'Organisation unit level must be at least 1')
            .max(7, 'Organisation unit level must be at most 7'),
        visualizations: z.array(z.string()),
        maps: z.array(z.string()),
        dataElements: z
            .array(z.string())
            .min(1, 'At least one data element is required'),
    })
    .superRefine((data, context) => {
        const hasAnyData =
            !!(data.visualizations?.length > 0) || !!(data.maps?.length > 0)
        if (!hasAnyData) {
            context.addIssue({
                code: 'custom',
                message: i18n.t(
                    'Please select at least one visualization or map'
                ),
                path: [`visualizations`],
            })
        }
    })

export const attributeValuesDataItemsSourceSchema =
    baseDataItemsSourceSchema.safeExtend({
        type: z.literal(DataServiceSupportedDataSourcesType.ATTRIBUTE_VALUES),
        attributeId: z.string(),
        attributeOptions: z.array(z.string()),
    })

export type DataServiceAttributeValuesDataItemsSource = z.infer<
    typeof attributeValuesDataItemsSourceSchema
>

export const dxValuesDataItemsSourceSchema =
    baseDataItemsSourceSchema.safeExtend({
        type: z.literal(DataServiceSupportedDataSourcesType.DX_VALUES),
    })

export type DataServiceDxValuesDataItemsSource = z.infer<
    typeof dxValuesDataItemsSourceSchema
>

export const dataSourceItemsConfigSchema = z.discriminatedUnion(
    'type',
    [attributeValuesDataItemsSourceSchema, dxValuesDataItemsSourceSchema],
    { message: i18n.t('This value is required') }
)

export type DataServiceDataSourceItemsConfig = z.infer<
    typeof dataSourceItemsConfigSchema
>

export const dataServiceConfigSchema = z.object({
    id: z.string(),
    source: dataSourceSchema,
    itemsConfig: z.array(dataSourceItemsConfigSchema),
    visualizations: z.array(z.object({ id: z.string() })),
})

export type DataServiceConfig = z.infer<typeof dataServiceConfigSchema>

export const dataServiceRuntimeConfig = z.object({
    periods: z.string().array(),
    pageSize: z.number().optional(),
    timeout: z.number().optional(),
    paginateByData: z.boolean().optional(),
    overrides: z
        .object({
            parentOrgUnitId: z.string().optional(),
            orgUnitLevelId: z.number().optional(),
        })
        .optional(),
})

export type DataServiceRuntimeConfig = z.infer<typeof dataServiceRuntimeConfig>

export const dataDownloadBodySchema = z.object({
    runtimeConfig: dataServiceRuntimeConfig,
    dataItemsConfigIds: z.string().array(),
    isDelete: z.boolean().optional(),
})

export type DataDownloadBody = z.infer<typeof dataDownloadBodySchema>

export const dataUploadBodySchema = z
    .object({
        filename: z.string().min(1).optional(),
        payload: z.any().optional(),
        queuedAt: z.string().optional(),
        downloadedFrom: z.string().optional(),
    })
    .refine((data) => data.filename || data.payload, {
        message: 'Either filename or payload must be provided',
        path: ['filename', 'payload'],
    })

export type DataUploadBody = z.infer<typeof dataUploadBodySchema>

export const dataItemMappingSchema = z.object({
    id: z.string().min(1, 'ID is required'),
    sourceId: z.string().min(1, 'Source ID is required'),
})

export type DataItemMapping = z.infer<typeof dataItemMappingSchema>
