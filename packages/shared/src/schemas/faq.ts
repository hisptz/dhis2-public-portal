import { z } from "zod";

const faqSchema = z.object({
	category: z.string(),
	id: z.string(),
	question: z.string(),
	answer: z.string(),
});

export type FaqData = z.infer<typeof faqSchema>;
