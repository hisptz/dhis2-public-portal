import { z } from "zod";

export enum AnalyticsDimension {
	ou = "ou",
	dx = "dx",
	pe = "pe",
}

export enum DataDimensionItemType {
	INDICATOR = "INDICATOR",
	DATA_ELEMENT = "DATA_ELEMENT",
	CATEGORY = "CATEGORY",
}

const visualizationSchema = z.object({
	id: z.string(),
	categoryDimensions: z.array(
		z.object({
			categoryOptions: z.array(z.object({ id: z.string() })),
			category: z.object({ id: z.string() }),
		}),
	),
	axes: z.array(
		z.object({
			index: z.number(),
			type: z.string(),
			title: z.object({
				text: z.string(),
			}),
		}),
	),

	columnDimensions: z.array(z.string()),
	rowDimensions: z.array(z.string()),
	periods: z.array(z.object({ id: z.string(), name: z.string() })),
	relativePeriods: z.record(z.string(), z.boolean()),
	type: z.string(),
	organisationUnits: z.array(z.object({ id: z.string(), path: z.string() })),
	organisationUnitLevels: z.array(z.object({ id: z.string() })),
	itemOrganisationUnitGroups: z.array(z.object({ id: z.string() })),
	organisationUnitGroupSetDimensions: z.array(z.object({ id: z.string() })),
	name: z.string(),
	subtitle: z.string().optional(),
	dataDimensionItems: z.array(
		z.object({
			dataDimensionItemType: z.nativeEnum(DataDimensionItemType),
			indicator: z
				.object({
					id: z.string(),
					dimensionItem: z.string().optional(),
				})
				.optional(),
			dataElement: z
				.object({
					id: z.string(),
					dimensionItem: z.string().optional(),
				})
				.optional(),
			category: z
				.object({
					id: z.string(),
					dimensionItem: z.string().optional(),
				})
				.optional(),
		}),
	),
	series: z.array(
		z.object({
			dimensionItem: z.string(),
			axis: z.number(),
			type: z.string(),
		}),
	),
	columns: z.array(
		z.object({
			id: z.string(),
			dimension: z.nativeEnum(AnalyticsDimension),
			items: z.array(z.object({ id: z.string() })),
		}),
	),
	rows: z.array(
		z.object({
			id: z.string(),
			dimension: z.nativeEnum(AnalyticsDimension),
			items: z.array(z.object({ id: z.string() })),
		}),
	),
	filters: z.array(
		z.object({
			id: z.string(),
			dimension: z.nativeEnum(AnalyticsDimension),
			items: z.array(z.object({ id: z.string() })),
		}),
	),
	legend: z
		.object({
			showKey: z.boolean(),
			style: z.string(),
			set: z.object({
				id: z.string(),
			}),
		})
		.optional(),
	userOrganisationUnit: z.boolean(),
	userOrganisationUnitChildren: z.boolean(),
	userOrganisationUnitGrandChildren: z.boolean(),
});

const supportedVisualizations = ["MAP", "chart", "table"] as const;

export type SupportedVisualization = (typeof supportedVisualizations)[number];

export type VisualizationConfig = z.infer<typeof visualizationSchema>;
