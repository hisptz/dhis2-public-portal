import { z } from "zod";

export const appColorConfig = z.object({
	primary: z.string(),
	background: z.string(),
	chartColors: z
		.array(z.string())
		.min(8, { message: "Must have at least 8 colors" }),
});

export type AppColorConfig = z.infer<typeof appColorConfig>;

export const headerConfig = z.object({
	logo: z.string().url(),
	title: z.object({
		main: z.string(),
		sub: z.string().optional(),
		style: z
			.object({
				center: z.boolean(),
			})
			.optional(),
	}),
	trailingLogo: z.string().url().optional(),
	hasMenu: z.boolean().optional(),
	style: z
		.object({
			coloredBackground: z.boolean(),
		})
		.optional(),
});

export type HeaderConfig = z.infer<typeof headerConfig>;

export const appAppearanceConfig = z.object({
	colors: appColorConfig,
	header: headerCofig,
});

export type AppAppearanceConfig = z.infer<typeof appAppearanceConfig>;
