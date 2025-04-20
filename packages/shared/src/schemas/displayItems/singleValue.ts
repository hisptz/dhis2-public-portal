import { baseDisplayItemSchema, DisplayItemType } from "./base";
import { z } from "zod";

export const singleValueDisplayItemSchema = baseDisplayItemSchema.extend({
	type: z.literal(DisplayItemType.SINGLE_VALUE),
	item: z.object({
		id: z.string(),
	}),
});
