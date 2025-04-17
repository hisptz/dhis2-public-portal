import { z } from "zod";
import { AnalyticsDimension } from "./visualization";

const mapSchema = z.object({
	id: z.string(),
	basemap: z.string(),
	name: z.string(),
	mapViews: z.array(
		z.object({
			id: z.string(),
			categoryDimensions: z.array(
				z.object({
					categoryOptions: z.array(z.object({ id: z.string() })),
					category: z.object({ id: z.string() }),
				}),
			),
			periods: z.array(z.object({ id: z.string(), name: z.string() })),
			relativePeriods: z.record(z.string(), z.boolean()),
			type: z.string(),
			organisationUnits: z.array(
				z.object({ id: z.string(), path: z.string() }),
			),
			organisationUnitLevels: z.array(z.number()),
			itemOrganisationUnitGroups: z.array(z.string()),
			organisationUnitGroupSetDimensions: z.array(
				z.object({ id: z.string() }),
			),
			name: z.string(),
			dataDimensionItems: z.array(
				z
					.object({
						dataDimensionItemType: z.string(),
					})
					.and(
						z.record(
							z.enum([
								"dataElement",
								"indicator",
								"programIndicator",
							]),
							z.object({ id: z.string() }),
						),
					),
			),
			columns: z.array(
				z.object({
					id: z.string(),
					dimension: z.nativeEnum(AnalyticsDimension),
					items: z.array(z.object({ id: z.string() })),
				}),
			),
			displayName: z.string(),
			legendSet: z.object({
				id: z.string(),
			}),
			colorScale: z.string(),
			classes: z.number(),
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
			userOrganisationUnit: z.boolean(),
			userOrganisationUnitChildren: z.boolean(),
			userOrganisationUnitGrandChildren: z.boolean(),
		}),
	),
});

export type MapConfig = z.infer<typeof mapSchema>;
