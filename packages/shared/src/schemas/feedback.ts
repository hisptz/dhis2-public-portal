import { z } from "zod";

export const feedbackSchema = z.object({
	email: z.string().email().optional(),
	name: z.string().optional(),
	message: z.string(),
});

export type Feedback = z.infer<typeof feedbackSchema>;
