import { baseDisplayItemSchema, DisplayItemType } from "./base";
import { z } from "zod";

export const highlightedSingleValue = z.object({
	id: z.string(),
	icon: z.string(),
});

export type SingleValueConfig = z.infer<typeof highlightedSingleValue>;

export const highlightedSingleValueDisplayItemSchema =
	baseDisplayItemSchema.extend({
		type: z.literal(DisplayItemType.HIGHLIGHTED_SINGLE_VALUE),
		item: highlightedSingleValue,
	});

export type HighlightedSingleValueDisplayItemConfig = z.infer<
	typeof highlightedSingleValueDisplayItemSchema
>;
