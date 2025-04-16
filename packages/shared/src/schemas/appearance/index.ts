import { z } from "zod";

export const appColorConfig = z.object({
	primary: z.string(),
	background: z.string(),
	chartColors: z
		.array(z.string())
		.min(8, { message: "Must have at least 8 colors" }),
});

export type AppColorConfig = z.infer<typeof appColorConfig>;

export const appAppearanceConfig = z.object({
	colors: appColorConfig,
});

export type AppAppearanceConfig = z.infer<typeof appAppearanceConfig>;
