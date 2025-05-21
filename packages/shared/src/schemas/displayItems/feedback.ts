import { baseDisplayItemSchema, DisplayItemType } from "./base";
import { z } from "zod";

export const feedbackSchema = z.object({
	email: z.string().email(),
	name: z.string().optional(),
	message: z.string().optional(),
});

export type FeedbackConfig = z.infer<typeof feedbackSchema>;

export const feedbackRecipientSchema = z.object({
	email: z.string().email(),
});

export type FeedbackRecipient = z.infer<typeof feedbackRecipientSchema>;

export const feedbackItemSchema = z.object({
	id: z.string(),
	recipients: z.array(feedbackRecipientSchema),
});

export type FeedbackItem = z.infer<typeof feedbackItemSchema>;

export const feedbackDisplayItemSchema = baseDisplayItemSchema.extend({
	type: z.literal(DisplayItemType.FEEDBACK),
	item: feedbackItemSchema,
});

export type FeedbackDisplayItem = z.infer<typeof feedbackDisplayItemSchema>;
