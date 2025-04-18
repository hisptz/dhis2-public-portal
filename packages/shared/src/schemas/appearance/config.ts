import { z } from "zod";
import { addressSchema } from "./address";
import { footerLinksConfig } from "./links";

export const appMeta = z.object({
	name: z.string(),
	description: z.string(),
	icons: z.array(
		z.object({
			url: z.string().url(),
			type: z.string(),
			rel: z.string(),
		}),
	),
});
export type AppMeta = z.infer<typeof appMeta>;

export const appColorConfig = z.object({
	primary: z.string(),
	background: z.string(),
	chartColors: z
		.array(z.string())
		.min(8, { message: "Must have at least 8 colors" }),
});

export type AppColorConfig = z.infer<typeof appColorConfig>;

export const headerConfig = z.object({
	logo: z.object({
		enabled: z.boolean(),
	}),
	title: z.object({
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

export const appTitleConfig = z.object({
	main: z.string(),
	subtitle: z.string().optional(),
});

export type AppTitleConfig = z.infer<typeof appTitleConfig>;

export type HeaderConfig = z.infer<typeof headerConfig>;

export const footerConfig = z.object({
	copyright: z.string().optional(),
	footerLinks: footerLinksConfig,
	address: addressSchema,
});

export type FooterConfig = z.infer<typeof footerConfig>;

export const appAppearanceConfig = z.object({
	logo: z.string().url(),
	title: appTitleConfig,
	colors: appColorConfig,
	header: headerConfig,
	footer: footerConfig,
});

export type AppAppearanceConfig = z.infer<typeof appAppearanceConfig>;
