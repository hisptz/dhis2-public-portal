import { baseDisplayItemSchema, DisplayItemType } from "./base";
import { z } from "zod";

export const richTextItemConfig = z.object({
	id: z.string(),
	content: z.string(),
});

export type RichTextItemConfig = z.infer<typeof richTextItemConfig>;

export const richTextDisplayItemSchema = baseDisplayItemSchema.extend({
	type: z.literal(DisplayItemType.RICH_TEXT),
	item: richTextItemConfig,
});

export type RichTextDisplayItem = z.infer<typeof richTextDisplayItemSchema>;
