import { z } from "zod";

export enum DisplayItemType {
	RICH_TEXT = "RICH_TEXT",
	VISUALIZATION = "VISUALIZATION",
	HIGHLIGHTED_SINGLE_VALUE = "HIGHLIGHTED_SINGLE_VALUE",
	FEEDBACK = "FEEDBACK",
	VISUALIZATIONS_SLIDESHOW = "VISUALIZATIONS_SLIDESHOW",
}

export const displayItemTypeSchema = z.nativeEnum(DisplayItemType);

export const baseDisplayItemSchema = z.object({
	type: displayItemTypeSchema,
});
