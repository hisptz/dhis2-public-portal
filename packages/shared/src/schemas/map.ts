import { z } from "zod";
import { analyticsDimensionSchema } from "./visualization";

export enum MapLayerType {
	THEMATIC = "thematic",
	ORG_UNIT = "orgUnit",
	EARTH_ENGINE = "earthEngine",
}

export enum ThematicMapType {
	CHOROPLETH = "choropleth",
	BUBBLE = "bubble",
}

const mapSchema = z.object({
	id: z.string(),
	basemap: z.string().optional(),
	name: z.string(),
	zoom: z.number(),
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
			config: z.string().optional(),
			thematicMapType: z.nativeEnum(ThematicMapType),
			layer: z.nativeEnum(MapLayerType),
			organisationUnitLevels: z.array(z.number()),
			itemOrganisationUnitGroups: z.array(z.string()),
			organisationUnitGroupSetDimensions: z.array(
				z.object({ id: z.string() }),
			),
			name: z.string(),
			radiusHigh: z.number().optional(),
			radiusLow: z.number().optional(),
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
					dimension: analyticsDimensionSchema,
					items: z.array(
						z.object({
							id: z.string(),
							dimensionItemType: z.string(),
							name: z.string(),
						}),
					),
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
					dimension: analyticsDimensionSchema,
					items: z.array(z.object({ id: z.string() })),
				}),
			),
			filters: z.array(
				z.object({
					id: z.string(),
					dimension: analyticsDimensionSchema,
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
