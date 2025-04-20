import { baseDisplayItemSchema, DisplayItemType } from "./base";
import { z } from "zod";

export const richTextDisplayItemSchema = baseDisplayItemSchema.extend({
	type: z.literal(DisplayItemType.RICH_TEXT),
	item: z.object({
		id: z.string(),
		content: z.string(),
	}),
});
