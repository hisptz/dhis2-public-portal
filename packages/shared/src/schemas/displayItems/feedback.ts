import { baseDisplayItemSchema, DisplayItemType } from "./base";
import { z } from "zod";

export const feedbackSchema = z.object({
    email: z.string().email(),
	name: z.string(),
	message: z.string(),
});

export type FeedbackConfig = z.infer<typeof feedbackSchema>;

export const feedbackDisplayItemSchema = baseDisplayItemSchema.extend({
    type: z.literal(DisplayItemType.FEEDBACK),
    item: feedbackSchema,
});

export type FeedbackDisplayItem = z.infer<typeof feedbackDisplayItemSchema>;
