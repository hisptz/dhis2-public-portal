import { z } from "zod";
import { baseDisplayItemSchema, DisplayItemType } from "./base";
import { orgUnitConfigSchema, periodConfigSchema } from "../dimensions";

export enum VisualizationType {
	CHART = "CHART",
	MAP = "MAP",
	BANNER = "BANNER",
	PYRAMID = "PYRAMID",
}

export const baseVisualizationItem = z.object({
	type: z.nativeEnum(VisualizationType),
	id: z.string(),
	periodConfig: periodConfigSchema.optional(),
	orgUnitConfig: orgUnitConfigSchema.optional(),
	caption: z.string().optional(),
});

export const chartVisualizationItem = baseVisualizationItem.extend({
	type: z.enum([
		VisualizationType.CHART,
		VisualizationType.PYRAMID,
		VisualizationType.MAP,
	]),
});

const bannerVisualizationSchema = baseVisualizationItem.extend({
	type: z.literal(VisualizationType.BANNER),
	label: z.string(),
	data: z
		.object({
			id: z.string(),
			percentage: z.boolean().optional(),
		})
		.array(),
});

export const visualizationItemSchema = z.discriminatedUnion("type", [
	bannerVisualizationSchema,
	chartVisualizationItem,
]);

export type VisualizationItem = z.infer<typeof visualizationItemSchema>;

export const visualizationDisplayItemSchema = baseDisplayItemSchema.extend({
	type: z.literal(DisplayItemType.VISUALIZATION),
	item: visualizationItemSchema,
});

export type VisualizationDisplayItem = z.infer<
	typeof visualizationDisplayItemSchema
>;
