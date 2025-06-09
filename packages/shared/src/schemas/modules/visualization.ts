import { z } from "zod";
import i18n from "@dhis2/d2-i18n";
import { baseModuleSchema, ModuleType } from "./base";
import { displayItemSchema } from "../displayItems";
import { layoutSchema } from "../layout";
import { orgUnitConfigSchema, periodConfigSchema } from "../dimensions";

export enum ItemsDisplay {
	SEGMENTED = "segmented",
	DROPDOWN = "dropdown",
}

export const visualizationGroupSchema = z.object({
	id: z
		.string()
		.regex(/^\S*$/, { message: i18n.t("ID should not contain a space") }),
	title: z.string(),
	shortName: z.string().max(50, {
		message: i18n.t("Short name should not exceed 50 characters"),
	}),
	description: z.string().optional(),
	shortDescription: z.string().optional(),
	highlights: displayItemSchema.array().optional(),
	periodConfig: periodConfigSchema.optional(),
	orgUnitConfig: orgUnitConfigSchema.optional(),
	items: z.array(displayItemSchema),
	sortOrder: z.number(),
	layouts: layoutSchema,
});

export const baseVisualizationModuleSchema = z.object({
	title: z.string(),
	grouped: z.boolean(),
	preamble: z.string().optional(),
	groupDisplay: z.nativeEnum(ItemsDisplay).optional(),
});

export const groupedVisualizationModuleSchema =
	baseVisualizationModuleSchema.extend({
		grouped: z.literal(true),
		groups: z.array(visualizationGroupSchema),
	});

export type GroupedVisualizationModuleConfig = z.infer<
	typeof groupedVisualizationModuleSchema
>;

export type VisualizationGroup = z.infer<typeof visualizationGroupSchema>;
export const nonGroupedVisualizationModuleSchema =
	baseVisualizationModuleSchema.extend({
		grouped: z.literal(false),
		items: z.array(displayItemSchema),
		layouts: layoutSchema.optional(),
		description: z.string().optional(),
		shortDescription: z.string().optional(),
		highlights: displayItemSchema.array().optional(),
		periodConfig: periodConfigSchema.optional(),
		orgUnitConfig: orgUnitConfigSchema.optional(),
	});

export type NonGroupedVisualizationModuleConfig = z.infer<
	typeof nonGroupedVisualizationModuleSchema
>;

export const visualizationModuleConfig = z.discriminatedUnion("grouped", [
	groupedVisualizationModuleSchema,
	nonGroupedVisualizationModuleSchema,
]);

export type VisualizationModuleConfig = z.infer<
	typeof visualizationModuleConfig
>;

export const visualizationModuleSchema = baseModuleSchema.extend({
	type: z.literal(ModuleType.VISUALIZATION),
	config: visualizationModuleConfig,
});

export type VisualizationModule = z.infer<typeof visualizationModuleSchema>;
