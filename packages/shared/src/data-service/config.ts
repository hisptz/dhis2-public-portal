import { z } from "zod";
import i18n from "@dhis2/d2-i18n";

export const dataSourceSchema = z.object({
	routeId: z.string(),
	name: z.string(),
});

export type DataServiceDataSource = z.infer<typeof dataSourceSchema>;

export const dataItemConfigSchema = z.object({
	sourceId: z.string(),
	id: z.string(),
});

export type DataServiceDataItemConfig = z.infer<typeof dataItemConfigSchema>;

export enum DataServiceSupportedDataSourcesType {
	ATTRIBUTE_VALUES = "ATTRIBUTE_VALUES",
	DX_VALUES = "DX_VALUES",
}

export const supportedDataSourcesType = z.nativeEnum(
	DataServiceSupportedDataSourcesType,
);

export const baseDataItemsSourceSchema = z.object({
	id: z.string(),
	name: z.string(),
	type: supportedDataSourcesType,
	dataItems: z
		.array(dataItemConfigSchema)
		.min(1, i18n.t("At least one data item is required")),
	periodTypeId: z.string(),
	parentOrgUnitId: z.string(),
	orgUnitLevel: z.number(),
});

export const attributeValuesDataItemsSourceSchema =
	baseDataItemsSourceSchema.extend({
		type: z.literal("ATTRIBUTE_VALUES"),
		attributeId: z.string(),
		attributeOptions: z.array(z.string()),
	});

export type DataServiceAttributeValuesDataItemsSource = z.infer<
	typeof attributeValuesDataItemsSourceSchema
>;

export const dxValuesDataItemsSourceSchema = baseDataItemsSourceSchema.extend({
	type: z.literal("DX_VALUES"),
});

export type DataServiceDxValuesDataItemsSource = z.infer<
	typeof dxValuesDataItemsSourceSchema
>;

export const dataSourceItemsConfigSchema = z.discriminatedUnion(
	"type",
	[attributeValuesDataItemsSourceSchema, dxValuesDataItemsSourceSchema],
	{ message: i18n.t("This value is required") },
);

export type DataServiceDataSourceItemsConfig = z.infer<
	typeof dataSourceItemsConfigSchema
>;

export const dataServiceConfigSchema = z.object({
	id: z.string(),
	source: dataSourceSchema,
	itemsConfig: z.array(dataSourceItemsConfigSchema),
	visualizations: z.array(z.object({ id: z.string() })),
});

export type DataServiceConfig = z.infer<typeof dataServiceConfigSchema>;

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
});

export type DataServiceRuntimeConfig = z.infer<typeof dataServiceRuntimeConfig>;

export const dataDownloadBodySchema = z.object({
	runtimeConfig: dataServiceRuntimeConfig,
	dataItemsConfigIds: z.string().array(),
});

export type DataDownloadBody = z.infer<typeof dataDownloadBodySchema>;
