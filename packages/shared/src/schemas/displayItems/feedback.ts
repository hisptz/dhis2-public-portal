import { baseDisplayItemSchema, DisplayItemType } from "./base";
import { z } from "zod";

export const feedbackSchema = z.object({
	email: z.string().email(),
	name: z.string().optional(),
	message: z.string().optional(),
});

export const feedbackRecipientSchema = z.object({
	email: z.string().email(),
});

export const feedbackItemSchema = z.object({
	id: z.string(),
	recipients: z.array(feedbackRecipientSchema),
});

export const feedbackDisplayItemSchema = baseDisplayItemSchema.extend({
	type: z.literal(DisplayItemType.FEEDBACK),
	item: feedbackItemSchema,
});

export type FeedbackDisplayItem = z.infer<typeof feedbackDisplayItemSchema>;
export type FeedbackConfig = z.infer<typeof feedbackSchema>;
export type FeedbackRecipient = z.infer<typeof feedbackRecipientSchema>;
export type FeedbackItem = z.infer<typeof feedbackItemSchema>;
