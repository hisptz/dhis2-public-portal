import { baseModuleSchema, ModuleType } from "./base";
import { z } from "zod";
import {
	displayItemSchema,
	singleValueDisplayItemSchema,
} from "../displayItems";
import { layoutSchema } from "../layout";

export enum SectionType {
	GRID_LAYOUT = "GRID_LAYOUT",
	SINGLE_ITEM = "SINGLE_ITEM",
	FLEXIBLE_LAYOUT = "FLEXIBLE_LAYOUT",
}

export const sectionType = z.nativeEnum(SectionType);
export const baseSectionSchema = z.object({
	id: z.string(),
	title: z.string(),
	type: sectionType,
});

export const gridLayoutSectionSchema = baseSectionSchema.extend({
	type: z.literal("GRID_LAYOUT"),
	items: z.array(singleValueDisplayItemSchema),
});

export type GridLayoutSectionConfig = z.infer<typeof gridLayoutSectionSchema>;

export const singleItemSectionSchema = baseSectionSchema.extend({
	type: z.literal("SINGLE_ITEM"),
	item: displayItemSchema,
});

export type SingleItemSectionConfig = z.infer<typeof singleItemSectionSchema>;

export const flexibleLayoutSectionSchema = baseSectionSchema.extend({
	type: z.literal("FLEXIBLE_LAYOUT"),
	items: z.array(displayItemSchema),
	layouts: layoutSchema,
});

export type FlexibleLayoutSectionConfig = z.infer<
	typeof flexibleLayoutSectionSchema
>;
export const sectionSchema = z.discriminatedUnion("type", [
	gridLayoutSectionSchema,
	singleItemSectionSchema,
	flexibleLayoutSectionSchema,
]);

export type Section = z.infer<typeof sectionSchema>;

export const sectionModuleConfigSchema = baseModuleSchema.extend({
	type: z.literal(ModuleType.SECTION),
	config: z.object({
		title: z.string(),
		sections: z.array(sectionSchema),
	}),
});

export type SectionModuleConfig = z.infer<typeof sectionModuleConfigSchema>;
