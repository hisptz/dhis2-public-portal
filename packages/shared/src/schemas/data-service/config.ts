import { z } from "zod";

export const dataSourceSchema = z.object({
	routeId: z.string(),
	name: z.string(),
	version: z.string(),
});

export type DataServiceDataSource = z.infer<typeof dataSourceSchema>;

export const dataItemConfigSchema = z.object({
	sourceId: z.string(),
	id: z.string(),
});

export type DataServiceDataItemConfig = z.infer<typeof dataItemConfigSchema>;

export const supportedDataSourcesType = z.enum([
	"ATTRIBUTE_VALUES",
	"DX_VALUES",
]);

export type DataServiceSupportedDataSourcesType = z.infer<
	typeof supportedDataSourcesType
>;

export const baseDataItemsSourceSchema = z.object({
	id: z.string(),
	type: supportedDataSourcesType,
	dataItems: z.array(dataItemConfigSchema),
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

export const dataSourceItemsConfigSchema = z.discriminatedUnion("type", [
	attributeValuesDataItemsSourceSchema,
	dxValuesDataItemsSourceSchema,
]);

export type DataServiceDataSourceItemsConfig = z.infer<
	typeof dataSourceItemsConfigSchema
>;

export const dataServiceConfigSchema = z.object({
	id: z.string(),
	source: dataSourceSchema,
	itemsConfig: z.array(dataSourceItemsConfigSchema),
});

export type DataServiceConfig = z.infer<typeof dataServiceConfigSchema>;

export const dataServiceRuntimeConfig = z.object({
	periods: z.string().array(),
	pageSize: z.number().optional(),
	timeout: z.number().optional(),
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
