import { z } from "zod";

export const keyIndicatorSchema = z.object({
	id: z.string(),
	label: z.string(),
	sortOrder: z.number(),
	icon: z.string(),
});

export type KeyIndicatorData = z.infer<typeof keyIndicatorSchema>;
