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

export const styleConfig = z.object({
	align: z.enum(["left", "center", "right"]).optional(),
	textColor: z.string().optional(),
	textSize: z.number().optional(),
});

export type StyleConfig = z.infer<typeof styleConfig>;

export const logoConfig = z.object({
	url: z.string().url(),
	width: z.number().optional(),
	height: z.number().optional(),
});

export type LogoConfig = z.infer<typeof logoConfig>;

export const headerStyleConfig = z.object({
	coloredBackground: z.boolean(),
	headerBackgroundColor: z.string().optional(),
	containerHeight: z.number().optional(),
	trailingLogo: logoConfig.optional(),
	leadingLogo: logoConfig.optional(),
});

export type HeaderStyleConfig = z.infer<typeof headerStyleConfig>;

export const headerConfig = z.object({
	logo: z.object({
		enabled: z.boolean().optional(),
	}),
	subtitle: z.object({
		style: styleConfig.optional(),
	}),
	title: z.object({
		style: styleConfig.optional(),
	}),
	style: headerStyleConfig.optional(),
});

export const appTitleConfig = z.object({
	main: z
		.string()
		.min(1, { message: "Title is required" })
		.max(50, { message: "Title must be less than 50 characters" }),
	subtitle: z
		.string()
		.max(100, { message: "Subtitle must be less than 100 characters" })
		.optional(),
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
