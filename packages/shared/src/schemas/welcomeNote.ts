import { z } from "zod";

const welcomeNoteSchema = z.object({
	author: z.object({
		name: z.string(),
		title: z.string(),
	}),
	content: z.string(),
	image: z.string().url(),
});

export type WelcomeNoteData = z.infer<typeof welcomeNoteSchema>;
