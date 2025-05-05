import { z } from "zod";

export enum DisplayItemType {
	RICH_TEXT = "RICH_TEXT",
	VISUALIZATION = "VISUALIZATION",
	SINGLE_VALUE = "SINGLE_VALUE",
}

export const displayItemTypeSchema = z.nativeEnum(DisplayItemType);

export const baseDisplayItemSchema = z.object({
	type: displayItemTypeSchema,
});
