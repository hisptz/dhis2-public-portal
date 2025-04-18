import { baseModuleSchema } from "./base";
import { z } from "zod";
import { displayItemSchema } from "../displayItems";
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
	items: z.array(displayItemSchema),
});

export const singleItemSectionSchema = baseSectionSchema.extend({
	type: z.literal("SINGLE_ITEM"),
	item: displayItemSchema,
});

export const flexibleLayoutSectionSchema = baseSectionSchema.extend({
	type: z.literal("FLEXIBLE_LAYOUT"),
	items: z.array(displayItemSchema),
	layout: layoutSchema,
});
export const sectionSchema = z.discriminatedUnion("type", [
	gridLayoutSectionSchema,
	singleItemSectionSchema,
	flexibleLayoutSectionSchema,
]);

export const sectionModuleConfigSchema = baseModuleSchema.extend({
	type: z.literal("SECTION"),
	sections: z.array(sectionSchema),
});

export type SectionModuleConfig = z.infer<typeof sectionModuleConfigSchema>;
