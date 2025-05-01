import { z } from "zod";

export const logoConfig = z.object({
	url: z.string().url(),
	width: z.number().optional(),
	height: z.number().optional(),
});

export type LogoConfig = z.infer<typeof logoConfig>;
