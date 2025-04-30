import { z } from "zod";

export enum DisplayItemType {
	VISUALIZATION = "VISUALIZATION",
	RICH_TEXT = "RICH_TEXT",
	SINGLE_VALUE = "SINGLE_VALUE",
	FEEDBACK = "FEEDBACK",
}

export const displayItemTypeSchema = z.nativeEnum(DisplayItemType);

export const baseDisplayItemSchema = z.object({
	type: displayItemTypeSchema,
});
