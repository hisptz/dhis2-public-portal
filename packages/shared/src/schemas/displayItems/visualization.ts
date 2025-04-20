import { z } from "zod";
import { baseDisplayItemSchema, DisplayItemType } from "./base";
import { orgUnitConfigSchema, periodConfigSchema } from "../dimensions";

export enum VisualizationType {
	CHART = "CHART",
	REPORT_TABLE = "REPORT_TABLE",
	MAP = "MAP",
	CASCADE = "CASCADE",
	SINGLE_VALUE = "SINGLE_VALUE",
	GAUGE = "GAUGE",
	MULTI_CHART = "MULTI_CHART",
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
		VisualizationType.REPORT_TABLE,
		VisualizationType.PYRAMID,
		VisualizationType.GAUGE,
		VisualizationType.MAP,
	]),
});

const chartAxisSchema = z.object({
	id: z.string(),
	type: z.string(),
	multiple: z.boolean().optional(),
	name: z.string().optional(),
	ids: z.array(z.string()).optional(),
});
const singleValueVisualizationSchema = baseVisualizationItem.extend({
	type: z.literal(VisualizationType.SINGLE_VALUE),
	background: z.boolean().optional(),
	suffix: z.string().optional(),
});
const multiChartVisualizationSchema = baseVisualizationItem.extend({
	type: z.literal(VisualizationType.MULTI_CHART),
	axes: z.array(chartAxisSchema),
});
const cascadeVisualizationSchema = baseVisualizationItem.extend({
	type: z.literal(VisualizationType.CASCADE),
	axes: z.array(chartAxisSchema),
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
	multiChartVisualizationSchema,
	cascadeVisualizationSchema,
	bannerVisualizationSchema,
	singleValueVisualizationSchema,
	chartVisualizationItem,
]);

export const visualizationDisplayItemSchema = baseDisplayItemSchema.extend({
	type: z.literal(DisplayItemType.VISUALIZATION),
	item: visualizationItemSchema,
});
