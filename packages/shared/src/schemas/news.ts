import { z } from "zod";

const newsSchema = z.object({
	summary: z.string(),
	categories: z.array(z.string()).optional(),
	content: z.string(),
	date: z.string(),
	id: z.string(),
	title: z.string(),
	image: z.string().url().optional(),
});

export type NewsData = z.infer<typeof newsSchema>;
