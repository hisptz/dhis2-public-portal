import { z } from "zod";

const AppIconSchema = z.object({
	rel: z.string(),
	type: z.string(),
	url: z.string().url(),
});

export const metadataSchema = z.object({
	description: z.string(),
	icons: z.array(AppIconSchema),
	name: z.string(),
	applicationURL: z
		.string({ description: "Where your public portal can be found" })
		.url(),
});

export type MetadataConfig = z.infer<typeof metadataSchema>;
