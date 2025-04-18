import { z } from "zod";

export enum DisplayItemType {
	VISUALIZATION = "VISUALIZATION",
	RICH_TEXT = "RICH_TEXT",
	SINGLE_VALUE = "SINGLE_VALUE",
}

export const displayItemTypeSchema = z.nativeEnum(DisplayItemType);

export const baseDisplayItemSchema = z.object({
	id: z.string(),
	type: displayItemTypeSchema,
});
