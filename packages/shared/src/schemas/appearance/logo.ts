import { z } from "zod";

export const logoConfig = z.object({
	show: z.boolean().optional(),
	url: z.string().url(),
	width: z.number().optional(),
	height: z.number().optional(),
});

export type LogoConfig = z.infer<typeof logoConfig>;
