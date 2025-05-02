import { z } from "zod";

export const styleConfig = z.object({
	align: z.enum(["left", "center", "right"]).optional(),
	textColor: z.string().optional(),
	textSize: z.number().optional(),
});

export type StyleConfig = z.infer<typeof styleConfig>;
